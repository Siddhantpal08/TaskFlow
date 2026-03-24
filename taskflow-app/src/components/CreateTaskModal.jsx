import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function CreateTaskModal({ t, teamMembers, onClose, onCreate, initialAssignee }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState('medium');
    const [assigned_to, setAssignedTo] = useState(initialAssignee || String(user?.id || ''));
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
                            {teamMembers
                                .filter(m => {
                                    // Make sure current user is an admin to see admins, else hide admins
                                    const amIAdmin = teamMembers.some(tm => tm.id === user?.id && tm.role === 'admin');
                                    return amIAdmin ? true : (m.role !== 'admin' || m.id === user?.id);
                                })
                                .map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <input type="date" value={due_date} onChange={e => setDueDate(e.target.value)} style={{ ...inp }} />
                    {err && <div style={{ color: t.red, fontSize: 12 }}>{err}</div>}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                        <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, background: 'none', color: t.t2, border: `1px solid ${t.border}`, cursor: 'pointer', fontFamily: t.disp }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 8, background: t.accent, color: '#000', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp }}>{loading ? 'Creating…' : 'Create Task'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
