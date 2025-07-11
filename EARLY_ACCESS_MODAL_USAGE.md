# Early Access Modal Usage Guide

## Overview
The shared early access modal has been added to App.tsx following the same pattern as the demo modal. This allows any component to trigger a centralized early access form modal.

## Implementation Details

### State Management in App.tsx
```tsx
// Global early access modal state
const [earlyAccessModalOpen, setEarlyAccessModalOpen] = useState(false);
const [earlyAccessModalSource, setEarlyAccessModalSource] = useState("");
const [earlyAccessFormData, setEarlyAccessFormData] = useState({
  email: '',
  name: ''
});
const [earlyAccessLoading, setEarlyAccessLoading] = useState(false);
```

### Opening the Modal
The `openEarlyAccessModal` function is passed down to components:
```tsx
const openEarlyAccessModal = (source: string) => {
  setEarlyAccessModalSource(source);
  setEarlyAccessModalOpen(true);
};
```

### Modal Features
- Auto-saves form progress to localStorage
- Focus management (auto-focuses email field, then name field)
- Email validation
- Full name validation
- Calls the `capture-email` Supabase function
- Shows toast notifications on success/error
- Clears form data on successful submission

## How to Use in Components

### 1. Update Component Props Interface
```tsx
interface YourComponentProps {
  openDemoModal?: (source: string) => void;
  openEarlyAccessModal?: (source: string) => void; // Add this
}
```

### 2. Accept the Prop
```tsx
const YourComponent = ({ openDemoModal, openEarlyAccessModal }: YourComponentProps) => {
  // Component logic
};
```

### 3. Replace SmartEmailCapture with a Button
Instead of using `<SmartEmailCapture>`, use a button that calls the modal:
```tsx
<Button 
  onClick={() => openEarlyAccessModal?.('your_source_identifier')}
  className="bg-future-green text-business-black hover:bg-future-green/90"
>
  Get Early Access
</Button>
```

### 4. Pass the Prop in App.tsx Routes
Make sure the route passes the `openEarlyAccessModal` prop:
```tsx
<Route 
  path="/your-path" 
  element={<YourComponent openEarlyAccessModal={openEarlyAccessModal} />} 
/>
```

## Components That Need Updates
The following components currently use SmartEmailCapture and should be updated to use the shared modal:
- HeroSection
- MobileHeroSection  
- TransformationStartsSection
- EarlyAccessSignup page
- EarlyAccessLogin page
- MobilePricingCards

## Benefits
1. **Consistent UX**: All early access forms behave identically
2. **Centralized Logic**: Form validation and submission logic in one place
3. **Better Performance**: No need to load form logic in multiple components
4. **Easier Maintenance**: Updates to the form only need to be made in App.tsx
5. **Portal Rendering**: Modal renders via React Portal, avoiding z-index issues

## Migration Example
Before:
```tsx
<SmartEmailCapture 
  source="hero_section"
  buttonText="Get Early Access"
  onSuccess={handleEmailSuccess}
/>
```

After:
```tsx
<Button 
  onClick={() => openEarlyAccessModal?.('hero_section')}
  className="bg-future-green text-business-black hover:bg-future-green/90"
>
  Get Early Access
</Button>
```