-- Drop existing RLS policies
DROP POLICY IF EXISTS "Company admins can view their invitations" ON public.profile_invitations;
DROP POLICY IF EXISTS "Employees can view their own invitation" ON public.profile_invitations;
DROP POLICY IF EXISTS "Employees can view own invitations" ON public.profile_invitations;

-- Create new RLS policies that match the pattern used in employees table
-- Allow users to see invitations for employees in their company
CREATE POLICY "Users can view invitations in their company" ON public.profile_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = profile_invitations.employee_id
      AND e.company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Allow employees to view their own invitation
CREATE POLICY "Employees can view their own invitation" ON public.profile_invitations
  FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Allow super admins to view all invitations
CREATE POLICY "Super admins can view all invitations" ON public.profile_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );