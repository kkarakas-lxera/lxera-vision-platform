# CV Upload Fix Instructions

## Issues Fixed in Code:
✅ **CVUploadDialog.tsx**: Fixed file path format to include company_id prefix
✅ **analyze-cv Edge Function**: Updated to use correct database fields
✅ **Error Handling**: Improved validation and error messages
✅ **BulkCVUpload.tsx**: Enhanced error handling and validation

## Database Policy Fix Required:
The storage policies need to be updated by a database administrator. Run this SQL as a superuser:

```sql
-- Fix the INSERT policy for CV uploads (requires superuser/owner access)
DROP POLICY IF EXISTS "Company admins can manage CVs 16feqwx_1" ON storage.objects;

CREATE POLICY "Company admins can upload CVs"
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'employee-cvs' AND
  auth.uid() IN (
    SELECT u.id
    FROM auth.users u
    JOIN public.users pu ON u.id = pu.id
    WHERE pu.role IN ('company_admin', 'super_admin')
    AND (
      substring(name FROM '^([^/]+)') = pu.company_id::text
      OR pu.role = 'super_admin'
    )
  )
);
```

## Alternative Solution (No Database Changes Required):
If you can't modify the storage policies, you can temporarily modify the file path structure to match what the existing policies expect.

Check what the current policy expects by running:
```sql
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%CV%' 
AND cmd = 'INSERT';
```

## Testing the Fix:
1. **Apply the code changes** (already done)
2. **Deploy the edge function** with the updated analyze-cv code
3. **Run the database policy update** (if you have access)
4. **Test CV upload** on the onboarding page

## Expected Behavior After Fix:
- CV uploads should work without 400 errors
- Files will be stored with proper company_id prefix
- Edge function will successfully update employee records
- Better error messages for troubleshooting

## Rollback Plan:
If issues persist, the file path can be temporarily changed back to the simpler format while investigating policy configurations.