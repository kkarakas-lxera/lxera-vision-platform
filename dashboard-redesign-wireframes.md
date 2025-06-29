# Dashboard Redesign Wireframes - Quick Wins Integration

## Company Dashboard Redesign

### Current Layout Issues:
- Metrics cards don't show trends
- No learning engagement visibility
- Activity feed is limited
- Missing organizational skills view

### Proposed Redesign Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          LXERA Vision Platform                          │
│  🏢 Company Dashboard                              👤 John Doe ▼        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │
│  │ Total Employees │ │ Skills Match    │ │ Learning Hours  │ NEW!    │
│  │      152        │ │     68%         │ │   4.2 hrs/mo   │         │
│  │  ↑ 12 this mo  │ │  ↑ 5% vs last  │ │  ↑ 15% vs last │         │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘         │
│                                                                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │
│  │ Career Ready    │ │ Active Learners │ │ Completion Rate │         │
│  │     45%         │ │      89         │ │      72%        │         │
│  │  ↑ 8% vs last  │ │  58% of total   │ │  ↑ 3% vs last  │         │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘         │
│                                                                         │
│  Quick Actions: [📊 Skills Analysis] [👥 Add Employees] [📚 Assign]    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────┬───────────────────────────────┐ │
│  │ 📈 Skills Gap Trend (NEW!)      │ 🎯 Top Missing Skills (NEW!)  │ │
│  │                                 │                                │ │
│  │  Match %                        │ 1. Python Programming    125  │ │
│  │  80 ┤                          │ 2. Data Analysis          98  │ │
│  │  70 ┤    ╱─────────           │ 3. Cloud Architecture     87  │ │
│  │  60 ┤───╱                     │ 4. Machine Learning       76  │ │
│  │  50 ┤                         │ 5. Project Management     65  │ │
│  │  40 └─────────────────        │ 6. Agile Methodologies    54  │ │
│  │     J  F  M  A  M  J         │ 7. DevOps                 43  │ │
│  │                                │ 8. UI/UX Design           41  │ │
│  │  [30d] [60d] [90d] [All]     │                                │ │
│  └─────────────────────────────────┴───────────────────────────────┘ │
│                                                                         │
│  ┌─────────────────────────────────┬───────────────────────────────┐ │
│  │ 🏢 Position Skills Coverage     │ 📊 Activity Feed (ENHANCED!)  │ │
│  │                                 │                                │ │
│  │ Position         Employees  Gap │ 🎓 Course Completed           │ │
│  │ ─────────────────────────────── │ John completed "Python 101"   │ │
│  │ Sr Developer        12      35% │ 2 mins ago                    │ │
│  │ ████████░░░░░░░               │                                │ │
│  │ Data Analyst        8       42% │ 📈 Skills Gap Reduced         │ │
│  │ ███████░░░░░░░░               │ Marketing team: 68% → 75%     │ │
│  │ Project Manager     5       28% │ 15 mins ago                   │ │
│  │ █████████░░░░░░               │                                │ │
│  │ UX Designer         3       51% │ 👥 5 New CVs Analyzed         │ │
│  │ ██████░░░░░░░░░               │ Engineering dept              │ │
│  │                                │ 1 hour ago                    │ │
│  │ [View All Positions →]         │                                │ │
│  │                                │ 📚 Learning Milestone         │ │
│  │                                │ Sales team: 100 hours/month   │ │
│  │                                │ 3 hours ago                   │ │
│  └─────────────────────────────────┴───────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Feature Integration Details

### 1. Enhanced Metrics Cards (Top Row)
- **Added "Learning Hours"** metric with trend indicator
- All cards now show **month-over-month changes**
- Clicking any card shows detailed breakdown

### 2. Skills Gap Trend Chart (NEW - Left Middle)
```
Features:
- Line chart showing average skills match % over time
- Time period selector: 30d, 60d, 90d, All
- Hover to see exact values
- Click to drill down by department/position
```

### 3. Top Missing Skills Widget (NEW - Right Middle)
```
Features:
- Live-updating list of most needed skills
- Shows # of employees missing each skill
- Clickable skills → see which positions need them
- Export button for HR reports
```

### 4. Enhanced Activity Feed (Bottom Right)
```
New Event Types Added:
- 🎓 Course completions
- 📈 Skills gap improvements
- 📚 Learning milestones
- 🏆 Achievement unlocks
- 📊 Weekly/monthly summaries

Filters:
- By type (CV, Learning, Skills, Achievements)
- By department
- By time period
```

## Mobile Responsive Design

```
┌─────────────────┐
│  📱 Mobile View │
├─────────────────┤
│ ┌─────────────┐ │
│ │Total Employ │ │
│ │    152      │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │Skills Match │ │
│ │    68%      │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │Learn Hours  │ │
│ │  4.2 hrs    │ │
│ └─────────────┘ │
│                 │
│ [Swipe for more]│
│                 │
│ 📈 Gap Trend    │
│ [Chart]         │
│                 │
│ 🎯 Missing      │
│ 1. Python   125 │
│ 2. Data      98 │
│ [Show more]     │
└─────────────────┘
```

## Implementation Priority

### Phase 1A (2-3 days)
1. **Add Learning Hours metric** to existing metrics row
2. **Enhance Activity Feed** with new event types

### Phase 1B (2-3 days)  
3. **Skills Gap Trend Chart** in new row
4. **Top Missing Skills Widget** alongside trend

### Optional Enhancements
- **Skills Health Card** (replaces one existing metric)
- **Department Toggle** for filtered views
- **Export Dashboard** as PDF report

## Component Structure
```
CompanyDashboard/
├── MetricsRow/
│   ├── MetricCard (enhanced with trends)
│   └── LearningHoursCard (NEW)
├── AnalyticsRow/ (NEW)
│   ├── SkillsGapTrend
│   └── TopMissingSkills
└── ActivityRow/
    ├── PositionCoverage (existing)
    └── EnhancedActivityFeed (upgraded)
```

## Color Coding & Visual Design
- **Green** (↑): Positive trends
- **Red** (↓): Needs attention  
- **Blue**: Informational/neutral
- **Purple**: Learning-related metrics
- **Charts**: Gradient fills for modern look
- **Cards**: Subtle shadows, hover effects

## Quick Action Buttons
Remain at top but with updated icons:
- 📊 View Skills Analysis (renamed)
- 👥 Onboard Employees
- 📚 Assign Learning Paths
- 📈 Export Reports (NEW)