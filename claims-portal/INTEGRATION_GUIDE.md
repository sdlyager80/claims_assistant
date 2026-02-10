# Commercial Claim Demo - Integration Guide

## Files Created

### 1. **commercialClaimDemo.json** (`src/data/commercialClaimDemo.json`)
Complete structured demo data for Bloom & Petals Florist water damage claim

### 2. **CommercialClaimDemo.jsx** (`src/components/CommercialClaimDemo.jsx`)
Full React component demonstrating commercial claim display with Halstack components

### 3. **COMMERCIAL_DEMO_DATA.md** (`claims-portal/COMMERCIAL_DEMO_DATA.md`)
Comprehensive documentation of the demo scenario, data structure, and business value

## Quick Start

### Option 1: Run as Standalone Demo

Add to your `App.jsx` routing:

```jsx
import CommercialClaimDemo from './components/CommercialClaimDemo';

// In your router:
<Route path="/commercial-demo" element={<CommercialClaimDemo />} />
```

Navigate to: `http://localhost:5173/commercial-demo`

### Option 2: Add Toggle to Existing Workbench

Modify `ClaimsWorkbench.jsx` to switch between life insurance and commercial claims:

```jsx
import { useState } from 'react';
import lifeClaimData from '../data/mockClaimData.json'; // Your existing data
import commercialClaimData from '../data/commercialClaimDemo.json';
import { DxcSwitch } from '@dxc-technology/halstack-react';

const ClaimsWorkbench = () => {
  const [isCommercial, setIsCommercial] = useState(false);
  const claimData = isCommercial ? commercialClaimData : lifeClaimData;

  return (
    <div>
      {/* Toggle Switch */}
      <DxcSwitch
        label="Commercial Claims Mode"
        checked={isCommercial}
        onChange={(checked) => setIsCommercial(checked)}
      />

      {/* Rest of your workbench using claimData */}
    </div>
  );
};
```

### Option 3: Dashboard Integration

Add commercial claim to your Dashboard submissions table:

```jsx
import commercialClaimData from '../data/commercialClaimDemo.json';

const dashboardData = [
  ...existingLifeInsuranceClaims,
  {
    claimNumber: commercialClaimData.claim.claimNumber,
    insuredName: commercialClaimData.insured.businessName,
    type: commercialClaimData.claim.type,
    dateOfLoss: commercialClaimData.claim.dateOfLoss,
    status: commercialClaimData.claim.status,
    priority: commercialClaimData.claim.priority,
    fastTrack: commercialClaimData.fastTrackCriteria.eligible
  }
];
```

## Key Features Demonstrated

### 1. Fast-Track Processing Alert
```jsx
{fastTrackCriteria.eligible && (
  <DxcAlert
    type="success"
    mode="inline"
    inlineText="Fast-tracked because you followed prevention measures"
  />
)}
```

### 2. Multi-Coverage Policy Display
Shows Business Owners Policy (BOP) with:
- Commercial Property
- Business Income
- Equipment Breakdown
- Spoilage Coverage

### 3. Prior Claim Integration
Demonstrates how prior claims inform current processing:
- Shows history of similar incidents
- Displays compliance with recommendations
- Affects fast-track eligibility

### 4. IoT Device Integration
Water sensor data integrated into timeline and fast-track criteria

### 5. AI-Powered Insights
- Fraud risk scoring
- Settlement recommendations
- Confidence levels
- Subrogation analysis

## Customization Options

### Change Business Branding

Edit `commercialClaimDemo.json`:

```json
{
  "insured": {
    "businessName": "Your Business Name",
    "businessType": "Your Industry",
    ...
  }
}
```

### Adjust Loss Amounts

```json
{
  "claim": {
    "estimatedLoss": 19500  // Change this value
  },
  "damageAssessment": {
    "inventory": { ... }  // Update inventory items
  }
}
```

### Add More Timeline Events

```json
{
  "timeline": [
    {
      "id": 9,
      "timestamp": "2026-02-10T14:00:00Z",
      "event": "Your Custom Event",
      "description": "Event description",
      "actor": "Actor Name",
      "category": "Category",
      "icon": "icon-name"
    }
  ]
}
```

## Demo Presentation Tips

### Opening Hook
"Last year, Bloom & Petals had a $15K frozen pipe claim. We didn't just pay it—we helped prevent the next one."

### Show Timeline First
Demonstrates the speed: Leak detected at 3:15 AM, claim approved by 4:15 AM

### Highlight Fast-Track Criteria
Walk through each checkmark showing how prevention pays off

### Show AI Insights
Fraud score of 8/100 (very safe), settlement recommendation with 87% confidence

### Business Value Close
"The water sensor cost $300. It prevented $30K+ in damage and got them approved in under an hour. That's smart insurance."

## Components Used

### Halstack Components
- ✅ DxcApplicationLayout
- ✅ DxcCard
- ✅ DxcFlex
- ✅ DxcBadge
- ✅ DxcProgressBar
- ✅ DxcTabs
- ✅ DxcTable
- ✅ DxcAccordion
- ✅ DxcButton
- ✅ DxcAlert
- ✅ DxcSwitch (for mode toggle)

### Custom Styling
All styling follows Halstack design system:
- Primary color: `#5f249f` (Bloom purple)
- Success: `#24A148`
- Info: `#0095FF`
- Warning: `#FF6B00`
- Error: `#D0021B`

## Data Structure Reference

```javascript
{
  claim: {},              // Core claim info
  insured: {},            // Business details
  policy: {},             // BOP with coverages
  priorClaims: [],        // Claim history
  riskMitigation: {},     // IoT sensor data
  fastTrackCriteria: {},  // AI analysis
  adjuster: {},           // Assigned specialist
  timeline: [],           // Event history
  requirements: [],       // Document checklist
  documents: [],          // Uploaded files
  damageAssessment: {},   // Loss breakdown
  nextActions: [],        // Pending tasks
  aiInsights: {}          // ML insights
}
```

## Testing the Demo

1. **Install dependencies** (if not already done):
   ```bash
   cd claims-portal
   npm install
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Navigate to demo**:
   - Standalone: `http://localhost:5173/commercial-demo`
   - Or toggle commercial mode in existing workbench

4. **Test interactions**:
   - Switch between tabs
   - Expand accordions
   - Click action buttons
   - Review all sections

## Production Considerations

### API Integration Points
This demo is ready to connect to:

```javascript
// Fetch commercial claim
const response = await fetch(`/api/claims/${claimNumber}`);
const claimData = await response.json();

// Submit claim action
await fetch(`/api/claims/${claimNumber}/approve`, {
  method: 'POST',
  body: JSON.stringify({ decision, notes })
});
```

### ServiceNow Integration
Map to ServiceNow tables:
- `sn_customerservice_case` - Main claim record
- `sn_customerservice_requirement` - Requirements tracking
- `sys_attachment` - Document storage
- `sn_timeline` - Activity timeline

### Real-time Updates
Add WebSocket connection for live updates:

```javascript
const ws = new WebSocket(`wss://api.bloom.com/claims/${claimNumber}`);
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // Update timeline, requirements, or status
};
```

## Additional Resources

- **Halstack Docs**: https://developer.dxc.com/halstack/
- **ServiceNow FSO**: ServiceNow Financial Services Operations documentation
- **Smart Monitoring**: IoT device integration patterns
- **AI/ML Integration**: Rules engine and STP configuration

## Support

For questions about this demo:
- Review the `COMMERCIAL_DEMO_DATA.md` for scenario details
- Check component code in `CommercialClaimDemo.jsx` for implementation
- Refer to main project `README.md` for overall architecture

---

**Demo Tagline**: *"Insurance that prevents losses, not just pays for them."*
