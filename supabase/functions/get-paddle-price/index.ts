import { gatewayFetch, type PaddleEnv } from '../_shared/paddle.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { priceId, environment } = await req.json();
    if (!priceId || typeof priceId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(priceId)) {
      return new Response(JSON.stringify({ error: 'Invalid priceId' }), { status: 400, headers: corsHeaders });
    }
    const env: PaddleEnv = environment === 'live' ? 'live' : 'sandbox';

    const resp = await gatewayFetch(env, `/prices?external_id=${encodeURIComponent(priceId)}`);
    const data = await resp.json();
    if (!data.data?.length) {
      return new Response(JSON.stringify({ error: `Price not found: ${priceId}` }), { status: 404, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ paddleId: data.data[0].id }), { headers: corsHeaders });
  } catch (e) {
    console.error('get-paddle-price error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }), { status: 500, headers: corsHeaders });
  }
});
