-- ============================================================
-- K² VOB — Complete Database Schema
-- Run this in Supabase SQL Editor → New Query → Run All
-- ============================================================

-- TENANTS
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'starter' check (plan in ('starter','growth','scale','trial')),
  status text not null default 'trial' check (status in ('trial','active','suspended','cancelled')),
  trial_ends_at timestamptz default (now() + interval '14 days'),
  wallet_balance integer not null default 0,
  owner_id uuid references auth.users(id) on delete cascade,
  razorpay_sub_id text,
  created_at timestamptz default now()
);

-- USERS (platform users tied to tenants)
create table if not exists tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','member','super_admin')),
  created_at timestamptz default now(),
  unique(user_id)
);

-- VOICE PROFILES (never called "agents" in schema)
create table if not exists voice_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  profile_sku text not null default 'standard'
    check (profile_sku in ('standard','clinic','real_estate','premium')),
  display_name text,
  business_name text not null default '',
  open_time text default '09:00',
  close_time text default '21:00',
  open_days text[] default array['Mon','Tue','Wed','Thu','Fri','Sat'],
  services text[] default array[]::text[],
  appointment_types text[] default array[]::text[],
  whatsapp_number text,
  did_number text,
  exotel_did text,
  provider text default 'exotel',
  status text default 'active' check (status in ('active','paused','setup')),
  created_at timestamptz default now()
);

-- PHONE NUMBERS
create table if not exists phone_numbers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  voice_profile_id uuid references voice_profiles(id) on delete set null,
  number text not null,
  exotel_did text,
  provider text default 'exotel',
  monthly_cost integer default 250,
  status text default 'active',
  created_at timestamptz default now()
);

-- CALLS
create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  voice_profile_id uuid references voice_profiles(id) on delete set null,
  caller_number text,
  direction text not null default 'inbound' check (direction in ('inbound','outbound')),
  status text default 'completed' check (status in ('active','completed','missed','transferred','failed')),
  duration_seconds integer default 0,
  transcript jsonb default '[]'::jsonb,
  intent text,
  recording_url text,
  wa_sent boolean default false,
  appointment_created boolean default false,
  cost_paise integer default 0,
  created_at timestamptz default now()
);

-- APPOINTMENTS
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  voice_profile_id uuid references voice_profiles(id) on delete set null,
  call_id uuid references calls(id) on delete set null,
  caller_name text,
  caller_number text not null,
  service text,
  slot_date date,
  slot_time text,
  status text default 'confirmed' check (status in ('confirmed','cancelled','completed','no_show')),
  wa_confirmed boolean default false,
  wa_reminder_sent boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- WHATSAPP DISPATCH LOG
create table if not exists wa_dispatch_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  voice_profile_id uuid references voice_profiles(id) on delete set null,
  call_id uuid references calls(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  message_type text check (message_type in ('confirmation','missed_call','reminder','callback','survey')),
  to_number text not null,
  message_body text,
  status text default 'sent' check (status in ('sent','delivered','read','failed')),
  provider_msg_id text,
  sent_at timestamptz default now()
);

-- SUBSCRIPTIONS
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  plan_id text not null,
  razorpay_sub_id text unique,
  status text default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- CALL MINUTES USAGE
create table if not exists call_minutes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  month text not null,
  used_seconds integer default 0,
  plan_limit_seconds integer default 12000,
  unique(tenant_id, month)
);

-- KNOWLEDGE BASE (RAG per voice profile)
create table if not exists knowledge_base (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  voice_profile_id uuid references voice_profiles(id) on delete cascade,
  content text not null,
  source_type text default 'faq' check (source_type in ('faq','document','manual')),
  created_at timestamptz default now()
);

-- ADMIN AUDIT LOG
create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id),
  action text not null,
  target_tenant_id uuid references tenants(id),
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table tenants enable row level security;
alter table tenant_users enable row level security;
alter table voice_profiles enable row level security;
alter table phone_numbers enable row level security;
alter table calls enable row level security;
alter table appointments enable row level security;
alter table wa_dispatch_log enable row level security;
alter table subscriptions enable row level security;
alter table call_minutes enable row level security;
alter table knowledge_base enable row level security;
alter table admin_audit_log enable row level security;

-- Helper: get current user's tenant_id
create or replace function get_my_tenant_id()
returns uuid language sql stable as $$
  select tenant_id from tenant_users where user_id = auth.uid() limit 1;
$$;

-- Helper: check if super_admin
create or replace function is_super_admin()
returns boolean language sql stable as $$
  select exists(select 1 from tenant_users where user_id = auth.uid() and role = 'super_admin');
$$;

-- TENANTS policies
create policy "tenant_select" on tenants for select
  using (id = get_my_tenant_id() or is_super_admin());
create policy "tenant_insert" on tenants for insert
  with check (owner_id = auth.uid());
create policy "tenant_update" on tenants for update
  using (id = get_my_tenant_id() or is_super_admin());

-- TENANT_USERS policies
create policy "tu_select" on tenant_users for select
  using (tenant_id = get_my_tenant_id() or is_super_admin());
create policy "tu_insert" on tenant_users for insert
  with check (tenant_id = get_my_tenant_id() or is_super_admin());

-- VOICE_PROFILES policies
create policy "vp_select" on voice_profiles for select
  using (tenant_id = get_my_tenant_id() or is_super_admin());
create policy "vp_insert" on voice_profiles for insert
  with check (tenant_id = get_my_tenant_id());
create policy "vp_update" on voice_profiles for update
  using (tenant_id = get_my_tenant_id() or is_super_admin());
create policy "vp_delete" on voice_profiles for delete
  using (tenant_id = get_my_tenant_id() or is_super_admin());

-- PHONE_NUMBERS policies
create policy "pn_select" on phone_numbers for select
  using (tenant_id = get_my_tenant_id() or is_super_admin());
create policy "pn_insert" on phone_numbers for insert
  with check (tenant_id = get_my_tenant_id());
create policy "pn_update" on phone_numbers for update
  using (tenant_id = get_my_tenant_id() or is_super_admin());

-- CALLS policies
create policy "calls_select" on calls for select
  using (tenant_id = get_my_tenant_id() or is_super_admin());
create policy "calls_insert" on calls for insert
  with check (tenant_id = get_my_tenant_id() or is_super_admin());
create policy "calls_update" on calls for update
  using (tenant_id = get_my_tenant_id() or is_super_admin());

-- APPOINTMENTS policies
create policy "appt_select" on appointments for select
  using (tenant_id = get_my_tenant_id() or is_super_admin());
create policy "appt_insert" on appointments for insert
  with check (tenant_id = get_my_tenant_id() or is_super_admin());
create policy "appt_update" on appointments for update
  using (tenant_id = get_my_tenant_id() or is_super_admin());

-- WA_DISPATCH_LOG policies
create policy "wa_select" on wa_dispatch_log for select
  using (tenant_id = get_my_tenant_id() or is_super_admin());
create policy "wa_insert" on wa_dispatch_log for insert
  with check (tenant_id = get_my_tenant_id() or is_super_admin());

-- SUBSCRIPTIONS policies
create policy "sub_select" on subscriptions for select
  using (tenant_id = get_my_tenant_id() or is_super_admin());

-- CALL_MINUTES policies
create policy "cm_select" on call_minutes for select
  using (tenant_id = get_my_tenant_id() or is_super_admin());
create policy "cm_upsert" on call_minutes for insert
  with check (tenant_id = get_my_tenant_id() or is_super_admin());
create policy "cm_update" on call_minutes for update
  using (tenant_id = get_my_tenant_id() or is_super_admin());

-- KNOWLEDGE_BASE policies
create policy "kb_select" on knowledge_base for select
  using (tenant_id = get_my_tenant_id() or is_super_admin());
create policy "kb_insert" on knowledge_base for insert
  with check (tenant_id = get_my_tenant_id());
create policy "kb_delete" on knowledge_base for delete
  using (tenant_id = get_my_tenant_id() or is_super_admin());

-- ADMIN_AUDIT_LOG policies
create policy "audit_select" on admin_audit_log for select
  using (is_super_admin());
create policy "audit_insert" on admin_audit_log for insert
  with check (is_super_admin());

-- ============================================================
-- AUTO-CREATE TENANT ON SIGNUP
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_tenant_id uuid;
begin
  insert into tenants (name, plan, status, owner_id, trial_ends_at)
  values (
    coalesce(new.raw_user_meta_data->>'business_name', split_part(new.email, '@', 1)),
    'trial',
    'trial',
    new.id,
    now() + interval '14 days'
  )
  returning id into new_tenant_id;

  insert into tenant_users (tenant_id, user_id, role)
  values (new_tenant_id, new.id, 'owner');

  insert into call_minutes (tenant_id, month, used_seconds, plan_limit_seconds)
  values (new_tenant_id, to_char(now(), 'YYYY-MM'), 0, 12000);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- SEED: PLAN DEFINITIONS (reference table)
-- ============================================================
create table if not exists plans (
  id text primary key,
  display_name text not null,
  price_monthly integer not null,
  price_annual integer not null,
  minutes_per_month integer not null,
  max_voice_profiles integer not null,
  max_phone_numbers integer not null,
  max_concurrent_calls integer not null,
  outbound_campaigns boolean default false,
  api_access boolean default false,
  recording_days integer default 90
);

insert into plans values
  ('starter','Starter',199900,159900,200,1,1,2,false,false,90),
  ('growth', 'Growth', 499900,399900,600,3,3,5,true,false,365),
  ('scale',  'Scale',  999900,799900,1500,10,10,15,true,true,730)
on conflict (id) do update set
  price_monthly=excluded.price_monthly,
  minutes_per_month=excluded.minutes_per_month;

-- All prices in paise (₹1 = 100 paise)
-- ============================================================
-- DONE — Schema created successfully
-- ============================================================
