# Assessment Page Implementation Plan

## Component Architecture (Using Existing Components)

### 1. Main Assessment Container
```
AssessmentPage (extends CourseViewer.tsx)
├── AssessmentDashboard (reuses existing Card, Progress, Badge components)
├── AssessmentContent (Dynamic)
│   ├── KnowledgeCheckQuiz (new)
│   ├── PracticalExercise (new)  
│   ├── ApplicationChallenge (new)
│   └── SelfAssessmentChecklist (new)
├── FileUploadManager (enhance existing upload patterns)
└── PeerReviewSystem (reuses existing feedback patterns)
```

## Component Specifications

### AssessmentDashboard.tsx
**Purpose**: Overview of all assessment types and progress
**Key Features**:
- Progress tracking cards
- Assessment type navigation
- Overall score display
- Due dates and notifications

**Props Interface**:
```typescript
interface AssessmentDashboardProps {
  assessments: AssessmentOverview[];
  overallProgress: number;
  onAssessmentSelect: (assessmentId: string) => void;
}
```

### KnowledgeCheckQuiz.tsx  
**Purpose**: Interactive quiz with explanations
**Key Features**:
- Multiple choice questions
- Confidence level tracking
- Immediate feedback with explanations
- Progress indicator
- Note-taking capability

**State Management**:
```typescript
interface QuizState {
  currentQuestion: number;
  answers: Record<number, string>;
  confidenceLevels: Record<number, number>;
  notes: Record<number, string>;
  timeRemaining: number;
  isSubmitted: boolean;
}
```

### PracticalExercise.tsx
**Purpose**: Step-by-step guided exercises
**Key Features**:
- Checklist progress tracking
- File upload for deliverables
- Timer functionality
- Save/resume capability
- Help request system

### ApplicationChallenge.tsx
**Purpose**: Complex scenario-based assessments
**Key Features**:
- Multi-part submission system
- Rubric display
- File management
- Draft saving
- Extension requests

### SelfAssessmentChecklist.tsx
**Purpose**: Confidence and competency self-evaluation
**Key Features**:
- Checkbox completion tracking
- Confidence sliders
- Personal notes
- Learning plan generation
- Mentor sharing

### PeerReviewSystem.tsx
**Purpose**: Collaborative assessment review
**Key Features**:
- Review assignment management
- Rubric-based scoring
- File viewing/downloading
- Feedback submission
- Review status tracking

### FileUploadManager.tsx
**Purpose**: Centralized file handling
**Key Features**:
- Drag-and-drop interface
- File type validation
- Progress tracking
- Preview capability
- Version management

## Database Integration (Extending Existing Tables)

### Extend course_section_progress Table
```sql
-- Add assessment-specific columns to existing table
ALTER TABLE course_section_progress 
ADD COLUMN IF NOT EXISTS assessment_type TEXT,
ADD COLUMN IF NOT EXISTS assessment_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS score DECIMAL,
ADD COLUMN IF NOT EXISTS max_score DECIMAL DEFAULT 100,
ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
```

### Extend content_feedback Table  
```sql
-- Add assessment feedback columns to existing table
ALTER TABLE content_feedback
ADD COLUMN IF NOT EXISTS assessment_section TEXT,
ADD COLUMN IF NOT EXISTS confidence_level INTEGER,
ADD COLUMN IF NOT EXISTS peer_review_data JSONB,
ADD COLUMN IF NOT EXISTS submission_files TEXT[];
```

### Minimal New Tables (Only if Absolutely Needed)
```sql
-- Only create if peer review needs separate tracking
CREATE TABLE IF NOT EXISTS peer_review_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_progress_id UUID REFERENCES course_section_progress(id),
  reviewer_employee_id UUID REFERENCES employees(id),
  review_data JSONB,
  status TEXT DEFAULT 'pending',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

### Enums
```sql
CREATE TYPE assessment_type_enum AS ENUM (
  'knowledge_check_quiz',
  'practical_exercise', 
  'application_challenge',
  'self_assessment_checklist'
);

CREATE TYPE submission_status_enum AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'peer_review_pending',
  'graded',
  'returned_for_revision'
);

CREATE TYPE review_status_enum AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'overdue'
);
```

## API Endpoints Needed

### Assessment Management
```typescript
// Get assessments for a module
GET /api/assessments/module/{moduleId}

// Get specific assessment details
GET /api/assessments/{assessmentId}

// Submit assessment
POST /api/assessments/{assessmentId}/submit

// Save draft
PUT /api/assessments/{assessmentId}/draft

// Get submission status
GET /api/assessments/{assessmentId}/submission/{employeeId}
```

### File Management
```typescript
// Upload assessment files
POST /api/assessments/{assessmentId}/files

// Download submission file
GET /api/assessments/files/{fileId}

// Delete file
DELETE /api/assessments/files/{fileId}
```

### Peer Review
```typescript
// Get assigned reviews
GET /api/peer-reviews/assigned/{employeeId}

// Submit peer review
POST /api/peer-reviews/{submissionId}/review

// Get received reviews
GET /api/peer-reviews/received/{employeeId}
```

### Analytics
```typescript
// Get assessment analytics
GET /api/analytics/assessments/{employeeId}

// Update learning analytics
POST /api/analytics/assessments/{assessmentId}/update
```

## Integration with Existing CourseViewer

### Update CourseViewer.tsx
```typescript
// Add assessment section to COURSE_SECTIONS
const COURSE_SECTIONS = [
  { id: 'introduction', name: 'Introduction', icon: BookOpen },
  { id: 'core_content', name: 'Core Content', icon: Book },
  { id: 'practical_applications', name: 'Practical Applications', icon: Lightbulb },
  { id: 'case_studies', name: 'Case Studies', icon: Users },
  { id: 'assessments', name: 'Assessments', icon: ClipboardCheck } // New
];

// Update section content rendering
const renderSectionContent = () => {
  switch (currentSection) {
    case 'assessments':
      return <AssessmentPage moduleId={moduleId} employeeId={employeeId} />;
    // ... other cases
  }
};
```

## Progressive Enhancement Plan

### Phase 1: Basic Quiz System
- [ ] Implement KnowledgeCheckQuiz component
- [ ] Basic scoring and feedback
- [ ] Simple progress tracking

### Phase 2: File-based Assessments  
- [ ] Add PracticalExercise and ApplicationChallenge
- [ ] File upload system
- [ ] Draft saving functionality

### Phase 3: Self-Assessment
- [ ] Implement SelfAssessmentChecklist
- [ ] Confidence tracking
- [ ] Learning gap analysis

### Phase 4: Peer Review System
- [ ] Build peer review assignment logic
- [ ] Review interface and rubrics
- [ ] Notification system

### Phase 5: Advanced Analytics
- [ ] Detailed progress analytics
- [ ] Learning recommendations
- [ ] Performance insights

This implementation plan provides a solid foundation for building a comprehensive assessment system that aligns with your learning objectives while maintaining scalability and user engagement.