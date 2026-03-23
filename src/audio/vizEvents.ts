/** Shared event bus for visualization — engine pushes events, viz reads them */

export interface VizEvent {
  s: string;
  gain: number;
  duration: number;
  triggeredAt: number;
  cutoff?: number;
  delay?: number;
  room?: number;
  pan?: number;
  speed?: number;
  note?: number;
}

const MAX_EVENTS = 200;
const events: VizEvent[] = [];

export function pushVizEvent(ev: VizEvent) {
  events.push(ev);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
}

export function getVizEvents(): VizEvent[] {
  return events;
}

export function clearVizEvents() {
  events.length = 0;
}

export function expireVizEvents(maxAgeMs: number) {
  const now = performance.now();
  let i = 0;
  while (i < events.length && now - events[i].triggeredAt > maxAgeMs) {
    i++;
  }
  if (i > 0) events.splice(0, i);
}
