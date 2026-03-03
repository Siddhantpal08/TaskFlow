import { useState, useRef } from "react";
import { I, IC } from "../ui/Icon.jsx";
import BlockHandle from "./BlockHandle.jsx";

export default function NoteBlock({ blk, idx, t, dark, onUpdate, onDelete, onAddAfter, onSlash, onSlashClose }) {
    const ref = useRef();
    const [hov, setHov] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleKey = e => {
        if (e.key === "Enter" && blk.type !== "code") { e.preventDefault(); onAddAfter("p"); }
        if (e.key === "Backspace" && (e.currentTarget.innerText === "" || blk.content === "")) {
            e.preventDefault(); onDelete();
        }
    };

    const handleInput = e => {
        const txt = e.currentTarget.innerText || "";
        onUpdate({ content: txt });
        const li = txt.lastIndexOf("/");
        if (li !== -1) {
            const filter = txt.slice(li + 1);
            const rect = ref.current?.getBoundingClientRect();
            onSlash(rect, filter);
        } else { onSlashClose(); }
    };

    // ── DIVIDER ──
    if (blk.type === "divider") return (
        <div className="blkr" style={{ position: "relative", padding: "6px 0" }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onDelete={onDelete} t={t} />
            <hr style={{ border: "none", borderTop: `1.5px solid ${t.noteBorder}`, margin: "4px 0" }} />
        </div>
    );

    // ── CODE ──
    if (blk.type === "code") return (
        <div className="blkr" style={{ position: "relative", margin: "4px 0" }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onDelete={onDelete} t={t} />
            <div style={{ background: t.codeBg, borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}` }}>
                <div style={{ padding: "7px 14px", borderBottom: `1px solid ${t.noteBorder}22`, display: "flex", alignItems: "center", gap: 5 }}>
                    {["#ff5f57", "#ffbd2e", "#28c840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
                    <span style={{ marginLeft: 6, fontSize: 10.5, color: t.t3, fontFamily: t.mono }}>code</span>
                </div>
                <textarea value={blk.content} onChange={e => onUpdate({ content: e.target.value })}
                    onKeyDown={e => e.key === "Tab" && (e.preventDefault(), onUpdate({ content: blk.content + "  " }))}
                    style={{ width: "100%", background: "transparent", border: "none", color: t.codeText, fontFamily: t.mono, fontSize: 12.5, lineHeight: 1.7, padding: "10px 16px", resize: "none", minHeight: 80, outline: "none", display: "block" }}
                    rows={Math.max(3, (blk.content.match(/\n/g) || []).length + 2)} />
            </div>
        </div>
    );

    // ── CALLOUT ──
    if (blk.type === "callout") return (
        <div className="blkr" style={{ position: "relative", margin: "4px 0" }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onDelete={onDelete} t={t} />
            <div style={{ display: "flex", gap: 11, padding: "11px 14px", borderRadius: 10, background: t.calloutBg, border: `1px solid ${t.calloutBorder}` }}>
                <span style={{ fontSize: 17, flexShrink: 0, marginTop: 1 }}>💡</span>
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="Add a callout…" onInput={handleInput} onKeyDown={handleKey}
                    style={{ flex: 1, fontSize: 13.5, color: t.calloutText, lineHeight: 1.65, fontFamily: t.disp, wordBreak: "break-word" }}>
                    {blk.content}
                </div>
            </div>
        </div>
    );

    // ── QUOTE ──
    if (blk.type === "quote") return (
        <div className="blkr" style={{ position: "relative", margin: "4px 0" }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onDelete={onDelete} t={t} />
            <div style={{ display: "flex" }}>
                <div style={{ width: 3, borderRadius: 3, background: t.quoteBorder, flexShrink: 0 }} />
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="Add a quote…" onInput={handleInput} onKeyDown={handleKey}
                    style={{ flex: 1, fontSize: 15, color: t.quoteText, lineHeight: 1.7, fontFamily: "'Lora',serif", fontStyle: "italic", padding: "4px 16px", wordBreak: "break-word" }}>
                    {blk.content}
                </div>
            </div>
        </div>
    );

    // ── TODO ──
    if (blk.type === "todo") return (
        <div className="blkr" style={{ position: "relative" }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onDelete={onDelete} t={t} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "3px 0" }}>
                <button onClick={() => onUpdate({ checked: !blk.checked })}
                    style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 3, border: `1.5px solid ${blk.checked ? t.accent : t.noteBorder}`, background: blk.checked ? t.accent : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                    {blk.checked && <I d={IC.chk} sz={9} c={dark ? "#000" : "#fff"} sw={3} />}
                </button>
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="To-do…" onInput={handleInput} onKeyDown={handleKey}
                    style={{ flex: 1, fontSize: 14, lineHeight: 1.65, wordBreak: "break-word", color: blk.checked ? t.noteMuted : t.noteText, fontFamily: t.disp, textDecoration: blk.checked ? "line-through" : "none", transition: "all .2s" }}>
                    {blk.content}
                </div>
            </div>
        </div>
    );

    // ── TEXT BLOCKS (h1, h2, h3, p) ──
    const textStyles = {
        h1: { fontSize: 28, fontWeight: 700, lineHeight: 1.25, fontFamily: "'Lora',serif", color: t.noteText, paddingTop: 18, paddingBottom: 3 },
        h2: { fontSize: 20, fontWeight: 700, lineHeight: 1.3, fontFamily: t.disp, color: t.noteText, paddingTop: 12, paddingBottom: 2 },
        h3: { fontSize: 16, fontWeight: 600, lineHeight: 1.4, fontFamily: t.disp, color: t.noteText, paddingTop: 8, paddingBottom: 1 },
        p: { fontSize: 14.5, fontWeight: 400, lineHeight: 1.8, fontFamily: t.disp, color: t.noteSubText, paddingTop: 1, paddingBottom: 1 },
    };
    const st = textStyles[blk.type] || textStyles.p;

    return (
        <div className="blkr" style={{ position: "relative" }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onDelete={onDelete} t={t} />
            <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                data-ph={blk.type === "h1" ? "Heading 1" : blk.type === "h2" ? "Heading 2" : blk.type === "h3" ? "Heading 3" : "Write something, or '/' for commands…"}
                onInput={handleInput} onKeyDown={handleKey}
                style={{ ...st, wordBreak: "break-word", cursor: "text", outline: "none", minHeight: st.fontSize + 10 }}>
                {blk.content}
            </div>
        </div>
    );
}
