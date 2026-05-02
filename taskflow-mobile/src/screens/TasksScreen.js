import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { tasksApi } from '../api/tasks';
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

    // New/Edit task state
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [assignee, setAssignee] = useState(String(user?.id || ''));
    const [saving, setSaving] = useState(false);
    
    // Modals
    const [editModal, setEditModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [delModal, setDelModal] = useState({ visible: false, id: null, title: '' });

    const tabs = ["all", "pending", "active", "done"];
    const list = tasks.filter(tk => fil === "all" ? true : tk.status === fil);

    const handleToggle = (tk) => {
        updateTaskStatus(tk.id, tk.status === 'done' ? 'active' : 'done');
    };

    const openEdit = (tk) => {
        setEditId(tk.id);
        setTitle(tk.title);
        setDesc(tk.description || '');
        setPriority(tk.priority || 'medium');
        setDueDate(tk.due_date ? tk.due_date.slice(0, 10) : '');
        setAssignee(String(tk.assigned_to || user.id));
        setEditModal(true);
    };

    const handleSave = async (isEdit = false) => {
        if (!title) return Alert.alert('Error', 'Title is required');
        setSaving(true);
        const data = { 
            title, description: desc, priority, 
            assigned_to: parseInt(assignee || user.id),
            due_date: dueDate || null
        };
        try {
            if (isEdit) {
                await tasksApi.update(editId, data);
                setEditModal(false);
            } else {
                await createTask(data);
                setCreateModal(false);
            }
            setTitle(''); setDesc(''); setPriority('medium'); setDueDate('');
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = () => {
        deleteTask(delModal.id);
        setDelModal({ visible: false, id: null, title: '' });
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
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'center' }}>
                    <View style={[s.tag, { borderColor: item.priority === 'high' ? t.red : item.priority === 'medium' ? t.amber : t.green }]}>
                        <Text style={[s.tagTxt, { color: item.priority === 'high' ? t.red : item.priority === 'medium' ? t.amber : t.green }]}>{item.priority}</Text>
                    </View>
                    <View style={[s.tag, { borderColor: t.t3 }]}>
                        <Text style={[s.tagTxt, { color: t.t2 }]}>{item.status}</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity onPress={() => openEdit(item)} style={{ marginRight: 12, paddingVertical: 4 }}>
                        <Text style={{ color: t.accent, fontSize: 12, fontWeight: '700' }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDelModal({ visible: true, id: item.id, title: item.title })} style={{ paddingVertical: 4 }}>
                        <Text style={{ color: t.red, fontSize: 12, fontWeight: '700' }}>Delete</Text>
                    </TouchableOpacity>
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

            {/* Create/Edit Modal Component */}
            {(() => {
                const isEdit = editModal;
                const visible = createModal || editModal;
                if (!visible) return null;
                return (
                    <Modal visible={visible} animationType="slide" transparent>
                        <View style={s.modalBg}>
                            <View style={s.modalCard}>
                                <Text style={s.modalTitle}>{isEdit ? 'Edit Task' : 'Create Task'}</Text>
        
                                <TextInput style={s.inp} placeholder="Title" placeholderTextColor={t.t3} value={title} onChangeText={setTitle} />
                                <TextInput style={[s.inp, { height: 80, textAlignVertical: 'top' }]} placeholder="Description" placeholderTextColor={t.t3} multiline value={desc} onChangeText={setDesc} />
                                
                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.lbl}>Priority</Text>
                                        <View style={s.prioWrap}>
                                            {['low', 'medium', 'high'].map(p => (
                                                <TouchableOpacity key={p} onPress={() => setPriority(p)} style={[s.prioBtn, priority === p && s.prioBtnAct]}>
                                                    <Text style={[s.prioTxt, priority === p && s.prioTxtAct]}>{p}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                                
                                <Text style={s.lbl}>Due Date (YYYY-MM-DD)</Text>
                                <TextInput style={s.inp} placeholder="Optional" placeholderTextColor={t.t3} value={dueDate} onChangeText={setDueDate} />
        
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15 }}>
                                    <TouchableOpacity onPress={() => { setCreateModal(false); setEditModal(false); setTitle(''); setDesc(''); setDueDate(''); setPriority('medium'); }} style={[s.btn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.border }]}>
                                        <Text style={[s.btnTxt, { color: t.t2 }]}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleSave(isEdit)} disabled={saving} style={[s.btn, { backgroundColor: t.accent }]}>
                                        {saving ? <ActivityIndicator color="#000" /> : <Text style={[s.btnTxt, { color: '#000' }]}>{isEdit ? 'Save Changes' : 'Create Task'}</Text>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                );
            })()}

            {/* Custom Delete Modal */}
            <Modal visible={delModal.visible} animationType="fade" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalBox}>
                        <Text style={s.modalTitle2}>Delete Task</Text>
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
    lbl: { color: t.t2, fontSize: 12, fontWeight: '700', marginBottom: 6 },
    prioWrap: { flexDirection: 'row', gap: 6, marginBottom: 4 },
    prioBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: t.border },
    prioBtnAct: { backgroundColor: t.accent + '20', borderColor: t.accent },
    prioTxt: { fontSize: 11, fontWeight: '700', color: t.t3, textTransform: 'capitalize' },
    prioTxtAct: { color: t.accent },
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
