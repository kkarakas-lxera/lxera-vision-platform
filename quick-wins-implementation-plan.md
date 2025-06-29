# Quick Wins Implementation Plan

## Integration Points in Existing Dashboard

### 1. **Learning Hours Metric** - Add to existing metrics row

**Location**: `/src/pages/dashboard/CompanyDashboard.tsx`

**Implementation**:
```typescript
// Add to existing metrics calculation
const learningMetrics = await supabase
  .from('course_assignments')
  .select('completion_time_minutes')
  .eq('company_id', companyId)
  .not('completion_time_minutes', 'is', null);

const totalLearningHours = learningMetrics.data
  ?.reduce((sum, item) => sum + (item.completion_time_minutes / 60), 0) || 0;

const avgHoursPerEmployee = totalLearningHours / totalEmployees;

// Add new metric card in the metrics grid
<motion.div className="bg-white rounded-xl shadow-sm p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">Learning Hours</p>
      <p className="text-2xl font-semibold text-gray-900 mt-2">
        {avgHoursPerEmployee.toFixed(1)} hrs/mo
      </p>
      <p className="text-sm text-green-600 mt-1">
        ↑ 15% vs last month
      </p>
    </div>
    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
      <BookOpen className="h-6 w-6 text-purple-600" />
    </div>
  </div>
</motion.div>
```

### 2. **Skills Gap Trend Chart** - New analytics row

**New Component**: `/src/components/dashboard/SkillsGapTrend.tsx`

**Database Query**:
```sql
-- Create a function to get historical skills data
CREATE OR REPLACE FUNCTION get_skills_gap_trend(p_company_id UUID, p_days INTEGER)
RETURNS TABLE(
  date DATE,
  avg_match_percentage NUMERIC,
  total_employees INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(esp.gap_analysis_timestamp) as date,
    AVG(esp.skills_match_score) as avg_match_percentage,
    COUNT(DISTINCT esp.employee_id) as total_employees
  FROM st_employee_skills_profile esp
  JOIN employees e ON esp.employee_id = e.id
  WHERE e.company_id = p_company_id
    AND esp.gap_analysis_timestamp >= CURRENT_DATE - INTERVAL '1 day' * p_days
  GROUP BY DATE(esp.gap_analysis_timestamp)
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql;
```

**Integration Point**: After the metrics cards, before the existing tables

### 3. **Top Missing Skills Widget** - Alongside trend chart

**New Component**: `/src/components/dashboard/TopMissingSkills.tsx`

**Database Query**:
```typescript
// Get all required skills vs employee skills
const missingSkillsQuery = `
  WITH position_requirements AS (
    SELECT DISTINCT
      jsonb_array_elements(required_skills)->>'skill_id' as skill_id,
      jsonb_array_elements(required_skills)->>'skill_name' as skill_name
    FROM st_company_positions
    WHERE company_id = $1
  ),
  employee_skills AS (
    SELECT DISTINCT
      jsonb_array_elements(employee_skills)->>'skill_id' as skill_id
    FROM st_employee_skills_profile esp
    JOIN employees e ON esp.employee_id = e.id
    WHERE e.company_id = $1
  ),
  skill_gaps AS (
    SELECT 
      pr.skill_id,
      pr.skill_name,
      COUNT(DISTINCT e.id) as employees_missing
    FROM position_requirements pr
    CROSS JOIN employees e
    WHERE e.company_id = $1
      AND NOT EXISTS (
        SELECT 1 FROM employee_skills es 
        WHERE es.skill_id = pr.skill_id
      )
    GROUP BY pr.skill_id, pr.skill_name
  )
  SELECT * FROM skill_gaps
  ORDER BY employees_missing DESC
  LIMIT 10;
`;
```

### 4. **Enhanced Activity Feed** - Upgrade existing component

**Location**: Update the activity feed section in `CompanyDashboard.tsx`

**New Event Types**:
```typescript
interface ActivityEvent {
  id: string;
  type: 'cv_upload' | 'cv_analysis' | 'course_completion' | 'skills_milestone' | 'learning_achievement';
  title: string;
  description: string;
  timestamp: Date;
  metadata: {
    employeeId?: string;
    departmentId?: string;
    skillsGained?: number;
    matchPercentage?: number;
    courseId?: string;
    score?: number;
  };
}

// Subscribe to multiple tables for real-time updates
const subscriptions = [
  supabase
    .channel('course-completions')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'course_assignments',
      filter: `company_id=eq.${companyId}`
    }, handleCourseCompletion),
    
  supabase
    .channel('skills-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'st_employee_skills_profile'
    }, handleSkillsUpdate)
];
```

## File Structure Changes

```
src/
├── components/
│   └── dashboard/
│       ├── SkillsGapTrend.tsx (NEW)
│       ├── TopMissingSkills.tsx (NEW)
│       ├── EnhancedActivityFeed.tsx (NEW)
│       └── LearningHoursCard.tsx (NEW)
├── hooks/
│   ├── useSkillsGapTrend.ts (NEW)
│   └── useLearningMetrics.ts (NEW)
└── pages/
    └── dashboard/
        └── CompanyDashboard.tsx (MODIFY)
```

## Implementation Steps

### Day 1-2: Learning Hours Metric
1. Create `useLearningMetrics` hook
2. Add `LearningHoursCard` component
3. Integrate into metrics row
4. Add month-over-month comparison

### Day 2-3: Enhanced Activity Feed
1. Extend activity types enum
2. Create activity aggregation function
3. Add real-time subscriptions
4. Update UI with new event cards

### Day 3-4: Skills Gap Trend
1. Create database function for historical data
2. Build `SkillsGapTrend` component with Recharts
3. Add time range selector
4. Implement export functionality

### Day 4-5: Top Missing Skills
1. Create skills gap aggregation query
2. Build `TopMissingSkills` component
3. Add drill-down functionality
4. Link to course assignment

## Quick SQL Migrations Needed

```sql
-- Add index for faster gap analysis queries
CREATE INDEX idx_skills_profile_gap_timestamp 
ON st_employee_skills_profile(gap_analysis_timestamp);

-- Add index for course completion queries
CREATE INDEX idx_course_assignments_completion 
ON course_assignments(company_id, completed_at) 
WHERE completed_at IS NOT NULL;

-- Create materialized view for faster dashboard loads (optional)
CREATE MATERIALIZED VIEW mv_company_metrics AS
SELECT 
  company_id,
  COUNT(DISTINCT employee_id) as total_employees,
  AVG(skills_match_score) as avg_skills_match,
  COUNT(DISTINCT CASE WHEN skills_match_score < 50 THEN employee_id END) as critical_gaps,
  DATE(gap_analysis_timestamp) as metric_date
FROM st_employee_skills_profile esp
JOIN employees e ON esp.employee_id = e.id
GROUP BY company_id, DATE(gap_analysis_timestamp);

-- Refresh daily
CREATE INDEX ON mv_company_metrics(company_id, metric_date);
```

## Component Integration Example

```typescript
// In CompanyDashboard.tsx
import { SkillsGapTrend } from '@/components/dashboard/SkillsGapTrend';
import { TopMissingSkills } from '@/components/dashboard/TopMissingSkills';
import { EnhancedActivityFeed } from '@/components/dashboard/EnhancedActivityFeed';

// After metrics cards
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
  <SkillsGapTrend 
    companyId={companyId}
    timeRange={timeRange}
    onExport={handleExportTrend}
  />
  <TopMissingSkills
    companyId={companyId}
    onAssignCourses={handleBulkAssignment}
  />
</div>

// Replace existing activity section
<EnhancedActivityFeed
  companyId={companyId}
  filters={activityFilters}
  limit={10}
/>
```