/**
 * Simplified Demo Data
 * Minimal structure to test what's causing the crash
 */

import { ClaimStatus, ClaimType, RoutingType } from '../types/claim.types';

/**
 * Generate minimal demo claims
 */
export const generateDemoClaims = () => {
  return [
    {
      id: 'claim-001',
      claimNumber: 'CLM-2026-001',
      status: ClaimStatus.NEW,
      type: ClaimType.DEATH,
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
      claimant: {
        name: 'John Smith'
      },
      policy: {
        policyNumber: 'POL-12345'
      },
      financial: {
        claimAmount: 250000
      },
      routing: {
        type: RoutingType.FASTTRACK
      },
      workflow: {
        sla: {
          dueDate: '2026-01-25T23:59:59Z'
        }
      }
    },
    {
      id: 'claim-002',
      claimNumber: 'CLM-2026-002',
      status: ClaimStatus.UNDER_REVIEW,
      type: ClaimType.DEATH,
      createdAt: '2026-01-14T09:00:00Z',
      updatedAt: '2026-01-15T11:00:00Z',
      claimant: {
        name: 'Mary Johnson'
      },
      policy: {
        policyNumber: 'POL-67890'
      },
      financial: {
        claimAmount: 500000
      },
      routing: {
        type: RoutingType.STANDARD
      },
      workflow: {
        sla: {
          dueDate: '2026-02-14T23:59:59Z'
        }
      }
    }
  ];
};

export default {
  claims: generateDemoClaims()
};
