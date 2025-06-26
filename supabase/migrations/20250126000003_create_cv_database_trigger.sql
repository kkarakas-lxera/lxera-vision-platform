-- Create function to automatically update employee cv_file_path when CV is stored in database
CREATE OR REPLACE FUNCTION update_employee_cv_path()
RETURNS TRIGGER AS $$
BEGIN
  -- Update employee record with database storage marker
  UPDATE employees 
  SET 
    cv_file_path = 'db:' || NEW.employee_id::text,
    skills_last_analyzed = NULL -- Reset to trigger re-analysis
  WHERE id = NEW.employee_id;
  
  -- Log the update
  RAISE NOTICE 'Updated employee % with cv_file_path: db:%', NEW.employee_id, NEW.employee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run after CV is inserted into database
CREATE TRIGGER after_cv_database_insert
AFTER INSERT ON employee_cv_data
FOR EACH ROW
EXECUTE FUNCTION update_employee_cv_path();

-- Also create update trigger in case CV is updated
CREATE TRIGGER after_cv_database_update
AFTER UPDATE ON employee_cv_data
FOR EACH ROW
EXECUTE FUNCTION update_employee_cv_path();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_employee_cv_path() TO authenticated;

-- Add comment
COMMENT ON FUNCTION update_employee_cv_path() IS 'Updates employee cv_file_path when CV is stored in database';