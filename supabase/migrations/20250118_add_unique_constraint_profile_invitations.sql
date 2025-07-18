-- Add unique constraint on employee_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'profile_invitations_employee_id_key'
    ) THEN
        ALTER TABLE public.profile_invitations
        ADD CONSTRAINT profile_invitations_employee_id_key UNIQUE (employee_id);
    END IF;
END
$$;