import { useState, useEffect } from 'react';
import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { teamApi } from '../api/team.js';
import { toastSuccess, toastError } from './ui/Toast.jsx';
import CreateTaskModal from './CreateTaskModal.jsx';
import ConfirmModal from './ui/ConfirmModal.jsx';

export default function Team({ t, team, refreshTeams: refreshTeamsList, onLeave }) {
    const { tasks = [], onlineUsers = new Set(), createTask, teamMembers: allTeamMembers, refreshTeams } = useData();
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignToUser, setAssignToUser] = useState(null);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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
                // Backend returns flat array in res.data
                setLeaveRequests(Array.isArray(res.data) ? res.data : []);
            }).catch(() => { });
        } else {
            setLeaveRequests([]);
        }
    }, [team]);

    const handleLeave = async () => {
        try {
            const res = await teamApi.leaveTeam(team.id);
            const msg = res?.message || res?.data?.message || 'Done.';
            if (team.role === 'admin') {
                // Admin left — navigate back to team list
                toastSuccess(msg);
                refreshTeamsList?.();
                refreshTeams?.();
                onLeave();
            } else {
                // Non-admin submitted a leave request — stay on the page
                toastSuccess('Your leave request has been sent to the admin.');
            }
        } catch (e) {
            toastError(e.response?.data?.message || e.message || 'Failed to leave team.');
        }
    };

    const handleApproveLeave = async (reqId) => {
        try {
            await teamApi.approveLeaveRequest(reqId);
            toastSuccess('Request approved. User removed.');
            const approved = leaveRequests.find(r => r.id === reqId);
            setLeaveRequests(r => r.filter(x => x.id !== reqId));
            if (approved) setMembers(m => m.filter(x => x.id !== approved.user_id));
            refreshTeams?.();
        } catch (e) { toastError('Failed to approve'); }
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
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => window.dispatchEvent(new CustomEvent('open-team-chat', { detail: { team } }))} style={{ background: t.accent, border: 'none', color: '#000', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <I d={IC.msg} sz={14} /> Team Chat
                    </button>
                    <button onClick={() => setShowLeaveConfirm(true)} style={{ background: `${t.red}12`, border: `1px solid ${t.red}44`, color: t.red, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 600 }}>
                        Leave Team
                    </button>
                </div>
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
                                <div style={{ padding: isMe ? 2 : 0, borderRadius: '50%', border: isMe ? `2px solid ${t.accent}` : '2px solid transparent', display: 'inline-flex' }}>
                                    <Av u={{ ...u, av: u.avatar_initials || u.initials || u.name?.slice(0, 2), color: t.accent, avatar_url: u.avatar_url }} sz={46} />
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
                                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left' }}>
                                    {myTasks.filter(tk => tk.status !== 'done').slice(0, 2).map(tk => (
                                        <div key={tk.id} style={{ fontSize: 10, color: t.t2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: `${t.border}88`, padding: '4px 6px', borderRadius: 4, fontFamily: t.mono }}>
                                            • {tk.title}
                                        </div>
                                    ))}
                                    {myTasks.filter(tk => tk.status !== 'done').length > 2 && (
                                        <div style={{ fontSize: 9, color: t.t3, paddingLeft: 6, fontFamily: t.mono }}>+{myTasks.filter(tk => tk.status !== 'done').length - 2} more pending...</div>
                                    )}
                                    {myTasks.filter(tk => tk.status !== 'done').length === 0 && myTasks.length > 0 && (
                                        <div style={{ fontSize: 9, color: t.green, paddingLeft: 6, fontFamily: t.mono }}>All tasks cleared!</div>
                                    )}
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
            {showLeaveConfirm && (
                <ConfirmModal
                    t={t}
                    title="Leave Team?"
                    description={`Are you sure you want to leave ${team.name}?`}
                    confirmText="Leave"
                    danger={true}
                    icon="🚪"
                    onConfirm={handleLeave}
                    onCancel={() => setShowLeaveConfirm(false)}
                />
            )}
        </div>
    );
}
