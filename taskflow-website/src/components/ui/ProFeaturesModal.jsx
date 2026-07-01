import { I, IC } from "./Icon.jsx";

export default function ProFeaturesModal({ t, onClose, onUpgrade }) {
    const proFeatures = [
        { icon: "✨", title: "Unlimited Note Pages", desc: "Build out a massive second brain with zero limits." },
        { icon: "✅", title: "Unlimited Tasks & Sub-tasks", desc: "Break down complex projects endlessly." },
        { icon: "👥", title: "Unlimited Team Members", desc: "Collaborate with your entire agency or team." },
        { icon: "🎵", title: "Script & Lyrics Modes", desc: "Specialized note formats for creators." },
        { icon: "🔗", title: "Public Link Sharing", desc: "Share notes instantly with external clients." },
        { icon: "📄", title: "PDF Exporting", desc: "Download professional documents of your notes." },
        { icon: "⚡", title: "Real-time Collaboration", desc: "See your team's cursors instantly." }
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
                    <div style={{ fontSize: 13, color: t.accent, fontFamily: t.mono, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Unlock Everything</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: t.t1, fontFamily: t.disp, letterSpacing: '-0.5px' }}>TaskFlow Pro ✦</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: t.inset, padding: '20px', borderRadius: 16, border: `1px solid ${t.border}` }}>
                    {proFeatures.map((f, i) => (
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

                <button onClick={onUpgrade} style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                    background: `linear-gradient(135deg, ${t.accent}, #0072FF)`, color: '#fff',
                    fontSize: 15, fontWeight: 800, fontFamily: t.disp, cursor: 'pointer',
                    boxShadow: `0 8px 24px ${t.accent}55`, transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    Upgrade Now →
                </button>
            </div>
        </div>
    );
}
