import { DxcFlex, DxcCard, DxcChip } from '@dxc-technology/halstack-react';

const ReportsAnalytics = () => {
  const kpiMetrics = [
    {
      title: 'CLAIMS PROCESSED YTD',
      value: '1,247',
      change: '+15% vs 2025',
      changePositive: true,
      color: 'var(--color-blue-700)',
      icon: '📊'
    },
    {
      title: 'TOTAL PAID AMOUNT',
      value: '$24.8M',
      change: '+12% vs 2025',
      changePositive: true,
      color: 'var(--color-green-700)',
      icon: '💵'
    },
    {
      title: 'AVG CYCLE TIME',
      value: '15 days',
      change: '-25% vs target',
      changePositive: true,
      color: 'var(--color-blue-700)',
      icon: '⚡'
    },
    {
      title: 'APPROVAL RATE',
      value: '87%',
      change: '+3% vs 2025',
      changePositive: true,
      color: 'var(--color-green-700)',
      icon: '✓'
    }
  ];

  const claimsByType = [
    { type: 'Death Claim', count: 548, percentage: 44, amount: '$14.2M', color: 'var(--color-blue-700)' },
    { type: 'Maturity', count: 312, percentage: 25, amount: '$6.8M', color: 'var(--color-green-700)' },
    { type: 'Surrender', count: 267, percentage: 21, amount: '$2.9M', color: 'var(--color-orange-700)' },
    { type: 'Withdrawal', count: 120, percentage: 10, amount: '$900K', color: 'var(--color-red-700)' }
  ];

  const claimsByProduct = [
    { product: 'Term Life', count: 423, percentage: 34, avgAmount: '$485K' },
    { product: 'Whole Life', count: 298, percentage: 24, avgAmount: '$625K' },
    { product: 'Universal Life', count: 267, percentage: 21, avgAmount: '$750K' },
    { product: 'Fixed Annuity', count: 156, percentage: 13, avgAmount: '$245K' },
    { product: 'Variable Annuity', count: 103, percentage: 8, avgAmount: '$385K' }
  ];

  const cycleTimeByStatus = [
    { status: 'Approved', avgDays: 12, count: 1085, color: 'var(--color-green-700)' },
    { status: 'Pending Review', avgDays: 8, count: 89, color: 'var(--color-orange-700)' },
    { status: 'Pending Requirements', avgDays: 22, count: 45, color: 'var(--color-red-700)' },
    { status: 'In Review', avgDays: 15, count: 28, color: 'var(--color-blue-700)' }
  ];

  const topExaminers = [
    { name: 'Sarah Johnson', processed: 142, approved: 128, avgCycle: 13, approvalRate: 90 },
    { name: 'Mike Chen', processed: 138, approved: 121, avgCycle: 14, approvalRate: 88 },
    { name: 'Emily Rodriguez', processed: 129, approved: 115, avgCycle: 12, approvalRate: 89 },
    { name: 'David Kim', processed: 125, approved: 105, avgCycle: 16, approvalRate: 84 },
    { name: 'Lisa Anderson', processed: 118, approved: 103, avgCycle: 15, approvalRate: 87 }
  ];

  return (
    <div style={{ padding: '2rem', backgroundColor: '#fff', minHeight: '100vh' }}>
      <DxcFlex direction="column" gap="2rem">
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '32px', fontWeight: 600, color: '#333' }}>
            Reports & Analytics
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Comprehensive insights into claims performance and trends
          </p>
        </div>

        {/* KPI Metrics */}
        <DxcFlex gap="1.5rem" wrap="wrap">
          {kpiMetrics.map((metric, index) => (
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

        {/* Claims by Type and Product */}
        <DxcFlex gap="1.5rem" wrap="wrap">
          {/* Claims by Type */}
          <DxcCard style={{ flex: '1 1 48%', minWidth: '400px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '20px', fontWeight: 600, color: '#333' }}>
              Claims by Type
            </h2>
            <DxcFlex direction="column" gap="1rem">
              {claimsByType.map((item, index) => (
                <div key={index}>
                  <DxcFlex justifyContent="space-between" alignItems="center" margin={{ bottom: 'xxsmall' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{item.type}</span>
                    <DxcFlex gap="1rem" alignItems="center">
                      <span style={{ fontSize: '13px', color: '#666' }}>{item.count} claims</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: item.color }}>{item.amount}</span>
                    </DxcFlex>
                  </DxcFlex>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${item.percentage}%`,
                      height: '100%',
                      backgroundColor: item.color,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#999', marginTop: '0.25rem', display: 'inline-block' }}>
                    {item.percentage}% of total claims
                  </span>
                </div>
              ))}
            </DxcFlex>
          </DxcCard>

          {/* Claims by Product */}
          <DxcCard style={{ flex: '1 1 48%', minWidth: '400px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '20px', fontWeight: 600, color: '#333' }}>
              Claims by Product Type
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666' }}>Product</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#666' }}>Count</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#666' }}>Share</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, fontSize: '13px', color: '#666' }}>Avg Amount</th>
                </tr>
              </thead>
              <tbody>
                {claimsByProduct.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.75rem', fontSize: '14px', color: '#333' }}>{item.product}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#0095FF' }}>{item.count}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <DxcChip
                        label={`${item.percentage}%`}
                        style={{
                          backgroundColor: '#e8f5e9',
                          color: 'var(--color-green-700)',
                          fontWeight: 600
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '14px', fontWeight: 600 }}>{item.avgAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DxcCard>
        </DxcFlex>

        {/* Cycle Time and Top Examiners */}
        <DxcFlex gap="1.5rem" wrap="wrap">
          {/* Cycle Time by Status */}
          <DxcCard style={{ flex: '1 1 48%', minWidth: '400px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '20px', fontWeight: 600, color: '#333' }}>
              Average Cycle Time by Status
            </h2>
            <DxcFlex direction="column" gap="1.25rem">
              {cycleTimeByStatus.map((item, index) => (
                <div key={index}>
                  <DxcFlex justifyContent="space-between" alignItems="center" margin={{ bottom: 'xxsmall' }}>
                    <DxcFlex gap="0.75rem" alignItems="center">
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: item.color + '20',
                        color: item.color,
                        border: `1px solid ${item.color}`
                      }}>
                        {item.status}
                      </span>
                      <span style={{ fontSize: '13px', color: '#999' }}>({item.count} claims)</span>
                    </DxcFlex>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: item.color }}>{item.avgDays} days</span>
                  </DxcFlex>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(item.avgDays / 25) * 100}%`,
                      height: '100%',
                      backgroundColor: item.color,
                      borderRadius: '3px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              ))}
            </DxcFlex>
          </DxcCard>

          {/* Top Performing Examiners */}
          <DxcCard style={{ flex: '1 1 48%', minWidth: '400px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '20px', fontWeight: 600, color: '#333' }}>
              Top Performing Examiners
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666' }}>Examiner</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#666' }}>Processed</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#666' }}>Approved</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#666' }}>Avg Cycle</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#666' }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {topExaminers.map((examiner, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <DxcFlex gap="0.5rem" alignItems="center">
                        {index < 3 && <span style={{ fontSize: '16px' }}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>}
                        <span style={{ fontSize: '14px', color: '#333', fontWeight: index < 3 ? 600 : 400 }}>
                          {examiner.name}
                        </span>
                      </DxcFlex>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '14px', color: '#0095FF', fontWeight: 600 }}>
                      {examiner.processed}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '14px', color: '#24A148', fontWeight: 600 }}>
                      {examiner.approved}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '14px' }}>
                      {examiner.avgCycle} days
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <DxcChip
                        label={`${examiner.approvalRate}%`}
                        style={{
                          backgroundColor: examiner.approvalRate >= 88 ? '#e8f5e9' : '#fff3e0',
                          color: examiner.approvalRate >= 88 ? '#24A148' : '#FF6B00',
                          fontWeight: 600
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DxcCard>
        </DxcFlex>

        {/* Export and Filter Options */}
        <DxcCard>
          <DxcFlex justifyContent="space-between" alignItems="center">
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '16px', fontWeight: 600, color: '#333' }}>
                Export Options
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                Download comprehensive reports and data exports
              </p>
            </div>
            <DxcFlex gap="0.75rem">
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#fff',
                color: 'var(--color-blue-700)',
                border: '2px solid #0095FF',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E6F4FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
              }}>
                Export to Excel
              </button>
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0095FF',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0077CC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0095FF'}>
                Generate PDF Report
              </button>
            </DxcFlex>
          </DxcFlex>
        </DxcCard>
      </DxcFlex>
    </div>
  );
};

export default ReportsAnalytics;
