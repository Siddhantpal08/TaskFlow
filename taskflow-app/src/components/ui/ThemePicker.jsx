import { useState, useEffect, useRef } from "react";
import { THEMES, buildCustomTheme } from "../../data/themes.js";

const PRESETS = [
    { key: "dark", label: "Dark", bg: "#060B12", accent: "#00E5CC" },
    { key: "light", label: "Light", bg: "#EFF3FA", accent: "#007A6A" },
    { key: "pureDark", label: "Pure Black", bg: "#000000", accent: "#00E5CC" },
    { key: "pureLight", label: "Pure White", bg: "#FFFFFF", accent: "#007A6A" },
    { key: "sepia", label: "Sepia", bg: "#F5EDD6", accent: "#8B5E3C" },
    { key: "midnight", label: "Midnight", bg: "#0B0F1C", accent: "#60A5FA" },
];

export default function ThemePicker({ t, themeKey, customTheme, onApplyPreset, onApplyCustom, onClose }) {
    const [primary, setPrimary] = useState("#00E5CC");
    const [secondary, setSecondary] = useState("#0072FF");
    const [base, setBase] = useState("dark");
    const panelRef = useRef();

    // Close on outside click
    useEffect(() => {
        const h = e => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [onClose]);

    const preview = buildCustomTheme(primary, secondary, base);

    return (
        <div ref={panelRef} className="slideDown" style={{
            position: "fixed", top: 56, right: 16, zIndex: 500,
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 14, boxShadow: t.shadow, width: 280, overflow: "hidden",
        }}>
            {/* Header */}
            <div style={{ padding: "12px 16px 10px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: t.t1, fontFamily: t.disp }}>🎨 Theme</span>
                <button onClick={onClose} style={{ background: "none", border: "none", color: t.t3, fontSize: 16, cursor: "pointer" }}>×</button>
            </div>

            {/* Presets grid */}
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: t.t3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10, fontFamily: t.mono }}>Presets</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                    {PRESETS.map(p => (
                        <button key={p.key} onClick={() => onApplyPreset(p.key)}
                            title={p.label}
                            style={{
                                borderRadius: 8, border: themeKey === p.key ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                                cursor: "pointer", overflow: "hidden", padding: 0, transition: "all .15s",
                                boxShadow: themeKey === p.key ? t.accentGlow : "none",
                            }}>
                            <div style={{ background: p.bg, height: 36, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.accent }} />
                                <span style={{ fontSize: 9, color: p.bg === "#FFFFFF" || p.bg === "#F5EDD6" || p.bg === "#EFF3FA" ? "#333" : "#fff", fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>{p.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom builder */}
            <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: t.t3, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10, fontFamily: t.mono }}>Custom Builder</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Color pickers */}
                    <div style={{ display: "flex", gap: 8 }}>
                        <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 10, color: t.t3, fontFamily: t.mono }}>Accent</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 7, padding: "4px 8px" }}>
                                <input type="color" value={primary} onChange={e => setPrimary(e.target.value)}
                                    style={{ width: 22, height: 22, border: "none", background: "none", cursor: "pointer", padding: 0 }} />
                                <span style={{ fontSize: 10, fontFamily: t.mono, color: t.t2 }}>{primary}</span>
                            </div>
                        </label>
                        <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 10, color: t.t3, fontFamily: t.mono }}>Secondary</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 7, padding: "4px 8px" }}>
                                <input type="color" value={secondary} onChange={e => setSecondary(e.target.value)}
                                    style={{ width: 22, height: 22, border: "none", background: "none", cursor: "pointer", padding: 0 }} />
                                <span style={{ fontSize: 10, fontFamily: t.mono, color: t.t2 }}>{secondary}</span>
                            </div>
                        </label>
                    </div>

                    {/* Base toggle */}
                    <div style={{ display: "flex", gap: 6 }}>
                        {["dark", "light"].map(b => (
                            <button key={b} onClick={() => setBase(b)}
                                style={{
                                    flex: 1, padding: "6px 0", borderRadius: 7, border: base === b ? `1.5px solid ${primary}` : `1px solid ${t.border}`,
                                    background: base === b ? primary + "18" : t.inset, color: base === b ? primary : t.t2,
                                    fontFamily: t.disp, fontSize: 11.5, fontWeight: 600, cursor: "pointer", transition: "all .15s",
                                    textTransform: "capitalize"
                                }}>
                                {b === "dark" ? "🌙" : "☀️"} {b}
                            </button>
                        ))}
                    </div>

                    {/* Live preview */}
                    <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${t.border}` }}>
                        <div style={{ background: preview.bg, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: preview.accent }} />
                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: preview.noteText + "30" }} />
                            <div style={{ width: 24, height: 6, borderRadius: 3, background: preview.accent + "80" }} />
                        </div>
                        <div style={{ background: preview.card, padding: "6px 10px", display: "flex", gap: 6 }}>
                            <div style={{ height: 5, borderRadius: 3, background: preview.accent, width: "30%" }} />
                            <div style={{ height: 5, borderRadius: 3, background: preview.noteSubText + "40", flex: 1 }} />
                        </div>
                    </div>

                    <button onClick={() => onApplyCustom(primary, secondary, base)}
                        style={{
                            width: "100%", padding: "9px", borderRadius: 9, border: "none",
                            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                            color: "#000", fontWeight: 700, fontSize: 13, fontFamily: t.disp,
                            cursor: "pointer", transition: "all .2s",
                        }}>
                        Apply Custom Theme
                    </button>
                </div>
            </div>
        </div>
    );
}
