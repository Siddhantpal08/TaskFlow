import { useState, useRef, useEffect } from "react";
import { SCRIPT_ORDER } from "../../data/notes.js";

const SCRIPT_STYLES = {
    "scene-heading": {
        fontFamily: "var(--doc-font, 'Courier New', Courier, monospace)",
        fontSize: 13.5, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.5px", color: null,
        borderBottom: "1px solid", paddingBottom: 4, paddingTop: 20, marginBottom: 4,
        tag: "Scene Heading",
    },
    "action": {
        fontFamily: "var(--doc-font, 'Courier New', Courier, monospace)",
        fontSize: 13, fontWeight: 400, paddingTop: 10, paddingBottom: 4,
        tag: "Action",
    },
    "character": {
        fontFamily: "var(--doc-font, 'Courier New', Courier, monospace)",
        fontSize: 13, fontWeight: 700, textTransform: "uppercase",
        textAlign: "center", letterSpacing: "1px", paddingTop: 18, paddingBottom: 0,
        tag: "Character",
    },
    "dialogue": {
        fontFamily: "var(--doc-font, 'Courier New', Courier, monospace)",
        fontSize: 13, fontWeight: 400, paddingTop: 2, paddingBottom: 4,
        textAlign: "center", maxWidth: "60%", margin: "0 auto",
        tag: "Dialogue",
    },
    "parenthetical": {
        fontFamily: "var(--doc-font, 'Courier New', Courier, monospace)",
        fontSize: 12.5, fontStyle: "italic", textAlign: "center",
        paddingTop: 2, paddingBottom: 2, tag: "Parenthetical",
        beforeText: "(", afterText: ")",
    },
    "transition": {
        fontFamily: "var(--doc-font, 'Courier New', Courier, monospace)",
        fontSize: 12.5, fontWeight: 700, textTransform: "uppercase",
        textAlign: "right", letterSpacing: "0.5px", paddingTop: 14, paddingBottom: 6,
        tag: "Transition",
    },
};

const SCRIPT_ORDER_LABELS = [
    { type: "scene-heading", label: "Scene Heading" },
    { type: "action", label: "Action" },
    { type: "character", label: "Character" },
    { type: "dialogue", label: "Dialogue" },
    { type: "parenthetical", label: "Parenthetical" },
    { type: "transition", label: "Transition" },
];

export default function ScriptBlock({ blk, idx, t, onUpdate, onDelete, onAddAfter, onFocusPrev, onFocusNext, sectionNumber }) {
    const ref = useRef();
    const [hov, setHov] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);
    const st = SCRIPT_STYLES[blk.type] || SCRIPT_STYLES["action"];

    useEffect(() => {
        if (ref.current && document.activeElement !== ref.current && ref.current.innerText !== blk.content) {
            ref.current.innerText = blk.content || "";
        }
    }, [blk.content, blk.type]);

    const cycleType = () => {
        const cur = SCRIPT_ORDER.indexOf(blk.type);
        const next = SCRIPT_ORDER[(cur + 1) % SCRIPT_ORDER.length];
        onUpdate({ type: next, content: ref.current?.innerText || "" });
        setTimeout(() => ref.current?.focus(), 30);
    };

    const setType = (type) => {
        onUpdate({ type, content: ref.current?.innerText || "" });
        setShowTypePicker(false);
        setTimeout(() => ref.current?.focus(), 30);
    };

    const handleKey = e => {
        if (e.key === "Tab") { e.preventDefault(); cycleType(); return; }
        if (e.key === "Enter") {
            e.preventDefault();
            // Natural progression after each block type
            let next = "action";
            if (blk.type === "scene-heading") next = "action";
            else if (blk.type === "action") next = "character";
            else if (blk.type === "character") next = "dialogue";
            else if (blk.type === "dialogue") next = "action";
            else if (blk.type === "parenthetical") next = "dialogue";
            else if (blk.type === "transition") next = "scene-heading";
            onAddAfter(next);
        }
        if (e.key === "Backspace" && ref.current?.innerText.trim() === "") { e.preventDefault(); onDelete(); }
        if (e.key === "ArrowUp") { const s = window.getSelection(); if (s.anchorOffset === 0) { e.preventDefault(); onFocusPrev(); } }
        if (e.key === "ArrowDown") { const s = window.getSelection(); if (s.anchorOffset === (ref.current?.innerText.length || 0)) { e.preventDefault(); onFocusNext(); } }
    };

    const textColor = "var(--doc-color, " + (blk.type === "scene-heading" ? t.accent
        : blk.type === "transition" ? t.t2
            : blk.type === "parenthetical" ? t.noteMuted
                : t.noteText) + ")";

    return (
        <div style={{ position: "relative", margin: "2px 0" }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => { setHov(false); }}>
            {/* Hover controls — positioned ABOVE / LEFT so they never cover the text */}
            {(hov || showTypePicker) && (
                <div style={{
                    position: "absolute", left: 0, top: -26,
                    display: "flex", alignItems: "center", gap: 4, zIndex: 20,
                }}>
                    {/* Type badge / picker toggle */}
                    <div style={{ position: "relative" }}>
                        <button onMouseDown={e => { e.preventDefault(); setShowTypePicker(p => !p); }}
                            style={{
                                background: t.accentDim, border: `1px solid ${t.accent}44`, borderRadius: 6,
                                color: t.accent, fontSize: 9.5, padding: "2px 8px", cursor: "pointer",
                                fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.3px", whiteSpace: "nowrap",
                            }}>
                            {st.tag} ▾
                        </button>
                        {showTypePicker && (
                            <>
                                <div onClick={() => setShowTypePicker(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
                                <div style={{
                                    position: "absolute", top: "100%", left: 0, marginTop: 2, zIndex: 20,
                                    background: t.card, border: `1px solid ${t.border}`, borderRadius: 9,
                                    boxShadow: t.shadow, minWidth: 150, overflow: "hidden",
                                }}>
                                    {SCRIPT_ORDER_LABELS.map(item => (
                                        <button key={item.type}
                                            onMouseDown={e => { e.preventDefault(); setType(item.type); }}
                                            style={{
                                                display: "block", width: "100%", padding: "7px 12px", border: "none",
                                                background: blk.type === item.type ? t.accentDim : "transparent",
                                                color: blk.type === item.type ? t.accent : t.t1,
                                                cursor: "pointer", fontSize: 12, fontFamily: t.mono,
                                                textAlign: "left", transition: "background .1s",
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = t.noteHover}
                                            onMouseLeave={e => e.currentTarget.style.background = blk.type === item.type ? t.accentDim : "transparent"}>
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <span style={{ fontSize: 9.5, color: t.t3, fontFamily: t.mono }}>Tab to cycle</span>
                    <button onMouseDown={e => { e.preventDefault(); onDelete(); }}
                        style={{ background: "none", border: "none", color: t.red, fontSize: 14, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
                </div>
            )}
            <div
                id={`blk-${idx}`} ref={ref}
                contentEditable suppressContentEditableWarning
                data-ph={st.tag + "…"}
                onInput={e => onUpdate({ content: e.currentTarget.innerText || "" })}
                onKeyDown={handleKey}
                style={{
                    fontFamily: st.fontFamily,
                    fontSize: st.fontSize,
                    fontWeight: st.fontWeight || 400,
                    fontStyle: st.fontStyle || "normal",
                    textTransform: st.textTransform || "none",
                    textAlign: st.textAlign || "left",
                    letterSpacing: st.letterSpacing || "normal",
                    color: textColor,
                    paddingTop: (hov || showTypePicker) ? (st.paddingTop || 4) + 28 : (st.paddingTop || 4),
                    paddingBottom: st.paddingBottom || 4,
                    marginLeft: st.textAlign === "center" ? "auto" : 0,
                    marginRight: st.textAlign === "center" ? "auto" : 0,
                    maxWidth: st.maxWidth || "100%",
                    width: st.maxWidth ? undefined : "100%",
                    borderBottom: blk.type === "scene-heading" ? `1px solid ${t.accent}40` : "none",
                    outline: "none",
                    wordBreak: "break-word",
                    lineHeight: 1.7,
                    cursor: "text",
                    transition: "padding-top .15s",
                }}
            />
            {/* Auto Scene Number */}
            {blk.type === "scene-heading" && sectionNumber && (
                <div style={{
                    position: "absolute",
                    left: -32,
                    top: (hov || showTypePicker) ? (st.paddingTop || 4) + 29 : (st.paddingTop || 4) + 1,
                    fontSize: 10,
                    color: t.accent,
                    fontFamily: t.mono,
                    fontWeight: 700
                }}>
                    SC {sectionNumber}
                </div>
            )}
        </div>
    );
}
