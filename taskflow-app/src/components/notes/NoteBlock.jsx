import { useState, useRef, useEffect } from "react";
import { I, IC } from "../ui/Icon.jsx";
import BlockHandle from "./BlockHandle.jsx";
import ScriptBlock from "./ScriptBlock.jsx";
import LyricsBlock from "./LyricsBlock.jsx";
import { SCRIPT_TYPES, LYRICS_TYPES } from "../../data/notes.js";

// Detects YouTube video ID from a URL string
function ytId(url) {
    try {
        const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_\-]{11})/);
        return m ? m[1] : null;
    } catch { return null; }
}

// Simple link preview card
function LinkPreview({ content, t, onDismiss }) {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = content?.match(urlRegex) || [];
    if (!urls.length) return null;

    const previews = urls.map(url => {
        const vid = ytId(url);
        if (vid) return { url, type: "youtube", vid };
        try { return { url, type: "link", host: new URL(url).hostname }; } catch { return null; }
    }).filter(Boolean);

    if (!previews.length) return null;

    return (
        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
            {previews.map((p, i) => (
                <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}`, background: t.card, position: "relative" }}>
                    <button onClick={() => onDismiss(p.url)}
                        style={{ position: "absolute", top: 5, right: 7, background: "none", border: "none", color: t.t3, cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
                    {p.type === "youtube" ? (
                        <a href={p.url} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none" }}>
                            <img src={`https://img.youtube.com/vi/${p.vid}/mqdefault.jpg`}
                                alt="YouTube thumbnail"
                                style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
                            <div style={{ padding: "7px 10px", fontSize: 11, color: t.accent, fontFamily: t.mono }}>▶ YouTube Video — {p.url}</div>
                        </a>
                    ) : (
                        <a href={p.url} target="_blank" rel="noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", textDecoration: "none" }}>
                            <img src={`https://www.google.com/s2/favicons?domain=${p.host}&sz=24`} alt=""
                                style={{ width: 16, height: 16, borderRadius: 3 }}
                                onError={e => { e.target.style.display = "none"; }} />
                            <span style={{ fontSize: 11, color: t.accent, fontFamily: t.mono, wordBreak: "break-all" }}>{p.host}</span>
                            <span style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginLeft: "auto", flexShrink: 0 }}>↗ Open</span>
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function NoteBlock({
    blk, idx, t, dark, onUpdate, onDelete, onAddAfter, onSlash, onSlashClose,
    onFocusPrev, onFocusNext, onPasteHTML, olIndex,
    // drag-and-drop props passed from NotesPage
    onDragStart, onDragOver, onDrop, isDragging, isDragOver,
    // Convert existing block to a different type
    onConvert,
}) {
    const ref = useRef();
    const [hov, setHov] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dismissedUrls, setDismissedUrls] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [focused, setFocused] = useState(false);

    // Show link preview after blur if content has URLs
    const handleBlur = () => {
        setFocused(false);
        const content = ref.current?.innerText || "";
        if (/https?:\/\/[^\s]+/.test(content)) setShowPreview(true);
    };

    const openSlashMenu = () => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) onSlash(rect, "");
    };

    useEffect(() => {
        if (
            ref.current &&
            document.activeElement !== ref.current &&
            ref.current.innerText !== blk.content &&
            blk.type !== "link" && blk.type !== "code"
        ) {
            ref.current.innerText = blk.content || "";
        }
    }, [blk.content, blk.type]);

    const handleKey = e => {
        // Ctrl+A / Cmd+A: select all text inside this block only
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            const el = ref.current;
            if (!el) return;
            const range = document.createRange();
            range.selectNodeContents(el);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            return;
        }

        // Space key — auto-detect markdown list shortcuts
        if (e.key === ' ' && blk.type === 'p') {
            const curText = ref.current?.innerText || '';
            if (/^\d+\.?$/.test(curText.trim())) {
                // '1 ' or '1. ' → numbered list
                e.preventDefault();
                ref.current.innerText = '';
                onUpdate({ type: 'ol', content: '' });
                return;
            }
            if (curText.trim() === '-' || curText.trim() === '*') {
                // '- ' or '* ' → bullet list
                e.preventDefault();
                ref.current.innerText = '';
                onUpdate({ type: 'ul', content: '' });
                return;
            }
            if (curText.trim() === '[]' || curText.trim() === '[ ]') {
                // '[] ' → todo
                e.preventDefault();
                ref.current.innerText = '';
                onUpdate({ type: 'todo', content: '' });
                return;
            }
            if (curText.trim() === '>') {
                // '> ' → quote
                e.preventDefault();
                ref.current.innerText = '';
                onUpdate({ type: 'quote', content: '' });
                return;
            }
        }

        // Tab/Shift+Tab — indent/dedent for list types
        if (e.key === 'Tab' && (blk.type === 'ul' || blk.type === 'ol')) {
            e.preventDefault();
            const cur = blk.indent || 0;
            if (e.shiftKey) {
                if (cur > 0) onUpdate({ indent: cur - 1 });
                else onUpdate({ type: 'p', indent: 0 }); // exit list
            } else {
                onUpdate({ indent: Math.min(cur + 1, 4) });
            }
            return;
        }

        if (e.key === '/') {
            e.preventDefault();
            openSlashMenu();
            return;
        }

        if (e.key === 'Enter' && blk.type !== 'code') {
            const curText = ref.current?.innerText || '';

            if (blk.type === 'p') {
                if (curText.trim() === '') {
                    e.preventDefault();
                    onAddAfter('p');
                }
                return;
            }

            e.preventDefault();

            // List Exit: only if the ENTIRE block is empty
            if ((blk.type === 'ul' || blk.type === 'ol' || blk.type === 'todo') && curText.trim() === '') {
                const indent = blk.indent || 0;
                if (indent > 0) onUpdate({ indent: indent - 1 });
                else onUpdate({ type: 'p', content: '', indent: 0 });
                return;
            }

            // Continue list types with a new sibling block
            if (blk.type === 'ul') { onAddAfter('ul'); return; }
            if (blk.type === 'ol') { onAddAfter('ol'); return; }
            if (blk.type === 'todo') { onAddAfter('todo'); return; }
            onAddAfter('p');
        }

        if (e.key === 'Backspace' && (ref.current?.innerText || '').trim() === '') {
            e.preventDefault();
            onDelete();
        }
        if (e.key === 'ArrowUp') {
            const sel = window.getSelection();
            if (sel.anchorOffset === 0) { e.preventDefault(); onFocusPrev(); }
        }
        if (e.key === 'ArrowDown') {
            const sel = window.getSelection();
            if (sel.anchorOffset === (ref.current?.innerText.length || 0) || ref.current?.innerText === '') {
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

    // Block drag handlers
    const handleDragStart = e => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(idx);
    };
    const handleDragOver = e => {
        e.preventDefault();
        onDragOver?.(idx);
    };
    const handleDrop = e => {
        e.preventDefault();
        onDrop?.(idx);
    };

    const wrapperStyle = {
        position: "relative",
        opacity: isDragging ? 0.4 : 1,
        outline: isDragOver ? `2px dashed ${t.accent}` : "none",
        borderRadius: 6,
        transition: "opacity .15s, outline .1s",
    };

    // Indent padding for lists
    const indentPx = (blk.indent || 0) * 22;

    // Delegate creative writing block types
    if (SCRIPT_TYPES.has(blk.type)) {
        return (
            <div style={wrapperStyle}
                draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}>
                <ScriptBlock blk={blk} idx={idx} t={t}
                    onUpdate={onUpdate} onDelete={onDelete} onAddAfter={onAddAfter}
                    onFocusPrev={onFocusPrev} onFocusNext={onFocusNext} />
            </div>
        );
    }
    if (LYRICS_TYPES.has(blk.type)) {
        return (
            <div style={wrapperStyle}
                draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}>
                <LyricsBlock blk={blk} idx={idx} t={t}
                    onUpdate={onUpdate} onDelete={onDelete} onAddAfter={onAddAfter}
                    onFocusPrev={onFocusPrev} onFocusNext={onFocusNext} />
            </div>
        );
    }

    // ── DIVIDER ──
    if (blk.type === "divider") return (
        <div className="blkr" style={{ ...wrapperStyle, padding: "6px 0" }}
            draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
                onDelete={onDelete} onConvert={onConvert} t={t} blkType={blk.type} />
            <hr
                tabIndex={0}
                onKeyDown={e => {
                    if (e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); onAddAfter("p"); }
                    if (e.key === "ArrowUp") { e.preventDefault(); onFocusPrev(); }
                }}
                style={{ border: "none", borderTop: `1.5px solid ${t.noteBorder}`, margin: "4px 0", cursor: "default", outline: "none" }} />
        </div>
    );

    // ── CODE ──
    if (blk.type === "code") return (
        <div className="blkr" style={{ ...wrapperStyle, margin: "4px 0" }}
            draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
                onDelete={onDelete} onConvert={onConvert} t={t} blkType={blk.type} />
            <div style={{ background: t.codeBg, borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}` }}>
                <div style={{ padding: "7px 14px", borderBottom: `1px solid ${t.noteBorder}22`, display: "flex", alignItems: "center", gap: 5 }}>
                    {["#ff5f57", "#ffbd2e", "#28c840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
                    <span style={{ marginLeft: 6, fontSize: 10.5, color: t.t3, fontFamily: t.mono }}>code</span>
                    <button onClick={() => onConvert?.("p")}
                        style={{ marginLeft: "auto", background: "none", border: "none", color: t.t3, fontSize: 10, cursor: "pointer", fontFamily: t.mono, padding: "0 4px" }}
                        title="Convert to text">✕ code</button>
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
        <div className="blkr" style={{ ...wrapperStyle, margin: "4px 0" }}
            draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
                onDelete={onDelete} onConvert={onConvert} t={t} blkType={blk.type} />
            <div style={{ display: "flex", gap: 11, padding: "11px 14px", borderRadius: 10, background: t.calloutBg, border: `1px solid ${t.calloutBorder}` }}>
                <span style={{ fontSize: 17, flexShrink: 0, marginTop: 1 }}>💡</span>
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="Add a callout…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    onFocus={() => setFocused(true)} onBlur={handleBlur}
                    style={{ flex: 1, fontSize: 13.5, color: t.calloutText, lineHeight: 1.65, fontFamily: t.disp, wordBreak: "break-word", outline: "none" }}>
                </div>
            </div>
        </div>
    );

    // ── QUOTE ──
    if (blk.type === "quote") return (
        <div className="blkr" style={{ ...wrapperStyle, margin: "4px 0" }}
            draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
                onDelete={onDelete} onConvert={onConvert} t={t} blkType={blk.type} />
            <div style={{ display: "flex" }}>
                <div style={{ width: 3, borderRadius: 3, background: t.quoteBorder, flexShrink: 0 }} />
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="Add a quote…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    onFocus={() => setFocused(true)} onBlur={handleBlur}
                    style={{ flex: 1, fontSize: 15, color: t.quoteText, lineHeight: 1.7, fontFamily: "'Lora',serif", fontStyle: "italic", padding: "4px 16px", wordBreak: "break-word", outline: "none" }}>
                </div>
            </div>
        </div>
    );

    // ── TODO ──
    if (blk.type === "todo") return (
        <div className="blkr" style={{ ...wrapperStyle, paddingLeft: indentPx }}
            draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
                onDelete={onDelete} onConvert={onConvert} t={t} blkType={blk.type} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "3px 0" }}>
                <button onClick={() => onUpdate({ checked: !blk.checked })}
                    style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 3, border: `1.5px solid ${blk.checked ? t.accent : t.noteBorder}`, background: blk.checked ? t.accent : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                    {blk.checked && <I d={IC.chk} sz={9} c={dark ? "#000" : "#fff"} sw={3} />}
                </button>
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="To-do…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    onFocus={() => setFocused(true)} onBlur={handleBlur}
                    style={{ flex: 1, fontSize: 14, lineHeight: 1.65, wordBreak: "break-word", color: blk.checked ? t.noteMuted : t.noteText, fontFamily: t.disp, textDecoration: blk.checked ? "line-through" : "none", transition: "all .2s", outline: "none" }}>
                </div>
            </div>
        </div>
    );

    // ── BULLET LIST (ul) ──
    if (blk.type === "ul") return (
        <div className="blkr" style={{ ...wrapperStyle, paddingLeft: indentPx }}
            draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
                onDelete={onDelete} onConvert={onConvert} t={t} blkType={blk.type} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "2px 0" }}>
                <span style={{ color: t.accent, fontSize: (blk.indent || 0) > 0 ? 12 : 18, lineHeight: 1.6, flexShrink: 0, userSelect: "none", marginTop: 1 }}>
                    {(blk.indent || 0) === 0 ? "•" : (blk.indent || 0) === 1 ? "◦" : "▸"}
                </span>
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="List item…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    onFocus={() => setFocused(true)} onBlur={handleBlur}
                    style={{ flex: 1, fontSize: 14.5, lineHeight: 1.8, wordBreak: "break-word", color: t.noteSubText, fontFamily: t.disp, outline: "none" }}>
                </div>
            </div>
        </div>
    );

    // ── NUMBERED LIST (ol) ──
    if (blk.type === "ol") return (
        <div className="blkr" style={{ ...wrapperStyle, paddingLeft: indentPx }}
            draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
                onDelete={onDelete} onConvert={onConvert} t={t} blkType={blk.type} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "2px 0" }}>
                <span style={{ color: t.accent, fontSize: 13.5, fontWeight: 700, lineHeight: 1.9, flexShrink: 0, userSelect: "none", fontFamily: t.mono, minWidth: 20, textAlign: "right" }}>
                    {(olIndex || 0) + 1}.
                </span>
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="List item…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    onFocus={() => setFocused(true)} onBlur={handleBlur}
                    style={{ flex: 1, fontSize: 14.5, lineHeight: 1.8, wordBreak: "break-word", color: t.noteSubText, fontFamily: t.disp, outline: "none" }}>
                </div>
            </div>
        </div>
    );

    // ── LINK ──
    if (blk.type === "link") return (
        <div className="blkr" style={{ ...wrapperStyle, margin: "4px 0" }}
            draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
                onDelete={onDelete} onConvert={onConvert} t={t} blkType={blk.type} />
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

    // Placeholder: only show "Write something…" if type is p (empty paragraph)
    const placeholder = blk.type === "h1" ? "Heading 1"
        : blk.type === "h2" ? "Heading 2"
            : blk.type === "h3" ? "Heading 3"
                : ""; // paragraph: no persistent placeholder — use CSS :empty::before only when focused

    return (
        <div className="blkr" style={{ ...wrapperStyle }}
            draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
                onDelete={onDelete} onConvert={onConvert} t={t} blkType={blk.type} />

            {hov && (blk.type === 'p' || blk.type === 'h1' || blk.type === 'h2' || blk.type === 'h3') && (
                <div style={{
                    position: 'absolute', left: -44, top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', gap: 2, zIndex: 15, pointerEvents: 'all',
                }}>
                    <div style={{
                        display: 'flex', gap: 1, background: t.card, border: `1px solid ${t.border}`,
                        borderRadius: 6, padding: '2px 3px', boxShadow: t.shadow,
                    }}>
                        {['h1', 'h2', 'h3', 'p'].map(bt => (
                            <button key={bt}
                                onMouseDown={e => { e.preventDefault(); onConvert?.(bt); }}
                                style={{
                                    background: blk.type === bt ? t.accentDim : 'transparent', border: 'none',
                                    color: blk.type === bt ? t.accent : t.t3, fontSize: 9.5, fontFamily: t.mono, cursor: 'pointer',
                                    padding: '2px 4px', borderRadius: 4, textTransform: 'uppercase', transition: 'all .1s',
                                    fontWeight: blk.type === bt ? 700 : 400,
                                }}>
                                {bt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                data-ph={blk.type === "p" && !focused ? "" : placeholder}
                onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                onFocus={() => setFocused(true)} onBlur={handleBlur}
                style={{ ...st, wordBreak: "break-word", cursor: "text", outline: "none", minHeight: st.fontSize + 10 }}>
            </div>

            {/* Link preview (shown after blur if content has URLs) */}
            {showPreview && !dismissedUrls.includes("all") && (
                <LinkPreview
                    content={blk.content}
                    t={t}
                    onDismiss={url => {
                        setDismissedUrls(p => [...p, url]);
                        // If all dismissed, hide
                        const urls = (blk.content?.match(/https?:\/\/[^\s]+/g) || []);
                        if (urls.filter(u => !dismissedUrls.includes(u) && u !== url).length === 0) setShowPreview(false);
                    }}
                />
            )}
        </div>
    );
}
