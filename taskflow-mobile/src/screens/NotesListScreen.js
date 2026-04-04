import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Modal, TextInput, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
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
            await notesApi.createPage({ title: newTitle.trim(), emoji: '📄' });
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
        Alert.alert('Delete Note', `Delete "${title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await notesApi.deletePage(id);
                        setPages(p => p.filter(pg => pg.id !== id));
                    } catch (e) {
                        Alert.alert('Error', e.message || 'Delete failed');
                    }
                }
            }
        ]);
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

    const renderBlock = (blk) => {
        const txt = blk.content || '';
        if (!txt && blk.type !== 'divider') return null;
        const isBig = ['h1', 'h2', 'h3'].includes(blk.type);
        const isCode = blk.type === 'code';
        const isTodo = blk.type === 'todo';
        const isQuote = blk.type === 'quote';
        const isDivider = blk.type === 'divider';
        return (
            <View key={blk.id} style={[s.blkRow, isQuote && s.quoteBlk, isCode && s.codeBlk]}>
                {isTodo && (
                    <View style={[s.checkbox, blk.checked && s.checkboxDone]}>
                        {blk.checked ? <Text style={{ color: t.green, fontSize: 9 }}>✓</Text> : null}
                    </View>
                )}
                {isDivider
                    ? <View style={{ flex: 1, height: 1, backgroundColor: t.border, marginVertical: 4 }} />
                    : <Text style={[
                        s.blkTxt,
                        isBig && { fontSize: blk.type === 'h1' ? 22 : blk.type === 'h2' ? 18 : 15, fontWeight: '800' },
                        isCode && { fontFamily: 'monospace', fontSize: 12, color: t.green },
                        isQuote && { color: t.t3, fontStyle: 'italic' },
                    ]}>{txt}</Text>
                }
            </View>
        );
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
                            <Text style={{ fontSize: depth === 0 ? 20 : 16 }}>{page.emoji || '📄'}</Text>
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
                    <Text style={s.headerTitle}>📝 My Notes</Text>
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
                        <Text style={{ fontSize: 54, marginBottom: 12 }}>📝</Text>
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

            {/* Note Viewer */}
            <Modal visible={!!viewPage} animationType="slide" onRequestClose={() => setViewPage(null)}>
                <View style={s.viewerContainer}>
                    <View style={s.viewerHeader}>
                        <TouchableOpacity onPress={() => setViewPage(null)} style={s.backBtn}>
                            <Text style={s.backTxt}>‹ Back</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={s.viewerTitle} numberOfLines={1}>{viewPage?.emoji} {viewPage?.title}</Text>
                        </View>
                    </View>
                    {viewLoading ? (
                        <View style={s.center}><ActivityIndicator color={t.accent} size="large" /></View>
                    ) : (
                        <FlatList
                            data={viewBlocks}
                            keyExtractor={b => b.id}
                            renderItem={({ item }) => renderBlock(item)}
                            contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                            ListEmptyComponent={
                                <View style={s.empty}>
                                    <Text style={s.emptySub}>This note is empty. Edit it on the web version.</Text>
                                </View>
                            }
                        />
                    )}
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
    inp: { backgroundColor: t.surf, borderWidth: 1, borderColor: t.border, borderRadius: 12, padding: 14, color: t.t1, fontSize: 15, marginBottom: 4 },
    btn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    btnTxt: { fontWeight: '800', fontSize: 15 },

    viewerContainer: { flex: 1, backgroundColor: t.bg },
    viewerHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50,
        borderBottomWidth: 1, borderBottomColor: t.border, backgroundColor: t.nav,
    },
    backBtn: { paddingVertical: 4, paddingRight: 8 },
    backTxt: { color: t.accent, fontSize: 17, fontWeight: '700' },
    viewerTitle: { fontSize: 16, fontWeight: '700', color: t.t1 },
    blkRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    blkTxt: { fontSize: 15, color: t.t1, lineHeight: 24, flex: 1 },
    quoteBlk: { borderLeftWidth: 3, borderLeftColor: t.accent, paddingLeft: 12, marginLeft: 4, marginVertical: 4 },
    codeBlk: { backgroundColor: t.card, borderRadius: 8, padding: 10, marginVertical: 4 },
    checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: t.border, marginRight: 10, marginTop: 3, justifyContent: 'center', alignItems: 'center' },
    checkboxDone: { backgroundColor: t.green + '20', borderColor: t.green },
});
