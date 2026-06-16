/**
 * adminController.js
 * Admin panel endpoints — gated by role = 'admin'.
 * All stats are live from the DB, no caching.
 */
const asyncWrapper = require('../utils/asyncWrapper');
const db = require('../utils/db');

/** GET /admin/stats — platform overview */
const getStats = asyncWrapper(async (req, res) => {
    const [[{ totalUsers }]]    = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ proUsers }]]      = await db.query("SELECT COUNT(*) AS proUsers FROM users WHERE plan = 'pro'");
    const [[{ freeUsers }]]     = await db.query("SELECT COUNT(*) AS freeUsers FROM users WHERE plan = 'free' OR plan IS NULL");
    const [[{ verifiedUsers }]] = await db.query("SELECT COUNT(*) AS verifiedUsers FROM users WHERE is_email_verified = 1");
    const [[{ newToday }]]      = await db.query("SELECT COUNT(*) AS newToday FROM users WHERE DATE(created_at) = CURDATE()");
    const [[{ newThisWeek }]]   = await db.query("SELECT COUNT(*) AS newThisWeek FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");

    // Notes storage estimate
    const [[{ totalPages }]]  = await db.query('SELECT COUNT(*) AS totalPages FROM notes_pages');
    const [[{ totalBlocks }]] = await db.query('SELECT COUNT(*) AS totalBlocks FROM notes_blocks');
    // Estimate content size in bytes
    const [[{ contentBytes }]] = await db.query('SELECT COALESCE(SUM(LENGTH(content)), 0) AS contentBytes FROM notes_blocks');

    // Tasks
    const [[{ totalTasks }]] = await db.query('SELECT COUNT(*) AS totalTasks FROM tasks');

    // Recent signups (last 10)
    const [recentUsers] = await db.query(
        `SELECT id, name, email, plan, role, is_email_verified, created_at
         FROM users ORDER BY created_at DESC LIMIT 10`
    );

    // Plan expires breakdown
    const [[{ expiringThisMonth }]] = await db.query(
        `SELECT COUNT(*) AS expiringThisMonth FROM users
         WHERE plan = 'pro' AND plan_expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)`
    );

    res.json({
        status: 'success',
        data: {
            users: { total: totalUsers, pro: proUsers, free: freeUsers, verified: verifiedUsers, newToday, newThisWeek },
            notes: { pages: totalPages, blocks: totalBlocks, estimatedStorageMB: +(contentBytes / 1024 / 1024).toFixed(2) },
            tasks: { total: totalTasks },
            subscriptions: { expiringThisMonth },
            recentUsers,
        },
    });
});

/** GET /admin/users?page=1&limit=20&search=&plan= — paginated user list */
const getUsers = asyncWrapper(async (req, res) => {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;
    const plan   = req.query.plan || null;

    let where = 'WHERE 1=1';
    const params = [];
    if (search) { where += ' AND (name LIKE ? OR email LIKE ?)'; params.push(search, search); }
    if (plan)   { where += ' AND plan = ?'; params.push(plan); }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM users ${where}`, params);
    const [users] = await db.query(
        `SELECT id, name, email, avatar_initials, plan, role, is_email_verified, terms_accepted_at, created_at, plan_expires_at
         FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    res.json({ status: 'success', data: { users, total, page, limit, pages: Math.ceil(total / limit) } });
});

/** PATCH /admin/users/:id/plan — change a user's plan */
const updateUserPlan = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { plan, expiresAt } = req.body; // plan: 'free'|'pro'
    if (!['free', 'pro'].includes(plan)) {
        return res.status(400).json({ status: 'fail', message: 'Plan must be "free" or "pro"' });
    }
    await db.query(
        'UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?',
        [plan, expiresAt || null, id]
    );
    res.json({ status: 'success', message: `User ${id} plan updated to ${plan}` });
});

/** PATCH /admin/users/:id/role — promote/demote admin */
const updateUserRole = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ status: 'fail', message: 'Role must be "user" or "admin"' });
    }
    // Prevent self-demotion
    if (parseInt(id) === req.user.id && role === 'user') {
        return res.status(400).json({ status: 'fail', message: 'Cannot demote yourself.' });
    }
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ status: 'success', message: `User ${id} role updated to ${role}` });
});

/** DELETE /admin/users/:id — hard delete user + all their data */
const deleteUser = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ status: 'fail', message: 'Cannot delete your own admin account.' });
    }
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ status: 'success', message: `User ${id} permanently deleted.` });
});

/** GET /admin/storage — detailed storage breakdown */
const getStorageBreakdown = asyncWrapper(async (req, res) => {
    const [topUsers] = await db.query(
        `SELECT u.id, u.name, u.email, u.plan,
            COUNT(DISTINCT np.id) AS page_count,
            COUNT(DISTINCT nb.id) AS block_count,
            COALESCE(SUM(LENGTH(nb.content)), 0) AS content_bytes
         FROM users u
         LEFT JOIN notes_pages np ON np.user_id = u.id
         LEFT JOIN notes_blocks nb ON nb.page_id = np.id
         GROUP BY u.id, u.name, u.email, u.plan
         ORDER BY content_bytes DESC LIMIT 20`
    );
    const [rows] = await db.query(
        `SELECT COALESCE(SUM(LENGTH(content)), 0) / 1024 / 1024 AS totalMB FROM notes_blocks`
    );
    const totalMB = rows[0] && rows[0].totalMB ? parseFloat(rows[0].totalMB) : 0;

    res.json({ status: 'success', data: { topUsers, totalMB: +totalMB.toFixed(3) } });
});

module.exports = { getStats, getUsers, updateUserPlan, updateUserRole, deleteUser, getStorageBreakdown };
