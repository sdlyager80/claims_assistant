# Quick Start Guide - Bloom Claims Assistant Portal

Get up and running with the Claims Portal in minutes!

## Prerequisites

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or yarn
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

### 1. Clone and Navigate to Project

```bash
cd claims_halstack/claims-portal
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- React 18.3.1
- DXC Halstack React 16.0.0
- All required peer dependencies (@emotion/react, @emotion/styled)
- Vite build tool

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:5173**

## Project Structure Quick Overview

```
claims-portal/
├── src/
│   ├── components/
│   │   ├── Dashboard/           # Main dashboard with metrics and claims list
│   │   ├── ClaimsWorkbench/     # Detailed claim view
│   │   └── IntakeForms/         # New claim submission form
│   ├── App.jsx                   # Main app with navigation
│   └── main.jsx                  # Entry point
├── package.json
└── vite.config.js
```

## Key Features to Explore

### 1. Dashboard (Landing Page)
- View key metrics (Premium YTD, Pending Reviews, Approvals, Declines)
- Browse claims in the "My Priorities" section
- Search for claims by ID, name, or policy
- Click on any claim row to view details

### 2. Claims Workbench (Click "View" on any claim)
- **Timeline Tab**: Complete audit trail of claim activities
- **Policy 360 Tab**: Policy details and beneficiary information
- **Requirements Tab**: Track all requirements with statuses
- **Documents Tab**: View uploaded documents in accordion view
- Action buttons: Approve, Deny, Hold

### 3. New Claim Submission (Click "New Submission" in sidebar)
- **Step 1**: Enter claim information (type, policy, insured details)
- **Step 2**: Provide claimant information
- **Step 3**: Upload required documents
- Submit and receive claim confirmation

## Available Scripts

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Testing the Application

### Quick Test Flow

1. **Start the app**: `npm run dev`
2. **View Dashboard**: Observe metrics and claims table
3. **Navigate Tabs**: Try "Submissions", "Quotes", "Renewals" tabs
4. **Open Workbench**: Click "View" on any claim
5. **Explore Tabs**: Navigate through Timeline, Policy 360, Requirements, Documents
6. **Submit New Claim**: Go to "New Submission" and fill out the 3-step form
7. **Test Navigation**: Use sidebar to switch between views

### Sample Data

The portal comes with sample data for demonstration:
- **5 sample claims** in various states (In-Progress, Quote Required, New Submission)
- **Metrics**: $24.8M Premium YTD, 7 Pending Reviews, 42 Approvals, 7 Declines
- **Sample policy**: POL-2023-456789 with $500,000 coverage
- **2 beneficiaries**: Jane Smith (60%) and Michael Smith (40%)
- **5 requirements** with different statuses

## Customization Quick Tips

### Change Color Scheme

Edit the color constants in your components:

```jsx
// Dashboard.jsx or ClaimsWorkbench.jsx
const colors = {
  primary: '#5f249f',      // Bloom purple
  info: '#0095FF',         // Blue
  success: '#24A148',      // Green
  warning: '#FF6B00',      // Orange
  error: '#D0021B'         // Red
};
```

### Add New Metrics

In `Dashboard.jsx`, add to the metrics array:

```jsx
const metrics = [
  // ... existing metrics
  {
    title: 'YOUR METRIC',
    value: '123',
    change: '+5% vs last month',
    color: '#0095FF'
  }
];
```

### Add New Tab to Workbench

In `ClaimsWorkbench.jsx`:

```jsx
<DxcTabs.Tab
  label="Your Tab"
  onClick={() => setActiveTab(4)}
  active={activeTab === 4}
/>

{activeTab === 4 && (
  <YourCustomComponent />
)}
```

## Common Issues & Solutions

### Issue: Module not found errors

**Solution**: Make sure all dependencies are installed
```bash
cd claims-portal
npm install
```

### Issue: Port 5173 already in use

**Solution**: Stop other Vite processes or change the port
```bash
# Stop the process using port 5173, or:
npm run dev -- --port 3000
```

### Issue: Halstack components not rendering

**Solution**: Verify React version is 18.x (not 19)
```bash
npm list react
# Should show react@18.3.1

# If not, reinstall:
npm install react@18.3.1 react-dom@18.3.1
```

### Issue: Styling looks broken

**Solution**: Make sure @emotion packages are installed
```bash
npm install @emotion/react @emotion/styled
```

## Next Steps

### Phase 1: Familiarize Yourself

1. Explore all three main views (Dashboard, Workbench, Intake Forms)
2. Review the component structure in `/src/components`
3. Read `HALSTACK_COMPONENT_GUIDE.md` for component examples

### Phase 2: Customize

1. Update sample data with your own test data
2. Customize color scheme to match your branding
3. Add additional fields to forms as needed

### Phase 3: Integrate

1. Review `IMPLEMENTATION_GUIDE.md` for backend integration
2. Set up API client and endpoints
3. Implement authentication (SSO/MFA)
4. Connect to LexisNexis and other services

## Development Workflow

### Recommended Development Process

1. **Make Changes**: Edit files in `/src`
2. **Auto-Reload**: Vite will automatically reload your changes
3. **Check Console**: Open browser DevTools (F12) to check for errors
4. **Test Feature**: Verify functionality works as expected
5. **Commit**: Commit your changes with descriptive messages

### Best Practices

- **Component Organization**: Keep related components together in folders
- **Naming**: Use descriptive names for components and files
- **Comments**: Add comments for complex logic
- **Halstack Only**: Use only Halstack components to maintain consistency
- **Responsive**: Test on different screen sizes

## Resources

### Documentation

- [README.md](./README.md) - Project overview and features
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Backend integration details
- [HALSTACK_COMPONENT_GUIDE.md](./HALSTACK_COMPONENT_GUIDE.md) - Component examples

### External Resources

- [DXC Halstack Documentation](https://developer.dxc.com/halstack/)
- [Halstack GitHub](https://github.com/dxc-technology/halstack-react)
- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)

## Support

### Getting Help

1. **Check Documentation**: Start with the guides in this repository
2. **Halstack Docs**: Refer to official Halstack documentation
3. **GitHub Issues**: Check Halstack GitHub issues for known problems
4. **Team**: Contact your development team for project-specific questions

### Reporting Issues

When reporting issues, include:
- Node.js and npm versions (`node -v` and `npm -v`)
- Steps to reproduce the issue
- Error messages from console
- Screenshots if applicable

## Production Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `/dist` folder.

### Preview Production Build

```bash
npm run preview
```

Test the production build locally before deploying.

### Deploy

The `/dist` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Azure Static Web Apps
- Your own web server

## Congratulations!

You're now ready to start developing with the Bloom Claims Assistant Portal. Happy coding!

---

**Need help?** Check the comprehensive guides in this repository or contact your team lead.

**Pro Tip**: Keep the dev server running while you work for instant feedback on changes!
