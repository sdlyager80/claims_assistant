import { useState } from 'react';
import {
  DxcFlex,
  DxcCard,
  DxcBadge,
  DxcButton,
  DxcAccordion,
  DxcTextarea,
  DxcTextInput
} from '@dxc-technology/halstack-react';

const ClaimsWorkbenchSimple = ({ claim, onBack }) => {
  const [activeTab, setActiveTab] = useState('timeline');
  const [newNote, setNewNote] = useState('');

  // Mock timeline data
  const timelineEvents = [
    {
      date: '01/19/2026 - 9:15 AM',
      type: 'Status Change',
      user: 'Sarah Johnson',
      description: 'Claim status updated to In Review',
      icon: '🔄'
    },
    {
      date: '01/18/2026 - 2:30 PM',
      type: 'Document Received',
      user: 'System',
      description: 'Death certificate uploaded and processed via IDP',
      icon: '📄'
    },
    {
      date: '01/17/2026 - 11:00 AM',
      type: 'Requirements Sent',
      user: 'Sarah Johnson',
      description: 'Outstanding requirements letter sent to beneficiary',
      icon: '📧'
    },
    {
      date: '01/15/2026 - 3:45 PM',
      type: 'Claim Assigned',
      user: 'System',
      description: 'Claim automatically assigned to Sarah Johnson',
      icon: '👤'
    },
    {
      date: '01/15/2026 - 2:00 PM',
      type: 'Claim Created',
      user: 'System',
      description: 'New death claim received via FNOL portal',
      icon: '✨'
    }
  ];

  // Mock policy details
  const policyDetails = {
    policyNumber: 'POL-2019-45821',
    productType: claim?.productType || 'Term Life',
    issueDate: '03/15/2019',
    faceAmount: claim?.claimAmount || '$500,000',
    premiumMode: 'Monthly',
    premiumAmount: '$125.00',
    policyStatus: 'Active',
    beneficiaries: [
      { name: 'Jane Smith', relationship: 'Spouse', percentage: '60%' },
      { name: 'Michael Smith', relationship: 'Child', percentage: '40%' }
    ]
  };

  // Mock requirements
  const requirements = [
    {
      id: 1,
      name: 'Death Certificate',
      status: 'Received',
      dueDate: '01/25/2026',
      receivedDate: '01/18/2026',
      color: '#24A148'
    },
    {
      id: 2,
      name: 'Claimant Statement',
      status: 'Pending',
      dueDate: '01/25/2026',
      receivedDate: null,
      color: '#FF6B00'
    },
    {
      id: 3,
      name: 'Beneficiary ID Verification',
      status: 'In Review',
      dueDate: '01/25/2026',
      receivedDate: '01/17/2026',
      color: '#0095FF'
    },
    {
      id: 4,
      name: 'Medical Records',
      status: 'Received',
      dueDate: '01/25/2026',
      receivedDate: '01/16/2026',
      color: '#24A148'
    }
  ];

  // Mock documents
  const documents = [
    { name: 'Death_Certificate.pdf', uploadDate: '01/18/2026', size: '2.4 MB', type: 'Death Certificate' },
    { name: 'Claimant_Form.pdf', uploadDate: '01/17/2026', size: '1.1 MB', type: 'Claimant Statement' },
    { name: 'Policy_Document.pdf', uploadDate: '01/15/2026', size: '3.2 MB', type: 'Policy' },
    { name: 'Beneficiary_ID.pdf', uploadDate: '01/17/2026', size: '0.8 MB', type: 'ID Verification' }
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
      default:
        return '#666';
    }
  };

  return (
    <div className="workbench-container" style={{ padding: '2rem', backgroundColor: '#fff', minHeight: '100vh' }}>
      <DxcFlex direction="column" gap="2rem">
        {/* Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <div>
            <DxcButton
              mode="text"
              label="← Back to Dashboard"
              onClick={onBack}
              style={{ marginBottom: '1rem' }}
            />
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '32px', fontWeight: 600, color: '#333' }}>
              Claim: {claim?.id || 'CLM-2026-001'}
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              {claim?.insuredName || 'John Michael Smith'} • {claim?.claimType || 'Death Claim'}
            </p>
          </div>
          <DxcFlex gap="1rem" alignItems="center">
            <DxcBadge
              label={claim?.status || 'Pending Review'}
              color={getStatusColor(claim?.status)}
              mode="outlined"
            />
            <button
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#24A148',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e8a3d'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#24A148'}
            >
              Approve Claim
            </button>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#fff',
                color: '#666',
                border: '2px solid #d0d0d0',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0095FF';
                e.currentTarget.style.color = '#0095FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d0d0d0';
                e.currentTarget.style.color = '#666';
              }}
            >
              Request Info
            </button>
          </DxcFlex>
        </DxcFlex>

        {/* Key Metrics */}
        <DxcFlex gap="1.5rem" wrap="wrap">
          <DxcCard style={{ flex: '1 1 22%', minWidth: '180px' }}>
            <DxcFlex direction="column" gap="0.5rem">
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>CLAIM AMOUNT</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#0095FF' }}>
                {claim?.claimAmount || '$500,000'}
              </span>
            </DxcFlex>
          </DxcCard>
          <DxcCard style={{ flex: '1 1 22%', minWidth: '180px' }}>
            <DxcFlex direction="column" gap="0.5rem">
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>DAYS OPEN</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#FF6B00' }}>
                {claim?.daysOpen || '14'}
              </span>
            </DxcFlex>
          </DxcCard>
          <DxcCard style={{ flex: '1 1 22%', minWidth: '180px' }}>
            <DxcFlex direction="column" gap="0.5rem">
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>DATE OF LOSS</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#666' }}>
                {claim?.dateOfLoss || '12/15/2025'}
              </span>
            </DxcFlex>
          </DxcCard>
          <DxcCard style={{ flex: '1 1 22%', minWidth: '180px' }}>
            <DxcFlex direction="column" gap="0.5rem">
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>FASTTRACK ELIGIBLE</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#24A148' }}>
                Yes
              </span>
            </DxcFlex>
          </DxcCard>
        </DxcFlex>

        {/* Tab Navigation */}
        <div>
          <DxcFlex gap="0.5rem" style={{ borderBottom: '2px solid #e0e0e0', paddingBottom: '0' }}>
            {['timeline', 'policy', 'requirements', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: activeTab === tab ? '#0095FF' : '#666',
                  fontWeight: activeTab === tab ? 600 : 400,
                  fontSize: '14px',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab ? '3px solid #0095FF' : '3px solid transparent',
                  marginBottom: '-2px',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </DxcFlex>
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '400px' }}>
          {activeTab === 'timeline' && (
            <DxcFlex direction="column" gap="1.5rem">
              <div>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '20px', fontWeight: 600, color: '#333' }}>
                  Claim Timeline
                </h3>
                <DxcFlex direction="column" gap="1rem">
                  {timelineEvents.map((event, index) => (
                    <DxcCard key={index}>
                      <DxcFlex gap="1rem" alignItems="flex-start">
                        <span style={{ fontSize: '32px' }}>{event.icon}</span>
                        <div style={{ flex: 1 }}>
                          <DxcFlex justifyContent="space-between" alignItems="flex-start">
                            <div>
                              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '16px', fontWeight: 600, color: '#333' }}>
                                {event.type}
                              </h4>
                              <p style={{ margin: '0 0 0.5rem 0', fontSize: '14px', color: '#666' }}>
                                {event.description}
                              </p>
                              <span style={{ fontSize: '12px', color: '#999' }}>
                                {event.user} • {event.date}
                              </span>
                            </div>
                          </DxcFlex>
                        </div>
                      </DxcFlex>
                    </DxcCard>
                  ))}
                </DxcFlex>
              </div>

              {/* Add Note */}
              <DxcCard>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: 600, color: '#333' }}>
                  Add Note
                </h4>
                <DxcTextarea
                  label=""
                  placeholder="Enter your note here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <div style={{ marginTop: '1rem' }}>
                  <button
                    style={{
                      padding: '0.5rem 1.25rem',
                      backgroundColor: '#0095FF',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0077CC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0095FF'}
                  >
                    Add Note
                  </button>
                </div>
              </DxcCard>
            </DxcFlex>
          )}

          {activeTab === 'policy' && (
            <DxcFlex direction="column" gap="1.5rem">
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '20px', fontWeight: 600, color: '#333' }}>
                Policy Details
              </h3>

              <DxcCard>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: 600, color: '#333' }}>
                  Policy Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>Policy Number</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '14px', color: '#333' }}>{policyDetails.policyNumber}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>Product Type</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '14px', color: '#333' }}>{policyDetails.productType}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>Issue Date</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '14px', color: '#333' }}>{policyDetails.issueDate}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>Face Amount</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '14px', color: '#333', fontWeight: 600 }}>{policyDetails.faceAmount}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>Premium Mode</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '14px', color: '#333' }}>{policyDetails.premiumMode}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>Premium Amount</span>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '14px', color: '#333' }}>{policyDetails.premiumAmount}</p>
                  </div>
                </div>
              </DxcCard>

              <DxcCard>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: 600, color: '#333' }}>
                  Beneficiaries
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '13px', fontWeight: 600 }}>Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '13px', fontWeight: 600 }}>Relationship</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyDetails.beneficiaries.map((ben, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.75rem', fontSize: '14px' }}>{ben.name}</td>
                        <td style={{ padding: '0.75rem', fontSize: '14px' }}>{ben.relationship}</td>
                        <td style={{ padding: '0.75rem', fontSize: '14px', textAlign: 'right', fontWeight: 600 }}>{ben.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DxcCard>
            </DxcFlex>
          )}

          {activeTab === 'requirements' && (
            <DxcFlex direction="column" gap="1.5rem">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#333' }}>
                  Outstanding Requirements
                </h3>
                <DxcButton label="Request Document" mode="secondary" size="small" />
              </DxcFlex>

              <DxcFlex direction="column" gap="1rem">
                {requirements.map((req) => (
                  <DxcCard key={req.id}>
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '16px', fontWeight: 600, color: '#333' }}>
                          {req.name}
                        </h4>
                        <DxcFlex gap="1rem" alignItems="center">
                          <span style={{ fontSize: '13px', color: '#666' }}>
                            Due: {req.dueDate}
                          </span>
                          {req.receivedDate && (
                            <span style={{ fontSize: '13px', color: '#666' }}>
                              Received: {req.receivedDate}
                            </span>
                          )}
                        </DxcFlex>
                      </div>
                      <DxcBadge
                        label={req.status}
                        color={req.color}
                        mode="outlined"
                      />
                    </DxcFlex>
                  </DxcCard>
                ))}
              </DxcFlex>
            </DxcFlex>
          )}

          {activeTab === 'documents' && (
            <DxcFlex direction="column" gap="1.5rem">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#333' }}>
                  Documents
                </h3>
                <button
                  style={{
                    padding: '0.5rem 1.25rem',
                    backgroundColor: '#0095FF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0077CC'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0095FF'}
                >
                  Upload Document
                </button>
              </DxcFlex>

              <div style={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '13px', fontWeight: 600 }}>Document Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '13px', fontWeight: 600 }}>Type</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '13px', fontWeight: 600 }}>Upload Date</th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>Size</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '1rem', fontSize: '14px', color: '#0095FF', fontWeight: 500 }}>{doc.name}</td>
                        <td style={{ padding: '1rem', fontSize: '14px' }}>{doc.type}</td>
                        <td style={{ padding: '1rem', fontSize: '14px' }}>{doc.uploadDate}</td>
                        <td style={{ padding: '1rem', fontSize: '14px', textAlign: 'right' }}>{doc.size}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <DxcButton label="View" mode="text" size="small" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DxcFlex>
          )}
        </div>
      </DxcFlex>
    </div>
  );
};

export default ClaimsWorkbenchSimple;
