import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 });

let activeRequests = 0;
function startRequest() {
    if (activeRequests === 0) NProgress.start();
    activeRequests++;
}
function stopRequest() {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) NProgress.done();
}

/**
 * Central API fetch utility.
 * - Attaches Authorization header from localStorage token
 * - Auto-refreshes on 401 (once), then logs out
 * - Always returns parsed JSON or throws with { message }
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let _getToken = () => localStorage.getItem('tf_token');
let _setToken = (t) => localStorage.setItem('tf_token', t);
let _onLogout = () => { };

export function configureClient({ getToken, setToken, onLogout }) {
    _getToken = getToken;
    _setToken = setToken;
    _onLogout = onLogout;
}

async function doFetch(path, options = {}, retry = true) {
    if (retry) startRequest();

    try {
        const token = _getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        };

        const res = await fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' });

        if (res.status === 401 && retry) {
            // Attempt silent token refresh
            const refreshRes = await fetch(`${BASE}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            });
            if (refreshRes.ok) {
                const { accessToken } = await refreshRes.json();
                _setToken(accessToken);
                return await doFetch(path, options, false); // one retry
            } else {
                _onLogout();
                throw { message: 'Session expired. Please log in again.' };
            }
        }

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw json.error || json || { message: 'Request failed' };
        }
        return json;
    } finally {
        if (retry) stopRequest();
    }
}

export const api = {
    get: (path, opts) => doFetch(path, { method: 'GET', ...opts }),
    post: (path, body, opts) => doFetch(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
    put: (path, body, opts) => doFetch(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),
    patch: (path, body, opts) => doFetch(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }),
    delete: (path, body, opts) => doFetch(path, { method: 'DELETE', ...(body ? { body: JSON.stringify(body) } : {}), ...opts }),
};
