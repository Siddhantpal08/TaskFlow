import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import CustomSelect from "./ui/CustomSelect.jsx";
import CustomDateTimePicker from "./ui/CustomDateTimePicker.jsx";

export default function CreateTaskModal({ t, teamMembers, onClose, onCreate, initialAssignee }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState('medium');
    const [assignType, setAssignType] = useState(initialAssignee && initialAssignee !== String(user?.id) ? 'team' : 'self');
    const [assigned_to, setAssignedTo] = useState(initialAssignee || String(user?.id || ''));
    const [due_date, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const inp = { background: t.inset, border: `1px solid ${t.border}`, borderRadius: 8, padding: '9px 12px', color: t.t1, fontSize: 13, fontFamily: t.disp, width: '100%', outline: 'none' };

    const handleSubmit = async (e) => {
        e.preventDefault(); setErr(''); setLoading(true);
        const finalAssignee = assignType === 'self' ? user?.id : parseInt(assigned_to);
        if (!finalAssignee) {
            setErr("Please select an assignee.");
            setLoading(false);
            return;
        }
        try {
            await onCreate({ title, description: desc, priority, assigned_to: finalAssignee, due_date: due_date || undefined });
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
                        <CustomSelect
                            t={t}
                            value={priority}
                            onChange={setPriority}
                            options={[
                                { value: "low", label: "Low Priority" },
                                { value: "medium", label: "Medium Priority" },
                                { value: "high", label: "High Priority" },
                            ]}
                        />
                        <CustomSelect
                            t={t}
                            value={assignType}
                            onChange={(val) => {
                                setAssignType(val);
                                if (val === 'self') setAssignedTo(String(user?.id));
                            }}
                            options={[
                                { value: "self", label: "Assign to Self" },
                                { value: "team", label: "Assign to Team..." },
                            ]}
                        />
                    </div>
                    {assignType === 'team' && (
                        <div style={{ animation: "popIn 0.2s" }}>
                            <CustomSelect
                                t={t}
                                value={assigned_to}
                                onChange={setAssignedTo}
                                options={[
                                    { value: "", label: "Select team member..." },
                                    ...teamMembers
                                    .filter(m => {
                                        const amIAdmin = teamMembers.some(tm => tm.id === user?.id && tm.role === 'admin');
                                        return m.id !== user?.id && (amIAdmin ? true : (m.role !== 'admin'));
                                    })
                                    .map(m => ({ value: String(m.id), label: m.name }))
                                ]}
                            />
                        </div>
                    )}
                    <CustomDateTimePicker t={t} value={due_date} onChange={setDueDate} type="date" placeholder="Select due date..." />
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
