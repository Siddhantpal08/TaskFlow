import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, TextInput, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { DARK as t } from '../data/themes';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});
import ConfirmModal from '../components/ConfirmModal';

const APP_VERSION = '1.0.0';

export default function ProfileScreen() {
    const { user, logout, updateUser, changePassword } = useAuth();
    const { tasks } = useData();

    const done = tasks.filter(tk => tk.status === 'done').length;
    const total = tasks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [saving, setSaving] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [changingPwd, setChangingPwd] = useState(false);

    // Messages
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('success');

    // Modals
    const [logoutModal, setLogoutModal] = useState(false);

    const showMsg = (text, type = 'success') => {
        setMsg(text);
        setMsgType(type);
        setTimeout(() => setMsg(''), 4000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (updateUser) await updateUser({ name, bio });
            setEditing(false);
            showMsg('Profile updated!');
        } catch (e) {
            showMsg(e.message || 'Update failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) return showMsg('Please fill all password fields', 'error');
        setChangingPwd(true);
        try {
            const res = await changePassword(currentPassword, newPassword);
            if (res.success || res.status === 'success') {
                showMsg('Password updated successfully!');
                setCurrentPassword('');
                setNewPassword('');
            } else {
                showMsg(res.message || 'Failed to update password', 'error');
            }
        } catch (e) {
            showMsg(e.message || 'Failed to update password', 'error');
        } finally {
            setChangingPwd(false);
        }
    };

    const testNotification = async () => {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "You've got mail! 📬",
                body: 'This is a test system notification from TaskFlow.',
                data: { data: 'goes here' },
            },
            trigger: { seconds: 2 },
        });
    };

    const handleLogout = async () => {
        setLogoutModal(false);
        await logout();
    };

    return (
        <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            {msg ? (
                <View style={[s.msgBox, msgType === 'error' ? s.msgError : s.msgSuccess]}>
                    <Text style={[s.msgTxt, msgType === 'error' ? s.msgTxtError : s.msgTxtSuccess]}>{msg}</Text>
                </View>
            ) : null}

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

            {/* Security Settings */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>Security</Text>
                <View style={{ marginBottom: 12 }}>
                    <Text style={s.label}>Current Password</Text>
                    <TextInput
                        style={s.input}
                        secureTextEntry
                        placeholder="••••••••"
                        placeholderTextColor={t.t3}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />
                </View>
                <View style={{ marginBottom: 16 }}>
                    <Text style={s.label}>New Password</Text>
                    <TextInput
                        style={s.input}
                        secureTextEntry
                        placeholder="••••••••"
                        placeholderTextColor={t.t3}
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                </View>
                <TouchableOpacity onPress={handleChangePassword} disabled={changingPwd} style={[s.editBtn, { width: '100%', marginBottom: 16 }]}>
                    {changingPwd ? <ActivityIndicator color="#000" size="small" /> : <Text style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>Update Password</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={s.actionRow} onPress={testNotification}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="notifications-outline" size={20} color={t.accent} style={{ marginRight: 15 }} />
                        <Text style={[s.actionTxt, { color: t.accent }]}>Test System Notification</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={t.t3} />
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity style={s.logoutBtn} onPress={() => setLogoutModal(true)}>
                <Ionicons name="log-out-outline" size={20} color={t.red} style={{ marginRight: 8 }} />
                <Text style={s.logoutTxt}>Logout</Text>
            </TouchableOpacity>

            <ConfirmModal 
                visible={logoutModal} 
                title="Logout" 
                body="Are you sure you want to log out?" 
                confirmLabel="Logout" 
                onConfirm={handleLogout} 
                onClose={() => setLogoutModal(false)} 
            />
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
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16, backgroundColor: t.red + '15',
        borderWidth: 1, borderColor: t.red + '30', borderRadius: 16,
        marginBottom: 40,
    },
    logoutTxt: { color: t.red, fontWeight: '800', fontSize: 16 },
    msgBox: { padding: 12, marginBottom: 20, borderRadius: 8, borderWidth: 1 },
    msgSuccess: { backgroundColor: t.green + '15', borderColor: t.green + '40' },
    msgError: { backgroundColor: t.red + '15', borderColor: t.red + '40' },
    msgTxt: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
    msgTxtSuccess: { color: t.green },
    msgTxtError: { color: t.red },
    label: { fontSize: 11, color: t.t3, textTransform: 'uppercase', marginBottom: 6, fontWeight: '700' },
    input: { backgroundColor: t.inset, borderWidth: 1, borderColor: t.border, borderRadius: 10, padding: 12, color: t.t1, fontSize: 14 }
});
