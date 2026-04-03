import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DARK as t } from '../data/themes';

const APP_VERSION = '1.0.0';

function InfoRow({ label, value }) {
    return (
        <View style={s.infoRow}>
            <Text style={s.infoLabel}>{label}</Text>
            <Text style={s.infoValue}>{value || '—'}</Text>
        </View>
    );
}

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { tasks } = useData();

    const done = tasks.filter(t => t.status === 'done').length;
    const total = tasks.length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
            ]
        );
    };

    return (
        <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>

            {/* Avatar Card */}
            <View style={s.avatarCard}>
                <View style={s.avatarLarge}>
                    <Text style={s.avatarTxt}>{user?.avatar_initials || 'U'}</Text>
                </View>
                <Text style={s.userName}>{user?.name}</Text>
                <Text style={s.userEmail}>{user?.email}</Text>
                <View style={s.rolePill}>
                    <Text style={s.roleText}>{user?.role || 'Member'}</Text>
                </View>
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

            {/* Account Info */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>Account Info</Text>
                <InfoRow label="Name" value={user?.name} />
                <InfoRow label="Email" value={user?.email} />
                <InfoRow label="Bio" value={user?.bio} />
                <InfoRow label="Role" value={user?.role} />
                <InfoRow label="Member Since" value={user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                    : null} />
            </View>

            {/* App Info */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>App Info</Text>
                <InfoRow label="App" value="TaskFlow" />
                <InfoRow label="Version" value={APP_VERSION} />
                <InfoRow label="Platform" value="React Native (Expo)" />
                <InfoRow label="Backend" value="Node.js + MySQL + Socket.IO" />
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

    // Avatar
    avatarCard: {
        alignItems: 'center', backgroundColor: t.card,
        borderWidth: 1, borderColor: t.border, borderRadius: 20,
        padding: 30, marginBottom: 20,
    },
    avatarLarge: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: t.accent + '30', borderWidth: 2.5, borderColor: t.accent + '60',
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    avatarTxt: { fontSize: 28, fontWeight: '900', color: t.accent },
    userName: { fontSize: 22, fontWeight: '800', color: t.t1, letterSpacing: -0.4, marginBottom: 4 },
    userEmail: { fontSize: 14, color: t.t3, marginBottom: 12 },
    rolePill: { backgroundColor: t.accent + '20', borderWidth: 1, borderColor: t.accent + '40', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
    roleText: { color: t.accent, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Progress
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

    // Info rows
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.border },
    infoLabel: { fontSize: 13, color: t.t3, fontWeight: '600' },
    infoValue: { fontSize: 13, color: t.t1, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },

    // Logout
    logoutBtn: {
        backgroundColor: t.red + '20', borderWidth: 1, borderColor: t.red + '40',
        borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8,
    },
    logoutTxt: { color: t.red, fontWeight: '800', fontSize: 15 },
});
