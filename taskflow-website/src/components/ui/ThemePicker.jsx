import { useState, useEffect, useRef } from "react";
import { THEMES, buildCustomTheme } from "../../data/themes.js";

const PRESETS = [
    { key: "dark",       label: "Dark",       bg: "#060B12", accent: "#00E5CC", dark: true },
    { key: "light",      label: "Light",      bg: "#EFF3FA", accent: "#007A6A", dark: false },
    { key: "pureDark",   label: "Pure Black", bg: "#000000", accent: "#00E5CC", dark: true },
    { key: "pureLight",  label: "Pure White", bg: "#FFFFFF", accent: "#007A6A", dark: false },
    { key: "sepia",      label: "Sepia",      bg: "#F5EDD6", accent: "#8B5E3C", dark: false },
    { key: "midnight",   label: "Midnight",   bg: "#0B0F1C", accent: "#60A5FA", dark: true },
    { key: "monochrome", label: "Mono",       bg: "#000000", accent: "#FFFFFF", dark: true },
    { key: "forest",     label: "Forest",     bg: "#030D08", accent: "#22C55E", dark: true },
    { key: "roseGold",   label: "Rose",       bg: "#0F090C", accent: "#F43F5E", dark: true },
    { key: "ocean",      label: "Ocean",      bg: "#010C14", accent: "#22D3EE", dark: true },
    { key: "sunset",     label: "Sunset",     bg: "#0F0805", accent: "#F97316", dark: true },
];

export default function ThemePicker({ t, themeKey, customTheme, onApplyPreset, onApplyCustom, onClose, embedded = false }) {
    const [primary,   setPrimary]   = useState(customTheme?.accent   || "#00E5CC");
    const [secondary, setSecondary] = useState(customTheme?.blue     || "#0072FF");
    const [base,      setBase]      = useState("dark");
    const panelRef = useRef();

    // Close on outside click (non-embedded only)
    useEffect(() => {
        if (embedded) return;
        const h = e => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [onClose, embedded]);

    const preview = buildCustomTheme(primary, secondary, base);

    const panelStyle = embedded
        ? {
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 20, boxShadow: t.shadow, width: "100%", maxWidth: 480, overflow: "hidden",
        }
        : {
            position: "fixed", top: 56, right: 16, zIndex: 500,
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 16, boxShadow: t.shadow, width: 320, overflow: "hidden",
        };

    return (
        <div ref={panelRef} className={embedded ? "" : "slideDown"} style={panelStyle}>
            {/* Header */}
            <div style={{ padding: "14px 18px 12px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.t1, fontFamily: t.disp }}>🎨 Theme Studio</span>
                <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: t.t3, fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "2px 6px", borderRadius: 5 }}>×</button>
            </div>

            {/* Presets grid */}
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: t.t3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10, fontFamily: t.mono }}>Built-in Presets</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
                    {PRESETS.map(p => {
                        const active = themeKey === p.key;
                        return (
                            <button type="button" key={p.key} onClick={() => onApplyPreset(p.key)}
                                title={p.label}
                                style={{
                                    borderRadius: 10, border: active ? `2.5px solid ${t.accent}` : `1px solid ${t.border}`,
                                    cursor: "pointer", overflow: "hidden", padding: 0,
                                    transition: "all .18s", outline: "none",
                                    boxShadow: active ? t.accentGlow : "none",
                                    transform: active ? "scale(1.05)" : "scale(1)",
                                }}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.transform = "scale(1.04)"; }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.transform = "scale(1)"; }}
                            >
                                {/* Mini app preview */}
                                <div style={{ background: p.bg, height: 44, padding: "4px", display: "flex", flexDirection: "column", gap: 3 }}>
                                    <div style={{ display: "flex", gap: 3, flex: 1 }}>
                                        {/* Sidebar strip */}
                                        <div style={{ width: 10, borderRadius: 2, background: p.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }} />
                                        {/* Content area */}
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                                            <div style={{ height: 3, borderRadius: 2, background: p.accent, width: "60%", opacity: 0.9 }} />
                                            <div style={{ height: 2, borderRadius: 2, background: p.dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)", width: "90%" }} />
                                            <div style={{ height: 2, borderRadius: 2, background: p.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", width: "70%" }} />
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 3 }}>
                                        <div style={{ height: 3, flex: 1, borderRadius: 2, background: p.accent + "60" }} />
                                        <div style={{ height: 3, flex: 1, borderRadius: 2, background: p.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
                                    </div>
                                </div>
                                <div style={{ background: p.dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", padding: "3px 0", textAlign: "center" }}>
                                    <span style={{ fontSize: 8.5, fontFamily: "'Outfit',sans-serif", fontWeight: 600, color: p.dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}>{p.label}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Custom builder */}
            <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: t.t3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12, fontFamily: t.mono }}>Custom Builder</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Color pickers */}
                    <div style={{ display: "flex", gap: 8 }}>
                        <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                            <span style={{ fontSize: 10, color: t.t3, fontFamily: t.mono }}>Accent Color</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 8, padding: "5px 9px" }}>
                                <input type="color" value={primary} onChange={e => setPrimary(e.target.value)}
                                    style={{ width: 24, height: 24, border: "none", background: "none", cursor: "pointer", padding: 0 }} />
                                <input type="text" value={primary} onChange={e => setPrimary(e.target.value)}
                                    style={{ fontSize: 10, fontFamily: t.mono, color: t.t2, border: "none", background: "none", outline: "none", width: 55 }} />
                            </div>
                        </label>
                        <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                            <span style={{ fontSize: 10, color: t.t3, fontFamily: t.mono }}>Secondary</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 8, padding: "5px 9px" }}>
                                <input type="color" value={secondary} onChange={e => setSecondary(e.target.value)}
                                    style={{ width: 24, height: 24, border: "none", background: "none", cursor: "pointer", padding: 0 }} />
                                <input type="text" value={secondary} onChange={e => setSecondary(e.target.value)}
                                    style={{ fontSize: 10, fontFamily: t.mono, color: t.t2, border: "none", background: "none", outline: "none", width: 55 }} />
                            </div>
                        </label>
                    </div>

                    {/* Base toggle */}
                    <div style={{ display: "flex", gap: 6 }}>
                        {["dark", "light"].map(b => (
                            <button type="button" key={b} onClick={() => setBase(b)}
                                style={{
                                    flex: 1, padding: "7px 0", borderRadius: 8,
                                    border: base === b ? `1.5px solid ${primary}` : `1px solid ${t.border}`,
                                    background: base === b ? primary + "18" : t.inset,
                                    color: base === b ? primary : t.t2,
                                    fontFamily: t.disp, fontSize: 12, fontWeight: 600,
                                    cursor: "pointer", transition: "all .15s", textTransform: "capitalize",
                                }}>
                                {b === "dark" ? "🌙" : "☀️"} {b}
                            </button>
                        ))}
                    </div>

                    {/* Full preview — shows sidebar, topbar, card */}
                    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}`, boxShadow: `0 4px 16px ${primary}18` }}>
                        {/* Topbar */}
                        <div style={{ background: preview.bg, borderBottom: `1px solid ${preview.border}`, padding: "6px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: preview.accent }} />
                            <div style={{ flex: 1, height: 4, borderRadius: 3, background: preview.t1 + "20" }} />
                            <div style={{ width: 20, height: 5, borderRadius: 3, background: preview.accent + "60" }} />
                        </div>
                        {/* Body */}
                        <div style={{ display: "flex", background: preview.bg }}>
                            {/* Sidebar */}
                            <div style={{ width: 36, background: preview.nav, borderRight: `1px solid ${preview.border}`, padding: "6px 4px", display: "flex", flexDirection: "column", gap: 4 }}>
                                {[1,1,1,0].map((a,i) => (
                                    <div key={i} style={{ height: 5, borderRadius: 3, background: a ? preview.accent + (i===0?"":"30") : preview.t3, width: a?"90%":"60%" }} />
                                ))}
                            </div>
                            {/* Content */}
                            <div style={{ flex: 1, padding: "6px 8px", display: "flex", flexDirection: "column", gap: 5 }}>
                                <div style={{ height: 6, borderRadius: 3, background: preview.t1 + "30", width: "55%" }} />
                                <div style={{ height: 4, borderRadius: 3, background: preview.t2 + "20", width: "85%" }} />
                                {/* Cards */}
                                <div style={{ display: "flex", gap: 5, marginTop: 2 }}>
                                    {[preview.accent, preview.green, preview.amber].map((c, i) => (
                                        <div key={i} style={{ flex: 1, height: 22, borderRadius: 5, background: preview.card, border: `1px solid ${c}28`, display: "flex", alignItems: "flex-start", padding: "3px 4px" }}>
                                            <div style={{ width: "100%", height: 2, borderRadius: 2, background: c, opacity: 0.8 }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="button" onClick={() => onApplyCustom(primary, secondary, base)}
                        style={{
                            width: "100%", padding: "10px", borderRadius: 10, border: "none",
                            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                            color: "#000", fontWeight: 800, fontSize: 13, fontFamily: t.disp,
                            cursor: "pointer", transition: "all .2s", letterSpacing: "0.2px",
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "none"}
                    >
                        ✦ Apply Custom Theme
                    </button>
                </div>
            </div>
        </div>
    );
}
