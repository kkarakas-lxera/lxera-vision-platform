# Course Generation UI Implementation Plan

## Selected Design: Split View - Overview + Live Agent Feed

### Visual Design Specification
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚡ Generating 50 Personalized Courses                              [−] [✕]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─── Overall Progress ───┐  ┌─── Live Agent Activity ─────────────────┐  │
│  │                        │  │                                          │  │
│  │      28 of 50          │  │ 🧠 Planning Agent #1                    │  │
│  │                        │  │ └─ Analyzing skill gaps for John Doe    │  │
│  │   ● ● ● ● ● ● ● ●     │  │    "Found 5 critical Python gaps..."   │  │
│  │   ● ● ● ● ● ● ● ●     │  │                                          │  │
│  │   ● ● ● ● ● ● ● ●     │  │ 🔍 Research Agent #1                    │  │
│  │   ● ● ● ● ◐ ◐ ◐ ○     │  │ └─ Generating Module 7/12 for Jane     │  │
│  │   ○ ○ ○ ○ ○ ○ ○ ○     │  │    "Creating SQL exercises..."         │  │
│  │   ○ ○ ○ ○ ○ ○ ○ ○     │  │                                          │  │
│  │   ○ ○                  │  │ 🧠 Planning Agent #2                    │  │
│  │                        │  │ └─ Structuring course for Mike         │  │
│  │   56% ████████░░░░    │  │    "12 modules, 48 hours total..."     │  │
│  │                        │  │                                          │  │
│  │   ~18 min remaining    │  │ ✅ Just completed: Sarah Wilson        │  │
│  └────────────────────────┘  └──────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### 1. Component Structure
```
src/components/CourseGeneration/
├── BulkGenerationModal.tsx         # Main container
├── OverallProgressPanel.tsx        # Left side - dot grid & progress
├── LiveAgentFeed.tsx              # Right side - real-time updates
├── AgentActivityItem.tsx          # Individual agent status
├── ProgressDot.tsx                # Single employee dot
└── MinimizedView.tsx              # Floating widget when minimized
```

### 2. State Management

#### Create Course Generation Store
```typescript
interface CourseGenerationState {
  jobId: string;
  totalEmployees: number;
  completedEmployees: number;
  activeAgents: AgentActivity[];
  employeeStatuses: EmployeeStatus[];
  estimatedTimeRemaining: number;
  isMinimized: boolean;
}

interface AgentActivity {
  id: string;
  type: 'planning' | 'research';
  employeeName: string;
  employeeId: string;
  currentAction: string;
  detailMessage: string;
  progress: number;
  startTime: Date;
}

interface EmployeeStatus {
  id: string;
  name: string;
  status: 'queued' | 'planning' | 'research' | 'completed' | 'failed';
  progress: number;
}
```

### 3. Real-time Updates Integration

#### WebSocket Connection
```typescript
// Connect to Render API WebSocket for real-time updates
const ws = new WebSocket(`${RENDER_API_URL}/ws/course-generation/${jobId}`);

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  switch (update.type) {
    case 'agent_update':
      updateAgentActivity(update.agentId, update.data);
      break;
    case 'employee_complete':
      markEmployeeComplete(update.employeeId);
      break;
    case 'progress_update':
      updateOverallProgress(update.progress);
      break;
  }
};
```

### 4. Visual Components

#### ProgressDot Component
```typescript
const ProgressDot = ({ status }) => {
  const getColor = () => {
    switch(status) {
      case 'completed': return 'bg-green-500';
      case 'planning': 
      case 'research': return 'bg-blue-500 animate-pulse';
      case 'queued': return 'bg-gray-300';
      case 'failed': return 'bg-red-500';
    }
  };
  
  return <div className={`w-2 h-2 rounded-full ${getColor()}`} />;
};
```

#### AgentActivityItem Component
```typescript
const AgentActivityItem = ({ agent }) => {
  return (
    <div className="mb-4 p-3 border rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        {agent.type === 'planning' ? <Brain /> : <Search />}
        <span className="font-medium">{agent.type} Agent</span>
      </div>
      <div className="text-sm text-gray-600 mb-1">
        └─ {agent.currentAction} for {agent.employeeName}
      </div>
      <div className="text-sm italic text-gray-500">
        "{agent.detailMessage}"
      </div>
    </div>
  );
};
```

### 5. Animation Requirements

1. **Progress Dots**
   - Smooth color transitions when status changes
   - Pulse animation for active items
   - Stagger animation on initial load

2. **Agent Feed**
   - Slide-in animation for new activities
   - Fade-out for completed items
   - Typewriter effect for agent messages

3. **Progress Bar**
   - Smooth incremental updates
   - Liquid fill effect

### 6. API Integration

#### Start Bulk Generation
```typescript
const startBulkGeneration = async (employeeIds: string[]) => {
  const response = await fetch(`${RENDER_API_URL}/generate-courses-bulk`, {
    method: 'POST',
    body: JSON.stringify({ 
      employee_ids: employeeIds,
      company_id: companyId,
      assigned_by_id: userId
    })
  });
  
  const { job_id } = await response.json();
  return job_id;
};
```

### 7. Styling Guidelines

- **Colors**: 
  - Completed: Green (#10b981)
  - Active: Blue (#3b82f6) with pulse
  - Queued: Gray (#d1d5db)
  - Failed: Red (#ef4444)

- **Spacing**: 8px grid system
- **Typography**: Inter font family
- **Shadows**: Subtle shadows for depth
- **Border Radius**: 8px for cards, 4px for small elements

### 8. Performance Optimizations

1. **Virtual Scrolling** for agent feed when > 10 items
2. **Debounced Updates** to prevent UI thrashing
3. **Memoized Components** for dots that don't change
4. **Progressive Rendering** for large employee counts

### 9. Error Handling

- Show failed dots in red
- Display error messages in agent feed
- Retry mechanism for failed generations
- Graceful WebSocket reconnection

### 10. Mobile Responsiveness

- Stack panels vertically on mobile
- Simplified dot grid (fewer per row)
- Collapsible agent feed
- Touch-friendly minimize/expand

## Development Timeline

1. **Week 1**: Core components and state management
2. **Week 2**: WebSocket integration and real-time updates
3. **Week 3**: Animations and polish
4. **Week 4**: Testing and optimization

## Technologies

- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- WebSocket for real-time updates
- Zustand or Context API for state management

This implementation provides a clean, impressive visualization that shows real-time agent activity while maintaining simplicity and performance.