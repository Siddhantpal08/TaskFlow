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
    if (woken) { onStatus?.('ready'); return; }

    const HEALTH = `${BASE}/ping`;
    const MAX_WAIT_MS = 45_000;
    const POLL_MS = 3_500;
    const start = Date.now();

    onStatus?.('waking');

    while (Date.now() - start < MAX_WAIT_MS) {
        try {
            const res = await fetch(HEALTH, { method: 'GET', cache: 'no-store' });
            if (res.ok) {
                woken = true;
                onStatus?.('ready');
                return;
            }
        } catch {
            // ignore network errors during wake-up
        }
        await new Promise(r => setTimeout(r, POLL_MS));
    }

    woken = true;
    onStatus?.('timeout');
}
