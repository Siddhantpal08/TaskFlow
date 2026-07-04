import { useState, useEffect } from "react";
import { I, IC } from "./ui/Icon.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import { tasksApi } from "../api/tasks.js";
import { notesApi } from "../api/notes.js";
import { toastError, toastSuccess } from "./ui/Toast.jsx";
import ConfirmModal from "./ui/ConfirmModal.jsx";
import { useData } from "../context/DataContext.jsx";

export default function RecycleBin({ t }) {
    const { refreshTasks } = useData();
    const [activeTab, setActiveTab] = useState("tasks"); // "tasks" or "notes"
    
    const [tasksTrash, setTasksTrash] = useState([]);
    const [notesTrash, setNotesTrash] = useState([]);
    const [loading, setLoading] = useState(true);
    const [itemToHardDelete, setItemToHardDelete] = useState(null);

    const loadTrash = async () => {
        setLoading(true);
        try {
            if (activeTab === "tasks") {
                const res = await tasksApi.getTrash();
                setTasksTrash(Array.isArray(res.data) ? res.data : []);
            } else {
                const res = await notesApi.getTrash();
                setNotesTrash(Array.isArray(res.data) ? res.data : []);
            }
        } catch (err) {
            console.error("Failed to load trash:", err);
            toastError("Failed to load Recycle Bin.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrash();
    }, [activeTab]);

    const handleRestore = async (id) => {
        try {
            if (activeTab === "tasks") {
                await tasksApi.restore(id);
                setTasksTrash(prev => prev.filter(x => x.id !== id));
                if (refreshTasks) refreshTasks();
            } else {
                await notesApi.restore(id);
                setNotesTrash(prev => prev.filter(x => x.id !== id));
                // we don't have a global refreshNotes, so we just remove from local state
            }
            toastSuccess(`${activeTab === "tasks" ? "Task" : "Note"} restored.`);
        } catch (err) {
            toastError(`Failed to restore ${activeTab === "tasks" ? "task" : "note"}.`);
        }
    };

    const handleHardDelete = async () => {
        if (!itemToHardDelete) return;
        try {
            if (activeTab === "tasks") {
                await tasksApi.hardDelete(itemToHardDelete.id);
                setTasksTrash(prev => prev.filter(x => x.id !== itemToHardDelete.id));
            } else {
                await notesApi.hardDelete(itemToHardDelete.id);
                setNotesTrash(prev => prev.filter(x => x.id !== itemToHardDelete.id));
            }
            toastSuccess(`${activeTab === "tasks" ? "Task" : "Note"} permanently deleted.`);
        } catch (err) {
            toastError(`Failed to permanently delete ${activeTab === "tasks" ? "task" : "note"}.`);
        } finally {
            setItemToHardDelete(null);
        }
    };

    const currentList = activeTab === "tasks" ? tasksTrash : notesTrash;

    return (
        <div style={{ padding: "22px 26px", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap', flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: t.red + "20", color: t.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <I d={IC.trash} sz={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: t.t1, fontFamily: t.disp, letterSpacing: "-0.5px" }}>Recycle Bin</div>
                        <div style={{ fontSize: 12, color: t.t3, fontFamily: t.mono }}>{currentList.length} {currentList.length === 1 ? 'item' : 'items'} deleted • Items are permanently deleted after 30 days</div>
                    </div>
                </div>
                
                {/* Tabs */}
                <div style={{ display: 'flex', background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 4 }}>
                    <button onClick={() => setActiveTab("tasks")} style={{ background: activeTab === "tasks" ? t.accentDim : "transparent", color: activeTab === "tasks" ? t.accent : t.t3, border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 700, fontFamily: t.disp, cursor: "pointer", transition: "all .15s" }}>
                        Tasks
                    </button>
                    <button onClick={() => setActiveTab("notes")} style={{ background: activeTab === "notes" ? t.accentDim : "transparent", color: activeTab === "notes" ? t.accent : t.t3, border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 700, fontFamily: t.disp, cursor: "pointer", transition: "all .15s" }}>
                        Notes
                    </button>
                </div>
            </div>

            {/* List */}
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "auto", boxShadow: t.shadow, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: "grid", gridTemplateColumns: activeTab === "tasks" ? "1fr 120px 140px 110px" : "1fr 140px 110px", padding: "10px 18px", borderBottom: `1px solid ${t.border}`, fontSize: 10, fontWeight: 600, color: t.t3, textTransform: "uppercase", letterSpacing: "0.7px", fontFamily: t.mono, flexShrink: 0 }}>
                    <span>{activeTab === "tasks" ? "Task" : "Note"}</span>
                    <span>Deleted At</span>
                    {activeTab === "tasks" && <span>Original Assignee</span>}
                    <span>Actions</span>
                </div>
                
                {loading && <div style={{ padding: '20px', textAlign: 'center', color: t.t3, fontSize: 13 }}>Loading trash…</div>}
                
                {!loading && currentList.length === 0 && (
                    <div style={{ padding: '16px 20px 32px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <EmptyState
                            t={t}
                            icon="trash"
                            title="Recycle Bin is Empty"
                            desc={`No deleted ${activeTab} found. You're keeping things clean!`}
                        />
                    </div>
                )}
                
                {!loading && currentList.map(item => (
                    <div key={item.id} className="nsi" style={{ display: "grid", gridTemplateColumns: activeTab === "tasks" ? "1fr 120px 140px 110px" : "1fr 140px 110px", padding: "12px 18px", borderBottom: `1px solid ${t.border}`, alignItems: "center", gap: 10, transition: "background .2s" }}>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: t.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: 'flex', alignItems: 'center', gap: 6 }}>
                                {activeTab === "notes" && <span>{item.emoji}</span>}
                                {item.title}
                            </div>
                            {activeTab === "tasks" && item.description && <div style={{ fontSize: 12, color: t.t3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{item.description}</div>}
                        </div>
                        <div style={{ fontSize: 12, color: t.t2, fontFamily: t.mono }}>
                            {new Date(item.deleted_at).toLocaleDateString()}
                        </div>
                        {activeTab === "tasks" && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                                <div style={{ width: 22, height: 22, borderRadius: "50%", background: t.accentDim, color: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                                    {item.assigned_to_initials || "?"}
                                </div>
                                <span style={{ fontSize: 12, color: t.t2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.assigned_to_name}</span>
                            </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => handleRestore(item.id)} style={{ background: t.accentDim, border: `1px solid ${t.accent}`, color: t.accent, cursor: "pointer", padding: "6px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, transition: "all .15s" }} onMouseEnter={e => e.currentTarget.style.background = t.accent + "33"} onMouseLeave={e => e.currentTarget.style.background = t.accentDim}>
                                <I d={IC.refresh} sz={14} /> Restore
                            </button>
                            <button onClick={() => setItemToHardDelete(item)} style={{ background: "transparent", border: "none", color: t.t3, cursor: "pointer", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, transition: "all .15s" }} onMouseEnter={e => { e.currentTarget.style.color = t.red; e.currentTarget.style.background = t.red + "20"; }} onMouseLeave={e => { e.currentTarget.style.color = t.t3; e.currentTarget.style.background = "transparent"; }} title="Delete Permanently">
                                <I d={IC.trash} sz={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {itemToHardDelete && (
                <ConfirmModal
                    t={t}
                    title="Delete Permanently?"
                    description={`Are you sure you want to permanently delete "${itemToHardDelete.title}"? This action cannot be undone.`}
                    confirmText="Permanently Delete"
                    danger={true}
                    icon="🔥"
                    onConfirm={handleHardDelete}
                    onCancel={() => setItemToHardDelete(null)}
                />
            )}
        </div>
    );
}
