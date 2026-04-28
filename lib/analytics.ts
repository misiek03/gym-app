type EventPayload = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(eventName: string, payload?: EventPayload) {
  // Placeholder telemetry transport. Replace with Segment/Amplitude/Firebase integration.
  console.log('[analytics]', eventName, payload ?? {});
}
