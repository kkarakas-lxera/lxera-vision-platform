# Dashboard Quick Wins - Exact Placement Guide

## Current CompanyDashboard.tsx Structure

```
1. Welcome Header (lines 442-455)
2. Quick Actions (lines 458-501)
3. Key Metrics - Two Rows (lines 503-626)
   - First Row: 4 cards (Total Employees, CV Analysis, Skills Match, Career Readiness)
   - Second Row: 3 cards (Positions with Gaps, Critical Gaps, Active Learning)
4. Bottom Grid (lines 628-718)
   - Left: Recent Activity
   - Right: Position Skills Coverage
```

## Exact Placement Instructions

### 1. **Learning Hours Metric** - Replace "Career Readiness" in First Row

**Location**: Line 557-570 (4th card in first row)

**Replace existing Career Readiness card with:**
```tsx
<Card>
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        Learning Hours
      </CardTitle>
      <BookOpen className="h-4 w-4 text-purple-600" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{metrics.learningHours} hrs/mo</div>
    <p className="text-xs text-green-600 mt-1">
      ↑ {metrics.learningGrowth}% vs last month
    </p>
    <div className="mt-2">
      <Sparkline data={metrics.learningTrend} className="h-8" />
    </div>
  </CardContent>
</Card>
```

**Move Career Readiness to second row as 4th card (make it 4 columns)**

### 2. **Skills Gap Trend & Top Missing Skills** - New Row After Metrics

**Insert at**: Line 627 (after metrics div, before bottom grid)

```tsx
{/* Analytics Row - NEW SECTION */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Skills Gap Trend Chart */}
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <CardTitle className="text-lg">Skills Gap Trend</CardTitle>
        </div>
        <Button size="sm" variant="ghost">
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <SkillsGapTrend 
        companyId={userProfile.company_id}
        timeRange={dashboardTimeRange}
        onDataPoint={handleTrendClick}
      />
    </CardContent>
  </Card>

  {/* Top Missing Skills */}
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-orange-600" />
          <CardTitle className="text-lg">Top Missing Skills</CardTitle>
        </div>
        <Badge variant="secondary">{topSkillsTimeframe}</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <TopMissingSkills 
        companyId={userProfile.company_id}
        limit={8}
        onSkillClick={handleSkillDrilldown}
        onAssignCourses={handleBulkCourseAssignment}
      />
    </CardContent>
  </Card>
</div>
```

### 3. **Enhanced Activity Feed** - Upgrade Existing Component

**Location**: Lines 629-660 (Recent Activity Card)

**Add new imports at top:**
```tsx
import { EnhancedActivityFeed } from '@/components/dashboard/EnhancedActivityFeed';
import { BookOpen, Trophy, TrendingUp as TrendUp } from 'lucide-react';
```

**Replace CardContent (lines 637-659) with:**
```tsx
<CardContent className="p-0">
  <EnhancedActivityFeed 
    companyId={userProfile.company_id}
    filters={{
      cvAnalysis: true,
      learning: true,
      skills: true,
      achievements: true
    }}
    limit={6}
    className="max-h-[400px] overflow-y-auto"
  />
  <div className="p-4 border-t">
    <Button 
      variant="ghost" 
      size="sm" 
      className="w-full"
      onClick={() => navigate('/dashboard/activity')}
    >
      View All Activity
    </Button>
  </div>
</CardContent>
```

### 4. **Update Metrics Calculation** (fetchDashboardData function)

**Location**: Around line 130-180

**Add to the metrics calculation:**
```tsx
// Add learning metrics query
const { data: learningData } = await supabase
  .from('course_assignments')
  .select('completion_time_minutes, completed_at')
  .eq('company_id', userProfile.company_id)
  .not('completion_time_minutes', 'is', null);

const totalLearningMinutes = learningData?.reduce(
  (sum, item) => sum + (item.completion_time_minutes || 0), 0
) || 0;

const learningHours = (totalLearningMinutes / 60 / metrics.totalEmployees).toFixed(1);

// Calculate month-over-month growth
const lastMonthData = learningData?.filter(item => {
  const completedDate = new Date(item.completed_at);
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  return completedDate >= lastMonth;
});

const lastMonthHours = (lastMonthData?.reduce(
  (sum, item) => sum + (item.completion_time_minutes || 0), 0
) || 0) / 60 / metrics.totalEmployees;

const learningGrowth = lastMonthHours > 0 
  ? Math.round(((learningHours - lastMonthHours) / lastMonthHours) * 100)
  : 0;
```

### 5. **Update State and Types**

**Location**: Lines 25-34 (DashboardMetrics interface)

**Add to interface:**
```typescript
interface DashboardMetrics {
  // ... existing fields
  learningHours: string;
  learningGrowth: number;
  learningTrend: number[];
  topMissingSkills: Array<{
    skillId: string;
    skillName: string;
    employeesMissing: number;
    positions: string[];
  }>;
}
```

## Component Import Order

Add these imports at the top of CompanyDashboard.tsx:
```typescript
import { SkillsGapTrend } from '@/components/dashboard/SkillsGapTrend';
import { TopMissingSkills } from '@/components/dashboard/TopMissingSkills';
import { EnhancedActivityFeed } from '@/components/dashboard/EnhancedActivityFeed';
import { Sparkline } from '@/components/ui/sparkline';
import { BookOpen, Download, Trophy } from 'lucide-react';
```

## Final Layout Order

1. Welcome Header
2. Quick Actions
3. **Metrics Row 1**: Total Employees | CV Analysis | Skills Match | **Learning Hours** ✨
4. **Metrics Row 2**: Positions with Gaps | Critical Gaps | Active Learning | Career Readiness
5. **Analytics Row** ✨: Skills Gap Trend | Top Missing Skills
6. **Bottom Row**: Enhanced Activity Feed | Position Skills Coverage

## Mobile Responsive Adjustments

The grid classes already handle mobile:
- `grid-cols-1 md:grid-cols-4` - Stacks on mobile
- `grid-cols-1 lg:grid-cols-2` - Full width cards on mobile
- Activity feed scrolls internally on mobile

## Performance Optimizations

1. **Add indexes** (run these migrations):
```sql
CREATE INDEX idx_course_assignments_learning 
ON course_assignments(company_id, completed_at, completion_time_minutes);

CREATE INDEX idx_skills_profile_trend 
ON st_employee_skills_profile(gap_analysis_timestamp, skills_match_score);
```

2. **Use React.memo** for chart components to prevent unnecessary re-renders
3. **Implement data caching** with SWR or React Query for trend data