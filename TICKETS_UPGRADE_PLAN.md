# Tickets System Upgrade Plan

## Overview
Extend the existing Demo Requests system to a unified "Tickets" system that handles:
- Demo Requests (existing)
- Contact Sales inquiries
- Early Access signups

## Database Schema Changes

### Option 1: Extend Existing Table (Recommended)
Add a `ticket_type` column to the existing `demo_requests` table and rename it to `tickets`:

```sql
-- Rename table
ALTER TABLE demo_requests RENAME TO tickets;

-- Add ticket_type column
ALTER TABLE tickets 
ADD COLUMN ticket_type TEXT NOT NULL DEFAULT 'demo_request' 
CHECK (ticket_type IN ('demo_request', 'contact_sales', 'early_access'));

-- Add type-specific fields
ALTER TABLE tickets
ADD COLUMN budget_range TEXT,
ADD COLUMN timeline TEXT,
ADD COLUMN use_case TEXT,
ADD COLUMN referral_source TEXT;

-- Create index on ticket_type for performance
CREATE INDEX idx_tickets_type ON tickets(ticket_type);

-- Update existing records
UPDATE tickets SET ticket_type = 'demo_request' WHERE ticket_type IS NULL;
```

### Migration Strategy
1. Create new columns with defaults
2. Backfill existing data
3. Update RLS policies
4. Update edge functions
5. Deploy frontend changes

## Frontend Architecture

### Component Structure
```
Admin Dashboard
├── Tickets.tsx (Main tickets page)
│   ├── TicketsTable.tsx (Unified table)
│   ├── TicketDetailModal.tsx (Detail view)
│   ├── TicketFilters.tsx (Enhanced filters)
│   └── TicketStats.tsx (Statistics by type)
└── Public Forms
    ├── DemoModal.tsx (existing)
    ├── ContactSalesModal.tsx (update to save)
    └── WaitlistModal.tsx (update to save)
```

## Wireframes

### 1. Unified Tickets Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Tickets                                              Export ▼│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Total       │ │ Demo        │ │ Contact     │          │
│  │ 157         │ │ Requests    │ │ Sales       │          │
│  │ +12% ↑      │ │ 89          │ │ 45          │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐                                           │
│  │ Early       │                                           │
│  │ Access      │                                           │
│  │ 23          │                                           │
│  └─────────────┘                                           │
│                                                             │
│  Filters: [All Types ▼] [All Status ▼] [Search...]         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Type │ Name │ Company │ Status │ Date │ Actions     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🎯  │ John │ Acme Co │ New    │ 2h   │ View        │   │
│  │ 💰  │ Jane │ Tech Inc│ Contacted│ 1d │ View        │   │
│  │ 🚀  │ Bob  │ StartupX│ New    │ 3d   │ View        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Legend: 🎯 Demo Request | 💰 Contact Sales | 🚀 Early Access
```

### 2. Enhanced Detail Modal
```
┌─────────────────────────────────────────────────────────────┐
│  Ticket Details                                         X   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Type: [Demo Request ▼]    Status: [New ▼]                 │
│                                                             │
│  ┌─────────────────────────┬─────────────────────────┐     │
│  │ Contact Information     │ Request Details          │     │
│  ├─────────────────────────┼─────────────────────────┤     │
│  │ Name: John Doe         │ Company Size: 50-200     │     │
│  │ Email: john@acme.com   │ Timeline: Q2 2024        │     │
│  │ Company: Acme Corp     │ Budget: $50-100k         │     │
│  │ Role: CTO              │ Use Case: Team training   │     │
│  └─────────────────────────┴─────────────────────────┘     │
│                                                             │
│  Message/Notes:                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Looking for a solution to train our remote team...  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Internal Notes:                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Add notes here...                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancel]                                    [Save Changes] │
└─────────────────────────────────────────────────────────────┘
```

### 3. Type-Specific Filters
```
┌─────────────────────────────────────────────────────────────┐
│  Filter Tickets                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Ticket Type:                                               │
│  ☑ Demo Requests                                            │
│  ☑ Contact Sales                                            │
│  ☑ Early Access                                             │
│                                                             │
│  Status:                                                    │
│  ☑ New                                                      │
│  ☑ Contacted                                                │
│  ☐ Qualified                                                │
│  ☐ Converted                                                │
│  ☐ Rejected                                                 │
│                                                             │
│  Date Range: [Last 30 days ▼]                              │
│                                                             │
│  [Clear Filters]                              [Apply]       │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Phase 1: Database Migration (Week 1)
1. Create migration script to add new columns
2. Update RLS policies for tickets table
3. Create new edge functions for contact sales and early access
4. Test migration on staging environment

### Phase 2: Backend Services (Week 1-2)
1. Update `demoRequestService.ts` to `ticketService.ts`
2. Add type-specific validation logic
3. Update edge functions to handle all ticket types
4. Add new API endpoints for ticket operations

### Phase 3: Frontend Components (Week 2-3)
1. Create generic `TicketsTable` component
2. Update detail modal to handle all ticket types
3. Add type-specific form fields
4. Implement enhanced filtering

### Phase 4: Integration (Week 3-4)
1. Connect ContactSalesModal to backend
2. Connect WaitlistModal to backend
3. Update admin navigation and routing
4. Add analytics and reporting

### Phase 5: Testing & Deployment (Week 4)
1. Comprehensive testing of all ticket types
2. Data migration for production
3. Gradual rollout with feature flags
4. Monitor and optimize performance

## Benefits of This Approach

1. **Reuses Existing Infrastructure**
   - Minimal database changes
   - Leverages existing RLS policies
   - Uses current UI patterns

2. **Unified Management**
   - Single dashboard for all inquiries
   - Consistent workflow across types
   - Better overview of customer interest

3. **Scalability**
   - Easy to add new ticket types
   - Flexible field structure
   - Performance optimized with indexes

4. **User Experience**
   - Familiar interface for admins
   - Consistent status management
   - Enhanced filtering and search

## Risk Mitigation

1. **Data Migration**: Test thoroughly on staging
2. **Performance**: Add appropriate indexes
3. **Backwards Compatibility**: Keep old endpoints temporarily
4. **User Training**: Create documentation for new features