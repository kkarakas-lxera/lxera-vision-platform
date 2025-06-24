
-- Update the most recently created user to be a super admin
-- This assumes you're the most recent signup
UPDATE users 
SET role = 'super_admin', 
    company_id = NULL,  -- Super admins should have no company_id
    updated_at = NOW()
WHERE id = (
    SELECT id 
    FROM users 
    ORDER BY created_at DESC 
    LIMIT 1
);
