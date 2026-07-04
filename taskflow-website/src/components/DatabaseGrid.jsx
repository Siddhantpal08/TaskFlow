import { I, IC } from './ui/Icon.jsx';
import { PriTag, StTag } from './ui/Tag.jsx';

function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DatabaseGrid({ t, tasks, setTask, updateTaskStatus }) {
    return (
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "auto", boxShadow: t.shadow, flex: 1, minHeight: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: t.surf, borderBottom: `2px solid ${t.border}`, fontSize: 11, fontWeight: 700, color: t.t2, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: t.mono }}>
                        <th style={{ padding: '12px 18px', width: '35%', minWidth: 250 }}>Name</th>
                        <th style={{ padding: '12px 18px', width: '15%', minWidth: 120 }}>Status</th>
                        <th style={{ padding: '12px 18px', width: '15%', minWidth: 100 }}>Priority</th>
                        <th style={{ padding: '12px 18px', width: '15%', minWidth: 120 }}>Due Date</th>
                        <th style={{ padding: '12px 18px', width: '20%', minWidth: 150 }}>Assignee</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(tk => (
                        <tr key={tk.id} onClick={() => setTask(tk)} 
                            style={{ borderBottom: `1px solid ${t.border}`, cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = t.accentDim}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            
                            {/* Name Column */}
                            <td style={{ padding: '10px 18px', fontSize: 13, fontWeight: 500, color: tk.status === 'done' ? t.t3 : t.t1, textDecoration: tk.status === 'done' ? 'line-through' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 14, height: 14, border: `1.5px solid ${tk.status === 'done' ? t.green : t.border}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {tk.status === 'done' && <I d={IC.chk} sz={8} c={t.green} sw={3} />}
                                    </div>
                                    {tk.title}
                                </div>
                            </td>

                            {/* Status Column */}
                            <td style={{ padding: '10px 18px' }}>
                                <StTag s={tk.status} t={t} />
                            </td>

                            {/* Priority Column */}
                            <td style={{ padding: '10px 18px' }}>
                                <PriTag p={tk.priority} t={t} />
                            </td>

                            {/* Date Column */}
                            <td style={{ padding: '10px 18px', fontSize: 12, color: t.t2, fontFamily: t.mono }}>
                                {fmtDate(tk.due_date)}
                            </td>

                            {/* Assignee Column */}
                            <td style={{ padding: '10px 18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}40, #0072FF40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: t.accent }}>
                                        {tk.assigned_to_initials || tk.assigned_to_name?.slice(0, 2) || '?'}
                                    </div>
                                    <span style={{ fontSize: 12, color: t.t2 }}>{tk.assigned_to_name || 'Unassigned'}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {tasks.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: t.t3, fontSize: 13 }}>
                                No tasks found in this view.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
