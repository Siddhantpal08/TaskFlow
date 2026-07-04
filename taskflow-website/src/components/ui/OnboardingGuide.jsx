import { useState, useEffect } from "react";

const STEPS = [
    {
        id: "sidebar",
        emoji: "🧭",
        title: "Your Navigation Hub",
        desc: "The sidebar on the left is your main menu. Switch between Dashboard, Tasks, Calendar, Notes, and Team instantly. Click the arrow to collapse it for more space.",
        highlight: "sidebar-desktop",
        position: "right",
    },
    {
        id: "capture",
        emoji: "⚡",
        title: "Create Tasks in One Click",
        desc: "The amber '+ New Task' button in the top bar is your fastest way to capture a task. Use it before you forget!",
        highlight: "topbar-capture-btn",
        position: "bottom",
    },
    {
        id: "dashboard",
        emoji: "📊",
        title: "Your Command Center",
        desc: "The Dashboard shows your task stats, upcoming events, and what needs attention right now. Red = overdue, Amber = active, Green = done.",
        highlight: null,
        position: "center",
    },
    {
        id: "command-palette",
        emoji: "🎯",
        title: "Command Palette — Your Shortcut Hub",
        desc: "Press Ctrl+K (or ⌘K on Mac) anywhere to open the Command Palette. Jump to any page, create a task, switch themes, and more — all without lifting your hands from the keyboard.",
        highlight: "cmd-palette-btn",
        position: "bottom",
    },
    {
        id: "notes",
        emoji: "📝",
        title: "Your Personal Notion",
        desc: "Notes lets you write rich documents with headings, todos, code blocks, and more. Type '/' inside a note for a block command menu. Everything auto-saves to the cloud.",
        highlight: null,
        position: "center",
    },
    {
        id: "team",
        emoji: "👥",
        title: "Collaborate with Your Team",
        desc: "In Team, you can create or join a team using a code, assign tasks to members, and chat in real-time. Every member's progress is visible at a glance.",
        highlight: null,
        position: "center",
    },
];

const STORAGE_KEY = "tf_guide_seen_v5";

export default function OnboardingGuide({ t }) {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem(STORAGE_KEY);
        if (!seen) {
            // Small delay so the app finishes rendering first
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        setExiting(true);
        setTimeout(() => {
            setVisible(false);
            localStorage.setItem(STORAGE_KEY, "1");
        }, 300);
    };

    const next = () => {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            dismiss();
        }
    };

    const prev = () => {
        if (step > 0) setStep(s => s - 1);
    };

    if (!visible) return null;

    const current = STEPS[step];
    const progress = ((step + 1) / STEPS.length) * 100;

    return (
        <>
            <style>{`
                @keyframes guideIn {
                    from { opacity: 0; transform: scale(0.94) translateY(12px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes guideOut {
                    from { opacity: 1; transform: scale(1); }
                    to   { opacity: 0; transform: scale(0.96); }
                }
                .guide-card {
                    animation: ${exiting ? "guideOut" : "guideIn"} 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                @keyframes dot-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.4); opacity: 1; }
                }
            `}</style>

            {/* Backdrop */}
            <div
                onClick={dismiss}
                style={{
                    position: "fixed", inset: 0, zIndex: 9800,
                    background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 20,
                }}
            >
                {/* Guide Card */}
                <div
                    className="guide-card"
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: `linear-gradient(145deg, ${t.surf}, ${t.card})`,
                        border: `1px solid ${t.accent}33`,
                        borderRadius: 24, padding: "36px 40px",
                        maxWidth: 480, width: "100%",
                        boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px ${t.accent}11`,
                        position: "relative",
                    }}
                >
                    {/* Progress bar */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "24px 24px 0 0", background: t.border, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${t.accent}, #F59E0B)`, transition: "width .4s ease", borderRadius: "24px 0 0 0" }} />
                    </div>

                    <button
                        onClick={dismiss}
                        style={{
                            position: "absolute", top: 16, right: 16,
                            background: "none", border: `1px solid ${t.border}`,
                            borderRadius: 20, padding: "4px 12px",
                            color: t.t3, fontSize: 11, fontFamily: t.mono,
                            cursor: "pointer", transition: "all .15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = t.t2; e.currentTarget.style.color = t.t2; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.t3; }}
                    >
                        Don't show again (Skip)
                    </button>

                    {/* Step indicator dots */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                onClick={() => setStep(i)}
                                style={{
                                    width: i === step ? 20 : 6, height: 6, borderRadius: 3,
                                    background: i === step ? t.accent : i < step ? t.accent + "55" : t.border,
                                    transition: "all .3s ease", cursor: "pointer",
                                }}
                            />
                        ))}
                    </div>

                    {/* Emoji */}
                    <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>{current.emoji}</div>

                    {/* Step label */}
                    <div style={{ fontSize: 11, fontFamily: t.mono, color: t.accent, letterSpacing: "0.6px", fontWeight: 700, marginBottom: 8 }}>
                        STEP {step + 1} OF {STEPS.length}
                    </div>

                    {/* Title */}
                    <div style={{ fontSize: 24, fontWeight: 800, color: t.t1, letterSpacing: "-0.5px", marginBottom: 12, lineHeight: 1.2 }}>
                        {current.title}
                    </div>

                    {/* Description */}
                    <div style={{ fontSize: 14, color: t.t2, lineHeight: 1.7, fontFamily: t.disp, marginBottom: 32 }}>
                        {current.desc}
                    </div>

                    {/* Navigation buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <button
                            onClick={prev}
                            disabled={step === 0}
                            style={{
                                background: "none", border: `1px solid ${t.border}`,
                                borderRadius: 10, padding: "10px 18px",
                                color: step === 0 ? t.t3 : t.t2, fontSize: 13, fontFamily: t.disp,
                                cursor: step === 0 ? "default" : "pointer",
                                opacity: step === 0 ? 0.4 : 1,
                                transition: "all .15s",
                            }}
                        >
                            ← Back
                        </button>

                        <button
                            onClick={next}
                            style={{
                                background: step === STEPS.length - 1
                                    ? `linear-gradient(135deg, #F59E0B, #F97316)`
                                    : `linear-gradient(135deg, ${t.accent}, #0072FF)`,
                                border: "none",
                                borderRadius: 10, padding: "11px 28px",
                                color: "#000", fontSize: 14, fontWeight: 800, fontFamily: t.disp,
                                cursor: "pointer",
                                boxShadow: step === STEPS.length - 1
                                    ? "0 6px 20px #F59E0B44"
                                    : `0 6px 20px ${t.accent}44`,
                                transition: "all .2s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                        >
                            {step === STEPS.length - 1 ? "🚀 Let's Go!" : "Next →"}
                        </button>
                    </div>

                    {/* Keyboard hint */}
                    <div style={{ marginTop: 16, textAlign: "center", fontSize: 10, color: t.t3, fontFamily: t.mono }}>
                        Press <kbd style={{ background: t.border, padding: "1px 6px", borderRadius: 4 }}>Esc</kbd> to skip · Click outside to dismiss
                    </div>
                </div>
            </div>
        </>
    );
}
