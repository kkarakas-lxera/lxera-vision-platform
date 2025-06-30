-- Create demo_requests table for storing demo request submissions
create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  company text not null,
  job_title text,
  phone text,
  company_size text,
  country text,
  message text,
  source text default 'Website',
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'rejected')),
  submitted_at timestamp with time zone default now(),
  processed_at timestamp with time zone,
  processed_by uuid references auth.users(id),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.demo_requests enable row level security;

-- Policy for admins to view all demo requests
create policy "Admins can view all demo requests" on public.demo_requests
  for select using (
    auth.uid() in (
      select id from public.users where role = 'super_admin'
    )
  );

-- Policy for admins to update demo requests
create policy "Admins can update demo requests" on public.demo_requests
  for update using (
    auth.uid() in (
      select id from public.users where role = 'super_admin'
    )
  );

-- Policy for admins to insert (for testing/manual entry)
create policy "Admins can insert demo requests" on public.demo_requests
  for insert with check (
    auth.uid() in (
      select id from public.users where role = 'super_admin'
    )
  );

-- Policy for public to insert (no auth required for demo form submissions)
-- This uses a service role key in the edge function
create policy "Service role can insert demo requests" on public.demo_requests
  for insert with check (true);

-- Add indexes for performance
create index idx_demo_requests_status on public.demo_requests(status);
create index idx_demo_requests_submitted_at on public.demo_requests(submitted_at desc);
create index idx_demo_requests_email on public.demo_requests(email);
create index idx_demo_requests_company on public.demo_requests(company);

-- Add updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.demo_requests
  for each row
  execute function public.handle_updated_at();

-- Add comment
comment on table public.demo_requests is 'Stores demo request submissions from the website';