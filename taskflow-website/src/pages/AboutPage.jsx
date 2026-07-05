import { useState } from "react";
import { I, IC } from "../components/ui/Icon.jsx";

export default function AboutPage({ t }) {
    return (
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 40, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: `${t.accent}22`, color: t.accent, fontSize: 11, fontWeight: 800, fontFamily: t.mono, marginBottom: 16 }}>
                        ✦ PORTFOLIO DEMONSTRATION
                    </div>
                    <h1 style={{ fontSize: 36, fontWeight: 900, color: t.t1, margin: '0 0 16px', letterSpacing: '-0.5px' }}>
                        About TaskFlow
                    </h1>
                    <p style={{ fontSize: 15, color: t.t2, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
                        TaskFlow was originally designed as a fully-featured commercial SaaS platform. It has since been transitioned into an open-source portfolio project to demonstrate full-stack engineering, real-time collaboration, and complex state management.
                    </p>
                </div>

                {/* Tech Stack Grid */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: t.t1, marginBottom: 20, borderBottom: `1px solid ${t.border}`, paddingBottom: 12 }}>Technology Stack</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 40 }}>
                    <TechCard t={t} title="Frontend Architecture" icon={IC.layout}>
                        Built with <strong>React</strong> and <strong>Vite</strong>. Features a bespoke, fully responsive, glassmorphic UI system without heavy external component libraries. Utilizes complex <code>useState</code> and <code>useEffect</code> hooks for local-first optimism and fast rendering.
                    </TechCard>
                    
                    <TechCard t={t} title="Backend Infrastructure" icon={IC.server}>
                        Powered by <strong>Node.js</strong> and <strong>Express</strong>. Handles secure JWT authentication (access and refresh tokens), RESTful API design, and robust error handling.
                    </TechCard>
                    
                    <TechCard t={t} title="Database & Storage" icon={IC.database}>
                        Data is stored in a fully relational <strong>MySQL (Aiven)</strong> database. Efficient schemas and indexed tables manage user relationships, team collaborations, and nested note-block structures.
                    </TechCard>
                    
                    <TechCard t={t} title="Real-Time Sync" icon={IC.activity}>
                        Integrated <strong>Socket.IO</strong> enables real-time collaborative editing (multiplayer cursors), instant chat messaging, and live task updates across connected clients.
                    </TechCard>

                    <TechCard t={t} title="SaaS Infrastructure" icon={IC.creditCard}>
                        Features a complete (now disabled) <strong>Razorpay</strong> subscription integration, including webhook processing, signature verification, and multi-tier access gating.
                    </TechCard>

                    <TechCard t={t} title="Mobile Ecosystem" icon={IC.smartphone}>
                        A complementary <strong>React Native (Expo)</strong> mobile application exists, sharing the same backend API to provide a seamless cross-platform experience.
                    </TechCard>
                </div>

                {/* Author Info */}
                <div style={{ padding: '32px', background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: 80, height: 80, borderRadius: 20, background: `linear-gradient(135deg, ${t.accent}, ${t.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: `0 8px 24px ${t.accent}40` }}>
                        SP
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 12, color: t.accent, fontFamily: t.mono, fontWeight: 700, marginBottom: 4 }}>DEVELOPED BY</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: t.t1, marginBottom: 8 }}>Siddhant Pal</div>
                        <div style={{ fontSize: 14, color: t.t2, lineHeight: 1.5 }}>
                            Full-stack engineer specializing in highly interactive web applications, secure backends, and premium UI/UX design.
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <a href="https://github.com/Siddhantpal08" target="_blank" rel="noopener noreferrer" style={{ padding: '12px 20px', background: t.inset, color: t.t1, border: `1px solid ${t.border}`, borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, transition: 'background .2s' }} className="hvr">
                            View GitHub Profile ↗
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TechCard({ t, title, icon, children }) {
    return (
        <div style={{ padding: 24, background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${t.accent}15`, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.accent}30` }}>
                <I d={icon} sz={20} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.t1 }}>{title}</div>
            <div style={{ fontSize: 13, color: t.t2, lineHeight: 1.6 }}>{children}</div>
        </div>
    );
}
