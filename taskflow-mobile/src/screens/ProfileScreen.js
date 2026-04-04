import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, Image, TextInput, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DARK as t } from '../data/themes';

const APP_VERSION = '1.0.0';

export default function ProfileScreen() {
    const { user, logout, updateUser } = useAuth();
    const { tasks } = useData();

    const done = tasks.filter(tk => tk.status === 'done').length;
    const total = tasks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (updateUser) await updateUser({ name, bio });
            setEditing(false);
        } catch (e) {
            Alert.alert('Error', e.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>

            {/* Avatar Card */}
            <View style={s.avatarCard}>
                {user?.avatar_url ? (
                    <Image source={{ uri: user.avatar_url }} style={s.avatarLarge} />
                ) : (
                    <View style={s.avatarLarge}>
                        <Text style={s.avatarTxt}>{user?.avatar_initials || user?.name?.[0] || 'U'}</Text>
                    </View>
                )}

                {editing ? (
                    <TextInput
                        style={s.editName}
                        value={name}
                        onChangeText={setName}
                        placeholder="Your name"
                        placeholderTextColor={t.t3}
                    />
                ) : (
                    <Text style={s.userName}>{user?.name}</Text>
                )}
                <Text style={s.userEmail}>{user?.email}</Text>

                {editing ? (
                    <TextInput
                        style={[s.editName, { fontSize: 13, color: t.t2, marginTop: 6 }]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Your bio (optional)"
                        placeholderTextColor={t.t3}
                        multiline
                    />
                ) : (
                    user?.bio ? <Text style={s.bioTxt}>{user.bio}</Text> : null
                )}

                {editing ? (
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                        <TouchableOpacity
                            onPress={() => { setName(user?.name || ''); setBio(user?.bio || ''); setEditing(false); }}
                            style={[s.editBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.border }]}>
                            <Text style={{ color: t.t2, fontWeight: '700', fontSize: 13 }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} disabled={saving} style={s.editBtn}>
                            {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => setEditing(true)} style={[s.editBtn, { marginTop: 14, backgroundColor: 'transparent', borderWidth: 1, borderColor: t.border }]}>
                        <Text style={{ color: t.t1, fontWeight: '700', fontSize: 13 }}>✏️ Edit Profile</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Task Progress */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>My Progress</Text>
                <View style={s.statsRow}>
                    <View style={s.statBox}>
                        <Text style={[s.statVal, { color: t.accent }]}>{total}</Text>
                        <Text style={s.statLbl}>Total Tasks</Text>
                    </View>
                    <View style={s.statBox}>
                        <Text style={[s.statVal, { color: t.green }]}>{done}</Text>
                        <Text style={s.statLbl}>Completed</Text>
                    </View>
                    <View style={s.statBox}>
                        <Text style={[s.statVal, { color: t.amber }]}>{pct}%</Text>
                        <Text style={s.statLbl}>Done Rate</Text>
                    </View>
                </View>
                <View style={s.progBg}>
                    <View style={[s.progFill, { width: `${pct}%` }]} />
                </View>
            </View>

            {/* App Info */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>App Info</Text>
                <View style={s.infoRow}>
                    <Text style={s.infoLabel}>Version</Text>
                    <Text style={s.infoValue}>{APP_VERSION}</Text>
                </View>
                <View style={s.infoRow}>
                    <Text style={s.infoLabel}>Platform</Text>
                    <Text style={s.infoValue}>React Native (Expo)</Text>
                </View>
            </View>

            {/* Logout */}
            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                <Text style={s.logoutTxt}>⏻  Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    avatarCard: {
        alignItems: 'center', backgroundColor: t.card,
        borderWidth: 1, borderColor: t.border, borderRadius: 20,
        padding: 30, marginBottom: 20,
    },
    avatarLarge: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: t.accent + '30', borderWidth: 2.5, borderColor: t.accent + '60',
        justifyContent: 'center', alignItems: 'center', marginBottom: 14, overflow: 'hidden',
    },
    avatarTxt: { fontSize: 32, fontWeight: '900', color: t.accent },
    userName: { fontSize: 22, fontWeight: '800', color: t.t1, letterSpacing: -0.4, marginBottom: 4 },
    userEmail: { fontSize: 14, color: t.t3, marginBottom: 4 },
    bioTxt: { fontSize: 13, color: t.t2, textAlign: 'center', marginTop: 6 },
    editName: {
        backgroundColor: t.surf, borderWidth: 1, borderColor: t.border,
        borderRadius: 10, padding: 10, color: t.t1, fontSize: 16, fontWeight: '700',
        width: '100%', marginTop: 8, textAlign: 'center',
    },
    editBtn: { backgroundColor: t.accent, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 9, alignItems: 'center' },
    section: {
        backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
        borderRadius: 16, padding: 20, marginBottom: 16,
    },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: t.t1, marginBottom: 16, letterSpacing: -0.3 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
    statBox: { alignItems: 'center' },
    statVal: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
    statLbl: { fontSize: 11, color: t.t3, marginTop: 2, fontWeight: '600' },
    progBg: { height: 6, backgroundColor: t.surf || t.border, borderRadius: 3, overflow: 'hidden' },
    progFill: { height: '100%', backgroundColor: t.accent, borderRadius: 3 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.border },
    infoLabel: { fontSize: 13, color: t.t3, fontWeight: '600' },
    infoValue: { fontSize: 13, color: t.t1, fontWeight: '600' },
    logoutBtn: {
        backgroundColor: t.red + '20', borderWidth: 1, borderColor: t.red + '40',
        borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8,
    },
    logoutTxt: { color: t.red, fontWeight: '800', fontSize: 15 },
});
