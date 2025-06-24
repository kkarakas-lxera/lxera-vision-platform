
-- Create a function to handle new user registration
-- This will sync Supabase auth.users with our custom users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new row into public.users when a user signs up
  -- We'll set basic defaults and let the application update the rest
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    password_hash,
    is_active,
    email_verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'learner', -- Default role, can be updated by admins
    'supabase_managed', -- Placeholder since Supabase manages the actual auth
    true,
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user record when someone signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle user updates (like email confirmation)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update email verification status
  UPDATE public.users
  SET 
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Update RLS policies to work with Supabase Auth
-- Add policy for users to read their own data via auth.uid()
CREATE POLICY "Users can read their own data via auth" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own data via auth" ON users
  FOR UPDATE USING (id = auth.uid());

-- Update employees table RLS to work with auth.uid()
CREATE POLICY "Learners can see their own employee record via auth" ON employees
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'learner' 
    AND user_id = auth.uid()
  );

-- Update course assignments RLS to work with auth.uid()
CREATE POLICY "Learners can see their own assignments via auth" ON course_assignments
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'learner' 
    AND employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );
