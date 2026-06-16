import { useState } from "react";
import { PLANS, getPlan, isPro } from "../../utils/planLimits.js";

// ── Upgrade Modal ─────────────────────────────────────────────────────────────
export function UpgradeModal({ t, feature, onClose }) {
    const [billing, setBilling] = useState("monthly");

    const handleUpgrade = () => {
        // In a real deployment: redirect to Stripe/Razorpay checkout
        // For now: simulate pro unlock for demo
        const confirmed = window.confirm(
            "💳 In production, this opens the payment gateway.\n\n" +
            "For demo purposes, click OK to simulate a Pro upgrade."
        );
        if (confirmed) {
            localStorage.setItem("tf_plan", "pro");
            onClose?.();
            window.location.reload();
        }
    };

    const freeFeatures = [
        "10 Note Pages",
        "20 Tasks",
        "3 Team Members",
        "Basic block editor",
        "Calendar & Events",
    ];

    const proFeatures = [
        "Unlimited Note Pages",
        "Unlimited Tasks",
        "Unlimited Team Members",
        "Script & Lyrics Modes 📽️🎵",
        "Note Sharing with links",
        "PDF Export",
        "Real-time collaboration",
        "Priority support",
    ];

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 9000,
                background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 20,
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: "linear-gradient(145deg, #0A1628, #0D1F3C)",
                    border: "1px solid rgba(0,229,204,0.2)",
                    borderRadius: 24, padding: "36px 40px",
                    maxWidth: 560, width: "100%",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,114,255,0.08)",
                    position: "relative",
                }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute", top: 16, right: 16,
                        background: "none", border: "none", color: "#4A6A8A",
                        fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "4px 8px",
                    }}
                >×</button>

                {/* Badge */}
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 999,
                    background: "rgba(0,229,204,0.1)", border: "1px solid rgba(0,229,204,0.25)",
                    fontSize: 11, color: "#00E5CC", fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 700, letterSpacing: "0.5px", marginBottom: 16,
                }}>
                    ✦ UPGRADE TO PRO
                </div>

                <h2 style={{
                    margin: "0 0 8px", fontSize: 26, fontWeight: 800,
                    fontFamily: "'Outfit', sans-serif",
                    background: "linear-gradient(135deg, #00E5CC, #0072FF)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    lineHeight: 1.2,
                }}>
                    Unlock the full TaskFlow
                </h2>

                {feature && (
                    <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6A88AA", fontFamily: "'IBM Plex Mono', monospace" }}>
                        🔒 <strong style={{ color: "#94B8D6" }}>{feature}</strong> is a Pro feature.
                    </p>
                )}

                {/* Billing toggle */}
                <div style={{ display: "flex", gap: 0, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,229,204,0.15)", marginBottom: 24, width: "fit-content" }}>
                    {["monthly", "yearly"].map(b => (
                        <button key={b} onClick={() => setBilling(b)} style={{
                            padding: "7px 16px", border: "none", cursor: "pointer", fontSize: 12,
                            fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, transition: "all .15s",
                            background: billing === b ? "rgba(0,229,204,0.15)" : "transparent",
                            color: billing === b ? "#00E5CC" : "#4A6A8A",
                        }}>
                            {b.charAt(0).toUpperCase() + b.slice(1)}
                            {b === "yearly" && <span style={{ marginLeft: 6, fontSize: 9, color: "#00E5CC", background: "rgba(0,229,204,0.15)", padding: "1px 5px", borderRadius: 4 }}>-20%</span>}
                        </button>
                    ))}
                </div>

                {/* Plan comparison */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                    {/* Free */}
                    <div style={{ padding: "20px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div style={{ fontSize: 11, color: "#4A6A8A", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6, letterSpacing: "0.5px" }}>FREE</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#E2EFFF", marginBottom: 14 }}>₹0<span style={{ fontSize: 12, fontWeight: 400, color: "#4A6A8A" }}>/mo</span></div>
                        {freeFeatures.map(f => (
                            <div key={f} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center", fontSize: 11.5, color: "#6A88AA", fontFamily: "'Outfit', sans-serif" }}>
                                <span style={{ color: "#22c55e" }}>✓</span> {f}
                            </div>
                        ))}
                    </div>

                    {/* Pro */}
                    <div style={{
                        padding: "20px 18px", borderRadius: 14,
                        background: "linear-gradient(145deg, rgba(0,229,204,0.06), rgba(0,114,255,0.06))",
                        border: "1px solid rgba(0,229,204,0.25)",
                        position: "relative", overflow: "hidden",
                    }}>
                        <div style={{
                            position: "absolute", top: 0, right: 0, left: 0, height: 2,
                            background: "linear-gradient(90deg, #00E5CC, #0072FF)",
                        }} />
                        <div style={{ fontSize: 11, color: "#00E5CC", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6, letterSpacing: "0.5px", fontWeight: 700 }}>PRO ✦</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#E2EFFF", marginBottom: 14 }}>
                            {billing === "yearly" ? "₹239" : "₹299"}
                            <span style={{ fontSize: 12, fontWeight: 400, color: "#4A6A8A" }}>/mo</span>
                        </div>
                        {proFeatures.map(f => (
                            <div key={f} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center", fontSize: 11.5, color: "#94B8D6", fontFamily: "'Outfit', sans-serif" }}>
                                <span style={{ color: "#00E5CC" }}>✦</span> {f}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={handleUpgrade}
                    style={{
                        width: "100%", padding: "13px 0", borderRadius: 12,
                        border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg, #00E5CC, #0072FF)",
                        color: "#000", fontSize: 15, fontWeight: 800,
                        fontFamily: "'Outfit', sans-serif", letterSpacing: "0.3px",
                        boxShadow: "0 8px 24px rgba(0,229,204,0.25)",
                        transition: "transform .15s, box-shadow .15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,229,204,0.35)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,229,204,0.25)"; }}
                >
                    Upgrade to Pro — {billing === "yearly" ? "₹239" : "₹299"}/mo
                </button>

                <p style={{ textAlign: "center", fontSize: 10.5, color: "#2E4A68", marginTop: 10, fontFamily: "'IBM Plex Mono', monospace" }}>
                    Cancel anytime · Secure payment via Razorpay
                </p>
            </div>
        </div>
    );
}

// ── Plan Badge (for sidebar / topbar) ─────────────────────────────────────────
export function PlanBadge({ t, onClick }) {
    const plan = getPlan();
    return (
        <button
            onClick={onClick}
            title={plan === "pro" ? "TaskFlow Pro — All features unlocked" : "Upgrade to Pro"}
            style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 10px", borderRadius: 999, border: "none", cursor: "pointer",
                background: plan === "pro"
                    ? "linear-gradient(135deg, rgba(0,229,204,0.15), rgba(0,114,255,0.15))"
                    : "rgba(255,255,255,0.05)",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5,
                fontWeight: 700, letterSpacing: "0.4px",
                color: plan === "pro" ? "#00E5CC" : "#4A6A8A",
                transition: "all .15s",
            }}
        >
            {plan === "pro" ? "✦ PRO" : "FREE · Upgrade ↗"}
        </button>
    );
}

// ── Inline limit banner ────────────────────────────────────────────────────────
export function LimitBanner({ t, message, onUpgrade }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", borderRadius: 10, margin: "8px 0",
            background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)",
        }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <span style={{ flex: 1, fontSize: 12, color: "#FBBF24", fontFamily: "'Outfit', sans-serif" }}>
                {message}
            </span>
            <button
                onClick={onUpgrade}
                style={{
                    padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg, #00E5CC, #0072FF)",
                    color: "#000", fontSize: 11, fontWeight: 700,
                    fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap",
                }}
            >
                Upgrade
            </button>
        </div>
    );
}
