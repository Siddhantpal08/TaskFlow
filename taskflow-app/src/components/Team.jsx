import { I, IC } from "./ui/Icon.jsx";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Team({ t }) {
    const { tasks, teamMembers, onlineUsers, loading } = useData();
    const { user } = useAuth();

    // Find delegation chains from real tasks
    const delegatedTasks = tasks.filter(tk => tk.parent_task_id);

    return (
        <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Delegation Chain Visualizer */}
            {delegatedTasks.length > 0 && (
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 22, boxShadow: t.shadow }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: t.t1, marginBottom: 2 }}>Delegation Chain Visualizer</div>
                    <div style={{ fontSize: 10.5, color: t.t3, fontFamily: t.mono, marginBottom: 22 }}>
                        task: "{delegatedTasks[0]?.title}"
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: 'wrap', gap: 8 }}>
                        {(() => {
                            const tk = delegatedTasks[0];
                            const steps = [
                                { initials: tk.assigned_by_initials || '?', name: tk.assigned_by_name?.split(' ')[0] || '?', role: "Created & Assigned", lbl: "ASSIGNER", active: false },
                                { initials: tk.assigned_to_initials || '?', name: tk.assigned_to_name?.split(' ')[0] || '?', role: "Received", lbl: "RECIPIENT", active: true },
                            ];
                            return steps.map((s, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 22px", borderRadius: 11, minWidth: 130, background: s.active ? t.accentDim : t.surf, border: `1px solid ${s.active ? t.accent : t.border}`, boxShadow: s.active ? t.accentGlow : "none" }}>
                                        <div style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}40, ${t.purple}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: t.accent }}>{s.initials}</div>
                                        <div style={{ marginTop: 9, fontSize: 12.5, fontWeight: 700, color: t.t1 }}>{s.name}</div>
                                        <div style={{ fontSize: 9.5, color: t.t3, fontFamily: t.mono, marginTop: 1, textTransform: "uppercase", letterSpacing: "0.7px" }}>{s.lbl}</div>
                                        <div style={{ marginTop: 8, fontSize: 10.5, padding: "3px 9px", borderRadius: 20, color: s.active ? t.accent : t.t2, background: s.active ? t.accentDim : t.card }}>{s.role}</div>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
                                            <div style={{ width: 24, height: 1.5, background: `linear-gradient(to right,#009688,${t.accent})` }} />
                                            <I d={IC.arr} sz={12} c={t.accent} />
                                        </div>
                                    )}
                                </div>
                            ));
                        })()}
                        <div style={{ marginLeft: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <div className="glw" style={{ width: 9, height: 9, borderRadius: "50%", background: t.green, boxShadow: `0 0 14px ${t.green}88` }} />
                            <span style={{ fontSize: 9, color: t.green, fontFamily: t.mono }}>LIVE</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Team member cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }} className="team-grid">
                {loading && <div style={{ color: t.t3, fontSize: 13 }}>Loading team…</div>}
                {teamMembers.map(u => {
                    const myTasks = tasks.filter(tk => tk.assigned_to === u.id);
                    const done = myTasks.filter(tk => tk.status === "done").length;
                    const pct = myTasks.length ? Math.round(done / myTasks.length * 100) : 0;
                    const isOnline = onlineUsers.has(String(u.id));
                    const isMe = u.id === user?.id;
                    return (
                        <div key={u.id} className="hvrC" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, textAlign: "center", boxShadow: t.shadow, transition: "all .2s" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 11 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}40, ${t.purple}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: t.accent, border: isMe ? `2px solid ${t.accent}` : 'none' }}>
                                    {u.avatar_initials}
                                </div>
                            </div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.t1 }}>{u.name}</div>
                            <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 2, marginBottom: 14 }}>{isMe ? "You" : "Team Member"}</div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.t3, marginBottom: 4, fontFamily: t.mono }}>
                                    <span>Progress</span><span style={{ color: t.accent }}>{done}/{myTasks.length}</span>
                                </div>
                                <div style={{ height: 3, background: t.border, borderRadius: 2 }}>
                                    <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: `linear-gradient(to right,#009688,${t.accent})`, transition: "width .6s" }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 12 }}>
                                <div className={isOnline ? 'glw' : ''} style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? t.green : t.border }} />
                                <span style={{ fontSize: 10, color: isOnline ? t.green : t.t3, fontFamily: t.mono }}>{isOnline ? 'online' : 'offline'}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
