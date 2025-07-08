# Mobile Admin Features Documentation

This document outlines the mobile-specific features and optimizations implemented for the admin dashboard.

## Components Overview

### 1. MobileAdminHeader
A collapsible header that hides on scroll for better content visibility.

```tsx
import { MobileAdminHeader } from '@/components/admin/MobileAdminHeader';

<MobileAdminHeader
  title="Page Title"
  onMenuClick={() => setMenuOpen(true)}
  showBackButton={true}
  onBackClick={() => router.back()}
  actions={<Button>Action</Button>}
/>
```

### 2. MobileActionSheet
iOS-style action sheet for mobile-friendly menus.

```tsx
import { MobileActionSheet, ActionItem } from '@/components/admin/MobileActionSheet';

const actions: ActionItem[] = [
  {
    id: 'edit',
    label: 'Edit',
    icon: <Edit className="h-4 w-4" />,
    onClick: () => console.log('Edit')
  }
];

<MobileActionSheet
  open={isOpen}
  onOpenChange={setIsOpen}
  actions={actions}
  title="Choose Action"
/>
```

### 3. ResponsiveModal
Automatically switches between modal (desktop) and bottom sheet (mobile).

```tsx
import { ResponsiveModal } from '@/components/ui/responsive-modal';

<ResponsiveModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Form Title"
  fullScreenOnMobile={true}
>
  <form>...</form>
</ResponsiveModal>
```

### 4. Mobile Skeletons
Optimized loading states for mobile views.

```tsx
import { 
  MobileListSkeleton,
  MobileCardSkeleton,
  MobileFormSkeleton,
  MobileTableSkeleton,
  MobileStatsSkeleton 
} from '@/components/admin/MobileSkeletons';

{isLoading ? <MobileListSkeleton /> : <YourContent />}
```

### 5. Offline/Sync Indicators
Real-time connection status and sync state indicators.

```tsx
import { OfflineIndicator } from '@/components/admin/OfflineIndicator';
import { SyncIndicator } from '@/components/admin/SyncIndicator';

<OfflineIndicator />
<SyncIndicator onSync={handleSync} />
```

## Hooks

### 1. useSwipeGesture
Adds swipe gesture support to any element.

```tsx
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

const ref = useRef<HTMLDivElement>(null);

useSwipeGesture(ref, {
  onSwipeLeft: () => console.log('Swiped left'),
  onSwipeRight: () => console.log('Swiped right'),
  onSwipeDown: () => closeModal(),
  threshold: 50
});
```

### 2. useHapticFeedback
Provides haptic feedback on iOS devices.

```tsx
import { useHapticFeedback, useHapticButton } from '@/hooks/useHapticFeedback';

const { impactOccurred, notificationOccurred } = useHapticFeedback();
const { onClick } = useHapticButton();

// On button press
<Button onClick={onClick(() => handleAction())}>Press Me</Button>

// On success/error
notificationOccurred('success');
notificationOccurred('error');
```

### 3. useOfflineDetection
Monitors network connectivity and provides offline state.

```tsx
import { useOfflineDetection, useSyncStatus } from '@/hooks/useOfflineDetection';

const { isOnline, wasOffline, retry } = useOfflineDetection({
  onOnline: () => console.log('Back online'),
  onOffline: () => console.log('Went offline')
});

const { isSyncing, startSync } = useSyncStatus();
```

## Integration Example

See `/src/components/admin/MobileAdminExample.tsx` for a complete implementation example.

## Best Practices

1. **Always use ResponsiveModal** instead of regular dialogs for forms
2. **Add haptic feedback** to interactive elements on iOS
3. **Show offline indicators** when network connectivity is important
4. **Use mobile skeletons** for loading states instead of spinners
5. **Implement swipe gestures** for natural interactions (close modals, navigate)
6. **Test on real devices** to ensure smooth performance

## CSS Utilities

The Tailwind config has been extended with safe area utilities:

```css
/* Padding for iOS safe areas */
.pb-safe /* Bottom safe area */
.pt-safe-top /* Top safe area */
.pl-safe-left /* Left safe area */
.pr-safe-right /* Right safe area */

/* For animations */
.active:scale-98 /* Pressed state */
.animate-in /* Animation entrance */
.slide-in-from-bottom /* Slide animation */
```