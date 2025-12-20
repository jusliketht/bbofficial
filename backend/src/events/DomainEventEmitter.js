// =====================================================
// DOMAIN EVENT EMITTER
// Simple event emitter for domain events
// =====================================================

const EventEmitter = require('events');
const enterpriseLogger = require('../utils/logger');

class DomainEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Allow up to 50 listeners
  }

  /**
   * Emit ITR state transition event
   * @param {string} filingId - Filing ID
   * @param {string} fromState - Previous state
   * @param {string} toState - New state
   * @param {object} context - Additional context
   */
  emitITRStateTransition(filingId, fromState, toState, context = {}) {
    const event = {
      type: 'ITR_STATE_TRANSITION',
      filingId,
      fromState,
      toState,
      timestamp: new Date().toISOString(),
      context,
    };

    enterpriseLogger.info('Domain event emitted', {
      event: 'ITR_STATE_TRANSITION',
      filingId,
      fromState,
      toState,
    });

    this.emit('ITR_STATE_TRANSITION', event);

    return event;
  }

  /**
   * Emit generic domain event
   * @param {string} eventType - Event type
   * @param {object} payload - Event payload
   */
  emitDomainEvent(eventType, payload) {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      ...payload,
    };

    enterpriseLogger.info('Domain event emitted', {
      event: eventType,
      payload: Object.keys(payload),
    });

    this.emit(eventType, event);

    return event;
  }
}

// Export singleton instance
module.exports = new DomainEventEmitter();

