import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { useData } from "../context/DataContext.jsx";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const PCOLORS = ['#FF3D5A', '#00E5CC', '#00D67B', '#B083FF', '#FFAA00'];

function getFirstDayOffset(year, month) {
    // returns 0=Mon..6=Sun offset
    const d = new Date(year, month, 1).getDay();
    return (d + 6) % 7;
}

function AddEventModal({ t, onClose, onAdd }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [time, setTime] = useState('09:00');
    const [loading, setLoading] = useState(false);
    const inp = { background: '#0C1420', border: `1px solid ${t.border}`, borderRadius: 8, padding: '9px 12px', color: t.t1, fontSize: 13, fontFamily: t.disp, width: '100%', outline: 'none' };

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await onAdd({ title, event_date: date, event_time: time + ':00', priority: 'medium' });
            onClose();
        } finally { setLoading(false); }
    };

    return (
        <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="popIn" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24, width: 380, boxShadow: t.shadow }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.t1, marginBottom: 18 }}>New Event</div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title…" style={inp} />
                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} style={inp} />
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inp} />
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
    const { events, createEvent } = useData();
    const [showAdd, setShowAdd] = useState(false);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const monthName = now.toLocaleDateString('en-US', { month: 'long' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = getFirstDayOffset(year, month);

    // Map events to day numbers for this month/year
    const evMap = {};
    events.forEach(ev => {
        const d = new Date(ev.event_date);
        if (d.getFullYear() === year && d.getMonth() === month) {
            evMap[d.getDate()] = ev;
        }
    });

    return (
        <div style={{ padding: "22px 26px", display: "flex", gap: 18 }} className="cal-wrap">
            {/* Calendar grid */}
            <div style={{ flex: 1 }}>
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", boxShadow: t.shadow }}>
                    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.4px", color: t.t1 }}>
                            {monthName} <span style={{ color: t.accent }}>{year}</span>
                        </div>
                        <button onClick={() => setShowAdd(true)} style={{ background: t.accentDim, border: `1px solid ${t.accent}44`, borderRadius: 8, padding: '6px 14px', color: t.accent, fontFamily: t.disp, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <I d={IC.plus} sz={11} c={t.accent} /> Add Event
                        </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "0 14px" }}>
                        {DAYS.map(d => <div key={d} style={{ padding: "10px 4px", textAlign: "center", fontSize: 10, fontWeight: 700, color: t.t3, letterSpacing: "0.8px", fontFamily: t.mono }}>{d}</div>)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, background: t.border, padding: "0 14px 14px" }}>
                        {[...Array(offset)].map((_, i) => <div key={`b${i}`} style={{ background: t.card, minHeight: 68 }} />)}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                            const ev = evMap[d];
                            const c = ev ? PCOLORS[ev.id % PCOLORS.length] : null;
                            const isToday = d === today;
                            return (
                                <div key={d} style={{ background: t.card, minHeight: 68, padding: 6 }}>
                                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: isToday ? t.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: isToday ? 800 : 400, color: isToday ? "#000" : d > today ? t.t2 : t.t3, marginBottom: 3 }}>{d}</div>
                                    {ev && <div style={{ background: c + "18", border: `1px solid ${c}33`, borderRadius: 3, padding: "2px 4px", fontSize: 9, color: c, fontWeight: 600, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{ev.title}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar events */}
            <div style={{ width: 240, flexShrink: 0 }} className="cal-sidebar">
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 15, boxShadow: t.shadow }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.t1, marginBottom: 12 }}>This Month</div>
                    {events.length === 0 && <div style={{ fontSize: 12, color: t.t3 }}>No events yet.</div>}
                    {events.filter(ev => {
                        const d = new Date(ev.event_date);
                        return d.getFullYear() === year && d.getMonth() === month;
                    }).map((ev, i) => {
                        const c = PCOLORS[ev.id % PCOLORS.length];
                        const d = new Date(ev.event_date);
                        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        return (
                            <div key={ev.id} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${t.border}` }}>
                                <div style={{ width: 2.5, borderRadius: 2, background: c, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: t.t1 }}>{ev.title}</div>
                                    <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>
                                        {label} · {ev.event_time ? ev.event_time.slice(0, 5) : '—'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <button onClick={() => setShowAdd(true)} style={{ width: "100%", marginTop: 11, padding: "7px", borderRadius: 8, border: `1px dashed ${t.border}`, background: "transparent", color: t.t3, fontSize: 12, fontFamily: t.disp, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <I d={IC.plus} sz={12} c={t.t3} /> Add Event
                    </button>
                </div>
            </div>

            {showAdd && <AddEventModal t={t} onClose={() => setShowAdd(false)} onAdd={createEvent} />}
        </div>
    );
}
