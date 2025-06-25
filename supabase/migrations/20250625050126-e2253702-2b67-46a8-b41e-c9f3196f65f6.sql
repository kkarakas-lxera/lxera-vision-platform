
-- Allow authenticated users to create companies (for testing purposes)
CREATE POLICY "Authenticated users can create companies" ON companies
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
