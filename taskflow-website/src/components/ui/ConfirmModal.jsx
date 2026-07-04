import { createPortal } from "react-dom";

export default function ConfirmModal({ 
    t, 
    title = "Are you sure?", 
    description = "This action cannot be undone.", 
    confirmText = "Confirm", 
    cancelText = "Cancel", 
    onConfirm, 
    onCancel, 
    danger = false,
    icon = "⚠️",
    loading = false
}) {
    return createPortal(
        <div 
            onClick={onCancel} 
            style={{ 
                position: 'fixed', 
                inset: 0, 
                background: '#00000088', 
                zIndex: 9999, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backdropFilter: 'blur(2px)'
            }}
        >
            <div 
                onClick={e => e.stopPropagation()} 
                className="popIn" 
                style={{ 
                    background: t.card, 
                    border: `1px solid ${t.border}`, 
                    borderRadius: 16, 
                    padding: 24, 
                    width: 340, 
                    boxShadow: t.shadow, 
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Visual spot gradient */}
                <div style={{
                    position: "absolute",
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${danger ? t.red : t.accent}14 0%, transparent 70%)`,
                    top: "0%",
                    left: "50%",
                    transform: "translate(-50%, -30%)",
                    pointerEvents: "none"
                }} />

                <div style={{ fontSize: 44, marginBottom: 12, position: 'relative', zIndex: 1 }}>{icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: t.t1, marginBottom: 8, fontFamily: t.disp, position: 'relative', zIndex: 1 }}>
                    {title}
                </h3>
                <p style={{ fontSize: 13, color: t.t3, marginBottom: 24, lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
                    {description}
                </p>
                <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
                    <button 
                        onClick={onCancel} 
                        style={{ 
                            flex: 1, 
                            background: t.inset, 
                            border: `1px solid ${t.border}`, 
                            borderRadius: 8, 
                            padding: '10px', 
                            color: t.t2, 
                            cursor: 'pointer', 
                            fontFamily: t.disp, 
                            fontSize: 13, 
                            fontWeight: 600,
                            transition: 'background .15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = t.card}
                        onMouseLeave={e => e.currentTarget.style.background = t.inset}
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm} 
                        disabled={loading} 
                        style={{ 
                            flex: 1, 
                            background: danger ? t.red : t.accent, 
                            border: 'none', 
                            borderRadius: 8, 
                            padding: '10px', 
                            color: danger ? '#fff' : '#000', 
                            fontWeight: 700, 
                            cursor: 'pointer', 
                            fontFamily: t.disp, 
                            fontSize: 13,
                            opacity: loading ? 0.7 : 1,
                            transition: 'opacity .15s'
                        }}
                    >
                        {loading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
