-- Create unified tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type text NOT NULL CHECK (ticket_type IN ('demo_request', 'contact_sales', 'early_access')),
  
  -- Common fields
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  company text,
  job_title text,
  phone text,
  company_size text,
  country text,
  message text,
  source text DEFAULT 'Website',
  
  -- Status and processing
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'rejected')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  submitted_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  processed_by uuid REFERENCES auth.users(id),
  notes text,
  
  -- Type-specific fields (stored as JSONB for flexibility)
  metadata jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Migrate existing demo_requests data
INSERT INTO public.tickets (
  id,
  ticket_type,
  first_name,
  last_name,
  email,
  company,
  job_title,
  phone,
  company_size,
  country,
  message,
  source,
  status,
  submitted_at,
  processed_at,
  processed_by,
  notes,
  created_at,
  updated_at
)
SELECT 
  id,
  'demo_request' as ticket_type,
  first_name,
  last_name,
  email,
  company,
  job_title,
  phone,
  company_size,
  country,
  message,
  source,
  status,
  submitted_at,
  processed_at,
  processed_by,
  notes,
  created_at,
  updated_at
FROM public.demo_requests;

-- Add RLS policies
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all tickets
CREATE POLICY "Admins can view all tickets" ON public.tickets
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'super_admin'
    )
  );

-- Policy for admins to update tickets
CREATE POLICY "Admins can update tickets" ON public.tickets
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'super_admin'
    )
  );

-- Policy for admins to insert tickets
CREATE POLICY "Admins can insert tickets" ON public.tickets
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'super_admin'
    )
  );

-- Policy for service role to insert tickets (for public forms)
CREATE POLICY "Service role can insert tickets" ON public.tickets
  FOR INSERT WITH CHECK (true);

-- Policy for admins to delete tickets
CREATE POLICY "Admins can delete tickets" ON public.tickets
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'super_admin'
    )
  );

-- Add indexes for performance
CREATE INDEX idx_tickets_type ON public.tickets(ticket_type);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_tickets_submitted_at ON public.tickets(submitted_at DESC);
CREATE INDEX idx_tickets_email ON public.tickets(email);
CREATE INDEX idx_tickets_company ON public.tickets(company);
CREATE INDEX idx_tickets_type_status ON public.tickets(ticket_type, status);

-- Add updated_at trigger
CREATE TRIGGER set_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comment
COMMENT ON TABLE public.tickets IS 'Unified table for all customer interaction tickets (demo requests, sales contacts, early access)';

-- Create view for backward compatibility
CREATE OR REPLACE VIEW public.demo_requests AS
SELECT 
  id,
  first_name,
  last_name,
  email,
  company,
  job_title,
  phone,
  company_size,
  country,
  message,
  source,
  status,
  submitted_at,
  processed_at,
  processed_by,
  notes,
  created_at,
  updated_at
FROM public.tickets
WHERE ticket_type = 'demo_request';

-- Add RLS to the view
ALTER VIEW public.demo_requests SET (security_invoker = on);

-- Drop the original demo_requests table (after confirming migration)
-- This will be done in a separate migration after verification
-- DROP TABLE public.demo_requests CASCADE;