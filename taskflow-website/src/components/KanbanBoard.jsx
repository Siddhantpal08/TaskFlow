import { useState } from 'react';
import { I, IC } from './ui/Icon.jsx';
import { PriTag } from './ui/Tag.jsx';

function fmtDateShort(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function KanbanBoard({ t, tasks, setTask, updateTaskStatus, user }) {
    const [dragging, setDragging] = useState(null);

    const columns = [
        { id: 'pending', title: 'Pending', color: t.t2 },
        { id: 'active', title: 'In Progress', color: t.amber },
        { id: 'pending_approval', title: 'Review', color: t.orange },
        { id: 'done', title: 'Done', color: t.green }
    ];

    const handleDragStart = (e, task) => {
        setDragging(task);
        e.dataTransfer.effectAllowed = 'move';
        // Need a slight delay to allow the drag image to capture before we dim the original
        setTimeout(() => e.target.classList.add('dragging'), 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');
        setDragging(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, status) => {
        e.preventDefault();
        if (!dragging) return;
        
        // Prevent dropping in same column
        if (dragging.status === status) return;

        // Security / logic checks: only creator or assignee can move
        const canMove = dragging.assigned_to === user?.id || dragging.assigned_by === user?.id;
        if (!canMove) return; // Silent fail for drag drop

        try {
            await updateTaskStatus(dragging.id, status);
        } catch (err) {
            console.error("Drop failed", err);
        }
    };

    return (
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, height: 'calc(100vh - 200px)' }}>
            <style dangerouslySetInnerHTML={{__html: `
                .kanban-col::-webkit-scrollbar { width: 4px; }
                .kanban-col::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 4px; }
                .kanban-card { transition: transform 0.15s, box-shadow 0.15s; }
                .kanban-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px ${t.shadow}; border-color: ${t.accent}66 !important; }
                .kanban-card.dragging { opacity: 0.5; transform: scale(0.95); }
                .kanban-col-bg { transition: background 0.2s; }
                .kanban-col-bg.drag-over { background: ${t.accent}11 !important; border-color: ${t.accent}44 !important; }
            `}} />
            
            {columns.map(col => {
                const colTasks = tasks.filter(tk => tk.status === col.id);
                
                return (
                    <div key={col.id} className="kanban-col-bg" 
                        onDragOver={handleDragOver}
                        onDragEnter={e => e.currentTarget.classList.add('drag-over')}
                        onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                        onDrop={e => {
                            e.currentTarget.classList.remove('drag-over');
                            handleDrop(e, col.id);
                        }}
                        style={{ 
                            flex: 1, minWidth: 280, maxWidth: 320, background: t.card, 
                            border: `1px solid ${t.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column' 
                        }}>
                        
                        {/* Header */}
                        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                                <span style={{ fontSize: 13, fontWeight: 700, color: t.t1, fontFamily: t.disp }}>{col.title}</span>
                            </div>
                            <span style={{ fontSize: 11, color: t.t3, background: t.bg, padding: '2px 8px', borderRadius: 10, fontFamily: t.mono }}>{colTasks.length}</span>
                        </div>

                        {/* Task List */}
                        <div className="kanban-col" style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {colTasks.map(tk => (
                                <div key={tk.id} className="kanban-card"
                                    draggable
                                    onDragStart={e => handleDragStart(e, tk)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => setTask(tk)}
                                    style={{ 
                                        background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 14, cursor: 'grab',
                                        opacity: tk.status === 'done' ? 0.6 : 1
                                    }}>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: tk.status === 'done' ? t.t2 : t.t1, textDecoration: tk.status === 'done' ? 'line-through' : 'none', lineHeight: 1.4 }}>
                                            {tk.title}
                                        </div>
                                    </div>
                                    
                                    {tk.parent_task_id && (
                                        <div style={{ fontSize: 10, color: t.amber, marginBottom: 8, fontFamily: t.mono }}>↗ Delegated sub-task</div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <PriTag p={tk.priority} t={t} />
                                            {tk.due_date && (
                                                <div style={{ fontSize: 10, color: t.t3, display: 'flex', alignItems: 'center', gap: 4, fontFamily: t.mono }}>
                                                    <I d={IC.cal} sz={10} /> {fmtDateShort(tk.due_date)}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Assignee Avatar */}
                                        <div title={`Assigned to: ${tk.assigned_to_name}`} style={{ 
                                            width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}40, #0072FF40)`, 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: t.accent,
                                            border: `1.5px solid ${t.card}`
                                        }}>
                                            {tk.assigned_to_initials || tk.assigned_to_name?.slice(0, 2) || '?'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {colTasks.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '20px 0', color: t.t3, fontSize: 12, fontFamily: t.mono, border: `1px dashed ${t.border}`, borderRadius: 8, marginTop: 4 }}>
                                    Drop tasks here
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
