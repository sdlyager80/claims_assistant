# Quick Start Guide - Claims Halstack Portal

## Setup Steps (IN ORDER)

### 1. Install Dependencies
```bash
cd claims_halstack
npm install
```
**Important:** Run `npm install` FIRST before any other commands!

### 2. Start Development Server
```bash
npm run dev
```
The app will be available at http://localhost:3000

### 3. Build for Production (Optional)
```bash
npm run build
```

## Common Issues & Solutions

### ❌ Error: "sh: tsc: not found"
**Solution:** Run `npm install` first to install all dependencies including TypeScript

### ❌ Error: "npm ci requires package-lock.json"
**Solution:** Use `npm install` instead for first-time setup

### ⚠️ Peer Dependency Warnings
**These are expected** - DXC Halstack uses Material-UI v4 which has React 16/17 peer deps. The app will work fine with React 18. The warnings are handled by the `.npmrc` file.

## Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (use this for development) |
| `npm run build` | Build for production (skips type checking) |
| `npm run build:check` | Build with TypeScript type checking |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Check TypeScript types without building |

## Configuration

### ServiceNow Integration
Update the ServiceNow instance URL in `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'https://YOUR-INSTANCE.service-now.com',
    changeOrigin: true,
    secure: false,
  },
}
```

### Port Configuration
Default port is 3000. Change in `vite.config.ts`:
```typescript
server: {
  port: 3000, // Change this number
}
```

## Folder Structure
```
claims_halstack/
├── src/
│   ├── pages/           # Route pages (ClaimsList, ClaimDetail, NewClaim)
│   ├── components/      # Reusable components
│   ├── services/        # API services (ServiceNow)
│   ├── types/           # TypeScript types
│   ├── utils/           # Helper functions
│   └── App.tsx          # Main app with routing
├── package.json         # Root level - no subfolders!
└── vite.config.ts       # Build configuration
```

## Development Workflow

1. **Start dev server:** `npm run dev`
2. **Make changes** to files in `src/`
3. **Hot reload** happens automatically
4. **Check types** (optional): `npm run type-check`
5. **Build** when ready: `npm run build`

## Next Steps

1. Configure your ServiceNow instance URL
2. Update the claims table name (`x_claims`) if different
3. Add your custom components to `src/components/`
4. Customize routes in `src/App.tsx`
5. Add authentication if needed
