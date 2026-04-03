import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useData } from '../context/DataContext';
import { DARK as t } from '../data/themes';

export default function TeamScreen() {
    const { teamMembers, onlineUsers, tasks, loading } = useData();

    if (loading) {
        return <View style={s.center}><Text style={{ color: t.t3 }}>Loading team…</Text></View>;
    }

    return (
        <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }}>
            <Text style={s.title}>Team Members</Text>

            {teamMembers.map(u => {
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
                                {u.bio ? <Text style={s.bio} numberOfLines={1}>{u.bio}</Text> : null}
                                <View style={s.statusRow}>
                                    <View style={[s.dot, { backgroundColor: isOnline ? t.green : t.border }]} />
                                    <Text style={[s.statusTxt, { color: isOnline ? t.green : t.t3 }]}>{isOnline ? 'Online' : 'Offline'}</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={s.progTxt}>{done}/{myTasks.length} Tasks</Text>
                            </View>
                        </View>
                        <View style={s.barBg}>
                            <View style={[s.barFill, { width: `${pct}%` }]} />
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '800', color: t.t1, marginBottom: 20, letterSpacing: -0.5 },
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
    barFill: { height: '100%', backgroundColor: t.accent, borderRadius: 3 }
});
