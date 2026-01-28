import { useState, useMemo } from 'react';
import {
  DxcFlex,
  DxcCard,
  DxcTextInput,
  DxcBadge,
  DxcButton,
  DxcChip
} from '@dxc-technology/halstack-react';
import './Dashboard.css';

const DashboardSimple = ({ onClaimSelect, onNewClaim }) => {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const metrics = [
    {
      title: 'TOTAL CLAIMS PAID YTD',
      value: '$24.8M',
      change: '+12% vs last year',
      changePositive: true,
      color: '#0095FF',
      icon: '💰'
    },
    {
      title: 'PENDING CLAIMS',
      value: '23',
      change: '5 within SLA risk',
      changePositive: false,
      color: '#FF6B00',
      icon: '⏱️'
    },
    {
      title: 'APPROVED THIS MONTH',
      value: '42',
      change: '87% approval rate',
      changePositive: true,
      color: '#24A148',
      icon: '✓'
    },
    {
      title: 'AVG CYCLE TIME',
      value: '15 days',
      change: '30% faster than target',
      changePositive: true,
      color: '#0095FF',
      icon: '⚡'
    }
  ];

  const submissionsData = [
    {
      id: 'CLM-2026-001',
      insuredName: 'John Michael Smith',
      claimType: 'Death Claim',
      status: 'Pending Review',
      productType: 'Term Life',
      claimAmount: '$500,000',
      dateOfLoss: '12/15/2025',
      submitted: '01/05/2026',
      daysOpen: '14'
    },
    {
      id: 'CLM-2026-002',
      insuredName: 'Mary Elizabeth Johnson',
      claimType: 'Maturity',
      status: 'In Review',
      productType: 'Whole Life',
      claimAmount: '$250,000',
      dateOfLoss: '12/31/2025',
      submitted: '01/08/2026',
      daysOpen: '11'
    },
    {
      id: 'CLM-2026-003',
      insuredName: 'Robert James Williams',
      claimType: 'Death Claim',
      status: 'FastTrack Eligible',
      productType: 'Universal Life',
      claimAmount: '$750,000',
      dateOfLoss: '01/10/2026',
      submitted: '01/12/2026',
      daysOpen: '7'
    },
    {
      id: 'CLM-2026-004',
      insuredName: 'Patricia Ann Davis',
      claimType: 'Surrender',
      status: 'Approved',
      productType: 'Fixed Annuity',
      claimAmount: '$125,000',
      dateOfLoss: '01/01/2026',
      submitted: '01/03/2026',
      daysOpen: '16'
    },
    {
      id: 'CLM-2026-005',
      insuredName: 'Michael David Brown',
      claimType: 'Death Claim',
      status: 'Pending Requirements',
      productType: 'Variable Annuity',
      claimAmount: '$400,000',
      dateOfLoss: '12/28/2025',
      submitted: '01/06/2026',
      daysOpen: '13'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Review':
        return '#FF6B00';
      case 'In Review':
        return '#0095FF';
      case 'FastTrack Eligible':
        return '#24A148';
      case 'Approved':
        return '#24A148';
      case 'Pending Requirements':
        return '#D0021B';
      case 'On Hold':
        return '#999';
      default:
        return '#666';
    }
  };

  const statusOptions = [
    { label: 'All Claims', value: 'all' },
    { label: 'Pending Review', value: 'Pending Review' },
    { label: 'In Review', value: 'In Review' },
    { label: 'FastTrack Eligible', value: 'FastTrack Eligible' },
    { label: 'Pending Requirements', value: 'Pending Requirements' }
  ];

  // Filter and search logic
  const filteredClaims = useMemo(() => {
    return submissionsData.filter(claim => {
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      const matchesSearch = searchValue === '' ||
        claim.id.toLowerCase().includes(searchValue.toLowerCase()) ||
        claim.insuredName.toLowerCase().includes(searchValue.toLowerCase()) ||
        claim.productType.toLowerCase().includes(searchValue.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [searchValue, statusFilter]);

  return (
    <div className="dashboard-container" style={{ padding: '2rem', backgroundColor: '#fff', minHeight: '100vh' }}>
      <DxcFlex direction="column" gap="2rem">
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '32px', fontWeight: 600, color: '#333' }}>
            Claims Dashboard
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Life & Annuity Claims Management
          </p>
        </div>

        {/* Enhanced Metric Cards */}
        <DxcFlex gap="1.5rem" wrap="wrap">
          {metrics.map((metric, index) => (
            <DxcCard key={index} style={{
              flex: '1 1 22%',
              minWidth: '220px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}>
              <DxcFlex direction="column" gap="0.75rem">
                <DxcFlex justifyContent="space-between" alignItems="center">
                  <span style={{
                    fontSize: '11px',
                    color: '#666',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    {metric.title}
                  </span>
                  <span style={{ fontSize: '24px' }}>{metric.icon}</span>
                </DxcFlex>
                <span style={{
                  fontSize: '40px',
                  fontWeight: 700,
                  color: metric.color,
                  lineHeight: 1
                }}>
                  {metric.value}
                </span>
                <DxcFlex alignItems="center" gap="0.5rem">
                  <span style={{
                    fontSize: '11px',
                    color: metric.changePositive ? '#24A148' : '#FF6B00',
                    fontWeight: 600
                  }}>
                    {metric.changePositive ? '↑' : '↓'} {metric.change}
                  </span>
                </DxcFlex>
              </DxcFlex>
            </DxcCard>
          ))}
        </DxcFlex>

        {/* Claims List Section */}
        <div>
          <DxcFlex justifyContent="space-between" alignItems="center" margin={{ bottom: 'medium' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#333' }}>
              My Active Claims
            </h2>
            <button
              onClick={onNewClaim}
              style={{
                padding: '1rem 2rem',
                margin: '0.5rem 0',
                backgroundColor: '#0095FF',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s',
                boxShadow: '0 2px 4px rgba(0, 149, 255, 0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0077CC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0095FF'}
            >
              <span style={{ fontSize: '18px' }}>+</span>
              New Claim (FNOL)
            </button>
          </DxcFlex>

          {/* Search and Filters */}
          <DxcFlex gap="1rem" margin={{ bottom: 'medium' }} alignItems="flex-end">
            <div style={{ flex: 1 }}>
              <DxcTextInput
                label=""
                placeholder="Search by Claim ID, Insured Name, or Policy Number..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                clearable
              />
            </div>
            <DxcFlex gap="0.5rem" wrap="wrap">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: statusFilter === option.value ? '#0095FF' : '#fff',
                    color: statusFilter === option.value ? '#fff' : '#666',
                    border: `1px solid ${statusFilter === option.value ? '#0095FF' : '#d0d0d0'}`,
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: statusFilter === option.value ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (statusFilter !== option.value) {
                      e.currentTarget.style.borderColor = '#0095FF';
                      e.currentTarget.style.color = '#0095FF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (statusFilter !== option.value) {
                      e.currentTarget.style.borderColor = '#d0d0d0';
                      e.currentTarget.style.color = '#666';
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </DxcFlex>
          </DxcFlex>

          {/* Results Count */}
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <DxcFlex justifyContent="space-between" alignItems="center">
              <span style={{ fontSize: '14px', color: '#666' }}>
                Showing <strong>{filteredClaims.length}</strong> of <strong>{submissionsData.length}</strong> claims
              </span>
              <DxcFlex gap="0.5rem" alignItems="center">
                <span style={{ fontSize: '12px', color: '#999' }}>Sort by:</span>
                <button
                  style={{
                    padding: '0.4rem 0.8rem',
                    backgroundColor: '#666',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#666'}
                >
                  Days Open
                </button>
              </DxcFlex>
            </DxcFlex>
          </div>

          {/* Enhanced Table */}
          <div className="table-container" style={{
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#333' }}>Claim ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#333' }}>Insured Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#333' }}>Claim Type</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#333' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#333' }}>Product</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, fontSize: '13px', color: '#333' }}>Claim Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#333' }}>Days Open</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#333' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '3rem', textAlign: 'center' }}>
                      <div style={{ color: '#999' }}>
                        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔍</div>
                        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.5rem' }}>No claims found</div>
                        <div style={{ fontSize: '14px' }}>Try adjusting your search or filters</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((claim, index) => (
                    <tr key={index} style={{
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          color: '#0095FF',
                          fontWeight: 600,
                          fontSize: '14px'
                        }}>
                          {claim.id}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '14px' }}>{claim.insuredName}</td>
                      <td style={{ padding: '1rem', fontSize: '14px' }}>{claim.claimType}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: getStatusColor(claim.status) + '20',
                          color: getStatusColor(claim.status),
                          border: `1px solid ${getStatusColor(claim.status)}`
                        }}>
                          {claim.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '14px', color: '#666' }}>{claim.productType}</td>
                      <td style={{ padding: '1rem', fontWeight: 600, fontSize: '15px', textAlign: 'right' }}>{claim.claimAmount}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <DxcChip
                          label={claim.daysOpen}
                          style={{
                            backgroundColor: parseInt(claim.daysOpen) > 14 ? '#fff3e0' : '#e8f5e9',
                            color: parseInt(claim.daysOpen) > 14 ? '#FF6B00' : '#24A148',
                            fontWeight: 600
                          }}
                        />
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => onClaimSelect(claim)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#666',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#666'}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DxcFlex>
    </div>
  );
};

export default DashboardSimple;
