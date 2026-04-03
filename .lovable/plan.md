

## Step 1: Execute Database Migration

I'll run the migration now using the database migration tool — two statements in a single migration.

### Migration SQL

```sql
-- Statement 1: Create email_replies table with RLS
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

-- Statement 2: Add columns to user_email_settings
alter table public.user_email_settings
  add column scheduling_link text not null default '',
  add column email_alerts_paused boolean not null default false;
```

### Post-migration verification

After execution I will query:
1. `SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'email_replies' ORDER BY ordinal_position` — expect 14 rows
2. `SELECT column_name FROM information_schema.columns WHERE table_name = 'user_email_settings' AND column_name IN ('scheduling_link', 'email_alerts_paused')` — expect 2 rows
3. `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'email_replies'` — expect 3 policies

### What changes

- **Database only** — one new table, two new columns on an existing table
- No frontend or edge function files modified

