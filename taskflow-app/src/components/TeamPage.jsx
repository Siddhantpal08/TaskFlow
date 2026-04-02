import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext.jsx';
import { teamApi } from '../api/team.js';
import { toastError, toastSuccess } from './ui/Toast.jsx';
import Team from './Team.jsx';
import HierarchyChart from './HierarchyChart.jsx';

export default function TeamPage({ t }) {
    const { refreshTeams } = useData();
    const [joinCode, setJoinCode] = useState("");
    const [teamName, setTeamName] = useState("");
    const [loading, setLoading] = useState(false);
    const [newTeam, setNewTeam] = useState(null);
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);

    const fetchMyTeams = async () => {
        setLoading(true);
        try {
            const { data } = await teamApi.getMyTeams();
            setTeams(data || []);
        } catch (e) {
            toastError("Failed to fetch teams.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTeams();
    }, []);

    const handleJoin = async () => {
        if (!joinCode.trim()) return toastError("Please enter a valid join code.");
        setLoading(true);
        try {
            await teamApi.joinTeam(joinCode);
            toastSuccess("Joined team successfully!");
            setJoinCode("");
            fetchMyTeams();
            refreshTeams();
        } catch (e) {
            toastError(e.message || "Failed to join team");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!teamName.trim()) return toastError("Team name is required.");
        setLoading(true);
        try {
            const { data } = await teamApi.createTeam(teamName);
            setNewTeam(data);
            setTeamName("");
            fetchMyTeams();
            refreshTeams();
            toastSuccess("Team created successfully!");
        } catch (e) {
            toastError(e.message || "Failed to create team");
        } finally {
            setLoading(false);
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        toastSuccess("Join code copied!");
    };

    const inp = { flex: 1, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px', color: t.t1, fontSize: 13, fontFamily: t.disp, boxSizing: "border-box" };

    if (selectedTeam) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                <div style={{ padding: "22px 26px 0 26px" }}>
                    <button onClick={() => setSelectedTeam(null)} style={{ background: 'none', border: 'none', color: t.t3, cursor: 'pointer', fontSize: 13, marginBottom: 16, fontFamily: t.disp, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
                        ← Back to Teams
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: t.t1, margin: 0 }}>{selectedTeam.name}</h2>
                            <div style={{ fontSize: 13, color: t.t2, marginTop: 4 }}>Role: {selectedTeam.role || 'Member'}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontFamily: t.mono, fontSize: 18, fontWeight: 900, letterSpacing: 4, color: t.accent, background: t.inset, padding: '8px 16px', borderRadius: 8 }}>
                                {selectedTeam.join_code}
                            </div>
                            <button onClick={() => copyCode(selectedTeam.join_code)} style={{ background: t.accentDim, color: t.accent, border: `1px solid ${t.accent}44`, borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>
                                Copy Code
                            </button>
                        </div>
                    </div>
                </div>
                <Team t={t} team={selectedTeam} refreshTeams={fetchMyTeams} onLeave={() => setSelectedTeam(null)} />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <div style={{ padding: "22px 26px" }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: t.t1, margin: '0 0 24px 0' }}>Teams</h2>

                {/* Grid for forms */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
                    {/* Create Team */}
                    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
                        <h3 style={{ fontSize: 14, color: t.t1, marginBottom: 12, marginTop: 0, fontFamily: t.disp }}>Create a New Team</h3>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <input value={teamName} onChange={e => setTeamName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                placeholder="Enter team name..." style={inp} />
                            <button disabled={loading} onClick={handleCreate}
                                style={{ background: t.accent, color: '#000', border: 'none', borderRadius: 8, padding: '0 20px', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp }}>
                                Create
                            </button>
                        </div>
                        {newTeam && (
                            <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: `${t.accent}10`, border: `1px solid ${t.accent}30` }}>
                                <div style={{ fontSize: 11, color: t.t3, fontFamily: t.mono, marginBottom: 4 }}>TEAM CREATED ✓</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: t.t1, marginBottom: 8 }}>{newTeam.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ fontFamily: t.mono, fontSize: 22, fontWeight: 900, letterSpacing: 6, color: t.accent, background: t.inset, padding: '8px 16px', borderRadius: 8, flex: 1, textAlign: 'center' }}>
                                        {newTeam.joinCode}
                                    </div>
                                    <button onClick={() => copyCode(newTeam.joinCode)} style={{ background: t.accentDim, color: t.accent, border: `1px solid ${t.accent}44`, borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 12, whiteSpace: 'nowrap' }}>
                                        Copy Code
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Join Team */}
                    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
                        <h3 style={{ fontSize: 14, color: t.t1, marginBottom: 12, marginTop: 0, fontFamily: t.disp }}>Join an Existing Team</h3>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                                placeholder="6-digit Join Code" style={{ ...inp, fontFamily: t.mono, letterSpacing: 2 }} maxLength={6} />
                            <button disabled={loading} onClick={handleJoin}
                                style={{ background: t.inset, color: t.t1, border: `1px solid ${t.border}`, borderRadius: 8, padding: '0 20px', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp }}>
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                {/* Delegation Hierarchy Chart */}
                <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 16, color: t.t1, marginBottom: 16, marginTop: 0, fontFamily: t.disp }}>Task Delegation Hierarchy</h3>
                    <HierarchyChart t={t} />
                </div>

                {/* List of User's Teams */}
                <h3 style={{ fontSize: 16, color: t.t1, marginBottom: 16, marginTop: 0, fontFamily: t.disp }}>My Teams</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {teams.map(team => (
                        <div key={team.id} onClick={() => setSelectedTeam(team)} className="hvrC"
                            style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'all .2s' }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: t.t1, marginBottom: 4 }}>{team.name}</div>
                            <div style={{ fontSize: 12, color: t.t3, fontFamily: t.mono }}>{team.role === 'admin' ? 'Admin' : 'Member'}</div>
                        </div>
                    ))}
                    {teams.length === 0 && !loading && (
                        <div style={{ color: t.t3, fontSize: 13, gridColumn: '1 / -1', padding: '20px 0' }}>You are not in any teams yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
