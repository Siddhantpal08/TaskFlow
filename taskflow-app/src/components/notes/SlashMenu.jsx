import { useState, useEffect } from "react";
import { BLOCK_TYPES } from "../../data/notes.js";

export default function SlashMenu({ t, filter, pos, onSelect, onClose }) {
    const [sel, setSel] = useState(0);
    const filtered = BLOCK_TYPES.filter(b =>
        !filter || b.label.toLowerCase().includes(filter.toLowerCase()) ||
        b.type.toLowerCase().includes(filter.toLowerCase())
    );

    useEffect(() => {
        const h = e => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, filtered.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
            if (e.key === "Enter" && filtered[sel]) { e.preventDefault(); onSelect(filtered[sel].type); }
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [sel, filtered, onSelect, onClose]);

    return (
        <>
            <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 998 }} />
            <div className="slideDown" style={{
                position: "fixed", left: Math.min(pos.x, window.innerWidth - 250),
                top: pos.y, zIndex: 999, background: t.card, border: `1px solid ${t.border}`,
                borderRadius: 10, boxShadow: t.shadow, width: 240, overflow: "hidden", maxHeight: 320, overflowY: "auto"
            }}>
                <div style={{ padding: "5px 10px", fontSize: 9.5, color: t.t3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${t.border}`, fontFamily: t.mono }}>Block types</div>
                {filtered.map((bt, i) => (
                    <div key={bt.type} onClick={() => onSelect(bt.type)}
                        style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", cursor: "pointer", background: i === sel ? t.accentDim : "transparent", transition: "background .1s" }}
                        onMouseEnter={() => setSel(i)}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: t.surf, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: t.accent, fontFamily: t.mono, flexShrink: 0 }}>
                            {bt.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: t.t1 }}>{bt.label}</div>
                            <div style={{ fontSize: 10.5, color: t.t3 }}>{bt.desc}</div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <div style={{ padding: "14px 10px", color: t.t3, fontSize: 12.5, textAlign: "center" }}>No match</div>}
            </div>
        </>
    );
}
