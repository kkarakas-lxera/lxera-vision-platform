# Skills Gap Analysis System Documentation

## Overview
This document outlines the comprehensive skills gap analysis system implemented in the LXERA Vision Platform. The system provides dual-mode employee onboarding (manual/automated) with AI-powered skills analysis and enhanced profile data integration.

## What I Have Been Doing

### Investigation Phase
- Analyzed the complete product pipeline for skills gap analysis
- Traced data flows from employee onboarding to skills gap calculation
- Examined frontend components and backend database structures
- Investigated HRIS integration and automated onboarding workflows
- Mapped user journeys for both HR administrators and employees

### Implementation Phase
- Created enhanced database functions for skills gap analysis
- Developed position mapping system for HRIS integration
- Implemented comprehensive employee profile sections
- Built automated onboarding dashboard with invitation system
- Enhanced skills gap calculation with multi-source data integration

### Documentation Phase
- Created comprehensive migration for enhanced skills gap analysis
- Documented complete data flow and user journey mappings
- Analyzed integration points between components
- Identified enhancement opportunities for existing workflows

## What I Did

### 1. Database Enhancements
- **Enhanced Skills Gap Function**: Created `calculate_enhanced_skills_gap()` that incorporates profile data
- **Profile Insights Function**: Developed `get_skills_insights_from_profile()` for comprehensive skills view
- **Skills Dashboard View**: Built `enhanced_employee_skills_dashboard` with completion tracking
- **Report Generation**: Implemented `generate_skills_gap_report_with_insights()` with recommendations

### 2. Data Structure Analysis
- **Position Requirements**: Analyzed `st_company_positions` table structure and required skills format
- **Employee Profiles**: Examined `st_employee_skills_profile` with extracted skills from CV analysis
- **Enhanced Profile Data**: Investigated new tables for current work, tools, and daily tasks
- **HRIS Integration**: Studied `position_mappings` and `hris_connections` tables

### 3. User Journey Mapping
- **Manual Mode**: CV upload → Analysis → Gap calculation → Course assignment
- **Automated Mode**: HRIS sync → Profile invitations → Self-service completion → Auto-analysis
- **Employee Experience**: Invitation → Profile builder → CV upload → Data validation → Analysis

## How I Did It

### Technical Approach
1. **Database-First Analysis**: Started with schema examination to understand data relationships
2. **Frontend Component Tracing**: Followed component hierarchy from dashboard to specific features
3. **Service Layer Investigation**: Analyzed TypeScript services for business logic
4. **Edge Function Review**: Examined Deno-based functions for AI processing
5. **Integration Point Mapping**: Identified how components communicate and share data

### Tools and Methods Used
- **Supabase MCP**: For direct database queries and schema analysis
- **File Reading**: Examined TypeScript/React components for frontend logic
- **SQL Analysis**: Investigated stored procedures and database functions
- **Data Flow Tracing**: Followed data from input to output across system layers

## Relevant Backend Components

### Database Tables
```sql
-- Core Tables
st_company_positions          -- Position definitions and required skills
st_employee_skills_profile    -- CV analysis results and match scores
employees                     -- Employee master data
companies                     -- Company settings including onboarding_mode

-- Enhanced Profile Tables
employee_current_work         -- Active projects and technologies
employee_tools               -- Tool proficiency and usage
employee_daily_tasks         -- Task categories and time allocation
employee_profile_sections    -- Profile completion tracking

-- HRIS Integration Tables
hris_connections             -- HRIS system connections
position_mappings            -- Job title to position mapping
profile_invitations          -- Employee profile invitations
```

### Key Database Functions
```sql
-- Core Analysis Functions
calculate_skills_gap(company_id)                    -- Basic skills gap analysis
calculate_enhanced_skills_gap(company_id)           -- Enhanced with profile data
get_skills_insights_from_profile(employee_id)       -- Individual employee insights
generate_skills_gap_report_with_insights(company_id) -- Comprehensive reporting

-- Helper Functions
create_session_items_for_employees()                -- CV analysis session management
```

### Edge Functions (Deno)
```typescript
// AI-Powered Analysis
analyze-cv-enhanced/          -- GPT-4 CV analysis with position context
analyze-cv-for-profile/       -- Extract data for profile sections
import-cv-to-profile/         -- Import analyzed data to profile

// Communication
send-profile-invitation/      -- Email invitations to employees
send-profile-reminder/        -- Reminder emails for incomplete profiles
send-demo-email/             -- Demo scheduling (existing)
```

### Services (TypeScript)
```typescript
// Core Services
HRISService                  -- HRIS integration and OAuth handling
EmployeeProfileService       -- Profile management and invitations
LLMService                   -- AI analysis coordination
CVProcessingService          -- Bulk CV processing queue
```

## Relevant Frontend Components

### Dashboard Components
```typescript
// Main Dashboard
CompanyDashboard.tsx                    -- Main company metrics and overview
SkillsGapAnalysis.tsx                   -- Detailed skills gap visualization
OnboardingModeSelector.tsx              -- Manual/Automated mode selection

// Employee Onboarding
EmployeeOnboarding.tsx                  -- Main onboarding interface
AutomatedOnboardingDashboard.tsx        -- HRIS integration dashboard
AddEmployees.tsx                        -- Employee import functionality
```

### Profile Builder Components
```typescript
// Main Profile Builder
ProfileBuilder.tsx                      -- Multi-section profile completion

// Profile Sections
BasicInfoSection.tsx                    -- Personal information
WorkExperienceSection.tsx               -- Employment history
SkillsSection.tsx                       -- Skills and expertise
CurrentWorkSection.tsx                  -- Active projects and technologies
ToolsSection.tsx                        -- Tool proficiency tracking
DailyTasksSection.tsx                   -- Task categories and time allocation
```

### Mobile Components
```typescript
// Mobile-Optimized Views
MobileMetricsCarousel.tsx               -- Mobile dashboard metrics
MobileSkillsGapCard.tsx                 -- Mobile skills gap display
MobilePositionSkillsCarousel.tsx        -- Mobile position analysis
```

## User Journeys

### HR Administrator Journey (Manual Mode)
```
1. Setup Phase
   └── Configure positions and required skills
   └── Set onboarding mode to 'manual'

2. Employee Import
   └── Upload employee CSV file
   └── Upload CV files for each employee
   └── Verify file uploads and employee data

3. Analysis Phase
   └── Trigger bulk CV analysis
   └── Monitor analysis progress
   └── Review extracted skills and match scores

4. Gap Analysis
   └── View skills gap dashboard
   └── Analyze position-specific gaps
   └── Export gap analysis reports

5. Action Phase
   └── Assign courses based on gaps
   └── Track employee progress
   └── Generate training recommendations
```

### HR Administrator Journey (Automated Mode)
```
1. HRIS Integration
   └── Connect HRIS system via OAuth
   └── Configure position mappings
   └── Set up automatic sync schedule

2. Employee Sync
   └── Sync employees from HRIS
   └── Map job titles to internal positions
   └── Validate employee data

3. Profile Invitations
   └── Send profile completion invitations
   └── Monitor invitation status
   └── Send reminder emails

4. Automated Analysis
   └── Automatic skills analysis as profiles complete
   └── Real-time gap calculation updates
   └── Automated course assignments

5. Monitoring
   └── Track profile completion rates
   └── Monitor skills gap trends
   └── Review automated recommendations
```

### Employee Journey (Automated Mode)
```
1. Invitation
   └── Receive profile completion email
   └── Click invitation link with token
   └── Access profile builder

2. Profile Completion
   └── Complete basic information
   └── Add work experience and education
   └── Upload CV for automatic extraction
   └── Detail current work and projects

3. Enhanced Data Entry
   └── Add tools and technologies
   └── Define daily tasks and responsibilities
   └── Set proficiency levels and experience

4. Validation
   └── Review extracted CV data
   └── Validate profile completeness
   └── Submit for analysis

5. Analysis Results
   └── Receive skills analysis
   └── View gap identification
   └── Get course recommendations
```

## Data Flows

### Skills Gap Analysis Data Flow
```
Position Requirements (st_company_positions)
    ↓ required_skills (JSONB array)
    ↓ proficiency_level, is_mandatory
    ↓
Employee Skills Analysis
    ↓ CV Analysis (analyze-cv-enhanced)
    ↓ Profile Data (current_work, tools, daily_tasks)
    ↓ Skills Extraction (GPT-4 + structured data)
    ↓
Skills Profile Storage (st_employee_skills_profile)
    ↓ extracted_skills (JSONB array)
    ↓ skills_match_score (percentage)
    ↓ career_readiness_score
    ↓
Gap Calculation Functions
    ↓ calculate_enhanced_skills_gap()
    ↓ Position-based analysis
    ↓ Multi-source skills aggregation
    ↓
Dashboard Display
    ↓ CompanyDashboard.tsx (metrics)
    ↓ SkillsGapAnalysis.tsx (detailed view)
    ↓ Real-time updates via subscriptions
```

### Automated Onboarding Data Flow
```
HRIS System
    ↓ OAuth Connection (HRISService)
    ↓ Employee Sync (automated)
    ↓
Position Mapping
    ↓ Job Title → Internal Position
    ↓ Confidence Scoring
    ↓ HR Approval Required
    ↓
Profile Invitations
    ↓ Generate invitation tokens
    ↓ Send emails (send-profile-invitation)
    ↓ Track invitation status
    ↓
Employee Profile Builder
    ↓ Multi-section completion
    ↓ CV upload and analysis
    ↓ Enhanced data entry
    ↓
Automatic Analysis
    ↓ Skills gap calculation
    ↓ Course assignment
    ↓ Progress tracking
```

### CV Analysis Data Flow
```
CV File Upload
    ↓ Storage (Supabase Storage)
    ↓ File type detection (PDF/DOC)
    ↓
Text Extraction
    ↓ PDF: PDFExtract library
    ↓ DOC: Mammoth library
    ↓ Fallback: Browser-based reading
    ↓
AI Analysis (analyze-cv-enhanced)
    ↓ OpenAI GPT-4 processing
    ↓ Position context awareness
    ↓ Skills extraction with proficiency
    ↓
Profile Integration
    ↓ Store in st_employee_skills_profile
    ↓ Calculate match scores
    ↓ Update profile sections
    ↓
Gap Analysis Update
    ↓ Recalculate skills gaps
    ↓ Update dashboard metrics
    ↓ Trigger course recommendations
```

## Key Integration Points

### 1. Position Requirements → Skills Analysis
- Position definitions drive analysis context
- Required skills used for gap calculation
- Proficiency levels determine match thresholds

### 2. Profile Data → Enhanced Analysis
- Current work provides technology context
- Tools data adds proficiency dimensions
- Daily tasks show actual skill usage

### 3. HRIS Integration → Automated Workflow
- Job title mapping to internal positions
- Automatic employee synchronization
- Profile invitation automation

### 4. Dashboard → Real-time Updates
- Subscription-based data updates
- Live progress tracking
- Automatic metric recalculation

## Current Implementation Status

### ✅ Completed Features
- Dual-mode onboarding system
- Enhanced skills gap analysis functions
- Comprehensive profile builder
- HRIS integration architecture
- Mobile-responsive interfaces

### 🔄 In Progress
- Real HRIS API integration (currently mock)
- Advanced skills matching algorithms
- Automated course assignment workflows

### 📋 Future Enhancements
- Multi-language CV support
- Advanced analytics dashboards
- Skills trend analysis over time
- Integration with learning management systems

## Technical Architecture

### Frontend Architecture
```
React 18 + TypeScript
├── Context Providers (Auth, Theme)
├── Page Components (Dashboard, Profile Builder)
├── Shared Components (UI, Mobile)
├── Services (API Integration)
└── Hooks (Custom React Hooks)
```

### Backend Architecture
```
Supabase (PostgreSQL + Edge Functions)
├── Database (RLS-enabled tables)
├── Edge Functions (Deno runtime)
├── Storage (CV files)
├── Authentication (Row Level Security)
└── Real-time (WebSocket subscriptions)
```

### AI Integration
```
OpenAI GPT-4
├── CV Text Analysis
├── Skills Extraction
├── Proficiency Assessment
├── Position Context Awareness
└── Structured Data Output
```

## Security & Privacy

### Data Protection
- Row Level Security (RLS) on all tables
- Encrypted file storage for CVs
- Secure API key management
- GDPR-compliant data handling

### Access Control
- Role-based permissions (HR Admin, Employee, Learner)
- Company-scoped data isolation
- Invitation-based profile access
- Audit logging for sensitive operations

## Performance Considerations

### Database Optimization
- Indexed columns for frequent queries
- Efficient JSONB operations for skills data
- Pagination for large datasets
- Real-time subscription management

### Frontend Performance
- Lazy loading for large components
- Mobile-first responsive design
- Efficient state management
- Optimized bundle sizes

This documentation provides a comprehensive overview of the skills gap analysis system, covering all aspects from technical implementation to user experience design.