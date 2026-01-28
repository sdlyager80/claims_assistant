import { useState } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcTabs,
  DxcInset,
  DxcProgressBar,
  DxcAlert,
  DxcChip,
  DxcDialog
} from '@dxc-technology/halstack-react';
import FastTrackBadge from '../shared/FastTrackBadge';
import DocumentUpload from '../shared/DocumentUpload';
import DocumentViewer from '../shared/DocumentViewer';
import BeneficiaryAnalyzer from '../BeneficiaryAnalyzer/BeneficiaryAnalyzer';
import DeathEventPanel from '../DeathEventPanel/DeathEventPanel';
import PolicySummaryPanel from '../PolicySummaryPanel/PolicySummaryPanel';
import PartyManagementPanel from '../PartyManagementPanel/PartyManagementPanel';
import AIInsightsPanel from '../AIInsightsPanel/AIInsightsPanel';
import ClaimHeader from '../ClaimHeader/ClaimHeader';
import PMICalculator from '../PMICalculator/PMICalculator';
import TaxWithholdingCalculator from '../TaxWithholdingCalculator/TaxWithholdingCalculator';
import PaymentQuickView from '../PaymentQuickView/PaymentQuickView';
import PolicyDetailView from '../PolicyDetailView/PolicyDetailView';
import PartyForm from '../PartyForm/PartyForm';
import RequirementsEngine from '../RequirementsEngine/RequirementsEngine';
import './ClaimsWorkbench.css';

const ClaimsWorkbench = ({ claim }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showBeneficiaryAnalyzer, setShowBeneficiaryAnalyzer] = useState(false);

  // Modal states
  const [showPMICalculator, setShowPMICalculator] = useState(false);
  const [showTaxCalculator, setShowTaxCalculator] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showPartyForm, setShowPartyForm] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);

  console.log('[ClaimsWorkbench] Received claim:', claim);

  if (!claim) {
    console.log('[ClaimsWorkbench] No claim provided, showing alert');
    return (
      <DxcContainer
        padding="var(--spacing-padding-xl)"
        style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
      >
        <DxcAlert
          type="info"
          inlineText="Please select a claim from the dashboard to view details."
        />
      </DxcContainer>
    );
  }

  // Helper function - must be declared before use
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Extract financial data from claim
  const totalClaimAmount = claim.financial?.claimAmount || claim.financial?.totalClaimed || 0;
  const payments = claim.financial?.payments || claim.payments || [];
  const reserves = claim.financial?.reserves || {};

  // Calculate totals
  const totalPaid = payments
    .filter(p => p.status === 'PAID' || p.status === 'Paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingPayments = payments.filter(p =>
    p.status === 'PENDING' || p.status === 'Pending Approval' || p.status === 'SCHEDULED'
  );

  const completedPayments = payments.filter(p =>
    p.status === 'PAID' || p.status === 'Paid' || p.status === 'COMPLETED'
  );

  const financialData = {
    totalClaimAmount,
    reserves: {
      initial: reserves.initial || totalClaimAmount,
      current: reserves.current || (totalClaimAmount - totalPaid),
      paid: totalPaid,
      outstanding: reserves.outstanding || (totalClaimAmount - totalPaid)
    },
    payments: completedPayments,
    pendingPayments
  };

  // Extract policy data from claim
  const policyDetails = {
    policyNumber: claim.policy?.policyNumber || 'N/A',
    insuredName: claim.insured?.name || claim.claimant?.name || 'N/A',
    policyType: claim.policy?.policyType || 'Term Life Insurance',
    coverage: claim.financial?.claimAmount ? formatCurrency(claim.financial.claimAmount) : 'N/A',
    effectiveDate: claim.policy?.effectiveDate || claim.policy?.issueDate || 'N/A',
    expirationDate: claim.policy?.expirationDate || 'N/A',
    premium: claim.policy?.premium || 'N/A'
  };

  // Extract beneficiaries from claim
  const beneficiaries = claim.beneficiaries || claim.policy?.beneficiaries || [];

  // Extract timeline from claim
  const timelineEvents = claim.timeline || claim.activityLog || [];

  // Extract requirements from claim
  const requirements = claim.requirements || [];

  return (
    <DxcContainer
      padding="0"
      style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
    >
      <DxcFlex direction="column" gap="0">
        {/* Persistent Claim Header */}
        <ClaimHeader
          claim={claim}
          onHold={() => console.log('Hold claim')}
          onApprove={() => console.log('Approve claim')}
          onDeny={() => console.log('Deny claim')}
          onAssign={() => console.log('Assign claim')}
          onBack={() => window.history.back()}
        />

        {/* Main Content Area */}
        <DxcContainer padding="var(--spacing-padding-l)">
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            {/* Progress Card */}
            <DxcContainer
          padding="var(--spacing-padding-l)"
          style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcHeading level={3} text="Claim Progress" />
            {requirements.length > 0 && (
              <DxcProgressBar
                label="Requirements Complete"
                value={Math.round((requirements.filter(r => r.status === 'SATISFIED' || r.status === 'Completed').length / requirements.length) * 100)}
                showValue
              />
            )}
            <DxcFlex gap="var(--spacing-gap-xl)">
              {claim.workflow?.sla?.dueDate && (() => {
                const dueDate = new Date(claim.workflow.sla.dueDate);
                const today = new Date();
                const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                const color = daysRemaining <= 3 ? 'var(--color-fg-error-medium)' : daysRemaining <= 7 ? 'var(--color-fg-warning-medium)' : 'var(--color-fg-success-medium)';

                return (
                  <>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        SLA DAYS REMAINING
                      </DxcTypography>
                      <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color={color}>
                        {daysRemaining}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        TARGET CLOSE DATE
                      </DxcTypography>
                      <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">
                        {dueDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                      </DxcTypography>
                    </DxcFlex>
                  </>
                );
              })()}
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                  FASTTRACK ELIGIBLE
                </DxcTypography>
                <DxcTypography fontSize="16px" fontWeight="font-weight-semibold" color={claim.routing?.type === 'FASTTRACK' ? 'var(--color-fg-success-medium)' : 'var(--color-fg-neutral-dark)'}>
                  {claim.routing?.type === 'FASTTRACK' ? 'Yes' : 'No'}
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>

        {/* Tabs */}
        <DxcContainer
          style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
        >
          <DxcFlex direction="column">
            <DxcInset space="var(--spacing-padding-l)" top>
              <DxcTabs iconPosition="left">
                <DxcTabs.Tab
                  label="Dashboard"
                  icon="dashboard"
                  active={activeTab === 0}
                  onClick={() => setActiveTab(0)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Financials"
                  icon="payments"
                  active={activeTab === 1}
                  onClick={() => setActiveTab(1)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Policy 360"
                  icon="policy"
                  active={activeTab === 2}
                  onClick={() => setActiveTab(2)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Timeline"
                  icon="timeline"
                  active={activeTab === 3}
                  onClick={() => setActiveTab(3)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Requirements"
                  icon="checklist"
                  active={activeTab === 4}
                  onClick={() => setActiveTab(4)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Documents"
                  icon="folder"
                  active={activeTab === 5}
                  onClick={() => setActiveTab(5)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Beneficiary Analyzer"
                  icon="psychology"
                  active={activeTab === 6}
                  onClick={() => setActiveTab(6)}
                >
                  <div />
                </DxcTabs.Tab>
              </DxcTabs>
            </DxcInset>

            <DxcInset space="var(--spacing-padding-l)">
              {/* Dashboard Tab - SA-001 Claim Dashboard 360° View */}
              {activeTab === 0 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-l)">
                  {/* Top Row: Death Event and AI Insights */}
                  <div className="dashboard-grid-top">
                    <DeathEventPanel
                      claimData={{
                        dateOfDeath: claim.deathEvent?.dateOfDeath || claim.insured?.dateOfDeath,
                        mannerOfDeath: claim.deathEvent?.mannerOfDeath || 'Natural',
                        causeOfDeath: claim.deathEvent?.causeOfDeath,
                        deathInUSA: claim.deathEvent?.deathInUSA || 'Yes',
                        countryOfDeath: claim.deathEvent?.countryOfDeath || 'United States',
                        proofOfDeathSourceType: claim.deathEvent?.proofOfDeathSourceType || 'Certified Death Certificate',
                        proofOfDeathDate: claim.deathEvent?.proofOfDeathDate,
                        certifiedDOB: claim.insured?.dateOfBirth,
                        verificationSource: claim.deathEvent?.verificationSource || 'LexisNexis',
                        verificationScore: claim.deathEvent?.verificationScore || 95,
                        specialEvent: claim.deathEvent?.specialEvent
                      }}
                      onEdit={() => console.log('Edit death event')}
                    />
                    <AIInsightsPanel
                      claimData={{
                        riskScore: claim.aiInsights?.riskScore || 0
                      }}
                      insights={claim.aiInsights?.alerts || []}
                      onViewDetail={(insight) => console.log('View insight:', insight)}
                      onDismiss={(insight) => console.log('Dismiss insight:', insight)}
                    />
                  </div>

                  {/* Middle Row: Policy Summary and Party Management */}
                  <div className="dashboard-grid-middle">
                    <PolicySummaryPanel
                      policies={claim.policies || (claim.policy ? [claim.policy] : [])}
                      onViewPolicy={(policy) => {
                        setSelectedPolicy(policy);
                        setShowPolicyModal(true);
                      }}
                      onAssociate={() => console.log('Associate policy')}
                      onDissociate={(policy) => console.log('Dissociate policy:', policy)}
                      onSearchPolicy={() => console.log('Search policy')}
                    />
                    <PartyManagementPanel
                      parties={claim.parties || []}
                      onAddParty={() => {
                        setSelectedParty(null);
                        setShowPartyForm(true);
                      }}
                      onEditParty={(party) => {
                        setSelectedParty(party);
                        setShowPartyForm(true);
                      }}
                      onChangeInsured={() => console.log('Change insured')}
                      onCSLNSearch={(party) => console.log('CSLN search for party:', party)}
                    />
                  </div>

                  {/* Bottom Row: Quick Actions */}
                  <DxcContainer
                    padding="var(--spacing-padding-m)"
                    style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
                  >
                    <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                      <DxcButton
                        label="View Full Financials"
                        mode="secondary"
                        icon="payments"
                        onClick={() => setActiveTab(1)}
                      />
                      <DxcButton
                        label="View Policy Details"
                        mode="secondary"
                        icon="policy"
                        onClick={() => setActiveTab(2)}
                      />
                      <DxcButton
                        label="Manage Requirements"
                        mode="secondary"
                        icon="checklist"
                        onClick={() => setActiveTab(4)}
                      />
                      <DxcButton
                        label="Upload Documents"
                        mode="secondary"
                        icon="upload_file"
                        onClick={() => setActiveTab(5)}
                      />
                      <DxcButton
                        label="Analyze Beneficiaries"
                        mode="primary"
                        icon="psychology"
                        onClick={() => setActiveTab(6)}
                      />
                    </DxcFlex>
                  </DxcContainer>
                </DxcFlex>
              )}

              {/* Financials Tab */}
              {activeTab === 1 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-l)">
                  {/* Reserve Summary */}
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{ backgroundColor: "var(--color-bg-info-lighter)" }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                        <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                          TOTAL CLAIM AMOUNT
                        </DxcTypography>
                        <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-info-medium)">
                          {formatCurrency(financialData.totalClaimAmount)}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcContainer>
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{ backgroundColor: "var(--color-bg-success-lighter)" }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                        <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                          TOTAL PAID
                        </DxcTypography>
                        <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-success-medium)">
                          {formatCurrency(financialData.reserves.paid)}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcContainer>
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{ backgroundColor: "var(--color-bg-warning-lighter)" }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                        <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                          OUTSTANDING RESERVE
                        </DxcTypography>
                        <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)">
                          {formatCurrency(financialData.reserves.outstanding)}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcContainer>
                  </DxcFlex>

                  {/* Reserve Details */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcHeading level={4} text="Reserve History" />
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                      border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        <DxcFlex justifyContent="space-between">
                          <DxcTypography fontSize="font-scale-03">Initial Reserve Set</DxcTypography>
                          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                            {formatCurrency(financialData.reserves.initial)}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex justifyContent="space-between">
                          <DxcTypography fontSize="font-scale-03">Payments Issued</DxcTypography>
                          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)">
                            -{formatCurrency(financialData.reserves.paid)}
                          </DxcTypography>
                        </DxcFlex>
                        <div style={{ borderTop: "1px solid var(--border-color-neutral-light)", paddingTop: "var(--spacing-gap-s)" }}>
                          <DxcFlex justifyContent="space-between">
                            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">Current Reserve</DxcTypography>
                            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)">
                              {formatCurrency(financialData.reserves.current)}
                            </DxcTypography>
                          </DxcFlex>
                        </div>
                      </DxcFlex>
                    </DxcContainer>
                  </DxcFlex>

                  {/* Payment History */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcHeading level={4} text="Payment History" />
                      <DxcFlex gap="var(--spacing-gap-s)">
                        <DxcButton
                          label="Calculate PMI"
                          mode="secondary"
                          size="small"
                          icon="calculate"
                          onClick={() => setShowPMICalculator(true)}
                        />
                        <DxcButton
                          label="Tax Withholding"
                          mode="secondary"
                          size="small"
                          icon="account_balance"
                          onClick={() => setShowTaxCalculator(true)}
                        />
                        <DxcButton label="View EOB" mode="tertiary" size="small" icon="description" />
                      </DxcFlex>
                    </DxcFlex>
                    {financialData.payments.map((payment, index) => (
                      <DxcContainer
                        key={index}
                        style={{ backgroundColor: "var(--color-bg-neutral-lighter)", cursor: "pointer" }}
                        border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowPaymentModal(true);
                        }}
                      >
                        <DxcInset space="var(--spacing-padding-m)">
                          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                            <DxcFlex justifyContent="space-between" alignItems="center">
                              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-secondary-medium)">
                                  {payment.id}
                                </DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.payee}</DxcTypography>
                                <DxcBadge label={payment.status} />
                              </DxcFlex>
                              <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="var(--color-fg-success-medium)">
                                {formatCurrency(payment.amount)}
                              </DxcTypography>
                            </DxcFlex>
                            <div className="payment-details-grid">
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Payment Type</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.type}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Date Paid</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.date}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Payment Method</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.method}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Check/Reference #</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.checkNumber || 'N/A'}</DxcTypography>
                              </DxcFlex>
                              {payment.netBenefitProceeds && (
                                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Net Benefit Proceeds</DxcTypography>
                                  <DxcTypography fontSize="font-scale-03">{formatCurrency(payment.netBenefitProceeds)}</DxcTypography>
                                </DxcFlex>
                              )}
                              {payment.netBenefitPMI && (
                                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Net Benefit PMI</DxcTypography>
                                  <DxcTypography fontSize="font-scale-03">{formatCurrency(payment.netBenefitPMI)}</DxcTypography>
                                </DxcFlex>
                              )}
                              {payment.taxWithheld && (
                                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Tax Withheld</DxcTypography>
                                  <DxcTypography fontSize="font-scale-03">{formatCurrency(payment.taxWithheld)}</DxcTypography>
                                </DxcFlex>
                              )}
                              {payment.percentage && (
                                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Percent</DxcTypography>
                                  <DxcTypography fontSize="font-scale-03">{payment.percentage}%</DxcTypography>
                                </DxcFlex>
                              )}
                            </div>
                          </DxcFlex>
                        </DxcInset>
                      </DxcContainer>
                    ))}
                  </DxcFlex>

                  {/* Pending Payments */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcHeading level={4} text="Pending Payments" />
                      <DxcButton label="Schedule Payment" mode="primary" icon="add" />
                    </DxcFlex>
                    {financialData.pendingPayments.map((payment, index) => (
                      <DxcContainer
                        key={index}
                        style={{ backgroundColor: "var(--color-bg-warning-lightest)" }}
                        border={{ color: "var(--border-color-warning-lighter)", style: "solid", width: "1px" }}
                      >
                        <DxcInset space="var(--spacing-padding-m)">
                          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                            <DxcFlex justifyContent="space-between" alignItems="center">
                              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-secondary-medium)">
                                  {payment.id}
                                </DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.payee}</DxcTypography>
                                <DxcBadge label={payment.status} />
                              </DxcFlex>
                              <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)">
                                {formatCurrency(payment.amount)}
                              </DxcTypography>
                            </DxcFlex>
                            <DxcFlex gap="var(--spacing-gap-l)" alignItems="center">
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Payment Type</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.type}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Scheduled Date</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.scheduledDate}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex gap="var(--spacing-gap-s)" style={{ marginLeft: "auto" }}>
                                <DxcButton label="Approve" mode="primary" size="small" />
                                <DxcButton label="Reject" mode="secondary" size="small" />
                              </DxcFlex>
                            </DxcFlex>
                          </DxcFlex>
                        </DxcInset>
                      </DxcContainer>
                    ))}
                  </DxcFlex>
                </DxcFlex>
              )}

              {/* Policy 360 Tab */}
              {activeTab === 2 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-l)">
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcHeading level={4} text="Policy Details" />
                      <DxcButton label="View Full Policy" mode="secondary" size="small" icon="open_in_new" />
                    </DxcFlex>
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                      border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                    >
                      <div className="policy-details-grid">
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Policy Number</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{policyDetails.policyNumber}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Insured Name</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{policyDetails.insuredName}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Product Type</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{policyDetails.policyType}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Face Amount</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold" color="var(--color-fg-info-medium)">{policyDetails.coverage}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Issue Date</DxcTypography>
                          <DxcTypography fontSize="16px">{policyDetails.effectiveDate}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Issue State</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.issueState || 'N/A'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Plan Code</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.planCode || 'N/A'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Policy Status</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.adminStatus || 'Active'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Region</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.region || 'N/A'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Company Code</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.companyCode || 'N/A'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Paid To Date</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.paidToDate || 'N/A'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Source System</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.source || 'CyberLife'}</DxcTypography>
                        </DxcFlex>
                      </div>
                    </DxcContainer>
                  </DxcFlex>

                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcHeading level={4} text="Beneficiaries" />
                      <DxcButton
                        label="Analyze Beneficiaries with AI"
                        mode="primary"
                        icon="psychology"
                        onClick={() => setShowBeneficiaryAnalyzer(true)}
                      />
                    </DxcFlex>
                    {beneficiaries.map((ben, index) => (
                      <DxcContainer
                        key={index}
                        style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                        border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                      >
                        <DxcInset space="var(--spacing-padding-m)">
                          <DxcFlex justifyContent="space-between" alignItems="center">
                            <DxcFlex gap="var(--spacing-gap-l)" alignItems="center">
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Name</DxcTypography>
                                <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{ben.name}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Relationship</DxcTypography>
                                <DxcTypography fontSize="16px">{ben.relationship}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Percentage</DxcTypography>
                                <DxcTypography fontSize="16px">{ben.percentage}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Amount</DxcTypography>
                                <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="var(--color-fg-success-medium)">{ben.amount}</DxcTypography>
                              </DxcFlex>
                              <DxcBadge label={ben.status} />
                            </DxcFlex>
                          </DxcFlex>
                        </DxcInset>
                      </DxcContainer>
                    ))}
                  </DxcFlex>
                </DxcFlex>
              )}

              {/* Timeline Tab - SA-010 Activity Timeline */}
              {activeTab === 3 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcHeading level={4} text="Activity Timeline" />
                    <DxcFlex gap="var(--spacing-gap-s)">
                      <DxcChip label="User Generated" size="small" />
                      <DxcChip label="System Generated" size="small" />
                    </DxcFlex>
                  </DxcFlex>
                  {timelineEvents.length > 0 ? (
                    timelineEvents.map((event, index) => (
                      <DxcContainer
                        key={index}
                        style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                        border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                      >
                        <DxcInset space="var(--spacing-padding-m)">
                          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                                {event.type || 'Event'}
                              </DxcTypography>
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                                {event.timestamp ? new Date(event.timestamp).toLocaleString('en-US', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'}
                              </DxcTypography>
                            </DxcFlex>
                            {event.user?.name && (
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                                by {event.user.name}
                              </DxcTypography>
                            )}
                            <DxcTypography fontSize="font-scale-03">
                              {event.description || 'No description'}
                            </DxcTypography>
                          </DxcFlex>
                        </DxcInset>
                      </DxcContainer>
                    ))
                  ) : (
                    <DxcContainer
                      padding="var(--spacing-padding-l)"
                      style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                    >
                      <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                        No timeline events available for this claim.
                      </DxcTypography>
                    </DxcContainer>
                  )}
                </DxcFlex>
              )}

              {/* Requirements Tab */}
              {activeTab === 4 && (
                <RequirementsEngine
                  claim={claim}
                  onGenerateRequirements={() => {
                    console.log('Generate requirements clicked');
                  }}
                  onGenerateLetter={() => {
                    console.log('Generate letter clicked');
                  }}
                  onUploadDocument={(req) => {
                    console.log('Upload document for requirement:', req);
                    setActiveTab(5); // Switch to Documents tab
                  }}
                  onWaive={(req) => {
                    console.log('Waive requirement:', req);
                  }}
                />
              )}

              {/* Documents Tab */}
              {activeTab === 5 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-l)">
                  {/* Upload Section */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcHeading level={3} text="Upload Documents" />
                    <DocumentUpload
                      claimId={claim.id}
                      onUploadComplete={(result) => {
                        console.log('Upload complete:', result);
                        // TODO: Refresh documents list
                      }}
                      acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']}
                      maxFileSize={10 * 1024 * 1024}
                      multiple={true}
                    />
                  </DxcFlex>

                  {/* Documents List */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcHeading level={3} text="Uploaded Documents" />
                    <DocumentViewer
                      documents={claim.documents || []}
                      onDocumentClick={(doc) => {
                        console.log('Document clicked:', doc);
                        // TODO: Open document preview modal
                      }}
                      onDownload={(doc) => {
                        console.log('Download document:', doc);
                        // TODO: Implement download
                      }}
                      showIDP={true}
                      showActions={true}
                    />
                  </DxcFlex>
                </DxcFlex>
              )}

              {/* Beneficiary Analyzer Tab */}
              {activeTab === 6 && (
                <BeneficiaryAnalyzer
                  claimId={claim.claimNumber || claim.id}
                  onApproveBeneficiaries={(beneficiaries) => {
                    console.log('[ClaimsWorkbench] Beneficiaries approved:', beneficiaries);
                    // TODO: Update claim with approved beneficiaries
                    // Switch back to Policy 360 tab to see updated beneficiaries
                    setActiveTab(2);
                  }}
                  onCancel={() => {
                    // Return to Policy 360 tab
                    setActiveTab(2);
                  }}
                />
              )}
            </DxcInset>
          </DxcFlex>
        </DxcContainer>
          </DxcFlex>
        </DxcContainer>
      </DxcFlex>

      {/* Modal Dialogs */}
      {/* PMI Calculator Modal */}
      {showPMICalculator && (
        <DxcDialog isCloseVisible={false}>
          <PMICalculator
            claimData={claim}
            onCalculate={(result) => {
              console.log('PMI calculated:', result);
            }}
            onApply={(result) => {
              console.log('PMI applied:', result);
              setShowPMICalculator(false);
            }}
            onClose={() => setShowPMICalculator(false)}
          />
        </DxcDialog>
      )}

      {/* Tax Withholding Calculator Modal */}
      {showTaxCalculator && (
        <DxcDialog isCloseVisible={false}>
          <TaxWithholdingCalculator
            claimData={claim}
            paymentData={claim.financial?.payments?.[0]}
            onCalculate={(result) => {
              console.log('Tax calculated:', result);
            }}
            onApply={(result) => {
              console.log('Tax applied:', result);
              setShowTaxCalculator(false);
            }}
            onClose={() => setShowTaxCalculator(false)}
          />
        </DxcDialog>
      )}

      {/* Payment Quick View Modal */}
      {showPaymentModal && selectedPayment && (
        <DxcDialog isCloseVisible={false}>
          <PaymentQuickView
            payment={selectedPayment}
            onEdit={(payment) => {
              console.log('Edit payment:', payment);
              setShowPaymentModal(false);
            }}
            onCancel={(payment) => {
              console.log('Cancel payment:', payment);
              setShowPaymentModal(false);
            }}
            onResend={(payment) => {
              console.log('Resend payment:', payment);
              setShowPaymentModal(false);
            }}
            onView1099={() => {
              console.log('View 1099');
            }}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedPayment(null);
            }}
          />
        </DxcDialog>
      )}

      {/* Policy Detail View Modal */}
      {showPolicyModal && selectedPolicy && (
        <DxcDialog isCloseVisible={false}>
          <PolicyDetailView
            policy={selectedPolicy}
            onEdit={(policy) => {
              console.log('Edit policy:', policy);
              setShowPolicyModal(false);
            }}
            onSuspend={(policy) => {
              console.log('Suspend policy:', policy);
              setShowPolicyModal(false);
            }}
            onAssociate={(policy) => {
              console.log('Associate policy:', policy);
              setShowPolicyModal(false);
            }}
            onDissociate={(policy) => {
              console.log('Dissociate policy:', policy);
              setShowPolicyModal(false);
            }}
            onClose={() => {
              setShowPolicyModal(false);
              setSelectedPolicy(null);
            }}
          />
        </DxcDialog>
      )}

      {/* Party Add/Edit Form Modal */}
      {showPartyForm && (
        <DxcDialog isCloseVisible={false}>
          <PartyForm
            party={selectedParty}
            onSave={(partyData) => {
              console.log('Party saved:', partyData);
              setShowPartyForm(false);
              setSelectedParty(null);
            }}
            onCancel={() => {
              setShowPartyForm(false);
              setSelectedParty(null);
            }}
            onCSLNSearch={(partyData) => {
              console.log('CSLN search for:', partyData);
            }}
          />
        </DxcDialog>
      )}

      {/* Beneficiary Analyzer Modal */}
      {showBeneficiaryAnalyzer && (
        <DxcDialog isCloseVisible={false}>
          <BeneficiaryAnalyzer
            claimId={claim.claimNumber || claim.id}
            onApproveBeneficiaries={(beneficiaries) => {
              console.log('Beneficiaries approved:', beneficiaries);
              setShowBeneficiaryAnalyzer(false);
            }}
            onRequestDocuments={(beneficiaries) => {
              console.log('Request documents for beneficiaries:', beneficiaries);
              setShowBeneficiaryAnalyzer(false);
            }}
            onClose={() => setShowBeneficiaryAnalyzer(false)}
          />
        </DxcDialog>
      )}
    </DxcContainer>
  );
};

export default ClaimsWorkbench;
