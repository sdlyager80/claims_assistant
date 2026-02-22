/**
 * Example Integration: Related Policies Panel
 *
 * This file demonstrates how to integrate the RelatedPoliciesPanel
 * into your death claim detail view.
 *
 * The panel automatically:
 * 1. Searches for other policies where the deceased is insured/owner
 * 2. Displays them with key details
 * 3. Provides actions to initiate claims or view policy details
 *
 * Integration Steps:
 * 1. Import the RelatedPoliciesPanel component
 * 2. Add it to your claim detail layout (typically in a tab or section)
 * 3. Pass the claimData prop
 * 4. Implement handler functions for actions
 */

import { useState } from 'react';
import { DxcTabs, DxcFlex } from '@dxc-technology/halstack-react';
import RelatedPoliciesPanel from './RelatedPoliciesPanel';
import DeathEventPanel from '../DeathEventPanel/DeathEventPanel';
import PolicySummaryPanel from '../PolicySummaryPanel/PolicySummaryPanel';

/**
 * Example: Death Claim Detail View with Related Policies
 */
const DeathClaimDetailExample = ({ claim }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Handler: Initiate a new death claim for a related policy
  const handleInitiateClaim = (policy) => {
    console.log('Initiating death claim for policy:', policy.policyNumber);

    // Example implementation:
    // 1. Pre-populate FNOL with deceased information
    // 2. Pre-populate with policy details
    // 3. Navigate to FNOL intake form
    // 4. Link to original claim for reference

    // Your implementation here:
    // navigate(`/claims/new?policyNumber=${policy.policyNumber}&relatedClaim=${claim.claimNumber}`);
  };

  // Handler: View policy details
  const handleViewPolicy = (policy) => {
    console.log('Viewing policy details:', policy.policyNumber);

    // Your implementation here:
    // navigate(`/policies/${policy.policyNumber}`);
  };

  const tabs = [
    {
      label: 'Claim Details',
      content: (
        <DxcFlex direction="column" gap="var(--spacing-gap-m)">
          {/* Current claim's death event */}
          <DeathEventPanel claimData={claim} />

          {/* Current claim's policy */}
          <PolicySummaryPanel policies={claim.policies} />
        </DxcFlex>
      )
    },
    {
      label: 'Related Policies',
      content: (
        <RelatedPoliciesPanel
          claimData={claim}
          onInitiateClaim={handleInitiateClaim}
          onViewPolicy={handleViewPolicy}
        />
      )
    }
  ];

  return (
    <DxcTabs
      tabs={tabs}
      activeTabIndex={activeTab}
      onTabClick={setActiveTab}
    />
  );
};

export default DeathClaimDetailExample;

/**
 * Alternative Integration: Add as Section in Single Page View
 *
 * If you prefer a single-page layout instead of tabs:
 */
export const DeathClaimDetailSinglePage = ({ claim }) => {
  const handleInitiateClaim = (policy) => {
    console.log('Initiating claim for:', policy.policyNumber);
  };

  const handleViewPolicy = (policy) => {
    console.log('Viewing policy:', policy.policyNumber);
  };

  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-l)">
      {/* Death Event Information */}
      <DeathEventPanel claimData={claim} />

      {/* Current Claim Policy */}
      <PolicySummaryPanel policies={claim.policies} />

      {/* Related Policies that Need Claims */}
      <RelatedPoliciesPanel
        claimData={claim}
        onInitiateClaim={handleInitiateClaim}
        onViewPolicy={handleViewPolicy}
      />
    </DxcFlex>
  );
};

/**
 * WORKFLOW AUTOMATION EXAMPLE:
 *
 * You can also trigger automatic claim creation for related policies:
 */
export const automateRelatedClaimCreation = async (originalClaim, relatedPolicies) => {
  // Example: Automatically create FNOL records for all related policies

  for (const policy of relatedPolicies.asInsured) {
    try {
      // Create FNOL with pre-populated data
      const fnolData = {
        policyNumber: policy.policyNumber,
        claimType: 'Death',
        dateOfDeath: originalClaim.deathEvent.dateOfDeath,
        insured: {
          name: originalClaim.insured.name,
          ssn: originalClaim.insured.ssn,
          dateOfBirth: originalClaim.insured.dateOfBirth
        },
        notifier: originalClaim.claimant,
        relatedClaim: originalClaim.claimNumber, // Link to original claim
        deathCertificateOnFile: true, // Already have it from original claim
        autoCreated: true,
        source: 'Related Policy Discovery'
      };

      // Submit to your FNOL API
      // await createFNOL(fnolData);

      console.log(`Auto-created claim for policy ${policy.policyNumber}`);
    } catch (error) {
      console.error(`Failed to auto-create claim for ${policy.policyNumber}:`, error);
    }
  }
};

/**
 * SERVICENOW INTEGRATION NOTES:
 *
 * When implementing in ServiceNow:
 *
 * 1. API Endpoint (Scoped App REST API):
 *    GET /api/x_dxcis_claims/policy_admin/death_claim_related
 *    Query params: ssn, name, dob, exclude_policy
 *
 * 2. Server-Side Script:
 *    - Query Policy Admin tables
 *    - Filter by insured/owner matching deceased
 *    - Check for active/in-force status
 *    - Exclude policies that already have death claims
 *
 * 3. Business Rules:
 *    - On Death Claim creation, trigger related policy search
 *    - Create workflow task for examiner to review
 *    - Send notifications to assigned examiner
 *
 * 4. Workflow Integration:
 *    - Add activity: "Check for Related Policies"
 *    - If found, create approval activity
 *    - Branch to automated FNOL creation or manual review
 */
