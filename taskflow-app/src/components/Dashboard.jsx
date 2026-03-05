import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { PriTag, StTag } from "./ui/Tag.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";

// Format backend date to "Mar 6" style
function fmtDate(d) {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard({ t, setPage, setTask }) {
    const { user } = useAuth();
    const { tasks, events, teamMembers, onlineUsers, loading } = useData();

    const done = tasks.filter(x => x.status === "done").length;
    const total = tasks.length;
    const delegated = tasks.filter(x => x.parent_task_id).length;
    const dueSoon = tasks.filter(x => {
        if (!x.due_date || x.status === 'done') return false;
        const diff = (new Date(x.due_date) - new Date()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 2;
    }).length;

    const stats = [
        { label: "Total Tasks", val: total, note: "this sprint", c: t.accent },
        { label: "Completed", val: done, note: total ? `${Math.round(done / total * 100)}% rate` : "0% rate", c: t.green },
        { label: "Delegated", val: delegated, note: "active chains", c: t.amber },
        { label: "Due Soon", val: dueSoon, note: "action needed", c: t.red },
    ];

    const firstName = user?.name?.split(' ')[0] || 'there';

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: t.t2, fontSize: 13 }}>
            Loading dashboard…
        </div>
    );

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
                        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName} 👋
                    </div>
                    <div style={{ fontSize: 13, color: t.t2, marginTop: 3 }}>
                        <span style={{ color: t.red, fontWeight: 600 }}>{dueSoon} tasks due soon</span>
                        {" · "}<span style={{ color: t.accent, fontWeight: 600 }}>{tasks.filter(x => x.status === 'pending').length} awaiting action</span>
                    </div>
                </div>
                <div style={{ fontFamily: t.mono, fontSize: 10, color: t.t3, textAlign: "right", lineHeight: 2 }}>
                    <div style={{ color: t.accent }}>TaskFlow v1.0</div><div>BCA VI · 2024–25</div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }} className="stats-grid">
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 285px", gap: 18 }} className="dash-grid">
                {/* Recent Tasks */}
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", boxShadow: t.shadow }}>
                    <div style={{ padding: "13px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: t.t1 }}>Recent Tasks</span>
                        <button onClick={() => setPage("tasks")} style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, fontSize: 12, fontWeight: 600, fontFamily: t.disp, display: "flex", alignItems: "center", gap: 4 }}>
                            All <I d={IC.arr} sz={11} c={t.accent} />
                        </button>
                    </div>
                    {tasks.length === 0 && (
                        <div style={{ padding: '20px 18px', color: t.t3, fontSize: 13, textAlign: 'center' }}>
                            No tasks yet. Create one in the Tasks tab!
                        </div>
                    )}
                    {tasks.slice(0, 5).map(tk => (
                        <div key={tk.id} className="hvr" onClick={() => setTask(tk)}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 18px", borderBottom: `1px solid ${t.border}`, cursor: "pointer", background: "transparent", transition: "background .15s" }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: tk.status === "done" ? t.green : tk.status === "active" ? t.accent : t.border }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: t.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: tk.status === "done" ? "line-through" : "none", opacity: tk.status === "done" ? 0.45 : 1 }}>
                                    {tk.title}
                                </div>
                                <div style={{ fontSize: 10.5, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>
                                    due {fmtDate(tk.due_date)} · by {tk.assigned_by_name?.split(' ')[0] || '—'}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                                <PriTag p={tk.priority} t={t} /><StTag s={tk.status} t={t} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Upcoming events */}
                    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", boxShadow: t.shadow }}>
                        <div style={{ padding: "12px 15px", borderBottom: `1px solid ${t.border}`, fontSize: 13, fontWeight: 700, color: t.t1 }}>Upcoming</div>
                        {events.length === 0 && (
                            <div style={{ padding: '12px 15px', color: t.t3, fontSize: 12 }}>No events yet.</div>
                        )}
                        {events.slice(0, 3).map(ev => {
                            const d = new Date(ev.event_date);
                            const mth = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                            const day = d.getDate();
                            const colors = [t.red, t.accent, t.green, t.purple, t.amber];
                            const c = colors[ev.id % colors.length];
                            return (
                                <div key={ev.id} style={{ padding: "10px 15px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 11, alignItems: "center" }}>
                                    <div style={{ width: 34, borderRadius: 7, padding: "3px 0", textAlign: "center", background: c + "14", border: `1px solid ${c}28`, flexShrink: 0 }}>
                                        <div style={{ fontSize: 8, fontWeight: 700, color: c, fontFamily: t.mono }}>{mth}</div>
                                        <div style={{ fontSize: 15, fontWeight: 900, color: c, lineHeight: 1.1 }}>{day}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: t.t1 }}>{ev.title}</div>
                                        <div style={{ fontSize: 10.5, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>
                                            {ev.event_time ? ev.event_time.slice(0, 5) : '—'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Team online */}
                    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: "14px 15px", boxShadow: t.shadow }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: t.t1, marginBottom: 12 }}>Team</div>
                        {teamMembers.map(u => {
                            const isOnline = onlineUsers.has(String(u.id));
                            return (
                                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${t.accent}40, ${t.purple}40)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 700, color: t.accent,
                                    }}>{u.avatar_initials}</div>
                                    <div style={{ flex: 1, fontSize: 12, fontWeight: 500, color: t.t1 }}>{u.name.split(" ")[0]}</div>
                                    <div className="glw" style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? t.green : t.border }} />
                                </div>
                            );
                        })}
                        {teamMembers.length === 0 && (
                            <div style={{ fontSize: 12, color: t.t3 }}>No team members yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
