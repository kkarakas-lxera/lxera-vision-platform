-- Create current-state tables for market matches
create table if not exists organization_market_match_current (
  company_id uuid primary key references companies(id) on delete cascade,
  baseline_id uuid references market_skills_benchmarks(id),
  market_coverage_rate int not null default 0,
  industry_alignment_index int not null default 0,
  critical_skills_count int not null default 0,
  moderate_skills_count int not null default 0,
  top_missing_skills jsonb not null default '[]',
  last_computed_at timestamptz not null default now()
);

create table if not exists department_market_match_current (
  company_id uuid references companies(id) on delete cascade,
  department text not null,
  baseline_id uuid references market_skills_benchmarks(id),
  avg_market_match int not null default 0,
  critical_gaps int not null default 0,
  emerging_gaps int not null default 0,
  top_gaps jsonb not null default '[]',
  analyzed_count int not null default 0,
  employee_count int not null default 0,
  last_computed_at timestamptz not null default now(),
  primary key (company_id, department)
);

create table if not exists employee_market_match_current (
  company_id uuid references companies(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  baseline_id uuid references market_skills_benchmarks(id),
  market_match_percentage int not null default 0,
  top_missing_skills jsonb not null default '[]',
  skills_by_source jsonb not null default '{}'::jsonb,
  last_computed_at timestamptz not null default now(),
  primary key (company_id, employee_id)
);

-- Add versioning metadata to benchmark table (validity window)
alter table market_skills_benchmarks
  add column if not exists valid_from timestamptz default now(),
  add column if not exists valid_to timestamptz;
create index if not exists idx_msb_role_industry_department_valid_from on market_skills_benchmarks(role_name, industry, department, valid_from desc);

-- Create compute queue
create table if not exists market_compute_queue (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  scope text check (scope in ('employee','department','organization')) not null,
  scope_id text,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists idx_market_compute_queue_created_at on market_compute_queue(created_at);

-- Enable RLS and policies
alter table organization_market_match_current enable row level security;
alter table department_market_match_current enable row level security;
alter table employee_market_match_current enable row level security;

-- Helper policy uses existing get_user_company_id(user_id uuid)
create policy if not exists org_market_match_select on organization_market_match_current
for select to authenticated
using (company_id = (select get_user_company_id(auth.uid()))::uuid);

create policy if not exists dept_market_match_select on department_market_match_current
for select to authenticated
using (company_id = (select get_user_company_id(auth.uid()))::uuid);

create policy if not exists emp_market_match_select on employee_market_match_current
for select to authenticated
using (company_id = (select get_user_company_id(auth.uid()))::uuid);

-- Trigger functions to enqueue compute on data changes
create or replace function enqueue_market_compute_on_employee() returns trigger as $$
declare v_company uuid;
begin
  v_company := coalesce(new.company_id, old.company_id);
  if v_company is not null then
    insert into market_compute_queue(company_id, scope, scope_id, reason)
    values (v_company, 'employee', (coalesce(new.id, old.id))::text, TG_OP)
    on conflict do nothing;
  end if;
  return coalesce(new, old);
end;$$ language plpgsql security definer;

create or replace function enqueue_market_compute_on_employee_skills() returns trigger as $$
declare v_company uuid;
        v_employee uuid;
begin
  v_employee := coalesce(new.employee_id, old.employee_id);
  if v_employee is null then return coalesce(new, old); end if;
  select company_id into v_company from employees where id = v_employee;
  if v_company is not null then
    insert into market_compute_queue(company_id, scope, scope_id, reason)
    values (v_company, 'employee', v_employee::text, 'skills_changed')
    on conflict do nothing;
  end if;
  return coalesce(new, old);
end;$$ language plpgsql security definer;

create or replace function enqueue_market_compute_on_positions() returns trigger as $$
begin
  insert into market_compute_queue(company_id, scope, scope_id, reason)
  values (coalesce(new.company_id, old.company_id), 'organization', coalesce(new.company_id, old.company_id)::text, 'positions_changed')
  on conflict do nothing;
  return coalesce(new, old);
end;$$ language plpgsql security definer;

-- Triggers
drop trigger if exists trg_employee_market_compute on employees;
create trigger trg_employee_market_compute
after insert or update or delete on employees
for each row execute function enqueue_market_compute_on_employee();

drop trigger if exists trg_employee_skills_market_compute on employee_skills;
create trigger trg_employee_skills_market_compute
after insert or update or delete on employee_skills
for each row execute function enqueue_market_compute_on_employee_skills();

drop trigger if exists trg_positions_market_compute on st_company_positions;
create trigger trg_positions_market_compute
after insert or update on st_company_positions
for each row execute function enqueue_market_compute_on_positions();


-- Snapshot function to record daily market benchmarks for trend views
create or replace function snapshot_market_benchmark_all()
returns void
language plpgsql
security definer
set search_path = public as $$
begin
  insert into market_benchmark_snapshots (company_id, snapshot_date, metrics)
  select 
    c.id as company_id,
    now() as snapshot_date,
    jsonb_build_object(
      'average_match', coalesce(org.industry_alignment_index, 0),
      'critical_gaps', coalesce(org.critical_skills_count, 0),
      'moderate_gaps', coalesce(org.moderate_skills_count, 0),
      'department_scores', coalesce((
        select jsonb_object_agg(d.department, d.avg_market_match)
        from department_market_match_current d
        where d.company_id = c.id
      ), '{}'::jsonb)
    ) as metrics
  from companies c
  left join organization_market_match_current org on org.company_id = c.id;
end;$$;

