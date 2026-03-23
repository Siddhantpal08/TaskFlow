import { useState, useEffect } from 'react';
import { I, IC } from "./ui/Icon.jsx";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { teamApi } from '../api/team.js';
import { toastSuccess, toastError } from './ui/Toast.jsx';
import CreateTaskModal from './CreateTaskModal.jsx';

export default function Team({ t, team, refreshTeams, onLeave }) {
    const { tasks = [], onlineUsers = new Set(), createTask, teamMembers: allTeamMembers } = useData();
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignToUser, setAssignToUser] = useState(null);
    const [leaveRequests, setLeaveRequests] = useState([]);

    useEffect(() => {
        if (!team) return;
        setLoading(true);
        teamApi.getTeamMembers(team.id).then(res => {
            setMembers(res.data || []);
        }).catch(err => {
            toastError("Failed to fetch team members.");
        }).finally(() => setLoading(false));

        if (team.role === 'admin') {
            teamApi.getLeaveRequests(team.id).then(res => {
                setLeaveRequests(res.data.data || []);
            }).catch(() => { });
        } else {
            setLeaveRequests([]);
        }
    }, [team]);

    const handleLeave = async () => {
        const actionText = team.role === 'admin' ? "leave" : "request to leave";
        if (!window.confirm(`Are you sure you want to ${actionText} ${team.name}?`)) return;
        try {
            const res = await teamApi.leaveTeam(team.id);
            toastSuccess(res.data?.message || "Leave request submitted.");

            // If they actually left (admin), go back
            if (team.role === 'admin') {
                const { useData: localUseData } = await import('../context/DataContext.jsx');
                onLeave();
                refreshTeams();
            }
        } catch (e) {
            toastError(e.response?.data?.message || e.message || "Failed to leave team.");
        }
    };

    const handleApproveLeave = async (reqId) => {
        try {
            await teamApi.approveLeaveRequest(reqId);
            toastSuccess("Request approved. User removed.");
            setLeaveRequests(r => r.filter(x => x.id !== reqId));
            setMembers(m => m.filter(x => !leaveRequests.find(lr => lr.id === reqId && lr.user_id === x.id)));
        } catch (e) { toastError("Failed to approve"); }
    };

    const handleRejectLeave = async (reqId) => {
        try {
            await teamApi.rejectLeaveRequest(reqId);
            toastSuccess("Request rejected.");
            setLeaveRequests(r => r.filter(x => x.id !== reqId));
        } catch (e) { toastError("Failed to reject"); }
    };

    // Find delegation chains from real tasks involving the current user and team members
    const delegatedTasks = tasks.filter(tk => tk.parent_task_id);

    return (
        <div style={{ padding: "0 26px 26px 26px", display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Team Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <h3 style={{ fontSize: 16, color: t.t1, margin: 0, fontFamily: t.disp }}>Members</h3>
                <button onClick={handleLeave} style={{ background: `${t.red}12`, border: `1px solid ${t.red}44`, color: t.red, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 600 }}>
                    {team.role === 'admin' ? 'Leave Team' : 'Request to Leave'}
                </button>
            </div>

            {/* Leave Requests (Admin Only) */}
            {team.role === 'admin' && leaveRequests.length > 0 && (
                <div style={{ background: `${t.orange}10`, border: `1px solid ${t.orange}30`, borderRadius: 12, padding: 20 }}>
                    <h4 style={{ color: t.orange, marginTop: 0, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <I d={IC.cal} sz={14} c={t.orange} /> Pending Leave Requests
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {leaveRequests.map(req => (
                            <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: t.card, padding: 12, borderRadius: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.inset, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.t1, fontSize: 12, fontWeight: 600 }}>
                                        {req.avatar_initials}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: t.t1 }}>{req.name}</div>
                                        <div style={{ fontSize: 11, color: t.t3 }}>Requested to leave team</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => handleApproveLeave(req.id)} style={{ padding: '6px 12px', background: `${t.green}20`, color: t.green, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Approve</button>
                                    <button onClick={() => handleRejectLeave(req.id)} style={{ padding: '6px 12px', background: 'transparent', color: t.t3, border: `1px solid ${t.border}`, borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Delegation Chain Visualizer */}
            {delegatedTasks.length > 0 && (
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 22, boxShadow: t.shadow }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: t.t1, marginBottom: 2 }}>Delegation Chain Visualizer</div>
                    <div style={{ fontSize: 10.5, color: t.t3, fontFamily: t.mono, marginBottom: 22 }}>
                        task: "{delegatedTasks[0]?.title}"
                    </div>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: 'wrap', gap: 8 }}>
                        {(() => {
                            const tk = delegatedTasks[0];
                            const steps = [
                                { initials: tk.assigned_by_initials || '?', name: tk.assigned_by_name?.split(' ')[0] || '?', role: "Created & Assigned", lbl: "ASSIGNER", active: false },
                                { initials: tk.assigned_to_initials || '?', name: tk.assigned_to_name?.split(' ')[0] || '?', role: "Received", lbl: "RECIPIENT", active: true },
                            ];
                            return steps.map((s, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 22px", borderRadius: 11, minWidth: 130, background: s.active ? t.accentDim : t.surf, border: `1px solid ${s.active ? t.accent : t.border}`, boxShadow: s.active ? t.accentGlow : "none" }}>
                                        <div style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}40, ${t.purple}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: t.accent }}>{s.initials}</div>
                                        <div style={{ marginTop: 9, fontSize: 12.5, fontWeight: 700, color: t.t1 }}>{s.name}</div>
                                        <div style={{ fontSize: 9.5, color: t.t3, fontFamily: t.mono, marginTop: 1, textTransform: "uppercase", letterSpacing: "0.7px" }}>{s.lbl}</div>
                                        <div style={{ marginTop: 8, fontSize: 10.5, padding: "3px 9px", borderRadius: 20, color: s.active ? t.accent : t.t2, background: s.active ? t.accentDim : t.card }}>{s.role}</div>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
                                            <div style={{ width: 24, height: 1.5, background: `linear-gradient(to right,#009688,${t.accent})` }} />
                                            <I d={IC.arr} sz={12} c={t.accent} />
                                        </div>
                                    )}
                                </div>
                            ));
                        })()}
                        <div style={{ marginLeft: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <div className="glw" style={{ width: 9, height: 9, borderRadius: "50%", background: t.green, boxShadow: `0 0 14px ${t.green}88` }} />
                            <span style={{ fontSize: 9, color: t.green, fontFamily: t.mono }}>LIVE</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Team member cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }} className="team-grid">
                {loading && <div style={{ color: t.t3, fontSize: 13 }}>Loading members…</div>}
                {!loading && members.map(u => {
                    const myTasks = tasks.filter(tk => tk.assigned_to === u.id);
                    const done = myTasks.filter(tk => tk.status === "done").length;
                    const pct = myTasks.length ? Math.round(done / myTasks.length * 100) : 0;
                    const isOnline = onlineUsers.has(String(u.id));
                    const isMe = u.id === user?.id;
                    return (
                        <div key={u.id} className="hvrC" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, textAlign: "center", boxShadow: t.shadow, transition: "all .2s" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 11 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}40, ${t.purple}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: t.accent, border: isMe ? `2px solid ${t.accent}` : 'none' }}>
                                    {u.avatar_initials}
                                </div>
                            </div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.t1 }}>{u.name}</div>
                            <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 2, marginBottom: 14 }}>{u.role === 'admin' ? "Admin" : "Member"} {isMe && "(You)"}</div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.t3, marginBottom: 4, fontFamily: t.mono }}>
                                    <span>Progress</span><span style={{ color: t.accent }}>{done}/{myTasks.length}</span>
                                </div>
                                <div style={{ height: 3, background: t.border, borderRadius: 2 }}>
                                    <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: `linear-gradient(to right,#009688,${t.accent})`, transition: "width .6s" }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 12 }}>
                                <div className={isOnline ? 'glw' : ''} style={{ width: 6, height: 6, borderRadius: "50%", background: isOnline ? t.green : t.border }} />
                                <span style={{ fontSize: 10, color: isOnline ? t.green : t.t3, fontFamily: t.mono }}>{isOnline ? 'online' : 'offline'}</span>
                            </div>
                            <div style={{ marginTop: 14 }}>
                                <button onClick={() => setAssignToUser(u.id)} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${t.border}`, background: 'transparent', color: t.accent, fontSize: 11, cursor: 'pointer', fontFamily: t.disp, fontWeight: 700, width: '100%', transition: 'all .2s' }} onMouseEnter={e => e.currentTarget.style.background = `${t.accent}14`} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    Assign Task ↗
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {assignToUser && (
                <CreateTaskModal
                    t={t}
                    teamMembers={allTeamMembers}
                    initialAssignee={String(assignToUser)}
                    onClose={() => setAssignToUser(null)}
                    onCreate={createTask}
                />
            )}
        </div>
    );
}
