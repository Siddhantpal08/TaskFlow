import { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { teamApi } from '../api/team.js';
import { toastError, toastSuccess } from './ui/Toast.jsx';
import Team from './Team.jsx';

export default function TeamPage({ t }) {
    const { refreshTeams } = useData();
    const [joinCode, setJoinCode] = useState("");
    const [teamName, setTeamName] = useState("");
    const [loading, setLoading] = useState(false);
    const [newTeam, setNewTeam] = useState(null); // holds result after creation

    const handleJoin = async () => {
        if (!joinCode.trim()) return toastError("Please enter a valid join code.");
        setLoading(true);
        try {
            await teamApi.joinTeam(joinCode);
            toastSuccess("Joined team successfully!");
            setJoinCode("");
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
            refreshTeams();
            toastSuccess("Team created successfully!");
        } catch (e) {
            toastError(e.message || "Failed to create team");
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        if (newTeam?.joinCode) {
            navigator.clipboard.writeText(newTeam.joinCode);
            toastSuccess("Join code copied!");
        }
    };

    const inp = { flex: 1, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px', color: t.t1, fontSize: 13, fontFamily: t.disp, boxSizing: "border-box" };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <div style={{ padding: "22px 26px 0 26px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
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
                    {/* Persistent join code card after creation */}
                    {newTeam && (
                        <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: `${t.accent}10`, border: `1px solid ${t.accent}30` }}>
                            <div style={{ fontSize: 11, color: t.t3, fontFamily: t.mono, marginBottom: 4 }}>TEAM CREATED ✓</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: t.t1, marginBottom: 8 }}>{newTeam.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ fontFamily: t.mono, fontSize: 22, fontWeight: 900, letterSpacing: 6, color: t.accent, background: t.inset, padding: '8px 16px', borderRadius: 8, flex: 1, textAlign: 'center' }}>
                                    {newTeam.joinCode}
                                </div>
                                <button onClick={copyCode} style={{ background: t.accentDim, color: t.accent, border: `1px solid ${t.accent}44`, borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 12, whiteSpace: 'nowrap' }}>
                                    Copy Code
                                </button>
                            </div>
                            <div style={{ fontSize: 11, color: t.t3, marginTop: 8 }}>Share this code with teammates to let them join.</div>
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

            <Team t={t} />
        </div>
    );
}
