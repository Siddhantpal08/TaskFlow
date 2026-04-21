import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { useData } from "../context/DataContext.jsx";
import { eventsApi } from "../api/events.js";
import { toastSuccess, toastError } from "./ui/Toast.jsx";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const PCOLORS = ['#FF3D5A', '#00E5CC', '#00D67B', '#B083FF', '#FFAA00'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getFirstDayOffset(year, month) {
    const d = new Date(year, month, 1).getDay();
    return (d + 6) % 7;
}

function AddEventModal({ t, date, onClose, onAdd }) {
    const [title, setTitle] = useState('');
    const [selDate, setSelDate] = useState(date || new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState('');
    const [recurrence, setRecurrence] = useState('none');
    const [time, setTime] = useState('09:00');
    const [loading, setLoading] = useState(false);
    const inp = { background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, padding: '9px 12px', color: t.t1, fontSize: 13, fontFamily: t.disp, width: '100%', outline: 'none', boxSizing: 'border-box' };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return toastError('Event title is required.');
        setLoading(true);
        try {
            await onAdd({ title, event_date: selDate, end_date: endDate || undefined, event_time: time ? time + ':00' : null, priority: 'medium', recurrence });
            toastSuccess('Event added!');
            onClose();
        } catch (err) {
            toastError(err.message || 'Failed to add event.');
        } finally { setLoading(false); }
    };

    return (
        <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="popIn" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24, width: 380, boxShadow: t.shadow }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.t1, marginBottom: 18 }}>New Event</div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title…" style={inp} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                            <div style={{ fontSize: 10, color: t.t3, marginBottom: 4 }}>From Date</div>
                            <input type="date" required value={selDate} onChange={e => setSelDate(e.target.value)} style={inp} />
                        </div>
                        <div>
                            <div style={{ fontSize: 10, color: t.t3, marginBottom: 4 }}>To Date (Optional)</div>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inp} min={selDate} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                            <div style={{ fontSize: 10, color: t.t3, marginBottom: 4 }}>Time (Optional)</div>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inp} />
                        </div>
                        <div>
                            <div style={{ fontSize: 10, color: t.t3, marginBottom: 4 }}>Recurrence</div>
                            <select value={recurrence} onChange={e => setRecurrence(e.target.value)} style={inp}>
                                <option value="none">None</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                        <button type="button" onClick={onClose} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 16px', color: t.t2, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ background: t.accent, border: 'none', borderRadius: 8, padding: '8px 18px', color: '#060B12', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>
                            {loading ? 'Adding…' : 'Add Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Calendar({ t }) {
    const { events = [], taskDates = [], createEvent, deleteEvent, fetchEventsForMonth } = useData();

    const now = new Date();
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed
    const [showAdd, setShowAdd] = useState(false);
    const [clickedDate, setClickedDate] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);

    const today = now.getDate();
    const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const offset = getFirstDayOffset(viewYear, viewMonth);

    const prevMonth = () => {
        let newYear = viewYear, newMonth = viewMonth;
        if (viewMonth === 0) { newYear = viewYear - 1; newMonth = 11; }
        else newMonth = viewMonth - 1;
        setViewYear(newYear);
        setViewMonth(newMonth);
        fetchEventsForMonth(newYear, newMonth + 1);
    };
    const nextMonth = () => {
        let newYear = viewYear, newMonth = viewMonth;
        if (viewMonth === 11) { newYear = viewYear + 1; newMonth = 0; }
        else newMonth = viewMonth + 1;
        setViewYear(newYear);
        setViewMonth(newMonth);
        fetchEventsForMonth(newYear, newMonth + 1);
    };
    const goToday = () => {
        const y = now.getFullYear(), m = now.getMonth();
        setViewYear(y);
        setViewMonth(m);
        fetchEventsForMonth(y, m + 1);
    };

    // Map events to day numbers for current view month
    const evMap = {};
    events.forEach(ev => {
        const start = new Date(ev.event_date);
        const endDt = ev.end_date ? new Date(ev.end_date) : new Date(start);
        start.setHours(0, 0, 0, 0);
        endDt.setHours(23, 59, 59, 999);

        if (ev.recurrence === 'none') {
            let cur = new Date(start);
            while (cur <= endDt) {
                if (cur.getFullYear() === viewYear && cur.getMonth() === viewMonth) {
                    const d = cur.getDate();
                    evMap[d] = evMap[d] || [];
                    if (!evMap[d].some(e => e.id === ev.id)) evMap[d].push(ev);
                }
                cur.setDate(cur.getDate() + 1);
            }
        }
        else if (ev.recurrence === 'weekly') {
            const firstOfViewMonth = new Date(viewYear, viewMonth, 1);
            const lastOfViewMonth = new Date(viewYear, viewMonth + 1, 0);
            let scan = new Date(firstOfViewMonth);
            while (scan <= lastOfViewMonth) {
                if (scan >= start && scan <= endDt) {
                    if (scan.getDay() === start.getDay()) {
                        const d = scan.getDate();
                        evMap[d] = evMap[d] || [];
                        if (!evMap[d].some(e => e.id === ev.id)) evMap[d].push(ev);
                    }
                }
                scan.setDate(scan.getDate() + 1);
            }
        }
        else if (ev.recurrence === 'monthly') {
            const scan = new Date(viewYear, viewMonth, start.getDate());
            if (scan.getDate() === start.getDate()) {
                if (scan >= start && scan <= endDt) {
                    const d = scan.getDate();
                    evMap[d] = evMap[d] || [];
                    if (!evMap[d].some(e => e.id === ev.id)) evMap[d].push(ev);
                }
            }
        }
    });

    // Task due-date dots
    const taskDaySet = new Set();
    taskDates.forEach(tk => {
        if (tk.due_date) {
            const d = new Date(tk.due_date);
            if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
                taskDaySet.add(d.getDate());
            }
        }
    });

    // Sidebar: unique events for current view month
    const monthEvsSet = new Set();
    const monthEventsList = [];
    Object.values(evMap).flat().forEach(ev => {
        if (!monthEvsSet.has(ev.id)) {
            monthEvsSet.add(ev.id);
            monthEventsList.push(ev);
        }
    });
    monthEventsList.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    const handleDayClick = (d) => {
        const pad = n => String(n).padStart(2, '0');
        setClickedDate(`${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`);
        setShowAdd(true);
    };

    const handleConfirmDelete = async () => {
        if (!eventToDelete) return;
        try {
            await deleteEvent(eventToDelete.id);
            toastSuccess('Event deleted.');
        } catch (e) {
            toastError(e.message || 'Failed to delete event.');
        } finally {
            setEventToDelete(null);
        }
    };

    return (
        <div style={{ padding: "22px 26px", display: "flex", gap: 18 }} className="cal-wrap">
            {/* Calendar grid */}
            <div style={{ flex: 1 }}>
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", boxShadow: t.shadow }}>
                    {/* Month nav */}
                    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button onClick={prevMonth} style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 7, width: 30, height: 30, cursor: 'pointer', color: t.t2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>‹</button>
                            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.4px", color: t.t1, minWidth: 160, textAlign: 'center' }}>
                                {MONTHS[viewMonth]} <span style={{ color: t.accent }}>{viewYear}</span>
                            </div>
                            <button onClick={nextMonth} style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 7, width: 30, height: 30, cursor: 'pointer', color: t.t2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>›</button>
                            {!isCurrentMonth && (
                                <button onClick={goToday} style={{ background: t.accentDim, border: `1px solid ${t.accent}33`, borderRadius: 6, padding: '3px 10px', color: t.accent, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: t.disp }}>Today</button>
                            )}
                        </div>
                        <button onClick={() => { setClickedDate(null); setShowAdd(true); }} style={{ background: t.accentDim, border: `1px solid ${t.accent}44`, borderRadius: 8, padding: '6px 14px', color: t.accent, fontFamily: t.disp, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <I d={IC.plus} sz={11} c={t.accent} /> Add Event
                        </button>
                    </div>

                    {/* Day headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "0 14px" }}>
                        {DAYS.map(d => <div key={d} style={{ padding: "10px 4px", textAlign: "center", fontSize: 10, fontWeight: 700, color: t.t3, letterSpacing: "0.8px", fontFamily: t.mono }}>{d}</div>)}
                    </div>

                    {/* Day cells */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, background: t.border, padding: "0 14px 14px" }}>
                        {[...Array(offset)].map((_, i) => <div key={`b${i}`} style={{ background: t.card, minHeight: 72 }} />)}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                            const dayEvs = evMap[d] || [];
                            const firstEv = dayEvs[0];
                            const c = firstEv ? PCOLORS[firstEv.id % PCOLORS.length] : null;
                            const isToday = isCurrentMonth && d === today;
                            const hasTask = taskDaySet.has(d);
                            return (
                                <div key={d} onClick={() => handleDayClick(d)} className="hvr" style={{ background: t.card, minHeight: 72, padding: 6, cursor: 'pointer', transition: 'background .15s' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: isToday ? t.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: isToday ? 800 : 400, color: isToday ? "#000" : t.t2, marginBottom: 3 }}>{d}</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                        {dayEvs.slice(0, 3).map((ev, idx) => {
                                            const c = PCOLORS[ev.id % PCOLORS.length];
                                            return (
                                                <div key={ev.id + "-" + idx} style={{ background: c + "18", border: `1px solid ${c}33`, borderRadius: 3, padding: "2px 4px", fontSize: 9, color: c, fontWeight: 600, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    {ev.recurrence && ev.recurrence !== 'none' && <span style={{ fontSize: 9 }}>🔁</span>}
                                                    {ev.title}
                                                </div>
                                            );
                                        })}
                                        {dayEvs.length > 3 && <div style={{ fontSize: 8, color: t.t3, marginTop: 1, fontFamily: t.mono }}>+{dayEvs.length - 3} more</div>}
                                    </div>
                                    {hasTask && !firstEv && <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.amber, margin: "3px auto 0" }} title="Task due" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div style={{ width: 240, flexShrink: 0 }} className="cal-sidebar">
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 15, boxShadow: t.shadow }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.t1, marginBottom: 12 }}>{MONTHS[viewMonth].slice(0, 3)} Events</div>
                    {monthEventsList.length === 0 && <div style={{ fontSize: 12, color: t.t3 }}>No events. Click a day to add one.</div>}
                    {monthEventsList.map(ev => {
                        const c = PCOLORS[ev.id % PCOLORS.length];
                        const d = new Date(ev.event_date);
                        const ed = ev.end_date ? new Date(ev.end_date) : null;
                        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + (ed ? ` - ${ed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : '');
                        return (
                            <div key={ev.id} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${t.border}`, alignItems: 'flex-start' }}>
                                <div style={{ width: 2.5, borderRadius: 2, background: c, flexShrink: 0, alignSelf: 'stretch', minHeight: 32 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: t.t1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {ev.recurrence && ev.recurrence !== 'none' && <span>🔁</span>}
                                        {ev.title}
                                    </div>
                                    <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>{label} · {ev.event_time ? ev.event_time.slice(0, 5) : 'All Day'}</div>
                                </div>
                                <button onClick={() => setEventToDelete(ev)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.t3, fontSize: 12, padding: '2px 4px', lineHeight: 1 }} title="Delete event" className="hvrI">✕</button>
                            </div>
                        );
                    })}
                    <button onClick={() => { setClickedDate(null); setShowAdd(true); }} style={{ width: "100%", marginTop: 11, padding: "7px", borderRadius: 8, border: `1px dashed ${t.border}`, background: "transparent", color: t.t3, fontSize: 12, fontFamily: t.disp, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <I d={IC.plus} sz={12} c={t.t3} /> Add Event
                    </button>
                </div>
            </div>

            {showAdd && <AddEventModal t={t} date={clickedDate} onClose={() => setShowAdd(false)} onAdd={createEvent} />}
            {eventToDelete && (
                <div onClick={() => setEventToDelete(null)} style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={e => e.stopPropagation()} className="popIn" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24, width: 320, boxShadow: t.shadow, textAlign: 'center' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: t.t1, marginBottom: 8 }}>Delete Event?</div>
                        <div style={{ fontSize: 13, color: t.t3, marginBottom: 20 }}>Are you sure you want to delete <span style={{ color: t.accent }}>"{eventToDelete.title}"</span>?</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setEventToDelete(null)} style={{ flex: 1, background: 'none', border: `1px solid ${t.border}`, borderRadius: 8, padding: '9px', color: t.t2, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 600 }}>Cancel</button>
                            <button onClick={handleConfirmDelete} style={{ flex: 1, background: t.red, border: 'none', borderRadius: 8, padding: '9px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
