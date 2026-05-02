import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
    Modal, TextInput, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { teamApi } from '../api/team';
import { DARK as t } from '../data/themes';

export default function TeamScreen() {
    const { teamMembers, onlineUsers, tasks, loading, refreshAll } = useData();
    const { user } = useAuth();

    const [refreshing, setRefreshing] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [saving, setSaving] = useState(false);
    const [newTeamCode, setNewTeamCode] = useState(null);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshAll();
        setRefreshing(false);
    };

    const handleCreateTeam = async () => {
        if (!teamName.trim()) return Alert.alert('Error', 'Team name is required.');
        setSaving(true);
        try {
            const res = await teamApi.createTeam(teamName.trim());
            const code = res.data?.join_code || res.data?.joinCode;
            setNewTeamCode(code);
            setTeamName('');
            await refreshAll();
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to create team');
        } finally {
            setSaving(false);
        }
    };

    const handleJoinTeam = async () => {
        if (!joinCode.trim()) return Alert.alert('Error', 'Enter a join code.');
        setSaving(true);
        try {
            await teamApi.joinTeam(joinCode.trim().toUpperCase());
            Alert.alert('Success', 'Joined team!');
            setJoinCode('');
            setShowJoin(false);
            await refreshAll();
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to join team');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveMember = (teamId, memberId, memberName) => {
        Alert.alert('Remove Member', `Remove ${memberName} from the team?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive', onPress: async () => {
                    try {
                        await teamApi.removeMember(teamId, memberId);
                        Alert.alert('Done', `${memberName} removed.`);
                        await refreshAll();
                    } catch (e) {
                        Alert.alert('Error', e.message || 'Failed to remove member');
                    }
                }
            }
        ]);
    };

    return (
        <ScrollView
            style={s.container}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={t.accent} />}
        >
            <Text style={s.title}>Team</Text>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                <TouchableOpacity onPress={() => setShowCreate(true)} style={[s.actionBtn, { flex: 1, backgroundColor: t.accent }]}>
                    <Text style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>+ Create Team</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowJoin(true)} style={[s.actionBtn, { flex: 1, borderWidth: 1, borderColor: t.border, backgroundColor: 'transparent' }]}>
                    <Text style={{ color: t.t1, fontWeight: '700', fontSize: 13 }}>🔑 Join Team</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color={t.accent} style={{ marginTop: 40 }} />
            ) : teamMembers.length === 0 ? (
                <View style={s.empty}>
                    <Text style={{ fontSize: 40, marginBottom: 12 }}>👥</Text>
                    <Text style={{ color: t.t2, fontSize: 16, fontWeight: '700', marginBottom: 6 }}>No Team Yet</Text>
                    <Text style={{ color: t.t3, fontSize: 13, textAlign: 'center' }}>Create or join a team to see members here.</Text>
                </View>
            ) : (
                teamMembers.map(u => {
                    const myTasks = tasks.filter(tk => tk.assigned_to === u.id);
                    const done = myTasks.filter(tk => tk.status === 'done').length;
                    const pct = myTasks.length ? Math.round(done / myTasks.length * 100) : 0;
                    // Show self as always online; others use socket
                    const isMe = u.id === user?.id;
                    const isOnline = isMe || onlineUsers.has(String(u.id));

                    return (
                        <View key={u.id} style={s.card}>
                            <View style={s.row}>
                                {u.avatar_url ? (
                                    <Image source={{ uri: u.avatar_url }} style={[s.avatar, isMe && { borderWidth: 2, borderColor: t.accent }]} />
                                ) : (
                                    <View style={[s.avatar, isMe && { borderWidth: 2, borderColor: t.accent }]}>
                                        <Text style={s.avatarTxt}>{u.avatar_initials || u.name?.[0] || '?'}</Text>
                                    </View>
                                )}
                                <View style={{ flex: 1 }}>
                                    <Text style={s.name}>{u.name}{isMe ? ' (You)' : ''}</Text>
                                    {u.bio ? <Text style={s.bio} numberOfLines={1}>{u.bio}</Text> : null}
                                    <View style={s.statusRow}>
                                        <View style={[s.dot, { backgroundColor: isOnline ? t.green : t.border }]} />
                                        <Text style={[s.statusTxt, { color: isOnline ? t.green : t.t3 }]}>{isOnline ? 'Online' : 'Offline'}</Text>
                                    </View>
                                </View>
                                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                                    <Text style={s.progTxt}>{done}/{myTasks.length} Tasks</Text>
                                    {!isMe && (
                                        <TouchableOpacity onPress={() => handleRemoveMember(u.team_id, u.id, u.name)}
                                            style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: t.red + '55', backgroundColor: t.red + '10' }}>
                                            <Text style={{ color: t.red, fontSize: 11, fontWeight: '700' }}>Remove</Text>
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

            {/* Create Team Modal */}
            <Modal visible={showCreate} animationType="slide" transparent>
                <View style={s.modalBg}>
                    <View style={s.modalCard}>
                        <Text style={s.modalTitle}>Create a Team</Text>
                        <TextInput
                            style={s.inp} placeholder="Team name" placeholderTextColor={t.t3}
                            value={teamName} onChangeText={setTeamName}
                        />
                        {newTeamCode && (
                            <View style={{ backgroundColor: t.accent + '15', borderRadius: 10, padding: 14, marginBottom: 14, alignItems: 'center' }}>
                                <Text style={{ color: t.t3, fontSize: 12, marginBottom: 4 }}>Your team join code:</Text>
                                <Text style={{ color: t.accent, fontSize: 26, fontWeight: '900', letterSpacing: 4 }}>{newTeamCode}</Text>
                                <Text style={{ color: t.t3, fontSize: 11, marginTop: 4 }}>Share this with your teammates</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity onPress={() => { setShowCreate(false); setNewTeamCode(null); }} style={[s.btn, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: t.border }]}>
                                <Text style={{ color: t.t2, fontWeight: '700' }}>Close</Text>
                            </TouchableOpacity>
                            {!newTeamCode && (
                                <TouchableOpacity onPress={handleCreateTeam} disabled={saving} style={[s.btn, { flex: 1, backgroundColor: t.accent }]}>
                                    {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={{ color: '#000', fontWeight: '800' }}>Create</Text>}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Join Team Modal */}
            <Modal visible={showJoin} animationType="slide" transparent>
                <View style={s.modalBg}>
                    <View style={s.modalCard}>
                        <Text style={s.modalTitle}>Join a Team</Text>
                        <TextInput
                            style={[s.inp, { letterSpacing: 4, fontWeight: '700', textTransform: 'uppercase' }]}
                            placeholder="6-digit code" placeholderTextColor={t.t3}
                            value={joinCode} onChangeText={v => setJoinCode(v.toUpperCase())}
                            maxLength={6} autoCapitalize="characters"
                        />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity onPress={() => { setShowJoin(false); setJoinCode(''); }} style={[s.btn, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: t.border }]}>
                                <Text style={{ color: t.t2, fontWeight: '700' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleJoinTeam} disabled={saving} style={[s.btn, { flex: 1, backgroundColor: t.accent }]}>
                                {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={{ color: '#000', fontWeight: '800' }}>Join</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.bg },
    title: { fontSize: 26, fontWeight: '900', color: t.t1, marginBottom: 20, letterSpacing: -0.5 },
    empty: { alignItems: 'center', marginTop: 40 },
    actionBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    card: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 20, marginBottom: 15 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: t.accent + '30', justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden' },
    avatarTxt: { color: t.accent, fontWeight: 'bold', fontSize: 18 },
    bio: { fontSize: 11, color: t.t3, marginBottom: 4 },
    name: { fontSize: 16, fontWeight: 'bold', color: t.t1, marginBottom: 4 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusTxt: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    progTxt: { fontSize: 12, color: t.t1, fontWeight: 'bold' },
    barBg: { height: 6, backgroundColor: t.surf, borderRadius: 3, overflow: 'hidden' },
    barFill: { height: '100%', backgroundColor: t.accent, borderRadius: 3 },
    modalBg: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 20, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: t.t1, marginBottom: 18 },
    inp: { backgroundColor: t.surf, borderWidth: 1, borderColor: t.border, borderRadius: 12, padding: 14, color: t.t1, marginBottom: 14, fontSize: 16 },
    btn: { paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
});
