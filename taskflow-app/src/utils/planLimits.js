/**
 * planLimits.js
 * 
 * Freemium model for TaskFlow.
 * 
 * FREE tier:
 *   - 10 note pages
 *   - 5 tasks visible / created
 *   - 3 team members
 *   - No sharing / export
 *   - No Script/Lyrics mode
 * 
 * PRO tier (paid):
 *   - Unlimited everything
 *   - Priority sync
 *   - Export PDF
 *   - All writing modes
 *   - Priority support
 * 
 * Implementation: stored in localStorage for now (can be moved to backend).
 * On a real SaaS this would come from a /me API call with plan field.
 */

export const PLANS = {
    free: {
        label: 'Free',
        price: '₹0/mo',
        notePages: 10,
        tasks: 20,
        teamMembers: 3,
        sharing: false,
        writingModes: false,
        exportPdf: false,
        aiSuggestions: false,
    },
    pro: {
        label: 'Pro',
        price: '₹299/mo',
        notePages: Infinity,
        tasks: Infinity,
        teamMembers: Infinity,
        sharing: true,
        writingModes: true,
        exportPdf: true,
        aiSuggestions: true,
    },
};

/**
 * Returns the user's current plan key ('free' | 'pro').
 * Source of truth: localStorage tf_plan (set after payment).
 */
export function getPlan() {
    return localStorage.getItem('tf_plan') || 'free';
}

export function getCurrentLimits() {
    return PLANS[getPlan()] || PLANS.free;
}

export function isPro() {
    return getPlan() === 'pro';
}

/**
 * Check if an action is allowed under the current plan.
 * @param {'notePages'|'tasks'|'teamMembers'|'sharing'|'writingModes'|'exportPdf'} feature
 * @param {number} [currentCount] - current usage count (for numeric limits)
 * @returns {{ allowed: boolean, limit: number|boolean, reason: string }}
 */
export function checkLimit(feature, currentCount = 0) {
    const limits = getCurrentLimits();
    const limit = limits[feature];

    if (typeof limit === 'boolean') {
        return {
            allowed: limit,
            limit,
            reason: limit ? '' : `${featureLabel(feature)} requires a Pro plan.`,
        };
    }

    if (typeof limit === 'number') {
        const allowed = limit === Infinity || currentCount < limit;
        return {
            allowed,
            limit,
            reason: allowed ? '' : `Free plan limit: ${limit} ${featureLabel(feature)}. Upgrade to Pro for unlimited.`,
        };
    }

    return { allowed: true, limit, reason: '' };
}

function featureLabel(f) {
    const map = {
        notePages: 'note pages',
        tasks: 'tasks',
        teamMembers: 'team members',
        sharing: 'Note Sharing',
        writingModes: 'Script & Lyrics mode',
        exportPdf: 'PDF Export',
        aiSuggestions: 'AI Suggestions',
    };
    return map[f] || f;
}
