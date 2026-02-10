import React, { useState } from 'react';
import {
  DxcApplicationLayout,
  DxcCard,
  DxcFlex,
  DxcBadge,
  DxcProgressBar,
  DxcTabs,
  DxcTable,
  DxcAccordion,
  DxcButton,
  DxcAlert
} from '@dxc-technology/halstack-react';
import commercialClaimData from '../data/commercialClaimDemo.json';

const CommercialClaimDemo = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { claim, insured, policy, timeline, requirements, documents, fastTrackCriteria, adjuster, damageAssessment, aiInsights } = commercialClaimData;

  // Fast-Track Alert Banner
  const FastTrackAlert = () => (
    <DxcAlert
      type="success"
      mode="inline"
      size="fitContent"
      inlineText={
        <div>
          <strong>⚡ Fast-Track Processing Approved</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
            Your claim has been fast-tracked because you followed all recommended prevention measures.
            Emergency mitigation approved - work can begin immediately.
          </p>
        </div>
      }
    />
  );

  // Claim Header Section
  const ClaimHeader = () => (
    <DxcCard style={{ marginBottom: '24px' }}>
      <DxcFlex direction="column" gap="1rem">
        {/* Fast-Track Alert */}
        {fastTrackCriteria.eligible && <FastTrackAlert />}

        {/* Claim Overview */}
        <DxcFlex justifyContent="space-between" alignItems="flex-start">
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#5f249f' }}>
              {claim.claimNumber}
            </h1>
            <DxcFlex gap="0.5rem" alignItems="center">
              <DxcBadge
                label={claim.status}
                color="#24A148"
                size="large"
              />
              <DxcBadge
                label={claim.priority}
                color="#FF6B00"
                size="medium"
              />
              {fastTrackCriteria.eligible && (
                <DxcBadge
                  label="⚡ Fast-Track"
                  color="#5f249f"
                  size="medium"
                />
              )}
            </DxcFlex>
            <p style={{ margin: '12px 0 0 0', fontSize: '16px', color: '#666' }}>
              <strong>{claim.type}</strong> • {claim.location}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Date of Loss</p>
            <p style={{ margin: '4px 0', fontSize: '20px', fontWeight: 600 }}>
              {new Date(claim.dateOfLoss).toLocaleDateString()}
            </p>
            <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#666' }}>Estimated Loss</p>
            <p style={{ margin: '4px 0', fontSize: '24px', fontWeight: 700, color: '#5f249f' }}>
              ${claim.estimatedLoss.toLocaleString()}
              {claim.structuralDamage && '+'}
            </p>
          </div>
        </DxcFlex>

        {/* Progress Bar */}
        <div>
          <DxcFlex justifyContent="space-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Claim Progress</span>
            <span style={{ fontSize: '14px', color: '#666' }}>{claim.completionPercentage}% Complete</span>
          </DxcFlex>
          <DxcProgressBar
            value={claim.completionPercentage}
            showValue={false}
          />
        </div>
      </DxcFlex>
    </DxcCard>
  );

  // Insured Information
  const InsuredInfo = () => (
    <DxcCard>
      <h3 style={{ margin: '0 0 16px 0', color: '#5f249f' }}>Business Information</h3>
      <DxcFlex direction="column" gap="0.75rem">
        <InfoRow label="Business Name" value={insured.businessName} />
        <InfoRow label="Owner" value={insured.ownerName} />
        <InfoRow label="Business Type" value={insured.businessType} />
        <InfoRow label="Email" value={insured.email} />
        <InfoRow label="Phone" value={insured.phone} />
        <InfoRow
          label="Address"
          value={`${insured.businessAddress.street}, ${insured.businessAddress.city}, ${insured.businessAddress.state} ${insured.businessAddress.zip}`}
        />
        <InfoRow label="Years in Business" value={`${new Date().getFullYear() - insured.yearEstablished} years (est. ${insured.yearEstablished})`} />
        <InfoRow label="Employees" value={insured.employees} />
      </DxcFlex>
    </DxcCard>
  );

  // Policy Information
  const PolicyInfo = () => (
    <DxcCard>
      <h3 style={{ margin: '0 0 16px 0', color: '#5f249f' }}>Policy Information</h3>
      <DxcFlex direction="column" gap="0.75rem">
        <InfoRow label="Policy Number" value={policy.policyNumber} />
        <InfoRow label="Type" value={policy.type} />
        <InfoRow label="Status" value={<DxcBadge label={policy.status} color="#24A148" />} />
        <InfoRow label="Annual Premium" value={`$${policy.premium.toLocaleString()}`} />

        <div style={{ marginTop: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Coverages</h4>
          {policy.coverages.map((coverage, idx) => (
            <div key={idx} style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              marginBottom: '8px',
              borderRadius: '4px',
              borderLeft: '4px solid #5f249f'
            }}>
              <DxcFlex justifyContent="space-between">
                <span style={{ fontWeight: 600 }}>{coverage.type}</span>
                <DxcBadge label={coverage.covered ? "Covered" : "Not Covered"} color={coverage.covered ? "#24A148" : "#D0021B"} />
              </DxcFlex>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                Limit: ${coverage.limit.toLocaleString()} • Deductible: ${coverage.deductible.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {policy.endorsements.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Endorsements</h4>
            {policy.endorsements.map((endorsement, idx) => (
              <DxcBadge key={idx} label={endorsement} color="#5f249f" style={{ marginRight: '8px', marginBottom: '8px' }} />
            ))}
          </div>
        )}
      </DxcFlex>
    </DxcCard>
  );

  // Fast-Track Criteria
  const FastTrackCriteriaSection = () => (
    <DxcCard>
      <DxcFlex justifyContent="space-between" alignItems="center" style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#5f249f' }}>⚡ Fast-Track Analysis</h3>
        <DxcBadge
          label={`AI Confidence: ${fastTrackCriteria.aiConfidenceScore}%`}
          color="#5f249f"
          size="large"
        />
      </DxcFlex>

      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>
        <strong>STP Recommendation:</strong> {fastTrackCriteria.stpRecommendation}
      </p>

      {fastTrackCriteria.reasons.map((reason, idx) => (
        <div key={idx} style={{
          padding: '12px',
          backgroundColor: reason.met ? '#f0f9f4' : '#fff5f5',
          marginBottom: '8px',
          borderRadius: '4px',
          borderLeft: `4px solid ${reason.met ? '#24A148' : '#D0021B'}`
        }}>
          <DxcFlex justifyContent="space-between" alignItems="center">
            <div style={{ flex: 1 }}>
              <DxcFlex gap="0.5rem" alignItems="center">
                <span style={{ fontSize: '18px' }}>{reason.met ? '✅' : '❌'}</span>
                <span style={{ fontWeight: 600 }}>{reason.criterion}</span>
              </DxcFlex>
              <p style={{ margin: '4px 0 0 24px', fontSize: '14px', color: '#666' }}>
                {reason.details}
              </p>
            </div>
          </DxcFlex>
        </div>
      ))}
    </DxcCard>
  );

  // Timeline Tab Content
  const TimelineTab = () => {
    const timelineColumns = [
      { label: 'Time', isSortable: false },
      { label: 'Event', isSortable: false },
      { label: 'Actor', isSortable: false }
    ];

    const timelineRows = timeline.map((event) => [
      {
        displayValue: (
          <div>
            <div style={{ fontWeight: 600 }}>{new Date(event.timestamp).toLocaleTimeString()}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{new Date(event.timestamp).toLocaleDateString()}</div>
          </div>
        )
      },
      {
        displayValue: (
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{event.event}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>{event.description}</div>
          </div>
        )
      },
      {
        displayValue: (
          <DxcFlex direction="column" gap="0.25rem">
            <span style={{ fontSize: '14px' }}>{event.actor}</span>
            <DxcBadge label={event.category} size="small" />
          </DxcFlex>
        )
      }
    ]);

    return <DxcTable columns={timelineColumns} rows={timelineRows} />;
  };

  // Requirements Tab Content
  const RequirementsTab = () => {
    const requirementsColumns = [
      { label: 'Requirement', isSortable: false },
      { label: 'Status', isSortable: false },
      { label: 'Date', isSortable: false }
    ];

    const requirementsRows = requirements.map((req) => {
      const statusColors = {
        'Received': '#24A148',
        'Auto-Retrieved': '#0095FF',
        'In Progress': '#FF6B00',
        'Pending': '#666666'
      };

      return [
        {
          displayValue: (
            <DxcFlex alignItems="center" gap="0.5rem">
              <span>{req.requirement}</span>
              {req.critical && <DxcBadge label="Critical" color="#D0021B" size="small" />}
            </DxcFlex>
          )
        },
        {
          displayValue: <DxcBadge label={req.status} color={statusColors[req.status]} />
        },
        {
          displayValue: req.receivedDate
            ? new Date(req.receivedDate).toLocaleDateString()
            : req.dueDate
              ? `Due: ${new Date(req.dueDate).toLocaleDateString()}`
              : '-'
        }
      ];
    });

    return <DxcTable columns={requirementsColumns} rows={requirementsRows} />;
  };

  // Documents Tab Content
  const DocumentsTab = () => {
    const accordionItems = [
      {
        label: 'Loss Documentation',
        content: (
          <div>
            {documents.filter(doc => ['First Notice of Loss', 'Loss Photos'].includes(doc.type)).map(doc => (
              <DocumentItem key={doc.id} doc={doc} />
            ))}
          </div>
        )
      },
      {
        label: 'Monitoring & Prevention',
        content: (
          <div>
            {documents.filter(doc => ['Monitoring Report', 'Prevention Documentation', 'Weather Alert'].includes(doc.type)).map(doc => (
              <DocumentItem key={doc.id} doc={doc} />
            ))}
          </div>
        )
      },
      {
        label: 'Prior Claims & Risk Assessment',
        content: (
          <div>
            {documents.filter(doc => ['Prior Claim', 'Risk Documentation'].includes(doc.type)).map(doc => (
              <DocumentItem key={doc.id} doc={doc} />
            ))}
          </div>
        )
      },
      {
        label: 'Authorizations',
        content: (
          <div>
            {documents.filter(doc => doc.type === 'Authorization').map(doc => (
              <DocumentItem key={doc.id} doc={doc} />
            ))}
          </div>
        )
      }
    ];

    return <DxcAccordion items={accordionItems} />;
  };

  // Damage Assessment Tab
  const DamageAssessmentTab = () => (
    <DxcFlex direction="column" gap="1.5rem">
      {/* Inventory Damage */}
      <DxcCard>
        <h3 style={{ margin: '0 0 16px 0', color: '#5f249f' }}>Inventory Loss</h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
          Category: {damageAssessment.inventory.category}
        </p>
        {damageAssessment.inventory.items.map((item, idx) => (
          <div key={idx} style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            marginBottom: '8px',
            borderRadius: '4px'
          }}>
            <DxcFlex justifyContent="space-between">
              <div>
                <span style={{ fontWeight: 600 }}>{item.item}</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Quantity: {item.quantity}
                </p>
              </div>
              <span style={{ fontWeight: 700, fontSize: '18px', color: '#5f249f' }}>
                ${item.value.toLocaleString()}
              </span>
            </DxcFlex>
          </div>
        ))}
        <DxcFlex justifyContent="space-between" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e0e0e0' }}>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>Total Inventory Loss</span>
          <span style={{ fontWeight: 700, fontSize: '20px', color: '#5f249f' }}>
            ${damageAssessment.inventory.estimatedValue.toLocaleString()}
          </span>
        </DxcFlex>
      </DxcCard>

      {/* Structural Damage */}
      <DxcCard>
        <h3 style={{ margin: '0 0 16px 0', color: '#5f249f' }}>Structural Damage</h3>
        {damageAssessment.structural.areas.map((area, idx) => (
          <div key={idx} style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            marginBottom: '8px',
            borderRadius: '4px'
          }}>
            <DxcFlex justifyContent="space-between">
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600 }}>{area.location}</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  {area.damage}
                </p>
              </div>
              <span style={{ fontWeight: 700, fontSize: '18px', color: '#5f249f' }}>
                ${area.estimatedCost.toLocaleString()}
              </span>
            </DxcFlex>
          </div>
        ))}
        <DxcFlex justifyContent="space-between" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e0e0e0' }}>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>Total Structural Damage</span>
          <span style={{ fontWeight: 700, fontSize: '20px', color: '#5f249f' }}>
            ${damageAssessment.structural.totalEstimated.toLocaleString()}
          </span>
        </DxcFlex>
      </DxcCard>

      {/* Business Interruption */}
      <DxcCard>
        <h3 style={{ margin: '0 0 16px 0', color: '#5f249f' }}>Business Interruption</h3>
        <InfoRow label="Estimated Closure Period" value={damageAssessment.businessInterruption.closurePeriod} />
        <InfoRow label="Daily Revenue" value={`$${damageAssessment.businessInterruption.dailyRevenue.toLocaleString()}`} />
        <InfoRow label="Estimated Loss" value={`$${damageAssessment.businessInterruption.estimatedLoss.toLocaleString()}`} />
        <DxcAlert
          type="warning"
          mode="inline"
          size="fitContent"
          inlineText={damageAssessment.businessInterruption.notes}
          style={{ marginTop: '12px' }}
        />
      </DxcCard>
    </DxcFlex>
  );

  // AI Insights Tab
  const AIInsightsTab = () => (
    <DxcFlex direction="column" gap="1.5rem">
      {/* Fraud Analysis */}
      <DxcCard>
        <h3 style={{ margin: '0 0 16px 0', color: '#5f249f' }}>Fraud Risk Analysis</h3>
        <DxcFlex alignItems="center" gap="1rem" style={{ marginBottom: '16px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#f0f9f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid #24A148'
          }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#24A148' }}>
              {aiInsights.fraudScore}/100
            </span>
          </div>
          <div>
            <DxcBadge label={aiInsights.fraudRisk} color="#24A148" size="large" />
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
              Low risk score indicates high trustworthiness
            </p>
          </div>
        </DxcFlex>
        {aiInsights.fraudFactors.map((factor, idx) => (
          <div key={idx} style={{
            padding: '12px',
            backgroundColor: factor.impact === 'Positive' ? '#f0f9f4' : '#f8f9fa',
            marginBottom: '8px',
            borderRadius: '4px',
            borderLeft: `4px solid ${factor.impact === 'Positive' ? '#24A148' : '#666'}`
          }}>
            <DxcFlex justifyContent="space-between" alignItems="center">
              <span>{factor.factor}</span>
              <DxcBadge
                label={factor.impact}
                color={factor.impact === 'Positive' ? '#24A148' : '#666'}
                size="small"
              />
            </DxcFlex>
          </div>
        ))}
      </DxcCard>

      {/* Settlement Recommendation */}
      <DxcCard>
        <h3 style={{ margin: '0 0 16px 0', color: '#5f249f' }}>Settlement Recommendation</h3>
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f0fa',
          borderRadius: '8px',
          border: '2px solid #5f249f',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Recommended Settlement Range</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#5f249f' }}>
            {aiInsights.settlementRecommendation.range}
          </p>
          <DxcBadge
            label={`${aiInsights.settlementRecommendation.confidence}% Confidence`}
            color="#5f249f"
            size="large"
            style={{ marginTop: '12px' }}
          />
        </div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Factors Considered</h4>
        {aiInsights.settlementRecommendation.factors.map((factor, idx) => (
          <div key={idx} style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            marginBottom: '8px',
            borderRadius: '4px'
          }}>
            • {factor}
          </div>
        ))}
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f9f4', borderRadius: '4px' }}>
          <strong>Subrogation Potential:</strong> {aiInsights.subrogationPotential}
        </div>
        <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f0f9f4', borderRadius: '4px' }}>
          <strong>Customer Sentiment:</strong> {aiInsights.customerSentiment}
        </div>
      </DxcCard>
    </DxcFlex>
  );

  // Helper Component
  const InfoRow = ({ label, value }) => (
    <DxcFlex justifyContent="space-between" style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>
      <span style={{ color: '#666', fontSize: '14px' }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '14px' }}>{value}</span>
    </DxcFlex>
  );

  const DocumentItem = ({ doc }) => (
    <div style={{
      padding: '12px',
      backgroundColor: '#fff',
      marginBottom: '8px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px'
    }}>
      <DxcFlex justifyContent="space-between" alignItems="center">
        <div style={{ flex: 1 }}>
          <DxcFlex gap="0.5rem" alignItems="center">
            <span style={{ fontWeight: 600 }}>{doc.name}</span>
            <DxcBadge label={doc.status} color="#24A148" size="small" />
          </DxcFlex>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
            {doc.type} • {doc.size}
            {doc.pages && ` • ${doc.pages} pages`}
            {doc.count && ` • ${doc.count} files`}
            {doc.source && ` • Source: ${doc.source}`}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
            Uploaded: {new Date(doc.uploadDate).toLocaleString()}
          </p>
        </div>
        <DxcButton
          label="View"
          mode="text"
          size="small"
        />
      </DxcFlex>
    </div>
  );

  return (
    <DxcApplicationLayout>
      <DxcApplicationLayout.Main>
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Claim Header */}
          <ClaimHeader />

          {/* Two Column Layout */}
          <DxcFlex gap="1.5rem" style={{ marginBottom: '24px' }}>
            <div style={{ flex: '1 1 50%' }}>
              <InsuredInfo />
            </div>
            <div style={{ flex: '1 1 50%' }}>
              <PolicyInfo />
            </div>
          </DxcFlex>

          {/* Fast-Track Criteria */}
          <div style={{ marginBottom: '24px' }}>
            <FastTrackCriteriaSection />
          </div>

          {/* Adjuster Information */}
          <DxcCard style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#5f249f' }}>Assigned Adjuster</h3>
            <DxcFlex gap="2rem">
              <div style={{ flex: 1 }}>
                <InfoRow label="Name" value={adjuster.name} />
                <InfoRow label="Specialization" value={adjuster.specialization} />
                <InfoRow label="Experience" value={`${adjuster.yearsExperience} years`} />
              </div>
              <div style={{ flex: 1 }}>
                <InfoRow label="Email" value={adjuster.email} />
                <InfoRow label="Phone" value={adjuster.phone} />
                <InfoRow label="Expected Contact" value={adjuster.expectedContactTime} />
              </div>
            </DxcFlex>
          </DxcCard>

          {/* Tabbed Content */}
          <DxcCard>
            <DxcTabs
              activeTabIndex={activeTab}
              onTabClick={(i) => setActiveTab(i)}
              tabs={[
                {
                  label: 'Timeline',
                  content: <TimelineTab />
                },
                {
                  label: 'Requirements',
                  content: <RequirementsTab />
                },
                {
                  label: 'Documents',
                  content: <DocumentsTab />
                },
                {
                  label: 'Damage Assessment',
                  content: <DamageAssessmentTab />
                },
                {
                  label: 'AI Insights',
                  content: <AIInsightsTab />
                }
              ]}
            />
          </DxcCard>

          {/* Action Buttons */}
          <DxcFlex gap="1rem" justifyContent="flex-end" style={{ marginTop: '24px' }}>
            <DxcButton
              label="Hold Claim"
              mode="secondary"
            />
            <DxcButton
              label="Request More Info"
              mode="secondary"
            />
            <DxcButton
              label="Approve Settlement"
              mode="primary"
            />
          </DxcFlex>
        </div>
      </DxcApplicationLayout.Main>
    </DxcApplicationLayout>
  );
};

export default CommercialClaimDemo;
