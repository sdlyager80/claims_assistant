# Component Architecture - Bloom Claims Assistant

This document provides a visual map of the component structure and data flow in the Claims Portal.

## Application Hierarchy

```
App.jsx
├── DxcApplicationLayout
│   ├── Header
│   │   ├── DxcFlex (Logo + Title + User Info)
│   │   └── Branding Elements
│   │
│   ├── SideNav
│   │   └── Navigation Links
│   │       ├── Dashboard
│   │       ├── Submissions
│   │       ├── New Submission (Intake)
│   │       ├── Quotes
│   │       └── Renewals and Servicing
│   │
│   └── Main Content
│       ├── Dashboard (default view)
│       ├── ClaimsWorkbench (claim detail view)
│       └── IntakeForms (new claim submission)
```

## Dashboard Component Structure

```
Dashboard.jsx
├── Container (DxcFlex column)
│   ├── Header Section
│   │   └── Title (h1)
│   │
│   ├── Metrics Section (DxcFlex row, wrap)
│   │   ├── MetricCard 1 (DxcCard)
│   │   │   ├── Title (WRITTEN PREMIUM YTD)
│   │   │   ├── Value ($24.8M)
│   │   │   └── Change (+18% vs last year)
│   │   │
│   │   ├── MetricCard 2 (DxcCard)
│   │   │   ├── Title (PENDING REVIEW)
│   │   │   ├── Value (7)
│   │   │   └── Change (3 closing today)
│   │   │
│   │   ├── MetricCard 3 (DxcCard)
│   │   │   ├── Title (APPROVED THIS MONTH)
│   │   │   ├── Value (42)
│   │   │   └── Change (87% approval rate)
│   │   │
│   │   └── MetricCard 4 (DxcCard)
│   │       ├── Title (DECLINED THIS MONTH)
│   │       ├── Value (7)
│   │       └── Change (13% decline rate)
│   │
│   └── My Priorities Section
│       ├── Section Header (h2)
│       │
│       ├── Navigation Tabs (DxcNavTabs)
│       │   ├── Submissions/New Business
│       │   ├── Quotes
│       │   └── Renewals and Servicing
│       │
│       ├── Search Bar (DxcTextInput)
│       │
│       ├── Claims Table (DxcTable)
│       │   ├── Header Row
│       │   │   ├── ID
│       │   │   ├── Name
│       │   │   ├── Status
│       │   │   ├── Type
│       │   │   ├── Submitted
│       │   │   ├── Received
│       │   │   ├── Effective
│       │   │   └── Actions
│       │   │
│       │   └── Data Rows (5 claims)
│       │       ├── Claim ID (link)
│       │       ├── Name
│       │       ├── Status Badge (DxcBadge)
│       │       ├── Type
│       │       ├── Dates
│       │       └── View Button (DxcButton)
│       │
│       └── Pagination Info
```

## ClaimsWorkbench Component Structure

```
ClaimsWorkbench.jsx
├── Container (DxcFlex column)
│   ├── Header Section (DxcFlex row, space-between)
│   │   ├── Left: Claim Title + Status
│   │   │   ├── Title (Claim ID + Name)
│   │   │   └── Status Badge (DxcBadge)
│   │   │
│   │   └── Right: Action Buttons (DxcFlex row)
│   │       ├── Hold Button (DxcButton secondary)
│   │       ├── Approve Button (DxcButton success)
│   │       └── Deny Button (DxcButton error)
│   │
│   ├── Progress Card (DxcCard)
│   │   ├── Title (Claim Progress)
│   │   ├── Progress Bar (DxcProgressBar) - 60%
│   │   └── Metrics (DxcFlex row)
│   │       ├── SLA Days Remaining: 8
│   │       ├── Target Close Date: 01/15/2026
│   │       └── FastTrack Eligible: Yes
│   │
│   ├── Tab Navigation (DxcTabs)
│   │   ├── Timeline Tab
│   │   ├── Policy 360 Tab
│   │   ├── Requirements Tab
│   │   └── Documents Tab
│   │
│   └── Tab Content
│       │
│       ├── [Timeline Tab Content] (if activeTab === 0)
│       │   └── Timeline Card (DxcCard)
│       │       ├── Section Title
│       │       └── Timeline Events (custom component)
│       │           ├── Event 1: Claim Received
│       │           ├── Event 2: Death Verification
│       │           ├── Event 3: Requirements Generated
│       │           └── Event 4: Assigned to Examiner
│       │
│       ├── [Policy 360 Tab Content] (if activeTab === 1)
│       │   ├── Policy Details Card (DxcCard)
│       │   │   ├── Policy Number
│       │   │   ├── Insured Name
│       │   │   ├── Policy Type
│       │   │   └── Coverage Amount
│       │   │
│       │   └── Beneficiaries Card (DxcCard)
│       │       └── Beneficiaries Table (DxcTable)
│       │           ├── Jane Smith - Spouse - 60% - $300,000
│       │           └── Michael Smith - Son - 40% - $200,000
│       │
│       ├── [Requirements Tab Content] (if activeTab === 2)
│       │   └── Requirements Card (DxcCard)
│       │       └── Requirements Table (DxcTable)
│       │           ├── Death Certificate (Received)
│       │           ├── Beneficiary ID (Received)
│       │           ├── Claim Form (Received)
│       │           ├── Policy Verification (Pending)
│       │           └── Fraud Check (In Progress)
│       │
│       └── [Documents Tab Content] (if activeTab === 3)
│           └── Documents Card (DxcCard)
│               └── Accordion (DxcAccordion)
│                   ├── Death Certificate
│                   ├── Beneficiary ID
│                   └── Claim Form
```

## IntakeForms Component Structure

```
IntakeForms.jsx
├── Container (DxcFlex column)
│   ├── Header Section
│   │   ├── Title (New Claim Submission)
│   │   └── Subtitle (FNOL description)
│   │
│   ├── Success Alert (if submitted)
│   │   └── DxcAlert (success)
│   │
│   ├── Form Card (DxcCard)
│   │   ├── Progress Indicator
│   │   │   └── DxcProgressBar (Step X of 3)
│   │   │
│   │   ├── Step Content
│   │   │   │
│   │   │   ├── [Step 1: Claim Information] (if step === 1)
│   │   │   │   ├── Section Title
│   │   │   │   ├── Claim Type (DxcRadioGroup)
│   │   │   │   ├── Policy Number (DxcTextInput)
│   │   │   │   ├── Insured Name (DxcTextInput)
│   │   │   │   ├── Date of Death (DxcDateInput)
│   │   │   │   └── Description (DxcTextarea)
│   │   │   │
│   │   │   ├── [Step 2: Claimant Information] (if step === 2)
│   │   │   │   ├── Section Title
│   │   │   │   ├── Claimant Name (DxcTextInput)
│   │   │   │   ├── Email (DxcTextInput)
│   │   │   │   ├── Phone (DxcTextInput)
│   │   │   │   └── Relationship (DxcSelect)
│   │   │   │
│   │   │   └── [Step 3: Document Upload] (if step === 3)
│   │   │       ├── Section Title
│   │   │       ├── Info Alert (DxcAlert)
│   │   │       ├── Death Certificate Upload (DxcFileInput)
│   │   │       ├── ID Document Upload (DxcFileInput)
│   │   │       ├── Additional Docs Upload (DxcFileInput)
│   │   │       └── Certification Alert (DxcAlert warning)
│   │   │
│   │   └── Navigation Buttons (DxcFlex row, space-between)
│   │       ├── Left: Back Button (DxcButton secondary)
│   │       └── Right: Cancel + Next/Submit
│   │           ├── Cancel Button (DxcButton text)
│   │           └── Next/Submit Button (DxcButton primary/success)
│   │
│   └── Info Card (DxcCard)
│       ├── Section Title (What happens next?)
│       └── Process Steps
│           ├── 1. Automatic Verification
│           ├── 2. Requirements Generation
│           ├── 3. FastTrack Processing
│           └── 4. Examiner Review
```

## Data Flow

### State Management

```
App.jsx State:
├── currentView: string ('dashboard' | 'workbench' | 'intake')
└── selectedClaim: object | null

Dashboard.jsx State:
├── activeTab: number (0-2)
└── searchValue: string

ClaimsWorkbench.jsx State:
└── activeTab: number (0-3)

IntakeForms.jsx State:
├── step: number (1-3)
├── showSuccess: boolean
└── formData: object
    ├── claimType
    ├── policyNumber
    ├── insuredName
    ├── dateOfDeath
    ├── claimantName
    ├── claimantEmail
    ├── claimantPhone
    ├── relationship
    └── description
```

### Event Flow

```
User Interactions → Component State → UI Update

Examples:

1. View Claim Details:
   Dashboard → onClaimSelect(claim) → App state → ClaimsWorkbench render

2. Submit Claim:
   IntakeForms → handleSubmit() → API call → Success alert → Reset form

3. Navigate Tabs:
   Dashboard → Tab click → setActiveTab(n) → Content switch

4. Change Form Step:
   IntakeForms → Next button → setStep(step + 1) → New form fields
```

## Component Reusability

### Reusable Patterns

1. **Metric Card Pattern**
```jsx
<DxcCard>
  <DxcFlex direction="column" gap="0.5rem">
    <span style={titleStyle}>{title}</span>
    <span style={valueStyle}>{value}</span>
    <span style={changeStyle}>{change}</span>
  </DxcFlex>
</DxcCard>
```

2. **Status Badge Pattern**
```jsx
<DxcBadge
  label={status}
  color={getStatusColor(status)}
  mode="outlined"
  size="small"
/>
```

3. **Timeline Event Pattern**
```jsx
<div style={timelineEventStyle}>
  <div style={markerStyle} />
  <DxcFlex direction="column" gap="0.25rem">
    <span>{event.name}</span>
    <span>{event.date}</span>
    <p>{event.description}</p>
  </DxcFlex>
</div>
```

### Component Composition

```
Higher Order Pattern:
DxcCard
  └── DxcFlex (layout)
      ├── DxcBadge (status)
      ├── DxcButton (action)
      └── DxcTable (data)
          ├── DxcTable.Header
          │   └── DxcTable.HeaderCell
          └── DxcTable.Body
              └── DxcTable.Row
                  └── DxcTable.DataCell

This pattern is used throughout:
- Dashboard metrics
- Claims table
- Requirements table
- Beneficiaries table
```

## CSS Architecture

```
Global Styles (App.css)
├── Reset styles (box-sizing, margin, padding)
├── Body styles (font-family, smoothing)
└── Root styles (full height)

Component Styles (*.css)
├── Dashboard.css
│   ├── .dashboard-container
│   └── .table-container
│
├── ClaimsWorkbench.css
│   ├── .workbench-container
│   ├── .timeline
│   ├── .timeline-event
│   └── .timeline-marker
│
└── IntakeForms.css
    └── .intake-container
```

## Routing Strategy

### Current: State-Based Routing
```javascript
// App.jsx
const renderContent = () => {
  switch (currentView) {
    case 'dashboard': return <Dashboard />;
    case 'workbench': return <ClaimsWorkbench />;
    case 'intake': return <IntakeForms />;
  }
};
```

### Future: React Router (Recommended)
```javascript
// With React Router
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/claims/:id" element={<ClaimsWorkbench />} />
  <Route path="/intake" element={<IntakeForms />} />
</Routes>
```

## Integration Points

### API Calls (To Be Implemented)

```
Dashboard
├── GET /api/claims (fetch claims list)
├── GET /api/metrics (fetch dashboard metrics)
└── GET /api/claims/search (search claims)

ClaimsWorkbench
├── GET /api/claims/:id (fetch claim details)
├── GET /api/policies/:policyNumber (fetch policy info)
├── GET /api/claims/:id/timeline (fetch timeline events)
├── GET /api/claims/:id/requirements (fetch requirements)
├── GET /api/claims/:id/documents (fetch documents)
├── POST /api/claims/:id/approve (approve claim)
├── POST /api/claims/:id/deny (deny claim)
└── POST /api/claims/:id/hold (put claim on hold)

IntakeForms
├── POST /api/claims (create new claim)
├── POST /api/claims/:id/documents (upload documents)
└── POST /api/lexisnexis/verify (verify death)
```

## Performance Considerations

### Current Optimizations
- Vite for fast builds and HMR
- Component-level CSS for scoping
- Efficient React rendering

### Recommended Future Optimizations
```javascript
// 1. Lazy loading
const ClaimsWorkbench = lazy(() => import('./components/ClaimsWorkbench'));

// 2. Memoization
const MemoizedTable = React.memo(ClaimsTable);

// 3. Virtual scrolling for large lists
import { DxcDataGrid } from '@dxc-technology/halstack-react';

// 4. Code splitting by route
```

## Accessibility Features

All Halstack components are WCAG 2.1 AA compliant and include:
- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management
- Color contrast compliance

## Testing Strategy

### Component Testing Structure
```
tests/
├── unit/
│   ├── Dashboard.test.jsx
│   ├── ClaimsWorkbench.test.jsx
│   └── IntakeForms.test.jsx
│
├── integration/
│   ├── claim-submission.test.js
│   └── claim-workflow.test.js
│
└── e2e/
    ├── dashboard-navigation.spec.js
    └── claim-lifecycle.spec.js
```

## Scaling Considerations

### When to Refactor

**Add State Management (Redux/Context) when:**
- More than 3-4 levels of prop drilling
- Multiple components need same data
- Complex state synchronization needed

**Add React Router when:**
- Need URL-based navigation
- Want browser back/forward support
- Need bookmarkable URLs

**Add Data Layer when:**
- Multiple API endpoints
- Need caching strategy
- Complex data transformations

**Component Library when:**
- Reusing same patterns 5+ times
- Building design system
- Multi-app architecture

## Summary

This architecture provides:
✅ Clear component hierarchy
✅ Logical data flow
✅ Scalable structure
✅ Integration readiness
✅ Performance considerations
✅ Accessibility built-in

The design allows for easy extension while maintaining the integrity of the Halstack Design System.

---

**For detailed component examples**: See [HALSTACK_COMPONENT_GUIDE.md](./HALSTACK_COMPONENT_GUIDE.md)
**For integration details**: See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
