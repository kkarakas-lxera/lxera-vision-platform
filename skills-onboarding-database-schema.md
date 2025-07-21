# Skills Onboarding System Database Schema Documentation

## Overview
This document provides a comprehensive analysis of the database schema and relationships for the skills onboarding system. The system enables companies to import employees, analyze their CVs, identify skills gaps, and track the entire onboarding process.

## Core Tables

### 1. st_import_sessions
**Purpose**: Tracks employee import sessions with position context for skills gap analysis.

**Columns**:
- `id` (uuid, PK) - Unique session identifier
- `company_id` (uuid, FK → companies) - Company performing the import
- `import_type` (text, default: 'employee_onboarding') - Type of import session
- `csv_file_path` (text) - Path to uploaded CSV file
- `total_employees` (integer, default: 0) - Total employees to process
- `processed` (integer, default: 0) - Number of employees processed
- `successful` (integer, default: 0) - Successfully processed count
- `failed` (integer, default: 0) - Failed processing count
- `status` (text, default: 'pending') - Session status
- `error_log` (jsonb[], default: '{}') - Array of error messages
- `created_by` (uuid, FK → users) - User who created the session
- `created_at` (timestamp with time zone) - Session creation time
- `completed_at` (timestamp with time zone) - Session completion time
- `session_metadata` (jsonb, default: '{}') - Additional session data
- `active_position_id` (uuid, FK → st_company_positions) - Default position for import
- `analysis_config` (jsonb, default: '{}') - Configuration for analysis
- `bulk_analysis_status` (text, default: 'pending') - Status of bulk analysis

### 2. st_import_session_items
**Purpose**: Individual employee records within an import session.

**Columns**:
- `id` (uuid, PK) - Unique item identifier
- `import_session_id` (uuid, FK → st_import_sessions) - Parent session
- `employee_email` (text, NOT NULL) - Employee email address
- `employee_name` (text) - Employee full name
- `current_position_code` (text) - Current position code
- `target_position_code` (text) - Target position code
- `cv_filename` (text) - Name of CV file
- `status` (text, default: 'pending') - Item processing status
- `employee_id` (uuid, FK → employees) - Created employee record
- `skills_profile_id` (uuid, FK → st_employee_skills_profile) - Skills profile
- `error_message` (text) - Error details if failed
- `processed_at` (timestamp with time zone) - Processing timestamp
- `created_at` (timestamp with time zone) - Creation timestamp
- `cv_analysis_result` (jsonb, default: '{}') - CV analysis results
- `confidence_score` (numeric) - Analysis confidence score
- `position_match_analysis` (jsonb, default: '{}') - Position matching data
- `suggested_positions` (jsonb, default: '[]') - AI suggested positions
- `analysis_started_at` (timestamp with time zone) - Analysis start time
- `analysis_completed_at` (timestamp with time zone) - Analysis end time
- `analysis_tokens_used` (integer, default: 0) - LLM tokens consumed
- `cv_file_path` (text) - Storage path for CV file

### 3. employees
**Purpose**: Core employee records with profile and learning data.

**Columns**:
- `id` (uuid, PK) - Unique employee identifier
- `user_id` (uuid, FK → users) - Associated user account
- `company_id` (uuid, FK → companies, NOT NULL) - Employee's company
- `employee_id` (text) - External employee ID
- `department` (text) - Department name
- `position` (text) - Current position title
- `manager_id` (uuid, FK → employees) - Direct manager
- `employee_role` (text) - Role within company
- `career_goal` (text) - Career aspirations
- `skill_level` (text, default: 'beginner') - Overall skill level
- `learning_style` (jsonb, default: '{}') - Learning preferences
- `key_tools` (text[], default: '{}') - Tools used
- `courses_completed` (integer, default: 0) - Completed course count
- `total_learning_hours` (numeric, default: 0) - Total learning time
- `last_activity` (timestamp with time zone) - Last platform activity
- `is_active` (boolean, default: true) - Active status
- `hired_date` (date) - Employment start date
- `created_at` (timestamp with time zone) - Record creation
- `updated_at` (timestamp with time zone) - Last update
- `current_position_id` (uuid, FK → st_company_positions) - Current position
- `target_position_id` (uuid, FK → st_company_positions) - Target position
- `cv_file_path` (text) - CV storage path
- `cv_extracted_data` (jsonb) - Extracted CV data
- `skills_last_analyzed` (timestamp with time zone) - Last skills analysis
- `learning_streak` (integer, default: 0) - Consecutive learning days
- `last_learning_date` (date) - Last learning activity date
- `hris_id` (text) - HRIS system ID
- `hris_data` (jsonb) - HRIS integration data
- `profile_data` (jsonb) - Additional profile data
- `profile_complete` (boolean, default: false) - Profile completion status
- `profile_completion_date` (timestamp with time zone) - Profile completion time
- `cv_analysis_data` (jsonb) - Detailed CV analysis
- `cv_uploaded_at` (timestamp with time zone) - CV upload timestamp
- `profile_last_updated` (timestamp with time zone) - Profile update time
- `cv_data_verified` (boolean, default: false) - CV verification status
- `time_in_role` (text) - Time in current role

### 4. st_employee_skills_profile
**Purpose**: Detailed skills profile extracted from CV analysis.

**Columns**:
- `id` (uuid, PK) - Unique profile identifier
- `employee_id` (uuid, FK → employees, NOT NULL) - Employee reference
- `cv_file_path` (text) - CV file location
- `cv_summary` (text) - CV summary text
- `extracted_skills` (jsonb[], default: '{}') - Extracted skills array
- `current_position_id` (uuid, FK → st_company_positions) - Current position
- `target_position_id` (uuid, FK → st_company_positions) - Target position
- `skills_match_score` (numeric) - Skills match percentage
- `career_readiness_score` (numeric) - Career readiness score
- `analyzed_at` (timestamp with time zone) - Analysis timestamp
- `updated_at` (timestamp with time zone) - Last update
- `skills_analysis_version` (integer, default: 1) - Analysis version
- `experience_years` (numeric) - Years of experience
- `education_level` (text) - Highest education
- `certifications` (jsonb, default: '[]') - Professional certifications
- `industry_experience` (jsonb, default: '[]') - Industry experience
- `soft_skills` (jsonb, default: '[]') - Soft skills list
- `technical_skills` (jsonb, default: '[]') - Technical skills
- `languages` (jsonb, default: '[]') - Language proficiencies
- `projects_summary` (text) - Projects overview
- `analysis_metadata` (jsonb, default: '{}') - Analysis metadata
- `gap_analysis_completed_at` (timestamp with time zone) - Gap analysis timestamp

### 5. st_company_positions
**Purpose**: Company-specific position definitions with required skills.

**Columns**:
- `id` (uuid, PK) - Unique position identifier
- `company_id` (uuid, FK → companies, NOT NULL) - Company reference
- `position_code` (text, NOT NULL) - Position code/ID
- `position_title` (text, NOT NULL) - Position title
- `position_level` (text) - Seniority level
- `department` (text) - Department
- `required_skills` (jsonb[], default: '{}') - Required skills
- `nice_to_have_skills` (jsonb[], default: '{}') - Optional skills
- `is_template` (boolean, default: true) - Template position flag
- `created_by` (uuid, FK → users) - Creator user
- `created_at` (timestamp with time zone) - Creation timestamp
- `updated_at` (timestamp with time zone) - Last update
- `description` (text) - Position description
- `ai_suggestions` (jsonb, default: '[]') - AI-generated suggestions

### 6. st_llm_usage_metrics
**Purpose**: Track LLM usage for cost management and optimization.

**Columns**:
- `id` (uuid, PK) - Unique metric identifier
- `company_id` (uuid, FK → companies, NOT NULL) - Company reference
- `user_id` (uuid, FK → users) - User who triggered usage
- `service_type` (text, NOT NULL) - Service type (e.g., 'cv_analysis')
- `model_used` (text, NOT NULL) - LLM model name
- `input_tokens` (integer, NOT NULL) - Input token count
- `output_tokens` (integer, NOT NULL) - Output token count
- `total_tokens` (integer) - Total tokens used
- `cost_estimate` (numeric) - Estimated cost in USD
- `duration_ms` (integer) - Processing duration
- `success` (boolean, default: true) - Success status
- `error_code` (text) - Error code if failed
- `metadata` (jsonb, default: '{}') - Additional metadata
- `created_at` (timestamp with time zone) - Usage timestamp

### 7. st_skills_taxonomy
**Purpose**: NESTA skills taxonomy for standardized skill matching.

**Columns**:
- `skill_id` (text, PK) - Unique skill identifier
- `skill_name` (text, NOT NULL) - Skill name
- `skill_type` (text) - Skill category
- `description` (text) - Skill description
- `parent_skill_id` (text, FK → st_skills_taxonomy) - Parent skill
- `level` (integer) - Hierarchy level
- `is_active` (boolean, default: true) - Active status
- `created_at` (timestamp with time zone) - Creation timestamp
- `updated_at` (timestamp with time zone) - Last update

### 8. st_position_mapping_suggestions
**Purpose**: AI-suggested position mappings for employee titles.

**Columns**:
- `id` (uuid, PK) - Unique suggestion identifier
- `company_id` (uuid, FK → companies, NOT NULL) - Company reference
- `original_title` (text, NOT NULL) - Original employee title
- `suggested_position_id` (uuid, FK → st_company_positions) - Suggested position
- `confidence_score` (numeric) - Confidence score (0-1)
- `reasoning` (text) - AI reasoning for suggestion
- `created_at` (timestamp with time zone) - Creation timestamp

### 9. position_mappings
**Purpose**: Approved mappings between employee titles and positions.

**Columns**:
- `id` (uuid, PK) - Unique mapping identifier
- `company_id` (uuid, FK → companies, NOT NULL) - Company reference
- `original_title` (text, NOT NULL) - Original title
- `position_id` (uuid, FK → st_company_positions) - Mapped position
- `is_active` (boolean, default: true) - Active status
- `created_at` (timestamp with time zone) - Creation timestamp
- `updated_at` (timestamp with time zone) - Last update
- `approved_by` (uuid, FK → users) - Approving user

## Views

### 1. v_import_session_analytics
**Purpose**: Analytics view for import sessions filtered by user's company.

**Definition**:
```sql
SELECT 
    s.id,
    s.company_id,
    s.import_type,
    s.status,
    s.total_employees,
    s.processed,
    s.successful,
    s.failed,
    s.created_at,
    s.completed_at
FROM st_import_sessions s
WHERE s.company_id IN (
    SELECT users.company_id
    FROM users
    WHERE users.id = auth.uid()
);
```

### 2. v_critical_skills_gaps
**Purpose**: Identifies critical skills gaps across the organization.

### 3. v_department_skills_summary
**Purpose**: Aggregated skills summary by department.

### 4. v_skills_trends_monthly
**Purpose**: Monthly skills trend analysis.

### 5. enhanced_employee_skills_dashboard
**Purpose**: Comprehensive employee skills dashboard view.

### 6. v_company_employees
**Purpose**: Company-filtered employee view.

## Relationships

### Foreign Key Relationships

1. **Import Sessions**:
   - `st_import_sessions.company_id` → `companies.id`
   - `st_import_sessions.created_by` → `users.id`
   - `st_import_sessions.active_position_id` → `st_company_positions.id`

2. **Import Session Items**:
   - `st_import_session_items.import_session_id` → `st_import_sessions.id`
   - `st_import_session_items.employee_id` → `employees.id`
   - `st_import_session_items.skills_profile_id` → `st_employee_skills_profile.id`

3. **Employees**:
   - `employees.company_id` → `companies.id`
   - `employees.user_id` → `users.id`
   - `employees.manager_id` → `employees.id` (self-reference)
   - `employees.current_position_id` → `st_company_positions.id`
   - `employees.target_position_id` → `st_company_positions.id`

4. **Skills Profiles**:
   - `st_employee_skills_profile.employee_id` → `employees.id`
   - `st_employee_skills_profile.current_position_id` → `st_company_positions.id`
   - `st_employee_skills_profile.target_position_id` → `st_company_positions.id`

5. **Company Positions**:
   - `st_company_positions.company_id` → `companies.id`
   - `st_company_positions.created_by` → `users.id`

6. **LLM Usage**:
   - `st_llm_usage_metrics.company_id` → `companies.id`
   - `st_llm_usage_metrics.user_id` → `users.id`

7. **Position Mappings**:
   - `position_mappings.company_id` → `companies.id`
   - `position_mappings.position_id` → `st_company_positions.id`
   - `position_mappings.approved_by` → `users.id`

8. **Position Suggestions**:
   - `st_position_mapping_suggestions.company_id` → `companies.id`
   - `st_position_mapping_suggestions.suggested_position_id` → `st_company_positions.id`

9. **Skills Taxonomy**:
   - `st_skills_taxonomy.parent_skill_id` → `st_skills_taxonomy.skill_id` (self-reference)

## Triggers

1. **update_updated_at_column()** - Updates the `updated_at` timestamp on:
   - `employees`
   - `position_mappings`
   - `st_company_positions`
   - `st_employee_skills_profile`
   - `st_skills_taxonomy`

2. **track_cv_upload()** - Tracks CV uploads on `st_file_uploads` table

## Row Level Security (RLS) Policies

### Key RLS Patterns:

1. **Company-Based Access**:
   - Users can only access data within their company
   - Implemented across all major tables

2. **Role-Based Access**:
   - `company_admin` - Full access to company data
   - `super_admin` - Global access across all companies
   - `learner` - Access to own employee record and skills

3. **Anonymous Access**:
   - Limited to viewing employees via invitation tokens
   - Implemented for profile invitation flow

4. **Service Role Access**:
   - Full access for backend services
   - Used for automated processes and edge functions

### Notable RLS Policies:

1. **st_import_sessions**:
   - Company admins can manage all aspects
   - Users can create/read/update for their company

2. **employees**:
   - Company members can view all employees
   - Learners can only manage their own record
   - Anonymous users can view via invitation

3. **st_employee_skills_profile**:
   - Companies can fully manage profiles
   - Learners can manage own profile
   - Service role has full access for automation

4. **st_llm_usage_metrics**:
   - Companies can view their own metrics
   - Service role can insert metrics

5. **st_skills_taxonomy**:
   - All authenticated users can read
   - Only super admins can modify

## Data Flow

1. **Employee Import Flow**:
   ```
   CSV Upload → st_import_sessions → st_import_session_items → employees
   ```

2. **CV Analysis Flow**:
   ```
   CV Upload → st_file_uploads → analyze-cv edge function → st_employee_skills_profile
   ```

3. **Skills Gap Analysis Flow**:
   ```
   st_employee_skills_profile + st_company_positions → Gap Calculation → Reports
   ```

4. **Position Mapping Flow**:
   ```
   Employee Title → st_position_mapping_suggestions → position_mappings → st_company_positions
   ```

## Key Features

1. **Session-Based Import**: Maintains context and position information throughout the import process

2. **AI-Powered Analysis**: Integrated LLM usage tracking for CV analysis and skills extraction

3. **Skills Standardization**: NESTA taxonomy integration for consistent skill matching

4. **Gap Analysis**: Real-time calculation of skills gaps at individual and organizational levels

5. **Position Intelligence**: Smart position mapping with AI suggestions and confidence scores

6. **Comprehensive Tracking**: Detailed metrics on processing status, errors, and LLM usage

7. **Security**: Robust RLS policies ensuring data isolation between companies

8. **Audit Trail**: Timestamps and user tracking for all major operations

## Performance Considerations

1. **Indexes**: Primary keys and foreign keys are automatically indexed
2. **JSONB Columns**: Used for flexible schema evolution
3. **Array Columns**: Efficient storage of skill lists
4. **Views**: Pre-computed analytics for dashboard performance
5. **Triggers**: Automatic timestamp updates reduce application logic

## Integration Points

1. **Edge Functions**: `analyze-cv-enhanced` for CV processing
2. **Storage**: Employee CV files in Supabase Storage
3. **Authentication**: Integrated with Supabase Auth
4. **Real-time**: Potential for real-time updates via Supabase subscriptions