import { useState } from "react";

const DIGITAL_PRODUCTS = [
    { id: 1, name: "TaskFlow Pro Templates Pack", price: "₹199", desc: "50+ professional note templates for projects, meetings, and reviews.", tag: "Templates", sales: 0 },
    { id: 2, name: "Productivity Masterclass PDF", price: "₹299", desc: "A complete guide to building high-performance habits using TaskFlow.", tag: "eBook", sales: 0 },
];

const RAZORPAY_PAYMENT_LINK = "https://rzp.io/l/taskflow"; // Replace with your actual payment link

export default function StorePage({ t, setPage }) {
    const [activeTab, setActiveTab] = useState("products"); // products | setup | freelance

    return (
        <div style={{ height: "100%", overflowY: "auto" }}>
            <style>{`
                .store-tab:hover { background: ${t.accentDim}; color: ${t.accent}; }
                .store-card:hover { border-color: ${t.accent}55 !important; transform: translateY(-2px); box-shadow: 0 8px 32px ${t.accent}18 !important; }
                .store-card { transition: all .2s !important; }
                .step-card { border-left: 3px solid ${t.accent}; }
            `}</style>

            {/* ── Header ── */}
            <div style={{ padding: "28px 32px 20px", background: `linear-gradient(120deg, ${t.accent}10 0%, ${t.accent}04 50%, transparent 100%)`, borderBottom: `1px solid ${t.border}` }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 12px", borderRadius: 999, background: t.accentDim, border: `1px solid ${t.accent}40`, fontSize: 11, color: t.accent, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.5px", marginBottom: 12 }}>
                    🛒 CREVIO STORE
                </div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: t.t1, letterSpacing: "-0.5px" }}>
                    Digital Products & Store
                </h1>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: t.t2 }}>
                    Sell digital products, accept freelance payments, and manage your Razorpay store — all powered by Crevio Studios.
                </p>

                {/* Tab bar */}
                <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
                    {[
                        { key: "products",  label: "🎁 My Products" },
                        { key: "freelance", label: "💼 Freelance Pay" },
                        { key: "setup",     label: "⚙️ Store Setup" },
                    ].map(tab => (
                        <button key={tab.key} className="store-tab"
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: "7px 16px", borderRadius: 8, cursor: "pointer",
                                background: activeTab === tab.key ? t.accentDim : t.card,
                                color: activeTab === tab.key ? t.accent : t.t2,
                                fontFamily: t.disp, fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 400,
                                border: `1px solid ${activeTab === tab.key ? t.accent + "55" : t.border}`,
                                transition: "all .15s",
                            }}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: "24px 32px", maxWidth: 900 }}>
                {/* ── Products Tab ── */}
                {activeTab === "products" && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: t.t1 }}>Your Digital Products</div>
                                <div style={{ fontSize: 12, color: t.t3, fontFamily: t.mono, marginTop: 2 }}>Products powered by Razorpay Payment Pages</div>
                            </div>
                            <a href="https://dashboard.razorpay.com/app/payment-pages/create" target="_blank" rel="noopener noreferrer"
                                style={{ padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${t.accent}, ${t.blue || "#0072FF"})`, color: "#000", fontSize: 13, fontWeight: 700, fontFamily: t.disp, textDecoration: "none" }}>
                                + New Product ↗
                            </a>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                            {DIGITAL_PRODUCTS.map(prod => (
                                <div key={prod.id} className="store-card"
                                    style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden" }}>
                                    {/* Product image placeholder */}
                                    <div style={{ height: 120, background: `linear-gradient(135deg, ${t.accent}18, ${t.blue || "#0072FF"}18)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                                        {prod.tag === "Templates" ? "📋" : "📖"}
                                    </div>
                                    <div style={{ padding: "14px 16px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: t.t1 }}>{prod.name}</div>
                                            <span style={{ fontSize: 9, fontWeight: 700, color: t.accent, background: t.accentDim, padding: "2px 8px", borderRadius: 999, fontFamily: t.mono, border: `1px solid ${t.accent}30`, whiteSpace: "nowrap", flexShrink: 0 }}>{prod.tag}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: t.t2, marginTop: 6, lineHeight: 1.5 }}>{prod.desc}</div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                                            <div style={{ fontSize: 20, fontWeight: 800, color: t.accent }}>{prod.price}</div>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <span style={{ fontSize: 10.5, color: t.t3, fontFamily: t.mono }}>{prod.sales} sales</span>
                                                <a href="https://dashboard.razorpay.com/app/payment-pages" target="_blank" rel="noopener noreferrer"
                                                    style={{ fontSize: 11, color: t.accent, textDecoration: "none", fontWeight: 600 }}>Edit ↗</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add product card */}
                            <a href="https://dashboard.razorpay.com/app/payment-pages/create" target="_blank" rel="noopener noreferrer"
                                style={{ background: "transparent", border: `2px dashed ${t.border}`, borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "40px 20px", cursor: "pointer", textDecoration: "none", transition: "border-color .15s" }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                                onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                                <div style={{ fontSize: 32, opacity: 0.4 }}>+</div>
                                <div style={{ fontSize: 13, color: t.t2, fontWeight: 600 }}>Add Product on Razorpay</div>
                                <div style={{ fontSize: 11, color: t.t3, textAlign: "center" }}>Create a Payment Page for any digital product or service</div>
                            </a>
                        </div>

                        {/* Merch section */}
                        <div style={{ marginTop: 32, padding: "20px 22px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 14 }}>
                            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                                <div style={{ fontSize: 36 }}>👕</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: t.t1 }}>Merch Store — Coming Soon</div>
                                    <div style={{ fontSize: 12.5, color: t.t2, marginTop: 3, lineHeight: 1.5 }}>
                                        Set up a physical merch store using Razorpay + Printful or Shiprocket. Orders flow through Razorpay's Orders API.
                                        You can accept orders via Payment Links until a full storefront is built.
                                    </div>
                                </div>
                                <div style={{ fontSize: 11, color: t.t3, fontFamily: t.mono, background: t.inset, padding: "4px 12px", borderRadius: 999, border: `1px solid ${t.border}` }}>ROADMAP</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Freelance Tab ── */}
                {activeTab === "freelance" && (
                    <div>
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: t.t1, marginBottom: 4 }}>Accept Freelance Payments</div>
                            <div style={{ fontSize: 13, color: t.t2 }}>Use Razorpay Payment Links to get paid instantly for any freelance work. No website needed.</div>
                        </div>

                        {/* Quick payment link generator */}
                        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 20 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: t.t1, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                ⚡ Quick Payment Link Generator
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                                {[
                                    { label: "Client/Project Name", placeholder: "Website redesign for Aryan" },
                                    { label: "Amount (₹)", placeholder: "5000" },
                                ].map(f => (
                                    <label key={f.label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                        <span style={{ fontSize: 11.5, fontWeight: 700, color: t.t2, fontFamily: t.disp }}>{f.label}</span>
                                        <input placeholder={f.placeholder}
                                            style={{ padding: "9px 12px", background: t.inset, border: `1px solid ${t.border}`, borderRadius: 8, color: t.t1, fontSize: 13, fontFamily: t.disp, outline: "none" }} />
                                    </label>
                                ))}
                            </div>
                            <a href="https://dashboard.razorpay.com/app/payment-links/create" target="_blank" rel="noopener noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 9, border: "none", background: `linear-gradient(135deg, ${t.accent}, ${t.blue || "#0072FF"})`, color: "#000", fontSize: 13, fontWeight: 700, fontFamily: t.disp, textDecoration: "none", cursor: "pointer" }}>
                                Create Payment Link on Razorpay ↗
                            </a>
                        </div>

                        {/* How it works */}
                        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 24px" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: t.t1, marginBottom: 16 }}>How Freelance Payments Work</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {[
                                    { step: "1", title: "Create a Payment Link", desc: "Go to Razorpay Dashboard → Payment Links → Create. Enter amount, description, and expiry." },
                                    { step: "2", title: "Share with Client", desc: "Send the rzp.io/l/xxxxx link via WhatsApp, email, or invoice. Client clicks and pays." },
                                    { step: "3", title: "Receive Money", desc: "Payment lands in your Razorpay balance. Settle to your bank account (T+2 days)." },
                                    { step: "4", title: "Track & Invoice", desc: "All payments visible in Razorpay dashboard with client name, date, and amount." },
                                ].map(s => (
                                    <div key={s.step} className="step-card" style={{ padding: "12px 16px", background: t.inset, borderRadius: 8 }}>
                                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: t.accentDim, border: `1px solid ${t.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: t.accent, flexShrink: 0 }}>{s.step}</div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: t.t1 }}>{s.title}</div>
                                                <div style={{ fontSize: 12, color: t.t2, marginTop: 3 }}>{s.desc}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Setup Tab ── */}
                {activeTab === "setup" && (
                    <div>
                        <div style={{ background: t.accentDim, border: `1px solid ${t.accent}30`, borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <span style={{ fontSize: 20 }}>ℹ️</span>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: t.t1, marginBottom: 2 }}>Razorpay Account Setup Guide</div>
                                <div style={{ fontSize: 12.5, color: t.t2, lineHeight: 1.6 }}>
                                    Your Razorpay account is in <strong style={{ color: t.accent }}>Test Mode</strong>. Follow these steps to go live and create subscription plans for TaskFlow Pro.
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {[
                                {
                                    num: "01", title: "Create Subscription Plans",
                                    desc: "Go to Razorpay Dashboard → Subscriptions → Plans → Create Plan.",
                                    details: [
                                        "Plan 1: TaskFlow Starter — ₹49/month (interval: monthly)",
                                        "Plan 2: TaskFlow Pro — ₹99/month (interval: monthly)",
                                        "Plan 3: TaskFlow Pro Yearly — ₹1000/year (interval: yearly)",
                                        "Copy the Plan IDs (plan_XXXXXXXX) and add them to .env",
                                    ],
                                    link: "https://dashboard.razorpay.com/app/subscriptions/plans",
                                    linkLabel: "Open Plans →",
                                },
                                {
                                    num: "02", title: "Add Plan IDs to Backend .env",
                                    desc: "Open taskflow-backend/.env and paste your Plan IDs:",
                                    code: "RAZORPAY_STARTER_PLAN_ID=plan_XXXXXXXXXXXX\nRAZORPAY_PRO_PLAN_ID=plan_XXXXXXXXXXXX",
                                },
                                {
                                    num: "03", title: "Set Up Webhook",
                                    desc: "Go to Razorpay Dashboard → Settings → Webhooks → Add Webhook.",
                                    details: [
                                        "URL: https://your-backend.onrender.com/api/billing/razorpay-webhook",
                                        "Secret: taskflow_rzp_webhook_2026 (matches .env)",
                                        "Events: subscription.activated, subscription.charged, subscription.cancelled",
                                    ],
                                    link: "https://dashboard.razorpay.com/app/webhooks",
                                    linkLabel: "Open Webhooks →",
                                },
                                {
                                    num: "04", title: "Complete KYC to Go Live",
                                    desc: "For live payments (not test), submit KYC documents in Razorpay.",
                                    details: [
                                        "PAN Card (individual)",
                                        "Bank account details",
                                        "Business proof (optional for individuals)",
                                        "Approval typically takes 1–3 business days",
                                    ],
                                    link: "https://dashboard.razorpay.com/app/settings",
                                    linkLabel: "Go to Settings →",
                                },
                                {
                                    num: "05", title: "Switch to Live Keys",
                                    desc: "Once KYC is approved, replace test keys in .env with live keys:",
                                    code: "RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX\nRAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX",
                                    note: "Also update VITE_RAZORPAY_KEY_ID in the frontend .env file.",
                                },
                            ].map(step => (
                                <div key={step.num} className="step-card" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: "18px 20px" }}>
                                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: t.accent, fontFamily: t.mono, flexShrink: 0, minWidth: 28 }}>{step.num}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: t.t1, marginBottom: 5 }}>{step.title}</div>
                                            <div style={{ fontSize: 12.5, color: t.t2, lineHeight: 1.6, marginBottom: step.details || step.code ? 10 : 0 }}>{step.desc}</div>
                                            {step.details && (
                                                <ul style={{ margin: "0 0 10px", paddingLeft: 16 }}>
                                                    {step.details.map((d, i) => (
                                                        <li key={i} style={{ fontSize: 12, color: t.t2, marginBottom: 3, lineHeight: 1.5 }}>{d}</li>
                                                    ))}
                                                </ul>
                                            )}
                                            {step.code && (
                                                <pre style={{ background: t.inset, border: `1px solid ${t.border}`, borderRadius: 7, padding: "10px 12px", fontSize: 11.5, color: t.accent, fontFamily: t.mono, overflow: "auto", margin: "0 0 10px", whiteSpace: "pre-wrap" }}>{step.code}</pre>
                                            )}
                                            {step.note && <div style={{ fontSize: 11.5, color: t.amber, fontFamily: t.mono }}>⚠ {step.note}</div>}
                                            {step.link && (
                                                <a href={step.link} target="_blank" rel="noopener noreferrer"
                                                    style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: t.accent, fontWeight: 700, textDecoration: "none" }}>
                                                    {step.linkLabel}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
