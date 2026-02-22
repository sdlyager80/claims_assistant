import { useState } from 'react';
import {
  ThemeProvider,
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  AddCircle as AddCircleIcon,
  Work as WorkIcon,
  PendingActions as PendingActionsIcon,
  Mail as MailIcon,
  Palette as PaletteIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

// Theme
import theme from './theme/muiTheme';

// Components
import Dashboard from './components/Dashboard/Dashboard';
import ClaimsWorkbench from './components/ClaimsWorkbench/ClaimsWorkbench';
import IntakeForms from './components/IntakeForms/IntakeForms';
import FNOLWorkspace from './components/FNOLWorkspace/FNOLWorkspace';
import PendingClaimsReview from './components/PendingClaimsReview/PendingClaimsReview';
import RequirementsReceived from './components/RequirementsReceived/RequirementsReceived';
import ClaimsHandlerDashboard from './components/ClaimsHandlerDashboard/ClaimsHandlerDashboard';
import ThemeSettings from './components/ThemeSettings/ThemeSettings';

// Context Providers
import { AppProvider, useApp } from './contexts/AppContext';
import { ClaimsProvider } from './contexts/ClaimsContext';
import { PolicyProvider } from './contexts/PolicyContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { DocumentProvider } from './contexts/DocumentContext';

// Services
import serviceNowService from './services/api/serviceNowService';

const DRAWER_WIDTH = 280;

function AppContent() {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { user } = useApp();

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);

  const handleClaimSelect = async (claim) => {
    console.log('[App] handleClaimSelect called with claim:', claim);
    setSelectedClaim(claim);
    setCurrentView('workbench');

    // Trigger beneficiary analysis API immediately when FNOL is clicked
    const sysId = claim?.sysId || claim?.sys_id || claim?.servicenow_sys_id;
    if (sysId && !sysId.startsWith('demo-')) {
      console.log('[App] Triggering beneficiary analysis for sys_id:', sysId);
      try {
        await serviceNowService.getBeneficiaryAnalyzer(sysId);
        console.log('[App] Beneficiary analysis triggered successfully');
      } catch (error) {
        console.error('[App] Error triggering beneficiary analysis:', error);
      }
    }
  };

  const handleNavigationClick = (view) => {
    setCurrentView(view);
    if (view !== 'workbench') {
      setSelectedClaim(null);
    }
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onClaimSelect={handleClaimSelect} />;
      case 'handlerDashboard':
        return <ClaimsHandlerDashboard />;
      case 'workbench':
        return (
          <ClaimsWorkbench
            claim={selectedClaim}
            onBack={() => handleNavigationClick('dashboard')}
          />
        );
      case 'intake':
        return <IntakeForms />;
      case 'fnolWorkspace':
        return <FNOLWorkspace onClaimSelect={handleClaimSelect} />;
      case 'pendingReview':
        return <PendingClaimsReview onClaimSelect={handleClaimSelect} />;
      case 'requirementsReceived':
        return <RequirementsReceived onClaimSelect={handleClaimSelect} />;
      default:
        return <Dashboard onClaimSelect={handleClaimSelect} />;
    }
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      view: 'dashboard',
    },
    {
      label: 'My Claims Workbench',
      icon: <AssignmentIcon />,
      view: 'handlerDashboard',
    },
    {
      label: 'New Claim FNOL Party Portal',
      icon: <AddCircleIcon />,
      view: 'intake',
    },
    {
      label: 'New FNOL Workspace',
      icon: <WorkIcon />,
      view: 'fnolWorkspace',
    },
    {
      label: 'Pending Claims Review',
      icon: <PendingActionsIcon />,
      view: 'pendingReview',
    },
    {
      label: 'Requirements Received',
      icon: <MailIcon />,
      view: 'requirementsReceived',
    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            edge="start"
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>

          <Box
            component="img"
            src="/Bloom_logo.jpg"
            alt="Bloom Insurance"
            sx={{ height: 40, mr: 2 }}
          />

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#1B75BB', fontWeight: 700 }}>
            Claims Assistant Portal
          </Typography>

          <IconButton
            color="inherit"
            onClick={() => setIsThemeSettingsOpen(true)}
            sx={{ mr: 2 }}
          >
            <PaletteIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.email || ''}
              </Typography>
            </Box>
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  bgcolor: '#1B75BB',
                  width: 40,
                  height: 40,
                  fontWeight: 600,
                }}
              >
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.view} disablePadding>
                <ListItemButton
                  selected={currentView === item.view}
                  onClick={() => handleNavigationClick(item.view)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: currentView === item.view ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ml: { sm: drawerOpen ? 0 : `-${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar />
        <Box sx={{ mt: 2 }}>
          {renderContent()}
        </Box>
      </Box>

      {/* Theme Settings Dialog */}
      <ThemeSettings
        isOpen={isThemeSettingsOpen}
        onClose={() => setIsThemeSettingsOpen(false)}
        onThemeChange={(colors) => {
          // Theme applied successfully
        }}
      />
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        <ClaimsProvider>
          <PolicyProvider>
            <WorkflowProvider>
              <DocumentProvider>
                <AppContent />
              </DocumentProvider>
            </WorkflowProvider>
          </PolicyProvider>
        </ClaimsProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
