-- Create profile_invitations table for tracking employee profile invitations
CREATE TABLE IF NOT EXISTS public.profile_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  invitation_token UUID DEFAULT gen_random_uuid() NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_reminder_at TIMESTAMP WITH TIME ZONE,
  reminder_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- Add RLS policies
ALTER TABLE public.profile_invitations ENABLE ROW LEVEL SECURITY;

-- Policy for company admins to read their company's invitations
CREATE POLICY "Company admins can view their invitations" ON public.profile_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.users u ON u.id = auth.uid()
      WHERE e.id = profile_invitations.employee_id
      AND e.company_id = u.company_id
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- Policy for employees to view their own invitation
CREATE POLICY "Employees can view their own invitation" ON public.profile_invitations
  FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_profile_invitations_employee_id ON public.profile_invitations(employee_id);
CREATE INDEX idx_profile_invitations_sent_at ON public.profile_invitations(sent_at);
CREATE INDEX idx_profile_invitations_completed_at ON public.profile_invitations(completed_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_invitations_updated_at
  BEFORE UPDATE ON public.profile_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();