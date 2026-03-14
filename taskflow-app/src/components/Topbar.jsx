import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";
import { authApi } from "../api/auth.js";

function ProfileModal({ t, user, onClose, onSave }) {
    const [name, setName] = useState(user?.name || '');
    const [initials, setInitials] = useState(user?.avatar_initials || '');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const inp = { background: '#0C1420', border: `1px solid ${t.border}`, borderRadius: 8, padding: '9px 12px', color: t.t1, fontSize: 13, fontFamily: t.disp, width: '100%', outline: 'none' };

    const handleSubmit = async (e) => {
        e.preventDefault(); setErr(''); setLoading(true);
        try {
            // we patch the user data directly
            import('../api/client.js').then(async ({ api }) => {
                const res = await api.patch('/users/me', { name, avatar_initials: initials.toUpperCase() });
                onSave(res.data);
                onClose();
            }).catch(e => {
                setErr(e.message || 'Failed to update profile.');
                setLoading(false);
            });
        } catch (e) { setErr(e.message || 'Failed to update profile.'); setLoading(false); }
    };

    return (
        <div onClick={e => e.target === e.currentTarget && onClose()} style={{
            position: 'fixed', inset: 0, background: '#00000088', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div className="popIn" style={{
                background: t.card, border: `1px solid ${t.border}`, borderRadius: 16,
                padding: '24px', width: 340, boxShadow: t.shadow,
            }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.t1, marginBottom: 18 }}>Edit Profile</div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, color: t.t3, marginBottom: 4, fontFamily: t.mono }}>NAME</label>
                        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={inp} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, color: t.t3, marginBottom: 4, fontFamily: t.mono }}>INITIALS (MAX 2)</label>
                        <input value={initials} onChange={e => setInitials(e.target.value.substring(0, 2))} placeholder="Initials (e.g. SP)" style={inp} />
                    </div>
                    {err && <div style={{ color: t.red, fontSize: 12 }}>{err}</div>}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                        <button type="button" onClick={onClose} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 16px', color: t.t2, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ background: t.accent, border: 'none', borderRadius: 8, padding: '8px 18px', color: '#060B12', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>
                            {loading ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Topbar({ t, dark, setDark, notif, setNotif, page, setModal }) {
    const [q, setQ] = useState("");
    const [showProfile, setShowProfile] = useState(false);
    const { user, setUser, logout } = useAuth();
    const { unreadCount } = useData();
    const labels = { dashboard: "Dashboard", tasks: "My Tasks", notes: "Notes", calendar: "Calendar", team: "Team" };

    return (
        <>
            <div style={{
                display: "flex", alignItems: "center", gap: 14, padding: "13px 26px",
                borderBottom: `1px solid ${t.border}`, background: t.nav, flexShrink: 0
            }} className="topbar">
                <div style={{ minWidth: 0 }} className="topbar-title">
                    <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.4px", color: t.t1 }}>{labels[page]}</div>
                    <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>
                        {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </div>
                </div>
                <div style={{
                    flex: 1, maxWidth: 340, margin: "0 auto", display: "flex", alignItems: "center",
                    gap: 9, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 9, padding: "7px 13px"
                }} className="topbar-search">
                    <I d={IC.srch} sz={14} c={t.t3} />
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
                        style={{ flex: 1, background: "transparent", border: "none", color: t.t1, fontSize: 12.5, fontFamily: t.disp }} />
                    <span style={{ fontSize: 9, color: t.t3, fontFamily: t.mono, background: t.card, padding: "2px 6px", borderRadius: 4 }}>⌘K</span>
                </div>
                <button onClick={() => setModal(true)} className="hvrB"
                    style={{
                        display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9,
                        border: "none", cursor: "pointer", fontFamily: t.disp, fontSize: 12.5, fontWeight: 700,
                        background: `linear-gradient(135deg,${t.accent},#009688)`, color: "#000",
                        boxShadow: t.accentGlow, transition: "all .18s"
                    }}>
                    <I d={IC.plus} sz={14} c="#000" sw={2.5} />Assign Task
                </button>
                <button onClick={() => setDark(!dark)} className="hvrI"
                    style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 9, padding: 8, cursor: "pointer", display: "flex", color: t.t2, transition: "all .2s" }}>
                    <I d={dark ? IC.sun : IC.moon} sz={15} c={t.t2} />
                </button>
                <button onClick={() => setNotif(p => !p)} className="hvrI"
                    style={{
                        background: notif ? t.accentDim : t.card, border: `1px solid ${notif ? t.accent : t.border}`,
                        borderRadius: 9, padding: 8, cursor: "pointer", display: "flex", position: "relative", transition: "all .2s"
                    }}>
                    <I d={IC.bell} sz={15} c={notif ? t.accent : t.t2} />
                    {unreadCount > 0 && <div style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: t.red, border: `2px solid ${t.nav}` }} />}
                </button>
                {/* User avatar + logout */}
                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                            onClick={() => setShowProfile(true)}
                            title="Edit Profile"
                            className="hvr"
                            style={{
                                width: 30, height: 30, borderRadius: '50%',
                                background: `linear-gradient(135deg, ${t.accent}40, ${t.purple || '#B083FF'}40)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, color: t.accent, flexShrink: 0,
                                border: `1.5px solid ${t.accent}44`, cursor: 'pointer'
                            }}>{user.avatar_initials}</div>
                        <button onClick={logout} title="Logout" className="hvrI"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.t3, fontSize: 11, fontFamily: t.mono }}>
                            ⏻
                        </button>
                    </div>
                )}
            </div>
            {showProfile && user && <ProfileModal t={t} user={user} onClose={() => setShowProfile(false)} onSave={u => setUser(u)} />}
        </>
    );
}
