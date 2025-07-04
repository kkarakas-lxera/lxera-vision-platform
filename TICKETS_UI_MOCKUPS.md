# Tickets System UI Mockups

## Admin Navigation Update

### Before:
```
├── Dashboard
├── Demo Requests  ← Current
├── Companies
└── Users
```

### After:
```
├── Dashboard
├── Tickets        ← New unified section
│   ├── All Tickets
│   ├── Demo Requests
│   ├── Contact Sales
│   └── Early Access
├── Companies
└── Users
```

## Tickets Dashboard Components

### 1. Stats Cards with Icons
```
┌───────────────────────────────────────────────────────┐
│                    TICKET STATISTICS                     │
├───────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│ │    📨     │ │    🎯     │ │    💰     │ │    🚀     │ │
│ │   Total    │ │   Demo     │ │  Contact   │ │   Early    │ │
│ │   157      │ │ Requests   │ │   Sales    │ │  Access    │ │
│ │  +12% ↑    │ │    89      │ │    45      │ │    23      │ │
│ │            │ │  56.7%     │ │  28.7%     │ │  14.6%     │ │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
└───────────────────────────────────────────────────────┘
```

### 2. Enhanced Table View
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Tickets                                                        [Export CSV ▼] │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ [🔍 Search by name, email, company...]  [All Types ▼] [All Status ▼] [📅 Date] │
│                                                                               │
├─┬─────┬───────────────┬──────────────┬───────────┬────────────┬──────────┤
│#│Type │Name           │Company       │Status     │Submitted   │Actions   │
├─┼─────┼───────────────┼──────────────┼───────────┼────────────┼──────────┤
│1│🎯   │John Doe       │Acme Corp     │🔵 New     │2 hours ago │[👁] [📧]  │
│2│💰   │Jane Smith     │Tech Inc      │🟡 Contact │1 day ago   │[👁] [📧]  │
│3│🚀   │Bob Johnson    │StartupX      │🔵 New     │3 days ago  │[👁] [📧]  │
│4│🎯   │Alice Brown    │BigCo         │🟢 Qualify │5 days ago  │[👁] [📧]  │
│5│💰   │Charlie Davis  │MediumBiz     │🟣 Convert │1 week ago  │[👁] [📧]  │
└─┴─────┴───────────────┴──────────────┴───────────┴────────────┴──────────┘
│ Showing 1-5 of 157 tickets                              [<] [1] 2 3 ... [>]  │
└────────────────────────────────────────────────────────────────────────────┘

Legend:
🎯 = Demo Request | 💰 = Contact Sales | 🚀 = Early Access
🔵 = New | 🟡 = Contacted | 🟢 = Qualified | 🟣 = Converted | 🔴 = Rejected
```

### 3. Mobile Responsive Card View
```
┌─────────────────────────────────────────┐
│ Tickets (Mobile View)                      │
├─────────────────────────────────────────┤
│ [🔍 Search...]  [🎯💰🚀] [🔵 Status]        │
├─────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ 🎯 Demo Request        🔵 New       │   │
│ │ John Doe                          │   │
│ │ john@acme.com                     │   │
│ │ Acme Corp | CTO                   │   │
│ │ 2 hours ago                       │   │
│ │ [View Details]                    │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ 💰 Contact Sales      🟡 Contacted   │   │
│ │ Jane Smith                        │   │
│ │ jane@tech.com                     │   │
│ │ Tech Inc | VP Sales               │   │
│ │ 1 day ago                         │   │
│ │ [View Details]                    │   │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 4. Quick Actions Menu
```
┌───────────────────────────────┐
│ Quick Actions for Selected    │
├───────────────────────────────┤
│ ☐ Bulk Update Status         │
│ ☐ Assign to Team Member      │
│ ☐ Add Tags                   │
│ ☐ Export Selected            │
│ ☐ Send Follow-up Email       │
└───────────────────────────────┘
```

## Status Workflow Visualization

```
    NEW          CONTACTED      QUALIFIED      CONVERTED
     🔵    →      🟡      →      🟢      →      🟣
                    ↘                ↘
                      ↘                ↘
                        ↘                ↘
                          ↘                ↘
                           REJECTED 🔴
```

## Color Scheme

- **Ticket Types**:
  - Demo Request: `#3B82F6` (Blue)
  - Contact Sales: `#10B981` (Green)
  - Early Access: `#8B5CF6` (Purple)

- **Status Colors**:
  - New: `#3B82F6` (Blue)
  - Contacted: `#F59E0B` (Amber)
  - Qualified: `#10B981` (Green)
  - Converted: `#8B5CF6` (Purple)
  - Rejected: `#EF4444` (Red)

## Responsive Behavior

- **Desktop**: Full table view with all columns
- **Tablet**: Condensed table with key columns
- **Mobile**: Card-based layout for easy scrolling

## Key Features

1. **Type Indicators**: Visual icons for quick identification
2. **Status Badges**: Color-coded for quick scanning
3. **Bulk Actions**: Select multiple tickets for batch operations
4. **Smart Filters**: Remember user preferences
5. **Export Options**: CSV, PDF, or API integration
6. **Real-time Updates**: WebSocket for live status changes
7. **Search**: Full-text search across all fields
8. **Sorting**: Click column headers to sort
9. **Pagination**: Load more as needed
10. **Mobile Optimized**: Touch-friendly interface