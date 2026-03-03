import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { USERS, TASKS } from "../data/data.js";

export default function Team({ t }) {
    return (
        <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Delegation Chain */}
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 22, boxShadow: t.shadow }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: t.t1, marginBottom: 2 }}>Delegation Chain Visualizer</div>
                <div style={{ fontSize: 10.5, color: t.t3, fontFamily: t.mono, marginBottom: 22 }}>task: "React dashboard UI"</div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    {[
                        { u: USERS[1], role: "Created & Assigned", lbl: "ASSIGNER", active: false },
                        { u: USERS[2], role: "Received & Delegated", lbl: "DELEGATOR", active: false },
                        { u: USERS[3], role: "Currently Working", lbl: "RECIPIENT", active: true },
                    ].map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 22px", borderRadius: 11, minWidth: 140, background: s.active ? t.accentDim : t.surf, border: `1px solid ${s.active ? t.accent : t.border}`, boxShadow: s.active ? t.accentGlow : "none" }}>
                                <Av u={s.u} sz={46} />
                                <div style={{ marginTop: 9, fontSize: 12.5, fontWeight: 700, color: t.t1 }}>{s.u.name.split(" ")[0]}</div>
                                <div style={{ fontSize: 9.5, color: t.t3, fontFamily: t.mono, marginTop: 1, textTransform: "uppercase", letterSpacing: "0.7px" }}>{s.lbl}</div>
                                <div style={{ marginTop: 8, fontSize: 10.5, padding: "3px 9px", borderRadius: 20, color: s.active ? t.accent : t.t2, background: s.active ? t.accentDim : t.card }}>{s.role}</div>
                            </div>
                            {i < 2 && (
                                <div style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
                                    <div style={{ width: 24, height: 1.5, background: `linear-gradient(to right,#009688,${t.accent})` }} />
                                    <I d={IC.arr} sz={12} c={t.accent} />
                                </div>
                            )}
                        </div>
                    ))}
                    <div style={{ marginLeft: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div className="glw" style={{ width: 9, height: 9, borderRadius: "50%", background: t.green, boxShadow: `0 0 14px ${t.green}88` }} />
                        <span style={{ fontSize: 9, color: t.green, fontFamily: t.mono }}>LIVE</span>
                    </div>
                </div>
            </div>

            {/* Team member cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {USERS.map(u => {
                    const my = TASKS.filter(tk => tk.to === u.id);
                    const done = my.filter(tk => tk.st === "done").length;
                    const pct = my.length ? Math.round(done / my.length * 100) : 0;
                    return (
                        <div key={u.id} className="hvrC" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, textAlign: "center", boxShadow: t.shadow, transition: "all .2s" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 11 }}><Av u={u} sz={48} /></div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.t1 }}>{u.name}</div>
                            <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 2, marginBottom: 14 }}>{u.id === 1 ? "You" : "Team Member"}</div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.t3, marginBottom: 4, fontFamily: t.mono }}>
                                    <span>Progress</span><span style={{ color: t.accent }}>{done}/{my.length}</span>
                                </div>
                                <div style={{ height: 3, background: t.border, borderRadius: 2 }}>
                                    <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: `linear-gradient(to right,#009688,${t.accent})`, transition: "width .6s" }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 12 }}>
                                <div className="glw" style={{ width: 6, height: 6, borderRadius: "50%", background: t.green }} />
                                <span style={{ fontSize: 10, color: t.green, fontFamily: t.mono }}>online</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
