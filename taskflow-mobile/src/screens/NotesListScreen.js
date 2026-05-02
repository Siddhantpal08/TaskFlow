import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Modal, TextInput, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notesApi } from '../api/notes';
import { DARK as t } from '../data/themes';

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function buildTree(pages) {
    const map = {};
    const roots = [];
    for (const p of pages) { map[p.id] = { ...p, children: [] }; }
    for (const p of pages) {
        if (p.parentId && map[p.parentId]) {
            map[p.parentId].children.push(map[p.id]);
        } else if (!p.parentId || !map[p.parentId]) {
            roots.push(map[p.id]);
        }
    }
    return roots;
}

export default function NotesListScreen({ navigation }) {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [creating, setCreating] = useState(false);
    const [delModal, setDelModal] = useState({ visible: false, id: null, title: '' });
    const [expanded, setExpanded] = useState({});

    const loadPages = useCallback(async () => {
        try {
            const res = await notesApi.listPages();
            const all = (res.data || []).filter(p => p.id !== 'root');
            setPages(all);
        } catch (e) {
            console.error('Notes load error', e);
        }
    }, []);

    useEffect(() => {
        loadPages().finally(() => setLoading(false));
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPages();
        setRefreshing(false);
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        setCreating(true);
        try {
            await notesApi.createPage({ title: newTitle.trim(), emoji: '' });
            setShowCreate(false);
            setNewTitle('');
            await loadPages();
        } catch (e) {
            Alert.alert('Error', e.message || 'Could not create note');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = (id, title) => {
        setDelModal({ visible: true, id, title });
    };

    const confirmDelete = async () => {
        try {
            await notesApi.deletePage(delModal.id);
            setDelModal({ visible: false, id: null, title: '' });
            loadPages();
        } catch (e) {
            console.error(e);
        }
    };

    const handleView = (page) => {
        navigation.navigate('NoteEditor', {
            page,
            allPages: pages,
            onBack: loadPages,
        });
    };

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };



    // Build tree structure for the list
    const tree = buildTree(pages);

    const renderNoteCard = (page, depth = 0) => {
        const hasChildren = page.children && page.children.length > 0;
        const isExpanded = expanded[page.id];
        return (
            <View key={page.id}>
                <TouchableOpacity
                    style={[s.card, depth > 0 && s.subCard, { marginLeft: depth * 18 }]}
                    onPress={() => handleView(page)}
                    onLongPress={() => handleDelete(page.id, page.title)}
                    activeOpacity={0.75}
                >
                    <View style={[s.cardAccent, { backgroundColor: depth === 0 ? t.accent : t.purple || '#B083FF' }]} />
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="document-text" size={depth === 0 ? 20 : 16} color={t.accent} />
                            <Text style={[s.cardTitle, depth > 0 && { fontSize: 14 }]} numberOfLines={1}>
                                {page.title || 'Untitled'}
                            </Text>
                        </View>
                        <Text style={s.cardSub}>Updated {timeAgo(page.updatedAt)}</Text>
                    </View>
                    {hasChildren && (
                        <TouchableOpacity
                            onPress={() => toggleExpand(page.id)}
                            style={s.chevronBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={s.chevron}>{isExpanded ? '⌄' : '›'}</Text>
                            <Text style={s.subCount}>{page.children.length}</Text>
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
                {hasChildren && isExpanded && page.children.map(child => renderNoteCard(child, depth + 1))}
            </View>
        );
    };

    if (loading) {
        return <View style={s.center}><ActivityIndicator color={t.accent} size="large" /></View>;
    }

    return (
        <View style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="book" size={18} color={t.t1} />
                        <Text style={s.headerTitle}>My Notes</Text>
                    </View>
                    <Text style={s.headerSub}>{pages.length} note{pages.length !== 1 ? 's' : ''} · Long-press to delete</Text>
                </View>
                <TouchableOpacity style={s.addBtn} onPress={() => setShowCreate(true)}>
                    <Text style={s.addBtnTxt}>+ New</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={tree}
                keyExtractor={p => p.id}
                renderItem={({ item }) => renderNoteCard(item, 0)}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                ListEmptyComponent={
                    <View style={s.empty}>
                        <Ionicons name="documents-outline" size={54} color={t.t3} style={{ marginBottom: 12 }} />
                        <Text style={s.emptyTxt}>No notes yet</Text>
                        <Text style={s.emptySub}>Tap "+ New" to create your first note.</Text>
                    </View>
                }
            />

            {/* Create Modal */}
            <Modal visible={showCreate} animationType="slide" transparent>
                <View style={s.modalBg}>
                    <View style={s.modalCard}>
                        <Text style={s.modalTitle}>New Note</Text>
                        <TextInput
                            style={s.inp}
                            placeholder="Note title…"
                            placeholderTextColor={t.t3}
                            value={newTitle}
                            onChangeText={setNewTitle}
                            autoFocus
                        />
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                            <TouchableOpacity onPress={() => setShowCreate(false)} style={[s.btn, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: t.border }]}>
                                <Text style={[s.btnTxt, { color: t.t2 }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCreate} disabled={creating} style={[s.btn, { flex: 1, backgroundColor: t.accent }]}>
                                {creating ? <ActivityIndicator color="#000" /> : <Text style={[s.btnTxt, { color: '#000' }]}>Create</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Custom Delete Modal */}
            <Modal visible={delModal.visible} animationType="fade" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalBox}>
                        <Text style={s.modalTitle2}>Delete Note</Text>
                        <Text style={s.modalBody}>Are you sure you want to delete "{delModal.title}"?</Text>
                        <View style={s.modalBtns}>
                            <TouchableOpacity style={[s.modalBtn, s.modalBtnCancel]} onPress={() => setDelModal({ visible: false, id: null, title: '' })}>
                                <Text style={s.modalBtnCancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.modalBtn, s.modalBtnDanger]} onPress={confirmDelete}>
                                <Text style={s.modalBtnDangerTxt}>Delete</Text>
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.bg },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: t.border, backgroundColor: t.nav,
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: t.t1, letterSpacing: -0.4 },
    headerSub: { fontSize: 11, color: t.t3, marginTop: 2 },
    addBtn: { backgroundColor: t.accent, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
    addBtnTxt: { color: '#000', fontWeight: '800', fontSize: 13 },

    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
        borderRadius: 14, padding: 16, overflow: 'hidden',
    },
    subCard: {
        backgroundColor: t.surf, borderColor: t.border + 'AA',
        borderRadius: 10, paddingVertical: 12,
    },
    cardAccent: {
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderRadius: 2,
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: t.t1, flex: 1 },
    cardSub: { fontSize: 11, color: t.t3, marginTop: 4 },
    chevronBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingLeft: 8 },
    chevron: { color: t.accent, fontSize: 20, fontWeight: '700', lineHeight: 22 },
    subCount: { color: t.t3, fontSize: 10, fontWeight: '700' },

    empty: { alignItems: 'center', marginTop: 80 },
    emptyTxt: { fontSize: 17, fontWeight: '700', color: t.t1, marginBottom: 6 },
    emptySub: { fontSize: 13, color: t.t3, textAlign: 'center', paddingHorizontal: 30, lineHeight: 20 },

    modalBg: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: t.t1, marginBottom: 16, letterSpacing: -0.4 },
    inp: { backgroundColor: t.surf, borderWidth: 1, borderColor: t.border, borderRadius: 12, padding: 14, color: t.t1, fontSize: 16 },
    btn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    btnTxt: { fontWeight: '800', fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBox: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 24, width: '100%', maxWidth: 340 },
    modalTitle2: { fontSize: 18, fontWeight: '800', color: t.t1, marginBottom: 8 },
    modalBody: { fontSize: 14, color: t.t3, marginBottom: 24, lineHeight: 20 },
    modalBtns: { flexDirection: 'row', gap: 12 },
    modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    modalBtnCancel: { backgroundColor: t.surf, borderWidth: 1, borderColor: t.border },
    modalBtnCancelTxt: { color: t.t1, fontWeight: '700', fontSize: 14 },
    modalBtnDanger: { backgroundColor: t.red + '20', borderWidth: 1, borderColor: t.red + '50' },
    modalBtnDangerTxt: { color: t.red, fontWeight: '800', fontSize: 14 },
});
