# DXC Halstack Component Guide for Claims Portal

This guide provides examples of how to use Halstack components effectively in the Claims Portal, with specific use cases for claims management.

## Table of Contents
1. [Layout Components](#layout-components)
2. [Navigation Components](#navigation-components)
3. [Data Display Components](#data-display-components)
4. [Form Components](#form-components)
5. [Feedback Components](#feedback-components)
6. [Advanced Patterns](#advanced-patterns)

## Layout Components

### DxcApplicationLayout

The main layout structure for the entire application.

```jsx
import { DxcApplicationLayout } from '@dxc-technology/halstack-react';

function App() {
  return (
    <DxcApplicationLayout>
      {/* Header */}
      <DxcApplicationLayout.Header>
        <div>Your header content</div>
      </DxcApplicationLayout.Header>

      {/* Side Navigation */}
      <DxcApplicationLayout.SideNav>
        <DxcApplicationLayout.SideNav.Section>
          <DxcApplicationLayout.SideNav.Link
            onClick={() => navigate('/dashboard')}
            selected={currentPath === '/dashboard'}
          >
            Dashboard
          </DxcApplicationLayout.SideNav.Link>
        </DxcApplicationLayout.SideNav.Section>
      </DxcApplicationLayout.SideNav>

      {/* Main Content */}
      <DxcApplicationLayout.Main>
        <YourContent />
      </DxcApplicationLayout.Main>
    </DxcApplicationLayout>
  );
}
```

### DxcFlex

Flexible layout container for aligning elements.

```jsx
import { DxcFlex } from '@dxc-technology/halstack-react';

// Horizontal layout with gap
<DxcFlex gap="1rem" alignItems="center" justifyContent="space-between">
  <div>Left content</div>
  <div>Right content</div>
</DxcFlex>

// Vertical layout
<DxcFlex direction="column" gap="1.5rem">
  <div>First item</div>
  <div>Second item</div>
</DxcFlex>

// Responsive wrap
<DxcFlex gap="1rem" wrap="wrap">
  <DxcCard style={{ flex: '1 1 300px' }}>Card 1</DxcCard>
  <DxcCard style={{ flex: '1 1 300px' }}>Card 2</DxcCard>
  <DxcCard style={{ flex: '1 1 300px' }}>Card 3</DxcCard>
</DxcFlex>
```

### DxcCard

Container for grouping related content.

```jsx
import { DxcCard } from '@dxc-technology/halstack-react';

// Basic card
<DxcCard>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</DxcCard>

// Card with custom styling
<DxcCard
  outlined
  margin={{ top: 'medium', bottom: 'medium' }}
>
  <DxcFlex direction="column" gap="1rem">
    <h3 style={{ margin: 0 }}>Metric Card</h3>
    <span style={{ fontSize: '32px', fontWeight: 700, color: '#0095FF' }}>
      $24.8M
    </span>
  </DxcFlex>
</DxcCard>

// Clickable card
<DxcCard
  onClick={() => handleCardClick()}
  style={{ cursor: 'pointer' }}
>
  <p>Click me!</p>
</DxcCard>
```

## Navigation Components

### DxcTabs

Tab navigation for organizing content.

```jsx
import { DxcTabs } from '@dxc-technology/halstack-react';

const [activeTab, setActiveTab] = useState(0);

<DxcTabs margin={{ bottom: 'medium' }}>
  <DxcTabs.Tab
    label="Timeline"
    onClick={() => setActiveTab(0)}
    active={activeTab === 0}
  />
  <DxcTabs.Tab
    label="Policy 360"
    onClick={() => setActiveTab(1)}
    active={activeTab === 1}
  />
  <DxcTabs.Tab
    label="Requirements"
    onClick={() => setActiveTab(2)}
    active={activeTab === 2}
  />
</DxcTabs>

{activeTab === 0 && <TimelineView />}
{activeTab === 1 && <Policy360View />}
{activeTab === 2 && <RequirementsView />}
```

### DxcNavTabs

Navigation tabs for top-level navigation.

```jsx
import { DxcNavTabs } from '@dxc-technology/halstack-react';

<DxcNavTabs margin={{ bottom: 'medium' }}>
  <DxcNavTabs.Tab
    label="Submissions"
    onClick={() => setView('submissions')}
    active={view === 'submissions'}
  />
  <DxcNavTabs.Tab
    label="Quotes"
    onClick={() => setView('quotes')}
    active={view === 'quotes'}
  />
  <DxcNavTabs.Tab
    label="Renewals"
    onClick={() => setView('renewals')}
    active={view === 'renewals'}
  />
</DxcNavTabs>
```

### DxcBreadcrumbs

Show navigation hierarchy.

```jsx
import { DxcBreadcrumbs } from '@dxc-technology/halstack-react';

<DxcBreadcrumbs
  items={[
    { label: 'Home', onClick: () => navigate('/') },
    { label: 'Claims', onClick: () => navigate('/claims') },
    { label: claim.id }
  ]}
/>
```

## Data Display Components

### DxcTable

Display tabular data.

```jsx
import { DxcTable } from '@dxc-technology/halstack-react';

<DxcTable>
  <DxcTable.Header>
    <DxcTable.HeaderCell>Claim ID</DxcTable.HeaderCell>
    <DxcTable.HeaderCell>Name</DxcTable.HeaderCell>
    <DxcTable.HeaderCell>Status</DxcTable.HeaderCell>
    <DxcTable.HeaderCell>Actions</DxcTable.HeaderCell>
  </DxcTable.Header>
  <DxcTable.Body>
    {claims.map((claim) => (
      <DxcTable.Row key={claim.id}>
        <DxcTable.DataCell>
          <span style={{ color: '#0095FF', cursor: 'pointer' }}>
            {claim.id}
          </span>
        </DxcTable.DataCell>
        <DxcTable.DataCell>{claim.name}</DxcTable.DataCell>
        <DxcTable.DataCell>
          <DxcBadge
            label={claim.status}
            color="#FF6B00"
            mode="outlined"
            size="small"
          />
        </DxcTable.DataCell>
        <DxcTable.DataCell>
          <DxcButton
            mode="text"
            label="View"
            size="small"
            onClick={() => handleView(claim)}
          />
        </DxcTable.DataCell>
      </DxcTable.Row>
    ))}
  </DxcTable.Body>
</DxcTable>
```

### DxcBadge

Display status and labels.

```jsx
import { DxcBadge } from '@dxc-technology/halstack-react';

// Status badges
<DxcBadge
  label="In Progress"
  color="#FF6B00"
  mode="outlined"
  size="small"
/>

<DxcBadge
  label="Approved"
  color="#24A148"
  mode="filled"
/>

<DxcBadge
  label="Requires Action"
  color="#D0021B"
  mode="outlined"
/>

// With icon
<DxcBadge
  label="FastTrack"
  icon="speed"
  color="#0095FF"
/>

// Notification badge
<DxcBadge
  label="3"
  color="#D0021B"
  size="small"
  notificationLimit={99}
/>
```

### DxcAccordion

Collapsible content sections.

```jsx
import { DxcAccordion } from '@dxc-technology/halstack-react';

<DxcAccordion>
  <DxcAccordion.AccordionItem
    label="Death Certificate"
    subLabel="Required"
    statusLight={<DxcBadge label="Received" color="#24A148" size="small" />}
  >
    <p>Document details and preview here</p>
    <DxcButton label="View Document" mode="text" />
  </DxcAccordion.AccordionItem>

  <DxcAccordion.AccordionItem
    label="Beneficiary ID"
    subLabel="Required"
    statusLight={<DxcBadge label="Pending" color="#FF6B00" size="small" />}
  >
    <p>Awaiting upload</p>
  </DxcAccordion.AccordionItem>
</DxcAccordion>

// Multiple sections can be open
<DxcAccordion independent={false}>
  <DxcAccordion.AccordionItem label="Section 1">
    Content 1
  </DxcAccordion.AccordionItem>
  <DxcAccordion.AccordionItem label="Section 2">
    Content 2
  </DxcAccordion.AccordionItem>
</DxcAccordion>
```

### DxcProgressBar

Show progress and completion status.

```jsx
import { DxcProgressBar } from '@dxc-technology/halstack-react';

// Basic progress bar
<DxcProgressBar
  label="Claim Processing"
  value={65}
  showValue
/>

// With helper text
<DxcProgressBar
  label="Overall Completion"
  helperText="3 of 5 requirements received"
  value={60}
  showValue
  margin={{ top: 'medium', bottom: 'medium' }}
/>

// Overlay mode for loading states
<DxcProgressBar
  label="Loading claim details..."
  overlay
/>
```

## Form Components

### DxcTextInput

Text input fields.

```jsx
import { DxcTextInput } from '@dxc-technology/halstack-react';

// Basic input
<DxcTextInput
  label="Policy Number"
  placeholder="Enter policy number"
  value={policyNumber}
  onChange={(e) => setPolicyNumber(e.target.value)}
  required
/>

// With helper text
<DxcTextInput
  label="SSN"
  placeholder="XXX-XX-XXXX"
  helperText="Enter the insured's Social Security Number"
  value={ssn}
  onChange={(e) => setSSN(e.target.value)}
/>

// With error
<DxcTextInput
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error="Please enter a valid email address"
/>

// Disabled
<DxcTextInput
  label="Claim ID"
  value={claimId}
  disabled
/>
```

### DxcSelect

Dropdown selection.

```jsx
import { DxcSelect } from '@dxc-technology/halstack-react';

<DxcSelect
  label="Claim Type"
  placeholder="Select claim type"
  value={claimType}
  onChange={(value) => setClaimType(value)}
  options={[
    { label: 'Death Claim', value: 'death' },
    { label: 'Maturity', value: 'maturity' },
    { label: 'Surrender', value: 'surrender' }
  ]}
  required
/>

// With helper text
<DxcSelect
  label="State"
  helperText="Select the state where the policy was issued"
  value={state}
  onChange={(value) => setState(value)}
  options={stateOptions}
/>

// Multiple selection
<DxcSelect
  label="Requirements"
  multiple
  value={selectedRequirements}
  onChange={(values) => setSelectedRequirements(values)}
  options={requirementOptions}
/>
```

### DxcDateInput

Date picker.

```jsx
import { DxcDateInput } from '@dxc-technology/halstack-react';

<DxcDateInput
  label="Date of Death"
  value={dateOfDeath}
  onChange={(value) => setDateOfDeath(value)}
  placeholder="MM/DD/YYYY"
  helperText="Enter the date from the death certificate"
  required
/>

// With format
<DxcDateInput
  label="Effective Date"
  value={effectiveDate}
  onChange={(value) => setEffectiveDate(value)}
  format="DD/MM/YYYY"
/>
```

### DxcTextarea

Multi-line text input.

```jsx
import { DxcTextarea } from '@dxc-technology/halstack-react';

<DxcTextarea
  label="Claim Description"
  placeholder="Provide details about the claim"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  helperText="Include any relevant circumstances"
/>

// With character counter
<DxcTextarea
  label="Notes"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  maxLength={500}
  rows={6}
/>
```

### DxcRadioGroup

Radio button selection.

```jsx
import { DxcRadioGroup } from '@dxc-technology/halstack-react';

<DxcRadioGroup
  label="Claim Priority"
  options={[
    { label: 'Standard', value: 'standard' },
    { label: 'Expedited', value: 'expedited' },
    { label: 'FastTrack', value: 'fasttrack' }
  ]}
  value={priority}
  onChange={(value) => setPriority(value)}
/>

// Horizontal layout
<DxcRadioGroup
  label="Review Status"
  stacking="row"
  options={[
    { label: 'Approved', value: 'approved' },
    { label: 'Denied', value: 'denied' },
    { label: 'Pending', value: 'pending' }
  ]}
  value={status}
  onChange={(value) => setStatus(value)}
/>
```

### DxcCheckbox

Checkbox for boolean values.

```jsx
import { DxcCheckbox } from '@dxc-technology/halstack-react';

<DxcCheckbox
  label="I certify that all information is accurate"
  checked={certified}
  onChange={(checked) => setCertified(checked)}
/>

// With helper text
<DxcCheckbox
  label="Send notifications"
  helperText="Receive email updates about claim status"
  checked={notifications}
  onChange={(checked) => setNotifications(checked)}
/>
```

### DxcFileInput

File upload.

```jsx
import { DxcFileInput } from '@dxc-technology/halstack-react';

// Single file
<DxcFileInput
  accept=".pdf,.jpg,.jpeg,.png"
  mode="file"
  buttonLabel="Choose File"
  helperText="Accepted formats: PDF, JPG, PNG (Max 10MB)"
  onChange={(files) => handleFileUpload(files)}
/>

// Drag and drop
<DxcFileInput
  accept=".pdf"
  mode="filedrop"
  buttonLabel="Drop death certificate here or click to upload"
  onChange={(files) => handleFileUpload(files)}
/>

// Multiple files
<DxcFileInput
  accept=".pdf,.jpg,.jpeg,.png"
  mode="filedrop"
  multiple
  buttonLabel="Upload multiple documents"
  onChange={(files) => handleMultipleFiles(files)}
/>
```

## Feedback Components

### DxcButton

Action buttons.

```jsx
import { DxcButton } from '@dxc-technology/halstack-react';

// Primary button
<DxcButton
  label="Submit Claim"
  onClick={handleSubmit}
/>

// Secondary button
<DxcButton
  label="Cancel"
  mode="secondary"
  onClick={handleCancel}
/>

// Text button
<DxcButton
  label="View Details"
  mode="text"
  onClick={handleView}
/>

// Semantic buttons
<DxcButton
  label="Approve"
  semantic="success"
  onClick={handleApprove}
/>

<DxcButton
  label="Deny"
  semantic="error"
  onClick={handleDeny}
/>

// With icon
<DxcButton
  label="Download"
  icon="download"
  iconPosition="before"
  onClick={handleDownload}
/>

// Disabled
<DxcButton
  label="Process"
  disabled
/>

// Sizes
<DxcButton label="Large" size="large" />
<DxcButton label="Medium" size="medium" />
<DxcButton label="Small" size="small" />
```

### DxcAlert

Display important messages.

```jsx
import { DxcAlert } from '@dxc-technology/halstack-react';

// Success alert
<DxcAlert
  semantic="success"
  message={{ text: 'Claim submitted successfully!' }}
/>

// Error alert
<DxcAlert
  semantic="error"
  title="Validation Error"
  message={{ text: 'Please complete all required fields.' }}
/>

// Warning alert
<DxcAlert
  semantic="warning"
  message={{
    text: 'This claim requires manual review due to potential fraud indicators.'
  }}
/>

// Info alert
<DxcAlert
  semantic="info"
  title="FastTrack Eligible"
  message={{
    text: 'This claim meets all criteria for expedited processing.'
  }}
/>

// With actions
<DxcAlert
  semantic="warning"
  title="SLA At Risk"
  message={{ text: 'This claim will be SLA overdue in 2 days.' }}
  primaryAction={{
    label: 'Escalate',
    onClick: handleEscalate
  }}
  secondaryAction={{
    label: 'View Details',
    onClick: handleViewDetails
  }}
/>

// Closable
<DxcAlert
  closable
  message={{ text: 'Your session will expire in 5 minutes.' }}
  onClose={handleClose}
/>
```

### DxcDialog

Modal dialogs.

```jsx
import { DxcDialog } from '@dxc-technology/halstack-react';

const [showDialog, setShowDialog] = useState(false);

<DxcButton
  label="Approve Claim"
  onClick={() => setShowDialog(true)}
/>

{showDialog && (
  <DxcDialog
    closable
    onCloseClick={() => setShowDialog(false)}
    onBackgroundClick={() => setShowDialog(false)}
  >
    <DxcFlex direction="column" gap="1.5rem">
      <h2 style={{ margin: 0 }}>Confirm Approval</h2>
      <p>Are you sure you want to approve this claim?</p>
      <p><strong>Claim Amount:</strong> $500,000</p>
      <DxcFlex gap="1rem" justifyContent="flex-end">
        <DxcButton
          label="Cancel"
          mode="secondary"
          onClick={() => setShowDialog(false)}
        />
        <DxcButton
          label="Approve"
          semantic="success"
          onClick={handleConfirmApproval}
        />
      </DxcFlex>
    </DxcFlex>
  </DxcDialog>
)}
```

### DxcSpinner

Loading indicators.

```jsx
import { DxcSpinner } from '@dxc-technology/halstack-react';

// Basic spinner
<DxcSpinner label="Loading claim details..." />

// With value (determinate)
<DxcSpinner
  label="Processing"
  value={progress}
  showValue
/>

// Overlay mode
<DxcSpinner
  label="Verifying death certificate..."
  mode="overlay"
/>

// Small spinner
<DxcSpinner mode="small" />
```

## Advanced Patterns

### Custom Timeline Component

```jsx
import { DxcFlex, DxcCard } from '@dxc-technology/halstack-react';

const Timeline = ({ events }) => (
  <DxcCard>
    <h3 style={{ marginTop: 0 }}>Claim Timeline</h3>
    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
      {events.map((event, index) => (
        <div
          key={index}
          style={{
            position: 'relative',
            paddingBottom: '2rem',
            borderLeft: index < events.length - 1 ? '2px solid #e0e0e0' : 'none',
            paddingLeft: '2rem'
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '-6px',
              top: '4px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#0095FF',
              border: '2px solid white',
              boxShadow: '0 0 0 2px #0095FF'
            }}
          />
          <DxcFlex direction="column" gap="0.25rem">
            <DxcFlex gap="1rem" alignItems="center">
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                {event.event}
              </span>
              <span style={{ fontSize: '12px', color: '#666' }}>
                {event.date}
              </span>
            </DxcFlex>
            <span style={{ fontSize: '12px', color: '#666' }}>
              by {event.user}
            </span>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px' }}>
              {event.description}
            </p>
          </DxcFlex>
        </div>
      ))}
    </div>
  </DxcCard>
);
```

### Metric Card Component

```jsx
import { DxcCard, DxcFlex } from '@dxc-technology/halstack-react';

const MetricCard = ({ title, value, change, color }) => (
  <DxcCard style={{ flex: '1 1 22%', minWidth: '200px' }}>
    <DxcFlex direction="column" gap="0.5rem">
      <span
        style={{
          fontSize: '12px',
          color: '#666',
          fontWeight: 600,
          letterSpacing: '0.5px'
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: '36px',
          fontWeight: 700,
          color: color
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: '12px', color: '#999' }}>
        {change}
      </span>
    </DxcFlex>
  </DxcCard>
);

// Usage
<DxcFlex gap="1.5rem" wrap="wrap">
  <MetricCard
    title="PENDING REVIEW"
    value="7"
    change="3 closing today"
    color="#FF6B00"
  />
</DxcFlex>
```

### Status Badge Selector

```jsx
const getStatusBadge = (status) => {
  const statusConfig = {
    'in-progress': { color: '#FF6B00', label: 'In Progress' },
    'approved': { color: '#24A148', label: 'Approved' },
    'denied': { color: '#D0021B', label: 'Denied' },
    'pending': { color: '#666', label: 'Pending' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <DxcBadge
      label={config.label}
      color={config.color}
      mode="outlined"
      size="small"
    />
  );
};

// Usage
<DxcTable.DataCell>
  {getStatusBadge(claim.status)}
</DxcTable.DataCell>
```

### Search and Filter Component

```jsx
import {
  DxcTextInput,
  DxcSelect,
  DxcFlex,
  DxcButton
} from '@dxc-technology/halstack-react';

const SearchAndFilter = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <DxcFlex gap="1rem" alignItems="flex-end">
      <div style={{ flex: 1 }}>
        <DxcTextInput
          label="Search"
          placeholder="Search claims..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div style={{ flex: '0 0 200px' }}>
        <DxcSelect
          label="Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          options={[
            { label: 'All', value: 'all' },
            { label: 'In Progress', value: 'in-progress' },
            { label: 'Approved', value: 'approved' },
            { label: 'Denied', value: 'denied' }
          ]}
        />
      </div>
      <DxcButton
        label="Search"
        onClick={() => onSearch(searchTerm, statusFilter)}
      />
    </DxcFlex>
  );
};
```

## Theming and Customization

### Custom Theme

```jsx
import { HalstackProvider } from '@dxc-technology/halstack-react';

const customTheme = {
  color: {
    primary: '#5f249f',
    secondary: '#0095FF',
    success: '#24A148',
    warning: '#FF6B00',
    error: '#D0021B'
  }
};

function App() {
  return (
    <HalstackProvider theme={customTheme}>
      <YourApp />
    </HalstackProvider>
  );
}
```

### Responsive Design

```jsx
// Use media queries with Halstack components
<DxcFlex
  direction={{ mobile: 'column', tablet: 'row', desktop: 'row' }}
  gap="1rem"
>
  <DxcCard style={{ flex: 1 }}>Card 1</DxcCard>
  <DxcCard style={{ flex: 1 }}>Card 2</DxcCard>
</DxcFlex>

// Or use CSS
<style>
  {`
    @media (max-width: 768px) {
      .metric-cards {
        flex-direction: column;
      }
    }
  `}
</style>
```

## Best Practices

1. **Consistent Spacing**: Use Halstack's margin prop for consistent spacing
```jsx
<DxcButton margin={{ top: 'medium', bottom: 'small' }} />
```

2. **Accessibility**: Always provide labels and helper text
```jsx
<DxcTextInput
  label="Policy Number"
  helperText="Enter the 10-digit policy number"
  ariaLabel="Policy number input field"
/>
```

3. **Loading States**: Show spinners during async operations
```jsx
{loading ? <DxcSpinner label="Loading..." /> : <ClaimDetails />}
```

4. **Error Handling**: Display user-friendly error messages
```jsx
{error && (
  <DxcAlert
    semantic="error"
    message={{ text: error.message }}
  />
)}
```

5. **Form Validation**: Provide immediate feedback
```jsx
<DxcTextInput
  label="Email"
  value={email}
  onChange={handleEmailChange}
  error={emailError}
  helperText={!emailError && "We'll never share your email"}
/>
```

## Additional Resources

- [Halstack Design System Documentation](https://developer.dxc.com/halstack/)
- [Halstack GitHub Repository](https://github.com/dxc-technology/halstack-react)
- [Storybook Examples](https://dxc-technology.github.io/halstack/)

---

For component-specific questions or issues, refer to the official Halstack documentation or the development team.
