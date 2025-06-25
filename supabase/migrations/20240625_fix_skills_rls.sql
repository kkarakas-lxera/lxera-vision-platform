-- Fix RLS policies for skills taxonomy to allow admin inserts
-- This allows system administrators to populate the skills taxonomy

-- Drop the existing select-only policy
DROP POLICY IF EXISTS "Skills taxonomy readable by all authenticated users" ON st_skills_taxonomy;

-- Create policies that allow read for all authenticated users and write for admins
CREATE POLICY "Skills taxonomy readable by all authenticated users" ON st_skills_taxonomy
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow inserts for super admins (for data migration)
CREATE POLICY "Skills taxonomy insertable by super admins" ON st_skills_taxonomy
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Allow updates for super admins
CREATE POLICY "Skills taxonomy updatable by super admins" ON st_skills_taxonomy
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Allow deletes for super admins (for maintenance)
CREATE POLICY "Skills taxonomy deletable by super admins" ON st_skills_taxonomy
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
        )
    );