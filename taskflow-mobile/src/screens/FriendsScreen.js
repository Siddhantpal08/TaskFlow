import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    Image, ActivityIndicator, RefreshControl, Modal
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
    const [delModal, setDelModal] = useState({ visible: false, id: null, name: '' });
    const [acceptModal, setAcceptModal] = useState({ visible: false, id: null, name: '' });

    const handleSendRequest = async () => {
        if (!email.trim()) return;
        setSending(true);
        try {
            await sendFriendRequest(email.trim());
            setEmail('');
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    const handleAccept = (requestId, name) => {
        setAcceptModal({ visible: true, id: requestId, name });
    };

    const confirmAccept = async () => {
        try {
            await acceptFriendRequest(acceptModal.id);
            setAcceptModal({ visible: false, id: null, name: '' });
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemove = (friendId, name) => {
        setDelModal({ visible: true, id: friendId, name });
    };

    const confirmRemove = () => {
        removeFriend(delModal.id);
        setDelModal({ visible: false, id: null, name: '' });
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
            <TouchableOpacity onPress={() => handleRemove(f.friendship_id, f.name)} style={s.removeBtn}>
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

            {/* Custom Delete Modal */}
            <Modal visible={delModal.visible} animationType="fade" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalBox}>
                        <Text style={s.modalTitle}>Remove Friend</Text>
                        <Text style={s.modalBody}>Are you sure you want to remove {delModal.name}?</Text>
                        <View style={s.modalBtns}>
                            <TouchableOpacity style={[s.modalBtn, s.modalBtnCancel]} onPress={() => setDelModal({ visible: false, id: null, name: '' })}>
                                <Text style={s.modalBtnCancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.modalBtn, s.modalBtnDanger]} onPress={confirmRemove}>
                                <Text style={s.modalBtnDangerTxt}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Custom Accept Modal */}
            <Modal visible={acceptModal.visible} animationType="fade" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalBox}>
                        <Text style={s.modalTitle}>Accept Request</Text>
                        <Text style={s.modalBody}>Accept friend request from {acceptModal.name}?</Text>
                        <View style={s.modalBtns}>
                            <TouchableOpacity style={[s.modalBtn, s.modalBtnCancel]} onPress={() => setAcceptModal({ visible: false, id: null, name: '' })}>
                                <Text style={s.modalBtnCancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.modalBtn, s.modalBtnAccept]} onPress={confirmAccept}>
                                <Text style={s.modalBtnAcceptTxt}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
    modalOverlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBox: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 24, width: '100%', maxWidth: 340 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: t.t1, marginBottom: 8 },
    modalBody: { fontSize: 14, color: t.t3, marginBottom: 24, lineHeight: 20 },
    modalBtns: { flexDirection: 'row', gap: 12 },
    modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    modalBtnCancel: { backgroundColor: t.surf, borderWidth: 1, borderColor: t.border },
    modalBtnCancelTxt: { color: t.t1, fontWeight: '700', fontSize: 14 },
    modalBtnDanger: { backgroundColor: t.red + '20', borderWidth: 1, borderColor: t.red + '50' },
    modalBtnDangerTxt: { color: t.red, fontWeight: '800', fontSize: 14 },
    modalBtnAccept: { backgroundColor: t.accent, borderWidth: 1, borderColor: t.accent },
    modalBtnAcceptTxt: { color: '#000', fontWeight: '800', fontSize: 14 },
});
