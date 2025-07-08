# Course Generation Wireframe

## Overview
The AI Course Generation interface shows a real-time view of multiple AI agents working in parallel across different phases to create a personalized course based on skills gaps.

## Main Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AI Course Generation                                    [Generate Course] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Course: "Advanced React Development"           Est. Time: 25 minutes   │
│  Target: Frontend Developers                    Progress: 47%           │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Phase Timeline - Visual Progress Bar]                                 │
│  ● ──── ◐ ──── ○ ──── ○ ──── ○ ──── ○                               │
│  Analysis  Research  Planning  Content  Multimedia  Review              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ACTIVE PHASE: Content Research (Phase 2 of 6)                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ 🔍 Researching latest industry standards...          [========  ] │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ AGENT STATUS                                                     │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │                                                                   │  │
│  │ • Web Researcher         [ACTIVE] ████████░░ 80%                │  │
│  │   → Searching React 18 documentation...                         │  │
│  │                                                                   │  │
│  │ • Document Analyzer      [ACTIVE] ██████░░░░ 60%                │  │
│  │   → Analyzing 15 best practice guides...                        │  │
│  │                                                                   │  │
│  │ • Trend Scout           [ACTIVE] █████████░ 90%                 │  │
│  │   → Found 7 emerging patterns in 2024...                        │  │
│  │                                                                   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  COMPLETED PHASES                                                       │
│                                                                         │
│  ✓ Phase 1: Skills Gap Analysis (2m 14s)                              │
│    • Retrieved 247 employee profiles                                   │
│    • Identified 15 critical skill gaps                                 │
│    • Mapped to 3 job positions                                        │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  UPCOMING PHASES                                                        │
│                                                                         │
│  ○ Phase 3: Course Planning                                            │
│    Agents: Curriculum Designer, Objective Setter, Pace Optimizer       │
│                                                                         │
│  ○ Phase 4: Content Generation                                         │
│    Agents: Content Writer, Example Creator, Quiz Generator, Code Review │
│                                                                         │
│  ○ Phase 5: Multimedia Creation                                        │
│    Agents: Diagram Creator, Slide Designer, Animation Builder          │
│                                                                         │
│  ○ Phase 6: Quality Review                                             │
│    Agents: Quality Checker, Accessibility Auditor, Final Packager      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Detailed Phase Views

### Phase 1: Skills Gap Analysis
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 👥 Skills Gap Analysis                                    ✓ COMPLETED   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Data Retriever          ✓ Fetched 247 employee profiles              │
│  Skills Analyzer         ✓ Analyzed 15 skill gaps                     │
│  Position Mapper         ✓ Mapped 3 job requirements                  │
│                                                                         │
│  Key Findings:                                                         │
│  • 68% lack advanced React hooks knowledge                            │
│  • 45% need performance optimization skills                           │
│  • 82% require state management expertise                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 2: Content Research (ACTIVE)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔍 Content Research                                       🔄 IN PROGRESS │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Web Researcher      [████████░░] Searching React 18 docs...          │
│  Document Analyzer   [██████░░░░] Found 15 best practices...         │
│  Trend Scout        [█████████░] Identifying 2024 patterns...        │
│                                                                         │
│  Live Feed:                                                            │
│  > Found React Server Components guide                                │
│  > Analyzing useState vs useReducer patterns                          │
│  > Discovered new Suspense boundary strategies                        │
│  > Compiling performance optimization checklist                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 3: Course Planning
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📝 Course Planning                                         ⏳ PENDING   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Curriculum Designer     ○ Creating modular structure                  │
│  Objective Setter       ○ Defining learning outcomes                  │
│  Pace Optimizer         ○ Calculating optimal flow                    │
│                                                                         │
│  Planned Structure:                                                    │
│  • Module 1: React Fundamentals Review                                │
│  • Module 2: Advanced Hooks Deep Dive                                 │
│  • Module 3: Performance Optimization                                 │
│  • Module 4: State Management Patterns                                │
│  • Module 5: Testing Strategies                                      │
│  • Module 6: Production Best Practices                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 4: Content Generation
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📄 Content Generation                                      ⏳ PENDING   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Content Writer         ○ Writing comprehensive lessons               │
│  Example Creator        ○ Building practical demos                    │
│  Quiz Generator         ○ Creating assessments                        │
│  Code Reviewer          ○ Validating code samples                     │
│                                                                         │
│  Content Pipeline:                                                     │
│  • 6 modules × 5 lessons = 30 total lessons                          │
│  • 45 code examples                                                  │
│  • 18 hands-on exercises                                             │
│  • 6 module assessments                                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Real-time Agent Activity Display

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AGENT ACTIVITY MONITOR                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Web Researcher      🟢 ACTIVE                                          │
│ ├─ Status: Searching React documentation                               │
│ ├─ Progress: ████████░░ 80%                                           │
│ └─ Found: 23 relevant resources                                       │
│                                                                         │
│ Document Analyzer   🟢 ACTIVE                                          │
│ ├─ Status: Processing best practice guides                            │
│ ├─ Progress: ██████░░░░ 60%                                          │
│ └─ Analyzed: 15/25 documents                                          │
│                                                                         │
│ Trend Scout         🟢 ACTIVE                                          │
│ ├─ Status: Identifying industry patterns                              │
│ ├─ Progress: █████████░ 90%                                          │
│ └─ Patterns: 7 emerging trends identified                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Compact View (Minimized)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AI Course Generation - "Advanced React Development"        [Expand ↓]   │
├─────────────────────────────────────────────────────────────────────────┤
│ Progress: 47% │ Phase 2/6 │ Time: 5:23 │ Agents: 3 active             │
│ [███████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]                │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Features:

1. **Real-time Progress Tracking**
   - Overall progress bar
   - Phase-specific progress
   - Individual agent progress

2. **Live Agent Status**
   - Active/Idle/Completed states
   - Current task descriptions
   - Progress percentages

3. **Phase Timeline**
   - Visual representation of all phases
   - Clear indication of current phase
   - Completed/Active/Pending states

4. **Activity Feed**
   - Real-time updates from agents
   - Key findings and milestones
   - Error handling and retries

5. **Compact Design**
   - Collapsible sections
   - Minimized view option
   - Focus on current phase

6. **Technical Details**
   - Agent-specific metrics
   - Resource discovery counts
   - Processing statistics