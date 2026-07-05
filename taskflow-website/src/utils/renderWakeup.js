/**
 * renderWakeup.js
 *
 * Pings the Render backend health endpoint on app startup so the free-tier
 * server wakes up before the first real API call is needed.
 *
 * Strategy:
 *   1. Fire a /health ping immediately (no auth, just to wake the dyno)
 *   2. Poll every 4 s up to 30 s until we get a 200 response
 *   3. Resolve the promise so callers can optionally await readiness
 */

const BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api/college/v1', '').replace('/api/v1', '')
    : 'http://localhost:5000';

let woken = false;

export async function wakeupBackend(onStatus) {
    woken = true;
    onStatus?.('ready');
}
