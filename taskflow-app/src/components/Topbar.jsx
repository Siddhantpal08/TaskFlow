import { I, IC } from "./ui/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";

export default function Topbar({ t, showThemePicker, setShowThemePicker, notif, setNotif, page, setPage }) {
    const { user, logout } = useAuth();
    const { unreadCount } = useData();
    const labels = { dashboard: "Dashboard", tasks: "My Tasks", notes: "Notes", calendar: "Calendar", team: "Team", friends: "Friends" };

    return (
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

            <div style={{ flex: 1 }} />

            <button onClick={() => setNotif(p => !p)} className="hvrI"
                style={{
                    background: notif ? t.accentDim : t.card, border: `1px solid ${notif ? t.accent : t.border}`,
                    borderRadius: 9, padding: 8, cursor: "pointer", display: "flex", position: "relative", transition: "all .2s"
                }}>
                <I d={IC.bell} sz={15} c={notif ? t.accent : t.t2} />
                {unreadCount > 0 && <div style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: t.red, border: `2px solid ${t.nav}` }} />}
            </button>

            {/* Mobile-only User profile avatar and logout */}
            <div className="mobile-user-actions" style={{ display: "none", alignItems: "center", gap: 10, marginLeft: 4 }}>
                <div onClick={() => setPage("profile")} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: user?.avatar_url ? `url(${user.avatar_url}) center/cover` : `linear-gradient(135deg, ${t.accent}40, #0072FF40)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: t.accent,
                        border: `1.5px solid ${t.accent}44`, backgroundSize: "cover", backgroundPosition: "center"
                    }}>
                        {!user?.avatar_url && (user?.avatar_initials || "?")}
                    </div>
                </div>
                <button onClick={logout} aria-label="Sign out" title="Logout"
                    className="logout-btn"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 5, color: t.t3, display: "flex", alignItems: "center", justifyContent: "center", transition: "color .15s" }}>
                    <I d={IC.out} sz={16} c="currentColor" />
                </button>
            </div>
        </div>
    );
}
