import { useState } from 'react';
import { I, IC } from './ui/Icon.jsx';
import { PriTag, StTag } from './ui/Tag.jsx';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { toastSuccess, toastError } from './ui/Toast.jsx';

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const INP = (t) => ({
    background: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    padding: '8px 11px',
    color: t.t1,
    fontSize: 13,
    fontFamily: t.disp,
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
});

export default function TaskDrawer({ t, task: initialTask, onClose }) {
    const { user } = useAuth();
    const { updateTask, updateTaskStatus, deleteTask, delegateTask, teamMembers } = useData();

    const [task, setTask] = useState(initialTask);
    const [editing, setEditing] = useState(false);
    const [delegating, setDelegating] = useState(false);
    const [form, setForm] = useState({ title: task.title, description: task.description || '', priority: task.priority, due_date: task.due_date ? task.due_date.slice(0, 10) : '', assigned_to: task.assigned_to, status: task.status });
    const [delegateTo, setDelegateTo] = useState('');
    const [saving, setSaving] = useState(false);

    const amIAdmin = teamMembers.some(tm => tm.id === user?.id && tm.role === 'admin');
    const isCreator = user?.id === task.assigned_by || amIAdmin;
    const isAssignee = user?.id === task.assigned_to;
    const canEdit = isCreator;
    const canStatus = isCreator || isAssignee;

    // ── Status toggle ───────────────────────────────────────────────────────────
    const handleStatusCycle = async () => {
        if (!canStatus) return toastError('Only the creator or assignee can update status.');
        const next = task.status === 'pending' ? 'active' : task.status === 'active' ? 'done' : null;
        if (!next) return toastError('Task is already done.');
        try {
            setSaving(true);
            const updated = await updateTaskStatus(task.id, next);
            setTask(updated);
            toastSuccess(`Status updated to "${next}"`);
        } catch (e) {
            toastError(e.message || 'Failed to update status.');
        } finally { setSaving(false); }
    };

    // ── Save edits ──────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.title.trim()) return toastError('Title cannot be empty.');
        try {
            setSaving(true);
            let updated = await updateTask(task.id, { ...form, due_date: form.due_date || null });

            // Because status has its own endpoint and linear transitions, we trigger it only if changed explicitly
            if (form.status !== task.status && canStatus) {
                updated = await updateTaskStatus(task.id, form.status);
            }

            setTask(updated);
            setEditing(false);
            toastSuccess('Task updated.');
        } catch (e) {
            toastError(e.message || 'Failed to save changes.');
        } finally { setSaving(false); }
    };

    // ── Delete ──────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!isCreator && task.status !== 'done') return toastError('Only the creator can delete this task unless it is done.');
        if (!window.confirm('Delete this task?')) return;
        try {
            await deleteTask(task.id);
            toastSuccess('Task deleted.');
            onClose();
        } catch (e) {
            toastError(e.message || 'Failed to delete task.');
        }
    };

    // ── Delegate ────────────────────────────────────────────────────────────────
    const handleDelegate = async () => {
        if (!delegateTo) return toastError('Select a team member.');
        try {
            setSaving(true);
            await delegateTask(task.id, parseInt(delegateTo));
            toastSuccess('Task delegated successfully.');
            setDelegating(false);
            onClose();
        } catch (e) {
            toastError(e.message || 'Failed to delegate task.');
        } finally { setSaving(false); }
    };

    const statusLbl = { pending: 'Pending', active: 'In Progress', pending_approval: 'Pending Approval', done: 'Done' };
    const nextLbl = { pending: 'Mark In Progress', active: 'Mark Done', pending_approval: null, done: null };

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 40, backdropFilter: 'blur(2px)' }} />
            <div className="slideRight" style={{
                position: 'fixed', top: 0, right: 0, height: '100vh', width: 380, zIndex: 50,
                background: t.surf, borderLeft: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column',
                overflow: 'hidden', boxShadow: '-20px 0 60px #00000066',
            }}>
                {/* Header */}
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: t.t1 }}>Task Detail</span>
                        {canEdit && !editing && (
                            <button onClick={() => setEditing(true)} style={{ background: t.accentDim, border: `1px solid ${t.accent}33`, borderRadius: 6, padding: '3px 9px', color: t.accent, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: t.disp }}>
                                Edit
                            </button>
                        )}
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }} className="hvrI">
                        <I d={IC.x} sz={17} c={t.t2} />
                    </button>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: 18 }}>
                    {/* Tags */}
                    <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
                        <StTag s={task.status} t={t} />
                        <PriTag p={task.priority} t={t} />
                        {task.parent_task_id && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${t.amber}14`, color: t.amber, border: `1px solid ${t.amber}33` }}>↗ Delegated</span>}
                    </div>

                    {/* Edit mode */}
                    {editing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" style={INP(t)} />
                            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description…" rows={3} style={{ ...INP(t), resize: 'vertical' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={INP(t)}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} style={INP(t)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: parseInt(e.target.value) || f.assigned_to }))} style={INP(t)} disabled={!canEdit}>
                                    <option value={task.assigned_to}>{task.assigned_to_name}</option>
                                    {teamMembers.filter(m => {
                                        const amIAdmin = teamMembers.some(tm => tm.id === user?.id && tm.role === 'admin');
                                        return m.id !== task.assigned_to && (amIAdmin ? true : (m.role !== 'admin' || m.id === user?.id));
                                    }).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={INP(t)} disabled={!canStatus}>
                                    <option value="pending">Pending</option>
                                    <option value="active">Active/In Progress</option>
                                    <option value="pending_approval">Pending Approval</option>
                                    <option value="done">Done</option>
                                    <option value="refused">Refused</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: t.accent, color: '#000', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </button>
                                <button onClick={() => { setEditing(false); setForm({ title: task.title, description: task.description || '', priority: task.priority, due_date: task.due_date ? task.due_date.slice(0, 10) : '', assigned_to: task.assigned_to, status: task.status }); }} style={{ padding: '9px 14px', borderRadius: 8, border: `1px solid ${t.border}`, background: 'none', color: t.t2, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 style={{ fontSize: 16, fontWeight: 800, color: t.t1, marginBottom: 8, letterSpacing: '-0.3px', lineHeight: 1.4 }}>{task.title}</h2>
                            {task.description && <p style={{ fontSize: 12.5, color: t.t2, lineHeight: 1.7, marginBottom: 16, fontFamily: t.mono }}>{task.description}</p>}
                        </>
                    )}

                    {/* Details rows */}
                    {[
                        { label: 'Assigned By', val: task.assigned_by_name || '—' },
                        { label: 'Assigned To', val: task.assigned_to_name || '—' },
                        { label: 'Due Date', val: fmtDate(task.due_date) },
                        { label: 'Status', val: statusLbl[task.status] || task.status },
                    ].map(({ label, val }) => (
                        <div key={label} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${t.border}` }}>
                            <div style={{ fontSize: 10, color: t.t3, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: t.mono }}>{label}</div>
                            <div style={{ fontSize: 13, color: t.t1 }}>{val}</div>
                        </div>
                    ))}

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 6 }}>
                        {canStatus && nextLbl[task.status] && (
                            <button onClick={handleStatusCycle} disabled={saving} style={{ padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 700, background: `linear-gradient(135deg,${t.green},#009950)`, color: '#000' }}>
                                {saving ? 'Updating…' : nextLbl[task.status]}
                            </button>
                        )}

                        {task.status === 'pending_approval' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                {isCreator ? (
                                    <>
                                        <button onClick={() => updateTaskStatus(task.id, 'done').then(setTask)} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 700, background: `linear-gradient(135deg,${t.green},#009950)`, color: '#000' }}>
                                            Approve Status
                                        </button>
                                        <button onClick={() => updateTaskStatus(task.id, 'active').then(setTask)} disabled={saving} style={{ padding: '10px 14px', borderRadius: 9, border: `1px solid ${t.border}`, background: 'none', color: t.t2, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 700 }}>
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <button disabled style={{ flex: 1, padding: '10px', borderRadius: 9, border: `1px solid ${t.orange}44`, background: `${t.orange}12`, color: t.orange, fontFamily: t.disp, fontSize: 13, fontWeight: 700 }}>
                                        Waiting for Assigner Approval...
                                    </button>
                                )}
                            </div>
                        )}

                        {isAssignee && task.status !== 'done' && task.status !== 'refused' && !delegating && (
                            <button onClick={() => setDelegating(true)} style={{ padding: '10px', borderRadius: 9, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 700, border: `1px solid ${t.amber}44`, background: `${t.amber}12`, color: t.amber }}>
                                Delegate Task ↗
                            </button>
                        )}

                        {isAssignee && !isCreator && (task.status === 'pending' || task.status === 'active') && (
                            <button onClick={() => updateTaskStatus(task.id, 'refused').then(setTask)} disabled={saving} style={{ padding: '10px', borderRadius: 9, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 700, border: `1px solid ${t.red}44`, background: `${t.red}12`, color: t.red }}>
                                {saving ? 'Refusing…' : 'Refuse Task'}
                            </button>
                        )}

                        {delegating && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <select value={delegateTo} onChange={e => setDelegateTo(e.target.value)} style={INP(t)}>
                                    <option value="">Select team member…</option>
                                    {teamMembers.filter(m => {
                                        return m.id !== user?.id && (amIAdmin ? true : (m.role !== 'admin' || m.id === user?.id));
                                    }).map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={handleDelegate} disabled={saving} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: t.amber, color: '#000', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>
                                        {saving ? 'Delegating…' : 'Confirm Delegate'}
                                    </button>
                                    <button onClick={() => setDelegating(false)} style={{ padding: '9px 14px', borderRadius: 8, border: `1px solid ${t.border}`, background: 'none', color: t.t2, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {canEdit && (
                            <button onClick={handleDelete} style={{ padding: '10px', borderRadius: 9, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 700, border: `1px solid ${t.red}44`, background: `${t.red}12`, color: t.red }}>
                                Delete Task
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
