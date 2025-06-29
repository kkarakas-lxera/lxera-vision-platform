# Course Generation Pipeline Wireframes

## Overview
A techy, Replit-style visualization showing the AI agents working through the course generation process in real-time.

## State 1: Initial State - Pipeline Started
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🤖 AI Course Generation Pipeline                                   [−] [✕]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Generating personalized course for John Doe                                  │
│ Job ID: a3f4-b2c1-d5e6-f7g8                                                │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────┐           │
│ │ 🌐 Network Status: Connected | ⚡ 0% Complete                │           │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │           │
│ └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ ┌─ Planning Agent ─────────────────────────────────────────────┐           │
│ │ 🧠 Status: Initializing...                                   │           │
│ │                                                               │           │
│ │ ○ Analyze Employee Profile                                   │           │
│ │ ○ Prioritize Skill Gaps                                      │           │
│ │ ○ Generate Course Structure                                  │           │
│ │ ○ Generate Research Queries                                  │           │
│ │ ○ Create Learning Path                                       │           │
│ │ ○ Store Course Plan                                          │           │
│ └───────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ ┌─ Research Agent ─────────────────────────────────────────────┐           │
│ │ 🔍 Status: Waiting...                                        │           │
│ │                                                               │           │
│ │ ○ Fetch Course Plan                                          │           │
│ │ ○ Generate Section Content                                   │           │
│ │ ○ Create Practical Exercises                                 │           │
│ │ ○ Store Course Content                                       │           │
│ └───────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ [📊 Show Data Flow] [🖥️ Terminal View] [⬇️ Minimize]                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## State 2: Planning Agent Active
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🤖 AI Course Generation Pipeline                                   [−] [✕]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Generating personalized course for John Doe                                  │
│ Current Phase: Planning Agent - Analyzing Employee Profile                   │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────┐           │
│ │ 🌐 Network Status: Active | ⚡ 15% Complete                  │           │
│ │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │           │
│ └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ ┌─ Planning Agent ─────────────────────────────────────────────┐ ⚡ ACTIVE │
│ │ 🧠 Analyzing skills gaps and creating course structure       │           │
│ │                                                               │           │
│ │ ✓ Analyze Employee Profile                        [2.3s] ✅  │           │
│ │ ⟳ Prioritize Skill Gaps                          [1.2s] 🔄  │ ← Current │
│ │   └─ Found 5 critical, 8 moderate gaps                      │           │
│ │ ○ Generate Course Structure                                  │           │
│ │ ○ Generate Research Queries                                  │           │
│ │ ○ Create Learning Path                                       │           │
│ │ ○ Store Course Plan                                          │           │
│ │                                                               │           │
│ │ 💬 Output: "Identified Python, SQL as critical skill gaps"   │           │
│ └───────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ ┌─ Agent Handoff Visualization ────────────────────────────────┐           │
│ │ [Planning Agent] ━━━━━━━━━━━━⚡ · · · · · [Research Agent]  │           │
│ └───────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ [📊 Hide Data Flow] [🖥️ Terminal View] [⬇️ Minimize]                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## State 3: Terminal View Expanded
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🤖 AI Course Generation Pipeline                                   [−] [✕]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐           │
│ │ 🌐 Network Status: Active | ⚡ 45% Complete                  │           │
│ │ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │           │
│ └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ ┌─ Terminal Logs ──────────────────────────────────────────────┐           │
│ │ $ 14:32:15 [System] Pipeline initialized                     │           │
│ │ $ 14:32:16 [Planning Agent] Starting: Understanding learner  │           │
│ │ $ 14:32:18 [Planning Agent] ✓ Completed: Analyze Profile    │           │
│ │ $ 14:32:19 [Planning Agent] Starting: Identifying gaps      │           │
│ │ $ 14:32:22 [Planning Agent] ✓ Completed: Prioritize Gaps    │           │
│ │ $ 14:32:23 [Planning Agent] Starting: Creating curriculum   │           │
│ │ $ 14:32:27 [Planning Agent] Generated 12 module structure   │           │
│ │ $ 14:32:28 [Planning Agent] ✓ Completed: Course Structure   │           │
│ │ $ 14:32:29 [Planning Agent] Preparing handoff to Research   │           │
│ │ $ 14:32:30 [Data] plan_id: f47ac10b-58cc-4372-a567-0e02b2  │           │
│ │ _                                                            │           │
│ └───────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ ┌─ Planning Agent ─────────────────────────────────────────────┐ ✅ DONE   │
│ │ 🧠 Course structure planning completed                       │           │
│ │ All 6 steps completed in 15.2s                               │           │
│ └───────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ [📊 Show Data Flow] [🖥️ Hide Terminal] [⬇️ Minimize]                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## State 4: Agent Handoff Animation
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🤖 AI Course Generation Pipeline                                   [−] [✕]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Current Phase: Handoff - Planning → Research                                 │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────┐           │
│ │ 🌐 Network Status: Handoff | ⚡ 50% Complete                 │           │
│ │ ██████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │           │
│ └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ ┌─ Agent Handoff Visualization ────────────────────────────────┐           │
│ │                                                               │           │
│ │     Planning Agent          ✨ Handoff ✨        Research Agent        │
│ │          ✅                      ⚡                     🔄             │
│ │                                                               │           │
│ │     ┌─────────┐            ┌─────────┐            ┌─────────┐       │
│ │     │  DONE   │ ══════════>│ PAYLOAD │══════════> │ LOADING │       │
│ │     └─────────┘            └─────────┘            └─────────┘       │
│ │                                                               │           │
│ │     Transferring:                                             │           │
│ │     • Course Plan ID: f47ac10b-58cc-4372                     │           │
│ │     • 12 Modules Structured                                  │           │
│ │     • 5 Critical Skills Identified                           │           │
│ │     • Research Queries Generated                             │           │
│ └───────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ [📊 Show Data Flow] [🖥️ Terminal View] [⬇️ Minimize]                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## State 5: Research Agent Active
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🤖 AI Course Generation Pipeline                                   [−] [✕]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Current Phase: Research Agent - Generating Section Content                   │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────┐           │
│ │ 🌐 Network Status: Active | ⚡ 75% Complete                  │           │
│ │ ██████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░ │           │
│ └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ ┌─ Research Agent ─────────────────────────────────────────────┐ ⚡ ACTIVE │
│ │ 🔍 Gathering and generating course content                   │           │
│ │                                                               │           │
│ │ ✓ Fetch Course Plan                              [1.1s] ✅  │           │
│ │ ⟳ Generate Section Content                       [8.7s] 🔄  │ ← Current │
│ │   ├─ Module 1: Python Basics                          ✅    │           │
│ │   ├─ Module 2: Data Structures                       ✅    │           │
│ │   ├─ Module 3: SQL Fundamentals                      🔄    │           │
│ │   └─ Module 4-12: Queued...                                 │           │
│ │ ○ Create Practical Exercises                                 │           │
│ │ ○ Store Course Content                                       │           │
│ │                                                               │           │
│ │ 📊 Progress: 3/12 modules completed                          │           │
│ └───────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ ┌─ Live Content Preview ───────────────────────────────────────┐           │
│ │ Module 3: SQL Fundamentals                                   │           │
│ │ ├─ Lesson 1: Introduction to Databases                       │           │
│ │ ├─ Lesson 2: Basic SELECT Statements                         │           │
│ │ └─ Generating: Lesson 3: JOIN Operations...                 │           │
│ └───────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ [📊 Show Data Flow] [🖥️ Terminal View] [⬇️ Minimize]                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## State 6: Minimized View (Floating Widget)
```
┌─────────────────────────────────────────┐
│ ⚡ Generating Course          [↑] │
├─────────────────────────────────────────┤
│ ████████████████████████░░░░░ 85%      │
│ Research Agent: Creating exercises...    │
└─────────────────────────────────────────┘
```

## State 7: Completion State
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🤖 AI Course Generation Pipeline                                   [−] [✕]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✅ Course generation completed for John Doe!                                 │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────┐           │
│ │ 🌐 Network Status: Complete | ⚡ 100% Complete               │           │
│ │ ████████████████████████████████████████████████████████████ │           │
│ └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ ┌─ Pipeline Summary ───────────────────────────────────────────┐           │
│ │ Total Time: 2m 34s                                           │           │
│ │ Modules Generated: 12                                        │           │
│ │ Exercises Created: 48                                        │           │
│ │ Content ID: c8f9e2a1-3b4d-5e6f-7a8b-9c0d1e2f3a4b            │           │
│ │                                                               │           │
│ │ Agent Performance:                                            │           │
│ │ • Planning Agent: 15.2s (6 steps)                           │           │
│ │ • Research Agent: 2m 18s (4 steps)                          │           │
│ └───────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ ┌─ Next Steps ─────────────────────────────────────────────────┐           │
│ │ • Course has been assigned to employee                       │           │
│ │ • Email notification will be sent in 5 minutes              │           │
│ │ • View course in the Courses dashboard                      │           │
│ └───────────────────────────────────────────────────────────────┘           │
│                                                                             │
│ [View Course] [Generate Another] [Close]                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Design Elements

### Visual Indicators
- **Status Icons**: 
  - ○ Pending (gray circle)
  - ⟳ Active (spinning loader)
  - ✓ Completed (green checkmark)
  - ⚡ Processing (lightning bolt)

### Color Coding
- **Blue**: Active/Processing
- **Green**: Completed/Success
- **Gray**: Pending/Inactive
- **Yellow/Orange**: Warnings or handoffs

### Interactive Elements
1. **Expandable Sections**: Click on agents to expand/collapse details
2. **Terminal View**: Toggle to see real-time logs
3. **Data Flow**: Visual representation of agent handoffs
4. **Minimize Option**: Floating widget for background processing
5. **Progress Indicators**: Both overall and per-agent progress

### Animation Suggestions
1. **Pulse Effect**: Active agent cards pulse with a subtle glow
2. **Progress Bars**: Smooth transitions with easing
3. **Handoff Animation**: Particle effect or data stream visualization
4. **Terminal Logs**: Typewriter effect for new entries
5. **Status Changes**: Smooth transitions between states

### Responsive Behavior
- Full view on desktop (as shown)
- Stacked layout on tablet
- Simplified mobile view with collapsible sections
- Floating widget adapts to screen size

This design provides a technical, engaging visualization that shows the AI agents at work, similar to Replit's execution environments but tailored for course generation.