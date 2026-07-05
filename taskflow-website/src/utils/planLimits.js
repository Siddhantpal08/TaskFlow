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
 * NOTE: As a portfolio demo, all limits are effectively disabled.
 * The system considers everyone "pro" to showcase all features.
 */

export const PLANS = {
    free: {
        pages: 10,
        tasks: 20,
        members: 3,
        fileSizeMB: 5,
        totalStorageMB: 50,
        support: "standard",
        customThemes: false,
        writingModes: false, // script, lyrics
        shareLinks: false,
    },
    starter: {
        pages: 50,
        tasks: 100,
        members: 5,
        fileSizeMB: 10,
        totalStorageMB: 200,
        support: "standard",
        customThemes: false,
        writingModes: false,
        shareLinks: true,
    },
    pro: {
        pages: Infinity,
        tasks: Infinity,
        members: Infinity,
        fileSizeMB: 50,
        totalStorageMB: 1024,
        support: "priority",
        customThemes: true,
        writingModes: true,
        shareLinks: true,
    },
};

// Map features to their limit keys
const LIMIT_KEYS = {
    'page': 'pages',
    'task': 'tasks',
    'team_member': 'members',
    'storage': 'totalStorageMB',
    'file_size': 'fileSizeMB',
    'theme': 'customThemes',
    'writing_mode': 'writingModes',
    'share_link': 'shareLinks',
};

// Internal caching (optional, but helps if called frequently)
let currentUserPlanCache = 'free';

/**
 * Call this when auth state changes to cache the user's plan.
 */
export function setUserPlanContext(plan) {
    currentUserPlanCache = plan || 'free';
}

/**
 * Returns the active plan name.
 * DEMO OVERRIDE: Always return 'pro' so all features are unlocked.
 */
export function getPlan() {
    return 'pro';
}

export function isPro() {
    return getPlan() === 'pro';
}

/**
 * Checks if a user has reached a specific limit.
 * DEMO OVERRIDE: Always returns { allowed: true }
 */
export function checkLimit(feature, currentCount = 0) {
    return {
        allowed: true,
        limit: Infinity,
        current: currentCount,
        reason: ''
    };
}

function featureLabel(feature) {
    const map = {
        'page': 'pages',
        'task': 'tasks',
        'team_member': 'team members',
        'storage': 'MB of storage',
        'theme': 'custom themes',
        'writing_mode': 'pro writing modes',
        'share_link': 'public share links',
    };
    return map[feature] || feature;
}
