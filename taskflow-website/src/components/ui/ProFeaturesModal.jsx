import { I, IC } from "./Icon.jsx";

export default function ProFeaturesModal({ t, onClose }) {
    const features = [
        { icon: "📝", title: "Unlimited Pages & Tasks", desc: "No limits on creation." },
        { icon: "🎨", title: "Custom Workspaces", desc: "Adapt the app to your brand colors." },
        { icon: "🎭", title: "Writing Modes", desc: "Script and Lyrics modes." },
        { icon: "👥", title: "Unlimited Team Members", desc: "Collaborate with everyone." },
        { icon: "🔗", title: "Public Share Links", desc: "Share notes with outside clients." },
        { icon: "⚡", title: "Priority Support", desc: "Skip the line for help." }
    ];

    return (
        <div onClick={e => e.target === e.currentTarget && onClose()} style={{
            position: 'fixed', inset: 0, background: '#000000aa', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
            <div className="popIn" style={{
                background: t.card, border: `1px solid ${t.border}`, borderRadius: 24,
                padding: '32px', width: '100%', maxWidth: 460, boxShadow: t.shadow,
                display: 'flex', flexDirection: 'column', gap: 24, position: 'relative'
            }}>
                <button type="button" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: "none", border: "none", color: t.t3, fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
                
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: `${t.accent}22`, color: t.accent, fontSize: 11, fontWeight: 800, fontFamily: t.mono, marginBottom: 12 }}>
                        ✦ PORTFOLIO DEMO
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: t.t1, fontFamily: t.disp, letterSpacing: '-0.5px', marginBottom: 8 }}>TaskFlow Features</div>
                    <div style={{ fontSize: 14, color: t.t2, lineHeight: 1.5 }}>TaskFlow includes powerful tools for productivity and collaboration. All features are unlocked.</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: t.inset, padding: '20px', borderRadius: 16, border: `1px solid ${t.border}` }}>
                    {features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${t.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: `1px solid ${t.accent}30` }}>
                                {f.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: t.t1, fontFamily: t.disp }}>{f.title}</div>
                                <div style={{ fontSize: 12, color: t.t2, marginTop: 2 }}>{f.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
