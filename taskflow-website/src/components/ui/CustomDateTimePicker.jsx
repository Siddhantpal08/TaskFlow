import { useState, useRef, useEffect } from "react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const DAYS_SHORT = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function CustomDateTimePicker({ t, value, onChange, type = "date", min = "", placeholder = "Select..." }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    // Date calculations states
    const initialDate = value ? new Date(value) : new Date();
    const [viewYear, setViewYear] = useState(isNaN(initialDate.getTime()) ? new Date().getFullYear() : initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(isNaN(initialDate.getTime()) ? new Date().getMonth() : initialDate.getMonth());

    // Selected state
    const selectedDate = value && type === "date" ? new Date(value) : null;

    // Time states
    const [timeHour, setTimeHour] = useState(value && type === "time" ? parseInt(value.split(":")[0]) || 9 : 9);
    const [timeMin, setTimeMin] = useState(value && type === "time" ? parseInt(value.split(":")[1]) || 0 : 0);

    // Sync state with incoming value
    useEffect(() => {
        if (value) {
            if (type === "date") {
                const d = new Date(value);
                if (!isNaN(d.getTime())) {
                    setViewYear(d.getFullYear());
                    setViewMonth(d.getMonth());
                }
            } else if (type === "time") {
                const parts = value.split(":");
                setTimeHour(parseInt(parts[0]) || 0);
                setTimeMin(parseInt(parts[1]) || 0);
            }
        }
    }, [value, type]);

    // Click outside handler
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Get days in month
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOffset = (year, month) => {
        const d = new Date(year, month, 1).getDay();
        return (d + 6) % 7; // Monday start offset
    };

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const offset = getFirstDayOffset(viewYear, viewMonth);

    const prevMonth = (e) => {
        e.preventDefault();
        setViewMonth((m) => {
            if (m === 0) {
                setViewYear((y) => y - 1);
                return 11;
            }
            return m - 1;
        });
    };

    const nextMonth = (e) => {
        e.preventDefault();
        setViewMonth((m) => {
            if (m === 11) {
                setViewYear((y) => y + 1);
                return 0;
            }
            return m + 1;
        });
    };

    const handleSelectDay = (day) => {
        const pad = (n) => String(n).padStart(2, "0");
        const formatted = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
        onChange(formatted);
        setOpen(false);
    };

    const handleTimeChange = (h, m) => {
        const pad = (n) => String(n).padStart(2, "0");
        onChange(`${pad(h)}:${pad(m)}`);
    };

    // Format display label
    let label = placeholder;
    if (value) {
        if (type === "date") {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            }
        } else if (type === "time") {
            const hr = timeHour % 12 || 12;
            const ampm = timeHour >= 12 ? "PM" : "AM";
            const minStr = String(timeMin).padStart(2, "0");
            label = `${hr}:${minStr} ${ampm}`;
        }
    }

    return (
        <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    background: t.inset || t.bg,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    padding: "9px 12px",
                    color: value ? t.t1 : t.t3,
                    fontSize: 13,
                    fontFamily: t.disp,
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    outline: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <span>{label}</span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>{type === "date" ? "📅" : "🕒"}</span>
            </button>

            {open && (
                <div
                    className="popIn"
                    style={{
                        position: "absolute",
                        top: "105%",
                        left: 0,
                        zIndex: 1000,
                        background: t.card,
                        border: `1px solid ${t.border}`,
                        borderRadius: 12,
                        padding: 14,
                        boxShadow: t.shadow || "0 8px 24px rgba(0,0,0,0.3)",
                        width: type === "date" ? 250 : 180,
                        userSelect: "none"
                    }}
                >
                    {type === "date" ? (
                        <div>
                            {/* Month Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                <button
                                    onClick={prevMonth}
                                    style={{ background: "none", border: "none", color: t.t2, cursor: "pointer", fontSize: 13 }}
                                >
                                    ◀
                                </button>
                                <div style={{ fontSize: 12, fontWeight: 700, color: t.t1, fontFamily: t.disp }}>
                                    {MONTHS[viewMonth]} {viewYear}
                                </div>
                                <button
                                    onClick={nextMonth}
                                    style={{ background: "none", border: "none", color: t.t2, cursor: "pointer", fontSize: 13 }}
                                >
                                    ▶
                                </button>
                            </div>

                            {/* Week Header */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
                                {DAYS_SHORT.map((d) => (
                                    <div key={d} style={{ fontSize: 9.5, fontWeight: 700, color: t.t3, textAlign: "center", fontFamily: t.mono }}>
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                                {[...Array(offset)].map((_, i) => (
                                    <div key={`o-${i}`} />
                                ))}
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                                    const isSelected = selectedDate &&
                                        selectedDate.getFullYear() === viewYear &&
                                        selectedDate.getMonth() === viewMonth &&
                                        selectedDate.getDate() === d;

                                    return (
                                        <button
                                            type="button"
                                            key={`d-${d}`}
                                            onClick={() => handleSelectDay(d)}
                                            style={{
                                                background: isSelected ? t.accent : "none",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "4px 0",
                                                color: isSelected ? "#000" : t.t2,
                                                fontSize: 11,
                                                cursor: "pointer",
                                                fontFamily: t.mono,
                                                transition: "background 0.1s"
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = t.border;
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = "none";
                                            }}
                                        >
                                            {d}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Time Picker selectors */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nh = (timeHour + 1) % 24;
                                                setTimeHour(nh);
                                                handleTimeChange(nh, timeMin);
                                            }}
                                            style={{ background: "none", border: "none", color: t.t2, cursor: "pointer" }}
                                        >
                                            ▲
                                        </button>
                                        <span style={{ fontSize: 16, fontWeight: 700, color: t.t1, fontFamily: t.mono, margin: "4px 0" }}>
                                            {String(timeHour % 12 || 12).padStart(2, "0")}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nh = (timeHour - 1 + 24) % 24;
                                                setTimeHour(nh);
                                                handleTimeChange(nh, timeMin);
                                            }}
                                            style={{ background: "none", border: "none", color: t.t2, cursor: "pointer" }}
                                        >
                                            ▼
                                        </button>
                                    </div>
                                    <span style={{ color: t.t2, fontSize: 16, fontWeight: 700 }}>:</span>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nm = (timeMin + 5) % 60;
                                                setTimeMin(nm);
                                                handleTimeChange(timeHour, nm);
                                            }}
                                            style={{ background: "none", border: "none", color: t.t2, cursor: "pointer" }}
                                        >
                                            ▲
                                        </button>
                                        <span style={{ fontSize: 16, fontWeight: 700, color: t.t1, fontFamily: t.mono, margin: "4px 0" }}>
                                            {String(timeMin).padStart(2, "0")}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nm = (timeMin - 5 + 60) % 60;
                                                setTimeMin(nm);
                                                handleTimeChange(timeHour, nm);
                                            }}
                                            style={{ background: "none", border: "none", color: t.t2, cursor: "pointer" }}
                                        >
                                            ▼
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nh = (timeHour + 12) % 24;
                                            setTimeHour(nh);
                                            handleTimeChange(nh, timeMin);
                                        }}
                                        style={{
                                            background: t.border,
                                            border: "none",
                                            borderRadius: 5,
                                            padding: "4px 6px",
                                            color: t.t1,
                                            fontSize: 10,
                                            cursor: "pointer",
                                            fontFamily: t.disp,
                                            fontWeight: 700
                                        }}
                                    >
                                        {timeHour >= 12 ? "PM" : "AM"}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    style={{
                                        background: t.accent,
                                        color: "#000",
                                        border: "none",
                                        borderRadius: 6,
                                        padding: "6px 0",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                        fontSize: 11.5,
                                        fontFamily: t.disp
                                    }}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
