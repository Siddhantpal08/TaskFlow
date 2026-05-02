import React from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl
} from 'react-native';
import { useData } from '../context/DataContext';
import { DARK as t } from '../data/themes';

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_META = {
    task_assigned: { icon: '📋', color: t.accent },
    task_completed: { icon: '✅', color: t.green },
    task_delegated: { icon: '🔁', color: t.purple || '#B083FF' },
    event_reminder: { icon: '📅', color: t.amber },
    due_soon: { icon: '⏳', color: t.red },
    friend_request: { icon: '🤝', color: t.purple || '#B083FF' },
    friend_accepted: { icon: '👥', color: t.green },
    task_approval_requested: { icon: '⏳', color: t.amber },
    task_approved: { icon: '✅', color: t.green },
    task_rejected: { icon: '❌', color: t.red },
    system: { icon: '🔔', color: t.t3 },
};

export default function NotificationsScreen() {
    const { notifications, unreadCount, markNotifRead, markAllNotifRead, loading, refreshAll } = useData();
    const [refreshing, setRefreshing] = React.useState(false);
    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshAll();
        setRefreshing(false);
    };

    const handleMarkAllRead = () => {
        if (unreadCount === 0) return;
        Alert.alert(
            'Mark All Read',
            'Mark all notifications as read?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Mark All', onPress: markAllNotifRead, style: 'default' },
            ]
        );
    };

    const renderItem = ({ item: n }) => {
        const meta = TYPE_META[n.type] || TYPE_META.system;
        const unread = !n.is_read;

        return (
            <TouchableOpacity
                style={[s.card, unread && { borderLeftWidth: 3, borderLeftColor: meta.color }]}
                onPress={() => !n.is_read && markNotifRead(n.id)}
                activeOpacity={0.75}
            >
                <View style={[s.iconWrap, { backgroundColor: meta.color + '20' }]}>
                    <Text style={s.icon}>{meta.icon}</Text>
                </View>
                <View style={s.body}>
                    <Text style={[s.msg, unread && { color: t.t1, fontWeight: '600' }]} numberOfLines={2}>
                        {n.message}
                    </Text>
                    <Text style={s.time}>{timeAgo(n.created_at)}</Text>
                </View>
                {unread && <View style={[s.dot, { backgroundColor: meta.color }]} />}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={s.center}>
                <Text style={{ color: t.t3 }}>Loading notifications…</Text>
            </View>
        );
    }

    return (
        <View style={s.container}>
            {/* Header action */}
            <View style={s.topBar}>
                <Text style={s.topTitle}>
                    {unreadCount > 0
                        ? <Text style={{ color: t.red }}>{unreadCount} unread</Text>
                        : <Text style={{ color: t.green }}>All caught up ✓</Text>}
                </Text>
                <TouchableOpacity onPress={handleMarkAllRead} disabled={unreadCount === 0}>
                    <Text style={[s.markAll, { opacity: unreadCount === 0 ? 0.3 : 1 }]}>
                        Mark all read
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={n => String(n.id)}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                ListEmptyComponent={
                    <View style={s.empty}>
                        <Text style={s.emptyIcon}>🔔</Text>
                        <Text style={s.emptyTxt}>No notifications yet</Text>
                        <Text style={s.emptySub}>You'll see updates here when tasks are assigned or completed.</Text>
                    </View>
                }
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={t.accent} />}
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    center: { flex: 1, backgroundColor: t.bg, justifyContent: 'center', alignItems: 'center' },
    topBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: t.border,
        backgroundColor: t.nav,
    },
    topTitle: { fontSize: 13, fontWeight: '600', color: t.t2 },
    markAll: { fontSize: 13, fontWeight: '700', color: t.accent },

    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
        borderRadius: 14, padding: 14, gap: 12,
    },
    iconWrap: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    icon: { fontSize: 20 },
    body: { flex: 1 },
    msg: { fontSize: 14, color: t.t2, lineHeight: 20 },
    time: { fontSize: 11, color: t.t3, marginTop: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },

    empty: { alignItems: 'center', marginTop: 80 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTxt: { fontSize: 17, fontWeight: '700', color: t.t1, marginBottom: 6 },
    emptySub: { fontSize: 13, color: t.t3, textAlign: 'center', paddingHorizontal: 30, lineHeight: 20 },
});
