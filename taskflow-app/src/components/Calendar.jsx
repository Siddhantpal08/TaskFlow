import { I, IC } from "./ui/Icon.jsx";
import { EVENTS } from "../data/data.js";

export default function Calendar({ t }) {
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const evMap = { 22: { title: "Sprint Review", c: t.accent }, 24: { title: "Code Review", c: t.green }, 28: { title: "Presentation", c: t.red } };
    const dotMap = { 22: t.red, 24: t.amber, 26: t.accent };
    const TODAY = 20;

    return (
        <div style={{ padding: "22px 26px", display: "flex", gap: 18 }}>
            {/* Calendar grid */}
            <div style={{ flex: 1 }}>
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", boxShadow: t.shadow }}>
                    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.4px", color: t.t1 }}>
                            February <span style={{ color: t.accent }}>2025</span>
                        </div>
                        <div style={{ display: "flex", gap: 2 }}>
                            {["Month", "Week"].map(v => (
                                <button key={v} style={{ padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: t.disp, fontSize: 12, background: v === "Month" ? t.accentDim : "transparent", color: v === "Month" ? t.accent : t.t3 }}>{v}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "0 14px" }}>
                        {days.map(d => <div key={d} style={{ padding: "10px 4px", textAlign: "center", fontSize: 10, fontWeight: 700, color: t.t3, letterSpacing: "0.8px", fontFamily: t.mono }}>{d}</div>)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, background: t.border, padding: "0 14px 14px" }}>
                        {[...Array(4)].map((_, i) => <div key={`b${i}`} style={{ background: t.card, minHeight: 74 }} />)}
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(d => {
                            const ev = evMap[d]; const dot = dotMap[d]; const now = d === TODAY;
                            return (
                                <div key={d} style={{ background: t.card, minHeight: 74, padding: 6 }}>
                                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: now ? t.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: now ? 800 : 400, color: now ? "#000" : d > TODAY ? t.t2 : t.t3, marginBottom: 3 }}>{d}</div>
                                    {ev && <div style={{ background: ev.c + "18", border: `1px solid ${ev.c}33`, borderRadius: 3, padding: "2px 4px", fontSize: 9, color: ev.c, fontWeight: 600, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{ev.title}</div>}
                                    {dot && !ev && <div style={{ width: 5, height: 5, borderRadius: "50%", background: dot, marginTop: 2 }} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar events */}
            <div style={{ width: 240, flexShrink: 0 }}>
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 15, boxShadow: t.shadow }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.t1, marginBottom: 12 }}>This Month</div>
                    {EVENTS.map(ev => (
                        <div key={ev.id} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${t.border}` }}>
                            <div style={{ width: 2.5, borderRadius: 2, background: ev.c, flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: t.t1 }}>{ev.title}</div>
                                <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>{ev.date} · {ev.time}</div>
                            </div>
                        </div>
                    ))}
                    <button style={{ width: "100%", marginTop: 11, padding: "7px", borderRadius: 8, border: `1px dashed ${t.border}`, background: "transparent", color: t.t3, fontSize: 12, fontFamily: t.disp, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <I d={IC.plus} sz={12} c={t.t3} /> Add Event
                    </button>
                </div>
            </div>
        </div>
    );
}
