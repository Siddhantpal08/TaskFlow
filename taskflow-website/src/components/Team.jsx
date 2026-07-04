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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState(team?.name || '');
    const [renaming, setRenaming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null); // { id, name }

    useEffect(() => {
        if (!team) return;
        setLoading(true);
        setNewTeamName(team.name || '');
        teamApi.getTeamMembers(team.id).then(res => {
            setMembers(res.data || []);
        }).catch(() => {
            toastError("Failed to fetch team members.");
        }).finally(() => setLoading(false));

        if (team.role === 'admin') {
            teamApi.getLeaveRequests(team.id).then(res => {
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
                toastSuccess(msg);
                refreshTeamsList?.();
                refreshTeams?.();
                onLeave();
            } else {
                toastSuccess('Your leave request has been sent to the admin.');
            }
        } catch (e) {
            toastError(e.response?.data?.message || e.message || 'Failed to leave team.');
        }
    };

    const handleDeleteTeam = async () => {
        setDeleting(true);
        try {
            await teamApi.deleteTeam(team.id);
            toastSuccess(`Team "${team.name}" deleted.`);
            refreshTeamsList?.();
            refreshTeams?.();
            onLeave();
        } catch (e) {
            toastError(e.response?.data?.message || e.message || 'Failed to delete team.');
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleRenameTeam = async (e) => {
        e.preventDefault();
        if (!newTeamName.trim()) return toastError('Team name cannot be empty.');
        setRenaming(true);
        try {
            await teamApi.updateTeam(team.id, newTeamName.trim());
            toastSuccess('Team renamed successfully!');
            refreshTeamsList?.();
            refreshTeams?.();
            setShowRenameModal(false);
        } catch (e) {
            toastError(e.response?.data?.message || e.message || 'Failed to rename team.');
        } finally {
            setRenaming(false);
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

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;
        try {
            await teamApi.removeMember(team.id, memberToRemove.id);
            toastSuccess(`${memberToRemove.name} removed.`);
            setMembers(m => m.filter(x => x.id !== memberToRemove.id));
            refreshTeams?.();
        } catch (e) {
            toastError(e.response?.data?.message || 'Failed to remove member.');
        } finally {
            setMemberToRemove(null);
        }
    };

    return (
        <div style={{ padding: "0 26px 26px 26px", display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Team Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, flexWrap: 'wrap', gap: 10 }}>
                <h3 style={{ fontSize: 16, color: t.t1, margin: 0, fontFamily: t.disp }}>Members</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => window.dispatchEvent(new CustomEvent('open-team-chat', { detail: { team } }))}
                        style={{ background: t.accent, border: 'none', color: '#000', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <I d={IC.msg} sz={14} /> Team Chat
                    </button>
                    {/* Admin-only: Rename + Delete */}
                    {team?.role === 'admin' && (
                        <>
                            <button onClick={() => setShowRenameModal(true)}
                                style={{ background: t.inset, border: `1px solid ${t.border}`, color: t.t1, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 600 }}>
                                ✏️ Rename
                            </button>
                            <button onClick={() => setShowDeleteConfirm(true)}
                                style={{ background: `${t.red}12`, border: `1px solid ${t.red}44`, color: t.red, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 600 }}>
                                🗑️ Delete Team
                            </button>
                        </>
                    )}
                    <button onClick={() => setShowLeaveConfirm(true)}
                        style={{ background: 'transparent', border: `1px solid ${t.border}`, color: t.t3, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 600 }}>
                        Leave Team
                    </button>
                </div>
            </div>

            {/* Leave Requests (Admin Only) */}
            {team?.role === 'admin' && leaveRequests.length > 0 && (
                <div style={{ background: `${t.orange || t.amber}10`, border: `1px solid ${t.orange || t.amber}30`, borderRadius: 12, padding: 20 }}>
                    <h4 style={{ color: t.orange || t.amber, marginTop: 0, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <I d={IC.cal} sz={14} c={t.orange || t.amber} /> Pending Leave Requests
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

            {/* Team member strips */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {loading && <div style={{ color: t.t3, fontSize: 13 }}>Loading members…</div>}
                {!loading && members.map(u => {
                    const total = u.total_tasks || 0;
                    const done = u.done_tasks || 0;
                    const active = u.active_tasks || 0;
                    const pct = total ? Math.round(done / total * 100) : 0;
                    const isOnline = onlineUsers.has(String(u.id));
                    const isMe = u.id === user?.id;
                    const hasOverdue = u.overdue_tasks > 0;
                    const nextDueFmt = u.next_due ? new Date(u.next_due).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;

                    return (
                        <div key={u.id} style={{
                            background: t.card, border: `1px solid ${hasOverdue ? t.red + "33" : t.border}`,
                            borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center",
                            gap: 14, transition: "all .15s", boxShadow: t.shadow,
                        }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = hasOverdue ? t.red + "55" : t.accent + "33"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = hasOverdue ? t.red + "33" : t.border}
                        >
                            {/* Avatar */}
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <div style={{ padding: isMe ? 2 : 0, borderRadius: '50%', border: isMe ? `2px solid ${t.accent}` : '2px solid transparent', display: 'inline-flex' }}>
                                    <Av u={{ ...u, av: u.avatar_initials || u.initials || u.name?.slice(0, 2), color: t.accent, avatar_url: u.avatar_url }} sz={40} />
                                </div>
                                {/* Online dot */}
                                <div className={isOnline ? 'glw' : ''} style={{
                                    position: "absolute", bottom: 1, right: 1,
                                    width: 9, height: 9, borderRadius: "50%",
                                    background: isOnline ? t.green : t.border,
                                    border: `2px solid ${t.card}`,
                                }} />
                            </div>

                            {/* Name + Role */}
                            <div style={{ minWidth: 130, flexShrink: 0 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: t.t1 }}>
                                    {u.name} {isMe && <span style={{ fontSize: 10, color: t.accent, fontFamily: t.mono }}>(you)</span>}
                                </div>
                                <div style={{ fontSize: 10.5, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>
                                    {u.role === 'admin' ? '👑 Admin' : 'Member'} · {isOnline ? <span style={{ color: t.green }}>● Online</span> : 'Offline'}
                                </div>
                            </div>

                            {/* Stats row */}
                            <div style={{ display: "flex", gap: 16, flex: 1, alignItems: "center" }}>
                                {/* Task counts */}
                                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: t.accent, lineHeight: 1 }}>{total}</div>
                                        <div style={{ fontSize: 9, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>TOTAL</div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: t.amber, lineHeight: 1 }}>{active}</div>
                                        <div style={{ fontSize: 9, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>ACTIVE</div>
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: t.green, lineHeight: 1 }}>{done}</div>
                                        <div style={{ fontSize: 9, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>DONE</div>
                                    </div>
                                    {hasOverdue && (
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: 16, fontWeight: 800, color: t.red, lineHeight: 1 }}>⚠</div>
                                            <div style={{ fontSize: 9, color: t.red, fontFamily: t.mono, marginTop: 1 }}>OVERDUE</div>
                                        </div>
                                    )}
                                </div>

                                {/* Progress bar */}
                                <div style={{ flex: 1, minWidth: 80 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: t.t3, marginBottom: 4, fontFamily: t.mono }}>
                                        <span>Progress</span>
                                        <span style={{ color: pct === 100 ? t.green : t.accent }}>{pct}%</span>
                                    </div>
                                    <div style={{ height: 5, background: t.border, borderRadius: 3, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: hasOverdue ? `linear-gradient(90deg, ${t.red}, ${t.amber})` : `linear-gradient(90deg, #009688, ${t.accent})`, transition: "width .6s" }} />
                                    </div>
                                </div>

                                {/* Next deadline */}
                                {nextDueFmt && (
                                    <div style={{ flexShrink: 0, textAlign: "center" }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: hasOverdue ? t.red : t.t2 }}>{nextDueFmt}</div>
                                        <div style={{ fontSize: 9, color: t.t3, fontFamily: t.mono }}>NEXT DUE</div>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                <button onClick={() => setAssignToUser(u.id)}
                                    style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${t.accent}44`, background: t.accentDim, color: t.accent, fontSize: 11, cursor: 'pointer', fontFamily: t.disp, fontWeight: 700, transition: 'all .15s', whiteSpace: "nowrap" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = "#000"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = t.accentDim; e.currentTarget.style.color = t.accent; }}>
                                    Assign ↗
                                </button>
                                {team?.role === 'admin' && !isMe && (
                                    <button onClick={() => setMemberToRemove({ id: u.id, name: u.name })}
                                        style={{ padding: '6px 8px', borderRadius: 7, border: `1px solid ${t.red}33`, background: 'transparent', color: t.red, fontSize: 11, cursor: 'pointer', transition: 'all .15s' }}
                                        title="Remove member"
                                        onMouseEnter={e => e.currentTarget.style.background = `${t.red}14`}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Assign Task Modal */}
            {assignToUser && (
                <CreateTaskModal
                    t={t}
                    teamMembers={allTeamMembers}
                    initialAssignee={String(assignToUser)}
                    onClose={() => setAssignToUser(null)}
                    onCreate={createTask}
                />
            )}

            {/* Leave Confirm */}
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

            {/* Delete Team Confirm */}
            {showDeleteConfirm && (
                <ConfirmModal
                    t={t}
                    title="Delete Team?"
                    description={<>This will permanently delete <strong>{team.name}</strong> and remove all members. <span style={{ color: t.red }}>This cannot be undone.</span></>}
                    confirmText={deleting ? "Deleting…" : "Delete Team"}
                    danger={true}
                    icon="🗑️"
                    onConfirm={handleDeleteTeam}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}

            {/* Remove Member Confirm */}
            {memberToRemove && (
                <ConfirmModal
                    t={t}
                    title="Remove Member?"
                    description={<>Are you sure you want to remove <strong>{memberToRemove.name}</strong> from <strong>{team?.name}</strong>? They will lose access to the team immediately.</>}
                    confirmText="Remove"
                    danger={true}
                    icon="👤"
                    onConfirm={handleRemoveMember}
                    onCancel={() => setMemberToRemove(null)}
                />
            )}

            {/* Rename Team Modal */}
            {showRenameModal && (
                <div onClick={e => e.target === e.currentTarget && setShowRenameModal(false)}
                    style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="popIn" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: '28px 32px', width: 360, boxShadow: t.shadow }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: t.t1, marginBottom: 16 }}>✏️ Rename Team</div>
                        <form onSubmit={handleRenameTeam} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input
                                value={newTeamName}
                                onChange={e => setNewTeamName(e.target.value)}
                                placeholder="Team name…"
                                autoFocus
                                style={{ padding: '9px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.inset, color: t.t1, fontSize: 14, fontFamily: t.disp, outline: 'none', width: '100%', boxSizing: 'border-box' }}
                                onFocus={e => e.target.style.borderColor = t.accent}
                                onBlur={e => e.target.style.borderColor = t.border}
                            />
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowRenameModal(false)}
                                    style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${t.border}`, background: 'none', color: t.t2, fontFamily: t.disp, cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={renaming}
                                    style={{ padding: '8px 20px', borderRadius: 8, background: t.accent, border: 'none', color: '#000', fontWeight: 700, fontFamily: t.disp, cursor: 'pointer' }}>
                                    {renaming ? 'Saving…' : 'Save Name'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
