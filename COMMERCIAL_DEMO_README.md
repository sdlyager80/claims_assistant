# Commercial Claims Demo - Complete Package

## 📦 What's Included

A complete, production-ready demo of AI-powered commercial property claims processing featuring **Bloom & Petals Florist** - showcasing proactive risk management, IoT device integration, and fast-track claim processing.

---

## 📁 Files Created

### 1. **Core Data** (`claims-portal/src/data/`)
- **`commercialClaimDemo.json`** - Complete structured demo data
  - 700+ lines of realistic commercial claim data
  - Includes: claim details, business info, policy, timeline, documents, AI insights
  - Ready for API integration

### 2. **React Component** (`claims-portal/src/components/`)
- **`CommercialClaimDemo.jsx`** - Full-featured claims workbench
  - 600+ lines of Halstack components
  - 5 tabbed sections: Timeline, Requirements, Documents, Damage Assessment, AI Insights
  - Responsive, accessible, production-ready

### 3. **Documentation** (`claims-portal/`)
- **`COMMERCIAL_DEMO_DATA.md`** - Comprehensive scenario documentation
  - Business story and context
  - Fast-track qualification criteria
  - Technology integration points
  - ROI calculations

- **`INTEGRATION_GUIDE.md`** - Technical implementation guide
  - 3 integration options (standalone, toggle, dashboard)
  - Customization examples
  - API integration patterns
  - Production considerations

- **`DEMO_SCRIPT.md`** - Complete presentation script
  - 8-10 minute demo flow
  - 4-act storytelling structure
  - Q&A preparation
  - Demo day checklist

### 4. **This File** (`COMMERCIAL_DEMO_README.md`)
- Quick reference and index of all demo materials

---

## 🎯 Demo Scenario Summary

### The Business
**Bloom & Petals Florist**
- Owner: Sarah Martinez
- Location: Portland, OR
- Type: Retail florist
- Annual Revenue: $450,000
- 6 employees, 8 years in business

### The Story
1. **Prior Claim (Jan 2024)**: Frozen pipe burst, $15K damage
2. **Risk Mitigation**: Installed water sensor, followed all recommendations
3. **Current Claim (Feb 2026)**: Another frozen pipe during winter storm
4. **Fast-Track**: AI approved in under 1 hour due to prevention compliance
5. **Result**: $19,500 claim vs potential $50,000+ without sensor

### Key Messages
- **Prevention > Payment**: Water sensor prevented $30K+ in damage
- **Technology + Human**: AI handles analysis, adjuster provides expertise
- **Win-Win**: Lower costs for insurer, better service for customer
- **Proactive Insurance**: Rewards good behavior, prevents losses

---

## 🚀 Quick Start

### Option 1: Run Standalone Demo (Recommended for first viewing)

1. **Navigate to project**:
   ```bash
   cd claims-portal
   ```

2. **Install dependencies** (if needed):
   ```bash
   npm install
   ```

3. **Add route to `App.jsx`**:
   ```jsx
   import CommercialClaimDemo from './components/CommercialClaimDemo';

   // Add route:
   <Route path="/commercial-demo" element={<CommercialClaimDemo />} />
   ```

4. **Start dev server**:
   ```bash
   npm run dev
   ```

5. **Open demo**:
   ```
   http://localhost:5173/commercial-demo
   ```

### Option 2: Quick Preview (No setup needed)

1. **Open the JSON data**:
   ```bash
   code claims-portal/src/data/commercialClaimDemo.json
   ```

2. **Read the scenario doc**:
   ```bash
   code claims-portal/COMMERCIAL_DEMO_DATA.md
   ```

3. **Review the component**:
   ```bash
   code claims-portal/src/components/CommercialClaimDemo.jsx
   ```

---

## 📊 Demo Features

### 1. Fast-Track Processing
- ✅ 5 qualification criteria displayed
- ✅ 94% AI confidence score
- ✅ Visual fast-track badges and alerts
- ✅ Automatic approval workflow

### 2. Complete Timeline
- 🕐 8 timestamped events from detection to mitigation
- 🤖 Mix of automated and human actions
- 📱 Mobile FNOL submission
- 🚨 Water sensor alerts

### 3. Multi-Coverage Policy
- 💼 Business Owners Policy (BOP)
- 🏢 Commercial Property
- 💰 Business Income
- ⚙️ Equipment Breakdown
- 🧊 Spoilage Coverage

### 4. Damage Assessment
- 🌸 Inventory loss breakdown ($12,500)
- 🏗️ Structural damage details ($7,000)
- ⏰ Business interruption analysis (3 days, Valentine's week)
- 💵 Total estimated loss: $19,500+

### 5. AI-Powered Insights
- 🔍 Fraud risk scoring (8/100 - very low)
- 💡 Settlement recommendation ($18K-$22K)
- 📈 87% confidence level
- 🎯 Subrogation analysis

### 6. Prior Claim Integration
- 📜 Historical claim data (Jan 2024, $15K)
- ✅ Compliance tracking (followed all recommendations)
- 📷 Risk documentation photos
- 🔗 Automatic data retrieval

### 7. IoT Device Integration
- 💧 FloodStop Pro water sensor
- ⏰ Real-time leak detection (3:15 AM alert)
- 📊 Sensor logs and timeline
- ✅ Prevention verification

---

## 🎨 Visual Highlights

### Color Coding
- **Purple (#5f249f)**: Bloom brand, fast-track, primary actions
- **Green (#24A148)**: Success, received, approved, low fraud risk
- **Blue (#0095FF)**: Info, auto-retrieved, system actions
- **Orange (#FF6B00)**: Warning, in-progress, priority
- **Red (#D0021B)**: Critical, denied, high risk

### Status Badges
- ⚡ Fast-Track Processing
- 🔥 High Priority
- ✅ Received
- 🔄 In Progress
- ⏳ Pending
- 🤖 Auto-Retrieved

### UI Components
- Progress bar showing 35% completion
- Tabbed interface (5 tabs)
- Accordion document organizer
- Table views for timeline and requirements
- Action buttons (Approve, Hold, Request Info)

---

## 💡 Use Cases

### 1. Sales Demos
- Show prospects the power of AI-driven claims
- Demonstrate IoT integration capabilities
- Highlight customer experience improvements

### 2. Executive Presentations
- ROI calculations and cost savings
- Technology stack overview
- Competitive differentiation

### 3. Training Materials
- Claims adjuster training on fast-track criteria
- Customer service training on commercial claims
- Developer training on Halstack implementation

### 4. Conference Demos
- Insurance innovation showcases
- AI/ML in insurance presentations
- Customer experience case studies

### 5. Internal Stakeholders
- IT architecture reviews
- Business process demonstrations
- Integration capability examples

---

## 🔧 Customization Guide

### Change Business Details
Edit `commercialClaimDemo.json`:
```json
{
  "insured": {
    "businessName": "Your Business",
    "businessType": "Your Industry"
  }
}
```

### Adjust Loss Amounts
```json
{
  "claim": {
    "estimatedLoss": 25000  // Your amount
  }
}
```

### Add Timeline Events
```json
{
  "timeline": [
    {
      "id": 9,
      "timestamp": "2026-02-10T16:00:00Z",
      "event": "Your Event",
      "description": "Event details",
      "actor": "Actor Name",
      "category": "Category"
    }
  ]
}
```

### Modify Fast-Track Criteria
```json
{
  "fastTrackCriteria": {
    "reasons": [
      {
        "criterion": "Your Criterion",
        "met": true,
        "details": "Why it was met"
      }
    ]
  }
}
```

---

## 📈 Key Statistics for Presentations

### Customer Experience
- **3 minutes**: Claim acknowledgment time
- **2 hours**: Time to emergency services on-site
- **94%**: AI confidence score
- **<1 hour**: Pre-approval for emergency mitigation

### Business Value
- **$300**: Water sensor cost
- **$30,000+**: Damage prevented by sensor
- **60%**: Reduction in adjuster processing time
- **40%**: Lower loss severity with early detection
- **10%**: Premium discount for monitoring program

### Technology
- **7**: Integration points (IoT, weather, AI, mobile, etc.)
- **8**: Auto-retrieved documents
- **5/5**: Fast-track criteria met
- **8/100**: Fraud risk score (very safe)
- **87%**: Settlement confidence level

---

## 🎬 Presentation Tips

### Opening Hook
"What if insurance could actually prevent losses instead of just paying for them?"

### Key Narrative Arc
1. **Problem**: Prior claim revealed risk
2. **Solution**: Prevention measures + technology
3. **Test**: Winter storm hits again
4. **Success**: Quick detection, fast approval, minimal damage
5. **Proof**: $300 sensor prevented $30K+ damage

### Emotional Beats
- 😟 Fear: 3 AM phone alert, water in basement
- 😌 Relief: Sensor caught it early, help on the way
- 😊 Gratitude: Claim approved in under an hour
- 🤝 Trust: Insurance partner that truly helps

### Closing Statement
"This is Bloom Insurance. Where we don't just pay claims—we prevent them. Where technology empowers people, not replaces them. Where doing the right thing is rewarded, not just required."

---

## 🔗 Integration with ServiceNow

### Table Mappings
- **sn_customerservice_case** → Claim record
- **sn_customerservice_requirement** → Requirements
- **sys_attachment** → Documents
- **sn_timeline** → Activity timeline
- **cmdb_ci_business_app** → Business/policy info

### API Endpoints (Example)
```javascript
GET  /api/claims/:claimNumber
POST /api/claims
PUT  /api/claims/:claimNumber/approve
GET  /api/claims/:claimNumber/documents
POST /api/claims/:claimNumber/timeline
GET  /api/policies/:policyNumber
```

---

## 📚 Additional Resources

### Halstack Documentation
- Main Docs: https://developer.dxc.com/halstack/
- React Components: https://developer.dxc.com/halstack/components/
- Design Principles: https://developer.dxc.com/halstack/principles/

### Insurance Standards
- ACORD forms and standards
- ISO claim coding
- NAIC guidelines

### Technology Stack
- React 18.3.1
- Vite build tool
- DXC Halstack React 16.0.0
- Emotion CSS-in-JS

---

## ✅ Demo Checklist

### Pre-Demo
- [ ] Review DEMO_SCRIPT.md
- [ ] Test the component loads correctly
- [ ] Verify all tabs work
- [ ] Check all data displays properly
- [ ] Prepare Q&A responses
- [ ] Have backup screenshots ready

### During Demo
- [ ] Tell the story (don't just show features)
- [ ] Pause for questions
- [ ] Highlight the "why" not just the "what"
- [ ] Show enthusiasm for the innovation
- [ ] Connect to business value

### Post-Demo
- [ ] Gather feedback
- [ ] Note questions asked
- [ ] Share demo materials
- [ ] Follow up on action items

---

## 🎯 Success Metrics

After presenting this demo, audience should understand:
1. ✅ How IoT devices integrate with insurance claims
2. ✅ How AI fast-tracks claims while maintaining quality
3. ✅ Why prevention is better than payment
4. ✅ How technology improves customer experience
5. ✅ The business value (ROI, cost savings, retention)

---

## 👥 Contact & Support

**Demo Owner**: Stephanie Lyons, Director & Principal Solution Architect
**Team**: Smart Apps, DXC Technology
**Focus**: ServiceNow implementations, modern UI layers, insurance industry

For questions about:
- **Scenario/Story**: See `COMMERCIAL_DEMO_DATA.md`
- **Technical Implementation**: See `INTEGRATION_GUIDE.md`
- **Presentation**: See `DEMO_SCRIPT.md`
- **Component Code**: See `CommercialClaimDemo.jsx`

---

## 📝 Version History

- **v1.0** (Feb 10, 2026): Initial creation
  - Complete demo data
  - React component
  - Full documentation suite
  - Presentation script

---

## 🚀 Next Steps

1. **Review the demo script** (`DEMO_SCRIPT.md`)
2. **Load the component** and explore interactively
3. **Read the scenario** (`COMMERCIAL_DEMO_DATA.md`) for context
4. **Practice the presentation** using the script
5. **Customize as needed** for your audience

---

**Demo Tagline**: *"Insurance that prevents losses, not just pays for them."*

**Ready to present?** Start with the DEMO_SCRIPT.md and have CommercialClaimDemo.jsx running in your browser. Good luck! 🎉
