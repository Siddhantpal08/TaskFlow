import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { NOTIFS } from "../data/data.js";

export default function Topbar({ t, dark, setDark, notif, setNotif, page, setModal }) {
    const [q, setQ] = useState("");
    const labels = { dashboard: "Dashboard", tasks: "My Tasks", notes: "Notes", calendar: "Calendar", team: "Team" };
    const unread = NOTIFS.filter(n => !n.read).length;

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 14, padding: "13px 26px",
            borderBottom: `1px solid ${t.border}`, background: t.nav, flexShrink: 0
        }}>
            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.4px", color: t.t1 }}>{labels[page]}</div>
                <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>
                    {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </div>
            </div>
            <div style={{
                flex: 1, maxWidth: 340, margin: "0 auto", display: "flex", alignItems: "center",
                gap: 9, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 9, padding: "7px 13px"
            }}>
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
                {unread > 0 && <div style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: t.red, border: `2px solid ${t.nav}` }} />}
            </button>
        </div>
    );
}
