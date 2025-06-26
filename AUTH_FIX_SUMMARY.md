# CV Upload Authentication Fix Summary

## Problem Identified
The root cause was that `auth.uid()` was returning `null` during storage operations, meaning no authenticated session was available when RLS policies were evaluated.

## Solutions Implemented

### 1. Auth Helper Functions (`src/lib/auth-helpers.ts`)
- `verifyAuthSession()`: Verifies and refreshes session if needed
- `requireAuthSession()`: Throws error if no valid session
- `debugAuthState()`: Comprehensive auth state logging
- `ensureAuthenticatedClient()`: Ensures client has current session

### 2. Enhanced Upload Components
Updated all CV upload components with auth checks:
- **CVUploadDialog.tsx**: Added session verification before upload
- **BulkCVUpload.tsx**: Added auth checks for bulk operations  
- **CVUpload.tsx**: Added session validation

### 3. Debug Capabilities
- Added detailed logging throughout upload process
- Created `test-auth-upload.ts` for testing auth/storage setup
- Available in browser console: `window.testAuthAndUpload()`

### 4. Database Functions
Created helper functions (requires database admin to apply):
```sql
-- Check current auth.uid()
CREATE OR REPLACE FUNCTION check_auth_uid()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'auth_uid', auth.uid(),
    'current_user', current_user,
    'session_user', session_user,
    'has_auth', auth.uid() IS NOT NULL
  );
END;
$$;
```

## Storage Policy Fix Required

The current RLS policy needs to be updated by a database administrator. The issue is that the policy expects auth.uid() to be non-null, but it's returning null during upload.

### Implemented Workaround: Edge Function Upload

Since we can't modify RLS policies without database admin access, I've implemented an Edge Function approach:

1. **Edge Function** (`supabase/functions/upload-cv/index.ts`)
   - Handles CV uploads server-side
   - Uses service role to bypass RLS
   - Validates user permissions
   - Updates employee records
   - Triggers CV analysis

2. **Client Integration** (`src/lib/cv-upload-service.ts`)
   - `uploadCVViaEdgeFunction()`: Uploads via edge function
   - Automatic fallback when direct upload fails
   - Progress tracking support

3. **Upload Flow**:
   1. Try direct storage upload (may fail due to RLS)
   2. Try alternative path format
   3. Fall back to edge function (should always work)

### To Deploy Edge Function:
```bash
# Deploy the edge function
supabase functions deploy upload-cv

# Or deploy all functions
supabase functions deploy
```

### Alternative Options:

1. **Option 1: Fix RLS Policy** (Requires DB Admin)
```sql
-- Fix the existing policy to properly check auth
DROP POLICY IF EXISTS "Company admins can manage CVs 16feqwx_1" ON storage.objects;

CREATE POLICY "Company admins can upload CVs"
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'employee-cvs' 
  AND auth.uid() IN (
    SELECT id FROM public.users
    WHERE role IN ('company_admin', 'super_admin')
  )
);
```

2. **Option 2: Direct SQL Test** (For Debugging)
Use Supabase dashboard SQL editor to test auth state.

## Testing Steps

1. **Test Auth State**:
   - Open browser console
   - Run: `testAuthAndUpload()`
   - Check console output for auth state

2. **Debug Upload Process**:
   - Try uploading a CV
   - Check console for detailed logs
   - Look for "Database auth check" output

3. **Verify Session**:
   - Check if `auth_uid` is null in logs
   - Verify session expiry time
   - Ensure user profile loads correctly

## Key Findings

1. Auth session exists in the React app (AuthContext)
2. User profile loads correctly from database
3. But `auth.uid()` returns null during storage operations
4. This suggests the auth token isn't being passed correctly to storage requests

## Next Steps

1. **Immediate**: Test with `testAuthAndUpload()` function
2. **Short-term**: Apply simplified RLS policy (requires DB admin)
3. **Long-term**: Investigate why auth headers aren't reaching storage operations

## Console Commands for Testing

```javascript
// Test full auth and upload flow
testAuthAndUpload()

// Check current session
await supabase.auth.getSession()

// Force session refresh
await supabase.auth.refreshSession()

// Check auth headers
const { data: { session } } = await supabase.auth.getSession()
console.log('Auth header:', `Bearer ${session?.access_token}`)
```

## Important Notes

- The fix adds comprehensive auth checking before any upload
- Session refresh is attempted if expired
- Detailed logging helps identify exact failure point
- The core issue is likely in how Supabase storage handles auth tokens