# Mobile Components Directory Structure

This directory contains all mobile-specific components for the LXERA Vision Platform dashboards.

## Directory Structure

```
mobile/
├── admin/           # Admin dashboard specific mobile components
├── learner/         # Learner dashboard specific mobile components
├── company/         # Company dashboard specific mobile components
├── shared/          # Shared mobile components used across dashboards
├── navigation/      # Mobile navigation components (bottom nav, drawers)
├── tables/          # Responsive table components
├── cards/           # Mobile card components for list views
├── modals/          # Mobile-optimized modals and bottom sheets
├── indicators/      # Status indicators (offline, sync, etc.)
├── skeletons/       # Loading skeleton components
└── index.ts         # Central export file
```

## Component Categories

### Navigation (`/navigation`)
- `MobileAdminNavigation` - Bottom navigation for admin dashboard
- Future: `MobileLearnerNavigation`, `MobileCompanyNavigation`

### Admin Components (`/admin`)
- `MobileAdminHeader` - Collapsible header for admin pages
- `MobileStatsCarousel` - Swipeable stats cards

### Cards (`/cards`)
Mobile-optimized card components for displaying data:
- `MobileTicketCard` - Ticket display with swipe actions
- `MobileUserCard` - User information card
- `MobileCompanyCard` - Company overview card
- `MobileDemoRequestCard` - Demo request card

### Tables (`/tables`)
- `ResponsiveTable` - Generic responsive table that switches to cards on mobile

### Shared Components (`/shared`)
- `MobileActionSheet` - iOS-style action sheet for mobile menus

### Modals (`/modals`)
- `ResponsiveModal` - Modal that adapts to mobile (full-screen/bottom sheet)

### Indicators (`/indicators`)
- `OfflineIndicator` - Shows network connectivity status
- `SyncIndicator` - Displays sync status and timestamps

### Skeletons (`/skeletons`)
Loading states optimized for mobile:
- `MobileListSkeleton`
- `MobileCardSkeleton`
- `MobileFormSkeleton`
- `MobileTableSkeleton`
- `MobileStatsSkeleton`

## Usage Example

```tsx
import { 
  MobileAdminNavigation,
  MobileStatsCarousel,
  ResponsiveTable,
  MobileUserCard 
} from '@/components/mobile';

// Or import individually
import { MobileAdminNavigation } from '@/components/mobile/navigation/MobileAdminNavigation';
```

## Mobile Design Principles

1. **Touch Targets**: Minimum 48px height for all interactive elements
2. **Gestures**: Support swipe actions where appropriate
3. **Performance**: Optimize animations and loading states
4. **Responsive**: Automatic switching between mobile and desktop views
5. **Platform-Specific**: Consider iOS and Android design patterns

## Adding New Mobile Components

When adding new mobile components:
1. Place in the appropriate subdirectory
2. Export from `index.ts`
3. Follow existing naming conventions (Mobile prefix for mobile-specific)
4. Ensure touch targets are at least 48px
5. Test on both iOS and Android devices