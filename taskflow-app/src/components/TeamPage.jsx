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
            toastSuccess(`Team created! Join code: ${data.joinCode}`);
            setTeamName("");
            refreshTeams();
        } catch (e) {
            toastError(e.message || "Failed to create team");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <div style={{ padding: "22px 26px 0 26px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Create Team */}
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: 14, color: t.t1, marginBottom: 12, marginTop: 0, fontFamily: t.disp }}>Create a New Team</h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Enter team name..." style={{ flex: 1, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px', color: t.t1, fontSize: 13, fontFamily: t.disp, boxSizing: "border-box" }} />
                        <button disabled={loading} onClick={handleCreate} style={{ background: t.accent, color: '#000', border: 'none', borderRadius: 8, padding: '0 20px', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp }}>Create</button>
                    </div>
                </div>

                {/* Join Team */}
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: 14, color: t.t1, marginBottom: 12, marginTop: 0, fontFamily: t.disp }}>Join an Existing Team</h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="6-digit Join Code" style={{ flex: 1, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px', color: t.t1, fontSize: 13, fontFamily: t.mono, letterSpacing: 2, textTransform: 'uppercase', boxSizing: "border-box" }} maxLength={6} />
                        <button disabled={loading} onClick={handleJoin} style={{ background: t.inset, color: t.t1, border: `1px solid ${t.border}`, borderRadius: 8, padding: '0 20px', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp }}>Join</button>
                    </div>
                </div>
            </div>

            <Team t={t} />
        </div>
    );
}
