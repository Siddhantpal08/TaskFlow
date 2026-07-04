import { useState, useMemo } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { PriTag, StTag } from "./ui/Tag.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";
import EmptyState from "./ui/EmptyState.jsx";

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

// ── Stat Card ────────────────────────────────────────────────────────────────
function Stat({ val, label, note, color, onClick, trend, trendUp, pulse }) {
    return (
        <div onClick={onClick} className="hvrC" style={{
            background: "var(--card, #0D1824)",
            border: `1px solid ${pulse ? color + "44" : "var(--border, #1A2D42)"}`,
            borderRadius: 14, padding: "16px 18px",
            cursor: onClick ? "pointer" : "default",
            boxShadow: pulse ? `0 4px 20px ${color}22` : "0 4px 16px rgba(0,0,0,0.12)",
            transition: "all .2s", position: "relative", overflow: "hidden",
            animation: pulse ? "statPulse 2.5s ease infinite" : "none",
        }}>
            {/* Accent top line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2.5, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 34, fontWeight: 900, color, letterSpacing: "-2px", lineHeight: 1 }}>{val}</div>
                {trend && (
                    <div style={{
                        fontSize: 10, fontWeight: 700,
                        color: trendUp === false ? "#ef4444" : color,
                        background: `${trendUp === false ? "#ef4444" : color}14`,
                        padding: "2px 8px", borderRadius: 999,
                        fontFamily: "var(--mono, 'IBM Plex Mono', monospace)",
                        whiteSpace: "nowrap"
                    }}>
                        {trend}
                    </div>
                )}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--t1, #E2EFFF)", marginTop: 7 }}>{label}</div>
            <div style={{ fontSize: 10, color: "var(--t3, #2E4A68)", fontFamily: "var(--mono,'IBM Plex Mono',monospace)", marginTop: 2 }}>{note}</div>
        </div>
    );
}

// ── Task Row ─────────────────────────────────────────────────────────────────
function TaskRow({ tk, t, onClick }) {
    const overdue = tk.due_date && tk.status !== "done" && new Date(tk.due_date) < new Date();
    return (
        <div onClick={onClick} className="hvr" style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
            borderBottom: `1px solid ${t.border}`, cursor: "pointer",
            background: "transparent", transition: "background .12s",
        }}>
            <div style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                background: tk.status === "done" ? t.green : overdue ? t.red : tk.status === "active" ? t.accent : t.border,
                boxShadow: tk.status === "active" ? `0 0 6px ${t.accent}66` : overdue ? `0 0 6px ${t.red}66` : "none",
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 12.5, fontWeight: 500, color: t.t1, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis",
                    textDecoration: tk.status === "done" ? "line-through" : "none",
                    opacity: tk.status === "done" ? 0.45 : 1,
                }}>
                    {tk.title}
                </div>
                <div style={{ fontSize: 10, color: overdue ? t.red : t.t3, fontFamily: t.mono, marginTop: 1 }}>
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
    const { tasks = [], events = [], onlineUsers = new Set(), notifications = [], loading } = useData();
    const [taskFilter, setTaskFilter] = useState("all");

    const trends = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now - 7 * 86400000);
        const tasksThisWeek = tasks.filter(x => new Date(x.created_at) >= weekAgo).length;
        const doneThisWeek = tasks.filter(x => x.status === "done" && x.updated_at && new Date(x.updated_at) >= weekAgo).length;
        const activeCount = tasks.filter(x => x.status === "active").length;
        const overdueCount = tasks.filter(x => x.due_date && x.status !== "done" && new Date(x.due_date) < now).length;
        return { tasksThisWeek, doneThisWeek, activeCount, overdueCount };
    }, [tasks]);

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: t.t2, fontSize: 13 }}>
            Loading…
        </div>
    );

    const total = tasks.length;
    const done = tasks.filter(x => x.status === "done").length;
    const active = tasks.filter(x => x.status === "active").length;
    const overdue = tasks.filter(x => x.due_date && x.status !== "done" && new Date(x.due_date) < new Date()).length;
    const pending = tasks.filter(x => x.status === "pending").length;
    const rate = total ? Math.round(done / total * 100) : 0;
    const firstName = user?.name?.split(" ")[0] || "there";

    // Contextual hero message
    const getHeroMsg = () => {
        if (overdue > 0) return { msg: `You have ${overdue} overdue task${overdue > 1 ? "s" : ""} — tackle them first!`, color: t.red };
        if (active > 0) return { msg: `${active} task${active > 1 ? "s" : ""} in progress — keep it up!`, color: t.accent };
        if (pending > 0) return { msg: `${pending} task${pending > 1 ? "s" : ""} waiting to be started.`, color: t.amber };
        if (total === 0) return { msg: "Welcome! Create your first task to get started.", color: t.accent };
        return { msg: `All clear! ${done} task${done > 1 ? "s" : ""} completed. Great work! 🎉`, color: t.green };
    };
    const hero = getHeroMsg();

    const hr = new Date().getHours();
    const greeting = hr < 5 ? "Good night" : hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

    const quotes = [
        "The secret of getting ahead is getting started.",
        "It always seems impossible until it's done.",
        "Don't watch the clock; do what it does. Keep going.",
        "Quality is not an act, it is a habit.",
        "Well done is better than well said."
    ];
    const todayQuote = quotes[new Date().getDate() % quotes.length];

    const filteredTasks = taskFilter === "all" ? tasks : tasks.filter(x => x.status === taskFilter);

    // Today's tasks for focus strip
    const todayStr = new Date().toDateString();
    const todayTasks = tasks.filter(tk => tk.due_date && new Date(tk.due_date).toDateString() === todayStr && tk.status !== "done");

    return (
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, width: "100%", height: "100%", boxSizing: "border-box", overflow: "hidden" }}
            className="dash-root">
            <style>{`
                @keyframes statPulse {
                    0%, 100% { box-shadow: 0 4px 20px #FF3D5A22; }
                    50%       { box-shadow: 0 4px 28px #FF3D5A55; }
                }
                @media (max-width: 1100px) {
                    .dash-main-grid { grid-template-columns: 1fr !important; }
                    .dash-root { overflow-y: auto !important; height: auto !important; padding-bottom: 60px !important; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 520px) {
                    .stats-grid { grid-template-columns: 1fr !important; }
                    .dash-root { padding: 10px 10px 60px !important; }
                }
            `}</style>

            {/* ── Hero Strip ── */}
            <div style={{
                background: `linear-gradient(120deg, ${hero.color}18 0%, ${hero.color}08 60%, transparent 100%)`,
                border: `1px solid ${hero.color}28`, borderRadius: 14, padding: "14px 20px",
                display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
                gap: 12, flexWrap: "wrap",
            }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: t.t1, letterSpacing: "-0.4px", display: "flex", alignItems: "center", gap: 10 }}>
                        {greeting}, {firstName} 👋
                        <span style={{ fontSize: 12, fontWeight: 500, color: t.t3, fontFamily: t.mono, fontStyle: "italic", marginTop: 4 }}>
                            "{todayQuote}"
                        </span>
                    </div>
                    <div style={{ fontSize: 13, color: hero.color, marginTop: 4, fontWeight: 600 }}>
                        {hero.msg}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                    {/* Completion ring */}
                    <div style={{ position: "relative", width: 52, height: 52 }}>
                        <svg width={52} height={52} viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx={26} cy={26} r={21} fill="none" stroke={t.border} strokeWidth={4} />
                            <circle cx={26} cy={26} r={21} fill="none" stroke={t.accent} strokeWidth={4}
                                strokeDasharray={`${2 * Math.PI * 21}`}
                                strokeDashoffset={`${2 * Math.PI * 21 * (1 - rate / 100)}`}
                                strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                        </svg>
                        <div style={{
                            position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: t.t1, fontFamily: t.mono }}>{rate}%</span>
                        </div>
                    </div>

                    {/* Command Palette shortcut */}
                    <button
                        id="cmd-palette-btn"
                        className="cmd-palette-btn"
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
                        title="Open Command Palette (Ctrl+K)"
                        style={{
                            background: t.inset, border: `1px solid ${t.border}`,
                            borderRadius: 10, padding: "10px 14px",
                            color: t.t2, fontFamily: t.mono, fontSize: 12,
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                            transition: "all .2s", whiteSpace: "nowrap",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent + "66"; e.currentTarget.style.color = t.accent; e.currentTarget.style.background = t.accentDim; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.t2; e.currentTarget.style.background = t.inset; }}
                    >
                        ⌘ Ctrl+K
                    </button>

                    {/* Primary CTA */}
                    <button
                        onClick={() => setPage("tasks")}
                        style={{
                            background: "linear-gradient(135deg, #F59E0B, #F97316)",
                            border: "none", borderRadius: 10, padding: "10px 20px",
                            color: "#000", fontWeight: 800, fontFamily: t.disp, fontSize: 13,
                            cursor: "pointer", boxShadow: "0 4px 16px #F59E0B44",
                            transition: "all .2s", whiteSpace: "nowrap",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px #F59E0B55"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px #F59E0B44"; }}
                    >
                        + Create Task
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, flexShrink: 0 }} className="stats-grid">
                <Stat val={total} label="Total Tasks" note="all time" color={t.accent} onClick={() => setPage("tasks")}
                    trend={trends.tasksThisWeek > 0 ? `↑ ${trends.tasksThisWeek} this week` : "no new this week"} trendUp={trends.tasksThisWeek > 0} />
                <Stat val={done} label="Completed" note={`${rate}% success rate`} color={t.green}
                    trend={trends.doneThisWeek > 0 ? `↑ ${trends.doneThisWeek} done` : rate > 0 ? `${rate}% overall` : "none done yet"} trendUp={trends.doneThisWeek > 0} />
                <Stat val={active} label="In Progress" note="active now" color={t.amber} onClick={() => setPage("tasks")}
                    trend={active > 0 ? `${active} running` : "all clear"} trendUp={null} />
                <Stat val={overdue} label="Overdue" note="needs attention" color={t.red} onClick={() => setPage("tasks")}
                    trend={overdue > 0 ? `${overdue} past due` : "✓ on track"} trendUp={overdue === 0}
                    pulse={overdue > 0} />
            </div>

            {/* ── Main grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14, flex: 1, minHeight: 0 }} className="dash-main-grid">

                {/* ─ Tasks Panel ─ */}
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, boxShadow: t.shadow, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, flexWrap: "wrap", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: t.t1 }}>Tasks</span>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
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
                    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        {filteredTasks.length === 0 ? (
                            <div style={{ padding: "12px 18px 24px" }}>
                                <EmptyState t={t} icon="task"
                                    title={taskFilter === "all" ? "No tasks found" : `No ${taskFilter} tasks`}
                                    description={taskFilter === "all" ? "Create your first task using the button above." : `No tasks are currently ${taskFilter}.`}
                                    ctaText={taskFilter === "all" ? "Create Task" : ""}
                                    onCta={taskFilter === "all" ? () => setPage("tasks") : null}
                                />
                            </div>
                        ) : (
                            filteredTasks.slice(0, 7).map(tk => (
                                <TaskRow key={tk.id} tk={tk} t={t} onClick={() => setTask(tk)} />
                            ))
                        )}
                        {filteredTasks.length > 7 && (
                            <div onClick={() => setPage("tasks")} style={{ padding: "11px 18px", textAlign: "center", fontSize: 12, color: t.accent, cursor: "pointer", fontWeight: 600, borderTop: `1px solid ${t.border}` }}>
                                View {filteredTasks.length - 7} more →
                            </div>
                        )}
                    </div>
                </div>

                {/* ─ Right Panel ─ */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0, overflow: "auto" }}>

                    {/* Focus Today */}
                    {todayTasks.length > 0 && (
                        <div style={{ background: t.card, border: `1px solid #F59E0B33`, borderRadius: 14, overflow: "hidden", boxShadow: t.shadow, flexShrink: 0 }}>
                            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F59E0B0A" }}>
                                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#F59E0B" }}>⚡ Focus Today</span>
                                <span style={{ fontSize: 10, color: t.t3, fontFamily: t.mono }}>{todayTasks.length} due</span>
                            </div>
                            {todayTasks.slice(0, 3).map(tk => (
                                <div key={tk.id} onClick={() => setTask(tk)} style={{ padding: "8px 12px", borderBottom: `1px solid ${t.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background .12s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#F59E0B0A"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: tk.priority === "high" || tk.priority === "critical" ? t.red : "#F59E0B", flexShrink: 0 }} />
                                    <div style={{ flex: 1, fontSize: 12, color: t.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tk.title}</div>
                                    <div style={{ fontSize: 9.5, color: "#F59E0B", fontFamily: t.mono, flexShrink: 0 }}>Today</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upcoming Events */}
                    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden", boxShadow: t.shadow, flexShrink: 0 }}>
                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: t.t1 }}>Upcoming</span>
                            <button onClick={() => setPage("calendar")} style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, fontSize: 11, fontWeight: 600, fontFamily: t.disp }}>Calendar →</button>
                        </div>
                        {events.length === 0 ? (
                            <div style={{ padding: "12px 14px 18px" }}>
                                <EmptyState t={t} icon="cal" title="No upcoming events" description="Your schedule is clear." ctaText="Open Calendar" onCta={() => setPage("calendar")} />
                            </div>
                        ) : events.slice(0, 4).map(ev => {
                            const d = new Date(ev.event_date);
                            const colors = [t.red, t.accent, t.green, t.amber];
                            const c = colors[ev.id % colors.length];
                            return (
                                <div key={ev.id} style={{ padding: "9px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 10, alignItems: "center" }}>
                                    <div style={{ width: 34, borderRadius: 8, padding: "3px 0", textAlign: "center", background: c + "14", border: `1px solid ${c}28`, flexShrink: 0 }}>
                                        <div style={{ fontSize: 7.5, fontWeight: 700, color: c, fontFamily: t.mono, textTransform: "uppercase" }}>{d.toLocaleDateString("en-US", { month: "short" })}</div>
                                        <div style={{ fontSize: 15, fontWeight: 900, color: c, lineHeight: 1 }}>{d.getDate()}</div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: t.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                                        <div style={{ fontSize: 9.5, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>{ev.event_time ? ev.event_time.slice(0, 5) : "All day"}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "12px 14px", boxShadow: t.shadow, flexShrink: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: t.t1, marginBottom: 8 }}>Quick Actions</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                            {[
                                { icon: "📝", label: "New Note", action: () => setPage("notes") },
                                { icon: "📅", label: "Add Event", action: () => setPage("calendar") },
                                { icon: "👥", label: "Team", action: () => setPage("team") },
                                { icon: "🎨", label: "Customize", action: () => setPage("customize") },

                            ].map(({ icon, label, action }) => (
                                <button key={label} onClick={action}
                                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 8px", borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.t2, fontSize: 11, fontFamily: t.disp, cursor: "pointer", textAlign: "left", transition: "all .15s" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = t.accentDim; e.currentTarget.style.borderColor = t.accent + "44"; e.currentTarget.style.color = t.accent; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.t2; }}>
                                    <span style={{ fontSize: 14 }}>{icon}</span>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
