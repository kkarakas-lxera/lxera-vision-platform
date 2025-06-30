# Course Display Wireframe

## Overview
This wireframe outlines the design for the course display page after a learner clicks "Start Course" or "Continue Learning".

## Page Structure

### 1. Header Section
```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to My Courses                                    [Profile] ▼  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 🎯 Advanced Software Engineering for Business Performance Reporting │
│                                                                     │
│ Progress: [████████████░░░░░░░░░░░░] 65%                          │
│                                                                     │
│ 📚 6 Modules • ⏱️ 6 weeks • 👥 125 learners • ⭐ 4.8 rating       │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Navigation Tabs
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Overview] [Content] [Resources] [Progress]                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Main Content Area

#### 3.1 Overview Tab (Default)
```
┌─────────────────────────────────────────────────────────────────────┐
│ Course Description                                                  │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ This comprehensive course equips you with advanced software      ││
│ │ engineering skills for creating effective business performance   ││
│ │ reports. Learn to leverage data, create visualizations, and      ││
│ │ deliver actionable insights.                                     ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ Learning Objectives                                                 │
│ ✓ Master advanced analytical techniques                             │
│ ✓ Create compelling data visualizations                             │
│ ✓ Develop strategic business recommendations                        │
│ ✓ Communicate findings effectively                                  │
│                                                                     │
│ Course Modules                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ Module 1: Introduction to Business Performance Reporting  ✅    ││
│ │ 📖 45 min • 🎥 3 videos • 📊 2 exercises                       ││
│ ├─────────────────────────────────────────────────────────────────┤│
│ │ Module 2: Software Engineering Basics for Reporting  🔄         ││
│ │ 📖 60 min • 🎥 4 videos • 📊 3 exercises                       ││
│ ├─────────────────────────────────────────────────────────────────┤│
│ │ Module 3: Intermediate Software Engineering  🔒                 ││
│ │ 📖 75 min • 🎥 5 videos • 📊 4 exercises                       ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ [Start Learning →]                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.2 Content Tab (Learning Mode)
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌───────────────────┬─────────────────────────────────────────────┐│
│ │ Module Navigation │ Module 1: Introduction to Business         ││
│ │                   │ Performance Reporting                       ││
│ │ ✅ Module 1       ├─────────────────────────────────────────────┤│
│ │ 🔄 Module 2       │                                             ││
│ │ 🔒 Module 3       │ 📹 Video Player                             ││
│ │ 🔒 Module 4       │ ┌─────────────────────────────────────────┐││
│ │ 🔒 Module 5       │ │                                         │││
│ │ 🔒 Module 6       │ │         [▶️ Play Video]                │││
│ │                   │ │                                         │││
│ │ Sections:         │ │     Introduction to the Module          │││
│ │ ✅ Introduction   │ │                                         │││
│ │ 🔄 Core Concepts  │ │ [👍] [👎]  [CC] [⚙️] [⛶]              │││
│ │ ⭕ Practical Apps │ │ ━━━━━━━━━━━━━━━━━━━━━ 0:00/12:34     │││
│ │                   │ └─────────────────────────────────────────┘││
│ │                   │ Quick Feedback: Was this section helpful?   ││
│ │ ⭕ Case Studies   │                                             ││
│ │ ⭕ Assessment     │                                             ││
│ │                   │ 📝 Course Content                           ││
│ │                   │ ┌─────────────────────────────────────────┐││
│ │ Progress: 40%     │ │ Welcome to this comprehensive module... │││
│ │ [█████░░░░░░░]    │ │                                         │││
│ │                   │ │ ## Learning Objectives                  │││
│ │ Time: 18/45 min   │ │ By the end of this module, you will:   │││
│ └───────────────────┤ │ • Understand business reporting basics  │││
│                     │ │ • Apply analytical techniques           │││
│                     │ │ • Create meaningful visualizations      │││
│                     │ │                                         │││
│                     │ │ ## Key Concepts                         │││
│                     │ │ [Expandable content sections...]        │││
│                     │ └─────────────────────────────────────────┘││
│                     │                                             ││
│                     │ 🎵 Audio Narration                          ││
│                     │ [▶️ Play] [⏸️] [🔊] ━━━━━━━━━ 3:45/12:34  ││
│                     │                                             ││
│                     │ 📊 Interactive Exercise                     ││
│                     │ ┌─────────────────────────────────────────┐││
│                     │ │ Drag and drop the components of a      │││
│                     │ │ business report in the correct order:  │││
│                     │ │                                         │││
│                     │ │ [Executive Summary] [Data Analysis]     │││
│                     │ │ [Recommendations] [Methodology]         │││
│                     │ └─────────────────────────────────────────┘││
│                     │                                             ││
│                     │ 📄 Downloadable Resources                   ││
│                     │ • 📥 Module Slides (PDF)                    ││
│                     │ • 📥 Exercise Templates                     ││
│                     │ • 📥 Reference Guide                        ││
│                     │                                             ││
│                     │ [Previous Section] [Mark Complete] [Next]   ││
└─────────────────────┴─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.3 Resources Tab
```
┌─────────────────────────────────────────────────────────────────────┐
│ Course Resources                                                    │
│                                                                     │
│ 📚 Reading Materials                                                │
│ • Business Intelligence Fundamentals (PDF)                          │
│ • Data Visualization Best Practices                                 │
│ • SQL Query Reference Guide                                         │
│                                                                     │
│ 🛠️ Tools & Templates                                               │
│ • Report Template (Excel)                                           │
│ • Dashboard Examples (PowerBI)                                      │
│ • Python Scripts for Data Analysis                                  │
│                                                                     │
│ 🔗 External Links                                                   │
│ • Industry Reports Database                                         │
│ • Professional Community Forum                                      │
│ • Certification Information                                         │
│                                                                     │
│ 📹 Recorded Webinars                                                │
│ • Expert Panel: Real-world Reporting Challenges                     │
│ • Live Q&A Session with Course Instructor                           │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.4 Progress Tab
```
┌─────────────────────────────────────────────────────────────────────┐
│ Your Progress                                                       │
│                                                                     │
│ Overall Completion: 65%                                             │
│ [████████████████████░░░░░░░░░░░░░░░]                             │
│                                                                     │
│ Time Invested: 4h 32m / 7h estimated                               │
│ Current Streak: 🔥 5 days                                           │
│                                                                     │
│ Module Progress:                                                    │
│ ✅ Module 1: Introduction (100%) - Completed 2 days ago            │
│ 🔄 Module 2: Basics (60%) - In Progress                            │
│ 🔒 Module 3: Intermediate (0%) - Locked                            │
│ 🔒 Module 4: Advanced (0%) - Locked                                │
│ 🔒 Module 5: Real-world Apps (0%) - Locked                         │
│ 🔒 Module 6: Case Studies (0%) - Locked                            │
│                                                                     │
│ Achievements:                                                       │
│ 🏆 Quick Starter - Completed first module within 24 hours          │
│ 🎯 Consistent Learner - 5 day learning streak                      │
│ 📚 Knowledge Seeker - Accessed all resources                       │
│                                                                     │
│ Skills Developed:                                                   │
│ • Data Analysis ████████░░ 80%                                     │
│ • Report Writing ██████░░░░ 60%                                    │
│ • Visualization ████░░░░░░ 40%                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. Company Learner Community (Bottom Section)
```
┌─────────────────────────────────────────────────────────────────────┐
│ 💬 Company Learning Community                                       │
│                                                                     │
│ [Ask a Question] [Share Insight] [View All Discussions]            │
│                                                                     │
│ Recent Activity from Your Colleagues:                               │
│                                                                     │
│ 💡 "Just discovered a great shortcut for data analysis..."          │
│ By: Michael C. (Marketing Team) • 5 min ago • 12 likes             │
│                                                                     │
│ ❓ "Anyone else working on the reporting module? Need help with..." │
│ By: Sarah J. (Finance Team) • 1 hour ago • 3 replies               │
│                                                                     │
│ 🎯 "Completed all 6 modules! Here are my key takeaways..."         │
│ By: David L. (Operations) • 2 hours ago • 28 likes                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 5. Sidebar (Collapsible)
```
┌─────────────────────┐
│ Quick Actions       │
│                     │
│ 📝 Take Notes       │
│ 🔖 Bookmark Section │
│ 💬 Ask Community    │
│ 📤 Share Progress   │
│                     │
│ Help & Support      │
│ 📖 Course Guide     │
│ 🎧 Tech Support     │
│ ❓ FAQs             │
└─────────────────────┘
```

### 6. Mobile Responsive Design
- Navigation collapses into hamburger menu
- Video/multimedia content adapts to screen size
- Module navigation becomes a dropdown
- Content sections stack vertically
- Touch-friendly buttons and controls

## Key Features

### Multimedia Integration
1. **Video Player**
   - Adaptive streaming quality
   - Closed captions
   - Playback speed control
   - Chapter markers
   - Picture-in-picture mode
   - Quick feedback buttons (👍/👎) embedded in player
   - Feedback tracked per video segment

2. **Audio Narration**
   - Synchronized with content
   - Transcript available
   - Background play option

3. **Interactive Elements**
   - Drag-and-drop exercises
   - Code editors with syntax highlighting
   - Real-time feedback
   - Progress saving

4. **Slide Presentations**
   - Full-screen mode
   - Navigation controls
   - Download option
   - Annotation tools

### Progress Tracking
- Auto-save progress every 30 seconds
- Resume from last position
- Section completion tracking
- Time spent analytics
- Skill development metrics

### Accessibility Features
- Keyboard navigation
- Screen reader support
- High contrast mode
- Font size adjustment
- Content alternatives for multimedia

### Company Learning Community
- Company-wide discussion forum (not course-specific)
- Learners can ask questions across all courses
- Share insights and tips with colleagues
- See which teams are learning what
- Like and reply to discussions
- Filter by department or topic
- Mentorship opportunities
- Peer learning groups

## Database Integration Points

### Required Data
1. **Course Assignment**
   - Progress percentage
   - Current module/section
   - Time spent
   - Completion status

2. **Module Content**
   - Section content (markdown)
   - Multimedia assets
   - Exercise data
   - Resources

3. **User Progress**
   - Section completion
   - Quiz scores
   - Time tracking
   - Notes/bookmarks
   - Content feedback (thumbs up/down)

4. **Community Data**
   - Company-wide discussions
   - User posts and replies
   - Likes and engagement metrics

### API Endpoints Needed
- GET /api/courses/{courseId}/modules
- GET /api/modules/{moduleId}/sections
- POST /api/progress/update
- GET /api/multimedia/{assetId}
- POST /api/feedback/content (for thumbs up/down)
- GET /api/community/discussions
- POST /api/community/discussions/create
- GET /api/resources/{courseId}

## Implementation Notes

### Phase 1: Core Learning Experience
- Module navigation
- Content display with markdown
- Basic progress tracking
- Video placeholder integration

### Phase 2: Enhanced Multimedia
- Video streaming integration
- Audio narration sync
- Interactive exercises
- Slide presentations

### Phase 3: Social & Gamification
- Discussion forums
- Achievement system
- Peer learning features
- Instructor feedback

### Phase 4: Advanced Features
- AI-powered content recommendations
- Personalized learning paths
- Advanced analytics
- Mobile app integration