import { I, IC } from "./ui/Icon.jsx";
import { NOTIFS } from "../data/data.js";

export default function NotifPanel({ t, onClose }) {
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
                {NOTIFS.map(n => (
                    <div key={n.id} style={{ padding: "11px 15px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 11, alignItems: "flex-start", background: !n.read ? t.accentDim : "transparent" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: t.surf, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: t.accent, fontFamily: t.mono }}>{n.sym}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: t.t1, lineHeight: 1.55 }}>{n.txt}</div>
                            <div style={{ fontSize: 10, color: t.t3, marginTop: 2, fontFamily: t.mono }}>{n.time} ago</div>
                        </div>
                        {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.accent, flexShrink: 0, marginTop: 4 }} />}
                    </div>
                ))}
                <div style={{ padding: "10px 15px", textAlign: "center" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, fontSize: 12, fontWeight: 600, fontFamily: t.disp }}>
                        Mark all as read
                    </button>
                </div>
            </div>
        </>
    );
}
