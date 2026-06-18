import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { PriTag, StTag } from "./ui/Tag.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import ChatWidget from "./ui/ChatWidget.jsx";

function fmtDate(d) {
    if (!d) return "—";
    const date = new Date(d);
    const now = new Date();
    const diff = Math.round((date - now) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Yesterday";
    if (diff < 0) return `${Math.abs(diff)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(iso) {
    if (!iso) return "";
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function Stat({ val, label, note, color, onClick, trend }) {
    return (
        <div onClick={onClick} className="hvrC" style={{
            background: "var(--card)",
            border: `1px solid var(--border)`,
            borderRadius: 14, padding: "18px 20px",
            cursor: onClick ? "pointer" : "default",
            boxShadow: `0 4px 16px rgba(0,0,0,0.12)`,
            transition: "all .2s", position: "relative", overflow: "hidden",
        }}>
            {/* Accent top line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2.5, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 36, fontWeight: 900, color, letterSpacing: "-2px", lineHeight: 1 }}>{val}</div>
                {trend && (
                    <div style={{
                        fontSize: 10, fontWeight: 700, color,
                        background: `${color}14`, padding: "2px 8px", borderRadius: 999,
                        fontFamily: "var(--mono, 'IBM Plex Mono', monospace)",
                        whiteSpace: "nowrap"
                    }}>
                        {trend}
                    </div>
                )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1, #E2EFFF)", marginTop: 8 }}>{label}</div>
            <div style={{ fontSize: 10.5, color: "var(--t3, #2E4A68)", fontFamily: "var(--mono,'IBM Plex Mono',monospace)", marginTop: 3 }}>{note}</div>
        </div>
    );
}

// ── Quick Task Row ───────────────────────────────────────────────────────────
function TaskRow({ tk, t, onClick }) {
    const overdue = tk.due_date && tk.status !== "done" && new Date(tk.due_date) < new Date();
    return (
        <div onClick={onClick} className="hvr" style={{
            display: "flex", alignItems: "center", gap: 12, padding: "11px 18px",
            borderBottom: `1px solid ${t.border}`, cursor: "pointer",
            background: "transparent", transition: "background .12s",
        }}>
            {/* Status dot */}
            <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: tk.status === "done" ? t.green : overdue ? t.red : tk.status === "active" ? t.accent : t.border,
                boxShadow: tk.status === "active" ? `0 0 6px ${t.accent}66` : "none",
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 13, fontWeight: 500, color: t.t1, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis",
                    textDecoration: tk.status === "done" ? "line-through" : "none",
                    opacity: tk.status === "done" ? 0.45 : 1,
                }}>
                    {tk.title}
                </div>
                <div style={{ fontSize: 10.5, color: overdue ? t.red : t.t3, fontFamily: t.mono, marginTop: 1 }}>
                    {overdue ? "⚠ " : ""}Due {fmtDate(tk.due_date)}
                    {tk.assigned_by_name && ` · ${tk.assigned_by_name.split(" ")[0]}`}
                </div>
            </div>
            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                <PriTag p={tk.priority} t={t} />
                <StTag s={tk.status} t={t} />
            </div>
        </div>
    );
}

export default function Dashboard({ t, setPage, setTask }) {
    const { user } = useAuth();
    const { tasks = [], events = [], teamMembers = [], onlineUsers = new Set(), notifications = [], loading } = useData();
    const [taskFilter, setTaskFilter] = useState("all"); // all | pending | active | done

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: t.t2, fontSize: 13 }}>
            Loading…
        </div>
    );

    // ── Stats ────────────────────────────────────────────────────────────────
    const total = tasks.length;
    const done = tasks.filter(x => x.status === "done").length;
    const active = tasks.filter(x => x.status === "active").length;
    const overdue = tasks.filter(x => x.due_date && x.status !== "done" && new Date(x.due_date) < new Date()).length;
    const pending = tasks.filter(x => x.status === "pending").length;

    const rate = total ? Math.round(done / total * 100) : 0;
    const firstName = user?.name?.split(" ")[0] || "there";

    // ── Filtered Tasks ───────────────────────────────────────────────────────
    const filteredTasks = taskFilter === "all"
        ? tasks
        : tasks.filter(x => x.status === taskFilter);

    // ── Recent notifications ─────────────────────────────────────────────────
    const recentNotifs = notifications.slice(0, 5);

    // ── Hour-based greeting ──────────────────────────────────────────────────
    const hr = new Date().getHours();
    const greeting = hr < 5 ? "Good night" : hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

    return (
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 22, maxWidth: 1200, margin: "0 auto", width: "100%" }}>

            {/* ── Welcome strip ── */}
            <div className="welcome-strip" style={{
                background: `linear-gradient(120deg, ${t.accent}24 0%, ${t.accent}0c 60%, transparent 100%)`,
                border: `1px solid ${t.accent}30`, borderRadius: 16, padding: "20px 26px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: t.t1, letterSpacing: "-0.5px" }}>
                        {greeting}, {firstName} 👋
                    </div>
                    <div style={{ fontSize: 13, color: t.t2, marginTop: 5, display: "flex", gap: 14 }}>
                        {overdue > 0 && <span style={{ color: t.red, fontWeight: 600 }}>⚠ {overdue} overdue</span>}
                        {active > 0 && <span style={{ color: t.accent }}>⚡ {active} active</span>}
                        {pending > 0 && <span style={{ color: t.t2 }}>🕐 {pending} pending</span>}
                        {total === 0 && <span style={{ color: t.t3 }}>No tasks yet — create your first one!</span>}
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Completion ring */}
                    <div style={{ position: "relative", width: 56, height: 56 }}>
                        <svg width={56} height={56} viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx={28} cy={28} r={22} fill="none" stroke={t.border} strokeWidth={4.5} />
                            <circle cx={28} cy={28} r={22} fill="none" stroke={t.accent} strokeWidth={4.5}
                                strokeDasharray={`${2 * Math.PI * 22}`}
                                strokeDashoffset={`${2 * Math.PI * 22 * (1 - rate / 100)}`}
                                strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                        </svg>
                        <div style={{
                            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, color: t.t1, fontFamily: t.mono
                        }}>
                            {rate}%
                        </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.t2, fontFamily: t.disp }}>done</div>
                </div>
            </div>

            {/* ── Stats grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }} className="stats-grid">
                <Stat val={total} label="Total Tasks" note="all time" color={t.accent} onClick={() => setPage("tasks")} trend="↑ 3 this week" />
                <Stat val={done}  label="Completed"   note={`${rate}% success rate`} color={t.green} trend="65% rate" />
                <Stat val={active} label="In Progress" note="active now" color={t.amber} onClick={() => setPage("tasks")} trend="active now" />
                <Stat val={overdue} label="Overdue" note="needs attention" color={t.red} onClick={() => setPage("tasks")} trend="needs action" />
            </div>

            {/* ── Main two-column grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }} className="dash-grid">

                {/* ─ Tasks Panel ─ */}
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden", boxShadow: t.shadow }}>
                    {/* Header */}
                    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: t.t1 }}>Tasks</span>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {["all", "pending", "active", "done"].map(f => (
                                <button key={f} onClick={() => setTaskFilter(f)}
                                    style={{
                                        padding: "3px 10px", borderRadius: 20,
                                        border: `1px solid ${taskFilter === f ? t.accent : t.border}`,
                                        background: taskFilter === f ? t.accentDim : "transparent",
                                        color: taskFilter === f ? t.accent : t.t3,
                                        fontSize: 11, cursor: "pointer", fontFamily: t.disp, fontWeight: 600,
                                        textTransform: "capitalize", transition: "all .15s",
                                    }}>
                                    {f}
                                </button>
                            ))}
                            <button onClick={() => setPage("tasks")} style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, fontSize: 12, fontWeight: 600, fontFamily: t.disp, display: "flex", alignItems: "center", gap: 3, marginLeft: 4 }}>
                                All <I d={IC.arr} sz={11} c={t.accent} />
                            </button>
                        </div>
                    </div>

                    {/* Rows */}
                    {filteredTasks.length === 0 ? (
                        <div style={{ padding: "12px 18px 24px" }}>
                            <EmptyState
                                t={t}
                                icon="task"
                                title={taskFilter === "all" ? "No tasks found" : `No ${taskFilter} tasks`}
                                description={taskFilter === "all" ? "You don't have any tasks assigned or created yet." : `There are no tasks currently marked as ${taskFilter}.`}
                                ctaText={taskFilter === "all" ? "Create Task" : ""}
                                onCta={taskFilter === "all" ? () => setPage("tasks") : null}
                            />
                        </div>
                    ) : (
                        filteredTasks.slice(0, 8).map(tk => (
                            <TaskRow key={tk.id} tk={tk} t={t} onClick={() => setTask(tk)} />
                        ))
                    )}
                    {filteredTasks.length > 8 && (
                        <div onClick={() => setPage("tasks")} style={{ padding: "11px 18px", textAlign: "center", fontSize: 12, color: t.accent, cursor: "pointer", fontWeight: 600, borderTop: `1px solid ${t.border}` }}>
                            View {filteredTasks.length - 8} more →
                        </div>
                    )}
                </div>

                {/* ─ Right column ─ */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Upcoming Events */}
                    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden", boxShadow: t.shadow }}>
                        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: t.t1 }}>Upcoming</span>
                            <button onClick={() => setPage("calendar")} style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, fontSize: 11, fontWeight: 600, fontFamily: t.disp }}>Calendar →</button>
                        </div>
                        {events.length === 0 ? (
                            <div style={{ padding: "12px 16px 20px" }}>
                                <EmptyState
                                    t={t}
                                    icon="cal"
                                    title="No upcoming events"
                                    description="Your schedule is completely clear for the upcoming days."
                                    ctaText="Open Calendar"
                                    onCta={() => setPage("calendar")}
                                />
                            </div>
                        ) : events.slice(0, 4).map(ev => {
                            const d = new Date(ev.event_date);
                            const colors = [t.red, t.accent, t.green, t.amber];
                            const c = colors[ev.id % colors.length];
                            return (
                                <div key={ev.id} style={{ padding: "10px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 12, alignItems: "center" }}>
                                    <div style={{ width: 36, borderRadius: 8, padding: "4px 0", textAlign: "center", background: c + "14", border: `1px solid ${c}28`, flexShrink: 0 }}>
                                        <div style={{ fontSize: 8, fontWeight: 700, color: c, fontFamily: t.mono, textTransform: "uppercase" }}>{d.toLocaleDateString("en-US", { month: "short" })}</div>
                                        <div style={{ fontSize: 16, fontWeight: 900, color: c, lineHeight: 1 }}>{d.getDate()}</div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12.5, fontWeight: 600, color: t.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                                        <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>{ev.event_time ? ev.event_time.slice(0, 5) : "All day"}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Team Members */}
                    {teamMembers.length > 0 && (
                        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "14px 16px", boxShadow: t.shadow }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: t.t1, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                                Team
                                <button onClick={() => setPage("team")} style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, fontSize: 11, fontWeight: 600, fontFamily: t.disp }}>View →</button>
                            </div>
                            {teamMembers.slice(0, 5).map(u => {
                                const isOnline = onlineUsers.has(String(u.id));
                                return (
                                    <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                                        <div style={{ position: "relative" }}>
                                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${t.accent}40, #0072FF40)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: t.accent }}>
                                                {u.avatar_initials}
                                            </div>
                                            <div style={{ position: "absolute", bottom: 0, right: 0, width: 7, height: 7, borderRadius: "50%", background: isOnline ? t.green : t.border, border: `1.5px solid ${t.card}` }} />
                                        </div>
                                        <div style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: t.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name.split(" ")[0]}</div>
                                        <div style={{ fontSize: 9.5, color: isOnline ? t.green : t.t3, fontFamily: t.mono }}>{isOnline ? "online" : "away"}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Recent Activity */}
                    {recentNotifs.length > 0 && (
                        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden", boxShadow: t.shadow }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}`, fontSize: 13, fontWeight: 700, color: t.t1 }}>Activity</div>
                            {recentNotifs.map(n => (
                                <div key={n.id} style={{ padding: "10px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: n.is_read ? t.border : t.accent, flexShrink: 0, marginTop: 5 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11.5, color: t.t1, lineHeight: 1.5 }}>{n.message}</div>
                                        <div style={{ fontSize: 9.5, color: t.t3, fontFamily: t.mono, marginTop: 2 }}>{timeAgo(n.created_at)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* Global Chat Widget inside Dashboard */}
            <ChatWidget t={t} />
        </div>
    );
}
