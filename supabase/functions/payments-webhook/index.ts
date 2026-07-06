import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }
  return _supabase;
}

// One-time email top-up packs: price_id -> emails granted
const TOPUP_MAP: Record<string, number> = {
  topup_500: 500,
  topup_1000: 1000,
  topup_2500: 2500,
};

// A2A partner credit map: price_id -> cents added to partner balance
const A2A_CREDIT_MAP: Record<string, number> = {
  topup_500: 1200,
  topup_1000: 2200,
  topup_2500: 4500,
};

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData } = data;
  const userId = customData?.userId;
  if (!userId) {
    console.error('subscription.created: missing customData.userId');
    return;
  }
  const item = items?.[0];
  const priceId = item?.price?.importMeta?.externalId;
  const productId = item?.product?.importMeta?.externalId;
  if (!priceId || !productId) {
    console.warn('Skipping subscription: missing importMeta.externalId', { rawPriceId: item?.price?.id });
    return;
  }
  await getSupabase().from('subscriptions').upsert({
    user_id: userId,
    paddle_subscription_id: id,
    paddle_customer_id: customerId,
    product_id: productId,
    price_id: priceId,
    status,
    current_period_start: currentBillingPeriod?.startsAt,
    current_period_end: currentBillingPeriod?.endsAt,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'paddle_subscription_id' });

  if (status === 'active' || status === 'trialing') {
    await getSupabase().from('analytics_events').insert({
      user_id: userId,
      event_name: 'subscription_started',
      properties: { price_id: priceId, environment: env },
    });
  }
}

async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, status, currentBillingPeriod, scheduledChange } = data;
  await getSupabase().from('subscriptions')
    .update({
      status,
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      cancel_at_period_end: scheduledChange?.action === 'cancel',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', id)
    .eq('environment', env);
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  await getSupabase().from('subscriptions')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('paddle_subscription_id', data.id)
    .eq('environment', env);
}

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  // Only handle one-time purchases (no subscription attached).
  if (data.subscriptionId) return;

  const customData = data.customData || {};
  const userId = customData.userId;
  const a2aPartnerId = customData.a2aPartnerId;
  const supabase = getSupabase();
  const items: any[] = data.items || [];

  // A2A partner top-up
  if (a2aPartnerId) {
    let creditCents = 0;
    for (const item of items) {
      const priceId = item.price?.importMeta?.externalId;
      if (priceId && A2A_CREDIT_MAP[priceId]) {
        creditCents += A2A_CREDIT_MAP[priceId] * (item.quantity || 1);
      }
    }
    if (creditCents === 0) return;
    const { data: partner } = await supabase
      .from('a2a_partners').select('balance_cents').eq('id', a2aPartnerId).maybeSingle();
    if (!partner) return;
    await supabase.from('a2a_partners').update({
      balance_cents: (partner.balance_cents || 0) + creditCents,
      updated_at: new Date().toISOString(),
    }).eq('id', a2aPartnerId);
    return;
  }

  // User top-up
  if (!userId) return;
  let emailsToAdd = 0;
  for (const item of items) {
    const priceId = item.price?.importMeta?.externalId;
    if (priceId && TOPUP_MAP[priceId]) {
      emailsToAdd += TOPUP_MAP[priceId] * (item.quantity || 1);
    }
  }
  if (emailsToAdd === 0) return;

  const totalCents = Number(data.details?.totals?.total || 0);
  await supabase.from('credit_purchases').upsert({
    user_id: userId,
    paddle_transaction_id: data.id,
    credits_added: emailsToAdd,
    amount_cents: totalCents,
    environment: env,
  }, { onConflict: 'paddle_transaction_id' });

  const { data: existing } = await supabase
    .from('user_credits')
    .select('balance, total_purchased')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase.from('user_credits').update({
      balance: (existing.balance || 0) + emailsToAdd,
      total_purchased: (existing.total_purchased || 0) + emailsToAdd,
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId);
  } else {
    await supabase.from('user_credits').insert({
      user_id: userId,
      balance: emailsToAdd,
      total_purchased: emailsToAdd,
    });
  }
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);
  console.log('Paddle event:', event.eventType, 'env:', env);
  switch (event.eventType) {
    case EventName.SubscriptionCreated:
      await handleSubscriptionCreated(event.data, env);
      break;
    case EventName.SubscriptionUpdated:
      await handleSubscriptionUpdated(event.data, env);
      break;
    case EventName.SubscriptionCanceled:
      await handleSubscriptionCanceled(event.data, env);
      break;
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data, env);
      break;
    default:
      console.log('Unhandled event:', event.eventType);
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;
  try {
    await handleWebhook(req, env);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});
