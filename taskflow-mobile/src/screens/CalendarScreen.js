import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useData } from '../context/DataContext';
import { eventsApi } from '../api/events';
import { DARK as t } from '../data/themes';

const PCOLORS = ['#FF3D5A', '#00E5CC', '#00D67B', '#B083FF', '#FFAA00'];

export default function CalendarScreen() {
    const { events, createEvent, deleteEvent, loading } = useData();
    const [selected, setSelected] = useState(new Date().toISOString().slice(0, 10));

    // Modal state
    const [showAdd, setShowAdd] = useState(false);
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('09:00');
    const [recurrence, setRecurrence] = useState('none');
    const [adding, setAdding] = useState(false);
    const [delModal, setDelModal] = useState({ visible: false, id: null, title: '' });

    const handleAdd = async () => {
        if (!title.trim()) return Alert.alert('Error', 'Event title is required');
        setAdding(true);
        try {
            await createEvent({ title, event_date: selected, event_time: time ? time + ':00' : null, priority: 'medium', recurrence });
            setShowAdd(false);
            setTitle(''); setTime('09:00'); setRecurrence('none');
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to create event');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = (ev) => {
        setDelModal({ visible: true, id: ev.id, title: ev.title });
    };

    const confirmDelete = async () => {
        try {
            await deleteEvent(delModal.id);
            setDelModal({ visible: false, id: null, title: '' });
        } catch (e) {
            console.error(e);
        }
    };

    const today = new Date().toISOString().slice(0, 10);
    const marked = {};
    events.forEach(ev => {
        const dStr = ev.event_date.slice(0, 10);
        const c = PCOLORS[ev.id % PCOLORS.length];
        marked[dStr] = { marked: true, dotColor: c };
    });
    // Today: outline ring (not filled, so it doesn't interfere with selection)
    if (!marked[today]) marked[today] = {};
    marked[today] = {
        ...marked[today],
        customStyles: {
            container: {
                borderWidth: 2, borderColor: t.accent, borderRadius: 20,
                backgroundColor: 'transparent',
            },
            text: { color: t.accent, fontWeight: '900' },
        },
    };
    marked[selected] = {
        ...marked[selected],
        selected: true, selectedColor: t.accent, selectedTextColor: '#000',
    };
    // If today is selected, merge styles
    if (today === selected) {
        marked[selected] = {
            ...marked[selected],
            customStyles: undefined, // let selected style win
        };
    }

    const selectedEvents = events.filter(ev => ev.event_date.slice(0, 10) === selected);

    if (loading) {
        return <View style={s.center}><Text style={{ color: t.t3 }}>Loading calendar…</Text></View>;
    }

    return (
        <View style={s.container}>
            <Calendar
                style={s.cal}
                markingType={'custom'}
                theme={{
                    backgroundColor: t.bg,
                    calendarBackground: t.card,
                    textSectionTitleColor: t.t3,
                    selectedDayBackgroundColor: t.accent,
                    selectedDayTextColor: '#000',
                    todayTextColor: t.accent,
                    dayTextColor: t.t1,
                    textDisabledColor: t.border,
                    dotColor: t.accent,
                    monthTextColor: t.t1,
                    indicatorColor: t.accent,
                    textDayFontWeight: 'bold',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: 'bold',
                }}
                markedDates={marked}
                onDayPress={day => setSelected(day.dateString)}
            />

            <View style={s.headerRow}>
                <Text style={s.evTitle}>Events for {selected}</Text>
                <TouchableOpacity onPress={() => setShowAdd(true)} style={s.addBtn}>
                    <Text style={s.addBtnTxt}>+ Add</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={s.evList} contentContainerStyle={{ paddingBottom: 30 }}>
                {selectedEvents.length === 0 ? (
                    <Text style={s.empty}>No events scheduled.</Text>
                ) : (
                    selectedEvents.map((ev) => {
                        const c = PCOLORS[ev.id % PCOLORS.length];
                        return (
                            <View key={ev.id} style={s.evCard}>
                                <View style={[s.indicator, { backgroundColor: c }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={s.tkTitle}>{ev.title}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                        <Text style={[s.tkSub, { fontWeight: '700', marginRight: 4 }]}>Time:</Text>
                                        <Text style={s.tkSub}>{ev.event_time ? ev.event_time.slice(0, 5) : 'All Day'}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(ev)} style={s.delBtn}>
                                    <Text style={s.delTxt}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <Modal visible={showAdd} animationType="slide" transparent>
                <View style={s.modalBg}>
                    <View style={s.modalCard}>
                        <Text style={s.modalTitle}>New Event on {selected}</Text>
                        <TextInput style={s.inp} placeholder="Title" placeholderTextColor={t.t3} value={title} onChangeText={setTitle} />
                        <TextInput style={s.inp} placeholder="Time (HH:MM)" placeholderTextColor={t.t3} value={time} onChangeText={setTime} />

                        <Text style={{ color: t.t2, fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 4 }}>Recurrence</Text>
                        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 15 }}>
                            {['none', 'weekly', 'monthly'].map(r => (
                                <TouchableOpacity key={r} onPress={() => setRecurrence(r)} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: recurrence === r ? t.accent + '20' : t.surf, borderWidth: 1, borderColor: recurrence === r ? t.accent : t.border }}>
                                    <Text style={{ color: recurrence === r ? t.accent : t.t3, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15 }}>
                            <TouchableOpacity onPress={() => setShowAdd(false)} style={[s.btn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.border }]}>
                                <Text style={[s.btnTxt, { color: t.t2 }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAdd} disabled={adding} style={[s.btn, { backgroundColor: t.accent }]}>
                                {adding ? <ActivityIndicator color="#000" /> : <Text style={[s.btnTxt, { color: '#000' }]}>Save Event</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Custom Delete Modal */}
            <Modal visible={delModal.visible} animationType="fade" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalBox}>
                        <Text style={s.modalTitle2}>Delete Event</Text>
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.bg },
    container: { flex: 1, backgroundColor: t.bg },
    cal: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: t.border },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    evTitle: { fontSize: 16, fontWeight: 'bold', color: t.t1 },
    addBtn: { backgroundColor: t.accentDim, borderWidth: 1, borderColor: t.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    addBtnTxt: { color: t.accent, fontWeight: 'bold', fontSize: 12 },
    evList: { flex: 1, paddingHorizontal: 20 },
    empty: { color: t.t3, textAlign: 'center', marginTop: 20 },
    evCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.surf, borderWidth: 1, borderColor: t.border, borderRadius: 12, padding: 16, marginBottom: 12 },
    indicator: { width: 4, height: '100%', borderRadius: 2, marginRight: 15 },
    tkTitle: { fontSize: 16, fontWeight: 'bold', color: t.t1, marginBottom: 4 },
    tkSub: { fontSize: 12, color: t.t3 },
    delBtn: { padding: 8, borderRadius: 8, backgroundColor: t.red + '18' },
    delTxt: { color: t.red, fontSize: 13, fontWeight: '800' },
    modalBg: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 16, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: t.t1, marginBottom: 15 },
    inp: { backgroundColor: t.surf, borderWidth: 1, borderColor: t.border, borderRadius: 10, padding: 14, color: t.t1, marginBottom: 10 },
    btn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
    btnTxt: { fontWeight: 'bold', fontSize: 14 },
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
