import { I, IC } from "./ui/Icon.jsx";
import { useData } from "../context/DataContext.jsx";

const typeSymbol = { task_assigned: '⬡', task_delegated: '↗', status_update: '✓', default: '◈' };

function timeAgo(iso) {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
}

export default function NotifPanel({ t, onClose }) {
    const { notifications, markNotifRead, markAllNotifRead, clearAllNotif } = useData();

    return (
        <>
            <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
            <div className="slideRight" style={{
                position: "fixed", top: 58, right: 14, width: 320, zIndex: 50,
                background: t.card, border: `1px solid ${t.border}`, borderRadius: 12,
                boxShadow: "0 20px 50px #00000055", overflow: "hidden"
            }}>
                <div style={{ padding: "12px 15px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: t.t1 }}>Notifications</span>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }} className="hvrI">
                        <I d={IC.x} sz={15} c={t.t2} />
                    </button>
                </div>

                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                    {notifications.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: t.t3, fontSize: 13 }}>All caught up!</div>
                    )}
                    {notifications.map(n => (
                        <div key={n.id} onClick={() => !n.is_read && markNotifRead(n.id)}
                            style={{ padding: "11px 15px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 11, alignItems: "flex-start", background: !n.is_read ? t.accentDim : "transparent", cursor: n.is_read ? 'default' : 'pointer', transition: 'background .15s' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: t.surf, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: t.accent, fontFamily: t.mono }}>
                                {typeSymbol[n.type] || typeSymbol.default}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, color: t.t1, lineHeight: 1.55 }}>{n.message}</div>
                                <div style={{ fontSize: 10, color: t.t3, marginTop: 2, fontFamily: t.mono }}>{timeAgo(n.created_at)} ago</div>
                            </div>
                            {!n.is_read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.accent, flexShrink: 0, marginTop: 4 }} />}
                        </div>
                    ))}
                </div>

                <div style={{ padding: "10px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button onClick={markAllNotifRead} style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, fontSize: 12, fontWeight: 600, fontFamily: t.disp }}>
                        Mark all as read
                    </button>
                    <button onClick={clearAllNotif} style={{ background: "none", border: "none", cursor: "pointer", color: t.red, fontSize: 12, fontWeight: 600, fontFamily: t.disp }}>
                        Clear all
                    </button>
                </div>
            </div>
        </>
    );
}
