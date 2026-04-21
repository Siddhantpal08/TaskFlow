import { useState, useRef, useEffect } from "react";
import { LYRICS_ORDER } from "../../data/notes.js";

const SECTION_LABELS = {
    verse: "VERSE", chorus: "CHORUS", bridge: "BRIDGE",
    "pre-chorus": "PRE-CHORUS", hook: "HOOK", outro: "OUTRO"
};

const SECTION_COLORS = {
    verse: null,          // uses accent
    chorus: "bold",
    bridge: "italic",
    "pre-chorus": null,
    hook: null,
    outro: "muted",
};

export default function LyricsBlock({ blk, idx, t, onUpdate, onDelete, onAddAfter, onFocusPrev, onFocusNext, sectionNumber }) {
    const ref = useRef();
    const [hov, setHov] = useState(false);

    useEffect(() => {
        if (ref.current && document.activeElement !== ref.current && ref.current.innerText !== blk.content) {
            ref.current.innerText = blk.content || "";
        }
    }, [blk.content, blk.type]);

    const cycleType = () => {
        const cur = LYRICS_ORDER.indexOf(blk.type);
        const next = LYRICS_ORDER[(cur + 1) % LYRICS_ORDER.length];
        onUpdate({ type: next, content: ref.current?.innerText || "" });
    };

    const handleKey = e => {
        if (e.key === "Tab") { e.preventDefault(); cycleType(); return; }
        if (e.key === "Enter") {
            e.preventDefault();
            onAddAfter(blk.type); // continue same section type
        }
        if (e.key === "Backspace" && ref.current?.innerText.trim() === "") { e.preventDefault(); onDelete(); }
        if (e.key === "ArrowUp") { const s = window.getSelection(); if (s.anchorOffset === 0) { e.preventDefault(); onFocusPrev(); } }
        if (e.key === "ArrowDown") { const s = window.getSelection(); if (s.anchorOffset === (ref.current?.innerText.length || 0)) { e.preventDefault(); onFocusNext(); } }
    };

    const label = SECTION_LABELS[blk.type] || blk.type.toUpperCase();
    const isChorus = blk.type === "chorus";
    const isBridge = blk.type === "bridge";
    const isMuted = blk.type === "outro";

    const textColor = "var(--doc-color, " + (isMuted ? t.noteMuted
        : isChorus ? t.noteText
            : isBridge ? t.noteSubText
                : t.noteSubText) + ")";

    const borderColor = isChorus ? t.accent
        : isBridge ? t.blue || t.accent
            : blk.type === "hook" ? t.amber
                : t.noteBorder;

    return (
        <div style={{ position: "relative", marginTop: 8 }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            {/* Section label badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{
                    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.8px",
                    color: isChorus ? t.accent : t.noteMuted,
                    fontFamily: t.mono, textTransform: "uppercase",
                    background: isChorus ? t.accentDim : t.noteHover,
                    padding: "2px 8px", borderRadius: 20,
                    border: `1px solid ${isChorus ? t.accent + "44" : t.noteBorder}`,
                }}>
                    {label}{sectionNumber ? ` ${sectionNumber}` : ""}
                </span>
                {hov && (
                    <>
                        <button onMouseDown={e => { e.preventDefault(); cycleType(); }}
                            style={{
                                background: "none", border: "none", color: t.t3,
                                fontSize: 9.5, cursor: "pointer", fontFamily: t.mono, padding: 0
                            }}>Tab to change ↹</button>
                        <button onMouseDown={e => { e.preventDefault(); onDelete(); }}
                            style={{ background: "none", border: "none", color: t.red, fontSize: 12, cursor: "pointer", padding: "0 4px", marginLeft: "auto" }}>×</button>
                    </>
                )}
            </div>
            <div style={{ display: "flex" }}>
                {/* Left accent bar */}
                <div style={{ width: 3, borderRadius: 3, background: borderColor, flexShrink: 0, marginRight: 14 }} />
                <div
                    id={`blk-${idx}`} ref={ref}
                    contentEditable suppressContentEditableWarning
                    data-ph={`${label.charAt(0) + label.slice(1).toLowerCase()} lyrics…`}
                    onInput={e => onUpdate({ content: e.currentTarget.innerText || "" })}
                    onKeyDown={handleKey}
                    style={{
                        flex: 1,
                        fontSize: isChorus ? 15.5 : 14.5,
                        fontWeight: isChorus ? 600 : 400,
                        fontStyle: isBridge ? "italic" : "normal",
                        lineHeight: 1.95,
                        fontFamily: `var(--doc-font, 'Lora', serif)`,
                        color: textColor,
                        outline: "none",
                        wordBreak: "break-word",
                        cursor: "text",
                        whiteSpace: "pre-wrap",
                    }}
                />
            </div>
        </div>
    );
}
