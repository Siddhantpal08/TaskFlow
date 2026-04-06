import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";
import ThemePicker from "./ui/ThemePicker.jsx";

export default function Topbar({ t, themeKey, showThemePicker, setShowThemePicker, notif, setNotif, page, setPage, setModal, searchQuery, setSearchQuery }) {
    const { user, logout } = useAuth();
    const { unreadCount } = useData();
    const labels = { dashboard: "Dashboard", tasks: "My Tasks", notes: "Notes", calendar: "Calendar", team: "Team", friends: "Friends" };

    return (
        <>
            <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 22px",
                borderBottom: `1px solid ${t.border}`, background: t.nav, flexShrink: 0
            }} className="topbar">
                <div style={{ minWidth: 0 }} className="topbar-title">
                    <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.4px", color: t.t1 }}>{labels[page] || page}</div>
                    <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>
                        {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </div>
                </div>
                <div style={{
                    flex: 1, maxWidth: 340, margin: "0 auto", display: "flex", alignItems: "center",
                    gap: 9, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 9, padding: "7px 13px"
                }} className="topbar-search">
                    <I d={IC.srch} sz={14} c={t.t3} />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search… (⌘K)"
                        style={{ flex: 1, background: "transparent", border: "none", color: t.t1, fontSize: 12.5, fontFamily: t.disp, outline: "none" }} />
                </div>
                <button onClick={() => setModal(true)} className="hvrB"
                    style={{
                        display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9,
                        border: "none", cursor: "pointer", fontFamily: t.disp, fontSize: 12.5, fontWeight: 700,
                        background: `linear-gradient(135deg,${t.accent},#0072FF)`, color: "#000",
                        boxShadow: t.accentGlow, transition: "all .18s"
                    }}>
                    <I d={IC.plus} sz={14} c="#000" sw={2.5} />Assign Task
                </button>

                {/* Theme picker button */}
                <button onClick={() => setShowThemePicker(p => !p)}
                    title="Change Theme"
                    style={{
                        background: showThemePicker ? t.accentDim : t.card,
                        border: `1px solid ${showThemePicker ? t.accent : t.border}`,
                        borderRadius: 9, padding: 8, cursor: "pointer",
                        display: "flex", color: t.t2, transition: "all .2s"
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a10 10 0 0 1 10 10A10 10 0 0 1 12 22" />
                        <path d="M12 2a10 10 0 0 0-7.07 17.07" />
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                    </svg>
                </button>

                <button onClick={() => setNotif(p => !p)} className="hvrI"
                    style={{
                        background: notif ? t.accentDim : t.card, border: `1px solid ${notif ? t.accent : t.border}`,
                        borderRadius: 9, padding: 8, cursor: "pointer", display: "flex", position: "relative", transition: "all .2s"
                    }}>
                    <I d={IC.bell} sz={15} c={notif ? t.accent : t.t2} />
                    {unreadCount > 0 && <div style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: t.red, border: `2px solid ${t.nav}` }} />}
                </button>

                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div onClick={() => setPage('profile')} title="Edit Profile"
                            style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: user.avatar_url ? `url(${user.avatar_url}) center/cover` : `linear-gradient(135deg, ${t.accent}40, #0072FF40)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, color: t.accent, flexShrink: 0,
                                border: `1.5px solid ${t.accent}44`, cursor: 'pointer',
                                backgroundSize: user.avatar_url ? 'cover' : 'auto',
                            }}>{!user.avatar_url && user.avatar_initials}</div>
                        <button onClick={logout} title="Logout" className="hvrI"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.t3, fontSize: 16, fontFamily: t.mono, lineHeight: 1 }}>
                            ⏻
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
