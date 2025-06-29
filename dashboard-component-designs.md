# Dashboard Component Detailed Designs

## 1. Skills Gap Trend Component Design

```tsx
┌────────────────────────────────────────────────────┐
│ 📈 Skills Gap Trend                     [Export ⬇] │
├────────────────────────────────────────────────────┤
│                                                    │
│  Average Skills Match (%)                          │
│                                                    │
│  90┤                                              │
│    │                                   ╱──────    │
│  80┤                              ╱────           │
│    │                         ╱────                │
│  70┤                    ╱────                     │
│    │               ╱────                          │
│  60┤          ╱────                               │
│    │     ╱────                                    │
│  50┤────                                          │
│    │                                              │
│  40└────┬────┬────┬────┬────┬────┬────┬────┬     │
│       Jan  Feb  Mar  Apr  May  Jun  Jul  Aug      │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ Trend: +18% over 6 months                │    │
│  │ Projection: 85% by October               │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  Filter: [All Departments ▼] [All Positions ▼]    │
│  Period: [30d] [60d] [90d] [6mo] [1yr] [All]     │
└────────────────────────────────────────────────────┘

Implementation:
- Use Recharts or Chart.js for line chart
- Real-time data from st_employee_skills_profile
- Hover shows exact values per month
- Click on data point shows employee list
```

## 2. Top Missing Skills Widget Design

```tsx
┌────────────────────────────────────────────────────┐
│ 🎯 Top Missing Skills Across Organization         │
├────────────────────────────────────────────────────┤
│                                                    │
│ ┌────────────────────────────────────────────┐   │
│ │ 1  Python Programming          ████████ 125│   │
│ │    Required by: Engineering, Data, DevOps   │   │
│ └────────────────────────────────────────────┘   │
│                                                    │
│ ┌────────────────────────────────────────────┐   │
│ │ 2  Data Analysis               ███████ 98  │   │
│ │    Required by: Analytics, Marketing        │   │
│ └────────────────────────────────────────────┘   │
│                                                    │
│ ┌────────────────────────────────────────────┐   │
│ │ 3  Cloud Architecture          ██████ 87   │   │
│ │    Required by: Engineering, DevOps         │   │
│ └────────────────────────────────────────────┘   │
│                                                    │
│ ┌────────────────────────────────────────────┐   │
│ │ 4  Machine Learning            █████ 76    │   │
│ │    Required by: Data Science, Research      │   │
│ └────────────────────────────────────────────┘   │
│                                                    │
│ [Show More Skills] [Generate Report] [Assign Courses]│
└────────────────────────────────────────────────────┘

Features:
- Bar shows relative gap size
- Number shows employee count
- Expandable to show positions
- Direct link to course assignment
```

## 3. Enhanced Activity Feed Design

```tsx
┌────────────────────────────────────────────────────┐
│ 📊 Activity Feed          [Filter ▼] [Settings ⚙] │
├────────────────────────────────────────────────────┤
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ 🎓 Course Completion                    2m ago│ │
│ │ Sarah Chen completed "Advanced Python"       │ │
│ │ • Score: 95%  • Time: 12 hours              │ │
│ │ • Skills gained: +3                          │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ 📈 Skills Gap Milestone                15m ago│ │
│ │ Engineering Department reached 75% match!    │ │
│ │ • Previous: 68% (last week)                  │ │
│ │ • 12 employees improved                      │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ 👥 Bulk CV Analysis Complete          1hr ago│ │
│ │ 15 new employees analyzed                    │ │
│ │ • Department: Sales                          │ │
│ │ • Avg match: 62%                            │ │
│ │ [View Details →]                             │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ 🏆 Learning Achievement              3hrs ago│ │
│ │ Marketing team: 100 learning hours/month!    │ │
│ │ • 15 active learners                         │ │
│ │ • Top skill: Digital Marketing               │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ [Load More Activities]                            │
└────────────────────────────────────────────────────┘

Filter Options:
□ CV Analysis
☑ Learning Events  
☑ Skills Updates
□ Assignments
☑ Achievements
```

## 4. Learning Hours Metric Card Design

```tsx
┌─────────────────────────┐
│ 📚 Learning Hours       │
├─────────────────────────┤
│                         │
│    4.2 hrs/month       │
│    ↑ 15% vs last       │
│                         │
│ ┌─────────────────────┐ │
│ │ ▁▂▃▄▅▆▇█ Sparkline │ │
│ └─────────────────────┘ │
│                         │
│ Total: 638 hrs         │
│ Active: 89 learners    │
└─────────────────────────┘

Hover State:
┌─────────────────────────┐
│ Breakdown by Dept:      │
│ • Engineering: 5.2 hrs  │
│ • Sales: 3.8 hrs       │
│ • Marketing: 4.1 hrs   │
│ • HR: 3.5 hrs          │
└─────────────────────────┘
```

## 5. Quick Implementation Code Structure

```typescript
// New components to add:

// 1. SkillsGapTrend.tsx
interface SkillsGapTrendProps {
  companyId: string;
  timeRange: '30d' | '60d' | '90d' | '6mo' | '1yr' | 'all';
  department?: string;
  position?: string;
}

// 2. TopMissingSkills.tsx  
interface TopMissingSkillsProps {
  companyId: string;
  limit?: number;
  onSkillClick: (skillId: string) => void;
  onAssignCourses: (skillIds: string[]) => void;
}

// 3. EnhancedActivityFeed.tsx
interface ActivityFeedProps {
  companyId: string;
  filters: {
    cvAnalysis: boolean;
    learning: boolean;
    skills: boolean;
    achievements: boolean;
  };
  limit?: number;
}

// 4. LearningHoursCard.tsx
interface LearningHoursCardProps {
  companyId: string;
  showSparkline?: boolean;
  compareToLast?: 'week' | 'month';
}
```

## Color Palette for Charts

```css
:root {
  --chart-primary: #6366f1;    /* Indigo */
  --chart-success: #10b981;    /* Green */
  --chart-warning: #f59e0b;    /* Amber */
  --chart-danger: #ef4444;     /* Red */
  --chart-info: #3b82f6;       /* Blue */
  
  --gradient-start: #6366f1;
  --gradient-end: #8b5cf6;
  
  --card-shadow: 0 1px 3px rgba(0,0,0,0.12);
  --card-hover: 0 4px 6px rgba(0,0,0,0.15);
}
```