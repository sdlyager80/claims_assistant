import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useClaims } from '../../contexts/ClaimsContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import serviceNowService from '../../services/api/serviceNowService';

const Dashboard = ({ onClaimSelect }) => {
  const [searchValue, setSearchValue] = useState('');
  const [snowClaims, setSnowClaims] = useState([]);
  const [snowLoading, setSnowLoading] = useState(false);

  const {
    claims,
    claimsLoading,
    fetchClaims,
  } = useClaims();

  const {
    slaAtRiskCases,
    fetchSLAAtRiskCases
  } = useWorkflow();

  // Fetch ServiceNow claims
  const fetchServiceNowClaims = async () => {
    if (!serviceNowService.isAuthenticated()) return;
    try {
      setSnowLoading(true);
      const fnolRecords = await serviceNowService.getFNOLsGlobal({ limit: 50 });
      const mappedClaims = fnolRecords.map(fnol => serviceNowService.mapFNOLToClaim(fnol));
      setSnowClaims(mappedClaims);
    } catch (err) {
      console.warn('[Dashboard] Could not fetch ServiceNow claims:', err.message);
      setSnowClaims([]);
    } finally {
      setSnowLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchSLAAtRiskCases();
    fetchServiceNowClaims();

    const unsubscribe = serviceNowService.onAuthChange((authenticated) => {
      if (authenticated) fetchServiceNowClaims();
    });

    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  // Merge claims
  const allClaims = useMemo(() => {
    if (!claims) return snowClaims;
    const demoClaims = [...claims];
    const existingSysIds = new Set(demoClaims.map(c => c.sysId).filter(Boolean));
    const uniqueSnowClaims = snowClaims.filter(sc => !existingSysIds.has(sc.sysId));
    return [...demoClaims, ...uniqueSnowClaims];
  }, [claims, snowClaims]);

  // Calculate metrics
  const openClaims = allClaims.filter(c => c.status !== 'Closed' && c.status !== 'Settled');
  const closedClaims = allClaims.filter(c => c.status === 'Closed' || c.status === 'Settled');
  const totalValue = allClaims.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
  const atRiskCount = slaAtRiskCases?.length || 0;

  // Filter claims by search
  const filteredClaims = useMemo(() => {
    if (!searchValue) return openClaims;
    const search = searchValue.toLowerCase();
    return openClaims.filter(claim =>
      claim.claimNumber?.toLowerCase().includes(search) ||
      claim.insuredName?.toLowerCase().includes(search) ||
      claim.policyNumber?.toLowerCase().includes(search)
    );
  }, [openClaims, searchValue]);

  // Recent claims (last 5)
  const recentClaims = useMemo(() => {
    return [...allClaims]
      .sort((a, b) => new Date(b.dateOfLoss || 0) - new Date(a.dateOfLoss || 0))
      .slice(0, 5);
  }, [allClaims]);

  // Stats cards data
  const statsCards = [
    {
      title: 'Open Claims',
      value: openClaims.length,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#4995FF',
      bgColor: '#E3F2FD',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Closed This Month',
      value: closedClaims.length,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
      bgColor: '#E8F5E9',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Total Claim Value',
      value: `$${(totalValue / 1000000).toFixed(1)}M`,
      icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
      color: '#FFC982',
      bgColor: '#FFF3E0',
      trend: '+15%',
      trendUp: true,
    },
    {
      title: 'At Risk (SLA)',
      value: atRiskCount,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: '#FF7E51',
      bgColor: '#FFE8E0',
      trend: '-5%',
      trendUp: false,
    },
  ];

  const getStatusColor = (status) => {
    const statusMap = {
      'Open': 'info',
      'Submitted': 'primary',
      'Under Review': 'warning',
      'Pending': 'warning',
      'Approved': 'success',
      'Closed': 'default',
      'Settled': 'success',
    };
    return statusMap[status] || 'default';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1B75BB' }}>
          Claims Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's your claims overview.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                height: '100%',
                /* BLOOM COMPLIANCE: No gradients - use flat color */
                background: '#FFFFFF',
                border: `2px solid ${stat.color}20`,
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        bgcolor: stat.bgColor,
                        borderRadius: 3,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${stat.color}40`,
                      }}
                    >
                      <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                    </Box>
                    <Chip
                      size="small"
                      label={stat.trend}
                      icon={stat.trendUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      sx={{
                        bgcolor: stat.trendUp ? '#E8F5E9' : '#FFE8E0',
                        color: stat.trendUp ? '#4CAF50' : '#FF7E51',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Alerts & Notifications */}
      {atRiskCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>SLA Alert</AlertTitle>
          You have <strong>{atRiskCount} claims</strong> at risk of missing SLA deadlines. Review them immediately.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Open Claims
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search claims..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300 }}
                />
              </Box>

              {(claimsLoading || snowLoading) && <LinearProgress sx={{ mb: 2 }} />}

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Claim #</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Insured</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClaims.slice(0, 10).map((claim) => (
                      <TableRow
                        key={claim.claimId || claim.sysId}
                        hover
                        sx={{ '&:hover': { bgcolor: '#A1E6FF10' } }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1B75BB' }}>
                            {claim.claimNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#808285', fontSize: '0.875rem' }}>
                              {claim.insuredName?.[0] || 'U'}
                            </Avatar>
                            <Typography variant="body2">{claim.insuredName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={claim.status}
                            color={getStatusColor(claim.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${claim.claimAmount?.toLocaleString() || '0'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {claim.dateOfLoss ? new Date(claim.dateOfLoss).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => onClaimSelect(claim)}
                              sx={{
                                color: '#1B75BB',
                                minHeight: 44,
                                '&:hover': { bgcolor: '#1B75BB14' }
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredClaims.length === 0 && !claimsLoading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No claims found</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats & Recent Activity */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Quick Actions */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AssignmentIcon />}
                    sx={{
                      justifyContent: 'flex-start',
                      minHeight: 44,
                      bgcolor: '#1B75BB',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#155f99' }
                    }}
                  >
                    New Claim Entry
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<SpeedIcon />}
                    sx={{
                      justifyContent: 'flex-start',
                      minHeight: 44,
                      color: '#1B75BB',
                      borderColor: '#1B75BB',
                      fontWeight: 600,
                      '&:hover': { borderColor: '#155f99', color: '#155f99', bgcolor: '#1B75BB14' }
                    }}
                  >
                    STP Review
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<SearchIcon />}
                    sx={{
                      justifyContent: 'flex-start',
                      minHeight: 44,
                      color: '#1B75BB',
                      borderColor: '#1B75BB',
                      fontWeight: 600,
                      '&:hover': { borderColor: '#155f99', color: '#155f99', bgcolor: '#1B75BB14' }
                    }}
                  >
                    Search Claims
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Recent Claims */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Activity
                </Typography>
                <Stack divider={<Divider />} spacing={2}>
                  {recentClaims.map((claim, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1B75BB' }}>
                          {claim.claimNumber}
                        </Typography>
                        <Chip
                          label={claim.status}
                          size="small"
                          color={getStatusColor(claim.status)}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 14 }} />
                        {claim.insuredName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <ScheduleIcon sx={{ fontSize: 14 }} />
                        {claim.dateOfLoss ? new Date(claim.dateOfLoss).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
