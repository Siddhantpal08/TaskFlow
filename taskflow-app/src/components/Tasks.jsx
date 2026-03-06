import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { PriTag, StTag } from "./ui/Tag.jsx";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { toastError, toastSuccess } from "./ui/Toast.jsx";

function fmtDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Quick create task modal
function CreateTaskModal({ t, teamMembers, onClose, onCreate }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState('medium');
    const [assigned_to, setAssignedTo] = useState(String(user?.id || ''));
    const [due_date, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const inp = { background: '#0C1420', border: `1px solid ${t.border}`, borderRadius: 8, padding: '9px 12px', color: t.t1, fontSize: 13, fontFamily: t.disp, width: '100%', outline: 'none' };

    const handleSubmit = async (e) => {
        e.preventDefault(); setErr(''); setLoading(true);
        try {
            await onCreate({ title, description: desc, priority, assigned_to: parseInt(assigned_to), due_date: due_date || undefined });
            onClose();
        } catch (e) { setErr(e.message || 'Failed to create task.'); }
        finally { setLoading(false); }
    };

    return (
        <div onClick={e => e.target === e.currentTarget && onClose()} style={{
            position: 'fixed', inset: 0, background: '#00000088', zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div className="popIn" style={{
                background: t.card, border: `1px solid ${t.border}`, borderRadius: 16,
                padding: '24px', width: 440, boxShadow: t.shadow,
            }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.t1, marginBottom: 18 }}>New Task</div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title…" style={inp} />
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)" rows={2}
                        style={{ ...inp, resize: 'vertical' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...inp }}>
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                        <select value={assigned_to} onChange={e => setAssignedTo(e.target.value)} style={{ ...inp }}>
                            {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <input type="date" value={due_date} onChange={e => setDueDate(e.target.value)} style={{ ...inp }} />
                    {err && <div style={{ color: t.red, fontSize: 12 }}>{err}</div>}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                        <button type="button" onClick={onClose} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 16px', color: t.t2, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ background: t.accent, border: 'none', borderRadius: 8, padding: '8px 18px', color: '#060B12', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>
                            {loading ? 'Creating…' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Tasks({ t, setTask }) {
    const { tasks = [], createTask, updateTaskStatus, deleteTask, teamMembers = [], loading } = useData();
    const [fil, setFil] = useState("all");
    const [showCreate, setShowCreate] = useState(false);

    const tabs = ["all", "pending", "active", "done", "delegated"];
    const count = f => f === "all" ? tasks.length : f === "delegated" ? tasks.filter(x => x.parent_task_id).length : tasks.filter(x => x.status === f).length;
    const list = tasks.filter(tk => fil === "all" ? true : fil === "delegated" ? tk.parent_task_id : tk.status === fil);

    return (
        <div style={{ padding: "22px 26px" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                {/* Filter tabs */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {tabs.map(f => {
                        const a = fil === f; return (
                            <button key={f} onClick={() => setFil(f)} className="pill"
                                style={{ padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: t.disp, fontSize: 12, fontWeight: a ? 600 : 400, border: `1px solid ${a ? t.accent : t.border}`, background: a ? t.accentDim : t.card, color: a ? t.accent : t.t2, transition: "all .15s", display: "flex", alignItems: "center", gap: 6 }}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                <span style={{ fontSize: 10, background: a ? t.accent + "28" : t.border, color: a ? t.accent : t.t3, padding: "1px 6px", borderRadius: 10 }}>{count(f)}</span>
                            </button>
                        );
                    })}
                </div>
                <button onClick={() => setShowCreate(true)} style={{
                    background: t.accent, border: 'none', borderRadius: 8, padding: '8px 16px',
                    color: '#060B12', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 6,
                }}>+ New Task</button>
            </div>

            {/* Tasks table */}
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", boxShadow: t.shadow }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 80px 88px", padding: "10px 18px", borderBottom: `1px solid ${t.border}`, fontSize: 10, fontWeight: 600, color: t.t3, textTransform: "uppercase", letterSpacing: "0.7px", fontFamily: t.mono }}>
                    <span>Task</span><span>Assigned By</span><span>Due</span><span>Priority</span><span>Status</span>
                </div>
                {loading && <div style={{ padding: '20px', textAlign: 'center', color: t.t3, fontSize: 13 }}>Loading tasks…</div>}
                {!loading && list.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: t.t3, fontSize: 13 }}>No tasks found.</div>}
                {list.map(tk => (
                    <div key={tk.id} className="hvr" onClick={() => setTask(tk)}
                        style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 80px 88px", padding: "12px 18px", borderBottom: `1px solid ${t.border}`, alignItems: "center", cursor: "pointer", background: "transparent", transition: "background .15s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div onClick={async e => {
                                e.stopPropagation();
                                const next = tk.status === 'done' ? 'active' : 'done';
                                try {
                                    await updateTaskStatus(tk.id, next);
                                    toastSuccess(`Task marked ${next}.`);
                                } catch (err) {
                                    toastError(err.message || 'Could not update status.');
                                }
                            }}
                                style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${tk.status === "done" ? t.green : t.border}`, background: tk.status === "done" ? t.green + "20" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                {tk.status === "done" && <I d={IC.chk} sz={9} c={t.green} sw={3} />}
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
