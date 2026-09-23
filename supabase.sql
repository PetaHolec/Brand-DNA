create extension if not exists pgcrypto;

create table if not exists public.briefings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  website text,
  responses jsonb not null default '{}'::jsonb,
  brand_dna jsonb,
  email_status text,
  source text default 'skocdal-briefing'
);

alter table public.briefings enable row level security;
-- No public policies. Inserts happen only through the server route using the service-role key.
