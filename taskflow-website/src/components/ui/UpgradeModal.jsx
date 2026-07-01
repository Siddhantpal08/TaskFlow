import { useState } from "react";
import { PLANS, getPlan, isPro } from "../../utils/planLimits.js";
import { I, IC } from "./Icon.jsx";
import { billingApi } from "../../api/billing.js";

import { useAuth } from "../../context/AuthContext.jsx";

export function UpgradeModal({ t, feature, onClose }) {
    const { user } = useAuth();
    const currentPlan = user?.plan || localStorage.getItem('tf_plan') || 'free';
    const isAlreadyPaid = currentPlan === 'pro' || currentPlan === 'starter';

    const [step, setStep] = useState(feature === "Upgrade Successful!" ? "success" : "plan"); // plan | billing | success
    const [billing, setBilling] = useState("yearly"); // monthly | yearly
    const [selectedPlan, setSelectedPlan] = useState("pro"); // starter | pro
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const freeFeatures = [
        "10 Note Pages",
        "20 Tasks",
        "3 Team Members",
        "Basic block editor",
    ];

    const starterFeatures = [
        "25 Note Pages",
        "100 Tasks",
        "5 Team Members",
        "Note Sharing 🔗",
        "Custom Date & Time Pickers",
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

    const quotes = [
        { text: "“TaskFlow saved our team 10+ hours a week. The notes editor is Notion-fast.”", author: "Aryan K., Dev Lead" },
        { text: "“The custom themes are gorgeous. Easily the most premium PM tool I've used.”", author: "Rohit J., Designer" }
    ];

    const handleSelectPlan = async (planKey) => {
        setSelectedPlan(planKey);
        setStep("billing");
        setLoading(true);
        setError("");
        try {
            const res = await billingApi.createCheckoutSession(billing, planKey);
            if (res.url) {
                window.location.href = res.url;
            } else {
                setError("Failed to create LemonSqueezy checkout session.");
            }
        } catch (err) {
            setError(err.message || "Failed to contact billing service.");
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = () => {
        localStorage.setItem("tf_plan", selectedPlan);
        onClose?.();
        window.location.reload();
    };

    // Styling helpers using theme t prop
    const modalOverlayStyle = {
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
    };

    const modalBodyStyle = {
        background: `linear-gradient(145deg, ${t.surf}, ${t.card})`,
        border: `1px solid ${t.border}`,
        borderRadius: 24, padding: "32px 36px",
        maxWidth: step === "plan" ? 820 : 540, width: "100%",
        boxShadow: t.shadow || "0 32px 80px rgba(0,0,0,0.6)",
        position: "relative",
        maxHeight: "90vh",
        overflowY: "auto",
        scrollbarWidth: "none",
        transition: "max-width 0.25s ease"
    };

    const closeButtonStyle = {
        position: "absolute", top: 16, right: 16,
        background: "none", border: "none", color: t.t3,
        fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "4px 8px",
        transition: "color .15s"
    };

    const labelStyle = {
        display: "block", fontSize: 11.5, fontWeight: 700,
        color: t.t2, marginBottom: 6, textTransform: "uppercase",
        letterSpacing: "0.5px"
    };

    const inputStyle = {
        width: "100%", background: t.inset, border: `1px solid ${t.border}`,
        borderRadius: 10, padding: "10px 14px", color: t.t1,
        fontSize: 13, fontFamily: t.disp, boxSizing: "border-box",
        marginBottom: 16, transition: "border-color .15s"
    };

    const ctaButtonStyle = {
        width: "100%", padding: "12px 0", borderRadius: 12,
        border: "none", cursor: "pointer",
        background: `linear-gradient(135deg, ${t.accent}, ${t.blue || '#0072FF'})`,
        color: "#000", fontSize: 14, fontWeight: 800,
        fontFamily: t.disp, letterSpacing: "0.3px",
        boxShadow: t.accentGlow,
        transition: "transform .15s, box-shadow .15s",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8
    };

    // Price calculation
    const getPlanPrice = (plan) => {
        if (plan === "starter") {
            return billing === "yearly" ? "₹499/year" : "₹49/month";
        }
        return billing === "yearly" ? "₹1000/year" : "₹99/month";
    };

    // ── Already-subscribed guard screen ─────────────────────────────────────
    if (isAlreadyPaid && feature !== "Upgrade Successful!") {
        return (
            <div onClick={onClose} style={modalOverlayStyle}>
                <div onClick={e => e.stopPropagation()} style={{ ...modalBodyStyle, maxWidth: 480, textAlign: "center" }}>
                    <button onClick={onClose} style={closeButtonStyle}
                        onMouseEnter={e => e.currentTarget.style.color = t.t1}
                        onMouseLeave={e => e.currentTarget.style.color = t.t3}>
                        ×
                    </button>
                    <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 999, background: `linear-gradient(135deg, ${t.accent}22, #0072FF22)`, border: `1px solid ${t.accent}55`, fontSize: 11, color: t.accent, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.5px", marginBottom: 18 }}>
                        ✦ TASKFLOW {currentPlan.toUpperCase()} — ACTIVE
                    </div>
                    <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: t.t1 }}>You're already subscribed!</h3>
                    <p style={{ margin: "0 0 24px", fontSize: 13, color: t.t2, lineHeight: 1.7, fontFamily: t.disp }}>
                        Your <strong style={{ color: t.accent }}>{currentPlan.toUpperCase()}</strong> plan is active and fully unlocked.
                        All premium features are available to you.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                        {["Unlimited Notes", "All Writing Modes", "PDF Export", "Priority Support"].map(f => (
                            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 9, background: `${t.accent}08`, border: `1px solid ${t.accent}22`, fontSize: 12, color: t.accent, fontFamily: t.disp }}>
                                <span>✓</span> {f}
                            </div>
                        ))}
                    </div>
                    <button onClick={onClose} style={{ padding: "11px 32px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${t.accent}, #0072FF)`, color: "#000", fontSize: 14, fontWeight: 800, fontFamily: t.disp }}>
                        Continue to TaskFlow
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div onClick={onClose} style={modalOverlayStyle}>
            {/* Inline checkmark animation styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                .tf-checkmark-circle {
                    stroke-dasharray: 166;
                    stroke-dashoffset: 166;
                    stroke-width: 2;
                    stroke-miterlimit: 10;
                    stroke: #00D67B;
                    fill: none;
                    animation: tf-stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
                .tf-checkmark {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    display: block;
                    stroke-width: 2;
                    stroke: #fff;
                    stroke-miterlimit: 10;
                    box-shadow: inset 0px 0px 0px #00D67B;
                    animation: tf-fill .4s ease-in-out .4s forwards, tf-scale .3s ease-in-out .9s forwards;
                }
                .tf-checkmark-check {
                    transform-origin: 50% 50%;
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    animation: tf-stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
                }
                @keyframes tf-stroke {
                    100% { stroke-dashoffset: 0; }
                }
                @keyframes tf-scale {
                    0%, 100% { transform: none; }
                    50% { transform: scale3d(1.1, 1.1, 1); }
                }
                @keyframes tf-fill {
                    100% { box-shadow: inset 0px 0px 0px 30px #00D67B; }
                }
            `}} />

            <div onClick={e => e.stopPropagation()} style={modalBodyStyle}>
                {/* Close Button */}
                {step !== "success" && (
                    <button
                        onClick={onClose}
                        style={closeButtonStyle}
                        onMouseEnter={e => e.currentTarget.style.color = t.t1}
                        onMouseLeave={e => e.currentTarget.style.color = t.t3}
                        aria-label="Close modal"
                    >×</button>
                )}

                {/* STEP 1: PLAN SELECTION */}
                {step === "plan" && (
                    <div>
                        {/* Header Section */}
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: t.accentDim, border: `1px solid ${t.accent}40`, fontSize: 11, color: t.accent, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.5px", marginBottom: 16 }}>
                            ✦ CHOOSE YOUR FLOW
                        </div>

                        <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, fontFamily: t.disp, background: `linear-gradient(135deg, ${t.accent}, ${t.blue || '#0072FF'})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
                            Unlock the full TaskFlow Experience
                        </h2>

                        {feature && (
                            <p style={{ margin: "0 0 20px", fontSize: 12.5, color: t.t2, fontFamily: t.disp }}>
                                🔒 <strong style={{ color: t.t1 }}>{feature}</strong> requires a premium subscription.
                            </p>
                        )}

                        {/* Billing Switcher */}
                        <div style={{ display: "flex", gap: 0, borderRadius: 10, overflow: "hidden", border: `1px solid ${t.accent}30`, marginBottom: 24, width: "fit-content", background: t.inset }}>
                            {["monthly", "yearly"].map(b => (
                                <button key={b} onClick={() => setBilling(b)} style={{
                                    padding: "8px 18px", border: "none", cursor: "pointer", fontSize: 12,
                                    fontFamily: t.mono, fontWeight: 600, transition: "all .15s",
                                    background: billing === b ? `${t.accent}24` : "transparent",
                                    color: billing === b ? t.accent : t.t3,
                                }}>
                                    {b.charAt(0).toUpperCase() + b.slice(1)}
                                    {b === "yearly" && <span style={{ marginLeft: 6, fontSize: 9, color: t.accent, background: `${t.accent}22`, padding: "1px 5px", borderRadius: 4 }}>SAVE 20%</span>}
                                </button>
                            ))}
                        </div>

                        {/* Plan Cards Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                            {/* Free Plan */}
                            <div style={{ padding: "20px 18px", borderRadius: 16, background: `${t.t3}05`, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column" }}>
                                <div style={{ fontSize: 11, color: t.t3, fontFamily: t.mono, marginBottom: 6, letterSpacing: "0.5px", fontWeight: 700 }}>FREE</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: t.t1, marginBottom: 16 }}>₹0<span style={{ fontSize: 12, fontWeight: 400, color: t.t3 }}>/mo</span></div>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                                    {freeFeatures.map(f => (
                                        <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: t.t2, fontFamily: t.disp }}>
                                            <span style={{ color: t.green }}>✓</span> {f}
                                        </div>
                                    ))}
                                </div>
                                <button disabled style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.t3, fontSize: 12.5, fontWeight: 700, fontFamily: t.disp }}>
                                    Current Plan
                                </button>
                            </div>

                            {/* Starter Plan */}
                            <div style={{
                                padding: "20px 18px", borderRadius: 16,
                                background: `${t.t3}0a`,
                                border: `1px solid ${t.border}`,
                                display: "flex", flexDirection: "column",
                            }}>
                                <div style={{ fontSize: 11, color: t.t2, fontFamily: t.mono, marginBottom: 6, letterSpacing: "0.5px", fontWeight: 700 }}>STARTER</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: t.t1, marginBottom: 16 }}>
                                    {billing === "yearly" ? "₹499" : "₹49"}
                                    <span style={{ fontSize: 12, fontWeight: 400, color: t.t3 }}>{billing === "yearly" ? "/year" : "/mo"}</span>
                                </div>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                                    {starterFeatures.map(f => (
                                        <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: t.t2, fontFamily: t.disp }}>
                                            <span style={{ color: t.accent }}>✓</span> {f}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleSelectPlan("starter")}
                                    style={{
                                        width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${t.accent}55`,
                                        background: "transparent", color: t.accent, fontSize: 12.5, fontWeight: 700, fontFamily: t.disp, cursor: "pointer",
                                        transition: "all 0.15s"
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = t.accentDim; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                                    disabled={loading}
                                >
                                    Get Starter
                                </button>
                            </div>

                            {/* Pro Plan */}
                            <div style={{
                                padding: "20px 18px", borderRadius: 16,
                                background: `linear-gradient(145deg, ${t.accent}0a, ${t.blue || '#0072FF'}0a)`,
                                border: `1px solid ${t.accent}66`,
                                position: "relative", overflow: "hidden",
                                display: "flex", flexDirection: "column",
                            }}>
                                <div style={{
                                    position: "absolute", top: 0, right: 0, left: 0, height: 3,
                                    background: `linear-gradient(90deg, ${t.accent}, ${t.blue || '#0072FF'})`,
                                }} />
                                <div style={{ fontSize: 11, color: t.accent, fontFamily: t.mono, marginBottom: 6, letterSpacing: "0.5px", fontWeight: 700 }}>PRO ✦</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: t.t1, marginBottom: 16 }}>
                                    {billing === "yearly" ? "₹1000" : "₹99"}
                                    <span style={{ fontSize: 12, fontWeight: 400, color: t.t3 }}>{billing === "yearly" ? "/year" : "/mo"}</span>
                                </div>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                                    {proFeatures.map(f => (
                                        <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: t.t1, fontFamily: t.disp }}>
                                            <span style={{ color: t.accent }}>✦</span> {f}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleSelectPlan("pro")}
                                    style={{
                                        width: "100%", padding: "10px", borderRadius: 8, border: "none",
                                        background: t.accent, color: "#000", fontSize: 12.5, fontWeight: 800, fontFamily: t.disp, cursor: "pointer",
                                        transition: "all 0.15s"
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                                >
                                    Get Pro ✦
                                </button>
                            </div>
                        </div>

                        {/* Testimonials */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24, padding: "12px 14px", background: `${t.accent}05`, borderRadius: 12, border: `1px solid ${t.border}` }}>
                            {quotes.map((q, idx) => (
                                <div key={idx} style={{ fontSize: 11, color: t.t2, lineHeight: 1.5 }}>
                                    <div style={{ fontStyle: "italic", marginBottom: 4 }}>{q.text}</div>
                                    <div style={{ fontWeight: 700, color: t.t3 }}>— {q.author}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: BILLING REDIRECT STATE */}
                {step === "billing" && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 0" }}>
                        <button onClick={() => setStep("plan")} type="button" disabled={loading}
                            style={{ background: "none", border: "none", color: t.t2, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 24, fontFamily: t.disp, alignSelf: "flex-start" }}>
                            ← Back to plans
                        </button>

                        <div style={{ width: 44, height: 44, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 24 }} />
                        <style dangerouslySetInnerHTML={{ __html: `
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}} />

                        <h3 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: t.t1 }}>Redirecting to LemonSqueezy...</h3>
                        <p style={{ margin: "0 0 24px", fontSize: 13, color: t.t2, maxWidth: 360, lineHeight: 1.6, fontFamily: t.disp }}>
                            Please wait while we secure your checkout session for <strong>{selectedPlan.toUpperCase()}</strong> ({getPlanPrice(selectedPlan)}).
                        </p>

                        {error && (
                            <div style={{ padding: "10px 14px", borderRadius: 8, background: `${t.red}15`, border: `1px solid ${t.red}33`, color: t.red, fontSize: 12, marginBottom: 16 }}>
                                ⚠️ {error}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 3: SUCCESS ANIMATION */}
                {step === "success" && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "20px 0" }}>
                        <div style={{ marginBottom: 24 }}>
                            <div className="tf-checkmark">
                                <svg className="tf-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                    <circle className="tf-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                                    <path className="tf-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                                </svg>
                            </div>
                        </div>

                        <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: t.t1 }}>Upgrade Successful!</h3>
                        <p style={{ margin: "0 0 28px", fontSize: 13, color: t.t2, maxWidth: 360, lineHeight: 1.6 }}>
                            Welcome to <strong>TaskFlow {selectedPlan.toUpperCase()}</strong>. Your workspace capabilities have been successfully unlocked!
                        </p>

                        <button
                            onClick={handleFinalize}
                            style={{
                                ...ctaButtonStyle,
                                width: "fit-content",
                                padding: "12px 36px",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${t.accent}44`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = t.accentGlow; }}
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function PlanBadge({ t, onClick, userPlan }) {
    const plan = userPlan || getPlan();
    const isPaid = plan === 'pro' || plan === 'starter';

    if (isPaid) {
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes planShimmer {
                        0% { background-position: -200% center; }
                        100% { background-position: 200% center; }
                    }
                ` }} />
                <div
                    title={`TaskFlow ${plan.toUpperCase()} — Active`}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "5px 13px", borderRadius: 999,
                        border: `1px solid ${t.accent}55`,
                        background: "linear-gradient(135deg, rgba(0,229,204,0.12), rgba(0,114,255,0.12))",
                        fontFamily: t.mono, fontSize: 10.5,
                        fontWeight: 700, letterSpacing: "0.5px",
                        backgroundSize: "200% auto",
                        animation: "planShimmer 3s linear infinite",
                        backgroundImage: `linear-gradient(90deg, ${t.accent}cc 0%, #0072FFcc 40%, ${t.accent}cc 60%, #0072FFcc 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        cursor: "default",
                        userSelect: "none",
                    }}
                >
                    ✦ {plan.toUpperCase()}
                </div>
            </>
        );
    }

    return (
        <button
            onClick={onClick}
            title="Upgrade to Pro"
            style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 12px", borderRadius: 999, border: `1px solid ${t.border}`, cursor: "pointer",
                background: "rgba(255,255,255,0.04)",
                fontFamily: t.mono, fontSize: 10.5,
                fontWeight: 700, letterSpacing: "0.4px",
                color: t.t2,
                transition: "all .15s",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = `${t.accent}14`;
                e.currentTarget.style.color = t.accent;
                e.currentTarget.style.borderColor = `${t.accent}44`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = t.t2;
                e.currentTarget.style.borderColor = t.border;
            }}
        >
            FREE · Upgrade ↗
        </button>
    );
}

export function LimitBanner({ t, message, onUpgrade }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", borderRadius: 10, margin: "8px 0",
            background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)",
        }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <span style={{ flex: 1, fontSize: 12, color: "#FBBF24", fontFamily: t.disp }}>
                {message}
            </span>
            <button
                onClick={onUpgrade}
                style={{
                    padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                    background: `linear-gradient(135deg, ${t.accent}, ${t.blue || '#0072FF'})`,
                    color: "#000", fontSize: 11, fontWeight: 700,
                    fontFamily: t.disp, whiteSpace: "nowrap",
                }}
            >
                Upgrade
            </button>
        </div>
    );
}
