import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, KeyboardAvoidingView,
    Platform, Modal, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notesApi } from '../api/notes';
import { DARK as t } from '../data/themes';

const BLOCK_TYPES = [
    { type: 'paragraph', label: 'Text', icon: '¶' },
    { type: 'h1', label: 'Heading 1', icon: 'H1' },
    { type: 'h2', label: 'Heading 2', icon: 'H2' },
    { type: 'h3', label: 'Heading 3', icon: 'H3' },
    { type: 'todo', label: 'Checkbox', icon: '☑' },
    { type: 'bullet', label: 'Bullet list', icon: '•' },
    { type: 'numbered', label: 'Numbered', icon: '1.' },
    { type: 'quote', label: 'Quote', icon: '" "' },
    { type: 'code', label: 'Code', icon: '</>' },
    { type: 'divider', label: 'Divider', icon: '—' },
];

function blockFontSize(type) {
    if (type === 'h1') return 24;
    if (type === 'h2') return 19;
    if (type === 'h3') return 16;
    return 15;
}
function blockFontWeight(type) {
    if (['h1', 'h2', 'h3'].includes(type)) return '800';
    return '400';
}

export default function NoteEditorScreen({ route, navigation }) {
    const { page, allPages, onBack } = route.params;
    const [blocks, setBlocks] = useState([]);
    const [pageTitle, setPageTitle] = useState(page?.title || 'Untitled');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [activeBlockId, setActiveBlockId] = useState(null);
    const [showSubPages, setShowSubPages] = useState(false);
    
    // Custom modals
    const [delModal, setDelModal] = useState({ visible: false, blockId: null });
    const [subPageModal, setSubPageModal] = useState({ visible: false, title: '' });

    const inputRefs = useRef({});
    const scrollRef = useRef(null);

    // Sub-pages of this page
    const subPages = (allPages || []).filter(p => p.parentId === page.id || p.parent_id === page.id);

    const loadPage = useCallback(async () => {
        try {
            const res = await notesApi.getPage(page.id);
            const blks = res.data?.blocks || [];
            setBlocks(blks);
        } catch (e) {
            console.error('Load page error', e);
        } finally {
            setLoading(false);
        }
    }, [page.id]);

    useEffect(() => {
        loadPage();
    }, []);

    const saveTitle = async (newTitle) => {
        if (newTitle === page.title) return;
        try {
            await notesApi.updatePage(page.id, { title: newTitle });
        } catch (e) { /* silent */ }
    };

    const addBlock = async (type) => {
        setShowTypePicker(false);
        if (type === 'divider') {
            try {
                const res = await notesApi.createBlock(page.id, { type: 'divider', content: '' });
                setBlocks(prev => [...prev, res.data]);
            } catch (e) { Alert.alert('Error', 'Could not add block'); }
            return;
        }
        try {
            const res = await notesApi.createBlock(page.id, { type, content: '' });
            const newBlock = res.data;
            setBlocks(prev => [...prev, newBlock]);
            // Focus the new block
            setTimeout(() => inputRefs.current[newBlock.id]?.focus(), 100);
        } catch (e) { Alert.alert('Error', 'Could not add block'); }
    };

    const updateBlockContent = async (blockId, content) => {
        setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content } : b));
        // Debounce save — save on blur instead
    };

    const saveBlock = async (blockId, content, extra = {}) => {
        try {
            const block = blocks.find(b => b.id === blockId);
            if (!block) return;
            setSaving(true);
            await notesApi.updateBlock(blockId, { content, type: block.type, ...extra });
        } catch (e) { /* silent */ }
        finally { setSaving(false); }
    };

    const toggleTodo = async (blockId) => {
        const block = blocks.find(b => b.id === blockId);
        if (!block) return;
        const newChecked = !block.checked;
        setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, checked: newChecked } : b));
        try {
            await notesApi.updateBlock(blockId, { content: block.content, type: block.type, checked: newChecked });
        } catch (e) { /* silent */ }
    };

    const deleteBlock = async (blockId) => {
        if (blocks.length <= 1) { Alert.alert('Cannot delete the only block'); return; }
        setBlocks(prev => prev.filter(b => b.id !== blockId));
        try { await notesApi.deleteBlock(blockId); } catch (e) { /* silent */ }
    };

    const createSubPage = async () => {
        setSubPageModal({ visible: true, title: '' });
    };

    const confirmCreateSubPage = async () => {
        if (!subPageModal.title?.trim()) {
            setSubPageModal({ visible: false, title: '' });
            return;
        }
        try {
            await notesApi.createPage({ title: subPageModal.title.trim(), emoji: '', parentId: page.id });
            if (onBack) onBack(); // trigger parent refresh
            setSubPageModal({ visible: false, title: '' });
        } catch (e) { 
            console.error(e);
            setSubPageModal({ visible: false, title: '' });
        }
    };

    const renderBlock = (block, index) => {
        if (block.type === 'divider') {
            return (
                <TouchableOpacity key={block.id} onLongPress={() => {
                    setDelModal({ visible: true, blockId: block.id });
                }}>
                    <View style={s.divider} />
                </TouchableOpacity>
            );
        }

        const isTodo = block.type === 'todo';
        const isBullet = block.type === 'bullet';
        const isNumbered = block.type === 'numbered';
        const isQuote = block.type === 'quote';
        const isCode = block.type === 'code';

        return (
            <View key={block.id} style={[s.blockRow, isQuote && s.quoteRow, isCode && s.codeRow]}>
                {isTodo && (
                    <TouchableOpacity onPress={() => toggleTodo(block.id)} style={[s.checkbox, block.checked && s.checkboxDone]}>
                        {block.checked && <Text style={{ color: t.green, fontSize: 10, fontWeight: '900' }}>✓</Text>}
                    </TouchableOpacity>
                )}
                {isBullet && <Text style={s.bulletDot}>•</Text>}
                {isNumbered && <Text style={s.bulletDot}>{index + 1}.</Text>}

                <TextInput
                    ref={ref => inputRefs.current[block.id] = ref}
                    style={[
                        s.blockInput,
                        { fontSize: blockFontSize(block.type), fontWeight: blockFontWeight(block.type) },
                        isQuote && s.quoteText,
                        isCode && s.codeText,
                        block.checked && s.todoCheckedText,
                    ]}
                    value={block.content || ''}
                    onChangeText={(v) => updateBlockContent(block.id, v)}
                    onBlur={() => saveBlock(block.id, block.content)}
                    onFocus={() => setActiveBlockId(block.id)}
                    multiline
                    placeholder={
                        block.type === 'h1' ? 'Heading 1' :
                            block.type === 'h2' ? 'Heading 2' :
                                block.type === 'h3' ? 'Heading 3' :
                                    block.type === 'todo' ? 'To-do...' :
                                        block.type === 'quote' ? 'Quote...' :
                                            block.type === 'code' ? 'Code...' :
                                                'Type something...'
                    }
                    placeholderTextColor={t.t3}
                    onLongPress={() => {
                        setDelModal({ visible: true, blockId: block.id });
                    }}
                />
            </View>
        );
    };

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator color={t.accent} size="large" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={s.container}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => { navigation.goBack(); if (onBack) onBack(); }} style={s.backBtn}>
                        <Text style={s.backTxt}>‹ Back</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    {saving && <ActivityIndicator color={t.accent} size="small" style={{ marginRight: 8 }} />}
                    {subPages.length > 0 && (
                        <TouchableOpacity onPress={() => setShowSubPages(true)} style={s.subPagesBtn}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="document-text" size={14} color={t.accent} />
                                <Text style={s.subPagesBtnTxt}>{subPages.length}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={createSubPage} style={s.iconBtn}>
                        <Text style={s.iconBtnTxt}>+ Sub</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    ref={scrollRef}
                    style={s.scroll}
                    contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Page title */}
                    <TextInput
                        style={s.titleInput}
                        value={pageTitle}
                        onChangeText={setPageTitle}
                        onBlur={() => saveTitle(pageTitle)}
                        placeholder="Untitled"
                        placeholderTextColor={t.t3}
                        multiline
                    />

                    {/* Sub-pages inline bar */}
                    {subPages.length > 0 && (
                        <TouchableOpacity onPress={() => setShowSubPages(true)} style={s.subPagesBar}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="folder" size={16} color={t.accent} />
                                <Text style={s.subPagesBtnTxt}>{subPages.length} sub-page{subPages.length > 1 ? 's' : ''} →</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Blocks */}
                    {blocks.map((block, i) => renderBlock(block, i))}

                    {/* Add block button */}
                    <TouchableOpacity style={s.addBlockBtn} onPress={() => setShowTypePicker(true)}>
                        <Text style={s.addBlockTxt}>+ Add block</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Block type picker modal */}
                <Modal visible={showTypePicker} animationType="slide" transparent>
                    <TouchableOpacity style={s.modalBg} activeOpacity={1} onPress={() => setShowTypePicker(false)}>
                        <View style={s.typePickerCard} onStartShouldSetResponder={() => true}>
                            <Text style={s.typePickerTitle}>Add Block</Text>
                            <View style={s.typeGrid}>
                                {BLOCK_TYPES.map(bt => (
                                    <TouchableOpacity key={bt.type} style={s.typeItem} onPress={() => addBlock(bt.type)}>
                                        <View style={s.typeIcon}>
                                            <Text style={s.typeIconTxt}>{bt.icon}</Text>
                                        </View>
                                        <Text style={s.typeLabel}>{bt.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Sub-pages browser modal */}
                <Modal visible={showSubPages} animationType="slide" transparent>
                    <View style={s.modalBg}>
                        <View style={[s.typePickerCard, { maxHeight: '70%' }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                                <Text style={s.typePickerTitle}>Sub-pages</Text>
                                <TouchableOpacity onPress={() => setShowSubPages(false)}>
                                    <Text style={{ color: t.t3, fontSize: 16 }}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={subPages}
                                keyExtractor={p => p.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={s.subPageRow}
                                        onPress={() => {
                                            setShowSubPages(false);
                                            navigation.push('NoteEditor', {
                                                page: item,
                                                allPages: route.params.allPages,
                                                onBack: onBack,
                                            });
                                        }}
                                    >
                                        <Ionicons name="document-text" size={20} color={t.accent} />
                                        <Text style={s.subPageTitle}>{item.title || 'Untitled'}</Text>
                                        <Text style={{ color: t.t3, fontSize: 18 }}>›</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity style={[s.addBlockBtn, { marginTop: 12 }]} onPress={() => { setShowSubPages(false); createSubPage(); }}>
                                <Text style={s.addBlockTxt}>+ New Sub-page</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Custom Delete Modal */}
                <Modal visible={delModal.visible} animationType="fade" transparent>
                    <View style={s.modalOverlay}>
                        <View style={s.modalBox}>
                            <Text style={s.modalTitle2}>Delete Block</Text>
                            <Text style={s.modalBody}>Are you sure you want to delete this block?</Text>
                            <View style={s.modalBtns}>
                                <TouchableOpacity style={[s.modalBtn, s.modalBtnCancel]} onPress={() => setDelModal({ visible: false, blockId: null })}>
                                    <Text style={s.modalBtnCancelTxt}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[s.modalBtn, s.modalBtnDanger]} onPress={() => {
                                    deleteBlock(delModal.blockId);
                                    setDelModal({ visible: false, blockId: null });
                                }}>
                                    <Text style={s.modalBtnDangerTxt}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Custom Sub-page Modal */}
                <Modal visible={subPageModal.visible} animationType="fade" transparent>
                    <View style={s.modalOverlay}>
                        <View style={s.modalBox}>
                            <Text style={s.modalTitle2}>New Sub-page</Text>
                            <TextInput 
                                style={s.modalInp} 
                                placeholder="Enter a title" 
                                placeholderTextColor={t.t3} 
                                value={subPageModal.title} 
                                onChangeText={(val) => setSubPageModal(prev => ({ ...prev, title: val }))}
                                autoFocus
                            />
                            <View style={s.modalBtns}>
                                <TouchableOpacity style={[s.modalBtn, s.modalBtnCancel]} onPress={() => setSubPageModal({ visible: false, title: '' })}>
                                    <Text style={s.modalBtnCancelTxt}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[s.modalBtn, s.modalBtnAccept]} onPress={confirmCreateSubPage}>
                                    <Text style={s.modalBtnAcceptTxt}>Create</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.bg },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10, paddingTop: 48,
        borderBottomWidth: 1, borderBottomColor: t.border, backgroundColor: t.nav,
    },
    backBtn: { paddingRight: 12 },
    backTxt: { color: t.accent, fontSize: 17, fontWeight: '700' },
    subPagesBtn: { marginRight: 8, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
    subPagesBtnTxt: { color: t.accent, fontSize: 13, fontWeight: '700' },
    iconBtn: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
    iconBtnTxt: { color: t.t1, fontWeight: '700', fontSize: 13 },
    scroll: { flex: 1 },
    titleInput: {
        fontSize: 28, fontWeight: '900', color: t.t1,
        marginBottom: 8, paddingVertical: 4, letterSpacing: -0.5, lineHeight: 36,
    },
    subPagesBar: {
        backgroundColor: t.card, borderWidth: 1, borderColor: t.border,
        borderRadius: 8, padding: 10, marginBottom: 16,
    },
    blockRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
    quoteRow: { borderLeftWidth: 3, borderLeftColor: t.accent, paddingLeft: 10, marginLeft: 2, marginVertical: 4 },
    codeRow: { backgroundColor: t.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginVertical: 4 },
    blockInput: { flex: 1, color: t.t1, lineHeight: 24, paddingVertical: 4, minHeight: 30 },
    quoteText: { color: t.t3, fontStyle: 'italic' },
    codeText: { color: '#7EC8E3', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
    todoCheckedText: { textDecorationLine: 'line-through', color: t.t3 },
    checkbox: {
        width: 20, height: 20, borderRadius: 5, borderWidth: 1.5,
        borderColor: t.border, marginRight: 10, marginTop: 7,
        justifyContent: 'center', alignItems: 'center',
    },
    checkboxDone: { backgroundColor: t.green + '25', borderColor: t.green },
    bulletDot: { color: t.t3, fontSize: 18, marginRight: 8, marginTop: 5, lineHeight: 24 },
    divider: { height: 1, backgroundColor: t.border, marginVertical: 12 },
    addBlockBtn: {
        marginTop: 16, borderWidth: 1.5, borderColor: t.border, borderRadius: 10,
        padding: 12, alignItems: 'center', borderStyle: 'dashed',
    },
    addBlockTxt: { color: t.t3, fontSize: 14, fontWeight: '700' },
    modalBg: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'flex-end' },
    typePickerCard: {
        backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 40,
    },
    typePickerTitle: { fontSize: 18, fontWeight: '800', color: t.t1, marginBottom: 16, letterSpacing: -0.3 },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    typeItem: { width: '29%', alignItems: 'center', marginBottom: 4 },
    typeIcon: {
        width: 52, height: 52, borderRadius: 14, backgroundColor: t.surf,
        borderWidth: 1, borderColor: t.border, justifyContent: 'center', alignItems: 'center', marginBottom: 6,
    },
    typeIconTxt: { fontSize: 16, fontWeight: '800', color: t.t1 },
    typeLabel: { fontSize: 11, color: t.t3, fontWeight: '600', textAlign: 'center' },
    subPageRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: t.surf, borderWidth: 1, borderColor: t.border,
        borderRadius: 10, padding: 14, marginBottom: 8,
    },
    subPageTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: t.t1 },
    modalOverlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBox: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 24, width: '100%', maxWidth: 340 },
    modalTitle2: { fontSize: 18, fontWeight: '800', color: t.t1, marginBottom: 8 },
    modalBody: { fontSize: 14, color: t.t3, marginBottom: 24, lineHeight: 20 },
    modalInp: { backgroundColor: t.surf, borderWidth: 1, borderColor: t.border, borderRadius: 12, padding: 14, color: t.t1, fontSize: 16, marginBottom: 24 },
    modalBtns: { flexDirection: 'row', gap: 12 },
    modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    modalBtnCancel: { backgroundColor: t.surf, borderWidth: 1, borderColor: t.border },
    modalBtnCancelTxt: { color: t.t1, fontWeight: '700', fontSize: 14 },
    modalBtnDanger: { backgroundColor: t.red + '20', borderWidth: 1, borderColor: t.red + '50' },
    modalBtnDangerTxt: { color: t.red, fontWeight: '800', fontSize: 14 },
    modalBtnAccept: { backgroundColor: t.accent, borderWidth: 1, borderColor: t.accent },
    modalBtnAcceptTxt: { color: '#000', fontWeight: '800', fontSize: 14 },
});
