# CV Analysis Debugging Summary

## Issue Overview
The CV analysis workflow is failing after CV upload on the company dashboard. Users cannot start skill analysis due to database constraint violations and column mismatches.

## Primary Issues Identified

### 1. Company ID Null Constraint Violation
**Error**: `null value in column 'company_id' violates not-null constraint`

**Location**: `src/components/dashboard/EmployeeOnboarding/AnalyzeSkillsButton.tsx:28-31`

**Problem**: 
- `userProfile?.company_id` is null when trying to create import session
- The component attempts to create a session without verifying company_id exists

**Required Fix**:
```typescript
// Add proper validation before creating session
if (!userProfile?.company_id) {
  toast.error('Company information not found. Please refresh and try again.');
  return;
}
```

### 2. Column Name Mismatch
**Error**: `invalid input syntax for type uuid: 'direct-analysis'`

**Location**: `src/components/dashboard/EmployeeOnboarding/AnalyzeSkillsButton.tsx:47`

**Problem**:
- Component queries with `.eq('session_id', sessionId)`
- But table `st_import_session_items` uses `import_session_id` column

**Required Fix**:
```typescript
// Change from:
.eq('session_id', sessionId)
// To:
.eq('import_session_id', sessionId)
```

## Completed Fixes

### 1. Database Migrations
Created several migrations to fix RLS policies and add missing functions:

- **20250627000007_fix_cv_queue_rls_policies.sql**
  - Added missing INSERT, UPDATE, DELETE policies for st_cv_processing_queue
  - Fixed permission issues preventing CV queue operations

- **20250627000008_fix_cv_analysis_and_company_skills_gap.sql**
  - Created company-wide `calculate_skills_gap` function
  - Added helper function `create_session_items_for_employees`
  - Fixed table structure for st_import_session_items

### 2. Service Updates
- **LLMService**: Fixed to use environment variables instead of missing company_settings table
- **CVProcessingService**: Added parseFilePath method to handle multiple CV file path formats
- **ProtectedRoute**: Fixed learner routing from '/learn' to '/learner'

## Completed Fixes (2025-06-26)

1. **✅ Applied Database Migrations**
   - Applied `20250627000007_fix_cv_queue_rls_policies.sql` - Added INSERT, UPDATE, DELETE policies
   - Verified `20250627000008_fix_cv_analysis_and_company_skills_gap.sql` - Functions already exist

2. **✅ Fixed Column Name Mismatches**
   - Fixed AnalyzeSkillsButton.tsx line 47: `session_id` → `import_session_id`
   - Fixed useEnhancedOnboarding.ts line 262: `session_id` → `import_session_id`

3. **✅ Added Loading State Protection**
   - Added `authLoading` state check to prevent null userProfile errors
   - Button now shows loading state while auth context loads
   - Button is disabled when userProfile is not available
   - Added descriptive tooltips for better UX

4. **✅ Verified All Fixes**
   - All 4 RLS policies are now active on st_cv_processing_queue
   - Both required functions exist in the database
   - TypeScript compilation passes without errors
   - ESLint shows no errors in modified files

## Database Schema Reference

### st_import_sessions
```sql
- id: UUID (PK)
- company_id: UUID NOT NULL (FK to companies)
- import_type: TEXT
- status: TEXT
- created_by: UUID NOT NULL (FK to users)
```

### st_import_session_items  
```sql
- id: UUID (PK)
- import_session_id: UUID NOT NULL (FK to st_import_sessions)
- employee_id: UUID (FK to employees)
- status: TEXT
```

### st_cv_processing_queue
```sql
- id: UUID (PK)
- import_session_id: UUID (FK to st_import_sessions)
- employee_id: UUID (FK to employees)
- cv_file_path: TEXT
- priority: INTEGER
- status: TEXT
```

## Testing Checklist
After applying fixes:
1. [ ] User can successfully upload CVs
2. [ ] Analyze Skills button is enabled when CVs are present
3. [ ] Clicking Analyze Skills creates proper import session
4. [ ] CVs are queued for processing without errors
5. [ ] Skills analysis completes successfully
6. [ ] Results appear in skills gap dashboard

## Next Steps
1. Apply the pending fixes to AnalyzeSkillsButton.tsx
2. Test the complete workflow end-to-end
3. Monitor for any new errors in the console
4. Verify all RLS policies are working correctly

## Supabase MCP Configuration
Added Supabase MCP server for enhanced debugging:
```bash
claude mcp add supabase -s local -e SUPABASE_ACCESS_TOKEN=<token> -- npx -y @supabase/mcp-server-supabase@latest
```

This will enable direct database queries and schema inspection for more detailed debugging.