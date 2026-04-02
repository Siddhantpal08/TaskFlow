import { useState, useRef, useEffect } from "react";
import { I, IC } from "../ui/Icon.jsx";
import BlockHandle from "./BlockHandle.jsx";

export default function NoteBlock({ blk, idx, t, dark, onUpdate, onDelete, onAddAfter, onSlash, onSlashClose, onOpenSlash, onFocusPrev, onFocusNext, onPasteHTML }) {
    const ref = useRef();
    const [hov, setHov] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const openSlashMenu = () => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) onSlash(rect, "");
    };

    useEffect(() => {
        if (ref.current && document.activeElement !== ref.current && ref.current.innerText !== blk.content && blk.type !== "link" && blk.type !== "code") {
            ref.current.innerText = blk.content || "";
        }
    }, [blk.content, blk.type]);

    const handleKey = e => {
        if (e.key === "/") {
            e.preventDefault();
            openSlashMenu();
            return;
        }
        if (e.key === "Enter" && blk.type !== "code") {
            e.preventDefault();
            onAddAfter(blk.type === "todo" ? "todo" : "p");
        }
        if (e.key === "Backspace" && ref.current?.innerText.trim() === "") {
            e.preventDefault();
            onDelete();
        }
        if (e.key === "ArrowUp") {
            const sel = window.getSelection();
            if (sel.anchorOffset === 0) {
                e.preventDefault();
                onFocusPrev();
            }
        }
        if (e.key === "ArrowDown") {
            const sel = window.getSelection();
            if (sel.anchorOffset === (ref.current?.innerText.length || 0) || ref.current?.innerText === "") {
                e.preventDefault();
                onFocusNext();
            }
        }
    };

    const handleInput = e => {
        const txt = e.currentTarget.innerText || "";
        onUpdate({ content: txt });
        onSlashClose();
    };

    const handlePaste = e => {
        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');
        if (onPasteHTML && (html || text)) {
            if (onPasteHTML(html, text, idx)) {
                e.preventDefault();
            }
        }
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
                    data-ph="Add a callout…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    style={{ flex: 1, fontSize: 13.5, color: t.calloutText, lineHeight: 1.65, fontFamily: t.disp, wordBreak: "break-word" }}>
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
                    data-ph="Add a quote…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    style={{ flex: 1, fontSize: 15, color: t.quoteText, lineHeight: 1.7, fontFamily: "'Lora',serif", fontStyle: "italic", padding: "4px 16px", wordBreak: "break-word" }}>
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
                    data-ph="To-do…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    style={{ flex: 1, fontSize: 14, lineHeight: 1.65, wordBreak: "break-word", color: blk.checked ? t.noteMuted : t.noteText, fontFamily: t.disp, textDecoration: blk.checked ? "line-through" : "none", transition: "all .2s" }}>
                </div>
            </div>
        </div>
    );

    // ── LINK ──
    if (blk.type === "link") return (
        <div className="blkr" style={{ position: "relative", margin: "4px 0" }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onDelete={onDelete} t={t} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 14px", borderRadius: 8, background: t.card, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <I d={IC.lnk} sz={16} c={t.accent} />
                    <input value={blk.label || ""} onChange={e => onUpdate({ label: e.target.value })} placeholder="Link text…" style={{ flex: 1, background: "transparent", border: "none", color: t.t1, fontSize: 13, fontWeight: 600, outline: "none" }} />
                    {blk.url && <button onClick={() => window.open(blk.url, "_blank")} style={{ background: t.accentDim, border: "none", color: t.accent, padding: "4px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: t.disp, fontWeight: 700 }}>Open</button>}
                </div>
                <input value={blk.url || ""} onChange={e => onUpdate({ url: e.target.value })} placeholder="https://..." style={{ background: t.inset, border: `1px solid ${t.border}`, color: t.t2, fontSize: 11, padding: "6px 10px", borderRadius: 6, outline: "none", fontFamily: t.mono }} />
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

            {/* Quick Type Convert Toolbar Workspace */}
            {hov && (blk.type === 'p' || blk.type === 'h1' || blk.type === 'h2' || blk.type === 'h3') && (
                <div style={{
                    position: 'absolute', right: blk.type === 'p' ? 95 : 0, top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', gap: 4, zIndex: 2, background: t.card, border: `1px solid ${t.border}`,
                    borderRadius: 6, padding: '2px 4px'
                }}>
                    {['h1', 'h2', 'h3', 'p'].map(bt => (
                        <button key={bt} onClick={() => onUpdate({ type: bt, content: ref.current?.innerText })}
                            title={`Convert to ${bt.toUpperCase()}`}
                            style={{
                                background: blk.type === bt ? t.accentDim : 'transparent', border: 'none',
                                color: blk.type === bt ? t.accent : t.t3, fontSize: 10, fontFamily: t.mono, cursor: 'pointer',
                                padding: '2px 5px', borderRadius: 4, textTransform: 'uppercase', transition: 'all .1s'
                            }}>
                            {bt}
                        </button>
                    ))}
                </div>
            )}

            {/* Commands button — visible on hover */}
            {hov && blk.type === 'p' && (
                <button
                    onClick={openSlashMenu}
                    style={{
                        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                        background: t.card, border: `1px solid ${t.border}`, borderRadius: 6,
                        padding: '2px 7px', fontSize: 10, color: t.t3, cursor: 'pointer',
                        fontFamily: t.mono, display: 'flex', alignItems: 'center', gap: 4,
                        whiteSpace: 'nowrap', zIndex: 2,
                    }}
                    title="Insert block (or type / to open)">
                    / Commands
                </button>
            )}
            <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                data-ph={blk.type === "h1" ? "Heading 1" : blk.type === "h2" ? "Heading 2" : blk.type === "h3" ? "Heading 3" : "Write something, or '/' for commands…"}
                onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                style={{ ...st, wordBreak: "break-word", cursor: "text", outline: "none", minHeight: st.fontSize + 10, paddingRight: hov && blk.type === 'p' ? 180 : 90 }}>
            </div>
        </div>
    );
}
