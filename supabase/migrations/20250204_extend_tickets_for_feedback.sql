-- Extend tickets table to support platform feedback types
-- Add new feedback types to the existing ticket_type constraint

-- First, drop the existing constraint
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_ticket_type_check;

-- Add the new constraint with additional feedback types
ALTER TABLE public.tickets ADD CONSTRAINT tickets_ticket_type_check 
  CHECK (ticket_type IN (
    'demo_request', 
    'contact_sales', 
    'early_access',
    'bug_report',
    'feature_request',
    'general_feedback'
  ));

-- Update the status constraint to include more feedback-appropriate statuses
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE public.tickets ADD CONSTRAINT tickets_status_check 
  CHECK (status IN (
    'new', 
    'contacted', 
    'qualified', 
    'converted', 
    'rejected',
    'in_progress',
    'resolved',
    'closed'
  ));

-- Add index for faster feedback queries
CREATE INDEX IF NOT EXISTS idx_tickets_feedback_type ON public.tickets(ticket_type) 
  WHERE ticket_type IN ('bug_report', 'feature_request', 'general_feedback');

-- Add index for company-based feedback queries
CREATE INDEX IF NOT EXISTS idx_tickets_company_feedback ON public.tickets(company, ticket_type, submitted_at DESC)
  WHERE ticket_type IN ('bug_report', 'feature_request', 'general_feedback');

-- Update the comment to reflect new functionality
COMMENT ON TABLE public.tickets IS 'Unified table for all customer interaction tickets (demo requests, sales contacts, early access, and platform feedback)';

-- Create a view specifically for platform feedback
CREATE OR REPLACE VIEW public.platform_feedback AS
SELECT 
  id,
  ticket_type as feedback_type,
  first_name,
  last_name,
  email,
  company,
  job_title,
  message,
  priority,
  status,
  submitted_at,
  processed_at,
  processed_by,
  metadata,
  created_at,
  updated_at
FROM public.tickets
WHERE ticket_type IN ('bug_report', 'feature_request', 'general_feedback');

-- Add RLS to the view
ALTER VIEW public.platform_feedback SET (security_invoker = on);

-- Add RLS policies for platform feedback
-- Allow users to view their own feedback
CREATE POLICY "Users can view their own feedback" ON public.tickets
  FOR SELECT USING (
    ticket_type IN ('bug_report', 'feature_request', 'general_feedback')
    AND email = auth.jwt() ->> 'email'
  );

-- Allow users to insert their own feedback
CREATE POLICY "Users can insert their own feedback" ON public.tickets
  FOR INSERT WITH CHECK (
    ticket_type IN ('bug_report', 'feature_request', 'general_feedback')
    AND email = auth.jwt() ->> 'email'
  );

-- Allow company admins to view feedback from their company
CREATE POLICY "Company admins can view company feedback" ON public.tickets
  FOR SELECT USING (
    ticket_type IN ('bug_report', 'feature_request', 'general_feedback')
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'company_admin'
      AND users.company_id = tickets.company
    )
  );