import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    Alert, Image, ActivityIndicator, RefreshControl
} from 'react-native';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DARK as t } from '../data/themes';

export default function FriendsScreen() {
    const { friends, friendRequests, sendFriendRequest, acceptFriendRequest, removeFriend, refreshFriends, loading } = useData();
    const { user } = useAuth();
    const [tab, setTab] = useState('friends'); // 'friends' | 'requests' | 'add'
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleSendRequest = async () => {
        if (!email.trim()) return;
        setSending(true);
        try {
            await sendFriendRequest(email.trim());
            Alert.alert('Sent!', 'Friend request sent successfully.');
            setEmail('');
        } catch (e) {
            Alert.alert('Error', e.message || 'Could not send friend request');
        } finally {
            setSending(false);
        }
    };

    const handleAccept = (requestId, name) => {
        Alert.alert('Accept Request', `Accept friend request from ${name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Accept', onPress: async () => {
                    try {
                        await acceptFriendRequest(requestId);
                    } catch (e) {
                        Alert.alert('Error', e.message || 'Could not accept request');
                    }
                }
            },
        ]);
    };

    const handleRemove = (friendId, name) => {
        Alert.alert('Remove Friend', `Remove ${name} from your friends?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => removeFriend(friendId) },
        ]);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshFriends();
        setRefreshing(false);
    };

    const renderFriend = ({ item: f }) => (
        <View style={s.card}>
            {f.avatar_url ? (
                <Image source={{ uri: f.avatar_url }} style={s.avatar} />
            ) : (
                <View style={s.avatar}>
                    <Text style={s.avatarTxt}>{f.avatar_initials || f.name?.[0] || '?'}</Text>
                </View>
            )}
            <View style={{ flex: 1 }}>
                <Text style={s.name}>{f.name}</Text>
                <Text style={s.email}>{f.email}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <View style={[s.dot, { backgroundColor: f.is_online ? t.green : t.border }]} />
                    <Text style={[s.statusTxt, { color: f.is_online ? t.green : t.t3 }]}>
                        {f.is_online ? 'Online' : 'Offline'}
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleRemove(f.id, f.name)} style={s.removeBtn}>
                <Text style={s.removeTxt}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    const renderRequest = ({ item: r }) => (
        <View style={s.card}>
            {r.avatar_url ? (
                <Image source={{ uri: r.avatar_url }} style={s.avatar} />
            ) : (
                <View style={s.avatar}>
                    <Text style={s.avatarTxt}>{r.avatar_initials || r.name?.[0] || '?'}</Text>
                </View>
            )}
            <View style={{ flex: 1 }}>
                <Text style={s.name}>{r.name}</Text>
                <Text style={s.email}>{r.email}</Text>
            </View>
            <TouchableOpacity onPress={() => handleAccept(r.request_id, r.name)} style={s.acceptBtn}>
                <Text style={s.acceptTxt}>Accept</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={s.container}>
            {/* Tabs */}
            <View style={s.tabBar}>
                {[
                    { id: 'friends', label: `Friends (${friends.length})` },
                    { id: 'requests', label: `Requests${friendRequests.length > 0 ? ` (${friendRequests.length})` : ''}` },
                    { id: 'add', label: '+ Add' },
                ].map(tb => (
                    <TouchableOpacity
                        key={tb.id}
                        onPress={() => setTab(tb.id)}
                        style={[s.tab, tab === tb.id && s.tabActive]}
                    >
                        <Text style={[s.tabTxt, tab === tb.id && s.tabTxtActive]}>{tb.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {tab === 'friends' && (
                <FlatList
                    data={friends}
                    keyExtractor={f => String(f.id)}
                    renderItem={renderFriend}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />}
                    ListEmptyComponent={
                        <View style={s.empty}>
                            <Text style={s.emptyIcon}>👥</Text>
                            <Text style={s.emptyTxt}>No friends yet</Text>
                            <Text style={s.emptySub}>Use the "+ Add" tab to send friend requests.</Text>
                        </View>
                    }
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                />
            )}

            {tab === 'requests' && (
                <FlatList
                    data={friendRequests}
                    keyExtractor={r => String(r.request_id)}
                    renderItem={renderRequest}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />}
                    ListEmptyComponent={
                        <View style={s.empty}>
                            <Text style={s.emptyIcon}>📨</Text>
                            <Text style={s.emptyTxt}>No pending requests</Text>
                            <Text style={s.emptySub}>You'll see incoming friend requests here.</Text>
                        </View>
                    }
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                />
            )}

            {tab === 'add' && (
                <View style={{ padding: 20 }}>
                    <Text style={s.addTitle}>Send Friend Request</Text>
                    <Text style={s.addSub}>Enter the email address of the person you want to connect with.</Text>
                    <TextInput
                        style={s.inp}
                        placeholder="Email address"
                        placeholderTextColor={t.t3}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={handleSendRequest} disabled={sending} style={s.sendBtn}>
                        {sending ? <ActivityIndicator color="#000" /> : <Text style={s.sendTxt}>Send Request</Text>}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    tabBar: {
        flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: t.border,
        backgroundColor: t.nav,
    },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabActive: { borderBottomWidth: 2, borderBottomColor: t.accent },
    tabTxt: { fontSize: 12, fontWeight: '700', color: t.t3 },
    tabTxtActive: { color: t.accent },
    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
        borderRadius: 14, padding: 14, gap: 12,
    },
    avatar: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: t.accent + '30', justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden',
    },
    avatarTxt: { color: t.accent, fontWeight: '900', fontSize: 18 },
    name: { fontSize: 15, fontWeight: '700', color: t.t1 },
    email: { fontSize: 12, color: t.t3, marginTop: 2 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
    statusTxt: { fontSize: 11, fontWeight: '600' },
    removeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: t.red + '15', borderWidth: 1, borderColor: t.red + '40' },
    removeTxt: { color: t.red, fontSize: 12, fontWeight: '700' },
    acceptBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: t.accent + '15', borderWidth: 1, borderColor: t.accent + '40' },
    acceptTxt: { color: t.accent, fontSize: 12, fontWeight: '700' },
    empty: { alignItems: 'center', marginTop: 80 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTxt: { fontSize: 17, fontWeight: '700', color: t.t1, marginBottom: 6 },
    emptySub: { fontSize: 13, color: t.t3, textAlign: 'center', paddingHorizontal: 30, lineHeight: 20 },
    addTitle: { fontSize: 20, fontWeight: '800', color: t.t1, marginBottom: 8, letterSpacing: -0.4 },
    addSub: { fontSize: 13, color: t.t3, marginBottom: 20, lineHeight: 19 },
    inp: {
        backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 12,
        padding: 14, color: t.t1, fontSize: 14, marginBottom: 14,
    },
    sendBtn: { backgroundColor: t.accent, borderRadius: 12, padding: 14, alignItems: 'center' },
    sendTxt: { color: '#000', fontWeight: '800', fontSize: 15 },
});
