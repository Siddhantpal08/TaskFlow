import { I, IC } from "../ui/Icon.jsx";

export default function BlockHandle({ hov, menuOpen, setMenuOpen, onDelete, t }) {
    return (
        <div className="blkh" style={{
            position: "absolute", left: -44, top: "50%", transform: "translateY(-50%)",
            display: "flex", alignItems: "center", gap: 2, opacity: hov ? 1 : 0, transition: "opacity .15s", zIndex: 10
        }}>
            <span style={{ fontSize: 14, color: t.t3, cursor: "grab", padding: "2px 3px", borderRadius: 4, lineHeight: 1, userSelect: "none" }}
                onMouseEnter={e => e.currentTarget.style.background = t.noteHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>⠿</span>
            <div style={{ position: "relative" }}>
                <button onClick={() => setMenuOpen(p => !p)}
                    style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 4, color: t.t3 }}
                    onMouseEnter={e => e.currentTarget.style.background = t.noteHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" />
                        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
                        <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
                    </svg>
                </button>
                {menuOpen && (
                    <>
                        <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 200 }} />
                        <div className="slideDown" style={{ position: "absolute", left: "100%", top: 0, zIndex: 201, background: t.card, border: `1px solid ${t.border}`, borderRadius: 9, boxShadow: t.shadow, width: 130, overflow: "hidden" }}>
                            {[{ l: "Delete", danger: true, fn: onDelete }].map(item => (
                                <button key={item.l} onClick={() => { item.fn(); setMenuOpen(false); }}
                                    style={{ width: "100%", padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: 12.5, color: item.danger ? t.red : t.t1, fontFamily: t.disp, textAlign: "left", transition: "background .1s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = item.danger ? t.red + "15" : t.noteHover}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    {item.l}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
