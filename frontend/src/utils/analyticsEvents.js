// =====================================================
// ANALYTICS EVENTS STUB
// Minimal no-op implementations for cleanup
// =====================================================

export function getSessionId() {
  return 'stub_session';
}

export function getJourneyId() {
  return 'stub_journey';
}

export function resetJourney() {
  // no-op
}

export function ensureJourneyStart() {
  return Date.now();
}

export function msSinceJourneyStart() {
  return 0;
}

export async function trackEvent(name, properties = {}) {
  // no-op - analytics disabled
}
