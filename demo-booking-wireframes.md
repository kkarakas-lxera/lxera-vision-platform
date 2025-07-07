# Demo Booking Flow - Smart Progressive Form Wireframes

## Overview
This document illustrates the progressive disclosure pattern for the demo booking modal, showing each state of the user journey.

---

## State 1: Initial View (Email Only)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │            🚀 See Your ROI in 15 Minutes              │ │
│  │                                                       │ │
│  │         Join 500+ companies saving 40% on             │ │
│  │              L&D costs with LXERA                     │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  [Company logos: Microsoft, Google, Amazon, Meta]   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Work Email *                                        │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  your.email@company.com                      │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │         ┌──────────────────────────┐              │  │
│  │         │   Get Started →         │              │  │
│  │         └──────────────────────────┘              │  │
│  │                                                     │  │
│  │  🔒 No credit card required • 15-min demo         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ⭐⭐⭐⭐⭐ 4.8/5 on G2 (127 reviews)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## State 2: Expanded View (After Email Entry)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │            🚀 See Your ROI in 15 Minutes              │ │
│  │                                                       │ │
│  │         Join 500+ companies saving 40% on             │ │
│  │              L&D costs with LXERA                     │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Progress: ●●●○○  Step 1 of 2                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Work Email *                                        │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  john.doe@acmecorp.com              ✓       │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │  ┌───────────────────┐  ┌────────────────────┐   │  │
│  │  │ First Name *      │  │ Company *          │   │  │
│  │  │ ┌───────────────┐ │  │ ┌────────────────┐ │   │  │
│  │  │ │ John          │ │  │ │ Acme Corp      │ │   │  │
│  │  │ └───────────────┘ │  │ └────────────────┘ │   │  │
│  │  └───────────────────┘  └────────────────────┘   │  │
│  │                                                     │  │
│  │  ▼ Add more details (optional)                     │  │
│  │                                                     │  │
│  │         ┌──────────────────────────┐              │  │
│  │         │   Continue →             │              │  │
│  │         └──────────────────────────┘              │  │
│  │                                                     │  │
│  │  🎁 Get our Skills Gap Guide after booking        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ⚡ Only 3 demo slots left this week                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## State 3: Optional Fields Expanded

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Progress: ●●●○○  Step 1 of 2                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  [Previous fields remain visible]                    │  │
│  │                                                     │  │
│  │  ▼ Add more details (optional)                     │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  Last Name                                   │ │  │
│  │  │  ┌─────────────────────────────────────┐   │ │  │
│  │  │  │ Doe                                  │   │ │  │
│  │  │  └─────────────────────────────────────┘   │ │  │
│  │  │                                             │ │  │
│  │  │  ┌──────────────────┐  ┌─────────────────┐│ │  │
│  │  │  │ Company Size     │  │ Country         ││ │  │
│  │  │  │ ┌──────────────┐ │  │ ┌─────────────┐ ││ │  │
│  │  │  │ │ 201-500  ▼  │ │  │ │ USA 🇺🇸 (auto)││ │  │
│  │  │  │ └──────────────┘ │  │ └─────────────┘ ││ │  │
│  │  │  └──────────────────┘  └─────────────────┘│ │  │
│  │  │                                             │ │  │
│  │  │  Phone Number          Job Title           │ │  │
│  │  │  ┌──────────────┐     ┌─────────────────┐ │ │  │
│  │  │  │              │     │ L&D Manager     │ │ │  │
│  │  │  └──────────────┘     └─────────────────┘ │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │                                                     │  │
│  │         ┌──────────────────────────┐              │  │
│  │         │   Book Your Demo →       │              │  │
│  │         └──────────────────────────┘              │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## State 4: Calendar Selection (Auto-transition)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         ✓ Great! Now pick your preferred time         │ │
│  │                                                       │ │
│  │      Your personalized demo will focus on:            │ │
│  │      • Skills gap analysis for 201-500 employees      │ │
│  │      • ROI calculation for your organization          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Progress: ●●●●●  Step 2 of 2                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                  Select a Date                       │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  < November 2024 >                          │   │  │
│  │  │  Mo Tu We Th Fr                             │   │  │
│  │  │  13 14 15 16 17                             │   │  │
│  │  │  🟢 🟢 🔴 🟢 🟡                             │   │  │
│  │  │  20 21 22 23 24                             │   │  │
│  │  │  🟢 🟢 🟢 🔴 🔴                             │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │  Available Times (Tue, Nov 14)                     │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │  │
│  │  │ 9:00am │ │10:00am │ │ 2:00pm │ │ 3:00pm │    │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘    │  │
│  │                                                     │  │
│  │  Time Zone: PST (detected) [change]               │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  💡 Demo includes: Custom ROI report • Implementation plan  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## State 5: Confirmation

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                    🎉 You're All Set!                 │ │
│  │                                                       │ │
│  │         Demo scheduled for Nov 14 at 10:00am PST      │ │
│  │              with Sarah Chen, L&D Expert              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  ✓ Calendar invite sent to john.doe@acmecorp.com    │  │
│  │  ✓ Skills Gap Analysis Guide sent                   │  │
│  │  ✓ Custom ROI calculator link in your inbox         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              What to expect:                         │  │
│  │                                                      │  │
│  │  1️⃣  Quick discovery (5 min)                        │  │
│  │  2️⃣  Live platform demo (8 min)                     │  │
│  │  3️⃣  Your custom ROI analysis (2 min)               │  │
│  │                                                      │  │
│  │  📧 Questions? Reply to the confirmation email       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│         ┌──────────────────────────┐                       │
│         │    Close               │                       │
│         └──────────────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Design Principles Applied:

### 1. **Progressive Disclosure**
- Start with minimal friction (email only)
- Expand to show essential fields after engagement
- Optional fields hidden by default

### 2. **Smart Defaults & Auto-Detection**
- Company name extracted from email domain
- Country auto-detected from IP
- Company size suggested based on domain analysis

### 3. **Visual Hierarchy**
- Clear primary action at each step
- Progress indicators show journey
- Trust signals and urgency placed strategically

### 4. **Psychological Triggers**
- Social proof (logos, reviews)
- Scarcity (limited slots)
- Reciprocity (free guide)
- Authority (expert assignment)

### 5. **Reduced Cognitive Load**
- Maximum 3-4 fields visible at once
- Clear value proposition throughout
- Immediate value delivery (ROI focus)

### 6. **Mobile Responsive Considerations**
- Large touch targets (minimum 44px)
- Single column layout
- Minimal scrolling required
- Native date/time pickers on mobile

This flow reduces the perceived effort while maintaining lead quality through smart progressive disclosure and value-focused messaging.