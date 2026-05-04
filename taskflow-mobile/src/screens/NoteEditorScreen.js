import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notesApi } from '../api/notes';
import { DARK as t } from '../data/themes';

export default function NoteEditorScreen({ route, navigation }) {
    const { page, onBack } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState(page?.title || '');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);

    const loadPage = useCallback(async () => {
        if (!page?.id) return;
        try {
            const res = await notesApi.getPage(page.id);
            if (res.data) {
                setTitle(res.data.title || '');
                setContent(res.data.content || '');
            }
        } catch (e) {
            console.error('Load page error', e);
            Alert.alert('Error', 'Failed to load note.');
        } finally {
            setLoading(false);
        }
    }, [page?.id]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await notesApi.updatePage(page.id, { title, content });
            if (onBack) onBack(); // trigger parent refresh
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator color={t.accent} size="large" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={t.t1} />
                </TouchableOpacity>

                <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={s.saveBtnTxt}>Save</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView style={s.editor} contentContainerStyle={{ paddingBottom: 100 }}>
                <TextInput
                    style={s.titleInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Note Title"
                    placeholderTextColor={t.t3}
                />
                
                <TextInput
                    style={s.contentInput}
                    value={content}
                    onChangeText={setContent}
                    placeholder="Write something amazing..."
                    placeholderTextColor={t.t3}
                    multiline
                    textAlignVertical="top"
                />
            </ScrollView>
        </KeyboardAvoidingView>
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
    backBtn: { padding: 4 },
    saveBtn: { backgroundColor: t.accent, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
    saveBtnTxt: { color: '#000', fontWeight: '800', fontSize: 14 },
    editor: { flex: 1, padding: 20 },
    titleInput: {
        fontSize: 24,
        fontWeight: '800',
        color: t.t1,
        marginBottom: 16,
    },
    contentInput: {
        fontSize: 16,
        color: t.t2,
        lineHeight: 24,
        minHeight: 300,
    },
});
