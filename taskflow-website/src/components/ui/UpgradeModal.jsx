import { useState } from "react";
import { getPlan } from "../../utils/planLimits.js";

export function UpgradeModal({ t, onClose }) {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div className="popIn" style={{
                background: `linear-gradient(145deg, ${t.surf}, ${t.card})`, border: `1px solid ${t.border}`, borderRadius: 24, padding: "32px 36px",
                maxWidth: 540, width: "100%", boxShadow: t.shadow || "0 32px 80px rgba(0,0,0,0.6)", position: "relative",
                maxHeight: "90vh", overflowY: "auto", scrollbarWidth: "none", textAlign: "center"
            }}>
                <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: t.t3, fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "4px 8px", transition: "color .15s" }}>×</button>
                
                <div style={{ width: 64, height: 64, borderRadius: 20, background: `linear-gradient(135deg, ${t.accent}, ${t.blue || '#0072FF'})`, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: `0 8px 32px ${t.accent}55` }}>
                    ✦
                </div>
                
                <h2 style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 900, color: t.t1 }}>TaskFlow Open Demo</h2>
                
                <p style={{ margin: "0 0 24px", fontSize: 14, color: t.t2, lineHeight: 1.6, fontFamily: t.disp }}>
                    This platform is currently operating as an open-source portfolio demonstration. All features, limits, and capabilities are completely unlocked for all users.
                </p>

                <div style={{ background: t.inset, padding: "16px", borderRadius: 12, border: `1px solid ${t.border}`, marginBottom: 24, textAlign: "left" }}>
                    <div style={{ fontSize: 13, color: t.t3, fontFamily: t.mono, marginBottom: 8, fontWeight: 700 }}>AVAILABLE FEATURES:</div>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: t.t2, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <li>Unlimited Note Pages & Tasks</li>
                        <li>Unlimited Team Members</li>
                        <li>Script & Lyrics Writing Modes</li>
                        <li>Public Note Sharing (Links)</li>
                        <li>Full Custom Theme Builder</li>
                    </ul>
                </div>

                <button onClick={onClose} style={{
                    padding: "12px 36px", background: `linear-gradient(135deg, ${t.accent}, ${t.blue || '#0072FF'})`, color: "#000", border: "none",
                    borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: t.disp, width: "100%", transition: "transform 0.15s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                    Got it
                </button>
            </div>
        </div>
    );
}

export function PlanBadge({ t, onClick, userPlan }) {
    const plan = userPlan || getPlan();
    return (
        <button
            onClick={onClick}
            title="TaskFlow Open Demo — All features unlocked"
            style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 13px", borderRadius: 999,
                border: `1px solid ${t.accent}55`,
                background: "linear-gradient(135deg, rgba(0,229,204,0.12), rgba(0,114,255,0.12))",
                fontFamily: t.mono, fontSize: 10.5,
                fontWeight: 700, letterSpacing: "0.5px",
                color: t.accent,
                cursor: onClick ? "pointer" : "default",
                userSelect: "none",
                transition: "all .2s"
            }}
            onMouseEnter={e => {
                if (onClick) e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={e => {
                if (onClick) e.currentTarget.style.transform = "scale(1)";
            }}
        >
            ✦ DEMO ACTIVE
        </button>
    );
}

export function LimitBanner({ t, message, onUpgrade }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", borderRadius: 10, margin: "8px 0",
            background: "rgba(0,229,204,0.08)", border: `1px solid ${t.accent}44`,
        }}>
            <span style={{ fontSize: 16 }}>✦</span>
            <span style={{ flex: 1, fontSize: 12, color: t.accent, fontFamily: t.disp }}>
                {message}
            </span>
        </div>
    );
}
