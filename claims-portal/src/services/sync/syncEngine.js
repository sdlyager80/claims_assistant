/**
 * Sync Engine
 * Coordinates data synchronization across systems (cmA, Policy Admin, FSO, DMS)
 * Ensures consistency and handles conflict resolution
 */

import cmaService from '../api/cmaService';
import policyService from '../api/policyService';
import fsoService from '../api/fsoService';
import dmsService from '../api/dmsService';
import eventBus, { EventTypes } from './eventBus';
import { handleAPIError } from '../utils/errorHandler';

/**
 * Sync Status Enum
 */
export const SyncStatus = {
  SYNCED: 'synced',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  ERROR: 'error',
  CONFLICT: 'conflict'
};

/**
 * Sync Direction Enum
 */
export const SyncDirection = {
  TO_CMA: 'to_cma',
  TO_POLICY_ADMIN: 'to_policy_admin',
  TO_FSO: 'to_fso',
  TO_DMS: 'to_dms',
  BIDIRECTIONAL: 'bidirectional'
};

/**
 * Sync Engine Class
 */
class SyncEngine {
  constructor() {
    this.syncQueue = [];
    this.activeSyncs = new Map();
    this.syncHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Initialize Sync Engine
   * Subscribe to relevant events
   */
  initialize() {
    console.log('[SyncEngine] Initializing...');

    // Subscribe to claim events
    eventBus.subscribe(EventTypes.CLAIM_CREATED, (event) => this.handleClaimCreated(event));
    eventBus.subscribe(EventTypes.CLAIM_UPDATED, (event) => this.handleClaimUpdated(event));

    // Subscribe to policy events
    eventBus.subscribe(EventTypes.POLICY_RETRIEVED, (event) => this.handlePolicyRetrieved(event));
    eventBus.subscribe(EventTypes.POLICY_UPDATED, (event) => this.handlePolicyUpdated(event));

    // Subscribe to document events
    eventBus.subscribe(EventTypes.DOCUMENT_UPLOADED, (event) => this.handleDocumentUploaded(event));
    eventBus.subscribe(EventTypes.DOCUMENT_CLASSIFIED, (event) => this.handleDocumentClassified(event));

    // Subscribe to workflow events
    eventBus.subscribe(EventTypes.CASE_CREATED, (event) => this.handleCaseCreated(event));
    eventBus.subscribe(EventTypes.TASK_COMPLETED, (event) => this.handleTaskCompleted(event));

    console.log('[SyncEngine] Initialized successfully');
  }

  /**
   * Sync Claim Data Across Systems
   */
  async syncClaim(claimId) {
    const syncId = `claim-${claimId}-${Date.now()}`;

    try {
      console.log('[SyncEngine] Syncing claim:', claimId);

      eventBus.publish(EventTypes.SYNC_STARTED, { syncId, entity: 'claim', entityId: claimId });

      this.activeSyncs.set(syncId, {
        entity: 'claim',
        entityId: claimId,
        startedAt: new Date().toISOString(),
        status: SyncStatus.IN_PROGRESS
      });

      // Get claim from cmA (System of Record)
      const claim = await cmaService.getClaim(claimId);

      // Sync to FSO
      if (claim.workflow && claim.workflow.fsoCase) {
        await this.syncClaimToFSO(claim);
      }

      // Update sync status
      this.activeSyncs.set(syncId, {
        ...this.activeSyncs.get(syncId),
        status: SyncStatus.SYNCED,
        completedAt: new Date().toISOString()
      });

      this.addToHistory(syncId, SyncStatus.SYNCED);

      eventBus.publish(EventTypes.SYNC_COMPLETED, {
        syncId,
        entity: 'claim',
        entityId: claimId,
        status: SyncStatus.SYNCED
      });

      console.log('[SyncEngine] Claim sync completed:', claimId);

      return { success: true, syncId };

    } catch (error) {
      console.error('[SyncEngine] Claim sync failed:', error);

      this.activeSyncs.set(syncId, {
        ...this.activeSyncs.get(syncId),
        status: SyncStatus.ERROR,
        error: error.message,
        completedAt: new Date().toISOString()
      });

      this.addToHistory(syncId, SyncStatus.ERROR, error.message);

      eventBus.publish(EventTypes.SYNC_FAILED, {
        syncId,
        entity: 'claim',
        entityId: claimId,
        error: error.message
      });

      return { success: false, syncId, error: error.message };
    } finally {
      this.activeSyncs.delete(syncId);
    }
  }

  /**
   * Sync Claim to FSO
   */
  async syncClaimToFSO(claim) {
    try {
      const caseId = claim.workflow.fsoCase;

      // Update FSO case with latest claim data
      await fsoService.updateCase(caseId, {
        claimStatus: claim.status,
        claimAmount: claim.financial.claimAmount,
        routing: claim.workflow.routing,
        daysOpen: claim.workflow.daysOpen
      });

      console.log('[SyncEngine] Synced claim to FSO:', caseId);

    } catch (error) {
      console.error('[SyncEngine] Failed to sync claim to FSO:', error);
      throw error;
    }
  }

  /**
   * Sync Policy Data
   */
  async syncPolicy(policyNumber) {
    const syncId = `policy-${policyNumber}-${Date.now()}`;

    try {
      console.log('[SyncEngine] Syncing policy:', policyNumber);

      eventBus.publish(EventTypes.SYNC_STARTED, {
        syncId,
        entity: 'policy',
        entityId: policyNumber
      });

      // Get policy from Policy Admin (System of Record)
      const policy = await policyService.lookupPolicy(policyNumber, true); // Bypass cache

      // Policy Admin is read-only, no sync back needed
      // Just invalidate cache to force fresh reads

      console.log('[SyncEngine] Policy sync completed:', policyNumber);

      this.addToHistory(syncId, SyncStatus.SYNCED);

      eventBus.publish(EventTypes.SYNC_COMPLETED, {
        syncId,
        entity: 'policy',
        entityId: policyNumber,
        status: SyncStatus.SYNCED
      });

      return { success: true, syncId };

    } catch (error) {
      console.error('[SyncEngine] Policy sync failed:', error);

      this.addToHistory(syncId, SyncStatus.ERROR, error.message);

      eventBus.publish(EventTypes.SYNC_FAILED, {
        syncId,
        entity: 'policy',
        entityId: policyNumber,
        error: error.message
      });

      return { success: false, syncId, error: error.message };
    }
  }

  /**
   * Sync Document Data
   */
  async syncDocument(documentId, claimId) {
    const syncId = `document-${documentId}-${Date.now()}`;

    try {
      console.log('[SyncEngine] Syncing document:', documentId);

      // Get document from DMS
      const document = await dmsService.getDocument(documentId);

      // Ensure document is linked to claim in cmA
      if (claimId && document.claimId !== claimId) {
        await dmsService.linkDocumentToClaim(documentId, claimId);
      }

      console.log('[SyncEngine] Document sync completed:', documentId);

      this.addToHistory(syncId, SyncStatus.SYNCED);

      return { success: true, syncId };

    } catch (error) {
      console.error('[SyncEngine] Document sync failed:', error);

      this.addToHistory(syncId, SyncStatus.ERROR, error.message);

      return { success: false, syncId, error: error.message };
    }
  }

  /**
   * Event Handlers
   */

  async handleClaimCreated(event) {
    const { claim } = event.data;
    console.log('[SyncEngine] Handling claim created:', claim.id);

    // Sync to FSO if case exists
    if (claim.workflow && claim.workflow.fsoCase) {
      await this.syncClaimToFSO(claim);
    }
  }

  async handleClaimUpdated(event) {
    const { claimId } = event.data;
    console.log('[SyncEngine] Handling claim updated:', claimId);

    // Queue sync for claim
    this.queueSync('claim', claimId);
  }

  async handlePolicyRetrieved(event) {
    const { policy } = event.data;
    console.log('[SyncEngine] Handling policy retrieved:', policy.policyNumber);

    // Cache policy data (already handled by policyService)
  }

  async handlePolicyUpdated(event) {
    const { policyNumber } = event.data;
    console.log('[SyncEngine] Handling policy updated:', policyNumber);

    // Invalidate policy cache
    policyService.invalidatePolicyCache(policyNumber);
  }

  async handleDocumentUploaded(event) {
    const { document } = event.data;
    console.log('[SyncEngine] Handling document uploaded:', document.id);

    // Trigger IDP classification
    if (!document.classification) {
      await dmsService.classifyDocument(document.id);
    }
  }

  async handleDocumentClassified(event) {
    const { documentId, classification } = event.data;
    console.log('[SyncEngine] Handling document classified:', documentId);

    // Document classification complete, ready for extraction
  }

  async handleCaseCreated(event) {
    const { fsoCase } = event.data;
    console.log('[SyncEngine] Handling FSO case created:', fsoCase.id);

    // FSO case created, no additional sync needed
  }

  async handleTaskCompleted(event) {
    const { taskId } = event.data;
    console.log('[SyncEngine] Handling task completed:', taskId);

    // Task completed, may trigger requirement updates
  }

  /**
   * Queue Management
   */

  queueSync(entity, entityId, priority = 'normal') {
    const syncItem = {
      entity,
      entityId,
      priority,
      queuedAt: new Date().toISOString()
    };

    this.syncQueue.push(syncItem);

    console.log('[SyncEngine] Queued sync:', syncItem);

    // Process queue after short delay (debounce)
    setTimeout(() => this.processQueue(), 1000);
  }

  async processQueue() {
    if (this.syncQueue.length === 0) return;

    console.log(`[SyncEngine] Processing sync queue (${this.syncQueue.length} items)`);

    // Sort by priority
    this.syncQueue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Process first item
    const item = this.syncQueue.shift();

    try {
      switch (item.entity) {
        case 'claim':
          await this.syncClaim(item.entityId);
          break;
        case 'policy':
          await this.syncPolicy(item.entityId);
          break;
        case 'document':
          await this.syncDocument(item.entityId);
          break;
        default:
          console.warn('[SyncEngine] Unknown entity type:', item.entity);
      }
    } catch (error) {
      console.error('[SyncEngine] Queue processing error:', error);
    }

    // Continue processing if queue not empty
    if (this.syncQueue.length > 0) {
      setTimeout(() => this.processQueue(), 500);
    }
  }

  /**
   * History Management
   */

  addToHistory(syncId, status, error = null) {
    this.syncHistory.push({
      syncId,
      status,
      error,
      timestamp: new Date().toISOString()
    });

    // Trim history if exceeds max size
    if (this.syncHistory.length > this.maxHistorySize) {
      this.syncHistory.shift();
    }
  }

  getSyncHistory(limit = 10) {
    return this.syncHistory.slice(-limit).reverse();
  }

  /**
   * Status Methods
   */

  getActiveSyncs() {
    return Array.from(this.activeSyncs.values());
  }

  getQueueStatus() {
    return {
      queueSize: this.syncQueue.length,
      activeSyncs: this.activeSyncs.size,
      recentHistory: this.getSyncHistory(5)
    };
  }
}

// Create singleton instance
const syncEngine = new SyncEngine();

export default syncEngine;
export { SyncEngine, SyncStatus, SyncDirection };
