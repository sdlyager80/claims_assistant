/**
 * Event Bus for Cross-System Synchronization
 * Enables event-driven communication between contexts and services
 */

class EventBus {
  constructor() {
    this.subscribers = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Subscribe to an event
   * @param {string} eventType - Event type or pattern (e.g., 'claim.created' or 'claim.*')
   * @param {Function} handler - Event handler function
   * @returns {Function} Unsubscribe function
   */
  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }

    this.subscribers.get(eventType).push(handler);

    console.log(`[EventBus] Subscribed to: ${eventType}`);

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, handler);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventType - Event type
   * @param {Function} handler - Event handler function
   */
  unsubscribe(eventType, handler) {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        console.log(`[EventBus] Unsubscribed from: ${eventType}`);
      }

      // Remove event type if no handlers left
      if (handlers.length === 0) {
        this.subscribers.delete(eventType);
      }
    }
  }

  /**
   * Publish an event
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   */
  async publish(eventType, data) {
    console.log(`[EventBus] Publishing: ${eventType}`, data);

    // Add to event history
    this.addToHistory(eventType, data);

    // Get exact match handlers
    const exactHandlers = this.subscribers.get(eventType) || [];

    // Get wildcard handlers (e.g., 'claim.*' matches 'claim.created')
    const wildcardHandlers = [];
    for (const [pattern, handlers] of this.subscribers.entries()) {
      if (this.matchesPattern(eventType, pattern) && pattern !== eventType) {
        wildcardHandlers.push(...handlers);
      }
    }

    // Execute all matching handlers
    const allHandlers = [...exactHandlers, ...wildcardHandlers];

    for (const handler of allHandlers) {
      try {
        await handler({
          type: eventType,
          data,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${eventType}:`, error);
      }
    }
  }

  /**
   * Check if event type matches pattern
   * @param {string} eventType - Event type
   * @param {string} pattern - Pattern (supports '*' wildcard)
   * @returns {boolean}
   */
  matchesPattern(eventType, pattern) {
    // Exact match
    if (eventType === pattern) return true;

    // Wildcard match (e.g., 'claim.*' matches 'claim.created')
    if (pattern.includes('*')) {
      const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
      return regex.test(eventType);
    }

    return false;
  }

  /**
   * Add event to history
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   */
  addToHistory(eventType, data) {
    this.eventHistory.push({
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    });

    // Trim history if exceeds max size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get event history
   * @param {string} eventType - Optional event type filter
   * @returns {Array}
   */
  getHistory(eventType = null) {
    if (eventType) {
      return this.eventHistory.filter(event => event.type === eventType);
    }
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = [];
    console.log('[EventBus] History cleared');
  }

  /**
   * Get all active subscriptions
   * @returns {Object}
   */
  getSubscriptions() {
    const subscriptions = {};
    for (const [eventType, handlers] of this.subscribers.entries()) {
      subscriptions[eventType] = handlers.length;
    }
    return subscriptions;
  }

  /**
   * Clear all subscriptions
   */
  clearSubscriptions() {
    this.subscribers.clear();
    console.log('[EventBus] All subscriptions cleared');
  }
}

// Create singleton instance
const eventBus = new EventBus();

/**
 * Predefined Event Types
 */
export const EventTypes = {
  // Claim Events
  CLAIM_CREATED: 'claim.created',
  CLAIM_UPDATED: 'claim.updated',
  CLAIM_DELETED: 'claim.deleted',
  CLAIM_STATUS_CHANGED: 'claim.status.changed',
  CLAIM_ASSIGNED: 'claim.assigned',

  // Policy Events
  POLICY_RETRIEVED: 'policy.retrieved',
  POLICY_SUSPENDED: 'policy.suspended',
  POLICY_UPDATED: 'policy.updated',

  // Document Events
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_CLASSIFIED: 'document.classified',
  DOCUMENT_EXTRACTED: 'document.extracted',
  DOCUMENT_REVIEWED: 'document.reviewed',

  // Requirement Events
  REQUIREMENT_GENERATED: 'requirement.generated',
  REQUIREMENT_SATISFIED: 'requirement.satisfied',
  REQUIREMENT_NIGO: 'requirement.nigo',
  REQUIREMENT_WAIVED: 'requirement.waived',

  // Workflow Events
  TASK_CREATED: 'task.created',
  TASK_ASSIGNED: 'task.assigned',
  TASK_COMPLETED: 'task.completed',
  CASE_CREATED: 'case.created',
  CASE_STATUS_CHANGED: 'case.status.changed',

  // AI Events
  AI_ANALYSIS_STARTED: 'ai.analysis.started',
  AI_ANALYSIS_COMPLETE: 'ai.analysis.complete',
  ANOMALY_DETECTED: 'anomaly.detected',
  POLICY_FILE_ANALYZED: 'policy.file.analyzed',

  // Payment Events
  PAYMENT_SCHEDULED: 'payment.scheduled',
  PAYMENT_EXECUTED: 'payment.executed',
  PAYMENT_FAILED: 'payment.failed',

  // Letter Events
  LETTER_GENERATED: 'letter.generated',
  LETTER_SENT: 'letter.sent',

  // Sync Events
  SYNC_STARTED: 'sync.started',
  SYNC_COMPLETED: 'sync.completed',
  SYNC_FAILED: 'sync.failed'
};

export default eventBus;
export { EventBus };
