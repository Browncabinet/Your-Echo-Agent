create table public.email_replies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  campaign_id text not null,
  lead_email text not null,
  lead_name text not null default '',
  subject text not null default '',
  body text not null default '',
  received_at timestamptz not null default now(),
  classification text not null default 'unknown',
  ai_draft_reply text not null default '',
  ai_suggested_action text not null default '',
  status text not null default 'pending',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.email_replies enable row level security;

create policy "Users can view own replies"
  on public.email_replies for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own replies"
  on public.email_replies for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own replies"
  on public.email_replies for update to authenticated
  using (auth.uid() = user_id);

alter table public.user_email_settings
  add column scheduling_link text not null default '',
  add column email_alerts_paused boolean not null default false;