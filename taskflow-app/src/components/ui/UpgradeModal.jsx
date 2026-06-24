import { useState } from "react";
import { PLANS, getPlan, isPro } from "../../utils/planLimits.js";
import { I, IC } from "./Icon.jsx";
import { billingApi } from "../../api/billing.js";

// ── Upgrade Modal ─────────────────────────────────────────────────────────────
export function UpgradeModal({ t, feature, onClose }) {
    const [step, setStep] = useState(feature === "Upgrade Successful!" ? "success" : "plan"); // plan | billing | success
    const [billing, setBilling] = useState("yearly"); // monthly | yearly
    const [payMethod, setPayMethod] = useState("card"); // card | upi
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form inputs
    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [upiId, setUpiId] = useState("");

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

    const quotes = [
        { text: "“TaskFlow saved our team 10+ hours a week. The notes editor is Notion-fast.”", author: "Aryan K., Dev Lead" },
        { text: "“The custom themes are gorgeous. Easily the most premium PM tool I've used.”", author: "Rohit J., Designer" }
    ];

    const handleNextStep = () => {
        setStep("billing");
    };

    const handleStripeCheckout = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await billingApi.createCheckoutSession(billing);
            if (res.url) {
                window.location.href = res.url;
            } else {
                setError("Failed to create Stripe Checkout session.");
            }
        } catch (err) {
            setError(err.message || "Failed to contact billing service.");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Please enter cardholder/account name.");
            return;
        }

        if (payMethod === "card") {
            const cleanNum = number.replace(/\s+/g, "");
            if (cleanNum.length < 16) {
                setError("Please enter a valid 16-digit card number.");
                return;
            }
            if (!expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
                setError("Please enter expiry in MM/YY format.");
                return;
            }
            if (cvv.length < 3) {
                setError("Please enter a valid 3-digit CVV.");
                return;
            }
        } else {
            if (!upiId.includes("@") || upiId.length < 3) {
                setError("Please enter a valid UPI ID (e.g. name@okhdfc).");
                return;
            }
        }

        setLoading(true);
        // Simulate payment processing for 1.8 seconds
        setTimeout(() => {
            setLoading(false);
            setStep("success");
        }, 1800);
    };

    const handleFinalize = () => {
        localStorage.setItem("tf_plan", "pro");
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
        maxWidth: 580, width: "100%",
        boxShadow: t.shadow || "0 32px 80px rgba(0,0,0,0.6)",
        position: "relative",
        maxHeight: "90vh",
        overflowY: "auto",
        scrollbarWidth: "none",
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
        width: "100%", padding: "13px 0", borderRadius: 12,
        border: "none", cursor: "pointer",
        background: `linear-gradient(135deg, ${t.accent}, ${t.blue || '#0072FF'})`,
        color: "#000", fontSize: 14.5, fontWeight: 800,
        fontFamily: t.disp, letterSpacing: "0.3px",
        boxShadow: t.accentGlow,
        transition: "transform .15s, box-shadow .15s",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8
    };

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
                            ✦ UPGRADE TO PRO
                        </div>

                        <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, fontFamily: t.disp, background: `linear-gradient(135deg, ${t.accent}, ${t.blue || '#0072FF'})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
                            Unlock the full TaskFlow
                        </h2>

                        {feature && (
                            <p style={{ margin: "0 0 20px", fontSize: 12.5, color: t.t2, fontFamily: t.disp }}>
                                🔒 <strong style={{ color: t.t1 }}>{feature}</strong> requires a Pro subscription.
                            </p>
                        )}

                        {/* Billing Switcher */}
                        <div style={{ display: "flex", gap: 0, borderRadius: 10, overflow: "hidden", border: `1px solid ${t.accent}30`, marginBottom: 20, width: "fit-content", background: t.inset }}>
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
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                            {/* Free Plan */}
                            <div style={{ padding: "20px 18px", borderRadius: 16, background: `${t.t3}05`, border: `1px solid ${t.border}` }}>
                                <div style={{ fontSize: 11, color: t.t3, fontFamily: t.mono, marginBottom: 6, letterSpacing: "0.5px", fontWeight: 700 }}>FREE</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: t.t1, marginBottom: 16 }}>₹0<span style={{ fontSize: 12, fontWeight: 400, color: t.t3 }}>/mo</span></div>
                                {freeFeatures.map(f => (
                                    <div key={f} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", fontSize: 12, color: t.t2, fontFamily: t.disp }}>
                                        <span style={{ color: t.green }}>✓</span> {f}
                                    </div>
                                ))}
                            </div>

                            {/* Pro Plan */}
                            <div style={{
                                padding: "20px 18px", borderRadius: 16,
                                background: `linear-gradient(145deg, ${t.accent}0a, ${t.blue || '#0072FF'}0a)`,
                                border: `1px solid ${t.accent}40`,
                                position: "relative", overflow: "hidden",
                            }}>
                                <div style={{
                                    position: "absolute", top: 0, right: 0, left: 0, height: 3,
                                    background: `linear-gradient(90deg, ${t.accent}, ${t.blue || '#0072FF'})`,
                                }} />
                                <div style={{ fontSize: 11, color: t.accent, fontFamily: t.mono, marginBottom: 6, letterSpacing: "0.5px", fontWeight: 700 }}>PRO ✦</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: t.t1, marginBottom: 16 }}>
                                    {billing === "yearly" ? "₹239" : "₹299"}
                                    <span style={{ fontSize: 12, fontWeight: 400, color: t.t3 }}>/mo</span>
                                </div>
                                {proFeatures.map(f => (
                                    <div key={f} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", fontSize: 12, color: t.t1, fontFamily: t.disp }}>
                                        <span style={{ color: t.accent }}>✦</span> {f}
                                    </div>
                                ))}
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

                        {/* CTA button */}
                        <button
                            onClick={handleNextStep}
                            style={ctaButtonStyle}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${t.accent}44`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = t.accentGlow; }}
                        >
                            Upgrade to Pro — {billing === "yearly" ? "₹239/mo" : "₹299/mo"}
                        </button>

                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 14 }}>
                            <div style={{ fontSize: 11, color: t.t3, fontFamily: t.disp, display: "flex", alignItems: "center", gap: 4 }}>
                                🔒 Secure · Razorpay encrypted
                            </div>
                            <div style={{ fontSize: 11, color: t.t3, fontFamily: t.disp }}>
                                7-day free trial · cancel anytime
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: BILLING FORM */}
                {step === "billing" && (
                    <form onSubmit={handlePaymentSubmit}>
                        <button onClick={() => setStep("plan")} type="button"
                            style={{ background: "none", border: "none", color: t.t2, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 18, fontFamily: t.disp }}>
                            ← Back to plan details
                        </button>

                        <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: t.t1 }}>Checkout & Payment</h3>
                        <p style={{ margin: "0 0 20px", fontSize: 12, color: t.t3 }}>
                            Pro Plan Sub ({billing === "yearly" ? "Yearly @ ₹2,868/yr" : "Monthly @ ₹299/mo"})
                        </p>

                        {/* Stripe Checkout Button */}
                        <button type="button" onClick={handleStripeCheckout} disabled={loading}
                            style={{
                                width: "100%", padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer",
                                background: `linear-gradient(135deg, #635BFF, #877BFF)`,
                                color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: t.disp,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                marginBottom: 16, boxShadow: "0 4px 12px rgba(99, 91, 255, 0.35)",
                                opacity: loading ? 0.8 : 1, transition: "all 0.2s"
                            }}>
                            {loading ? "Redirecting..." : "💳 Pay via Stripe Checkout"}
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 20px", color: t.t3, fontSize: 10, fontFamily: t.mono }}>
                            <div style={{ flex: 1, height: 1, background: t.border }}></div>
                            <span>OR DEMO PLAYGROUND</span>
                            <div style={{ flex: 1, height: 1, background: t.border }}></div>
                        </div>

                        {error && (
                            <div style={{ padding: "10px 14px", borderRadius: 8, background: `${t.red}15`, border: `1px solid ${t.red}33`, color: t.red, fontSize: 12, marginBottom: 16 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Payment Mode Tabs */}
                        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                            <button type="button" onClick={() => { setPayMethod("card"); setError(""); }}
                                style={{
                                    flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12.5, fontFamily: t.disp,
                                    background: payMethod === "card" ? `${t.accent}24` : "transparent",
                                    border: `1px solid ${payMethod === "card" ? t.accent : t.border}`,
                                    color: payMethod === "card" ? t.accent : t.t2,
                                    transition: "all .15s"
                                }}>
                                Credit / Debit Card
                            </button>
                            <button type="button" onClick={() => { setPayMethod("upi"); setError(""); }}
                                style={{
                                    flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12.5, fontFamily: t.disp,
                                    background: payMethod === "upi" ? `${t.accent}24` : "transparent",
                                    border: `1px solid ${payMethod === "upi" ? t.accent : t.border}`,
                                    color: payMethod === "upi" ? t.accent : t.t2,
                                    transition: "all .15s"
                                }}>
                                UPI / QR Code
                            </button>
                        </div>

                        {/* Card Form */}
                        {payMethod === "card" && (
                            <div>
                                <label style={labelStyle}>Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Siddhant Pal"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    style={inputStyle}
                                />

                                <label style={labelStyle}>Card Number</label>
                                <input
                                    type="text"
                                    placeholder="4111 2222 3333 4444"
                                    maxLength={19}
                                    value={number}
                                    onChange={e => {
                                        // Auto format credit card grouping
                                        const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                                        setNumber(val);
                                    }}
                                    style={inputStyle}
                                />

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                    <div>
                                        <label style={labelStyle}>Expiry Date</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            value={expiry}
                                            onChange={e => {
                                                let val = e.target.value.replace(/\D/g, "");
                                                if (val.length > 2) val = val.slice(0,2) + "/" + val.slice(2,4);
                                                setExpiry(val);
                                            }}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>CVV Code</label>
                                        <input
                                            type="password"
                                            placeholder="•••"
                                            maxLength={3}
                                            value={cvv}
                                            onChange={e => setCvv(e.target.value.replace(/\D/g, ""))}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* UPI Form */}
                        {payMethod === "upi" && (
                            <div>
                                <label style={labelStyle}>Account Holder Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Siddhant Pal"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    style={inputStyle}
                                />

                                <label style={labelStyle}>UPI ID</label>
                                <input
                                    type="text"
                                    placeholder="siddhant@upi"
                                    value={upiId}
                                    onChange={e => setUpiId(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        )}

                        {/* Submit Payment button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...ctaButtonStyle,
                                opacity: loading ? 0.75 : 1,
                                cursor: loading ? "not-allowed" : "pointer",
                                marginTop: 10
                            }}
                        >
                            {loading ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 16, height: 16, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                    Processing Payment...
                                </div>
                            ) : (
                                `Pay Now — ${billing === "yearly" ? "₹2,868" : "₹299"}`
                            )}
                        </button>

                        <p style={{ textAlign: "center", fontSize: 10.5, color: t.t3, marginTop: 14, fontFamily: t.mono }}>
                            🛡️ Razorpay encrypted secure sandbox checkout
                        </p>
                    </form>
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
                            Welcome to <strong>TaskFlow Pro</strong>. Your unlimited workspace capabilities have been successfully unlocked!
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

// ── Plan Badge (for sidebar / topbar) ─────────────────────────────────────────
export function PlanBadge({ t, onClick }) {
    const plan = getPlan();
    return (
        <button
            onClick={onClick}
            title={plan === "pro" ? "TaskFlow Pro — All features unlocked" : "Upgrade to Pro"}
            style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                background: plan === "pro"
                    ? "linear-gradient(135deg, rgba(0,229,204,0.15), rgba(0,114,255,0.15))"
                    : "rgba(255,255,255,0.05)",
                fontFamily: t.mono, fontSize: 10.5,
                fontWeight: 700, letterSpacing: "0.4px",
                color: plan === "pro" ? t.accent : t.t2,
                transition: "all .15s",
            }}
            onMouseEnter={e => {
                if (plan !== "pro") {
                    e.currentTarget.style.background = `${t.accent}14`;
                    e.currentTarget.style.color = t.accent;
                }
            }}
            onMouseLeave={e => {
                if (plan !== "pro") {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = t.t2;
                }
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
