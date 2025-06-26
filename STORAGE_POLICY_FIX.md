# Storage Policy Fix - SOLVED! 🎉

## The Issue
The storage policy `employee_cvs_insert_policy` requires:
1. Files must be in the path format: `{company_id}/{rest_of_path}`
2. The policy extracts the first part before `/` and compares it to the user's company_id
3. It uses a custom function `get_user_auth_data()` to get user info

## The Policy Logic
```sql
substring(objects.name, '^([^/]+)') = (auth_data.user_company_id)::text
```

This regex `^([^/]+)` extracts everything before the first `/` in the file path.

## Required Path Format
✅ CORRECT: `67d7bff4-1149-4f37-952e-af1841fb67fa/cv-employee-123.pdf`
❌ WRONG: `cv-employee-123.pdf`
❌ WRONG: `cvs/67d7bff4-1149-4f37-952e-af1841fb67fa/file.pdf`

## Quick Fix
The file path in CVUploadDialog is already correct! The issue might be with the `get_user_auth_data()` function not returning the company_id properly.

## Testing Commands
```javascript
// 1. Test if get_user_auth_data function works
const { data, error } = await supabase.rpc('get_user_auth_data', { user_id: session.user.id })
console.log('User auth data:', data)

// 2. Test storage with exact path format
const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
const { data: profile } = await supabase.from('users').select('company_id').single()
const path = `${profile.company_id}/test-${Date.now()}.txt`

const result = await supabase.storage
  .from('employee-cvs')
  .upload(path, testFile)
console.log('Upload result:', result)
```

## The Missing Function
The policy relies on `get_user_auth_data()` function which might not exist or might not be returning data correctly. This function needs to be created:

```sql
CREATE OR REPLACE FUNCTION get_user_auth_data(user_id uuid)
RETURNS TABLE (user_role text, user_company_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT role::text, company_id
  FROM public.users
  WHERE id = user_id;
END;
$$;
```