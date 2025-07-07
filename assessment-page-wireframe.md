# Assessment Page Wireframe - Business Performance Reporting

## Page Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: Course Navigation + Progress Bar                        │
├─────────────────────────────────────────────────────────────────┤
│ ASSESSMENT DASHBOARD                                            │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│ │  Knowledge      │ │  Practical      │ │  Application    │    │
│ │  Check Quiz     │ │  Exercises      │ │  Challenges     │    │
│ │  🧠 5/5 ✓       │ │  📋 2/3 ⏳      │ │  🎯 0/1 📅      │    │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│ ACTIVE ASSESSMENT CONTENT AREA                                  │
├─────────────────────────────────────────────────────────────────┤
│ SUBMISSION & PEER REVIEW PANEL                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component 1: Assessment Dashboard

### Visual Layout
```
Assessment Overview
┌─────────────────────────────────────────────────────────────────┐
│  📊 Your Progress: 7/9 assessments completed (78%)             │
│  ▓▓▓▓▓▓▓▓░░ Next: Application Challenge due in 3 days         │
├─────────────────────────────────────────────────────────────────┤
│ Assessment Types                                                │
│                                                                 │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ 🧠 Knowledge     │ │ 📋 Practical     │ │ 🎯 Application   │ │
│ │    Check Quiz    │ │    Exercises     │ │    Challenges    │ │
│ │                  │ │                  │ │                  │ │
│ │ 5 Questions      │ │ 3 Exercises      │ │ 1 Challenge      │ │
│ │ ✅ Completed     │ │ ⏳ 2/3 Done      │ │ 📅 Due Soon      │ │
│ │ Score: 100%      │ │ 🔄 In Progress   │ │ 💰 Weighted 40%  │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
│                                                                 │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ ✅ Self-         │ │ 👥 Peer          │ │ 📈 Overall       │ │
│ │    Assessment    │ │    Reviews       │ │    Score         │ │
│ │                  │ │                  │ │                  │ │
│ │ 5/5 Checked      │ │ 2 Pending        │ │ Current: 85%     │ │
│ │ ✅ Complete      │ │ 1 Completed      │ │ Target: 80%      │ │
│ │ Last: Today      │ │ ⏰ Review Due    │ │ 🎯 On Track      │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component 2: Knowledge Check Quiz Interface

### Quiz Question Layout
```
Knowledge Check Quiz - Question 2 of 5
┌─────────────────────────────────────────────────────────────────┐
│ Progress: ●●○○○                                    Time: 8:42   │
├─────────────────────────────────────────────────────────────────┤
│ Which metric would be most important for analyzing the          │
│ profitability of a new product?                                 │
│                                                                 │
│ ○ A) Employee attendance rates                                  │
│ ○ B) Market share                                              │
│ ● C) Gross margin                                              │
│ ○ D) Number of customer complaints                             │
│                                                                 │
│ [Confidence Level: ▓▓▓▓▓▓▓░░░ 70%]                            │
├─────────────────────────────────────────────────────────────────┤
│ 📝 Notes (Optional):                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Gross margin directly shows profit after costs...          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│              [◀ Previous]  [Next ▶]  [Submit Quiz]            │
└─────────────────────────────────────────────────────────────────┘
```

### Quiz Results & Explanation
```
Quiz Results - Question 2
┌─────────────────────────────────────────────────────────────────┐
│ ✅ Correct! Your answer: C) Gross margin                       │
├─────────────────────────────────────────────────────────────────┤
│ 💡 Explanation:                                                │
│ Gross margin is a critical metric for analyzing profitability  │
│ as it directly reflects the difference between sales and the    │
│ cost of goods sold, showing how much the company earns taking   │
│ into consideration the costs directly associated with the       │
│ production of the products.                                     │
│                                                                 │
│ 📊 Your confidence: 70% ✓ (Accurate self-assessment)          │
│ 📈 Class average: 78% correct                                  │
│                                                                 │
│ 🔗 Related Resources:                                          │
│ • Financial Metrics Deep Dive (Module 2)                      │
│ • Profitability Analysis Guide                                 │
├─────────────────────────────────────────────────────────────────┤
│                    [Continue to Question 3 ▶]                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component 3: Practical Exercises Interface

### Exercise Overview
```
Practical Exercise: Create a Basic Performance Report
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Exercise 2 of 3                           Status: ⏳ In Progress │
│ ⏱️ Time Limit: 45 minutes                    Started: 12 min ago │
├─────────────────────────────────────────────────────────────────┤
│ 🎯 Objective:                                                   │
│ Create a basic performance report using spreadsheet software.   │
│                                                                 │
│ 📝 Steps Checklist:                                            │
│ ✅ 1. Gather Data - Collect sales, costs, market data          │
│ ✅ 2. Create Spreadsheet - Input collected data                │
│ ⏳ 3. Calculate Key Metrics - Use formulas for margins/profit   │
│ ⏳ 4. Generate Charts - Create visual representations           │
│ ⏳ 5. Summarize Findings - Write brief analysis                 │
│ ⏳ 6. Review - Check calculations and visuals                   │
│                                                                 │
│ 📎 Required Deliverables:                                      │
│ • Completed spreadsheet file                                   │
│ • Summary report (300-500 words)                              │
│ • At least 2 charts/graphs                                    │
├─────────────────────────────────────────────────────────────────┤
│ 📤 File Upload Area:                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📄 performance_report.xlsx (Uploaded ✓)                    │ │
│ │ 📄 Drag files here or [Browse Files]                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Save Progress] [Submit Exercise] [Request Help]               │
└─────────────────────────────────────────────────────────────────┘
```

## Component 4: Self-Assessment Checklist

### Checklist Interface
```
Self-Assessment Checklist
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 Rate your confidence and competency in each area:           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ✅ I can identify key financial metrics relevant to business    │
│    performance.                                                 │
│    Confidence: ▓▓▓▓▓▓▓▓░░ 80%                                 │
│    📝 Note: Strong on margins, need work on ROI calculations   │
│                                                                 │
│ ✅ I am able to use spreadsheet software to calculate basic    │
│    financial metrics.                                          │
│    Confidence: ▓▓▓▓▓▓▓░░░ 70%                                 │
│    📝 Note: Comfortable with formulas, charts need practice    │
│                                                                 │
│ ⏳ I can create and interpret charts and graphs that represent │
│    business data.                                              │
│    Confidence: ▓▓▓▓▓░░░░░ 50%                                 │
│    📝 Note: [Click to add personal notes]                     │
│                                                                 │
│ ○ I understand how to perform trend analysis using historical  │
│    business performance data.                                   │
│    Confidence: ▓▓▓░░░░░░░ 30%                                 │
│    📝 Note: Need more practice with time series analysis       │
│                                                                 │
│ ○ I can summarize business performance insights clearly and     │
│    concisely.                                                  │
│    Confidence: ▓▓▓▓▓▓░░░░ 60%                                 │
│    📝 Note: [Click to add personal notes]                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 📊 Overall Confidence: 58% (3/5 completed)                     │
│ 🎯 Recommended: Focus on trend analysis and data visualization │
│                                                                 │
│ [Save Assessment] [Generate Learning Plan] [Share with Mentor] │
└─────────────────────────────────────────────────────────────────┘
```

## Component 5: Application Challenge Interface

### Challenge Overview
```
Application Challenge: CEO Performance Report
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 Challenge 1 of 1                         Due: 3 days        │
│ 🏆 Weighted: 40% of final grade             Attempts: 1/2       │
├─────────────────────────────────────────────────────────────────┤
│ 📋 Scenario:                                                   │
│ You are an analyst at a mid-sized company. The CEO wants a     │
│ report on the performance of a newly launched product. Your    │
│ task is to analyze sales, costs, and market reception over     │
│ the first quarter and prepare a presentation for the next      │
│ board meeting.                                                 │
│                                                                 │
│ 📝 Required Tasks:                                             │
│                                                                 │
│ 1️⃣ Data Collection (30%)                                      │
│    • Gather sales figures, production costs, customer feedback │
│    📤 Upload: Raw data files (Excel/CSV)                      │
│                                                                 │
│ 2️⃣ Analysis (30%)                                             │
│    • Calculate profitability metrics                           │
│    • Analyze customer sentiment                                │
│    📤 Upload: Analysis spreadsheet                            │
│                                                                 │
│ 3️⃣ Report Creation (20%)                                      │
│    • Comprehensive report with charts/graphs                   │
│    📤 Upload: Written report (PDF/Word)                       │
│                                                                 │
│ 4️⃣ Presentation (20%)                                         │
│    • PowerPoint summarizing key findings                       │
│    📤 Upload: Presentation file                               │
│    🎥 Optional: Record video presentation                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 📤 Submission Area:                                            │
│ Task 1: [📁 data_collection.xlsx] ✅ Uploaded                 │
│ Task 2: [📁 Drop files here...] ⏳ Pending                    │
│ Task 3: [📁 Drop files here...] ⏳ Pending                    │
│ Task 4: [📁 Drop files here...] ⏳ Pending                    │
│                                                                 │
│ [Save Draft] [Submit for Review] [Request Extension]          │
└─────────────────────────────────────────────────────────────────┘
```

## Component 6: Peer Review System

### Peer Review Dashboard
```
Peer Review Center
┌─────────────────────────────────────────────────────────────────┐
│ 👥 Reviews To Complete (2)          📋 Reviews Received (1)    │
├─────────────────────────────────────┬───────────────────────────┤
│ 🔍 Sarah's Application Challenge     │ ✅ Your Quiz Results      │
│ Due: Tomorrow                       │ Reviewer: Mike Chen       │
│ 📊 CEO Performance Report          │ Score: 92/100             │
│ [Start Review]                      │ Feedback: "Excellent      │
│                                     │ analysis of gross         │
│ 🔍 John's Practical Exercise       │ margins..."               │
│ Due: 2 days                         │ [View Full Review]        │
│ 📋 Spreadsheet Analysis            │                           │
│ [Start Review]                      │ ⏳ Pending Reviews (2)    │
│                                     │ • Application Challenge   │
│                                     │ • Self-Assessment        │
└─────────────────────────────────────┴───────────────────────────┘
```

### Active Peer Review Interface
```
Peer Review: Sarah's CEO Performance Report
┌─────────────────────────────────────────────────────────────────┐
│ 👤 Reviewing: Sarah Johnson        📅 Due: Tomorrow 5:00 PM    │
│ 📋 Assignment: Application Challenge - CEO Performance Report   │
├─────────────────────────────────────────────────────────────────┤
│ 📄 Submitted Files:                                            │
│ • 📊 sales_analysis.xlsx                    [Download] [View]  │
│ • 📄 ceo_report.pdf                        [Download] [View]  │
│ • 🎨 board_presentation.pptx               [Download] [View]  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 📝 Evaluation Rubric:                                          │
│                                                                 │
│ Data Accuracy (30%)              [●●●●○] 8/10                  │
│ Comment: Data sources well documented, minor calculation error  │
│ in Q2 profit margin.                                           │
│                                                                 │
│ Analytical Depth (30%)           [●●●●●] 10/10                 │
│ Comment: Excellent trend analysis and customer sentiment       │
│ interpretation. Strong correlation insights.                   │
│                                                                 │
│ Clarity of Report (20%)          [●●●●○] 8/10                  │
│ Comment: Report is well-structured but could benefit from      │
│ clearer executive summary.                                     │
│                                                                 │
│ Effectiveness of Presentation (20%) [●●●○○] 6/10               │
│ Comment: Slides are informative but lack visual appeal.        │
│ Consider using more charts and less text.                     │
│                                                                 │
│ 📊 Overall Score: 8.2/10 (82%)                                │
│                                                                 │
│ 💭 General Feedback:                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Sarah's analysis shows strong analytical thinking and       │ │
│ │ attention to detail. The data collection was thorough      │ │
│ │ and the insights are valuable. For improvement, focus on   │ │
│ │ presentation design and double-check calculations...       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Save Draft] [Submit Review] [Flag for Instructor Review]     │
└─────────────────────────────────────────────────────────────────┘
```

## Component 7: Integration Summary

The assessment system is now integrated into the existing CourseViewer as the "Assessments" section. Key integration points:

- **Database**: Extended existing `course_section_progress` and `content_feedback` tables
- **UI Components**: Reused existing Card, Progress, Badge, Button components 
- **Navigation**: Integrated as a section in the existing course navigation
- **Progress Tracking**: Uses existing section progress tracking mechanisms

## Technical Implementation Notes

### State Management Structure
```javascript
// Assessment state structure
interface AssessmentState {
  currentAssessment: {
    type: 'quiz' | 'exercise' | 'challenge' | 'self-assessment',
    id: string,
    progress: number,
    timeStarted: Date,
    answers: Record<string, any>,
    drafts: Record<string, any>
  },
  assessmentData: {
    quizzes: QuizAssessment[],
    exercises: PracticalExercise[],
    challenges: ApplicationChallenge[],
    selfAssessments: SelfAssessmentChecklist[]
  },
  submissions: {
    files: FileUpload[],
    status: 'draft' | 'submitted' | 'reviewed' | 'graded'
  },
  peerReviews: {
    toReview: PeerReviewTask[],
    received: PeerReviewResult[],
    completed: PeerReviewSubmission[]
  },
  analytics: AssessmentAnalytics
}
```

### Database Schema Requirements
```sql
-- Core assessment tables needed
CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES cm_module_content(content_id),
  type assessment_type_enum,
  title TEXT,
  instructions TEXT,
  scoring_rubric JSONB,
  due_date TIMESTAMP,
  weight_percentage INTEGER
);

CREATE TABLE assessment_submissions (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  employee_id UUID REFERENCES employees(id),
  submission_data JSONB,
  files TEXT[], -- Array of file URLs
  score DECIMAL,
  status submission_status_enum,
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP
);

CREATE TABLE peer_reviews (
  id UUID PRIMARY KEY,
  submission_id UUID REFERENCES assessment_submissions(id),
  reviewer_id UUID REFERENCES employees(id),
  review_data JSONB,
  score DECIMAL,
  feedback TEXT,
  completed_at TIMESTAMP
);
```

This wireframe provides a comprehensive assessment system that supports all the learning objectives while maintaining engagement through interactive elements, peer collaboration, and detailed progress tracking.