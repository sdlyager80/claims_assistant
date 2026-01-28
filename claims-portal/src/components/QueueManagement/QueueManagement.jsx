import { useState } from 'react';
import {
  DxcFlex,
  DxcCard,
  DxcButton,
  DxcChip,
  DxcTextInput
} from '@dxc-technology/halstack-react';

const QueueManagement = () => {
  const [selectedQueue, setSelectedQueue] = useState('myqueue');
  const [searchValue, setSearchValue] = useState('');

  const queueMetrics = [
    {
      title: 'MY QUEUE',
      value: '8',
      subtitle: '2 high priority',
      color: 'var(--color-blue-700)',
      icon: '👤'
    },
    {
      title: 'TEAM QUEUE',
      value: '23',
      subtitle: '5 unassigned',
      color: 'var(--color-green-700)',
      icon: '👥'
    },
    {
      title: 'SLA AT RISK',
      value: '5',
      subtitle: 'Requires attention',
      color: 'var(--color-red-700)',
      icon: '⚠️'
    },
    {
      title: 'FASTTRACK READY',
      value: '12',
      subtitle: 'Auto-approve eligible',
      color: 'var(--color-green-700)',
      icon: '⚡'
    }
  ];

  const queueClaims = [
    {
      id: 'CLM-2026-006',
      insuredName: 'Jennifer Martinez',
      claimType: 'Death Claim',
      status: 'Pending Review',
      priority: 'High',
      assignedTo: 'Sarah Johnson',
      daysOpen: '18',
      slaDate: '01/22/2026',
      claimAmount: '$850,000'
    },
    {
      id: 'CLM-2026-007',
      insuredName: 'David Thompson',
      claimType: 'Maturity',
      status: 'In Review',
      priority: 'Medium',
      assignedTo: 'Sarah Johnson',
      daysOpen: '9',
      slaDate: '01/28/2026',
      claimAmount: '$350,000'
    },
    {
      id: 'CLM-2026-008',
      insuredName: 'Maria Garcia',
      claimType: 'Surrender',
      status: 'Pending Requirements',
      priority: 'High',
      assignedTo: 'Unassigned',
      daysOpen: '21',
      slaDate: '01/20/2026',
      claimAmount: '$175,000'
    },
    {
      id: 'CLM-2026-009',
      insuredName: 'James Wilson',
      claimType: 'Death Claim',
      status: 'FastTrack Eligible',
      priority: 'Low',
      assignedTo: 'Sarah Johnson',
      daysOpen: '3',
      slaDate: '02/05/2026',
      claimAmount: '$500,000'
    },
    {
      id: 'CLM-2026-010',
      insuredName: 'Lisa Anderson',
      claimType: 'Death Claim',
      status: 'In Review',
      priority: 'Medium',
      assignedTo: 'Mike Chen',
      daysOpen: '12',
      slaDate: '01/30/2026',
      claimAmount: '$625,000'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Review':
        return 'var(--color-orange-700)';
      case 'In Review':
        return 'var(--color-blue-700)';
      case 'FastTrack Eligible':
        return 'var(--color-green-700)';
      case 'Pending Requirements':
        return 'var(--color-red-700)';
      default:
        return '#666';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'var(--color-red-700)';
      case 'Medium':
        return 'var(--color-orange-700)';
      case 'Low':
        return 'var(--color-green-700)';
      default:
        return '#666';
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#fff', minHeight: '100vh' }}>
      <DxcFlex direction="column" gap="2rem">
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '32px', fontWeight: 600, color: '#333' }}>
            Queue Management
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Manage and prioritize claims across teams
          </p>
        </div>

        {/* Queue Metrics */}
        <DxcFlex gap="1.5rem" wrap="wrap">
          {queueMetrics.map((metric, index) => (
            <DxcCard key={index} style={{
              flex: '1 1 22%',
              minWidth: '220px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              border: '1px solid #e0e0e0'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <DxcFlex direction="column" gap="0.75rem">
                <DxcFlex justifyContent="space-between" alignItems="center">
                  <span style={{
                    fontSize: '11px',
                    color: '#666',
                    fontWeight: 600,
                    letterSpacing: '0.5px'
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
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {metric.subtitle}
                </span>
              </DxcFlex>
            </DxcCard>
          ))}
        </DxcFlex>

        {/* Queue Selector */}
        <DxcFlex gap="1rem" alignItems="center">
          {[
            { label: 'My Queue', value: 'myqueue' },
            { label: 'Team Queue', value: 'team' },
            { label: 'SLA at Risk', value: 'sla' },
            { label: 'FastTrack', value: 'fasttrack' }
          ].map((queue) => (
            <button
              key={queue.value}
              onClick={() => setSelectedQueue(queue.value)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: selectedQueue === queue.value ? '#0095FF' : '#fff',
                color: selectedQueue === queue.value ? '#fff' : '#666',
                border: `2px solid ${selectedQueue === queue.value ? '#0095FF' : '#d0d0d0'}`,
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: selectedQueue === queue.value ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedQueue !== queue.value) {
                  e.currentTarget.style.borderColor = '#0095FF';
                  e.currentTarget.style.color = '#0095FF';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedQueue !== queue.value) {
                  e.currentTarget.style.borderColor = '#d0d0d0';
                  e.currentTarget.style.color = '#666';
                }
              }}
            >
              {queue.label}
            </button>
          ))}
        </DxcFlex>

        {/* Search and Actions */}
        <DxcFlex gap="1rem" justifyContent="space-between" alignItems="center">
          <div style={{ flex: 1 }}>
            <DxcTextInput
              label=""
              placeholder="Search queue..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              clearable
            />
          </div>
          <DxcFlex gap="0.5rem">
            <DxcButton label="Bulk Assign" mode="secondary" size="medium" />
            <DxcButton label="Export" mode="tertiary" size="medium" />
          </DxcFlex>
        </DxcFlex>

        {/* Queue Table */}
        <div style={{
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
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>
                  <input type="checkbox" />
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#333' }}>Priority</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#333' }}>Claim ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#333' }}>Insured Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#333' }}>Type</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#333' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#333' }}>Assigned To</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#333' }}>Days Open</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#333' }}>SLA Date</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#333' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queueClaims.map((claim, index) => (
                <tr key={index} style={{
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem' }}>
                    <input type="checkbox" />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: getPriorityColor(claim.priority),
                      color: '#fff',
                      border: 'none'
                    }}>
                      {claim.priority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: '#0095FF', fontWeight: 600, fontSize: '14px' }}>
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
                  <td style={{ padding: '1rem', fontSize: '14px', color: claim.assignedTo === 'Unassigned' ? '#D0021B' : '#333' }}>
                    {claim.assignedTo}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <DxcChip
                      label={claim.daysOpen}
                      style={{
                        backgroundColor: parseInt(claim.daysOpen) > 15 ? '#fff3e0' : '#e8f5e9',
                        color: parseInt(claim.daysOpen) > 15 ? '#FF6B00' : '#24A148',
                        fontWeight: 600
                      }}
                    />
                  </td>
                  <td style={{ padding: '1rem', fontSize: '13px', color: '#666' }}>{claim.slaDate}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <DxcButton
                      mode="text"
                      label="Assign to Me"
                      size="small"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DxcFlex>
    </div>
  );
};

export default QueueManagement;
