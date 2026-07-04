import { useState, useEffect } from "react";
import { I, IC } from "./ui/Icon.jsx";

export default function FocusTimer({ t }) {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState("work"); // work, break
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Timer ended
            setIsRunning(false);
            if (mode === "work") {
                setMode("break");
                setTimeLeft(5 * 60); // 5 min break
                // Play sound if possible
                try { new Audio("/chime.mp3").play().catch(() => {}); } catch(e) {}
            } else {
                setMode("work");
                setTimeLeft(25 * 60);
                try { new Audio("/chime.mp3").play().catch(() => {}); } catch(e) {}
            }
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft, mode]);

    const toggleTimer = (e) => {
        e.stopPropagation();
        setIsRunning(!isRunning);
    };

    const resetTimer = (e) => {
        e.stopPropagation();
        setIsRunning(false);
        setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60);
    };

    const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const secs = (timeLeft % 60).toString().padStart(2, "0");

    if (!expanded) {
        return (
            <div onClick={() => setExpanded(true)}
                style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
                    borderRadius: 20, background: isRunning ? t.accentDim : t.card,
                    border: `1px solid ${isRunning ? t.accent : t.border}`,
                    color: isRunning ? t.accent : t.t2, cursor: "pointer",
                    fontFamily: t.mono, fontSize: 12, fontWeight: 700,
                    transition: "all .15s", boxShadow: isRunning ? `0 0 10px ${t.accent}40` : "none"
                }}
                title="Focus Timer"
            >
                <span style={{ fontSize: 14 }}>{mode === "work" ? "⏱" : "☕"}</span>
                {mins}:{secs}
            </div>
        );
    }

    return (
        <div style={{ position: "relative", zIndex: 50 }}>
            {/* Backdrop for click outside */}
            <div onClick={() => setExpanded(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
            
            <div style={{
                position: "absolute", top: 0, right: 0, background: t.card,
                border: `1px solid ${t.border}`, borderRadius: 16, padding: "16px 20px",
                boxShadow: t.shadow, zIndex: 50, display: "flex", flexDirection: "column",
                alignItems: "center", minWidth: 200, gap: 12
            }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.t1, alignSelf: "flex-start" }}>
                    {mode === "work" ? "🧠 Focus Session" : "☕ Short Break"}
                </div>
                
                <div style={{ fontSize: 48, fontWeight: 900, color: isRunning ? t.accent : t.t1, fontFamily: t.mono, letterSpacing: "-2px", lineHeight: 1 }}>
                    {mins}:{secs}
                </div>
                
                <div style={{ display: "flex", gap: 10, width: "100%" }}>
                    <button onClick={toggleTimer} style={{
                        flex: 1, padding: "8px", borderRadius: 8,
                        background: isRunning ? t.inset : t.accent,
                        border: isRunning ? `1px solid ${t.border}` : "none",
                        color: isRunning ? t.t1 : "#000", fontWeight: 700,
                        fontFamily: t.disp, cursor: "pointer", fontSize: 13
                    }}>
                        {isRunning ? "Pause" : "Start"}
                    </button>
                    <button onClick={resetTimer} style={{
                        width: 40, padding: "8px", borderRadius: 8,
                        background: t.inset, border: `1px solid ${t.border}`,
                        color: t.t2, cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center"
                    }}>
                        ↻
                    </button>
                </div>
                
                <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 4 }}>
                    <button onClick={() => { setMode("work"); setTimeLeft(25 * 60); setIsRunning(false); }}
                        style={{ flex: 1, fontSize: 11, background: "none", border: "none", color: mode === "work" ? t.accent : t.t3, cursor: "pointer" }}>
                        25m Work
                    </button>
                    <button onClick={() => { setMode("break"); setTimeLeft(5 * 60); setIsRunning(false); }}
                        style={{ flex: 1, fontSize: 11, background: "none", border: "none", color: mode === "break" ? t.accent : t.t3, cursor: "pointer" }}>
                        5m Break
                    </button>
                </div>
            </div>
        </div>
    );
}
