import { useState, useEffect, useRef } from "react";
import { BLOCK_TYPES } from "../../data/notes.js";

export default function SlashMenu({ t, filter, pos, onSelect, onClose, blockTypes }) {
    const ALL_TYPES = blockTypes || BLOCK_TYPES;
    const [sel, setSel] = useState(0);
    const menuRef = useRef();
    const MENU_W = 240;
    const MENU_H = 320;

    const filtered = ALL_TYPES.filter(b =>
        !filter || b.label.toLowerCase().includes(filter.toLowerCase()) ||
        b.type.toLowerCase().includes(filter.toLowerCase())
    );

    // Always anchor to the RIGHT of the viewport so it never overlaps the text
    const right = 8;
    const flipUp = pos.y + MENU_H > window.innerHeight - 16;
    const top = flipUp ? pos.y - MENU_H - 8 : pos.y;

    useEffect(() => setSel(0), [filter]);

    useEffect(() => {
        const h = e => {
            if (e.key === "Escape" || e.key === "Delete" || e.key === "Backspace") onClose();
            if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, filtered.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
            if (e.key === "Enter" && filtered[sel]) { e.preventDefault(); onSelect(filtered[sel].type); }
        };
        window.addEventListener("keydown", h, true);
        return () => window.removeEventListener("keydown", h, true);
    }, [sel, filtered, onSelect, onClose]);

    useEffect(() => {
        const el = document.getElementById(`slash-item-${sel}`);
        if (el) el.scrollIntoView({ block: "nearest" });
    }, [sel]);

    return (
        <>
            <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 998 }} />
            <div ref={menuRef} className="slideDown" style={{
                position: "fixed", right, top, zIndex: 999,
                background: t.card, border: `1px solid ${t.border}`,
                borderRadius: 10, boxShadow: t.shadow, width: MENU_W,
                overflow: "hidden", maxHeight: MENU_H, overflowY: "auto"
            }}>
                <div style={{ padding: "6px 10px 5px", fontSize: 9.5, color: t.t3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${t.border}`, fontFamily: t.mono, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Block types</span>
                    <span style={{ fontSize: 9, opacity: 0.5 }}>↑↓ navigate · Enter select</span>
                </div>
                {filtered.map((bt, i) => (
                    <div key={bt.type} id={`slash-item-${i}`} onClick={() => onSelect(bt.type)}
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
