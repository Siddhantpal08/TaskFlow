import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { PriTag, StTag } from "./ui/Tag.jsx";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { toastError, toastSuccess } from "./ui/Toast.jsx";
import CreateTaskModal from "./CreateTaskModal.jsx";

function fmtDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Tasks({ t, setTask, searchQuery }) {
    const { tasks = [], createTask, updateTaskStatus, deleteTask, teamMembers = [], loading } = useData();
    const { user } = useAuth();
    const [fil, setFil] = useState("all");
    const [showCreate, setShowCreate] = useState(false);

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
        <div style={{ padding: "22px 26px" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
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
                    <button onClick={() => setShowCreate(true)} style={{
                        background: t.accent, border: 'none', borderRadius: 8, padding: '8px 16px',
                        color: '#060B12', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 13,
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>+ New Task</button>
                </div>
            </div>

            {/* Tasks table */}
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", boxShadow: t.shadow }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 80px 88px", padding: "10px 18px", borderBottom: `1px solid ${t.border}`, fontSize: 10, fontWeight: 600, color: t.t3, textTransform: "uppercase", letterSpacing: "0.7px", fontFamily: t.mono }}>
                    <span>Task</span><span>Assigned By</span><span>Due</span><span>Priority</span><span>Status</span>
                </div>
                {loading && <div style={{ padding: '20px', textAlign: 'center', color: t.t3, fontSize: 13 }}>Loading tasks…</div>}
                {!loading && list.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: t.t3, fontSize: 13 }}>
                        {searchQuery ? `No tasks matching "${searchQuery}".` : 'No tasks found.'}
                    </div>
                )}
                {list.map(tk => (
                    <div key={tk.id} className="hvr" onClick={() => setTask(tk)}
                        style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 80px 88px", padding: "12px 18px", borderBottom: `1px solid ${t.border}`, alignItems: "center", cursor: "pointer", background: "transparent", transition: "background .15s" }}>
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
                        <StTag s={tk.status} t={t} />
                    </div>
                ))}
            </div>

            {showCreate && <CreateTaskModal t={t} teamMembers={teamMembers} onClose={() => setShowCreate(false)} onCreate={createTask} />}
        </div>
    );
}

