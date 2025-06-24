
-- Drop the existing constraint that's causing the issue
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_company_admin;

-- Create a new, more flexible constraint
-- Super admins should have no company_id
-- Company admins and learners can have a company_id, but learners can also have NULL initially
ALTER TABLE users ADD CONSTRAINT valid_company_admin CHECK (
    (role = 'super_admin' AND company_id IS NULL) OR
    (role = 'company_admin' AND company_id IS NOT NULL) OR
    (role = 'learner')  -- Learners can have either NULL or a valid company_id
);
