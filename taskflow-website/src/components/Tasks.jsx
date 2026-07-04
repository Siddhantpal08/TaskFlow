import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { PriTag, StTag } from "./ui/Tag.jsx";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { toastError, toastSuccess } from "./ui/Toast.jsx";
import CreateTaskModal from "./CreateTaskModal.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import ConfirmModal from "./ui/ConfirmModal.jsx";
import KanbanBoard from "./KanbanBoard.jsx";
import DatabaseGrid from "./DatabaseGrid.jsx";

function fmtDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Tasks({ t, setTask, searchQuery }) {
    const { tasks = [], createTask, updateTaskStatus, deleteTask, teamMembers = [], loading } = useData();
    const { user } = useAuth();
    const [fil, setFil] = useState("all");
    const [viewMode, setViewMode] = useState("list"); // "list" | "board"
    const [showCreate, setShowCreate] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const tabs = ["all", "mine", "pending", "active", "pending_approval", "done", "delegated"];
    const count = f => {
        if (f === "all") return tasks.length;
        if (f === "mine") return tasks.filter(x => x.assigned_to === user?.id).length;
        if (f === "delegated") return tasks.filter(x => x.parent_task_id).length;
        return tasks.filter(x => x.status === f).length;
    };
    const list = tasks
        .filter(tk => {
            if (fil === "all") return true;
            if (fil === "mine") return tk.assigned_to === user?.id;
            if (fil === "delegated") return tk.parent_task_id;
            return tk.status === fil;
        })
        .filter(tk => !searchQuery || tk.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div style={{ padding: "22px 26px", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap', flexShrink: 0 }}>
                {/* Filter tabs */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {tabs.map(f => {
                        const a = fil === f; return (
                            <button key={f} onClick={() => setFil(f)} className="pill"
                                style={{ padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: t.disp, fontSize: 12, fontWeight: a ? 600 : 400, border: `1px solid ${a ? t.accent : t.border}`, background: a ? t.accentDim : t.card, color: a ? t.accent : t.t2, transition: "all .15s", display: "flex", alignItems: "center", gap: 6 }}>
                                {f === 'mine' ? 'Assigned to Me' : f === 'pending_approval' ? 'Needs Approval' : f.charAt(0).toUpperCase() + f.slice(1)}
                                <span style={{ fontSize: 10, background: a ? t.accent + "28" : t.border, color: a ? t.accent : t.t3, padding: "1px 6px", borderRadius: 10 }}>{count(f)}</span>
                            </button>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {/* View Toggle */}
                    <div style={{ display: 'flex', background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: 2 }}>
                        <button onClick={() => setViewMode("list")} style={{ background: viewMode === "list" ? t.accentDim : "transparent", color: viewMode === "list" ? t.accent : t.t2, border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: viewMode === "list" ? 700 : 500, fontFamily: t.disp, transition: "all .15s" }}>List</button>
                        <button onClick={() => setViewMode("board")} style={{ background: viewMode === "board" ? t.accentDim : "transparent", color: viewMode === "board" ? t.accent : t.t2, border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: viewMode === "board" ? 700 : 500, fontFamily: t.disp, transition: "all .15s" }}>Board</button>
                        <button onClick={() => setViewMode("grid")} style={{ background: viewMode === "grid" ? t.accentDim : "transparent", color: viewMode === "grid" ? t.accent : t.t2, border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: viewMode === "grid" ? 700 : 500, fontFamily: t.disp, transition: "all .15s" }}>Grid</button>
                    </div>


                </div>
            </div>

            {viewMode === "board" ? (
                <KanbanBoard t={t} tasks={list} setTask={setTask} updateTaskStatus={updateTaskStatus} user={user} />
            ) : viewMode === "grid" ? (
                <DatabaseGrid t={t} tasks={list} setTask={setTask} updateTaskStatus={updateTaskStatus} />
            ) : (
                /* Tasks table (List View) */
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "auto", boxShadow: t.shadow, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 80px 88px 32px", padding: "10px 18px", borderBottom: `1px solid ${t.border}`, fontSize: 10, fontWeight: 600, color: t.t3, textTransform: "uppercase", letterSpacing: "0.7px", fontFamily: t.mono, flexShrink: 0 }}>
                    <span>Task</span><span>Assigned By</span><span>Due</span><span>Priority</span><span>Status</span><span></span>
                </div>
                {loading && <div style={{ padding: '20px', textAlign: 'center', color: t.t3, fontSize: 13 }}>Loading tasks…</div>}
                {!loading && list.length === 0 && (
                    <div style={{ padding: '16px 20px 32px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <EmptyState
                            t={t}
                            icon="task"
                            title={searchQuery ? "No search results" : "Your task list is empty"}
                            description={searchQuery ? `We couldn't find any tasks matching "${searchQuery}". Try a different keyword.` : "Keep track of your items by creating a new task now."}
                            ctaText={searchQuery ? "" : "Add First Task"}
                            onCta={searchQuery ? null : () => setShowCreate(true)}
                        />
                    </div>
                )}
                {list.map(tk => (
                    <div key={tk.id} className="hvr" onClick={() => setTask(tk)}
                        style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 80px 88px 32px", padding: "12px 18px", borderBottom: `1px solid ${t.border}`, alignItems: "center", cursor: "pointer", background: "transparent", transition: "background .15s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            {/* Checkbox: only clickable for pending/active tasks */}
                            <div onClick={async e => {
                                e.stopPropagation();
                                if (tk.status === 'done' || tk.status === 'pending_approval') return; // backend handles revert/approve
                                const next = tk.status === 'pending' ? 'active' : 'done';
                                try {
                                    await updateTaskStatus(tk.id, next);
                                    toastSuccess(`Task marked ${next}.`);
                                } catch (err) {
                                    toastError(err.message || 'Could not update status.');
                                }
                            }}
                                style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${tk.status === "done" ? t.green : tk.status === "pending_approval" ? t.orange : t.border}`, background: tk.status === "done" ? t.green + "20" : tk.status === "pending_approval" ? t.orange + "20" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: (tk.status === 'done' || tk.status === 'pending_approval') ? 'default' : 'pointer', opacity: (tk.status === 'done' || tk.status === 'pending_approval') ? 0.5 : 1 }}>
                                {tk.status === "done" && <I d={IC.chk} sz={9} c={t.green} sw={3} />}
                                {tk.status === "pending_approval" && <span style={{ fontSize: 10, color: t.orange, fontWeight: 800 }}>?</span>}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: t.t1, textDecoration: tk.status === "done" ? "line-through" : "none", opacity: tk.status === "done" ? 0.45 : 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {tk.title}
                                </div>
                                {tk.parent_task_id && <span style={{ fontSize: 10, color: t.amber }}>↗ delegated</span>}
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${t.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: t.accent, flexShrink: 0 }}>
                                {tk.assigned_by_initials || tk.assigned_by_name?.slice(0, 2) || '?'}
                            </div>
                            <span style={{ fontSize: 11.5, color: t.t2 }}>{tk.assigned_by_name?.split(" ")[0] || '—'}</span>
                        </div>
                        <span style={{ fontFamily: t.mono, fontSize: 11, color: t.t3 }}>{fmtDate(tk.due_date)}</span>
                        <PriTag p={tk.priority} t={t} />
                        <div>
                            <StTag s={tk.status} t={t} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            {/* Delete button (only for creators, or done tasks) */}
                            {(tk.status === "done" || tk.assigned_by === user?.id) && (
                                <button onClick={e => {
                                    e.stopPropagation();
                                    setTaskToDelete(tk);
                                }} style={{ background: "transparent", border: "none", color: t.t3, cursor: "pointer", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, transition: "background .15s" }} onMouseEnter={e => { e.currentTarget.style.color = t.red; e.currentTarget.style.background = t.red + "20"; }} onMouseLeave={e => { e.currentTarget.style.color = t.t3; e.currentTarget.style.background = "transparent"; }} title="Delete task">
                                    <I d={IC.trash} sz={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            )}

            {showCreate && <CreateTaskModal t={t} teamMembers={teamMembers} onClose={() => setShowCreate(false)} onCreate={createTask} />}
            {taskToDelete && (
                <ConfirmModal
                    t={t}
                    title="Delete Completed Task?"
                    description={`Are you sure you want to delete "${taskToDelete.title}"?`}
                    confirmText="Delete"
                    danger={true}
                    icon="🗑️"
                    onConfirm={async () => {
                        try {
                            await deleteTask(taskToDelete.id);
                            toastSuccess("Task deleted.");
                        } catch (err) {
                            toastError("Failed to delete task.");
                        } finally {
                            setTaskToDelete(null);
                        }
                    }}
                    onCancel={() => setTaskToDelete(null)}
                />
            )}
        </div>
    );
}

