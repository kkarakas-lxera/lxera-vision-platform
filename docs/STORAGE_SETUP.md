# Storage Setup Guide

This guide explains how to set up Supabase storage buckets for the employee onboarding system.

## Overview

The system uses two storage buckets:

1. **employee-cvs**: For storing employee CV/resume files
   - Max file size: 10MB
   - Allowed formats: PDF, DOCX
   - Path structure: `{company_id}/cvs/{employee_id}/{timestamp}_{filename}`

2. **import-files**: For CSV import files
   - Max file size: 50MB
   - Allowed formats: CSV, XLS, XLSX
   - Path structure: `{company_id}/imports/{import_session_id}/{filename}`

## Setup Instructions

### 1. Apply Database Migrations

First, ensure the storage tracking tables are created:

```bash
# Run the migration in Supabase SQL editor
# File: supabase/migrations/20240625_create_storage_buckets.sql
```

### 2. Create Storage Buckets

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to Storage section
3. Create two new buckets:
   - Name: `employee-cvs`, Private: Yes
   - Name: `import-files`, Private: Yes

#### Option B: Via Script

```bash
# Install dependencies
cd scripts
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run setup script
python setup_storage_buckets.py
```

### 3. Configure RLS Policies

In the Supabase Dashboard, set up the following RLS policies:

#### For `employee-cvs` bucket:

**Policy 1: Company admins can manage CVs**
- Operation: ALL (SELECT, INSERT, UPDATE, DELETE)
- Check: User is company admin and file path starts with their company_id

**Policy 2: Employees can read their own CV**
- Operation: SELECT
- Check: File belongs to the authenticated employee

#### For `import-files` bucket:

**Policy: Company admins can manage import files**
- Operation: ALL
- Check: User is company admin and file path starts with their company_id

### 4. Test the Setup

Run the test script to verify everything is working:

```bash
python test_storage_setup.py
```

## Usage in Application

### TypeScript/React

```typescript
import { uploadFile, STORAGE_BUCKETS } from '@/lib/storage';

// Upload a CV
const result = await uploadFile(
  file,
  STORAGE_BUCKETS.EMPLOYEE_CVS,
  companyId,
  employeeId,
  'employee'
);

if (result.success) {
  console.log('File uploaded to:', result.filePath);
}
```

### Python/Backend

```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Upload file
with open('cv.pdf', 'rb') as f:
    supabase.storage.from_('employee-cvs').upload(
        path=f'{company_id}/cvs/{employee_id}/cv.pdf',
        file=f,
        file_options={"content-type": "application/pdf"}
    )
```

## Security Considerations

1. **Path-based isolation**: All files are stored with company_id prefix
2. **RLS policies**: Ensure only authorized users can access files
3. **File validation**: Always validate file type and size before upload
4. **Signed URLs**: Use temporary signed URLs for file access
5. **Cleanup**: Import files are automatically marked for deletion after 30 days

## Troubleshooting

### Bucket creation fails
- Ensure you're using the service role key
- Check if buckets already exist

### Upload fails with 403
- Verify RLS policies are configured
- Check if path includes correct company_id
- Ensure user has proper role (company_admin)

### File size limit errors
- Employee CVs: 10MB max
- Import files: 50MB max
- Validate before upload to provide better UX

## Maintenance

### Regular cleanup
Set up a cron job or Supabase Edge Function to:
1. Delete import files older than 30 days
2. Remove orphaned CV files (no matching employee)
3. Clean up failed upload records

### Monitoring
Track in your analytics:
- Upload success/failure rates
- Average file sizes
- Storage usage by company
- Most common file types