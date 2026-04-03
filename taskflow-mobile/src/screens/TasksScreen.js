import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DARK as t } from '../data/themes';

function fmtDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TasksScreen() {
    const { tasks, updateTaskStatus, createTask, teamMembers, loading } = useData();
    const { user } = useAuth();
    const [fil, setFil] = useState("all");
    const [createModal, setCreateModal] = useState(false);

    // New task state
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState('medium');
    const [assignee, setAssignee] = useState(String(user?.id || ''));
    const [creating, setCreating] = useState(false);

    const tabs = ["all", "pending", "active", "done"];
    const list = tasks.filter(tk => fil === "all" ? true : tk.status === fil);

    const handleToggle = (tk) => {
        updateTaskStatus(tk.id, tk.status === 'done' ? 'active' : 'done');
    };

    const handleCreate = async () => {
        if (!title) return Alert.alert('Error', 'Title is required');
        setCreating(true);
        try {
            await createTask({ title, description: desc, priority, assigned_to: parseInt(assignee || user.id) });
            setCreateModal(false);
            setTitle(''); setDesc(''); setPriority('medium');
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to create task');
        } finally {
            setCreating(false);
        }
    };

    const renderTask = ({ item }) => (
        <View style={s.tkCard}>
            <TouchableOpacity onPress={() => handleToggle(item)} style={[s.checkbox, item.status === 'done' && s.checkboxDone]}>
                {item.status === 'done' && <Text style={{ color: t.green, fontSize: 10, fontWeight: 'bold' }}>✓</Text>}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
                <Text style={[s.tkTitle, item.status === 'done' && { textDecorationLine: 'line-through', opacity: 0.5 }]}>{item.title}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={s.tkSub}>due {fmtDate(item.due_date)}</Text>
                    <Text style={s.tkSub}>by {item.assigned_by_name?.split(' ')[0]}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                    <View style={[s.tag, { borderColor: item.priority === 'high' ? t.red : item.priority === 'medium' ? t.amber : t.green }]}>
                        <Text style={[s.tagTxt, { color: item.priority === 'high' ? t.red : item.priority === 'medium' ? t.amber : t.green }]}>{item.priority}</Text>
                    </View>
                    <View style={[s.tag, { borderColor: t.t3 }]}>
                        <Text style={[s.tagTxt, { color: t.t2 }]}>{item.status}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={s.container}>
            <View style={s.header}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsWrap}>
                    {tabs.map(f => {
                        const active = fil === f;
                        return (
                            <TouchableOpacity key={f} onPress={() => setFil(f)} style={[s.tab, active && s.tabActive]}>
                                <Text style={[s.tabTxt, active && s.tabTxtActive]}>{f.toUpperCase()}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                <TouchableOpacity onPress={() => setCreateModal(true)} style={s.addBtn}>
                    <Text style={s.addBtnTxt}>+ New</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={s.center}><Text style={{ color: t.t3 }}>Loading tasks…</Text></View>
            ) : list.length === 0 ? (
                <View style={s.center}><Text style={{ color: t.t3 }}>No tasks found.</Text></View>
            ) : (
                <FlatList
                    data={list}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderTask}
                    contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
                />
            )}

            <Modal visible={createModal} animationType="slide" transparent>
                <View style={s.modalBg}>
                    <View style={s.modalCard}>
                        <Text style={s.modalTitle}>Create Task</Text>

                        <TextInput style={s.inp} placeholder="Title" placeholderTextColor={t.t3} value={title} onChangeText={setTitle} />
                        <TextInput style={[s.inp, { height: 80, textAlignVertical: 'top' }]} placeholder="Description" placeholderTextColor={t.t3} multiline value={desc} onChangeText={setDesc} />

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15 }}>
                            <TouchableOpacity onPress={() => setCreateModal(false)} style={[s.btn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.border }]}>
                                <Text style={[s.btnTxt, { color: t.t2 }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCreate} disabled={creating} style={[s.btn, { backgroundColor: t.accent }]}>
                                {creating ? <ActivityIndicator color="#000" /> : <Text style={[s.btnTxt, { color: '#000' }]}>Create Task</Text>}
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: t.border, backgroundColor: t.surf },
    tabsWrap: { flexDirection: 'row' },
    tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: t.border, marginRight: 8, backgroundColor: t.card },
    tabActive: { backgroundColor: t.accentDim, borderColor: t.accent },
    tabTxt: { color: t.t3, fontSize: 12, fontWeight: 'bold' },
    tabTxtActive: { color: t.accent },
    addBtn: { backgroundColor: t.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 10 },
    addBtnTxt: { color: '#000', fontWeight: 'bold', fontSize: 12 },
    tkCard: { flexDirection: 'row', backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 12, padding: 16, marginBottom: 12 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: t.border, marginRight: 15, justifyContent: 'center', alignItems: 'center' },
    checkboxDone: { backgroundColor: t.green + '20', borderColor: t.green },
    tkTitle: { fontSize: 15, fontWeight: 'bold', color: t.t1, marginBottom: 4 },
    tkSub: { fontSize: 12, color: t.t3 },
    tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
    tagTxt: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
    modalBg: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: t.t1, marginBottom: 15 },
    inp: { backgroundColor: t.surf, borderWidth: 1, borderColor: t.border, borderRadius: 10, padding: 12, color: t.t1, marginBottom: 10 },
    btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    btnTxt: { fontWeight: 'bold', fontSize: 14 }
});
