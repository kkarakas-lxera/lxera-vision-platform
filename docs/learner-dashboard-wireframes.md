# Learner Dashboard Wireframes & Design System

## Overview
The learner dashboard provides employees with a personalized, engaging learning experience that leverages AI-generated courses tailored to their skills gaps.

## 1. Main Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🎓 Lxera Learning Portal                         👤 John Doe | Logout│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Good morning, John! 🌅                                          │ │
│ │ "The expert in anything was once a beginner"                    │ │
│ │                                                                  │ │
│ │ 🔥 7-day streak | 📚 3 courses active | ⭐ 85% avg progress    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────┬─────────────────┬─────────────────┬──────────┐ │
│ │   THIS WEEK     │   TOTAL TIME    │  SKILLS GAINED  │ NEXT GOAL│ │
│ │   ━━━━━━━━━     │   ━━━━━━━━━     │  ━━━━━━━━━━━   │ ━━━━━━━━ │ │
│ │   4.5 hours     │   32 hours      │  12 skills     │ Complete │ │
│ │   ▲ 20% vs last │   Since Jan 1   │  +3 this week  │ Python   │ │
│ └─────────────────┴─────────────────┴─────────────────┴──────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📌 Continue Learning                                            │ │
│ │ ┌───────────────────────────────────────────────────────────┐  │ │
│ │ │ [===Python for Data Analysis====================] 78%     │  │ │
│ │ │ Module 4 of 6: Practical Applications                      │  │ │
│ │ │ ⏱ ~25 min remaining | Due: Feb 15                         │  │ │
│ │ │                                    [Continue →]            │  │ │
│ │ └───────────────────────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🎯 Your Learning Path                              [View All →] │ │
│ │                                                                 │ │
│ │  ✅━━━━━━◉━━━━━○━━━━━○━━━━━○━━━━━○                           │ │
│ │  Excel   Python  SQL    React  Docker  K8s                     │ │
│ │  Done    Active  Next   Q2'24  Q3'24  Q4'24                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📚 Active Courses                                               │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │ │
│ │ │ Python for Data  │ │ SQL Mastery     │ │ Excel Advanced  │   │ │
│ │ │ [████████░░] 78% │ │ [██████░░░░] 60%│ │ [████░░░░░░] 35%│   │ │
│ │ │ 🎯 Priority: High│ │ 🎯 Priority: Med│ │ 🎯 Priority: Low│   │ │
│ │ │ ⏱ 2h remaining  │ │ ⏱ 4h remaining  │ │ ⏱ 6h remaining  │   │ │
│ │ │ 📅 Due: Feb 15   │ │ 📅 Due: Mar 1   │ │ 📅 Due: Mar 15  │   │ │
│ │ └─────────────────┘ └─────────────────┘ └─────────────────┘   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Enhanced Course Viewer

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Dashboard | Python for Data Analysis              78% [████████░░]│
├─────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────┬───────────────────────────────────────────────┤
│ │ COURSE OUTLINE    │ Module 4: Practical Applications              │
│ │                   ├───────────────────────────────────────────────┤
│ │ ✅ Introduction   │                                               │
│ │ ✅ Core Content   │ 🎥 Video: Real-World Data Analysis (12:34)   │
│ │ ✅ Case Studies   │ ┌─────────────────────────────────────────┐ │
│ │ ▶ Applications    │ │                                           │ │
│ │ ○ Assessments     │ │         [▶ Play Video]                    │ │
│ │                   │ │                                           │ │
│ │ ─────────────     │ │    📊 Working with Pandas DataFrames      │ │
│ │                   │ │                                           │ │
│ │ 📊 Your Progress  │ └─────────────────────────────────────────┘ │
│ │ Time: 4h 32m      │                                               │
│ │ Score: 92%        │ 📝 Key Concepts:                             │
│ │ Skills: +8        │ • Data cleaning and preprocessing             │
│ │                   │ • Statistical analysis with Python            │
│ │ 🏆 Achievements   │ • Visualization with matplotlib               │
│ │ • Fast Learner    │                                               │
│ │ • Quiz Master     │ 💻 Interactive Exercise:                      │
│ │ • Streak Keeper   │ ┌─────────────────────────────────────────┐ │
│ │                   │ │ # Load and analyze sales data            │ │
│ │ 📥 Resources      │ │ import pandas as pd                      │ │
│ │ • Notebook.ipynb  │ │ df = pd.read_csv('sales_2024.csv')      │ │
│ │ • Dataset.csv     │ │ # Your code here...                      │ │
│ │ • Cheatsheet.pdf  │ │                         [Run Code ▶]      │ │
│ └───────────────────┴─────────────────────────────────────────────┘ │
│                                                                     │
│ [← Previous] [Mark Complete & Continue →]                           │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. Learning Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📊 Your Learning Analytics                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Learning Activity (Last 30 Days)                                │ │
│ │                                                                  │ │
│ │   Hours                                                          │ │
│ │    8 │  ┃                                                       │ │
│ │    6 │  ┃   ┃       ┃                                          │ │
│ │    4 │  ┃   ┃   ┃   ┃   ┃       ┃                              │ │
│ │    2 │  ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃                        │ │
│ │    0 └──┴───┴───┴───┴───┴───┴───┴───┴───                      │ │
│ │      Mon Tue Wed Thu Fri Sat Sun Mon Tue                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌────────────────────┬────────────────────────────────────────────┐ │
│ │ Skills Development │ Top Skills Acquired                        │ │
│ │                    │                                            │ │
│ │ Technical (65%)    │ 1. Python Programming      ████████ 85%   │ │
│ │ [██████████░░░░]   │ 2. Data Analysis          ███████░ 72%   │ │
│ │                    │ 3. SQL Queries            ██████░░ 68%   │ │
│ │ Soft Skills (35%)  │ 4. Problem Solving        █████░░░ 60%   │ │
│ │ [██████░░░░░░░░]   │ 5. Critical Thinking      ████░░░░ 45%   │ │
│ └────────────────────┴────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🎯 Recommended Next Steps                                       │ │
│ │                                                                  │ │
│ │ • Complete Python course to unlock "Advanced Analytics" path    │ │
│ │ • Practice SQL joins - identified as improvement area           │ │
│ │ • Schedule assessment for Excel certification                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 4. Mobile-First Responsive Design

```
┌─────────────────┐
│ 🎓 Lxera Learn  │
│ ≡  John D.   👤 │
├─────────────────┤
│ Morning, John!  │
│ 🔥 7-day streak │
├─────────────────┤
│ Continue:       │
│ ┌─────────────┐ │
│ │Python [78%] │ │
│ │Module 4/6   │ │
│ │[Continue →] │ │
│ └─────────────┘ │
├─────────────────┤
│ Active Courses  │
│ ┌─────────────┐ │
│ │🐍 Python    │ │
│ │[████░░] 78% │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │📊 SQL       │ │
│ │[███░░░] 60% │ │
│ └─────────────┘ │
└─────────────────┘
```

## 5. Key Features Integration

### From Course Generation Pipeline:
- **Content IDs**: Efficient loading of course sections
- **Multimedia Assets**: Videos, images, interactive exercises
- **Quality-Assured Content**: Refined through enhancement loops
- **Personalized Learning Paths**: Based on skills gaps

### From Database Schema:
- **Progress Tracking**: course_assignments, course_section_progress
- **Video Analytics**: video_progress for engagement metrics
- **Learning Streaks**: Gamification elements
- **Priority Levels**: Focus on critical skill gaps first

### New Enhancements:
- **Interactive Code Exercises**: Integrated code editor
- **Real-time Progress Sync**: Across all devices
- **Offline Mode**: Download content for offline learning
- **Peer Learning**: Discussion forums per course
- **Certificates**: Auto-generated upon completion

## 6. Technical Implementation Notes

### Component Structure:
```
/src/pages/learner/
├── LearnerDashboard.tsx (enhanced with analytics)
├── CourseViewer.tsx (multimedia support added)
├── LearningAnalytics.tsx (new)
├── CourseLibrary.tsx (new)
└── components/
    ├── VideoPlayer.tsx
    ├── CodeEditor.tsx
    ├── ProgressChart.tsx
    └── AchievementBadge.tsx
```

### Database Queries:
- Fetch courses with multimedia content
- Track video progress and code exercise completion
- Calculate learning streaks and achievements
- Generate completion certificates

### API Integration:
- Real-time progress updates via Supabase subscriptions
- Multimedia content delivery via CDN
- Code execution sandbox for exercises
- Certificate generation service