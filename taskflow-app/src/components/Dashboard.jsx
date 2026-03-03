import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { PriTag, StTag } from "./ui/Tag.jsx";
import { TASKS, EVENTS, USERS } from "../data/data.js";

export default function Dashboard({ t, setPage, setTask }) {
    const done = TASKS.filter(x => x.st === "done").length;
    const total = TASKS.length;
    const stats = [
        { label: "Total Tasks", val: total, note: "this sprint", c: t.accent },
        { label: "Completed", val: done, note: `${Math.round(done / total * 100)}% rate`, c: t.green },
        { label: "Delegated", val: TASKS.filter(x => x.delegated).length, note: "active chains", c: t.amber },
        { label: "Due Soon", val: 2, note: "action needed", c: t.red },
    ];

    return (
        <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Welcome Banner */}
            <div style={{
                background: `linear-gradient(135deg,${t.accent}12,${t.accent}06)`,
                border: `1px solid ${t.accent}28`, borderRadius: 14, padding: "18px 22px",
                display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
                <div>
                    <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.5px", color: t.t1 }}>
                        Good morning, Siddhant 👋
                    </div>
                    <div style={{ fontSize: 13, color: t.t2, marginTop: 3 }}>
                        <span style={{ color: t.red, fontWeight: 600 }}>2 tasks due today</span>
                        {" · "}<span style={{ color: t.accent, fontWeight: 600 }}>3 awaiting your action</span>
                    </div>
                </div>
                <div style={{ fontFamily: t.mono, fontSize: 10, color: t.t3, textAlign: "right", lineHeight: 2 }}>
                    <div style={{ color: t.accent }}>TaskFlow v1.0</div><div>BCA VI · 2024–25</div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {stats.map((s, i) => (
                    <div key={i} className="hvrC" style={{
                        background: t.card, border: `1px solid ${t.border}`,
                        borderRadius: 12, padding: "16px 18px", cursor: "default", boxShadow: t.shadow, transition: "all .2s"
                    }}>
                        <div style={{ fontSize: 34, fontWeight: 900, color: s.c, letterSpacing: "-2px", lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.t1, marginTop: 5 }}>{s.label}</div>
                        <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 2 }}>{s.note}</div>
                    </div>
                ))}
            </div>

            {/* Tasks + Sidebar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 285px", gap: 18 }}>
                {/* Recent Tasks */}
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", boxShadow: t.shadow }}>
                    <div style={{ padding: "13px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: t.t1 }}>Recent Tasks</span>
                        <button onClick={() => setPage("tasks")} style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, fontSize: 12, fontWeight: 600, fontFamily: t.disp, display: "flex", alignItems: "center", gap: 4 }}>
                            All <I d={IC.arr} sz={11} c={t.accent} />
                        </button>
                    </div>
                    {TASKS.slice(0, 5).map(tk => (
                        <div key={tk.id} className="hvr" onClick={() => setTask(tk)}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 18px", borderBottom: `1px solid ${t.border}`, cursor: "pointer", background: "transparent", transition: "background .15s" }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: tk.st === "done" ? t.green : tk.st === "active" ? t.accent : t.border }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: tk.title.startsWith(" ") ? 11.5 : 13, fontWeight: 500, color: t.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: tk.st === "done" ? "line-through" : "none", opacity: tk.st === "done" ? 0.45 : 1, fontFamily: tk.title.startsWith(" ") ? t.mono : t.disp }}>
                                    {tk.title}
                                </div>
                                <div style={{ fontSize: 10.5, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>
                                    due {tk.due} · by {USERS.find(u => u.id === tk.by)?.name.split(" ")[0]}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                                <PriTag p={tk.pri} t={t} /><StTag s={tk.st} t={t} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Upcoming events */}
                    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", boxShadow: t.shadow }}>
                        <div style={{ padding: "12px 15px", borderBottom: `1px solid ${t.border}`, fontSize: 13, fontWeight: 700, color: t.t1 }}>Upcoming</div>
                        {EVENTS.map(ev => (
                            <div key={ev.id} style={{ padding: "10px 15px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 11, alignItems: "center" }}>
                                <div style={{ width: 34, borderRadius: 7, padding: "3px 0", textAlign: "center", background: ev.c + "14", border: `1px solid ${ev.c}28`, flexShrink: 0 }}>
                                    <div style={{ fontSize: 8, fontWeight: 700, color: ev.c, fontFamily: t.mono }}>{ev.date.split(" ")[0].toUpperCase()}</div>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: ev.c, lineHeight: 1.1 }}>{ev.date.split(" ")[1]}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: t.t1 }}>{ev.title}</div>
                                    <div style={{ fontSize: 10.5, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>{ev.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Team online */}
                    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: "14px 15px", boxShadow: t.shadow }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: t.t1, marginBottom: 12 }}>Team</div>
                        {USERS.map(u => (
                            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                                <Av u={u} sz={28} />
                                <div style={{ flex: 1, fontSize: 12, fontWeight: 500, color: t.t1 }}>{u.name.split(" ")[0]}</div>
                                <div className="glw" style={{ width: 6, height: 6, borderRadius: "50%", background: t.green }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
