# Enhanced Employee Onboarding System

## Overview
This document describes the enhanced employee onboarding system that was implemented to simplify the skills gap analysis workflow. The system provides a linear, intuitive process for importing employees, analyzing their CVs, and generating skills gap reports.

## Key Features

### 1. Position-Based Employee Import
- Select a default position before importing employees
- Position context is stored with the import session
- Ensures accurate skills gap analysis

### 2. Smart CV Analysis
- AI-powered CV text extraction and analysis
- Automatic skills identification and proficiency level assessment
- Integration with NESTA skills taxonomy
- Real-time gap calculation after analysis

### 3. Skills Gap Reporting
- Visual representation of skill gaps by position
- Organization-wide top missing skills
- Export functionality for CSV reports
- Real-time updates as employees are analyzed

## Workflow

1. **Select Position** - Choose a default position for imported employees
2. **Import Employees** - Upload CSV with employee data
3. **Upload CVs** - Bulk upload employee resumes
4. **Analyze Skills** - Run AI-powered analysis
5. **View Results** - Review and export skills gap report

## Technical Implementation

### Database Schema
- Enhanced import sessions with position context
- Skills profile with gap analysis timestamps
- LLM usage metrics tracking
- Session analytics views

### Services
- **LLMService** - Unified AI operations
- **CVProcessingService** - Bulk CV processing with queue
- **PositionMappingService** - Intelligent position suggestions

### Edge Functions
- **analyze-cv-enhanced** - Enhanced CV analysis with skills extraction

### Components
- **AddEmployees** - Position selection and CSV import
- **AnalyzeSkillsButton** - One-click bulk analysis
- **SkillsGapAnalysis** - Real-time gap visualization
- **SessionStatusCard** - Visual session tracking
- **QuickActions** - Common task shortcuts

## Commands to Run

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Environment Variables Required
- `OPENAI_API_KEY` - For AI-powered analysis
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - For edge functions

## Future Enhancements
1. Integration with course generation pipeline
2. Advanced analytics dashboard
3. Automated position recommendations
4. Skills trend analysis over time
5. Multi-language CV support

## Critical Technical Learnings

### Modal Overlay Issues - React Portal Solution
**Problem**: Modal overlays were being blocked by parent elements despite high z-index values.

**Root Cause**: GPU compositing layers created by CSS `transform` animations establish new stacking contexts that trap child elements, making traditional z-index solutions ineffective.

**Solution**: Migrated all modals to use Radix UI Dialog components with React Portals, which render content outside the component tree directly to document.body.

**Key Insights**:
1. **GPU Layers Override Z-Index**: Elements with `transform`, `filter`, or `will-change` create GPU compositing layers that exist on separate rendering planes
2. **Portal Rendering Escapes Stacking Contexts**: React Portals bypass all parent stacking contexts by rendering at document root
3. **Animation Method Matters**: Changed carousel animations from `transform: translateX()` to `left: position` to avoid GPU layer creation

**Implementation Pattern**:
```tsx
// ✅ Correct - Uses Dialog with Portal
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Modal</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Content renders via portal */}
  </DialogContent>
</Dialog>

// ❌ Incorrect - Manual fixed positioning
<div className="fixed z-50">
  {/* Trapped in parent stacking context */}
</div>
```

**Best Practices**:
- Always use portal-based components (Dialog, Sheet, Dropdown) for overlays
- Avoid transform animations on elements containing modals
- Don't rely on z-index alone for overlay management
- Use consistent modal patterns across the codebase

### Form Nesting Issues - HTML Validation
**Problem**: Forms nested inside other forms cause unexpected behavior and page reloads.

**Root Cause**: HTML specification forbids nested forms. Browsers automatically close the first form when encountering a nested form, breaking event handlers and causing the outer form to submit unexpectedly.

**Symptoms**:
1. Page reloads before JavaScript can execute
2. Toast notifications never appear
3. API calls are interrupted
4. No error messages displayed to users

**Solution**: Restructure components to ensure forms are siblings, not nested:
```jsx
// ✅ Correct - Forms as siblings
{condition1 && (
  <form onSubmit={handler1}>
    {/* Form 1 content */}
  </form>
)}

{condition2 && (
  <div>
    <ComponentWithOwnForm />  {/* Form 2 - not nested */}
  </div>
)}

// ❌ Incorrect - Nested forms
<form>
  <ComponentWithOwnForm />  {/* Creates invalid HTML */}
</form>
```

**Key Learning**: Always check for nested forms when debugging form submission issues, especially when integrating form components that manage their own form elements.

### Single Shared Modal Implementation - State Lifting Pattern
**Problem**: Multiple instances of demo modals across the platform causing inconsistent behavior and code duplication.

**Solution**: Implemented a single shared modal using the state lifting pattern, with modal state and logic centralized in App.tsx.

**Implementation Date**: January 2025

**Technical Details**:
1. **Modal State in App.tsx**: Created global state for demo modal (open/closed, source tracking, form data)
2. **Button-Only Component**: Converted ProgressiveDemoCapture from a full modal component to a button that triggers the global modal
3. **Props Drilling**: Pass openDemoModal function through component tree to all pages and components that need it

**Implementation Pattern**:
```tsx
// In App.tsx - Global modal state
const [demoModalOpen, setDemoModalOpen] = useState(false);
const [demoModalSource, setDemoModalSource] = useState("");
const [formData, setFormData] = useState({
  email: '',
  name: '',
  company: '',
  companySize: ''
});

const openDemoModal = (source: string) => {
  setDemoModalSource(source);
  setDemoModalOpen(true);
};

// Single modal instance in App.tsx
<Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
  <DialogContent>
    {/* Form with all demo capture logic */}
  </DialogContent>
</Dialog>

// In ProgressiveDemoCapture - Now just a button
const ProgressiveDemoCapture = ({ source, openDemoModal }) => {
  const handleClick = () => {
    if (openDemoModal) {
      openDemoModal(source);
    }
  };
  
  return <Button onClick={handleClick}>Book Demo</Button>;
};
```

**Benefits**:
1. **Single Modal Instance**: Only one modal exists in the entire application
2. **Consistent Behavior**: All demo buttons work exactly the same way
3. **Reduced Code Duplication**: Form logic exists in one place
4. **Maintained Analytics**: Source tracking preserved for each button
5. **Better Performance**: Fewer modal instances in the DOM

**Files Modified**: 32 files including all pages, mobile components, and shared components

**Key Learning**: State lifting is an effective pattern for sharing complex UI components (like modals) across an entire application while maintaining consistency and reducing duplication.