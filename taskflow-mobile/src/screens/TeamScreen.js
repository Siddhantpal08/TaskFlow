import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useData } from '../context/DataContext';
import { teamApi } from '../api/team';
import { DARK as t } from '../data/themes';
import ConfirmModal from '../components/ConfirmModal';

export default function TeamScreen() {
    const { onlineUsers, tasks } = useData();
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [members, setMembers] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [teamName, setTeamName] = useState('');
    
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('success');

    // Modals
    const [deleteModal, setDeleteModal] = useState(false);
    const [leaveModal, setLeaveModal] = useState(false);
    const [removeModal, setRemoveModal] = useState(null);

    const showMsg = (text, type = 'success') => {
        setMsg(text);
        setMsgType(type);
        setTimeout(() => setMsg(''), 4000);
    };

    const fetchMyTeams = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await teamApi.getMyTeams();
            setTeams(data || []);
        } catch (e) {
            showMsg('Failed to fetch teams', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyTeams();
    }, [fetchMyTeams]);

    const fetchMembers = async (teamId) => {
        setLoading(true);
        try {
            const { data } = await teamApi.getTeamMembers(teamId);
            setMembers(data || []);
        } catch (e) {
            showMsg('Failed to fetch members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTeam = (team) => {
        setSelectedTeam(team);
        fetchMembers(team.id);
    };

    const handleCreate = async () => {
        if (!teamName.trim()) return showMsg('Team name is required', 'error');
        setLoading(true);
        try {
            await teamApi.createTeam(teamName);
            showMsg('Team created successfully!');
            setTeamName('');
            fetchMyTeams();
        } catch (e) {
            showMsg(e.message || 'Failed to create team', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) return showMsg('Join code is required', 'error');
        setLoading(true);
        try {
            await teamApi.joinTeam(joinCode);
            showMsg('Joined team successfully!');
            setJoinCode('');
            fetchMyTeams();
        } catch (e) {
            showMsg(e.message || 'Failed to join team', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeam = async () => {
        try {
            await teamApi.deleteTeam(selectedTeam.id);
            showMsg('Team deleted!');
            setDeleteModal(false);
            setSelectedTeam(null);
            fetchMyTeams();
        } catch (e) {
            showMsg(e.message || 'Failed to delete team', 'error');
        }
    };

    const handleLeaveTeam = async () => {
        try {
            await teamApi.leaveTeam(selectedTeam.id);
            showMsg('Left team successfully!');
            setLeaveModal(false);
            setSelectedTeam(null);
            fetchMyTeams();
        } catch (e) {
            showMsg(e.message || 'Failed to leave team', 'error');
        }
    };

    const handleRemoveMember = async () => {
        try {
            await teamApi.removeMember(selectedTeam.id, removeModal.id);
            showMsg('Member removed!');
            setMembers(m => m.filter(x => x.id !== removeModal.id));
            setRemoveModal(null);
        } catch (e) {
            showMsg(e.message || 'Failed to remove member', 'error');
        }
    };

    if (selectedTeam) {
        return (
            <View style={s.container}>
                {msg ? (
                    <View style={[s.msgBox, msgType === 'error' ? s.msgError : s.msgSuccess]}>
                        <Text style={[s.msgTxt, msgType === 'error' ? s.msgTxtError : s.msgTxtSuccess]}>{msg}</Text>
                    </View>
                ) : null}

                <View style={s.header}>
                    <TouchableOpacity onPress={() => setSelectedTeam(null)} style={s.backBtn}>
                        <Text style={s.backBtnTxt}>← Back</Text>
                    </TouchableOpacity>
                    <View style={s.headerRow}>
                        <View style={{flex: 1}}>
                            <Text style={s.title}>{selectedTeam.name}</Text>
                            <Text style={s.sub}>Role: {selectedTeam.role === 'admin' ? 'Admin' : 'Member'}  •  Code: {selectedTeam.join_code}</Text>
                        </View>
                        {selectedTeam.role === 'admin' ? (
                            <TouchableOpacity onPress={() => setDeleteModal(true)} style={[s.actionBtn, s.dangerBtn]}>
                                <Text style={s.dangerBtnTxt}>Delete</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setLeaveModal(true)} style={[s.actionBtn, s.dangerBtn]}>
                                <Text style={s.dangerBtnTxt}>Leave</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    {loading ? (
                        <ActivityIndicator color={t.accent} size="large" style={{ marginTop: 20 }} />
                    ) : (
                        members.map(u => {
                            const myTasks = tasks.filter(tk => tk.assigned_to === u.id);
                            const done = myTasks.filter(tk => tk.status === "done").length;
                            const pct = myTasks.length ? Math.round(done / myTasks.length * 100) : 0;
                            const isOnline = onlineUsers.has(String(u.id));

                            return (
                                <View key={u.id} style={s.card}>
                                    <View style={s.row}>
                                        {u.avatar_url ? (
                                            <Image source={{ uri: u.avatar_url }} style={s.avatar} />
                                        ) : (
                                            <View style={s.avatar}>
                                                <Text style={s.avatarTxt}>{u.avatar_initials}</Text>
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.name}>{u.name}</Text>
                                            <Text style={s.bio}>{u.role === 'admin' ? 'Admin' : 'Member'}</Text>
                                            <View style={s.statusRow}>
                                                <View style={[s.dot, { backgroundColor: isOnline ? t.green : t.border }]} />
                                                <Text style={[s.statusTxt, { color: isOnline ? t.green : t.t3 }]}>{isOnline ? 'Online' : 'Offline'}</Text>
                                            </View>
                                        </View>
                                        <View style={{ alignItems: 'flex-end', gap: 8 }}>
                                            <Text style={s.progTxt}>{done}/{myTasks.length} Tasks</Text>
                                            {selectedTeam.role === 'admin' && selectedTeam.role !== u.role && (
                                                <TouchableOpacity onPress={() => setRemoveModal({ id: u.id, name: u.name })} style={[s.actionBtn, s.dangerBtn, { paddingVertical: 4, paddingHorizontal: 10 }]}>
                                                    <Text style={[s.dangerBtnTxt, { fontSize: 10 }]}>Remove</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                    <View style={s.barBg}>
                                        <View style={[s.barFill, { width: `${pct}%` }]} />
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>

                <ConfirmModal 
                    visible={deleteModal} 
                    title="Delete Team" 
                    body={`Are you sure you want to delete ${selectedTeam?.name}?`} 
                    confirmLabel="Delete" 
                    onConfirm={handleDeleteTeam} 
                    onClose={() => setDeleteModal(false)} 
                />
                <ConfirmModal 
                    visible={leaveModal} 
                    title="Leave Team" 
                    body={`Are you sure you want to leave ${selectedTeam?.name}?`} 
                    confirmLabel="Leave" 
                    onConfirm={handleLeaveTeam} 
                    onClose={() => setLeaveModal(false)} 
                />
                <ConfirmModal 
                    visible={!!removeModal} 
                    title="Remove Member" 
                    body={`Remove ${removeModal?.name} from the team?`} 
                    confirmLabel="Remove" 
                    onConfirm={handleRemoveMember} 
                    onClose={() => setRemoveModal(null)} 
                />
            </View>
        );
    }

    return (
        <View style={s.container}>
            {msg ? (
                <View style={[s.msgBox, msgType === 'error' ? s.msgError : s.msgSuccess]}>
                    <Text style={[s.msgTxt, msgType === 'error' ? s.msgTxtError : s.msgTxtSuccess]}>{msg}</Text>
                </View>
            ) : null}

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={s.mainTitle}>My Teams</Text>

                <View style={s.formCard}>
                    <Text style={s.formTitle}>Create a New Team</Text>
                    <View style={s.formRow}>
                        <TextInput 
                            style={s.input} 
                            placeholder="Team Name" 
                            placeholderTextColor={t.t3}
                            value={teamName}
                            onChangeText={setTeamName}
                        />
                        <TouchableOpacity style={s.submitBtn} onPress={handleCreate} disabled={loading}>
                            <Text style={s.submitBtnTxt}>Create</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={s.formCard}>
                    <Text style={s.formTitle}>Join an Existing Team</Text>
                    <View style={s.formRow}>
                        <TextInput 
                            style={s.input} 
                            placeholder="6-Digit Code" 
                            placeholderTextColor={t.t3}
                            value={joinCode}
                            onChangeText={setJoinCode}
                            maxLength={6}
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity style={[s.submitBtn, { backgroundColor: t.surf, borderWidth: 1, borderColor: t.border }]} onPress={handleJoin} disabled={loading}>
                            <Text style={[s.submitBtnTxt, { color: t.t1 }]}>Join</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={[s.formTitle, { marginTop: 10, marginBottom: 15 }]}>Your Teams</Text>
                
                {loading && teams.length === 0 ? (
                    <ActivityIndicator color={t.accent} />
                ) : teams.length === 0 ? (
                    <Text style={{ color: t.t3 }}>You are not in any teams yet.</Text>
                ) : (
                    teams.map(team => (
                        <TouchableOpacity key={team.id} style={s.teamCard} onPress={() => handleSelectTeam(team)}>
                            <Text style={s.teamName}>{team.name}</Text>
                            <Text style={s.teamRole}>{team.role === 'admin' ? 'Admin' : 'Member'}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    header: { padding: 20, paddingTop: 30, backgroundColor: t.card, borderBottomWidth: 1, borderColor: t.border },
    backBtn: { marginBottom: 10 },
    backBtnTxt: { color: t.t3, fontSize: 14, fontWeight: 'bold' },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 24, fontWeight: '800', color: t.t1, marginBottom: 4 },
    sub: { fontSize: 12, color: t.t2, fontFamily: 'monospace' },
    mainTitle: { fontSize: 28, fontWeight: '900', color: t.t1, marginBottom: 20 },
    
    msgBox: { padding: 12, margin: 20, marginBottom: 0, borderRadius: 8, borderWidth: 1 },
    msgSuccess: { backgroundColor: t.green + '15', borderColor: t.green + '40' },
    msgError: { backgroundColor: t.red + '15', borderColor: t.red + '40' },
    msgTxt: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
    msgTxtSuccess: { color: t.green },
    msgTxtError: { color: t.red },

    formCard: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 16, marginBottom: 20 },
    formTitle: { fontSize: 14, fontWeight: '800', color: t.t1, marginBottom: 12 },
    formRow: { flexDirection: 'row', gap: 10 },
    input: { flex: 1, backgroundColor: t.inset, borderWidth: 1, borderColor: t.border, borderRadius: 8, padding: 12, color: t.t1, fontSize: 14 },
    submitBtn: { backgroundColor: t.accent, borderRadius: 8, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
    submitBtnTxt: { color: '#000', fontWeight: 'bold', fontSize: 14 },

    teamCard: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 20, marginBottom: 12 },
    teamName: { fontSize: 18, fontWeight: 'bold', color: t.t1, marginBottom: 4 },
    teamRole: { fontSize: 12, color: t.t3 },

    actionBtn: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1 },
    dangerBtn: { backgroundColor: t.red + '15', borderColor: t.red + '40' },
    dangerBtnTxt: { color: t.red, fontWeight: 'bold', fontSize: 12 },

    card: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 20, marginBottom: 15 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.accent + '30', justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden' },
    avatarTxt: { color: t.accent, fontWeight: 'bold', fontSize: 16 },
    bio: { fontSize: 11, color: t.t3, marginBottom: 4 },
    name: { fontSize: 16, fontWeight: 'bold', color: t.t1, marginBottom: 4 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusTxt: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    progTxt: { fontSize: 12, color: t.t1, fontWeight: 'bold' },
    barBg: { height: 6, backgroundColor: t.surf, borderRadius: 3, overflow: 'hidden' },
    barFill: { height: '100%', backgroundColor: t.accent, borderRadius: 3 }
});
