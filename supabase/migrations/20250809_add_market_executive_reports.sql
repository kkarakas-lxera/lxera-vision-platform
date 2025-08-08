-- Market Executive Reports persistence
create table if not exists market_executive_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  scope text not null check (scope in ('organization','department')),
  scope_id text,
  period_start timestamptz not null default date_trunc('day', now()),
  period_end timestamptz not null default now(),
  kpis jsonb not null,
  narrative text not null,
  citations jsonb not null default '[]',
  methodology jsonb not null default '{}'::jsonb,
  pdf_path text,
  version int not null default 1,
  generated_by uuid references users(id),
  generated_at timestamptz not null default now()
);

alter table market_executive_reports enable row level security;

-- Select own-company reports
create policy if not exists mer_select on market_executive_reports
for select to authenticated
using (company_id = (select get_user_company_id(auth.uid()))::uuid);

-- Insert own-company reports (function uses service role; UI insert should also work)
create policy if not exists mer_insert on market_executive_reports
for insert to authenticated
with check (company_id = (select get_user_company_id(auth.uid()))::uuid);

create index if not exists idx_mer_company_generated_at on market_executive_reports(company_id, generated_at desc);

