import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";

export default function Topbar({ t, dark, setDark, notif, setNotif, page, setPage, setModal, searchQuery, setSearchQuery }) {
    const { user, logout } = useAuth();
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
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search…"
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
                            onClick={() => setPage('profile')}
                            title="Edit Profile"
                            style={{
                                width: 30, height: 30, borderRadius: '50%',
                                background: user.avatar_url ? `url(${user.avatar_url}) center/cover` : `linear-gradient(135deg, ${t.accent}40, ${t.purple || '#B083FF'}40)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, color: t.accent, flexShrink: 0,
                                border: `1.5px solid ${t.accent}44`, cursor: 'pointer'
                            }}>{!user.avatar_url && user.avatar_initials}</div>
                        <button onClick={logout} title="Logout" className="hvrI"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.t3, fontSize: 11, fontFamily: t.mono }}>
                            ⏻
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
