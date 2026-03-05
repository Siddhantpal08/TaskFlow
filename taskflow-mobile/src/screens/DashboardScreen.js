import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DARK as t } from '../data/themes';

function fmtDate(d) {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { tasks, events, teamMembers, onlineUsers, loading } = useData();

    const done = tasks.filter(x => x.status === "done").length;
    const total = tasks.length;
    const delegated = tasks.filter(x => x.parent_task_id).length;
    const dueSoon = tasks.filter(x => {
        if (!x.due_date || x.status === 'done') return false;
        const diff = (new Date(x.due_date) - new Date()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 2;
    }).length;

    const firstName = user?.name?.split(' ')[0] || 'there';

    if (loading) {
        return <View style={s.center}><Text style={{ color: t.t3 }}>Loading dashboard…</Text></View>;
    }

    return (
        <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

            {/* Header / Welcome */}
            <View style={s.header}>
                <View style={{ flex: 1 }}>
                    <Text style={s.greeting}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName} 👋</Text>
                    <Text style={s.subgreeting}>
                        <Text style={{ color: t.red, fontWeight: 'bold' }}>{dueSoon} tasks due soon</Text>{' · '}
                        <Text style={{ color: t.accent, fontWeight: 'bold' }}>{tasks.filter(x => x.status === 'pending').length} awaiting action</Text>
                    </Text>
                </View>
                <TouchableOpacity onPress={logout} style={s.avatar}>
                    <Text style={s.avatarTxt}>{user?.avatar_initials}</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={s.statsGrid}>
                <View style={s.statCard}>
                    <Text style={[s.statVal, { color: t.accent }]}>{total}</Text>
                    <Text style={s.statLbl}>Total Tasks</Text>
                </View>
                <View style={s.statCard}>
                    <Text style={[s.statVal, { color: t.green }]}>{done}</Text>
                    <Text style={s.statLbl}>Completed</Text>
                </View>
                <View style={s.statCard}>
                    <Text style={[s.statVal, { color: t.amber }]}>{delegated}</Text>
                    <Text style={s.statLbl}>Delegated</Text>
                </View>
                <View style={s.statCard}>
                    <Text style={[s.statVal, { color: t.red }]}>{dueSoon}</Text>
                    <Text style={s.statLbl}>Due Soon</Text>
                </View>
            </View>

            {/* Recent Tasks */}
            <View style={s.section}>
                <View style={s.secHeader}>
                    <Text style={s.secTitle}>Recent Tasks</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                        <Text style={s.secLink}>See All</Text>
                    </TouchableOpacity>
                </View>
                {tasks.length === 0 && <Text style={s.empty}>No tasks yet.</Text>}
                {tasks.slice(0, 4).map(tk => (
                    <View key={tk.id} style={s.taskRow}>
                        <View style={[s.dot, { backgroundColor: tk.status === 'done' ? t.green : tk.status === 'active' ? t.accent : t.border }]} />
                        <View style={{ flex: 1 }}>
                            <Text style={[s.tkTitle, tk.status === 'done' && { textDecorationLine: 'line-through', opacity: 0.5 }]} numberOfLines={1}>
                                {tk.title}
                            </Text>
                            <Text style={s.tkSub}>due {fmtDate(tk.due_date)}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Upcoming Events */}
            <View style={s.section}>
                <Text style={s.secTitle}>Upcoming</Text>
                {events.length === 0 && <Text style={s.empty}>No events yet.</Text>}
                {events.slice(0, 3).map(ev => {
                    const d = new Date(ev.event_date);
                    const mth = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    const day = d.getDate();
                    const colors = [t.red, t.accent, t.green, t.purple, t.amber];
                    const c = colors[ev.id % colors.length];
                    return (
                        <View key={ev.id} style={s.evRow}>
                            <View style={[s.evDate, { backgroundColor: c + '15', borderColor: c + '40' }]}>
                                <Text style={[s.evMth, { color: c }]}>{mth}</Text>
                                <Text style={[s.evDay, { color: c }]}>{day}</Text>
                            </View>
                            <View>
                                <Text style={s.evTitle}>{ev.title}</Text>
                                <Text style={s.evTime}>{ev.event_time ? ev.event_time.slice(0, 5) : 'All day'}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>

        </ScrollView>
    );
}

const s = StyleSheet.create({
    center: { flex: 1, backgroundColor: t.bg, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: t.bg },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    greeting: { fontSize: 22, fontWeight: '800', color: t.t1, letterSpacing: -0.5 },
    subgreeting: { fontSize: 13, marginTop: 4 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.accent + '40', borderWidth: 2, borderColor: t.accent + '40', justifyContent: 'center', alignItems: 'center' },
    avatarTxt: { color: t.accent, fontWeight: 'bold', fontSize: 16 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
    statCard: { width: '48%', backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 12, padding: 16, marginBottom: 15 },
    statVal: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    statLbl: { fontSize: 12, fontWeight: 'bold', color: t.t1, marginTop: 4 },
    section: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 12, padding: 16, marginBottom: 20 },
    secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    secTitle: { fontSize: 16, fontWeight: 'bold', color: t.t1, marginBottom: 15 },
    secLink: { color: t.accent, fontSize: 13, fontWeight: 'bold' },
    empty: { color: t.t3, fontSize: 13, textAlign: 'center', marginVertical: 10 },
    taskRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: t.border, paddingVertical: 12 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
    tkTitle: { fontSize: 14, fontWeight: '600', color: t.t1 },
    tkSub: { fontSize: 11, color: t.t3, marginTop: 2 },
    evRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: t.border, paddingVertical: 12 },
    evDate: { width: 46, borderRadius: 8, borderWidth: 1, paddingVertical: 6, alignItems: 'center', marginRight: 15 },
    evMth: { fontSize: 10, fontWeight: 'bold' },
    evDay: { fontSize: 18, fontWeight: '900' },
    evTitle: { fontSize: 14, fontWeight: '600', color: t.t1 },
    evTime: { fontSize: 11, color: t.t3, marginTop: 2 },
});
