# Mobile Skills Gap Visualization Components

This directory contains mobile-optimized components for visualizing and analyzing skills gaps in your organization. The components are designed specifically for touch interfaces and small screens.

## Components Overview

### Core Components

#### `MobileSkillsGapCard`
Individual skill gap visualization with expandable details.
- **Features**: Touch-friendly expansion, severity indicators, impact analysis
- **Props**: `gap`, `totalEmployees`, `isExpanded`, `onToggleExpand`, `rank`
- **Use Case**: Displaying individual skill gaps in lists

#### `MobilePositionSkillsChart`
Position-specific skills analysis with mobile-friendly charts.
- **Features**: Simplified charts, progress indicators, key metrics
- **Props**: `analysis`, `onViewDetails`, `isCompact`
- **Use Case**: Showing skills coverage for specific positions

#### `MobilePositionSkillsCarousel`
Swipeable carousel for browsing multiple positions.
- **Features**: Touch gestures, pagination dots, smooth transitions
- **Props**: `positions`, `onPositionSelect`, `className`
- **Use Case**: Navigation between different position analyses

#### `MobileProgressBar`
Touch-friendly progress visualization with visual indicators.
- **Features**: Color-coded progress, touch indicators, responsive sizing
- **Props**: `value`, `max`, `label`, `size`, `variant`, `showValue`, `animated`
- **Use Case**: Showing skill levels, completion rates, progress

#### `MobileEmptyState`
Mobile-optimized empty states for different scenarios.
- **Features**: Context-aware messages, action buttons, helpful guidance
- **Props**: `type`, `title`, `description`, `action`, `className`
- **Use Case**: No data states, loading states, error states

### Composite Components

#### `MobileSkillsGapOverview`
Complete skills gap analysis overview for mobile.
- **Features**: Key metrics, position carousel, filterable gap list
- **Props**: `positions`, `topSkillGaps`, `totalEmployees`, `analyzedEmployees`, `onExportReport`, `onPositionSelect`
- **Use Case**: Main dashboard view for skills gap analysis

#### `MobileSkillsGapDetail`
Detailed view for individual position analysis.
- **Features**: Tabbed interface, recommendations, progress tracking
- **Props**: `position`, `onBack`, `onStartTraining`, `onShareReport`
- **Use Case**: Drill-down analysis for specific positions

#### `MobileSkillsGapShowcase`
Demonstration component showing all mobile features.
- **Features**: Interactive demo, view switching, mock data
- **Props**: `initialView`, `showControls`
- **Use Case**: Testing, documentation, component showcase

## Key Features

### Touch-Friendly Design
- **Large Touch Targets**: All interactive elements are at least 44px for easy tapping
- **Swipe Gestures**: Carousel components support natural swipe navigation
- **Visual Feedback**: Active states and animations provide clear user feedback

### Responsive Layout
- **Flexible Grids**: Components adapt to different screen sizes
- **Optimized Typography**: Text sizes and spacing optimized for mobile reading
- **Accessible Colors**: High contrast ratios for better visibility

### Performance Optimized
- **Lazy Loading**: Components load efficiently with minimal overhead
- **Smooth Animations**: 60fps animations with hardware acceleration
- **Memory Efficient**: Optimized rendering for mobile devices

### Data Visualization
- **Simplified Charts**: Complex data presented in digestible mobile formats
- **Color Coding**: Intuitive color schemes for different severity levels
- **Progressive Disclosure**: Expandable sections for detailed information

## Usage Examples

### Basic Skills Gap Overview
```tsx
import { MobileSkillsGapOverview } from '@/components/mobile/company';

<MobileSkillsGapOverview
  positions={positionAnalyses}
  topSkillGaps={skillGaps}
  totalEmployees={100}
  analyzedEmployees={85}
  onExportReport={() => handleExport()}
  onPositionSelect={(position) => navigateToDetail(position)}
/>
```

### Individual Skill Gap Card
```tsx
import { MobileSkillsGapCard } from '@/components/mobile/company';

<MobileSkillsGapCard
  gap={skillGap}
  totalEmployees={50}
  rank={1}
  isExpanded={expanded}
  onToggleExpand={() => setExpanded(!expanded)}
/>
```

### Position Carousel
```tsx
import { MobilePositionSkillsCarousel } from '@/components/mobile/company';

<MobilePositionSkillsCarousel
  positions={positions}
  onPositionSelect={(position) => handleSelection(position)}
/>
```

### Custom Progress Bar
```tsx
import { MobileProgressBar } from '@/components/mobile/company';

<MobileProgressBar
  value={75}
  label="Skills Match"
  size="lg"
  variant="success"
  animated={true}
/>
```

## Integration with Existing Components

The mobile components are designed to work seamlessly with the existing `SkillsGapAnalysis` component:

```tsx
// In SkillsGapAnalysis.tsx
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

// Conditional rendering
if (isMobile) {
  return <MobileSkillsGapOverview {...mobileProps} />;
}
return <DesktopSkillsGapAnalysis {...desktopProps} />;
```

## Customization

### Theming
Components inherit theme colors and can be customized via CSS variables:
```css
:root {
  --mobile-primary: #3b82f6;
  --mobile-success: #10b981;
  --mobile-warning: #f59e0b;
  --mobile-danger: #ef4444;
}
```

### Responsive Breakpoints
- **Mobile**: < 768px (default mobile view)
- **Tablet**: 768px - 1024px (hybrid layout)
- **Desktop**: > 1024px (desktop components)

## Accessibility

All components follow mobile accessibility best practices:
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Touch Accessibility**: Minimum 44px touch targets
- **High Contrast**: WCAG AA compliant color ratios
- **Focus Management**: Logical tab order and focus indicators

## Browser Support

- **iOS Safari**: 12+
- **Chrome Mobile**: 70+
- **Firefox Mobile**: 68+
- **Samsung Internet**: 10+
- **UC Browser**: Latest

## Dependencies

- React 18+
- Lucide React (icons)
- Tailwind CSS (styling)
- Radix UI (base components)
- TypeScript (type safety)