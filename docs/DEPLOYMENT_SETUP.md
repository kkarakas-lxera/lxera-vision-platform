# Company Dashboard Deployment Setup

This guide provides the complete setup instructions for the company admin dashboard.

## Prerequisites

1. Supabase project created
2. Database migrations applied
3. Storage buckets created
4. Environment variables configured

## Database Setup

### 1. Apply Migrations in Order

Run these SQL files in your Supabase SQL Editor in this order:

1. **Skills Taxonomy Migration** (`supabase/migrations/20240625_create_skills_taxonomy.sql`)
   - Creates all skills-related tables with `st_` prefix
   - Sets up RLS policies
   - Creates search and analysis functions

2. **Storage Buckets Migration** (`supabase/migrations/20240625_create_storage_buckets.sql`)
   - Creates file tracking tables
   - Sets up storage validation functions
   - Adds file cleanup procedures

3. **CV Processing Functions** (`supabase/migrations/20240625_cv_processing_functions.sql`)
   - Adds skills gap analysis functions
   - Creates CV processing status tracking
   - Sets up learning path suggestions

### 2. Verify Database Structure

After applying migrations, verify these tables exist:

**Core Tables:**
- `companies`
- `users`
- `employees`

**Skills System:**
- `st_skills_taxonomy` (7,036+ NESTA skills)
- `st_company_positions`
- `st_employee_skills_profile`
- `st_import_sessions`
- `st_import_session_items`
- `st_file_uploads`

**Content Management:**
- `cm_module_content`
- `course_assignments`

## Storage Setup

### 1. Create Storage Buckets

In Supabase Dashboard > Storage:

1. Create `employee-cvs` bucket (Private)
   - Max file size: 10MB
   - Allowed types: PDF, DOCX

2. Create `import-files` bucket (Private)
   - Max file size: 50MB
   - Allowed types: CSV, XLS, XLSX

### 2. Configure RLS Policies

Apply the storage policies provided in the setup guide:

- Company admins can manage files for their company
- Employees can read their own CVs
- Files are isolated by company_id in the path

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### Edge Functions
Configure secrets in Supabase Dashboard:
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy cv-process
supabase functions deploy cv-analyze
supabase functions deploy extract-skills
```

## Test Data Setup

### 1. Create Test Company

```sql
INSERT INTO companies (name, domain, plan, status) 
VALUES ('Test Company', 'test.com', 'professional', 'active');
```

### 2. Create Company Admin User

```sql
-- Get the company ID first
-- Then create user via Supabase Auth or use the admin panel
```

### 3. Define Test Positions

Use the Position Manager in the dashboard to create:
- Software Developer
- Data Analyst
- Project Manager

## Verification Steps

1. **Login Flow**:
   - Company admin can login
   - Redirected to `/dashboard`
   - Navigation shows all sections

2. **Dashboard Metrics**:
   - Employee count displays
   - Quick actions work
   - Recent activity shows

3. **Position Management**:
   - Can create positions
   - Can add skill requirements
   - Skills search works

4. **Employee Onboarding**:
   - CSV upload works
   - CV analysis processes
   - Skills extraction completes
   - Gap analysis shows results

5. **File Storage**:
   - CVs upload successfully
   - Files are properly secured
   - Download links work

## Troubleshooting

### Common Issues

**Migration Errors:**
- Run migrations one at a time
- Check for dependency issues
- Verify user permissions

**Storage Issues:**
- Ensure buckets are created
- Check RLS policies
- Verify file size limits

**Edge Function Errors:**
- Check function logs in dashboard
- Verify environment variables
- Test with simple inputs first

**Authentication Issues:**
- Verify user roles are set correctly
- Check RLS policies on tables
- Ensure company_id is properly linked

### Performance Optimization

1. **Database Indexes**:
   - All critical indexes are included in migrations
   - Monitor slow queries in Supabase dashboard

2. **File Storage**:
   - Implement CDN for large files
   - Use signed URLs for secure access
   - Set up automatic cleanup for old imports

3. **Frontend Caching**:
   - Use React Query for data caching
   - Implement proper loading states
   - Add error boundaries

This setup provides a complete, production-ready company admin dashboard with all the necessary skills management and employee onboarding features.