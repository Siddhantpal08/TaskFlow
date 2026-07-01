import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/admin.js';
import { feedbackApi } from '../api/feedback.js';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';

const DARK = {
    bg: "#060B12", surf: "#0C1420", card: "#0F1C2E", border: "#182A42",
    accent: "#00E5CC", accentDim: "#00E5CC14", red: "#FF3D5A", amber: "#FFAA00",
    green: "#00D67B", purple: "#B083FF", t1: "#E2EFFF", t2: "#6A88AA", t3: "#2E4A68",
    nav: "#080E18", mono: "'IBM Plex Mono',monospace", disp: "'Outfit',sans-serif",
    shadow: "0 8px 32px #00000066", inset: "#060B12",
};
const t = DARK;

function StatCard({ label, value, sub, color = t.accent, icon }) {
    return (
        <div style={{
            background: t.card, border: `1px solid ${t.border}`, borderRadius: 14,
            padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6,
            boxShadow: t.shadow, transition: 'transform .18s',
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
            <div style={{ fontSize: 11, color: t.t3, fontFamily: t.mono, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{icon} {label}</div>
            <div style={{ fontSize: 36, fontWeight: 900, color, letterSpacing: '-2px', lineHeight: 1 }}>{value ?? '—'}</div>
            {sub && <div style={{ fontSize: 11, color: t.t2, fontFamily: t.mono }}>{sub}</div>}
        </div>
    );
}

function PlanBadge({ plan }) {
    const cfg = plan === 'pro'
        ? { bg: '#B083FF22', border: '#B083FF44', color: '#B083FF', label: '✦ PRO' }
        : { bg: '#00E5CC14', border: '#00E5CC33', color: '#00E5CC', label: 'FREE' };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
            borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: t.mono,
            background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
        }}>{cfg.label}</span>
    );
}

export default function AdminPanel({ t: themeProp, user }) {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [page, setPage] = useState(1);
    const [actionMsg, setActionMsg] = useState('');
    const [storage, setStorage] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [userToDelete, setUserToDelete] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const thm = themeProp || t;

    const loadStats = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminApi.getStats();
            setStats(res.data);
        } catch { } finally { setLoading(false); }
    }, []);

    const loadUsers = useCallback(async () => {
        try {
            setUsersLoading(true);
            const res = await adminApi.getUsers({ page, limit: 15, search, plan: planFilter });
            setUsers(res.data.users);
            setTotal(res.data.total);
        } catch { } finally { setUsersLoading(false); }
    }, [page, search, planFilter]);

    const loadStorage = useCallback(async () => {
        try { const res = await adminApi.getStorage(); setStorage(res.data); } catch { }
    }, []);

    const loadFeedback = useCallback(async () => {
        try {
            setFeedbackLoading(true);
            const res = await feedbackApi.list();
            if (res.data && res.data.feedback !== undefined) {
                setFeedback(res.data.feedback || []);
                setTickets(res.data.tickets || []);
            } else {
                setFeedback(res.data || []);
                setTickets([]);
            }
        } catch { } finally { setFeedbackLoading(false); }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);
    useEffect(() => { loadUsers(); }, [loadUsers]);
    useEffect(() => { if (activeTab === 'storage') loadStorage(); }, [activeTab, loadStorage]);
    useEffect(() => { if (activeTab === 'feedback') loadFeedback(); }, [activeTab, loadFeedback]);

    const notify = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

    const handlePlan = async (userId, newPlan) => {
        try {
            await adminApi.updateUserPlan(userId, newPlan);
            notify(`Plan updated to ${newPlan}`);
            loadUsers(); loadStats();
        } catch { notify('Failed to update plan'); }
    };

    const handleDelete = async (userId, name) => {
        setUserToDelete({ id: userId, name });
    };

    const totalPages = Math.ceil(total / 15);

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'users', label: '👥 Users' },
        { id: 'storage', label: '💾 Storage' },
        { id: 'feedback', label: '💬 Feedback' },
    ];

    return (
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, minHeight: '100%', background: thm.bg }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: thm.t1, letterSpacing: '-0.5px' }}>
                        ⚙️ Admin Panel
                    </div>
                    <div style={{ fontSize: 12, color: thm.t3, fontFamily: thm.mono, marginTop: 2 }}>
                        Crevio — TaskFlow internal dashboard · {user?.email}
                    </div>
                </div>
                <button onClick={() => { loadStats(); loadUsers(); if (activeTab === 'feedback') loadFeedback(); }} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8, border: `1px solid ${thm.border}`,
                    background: 'transparent', color: thm.t2, fontSize: 12,
                    fontFamily: thm.disp, cursor: 'pointer',
                }}>↻ Refresh</button>
            </div>

            {/* Action toast */}
            {actionMsg && (
                <div style={{
                    background: `${thm.green}20`, border: `1px solid ${thm.green}44`,
                    borderRadius: 8, padding: '10px 16px', fontSize: 13, color: thm.green,
                }}>{actionMsg}</div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${thm.border}`, paddingBottom: 0 }}>
                {tabs.map(tab => {
                    const active = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            padding: '8px 16px', background: 'none', border: 'none',
                            borderBottom: active ? `2px solid ${thm.accent}` : '2px solid transparent',
                            color: active ? thm.accent : thm.t2, fontFamily: thm.disp,
                            fontSize: 13, fontWeight: active ? 700 : 400, cursor: 'pointer',
                            marginBottom: -1, transition: 'all .15s',
                        }}>{tab.label}</button>
                    );
                })}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
                <>
                    {loading ? (
                        <div style={{ color: thm.t3, fontSize: 13, fontFamily: thm.mono }}>Loading stats…</div>
                    ) : stats ? (
                        <>
                            {/* Stats grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                                <StatCard label="Total Users" value={stats.users.total} sub="all time" color={thm.accent} icon="👤" />
                                <StatCard label="Pro Users" value={stats.users.pro} sub={`${Math.round(stats.users.pro / Math.max(stats.users.total, 1) * 100)}% of total`} color={thm.purple} icon="✦" />
                                <StatCard label="Free Users" value={stats.users.free} sub="on free plan" color={thm.t2} icon="🆓" />
                                <StatCard label="New Today" value={stats.users.newToday} sub="registered today" color={thm.green} icon="🌱" />
                                <StatCard label="This Week" value={stats.users.newThisWeek} sub="new signups" color={thm.amber} icon="📈" />
                                <StatCard label="Verified" value={stats.users.verified} sub="email confirmed" color={thm.green} icon="✓" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {/* Content stats */}
                                <div style={{ background: thm.card, border: `1px solid ${thm.border}`, borderRadius: 14, padding: 20 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: thm.t1, marginBottom: 16 }}>📝 Content Stats</div>
                                    {[
                                        ['Note Pages', stats.notes.pages],
                                        ['Note Blocks', stats.notes.blocks],
                                        ['Tasks', stats.tasks.total],
                                        ['Est. Storage', `${stats.notes.estimatedStorageMB} MB`],
                                        ['Expiring Soon (Pro)', stats.subscriptions.expiringThisMonth],
                                    ].map(([label, val]) => (
                                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${thm.border}`, fontSize: 13 }}>
                                            <span style={{ color: thm.t2 }}>{label}</span>
                                            <span style={{ color: thm.t1, fontFamily: thm.mono, fontWeight: 600 }}>{val}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent signups */}
                                <div style={{ background: thm.card, border: `1px solid ${thm.border}`, borderRadius: 14, padding: 20 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: thm.t1, marginBottom: 16 }}>🆕 Recent Signups <span style={{ fontSize: 10, color: thm.green, fontFamily: thm.mono, fontWeight: 400 }}>(verified only)</span></div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {(stats.recentUsers || []).slice(0, 6).map(u => (
                                            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                                    background: `linear-gradient(135deg, ${thm.accent}33, ${thm.purple}33)`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 11, fontWeight: 700, color: thm.accent,
                                                }}>{(u.name || u.email || '?')[0].toUpperCase()}</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 600, color: thm.t1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name || 'Unnamed'}</div>
                                                    <div style={{ fontSize: 10, color: thm.t3, fontFamily: thm.mono }}>{u.email}</div>
                                                </div>
                                                <PlanBadge plan={u.plan} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ color: thm.red, fontSize: 13 }}>Failed to load stats. Check console.</div>
                    )}
                </>
            )}

            {/* ── USERS TAB ── */}
            {activeTab === 'users' && (
                <>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by name or email…"
                            style={{
                                flex: 1, minWidth: 200, background: thm.surf, border: `1px solid ${thm.border}`,
                                borderRadius: 8, padding: '9px 13px', color: thm.t1,
                                fontSize: 13, fontFamily: thm.disp, outline: 'none',
                            }}
                        />
                        <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }} style={{
                            background: thm.surf, border: `1px solid ${thm.border}`, borderRadius: 8,
                            padding: '9px 13px', color: thm.t2, fontSize: 13, fontFamily: thm.disp, outline: 'none',
                        }}>
                            <option value="">All Plans</option>
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div style={{ background: thm.card, border: `1px solid ${thm.border}`, borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 200px 80px 80px 120px',
                            padding: '10px 18px', borderBottom: `1px solid ${thm.border}`,
                            fontSize: 10, fontWeight: 600, color: thm.t3, textTransform: 'uppercase',
                            letterSpacing: '0.6px', fontFamily: thm.mono,
                        }}>
                            <span>User</span><span>Email</span><span>Plan</span><span>Role</span><span>Actions</span>
                        </div>
                        {usersLoading ? (
                            <div style={{ padding: 20, color: thm.t3, fontSize: 13 }}>Loading users…</div>
                        ) : users.map(u => (
                            <div key={u.id} style={{
                                display: 'grid', gridTemplateColumns: '1fr 200px 80px 80px 120px',
                                padding: '11px 18px', borderBottom: `1px solid ${thm.border}`,
                                alignItems: 'center', transition: 'background .12s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = thm.surf}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                                        background: `linear-gradient(135deg, ${thm.accent}25, ${thm.purple}25)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 700, color: thm.accent,
                                    }}>{(u.name || '?')[0].toUpperCase()}</div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: thm.t1 }}>{u.name || 'Unnamed'}</div>
                                        <div style={{ fontSize: 10, color: thm.t3, fontFamily: thm.mono }}>ID: {u.id}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: thm.t2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                                <PlanBadge plan={u.plan || 'free'} />
                                <span style={{ fontSize: 11, color: u.role === 'admin' ? thm.amber : thm.t3, fontFamily: thm.mono, fontWeight: 700 }}>
                                    {u.role === 'admin' ? '👑 admin' : 'user'}
                                </span>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button
                                        onClick={() => handlePlan(u.id, u.plan === 'pro' ? 'free' : 'pro')}
                                        title={u.plan === 'pro' ? 'Downgrade to Free' : 'Upgrade to Pro'}
                                        style={{
                                            padding: '4px 8px', borderRadius: 6, border: `1px solid ${thm.border}`,
                                            background: 'transparent', color: u.plan === 'pro' ? thm.amber : thm.purple,
                                            fontSize: 10, cursor: 'pointer', fontFamily: thm.mono, fontWeight: 700,
                                        }}>
                                        {u.plan === 'pro' ? '↓ Free' : '↑ Pro'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.id, u.name)}
                                        style={{
                                            padding: '4px 8px', borderRadius: 6, border: `1px solid ${thm.red}44`,
                                            background: 'transparent', color: thm.red,
                                            fontSize: 10, cursor: 'pointer', fontFamily: thm.mono,
                                        }}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${thm.border}`, background: 'transparent', color: thm.t2, cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
                            <span style={{ fontSize: 12, color: thm.t2, fontFamily: thm.mono }}>Page {page} of {totalPages} · {total} users</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${thm.border}`, background: 'transparent', color: thm.t2, cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
                        </div>
                    )}
                </>
            )}

            {/* ── STORAGE TAB ── */}
            {activeTab === 'storage' && (
                <>
                    {!storage ? (
                        <div style={{ color: thm.t3, fontSize: 13, fontFamily: thm.mono }}>Loading storage data…</div>
                    ) : (
                        <>
                            {/* Storage bar */}
                            <div style={{ background: thm.card, border: `1px solid ${thm.border}`, borderRadius: 14, padding: 20 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: thm.t1, marginBottom: 16 }}>Total Storage Used</div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: thm.accent, letterSpacing: '-1.5px', marginBottom: 8 }}>
                                    {storage.totalMB} MB
                                    <span style={{ fontSize: 14, fontWeight: 400, color: thm.t3, fontFamily: thm.mono, marginLeft: 10 }}>of 10,240 MB (10 GB)</span>
                                </div>
                                <div style={{ height: 10, background: thm.border, borderRadius: 5, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(100, (storage.totalMB / 10240) * 100).toFixed(2)}%`,
                                        background: storage.totalMB > 8000
                                            ? `linear-gradient(to right, ${thm.red}, ${thm.amber})`
                                            : `linear-gradient(to right, ${thm.accent}, ${thm.purple})`,
                                        borderRadius: 5, transition: 'width .5s',
                                    }} />
                                </div>
                                <div style={{ fontSize: 11, color: thm.t3, fontFamily: thm.mono, marginTop: 6 }}>
                                    {((storage.totalMB / 10240) * 100).toFixed(3)}% used
                                </div>
                            </div>

                            {/* Top users by storage */}
                            <div style={{ background: thm.card, border: `1px solid ${thm.border}`, borderRadius: 14, overflow: 'hidden' }}>
                                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${thm.border}`, fontSize: 13, fontWeight: 700, color: thm.t1 }}>
                                    Top Users by Storage
                                </div>
                                {(storage.topUsers || []).map((u, i) => {
                                    const mb = (u.content_bytes / 1024 / 1024).toFixed(3);
                                    const pct = storage.totalMB > 0 ? ((mb / storage.totalMB) * 100).toFixed(1) : 0;
                                    return (
                                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 20px', borderBottom: `1px solid ${thm.border}` }}>
                                            <div style={{ width: 22, textAlign: 'right', fontSize: 12, color: thm.t3, fontFamily: thm.mono, flexShrink: 0 }}>#{i + 1}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: thm.t1 }}>{u.name || 'Unnamed'}</div>
                                                <div style={{ fontSize: 11, color: thm.t3, fontFamily: thm.mono }}>{u.email}</div>
                                            </div>
                                            <div style={{ fontSize: 11, color: thm.t2, fontFamily: thm.mono, textAlign: 'right', flexShrink: 0 }}>
                                                <div>{u.page_count} pages · {u.block_count} blocks</div>
                                                <div style={{ color: thm.accent }}>{mb} MB ({pct}%)</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* ── FEEDBACK & SUPPORT TAB ── */}
            {activeTab === 'feedback' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Support Tickets */}
                    <div style={{ background: thm.card, border: `1px solid ${thm.border}`, borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${thm.border}`, fontSize: 13, fontWeight: 700, color: thm.t1 }}>
                            🎫 Support Tickets
                        </div>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '180px 100px 1fr 180px',
                            padding: '10px 18px', borderBottom: `1px solid ${thm.border}`,
                            fontSize: 10, fontWeight: 600, color: thm.t3, textTransform: 'uppercase',
                            letterSpacing: '0.6px', fontFamily: thm.mono,
                        }}>
                            <span>User</span><span>Category</span><span>Ticket</span><span>Status / Date</span>
                        </div>
                        {feedbackLoading ? (
                            <div style={{ padding: 20, color: thm.t3, fontSize: 13 }}>Loading tickets…</div>
                        ) : tickets.length === 0 ? (
                            <div style={{ padding: 20, color: thm.t3, fontSize: 13, textAlign: 'center' }}>No tickets found.</div>
                        ) : tickets.map(tkt => (
                            <div key={`tkt-${tkt.id}`} style={{
                                display: 'grid', gridTemplateColumns: '180px 100px 1fr 180px',
                                padding: '11px 18px', borderBottom: `1px solid ${thm.border}`,
                                alignItems: 'center', transition: 'background .12s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = thm.surf}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: thm.t1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tkt.name || 'Anonymous'}</div>
                                    <div style={{ fontSize: 10, color: thm.t3, fontFamily: thm.mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tkt.email || 'N/A'}</div>
                                </div>
                                <span style={{ fontSize: 11, color: thm.t2, fontFamily: thm.mono, textTransform: 'uppercase' }}>
                                    {tkt.category}
                                </span>
                                <div style={{ paddingRight: 10 }}>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: thm.t1, marginBottom: 4 }}>{tkt.title}</div>
                                    <div style={{ fontSize: 12, color: thm.t2, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.4 }}>{tkt.description}</div>
                                </div>
                                <div style={{ fontSize: 11, color: thm.t3, fontFamily: thm.mono }}>
                                    <span style={{ display: 'inline-block', padding: '2px 6px', background: tkt.status === 'open' ? `${thm.amber}22` : `${thm.green}22`, color: tkt.status === 'open' ? thm.amber : thm.green, borderRadius: 4, marginBottom: 4, fontWeight: 700 }}>{tkt.status}</span>
                                    <br />{new Date(tkt.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Feedback */}
                    <div style={{ background: thm.card, border: `1px solid ${thm.border}`, borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${thm.border}`, fontSize: 13, fontWeight: 700, color: thm.t1 }}>
                            ⭐ User Feedback
                        </div>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '180px 100px 1fr 180px',
                            padding: '10px 18px', borderBottom: `1px solid ${thm.border}`,
                            fontSize: 10, fontWeight: 600, color: thm.t3, textTransform: 'uppercase',
                            letterSpacing: '0.6px', fontFamily: thm.mono,
                        }}>
                            <span>User</span><span>Rating</span><span>Message</span><span>Submitted At</span>
                        </div>
                        {feedbackLoading ? (
                            <div style={{ padding: 20, color: thm.t3, fontSize: 13 }}>Loading feedback…</div>
                        ) : feedback.length === 0 ? (
                            <div style={{ padding: 20, color: thm.t3, fontSize: 13, textAlign: 'center' }}>No feedback entries found.</div>
                        ) : feedback.map(f => (
                            <div key={`fb-${f.id}`} style={{
                                display: 'grid', gridTemplateColumns: '180px 100px 1fr 180px',
                                padding: '11px 18px', borderBottom: `1px solid ${thm.border}`,
                                alignItems: 'center', transition: 'background .12s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = thm.surf}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: thm.t1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name || 'Anonymous'}</div>
                                    <div style={{ fontSize: 10, color: thm.t3, fontFamily: thm.mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.email || 'N/A'}</div>
                                </div>
                                <span style={{ fontSize: 12, color: thm.amber, letterSpacing: 1 }}>
                                    {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                                </span>
                                <div style={{ fontSize: 12.5, color: thm.t2, paddingRight: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.4 }}>{f.message}</div>
                                <div style={{ fontSize: 11, color: thm.t3, fontFamily: thm.mono }}>
                                    {new Date(f.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {userToDelete && (
                <ConfirmModal
                    t={thm}
                    title="Delete User?"
                    description={`Permanently delete user "${userToDelete.name}"? This cannot be undone.`}
                    confirmText="Delete"
                    danger={true}
                    icon="🗑️"
                    onConfirm={async () => {
                        try {
                            await adminApi.deleteUser(userToDelete.id);
                            notify('User deleted');
                            loadUsers(); loadStats();
                        } catch {
                            notify('Failed to delete user');
                        } finally {
                            setUserToDelete(null);
                        }
                    }}
                    onCancel={() => setUserToDelete(null)}
                />
            )}
        </div>
    );
}
