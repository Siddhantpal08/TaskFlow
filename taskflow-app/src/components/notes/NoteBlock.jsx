import { useState, useRef, useEffect, useCallback } from "react";
import { I, IC } from "../ui/Icon.jsx";
import BlockHandle from "./BlockHandle.jsx";
import ScriptBlock from "./ScriptBlock.jsx";
import LyricsBlock from "./LyricsBlock.jsx";
import { SCRIPT_TYPES, LYRICS_TYPES } from "../../data/notes.js";

// ── Right-click context menu ────────────────────────────────────────────────
const CONVERT_OPTS = [
    { type: "p", label: "Text" },
    { type: "h1", label: "Heading 1" },
    { type: "h2", label: "Heading 2" },
    { type: "h3", label: "Heading 3" },
    { type: "ul", label: "Bullet list" },
    { type: "ol", label: "Numbered list" },
    { type: "todo", label: "To-do" },
    { type: "quote", label: "Quote" },
    { type: "callout", label: "Callout" },
    { type: "code", label: "Code" },
    { type: "divider", label: "Divider" },
];

function ContextMenu({ x, y, t, blkType, onDelete, onDuplicate, onConvert, onClose }) {
    const menuRef = useRef();
    // Adjust position so menu doesn't go off screen
    useEffect(() => {
        if (!menuRef.current) return;
        const r = menuRef.current.getBoundingClientRect();
        if (r.right > window.innerWidth - 8)
            menuRef.current.style.left = (x - r.width - 4) + "px";
        if (r.bottom > window.innerHeight - 8)
            menuRef.current.style.top = (y - r.height) + "px";
    }, [x, y]);

    const row = (label, handler, color, emoji) => (
        <button
            key={label}
            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handler(); onClose(); }}
            style={{
                width: "100%", padding: "7px 14px", border: "none", background: "transparent",
                cursor: "pointer", fontSize: 12.5, color: color || t.t1, fontFamily: t.disp,
                textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                transition: "background .1s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = color ? color + "18" : t.noteHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
            {emoji && <span style={{ fontSize: 13 }}>{emoji}</span>}
            {label}
        </button>
    );

    return (
        <>
            <div onMouseDown={onClose} style={{ position: "fixed", inset: 0, zIndex: 400 }} />
            <div ref={menuRef} className="slideDown" style={{
                position: "fixed", left: x, top: y, zIndex: 401,
                background: t.card, border: `1px solid ${t.border}`,
                borderRadius: 10, boxShadow: t.shadow,
                minWidth: 190, overflow: "hidden",
                pointerEvents: "all",
            }}>
                {row("Duplicate", onDuplicate, null, "📋")}
                {row("Delete", onDelete, t.red, "🗑")}
                <div style={{ height: 1, background: t.border, margin: "3px 0" }} />
                <div style={{ padding: "4px 14px 2px", fontSize: 9.5, color: t.t3, fontFamily: t.mono, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Turn into
                </div>
                {CONVERT_OPTS.filter(o => o.type !== blkType).map(o =>
                    row(o.label, () => onConvert(o.type))
                )}
            </div>
        </>
    );
}

// ── Link preview ────────────────────────────────────────────────────────────
function ytId(url) {
    try {
        const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_\-]{11})/);
        return m ? m[1] : null;
    } catch { return null; }
}
function LinkPreview({ content, t, onDismiss }) {
    const urls = content?.match(/https?:\/\/[^\s]+/g) || [];
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
                    <button onClick={() => onDismiss(p.url)} style={{ position: "absolute", top: 5, right: 7, background: "none", border: "none", color: t.t3, cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
                    {p.type === "youtube" ? (
                        <a href={p.url} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none" }}>
                            <img src={`https://img.youtube.com/vi/${p.vid}/mqdefault.jpg`} alt="YT" style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
                            <div style={{ padding: "7px 10px", fontSize: 11, color: t.accent, fontFamily: t.mono }}>▶ YouTube — {p.url}</div>
                        </a>
                    ) : (
                        <a href={p.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", textDecoration: "none" }}>
                            <img src={`https://www.google.com/s2/favicons?domain=${p.host}&sz=24`} alt="" style={{ width: 16, height: 16, borderRadius: 3 }} onError={e => { e.target.style.display = "none"; }} />
                            <span style={{ fontSize: 11, color: t.accent, fontFamily: t.mono, wordBreak: "break-all" }}>{p.host}</span>
                            <span style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginLeft: "auto", flexShrink: 0 }}>↗ Open</span>
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Main NoteBlock component ────────────────────────────────────────────────
export default function NoteBlock({
    blk, idx, t, dark, onUpdate, onDelete, onDuplicate, onAddAfter,
    onSlash, onSlashClose, onFocusPrev, onFocusNext, onPasteHTML, olIndex, sectionNumber,
    onDragStart, onDragOver, onDrop, isDragging, isDragOver, onConvert, onFocusBlock, isSelected,
    writingMode, docTheme, onSelect
}) {
    const ref = useRef();
    const [hov, setHov] = useState(false);
    const [ctxMenu, setCtxMenu] = useState(null); // { x, y }
    const [dismissedUrls, setDismissedUrls] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [focused, setFocused] = useState(false);
    // drag-from-handle only
    const isDraggingFromHandle = useRef(false);

    // Sync content from external state into DOM — only on block ID change (mount) or
    // when the block is NOT focused (e.g. remote socket update)
    useEffect(() => {
        if (!ref.current) return;
        if (document.activeElement === ref.current) return; // never overwrite while user is typing
        if (blk.type === "link" || blk.type === "code") return;
        const want = blk.content || "";
        if (ref.current.innerHTML !== want) {
            ref.current.innerHTML = want;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blk.id]); // Only sync on ID change (mount/new block), NOT on type changes

    // Focus management: populate on first mount
    useEffect(() => {
        if (ref.current && ref.current.innerHTML !== (blk.content || "")) {
            ref.current.innerHTML = blk.content || "";
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blk.id]);

    const handleFocus = () => {
        setFocused(true);
        onFocusBlock?.(idx);
    };

    const handleBlur = () => {
        setFocused(false);
        const content = ref.current?.innerText || "";
        if (/https?:\/\/[^\s]+/.test(content)) setShowPreview(true);
    };

    const openSlashMenu = useCallback(() => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) onSlash(rect, "");
    }, [onSlash]);

    const handleKey = e => {
        // Ctrl+A — select all within this block
        if ((e.ctrlKey || e.metaKey) && e.key === "a") {
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

        // Markdown shortcuts on Space
        if (e.key === " " && blk.type === "p") {
            const cur = ref.current?.innerText || "";
            if (/^\d+\.?$/.test(cur.trim())) { e.preventDefault(); ref.current.innerText = ""; onUpdate({ type: "ol", content: "" }); return; }
            if (cur.trim() === "-" || cur.trim() === "*") { e.preventDefault(); ref.current.innerText = ""; onUpdate({ type: "ul", content: "" }); return; }
            if (cur.trim() === "[]" || cur.trim() === "[ ]") { e.preventDefault(); ref.current.innerText = ""; onUpdate({ type: "todo", content: "" }); return; }
            if (cur.trim() === ">") { e.preventDefault(); ref.current.innerText = ""; onUpdate({ type: "quote", content: "" }); return; }
        }

        // Tab/Shift+Tab for lists
        if (e.key === "Tab" && (blk.type === "ul" || blk.type === "ol")) {
            e.preventDefault();
            const cur = blk.indent || 0;
            if (e.shiftKey) { cur > 0 ? onUpdate({ indent: cur - 1 }) : onUpdate({ type: "p", indent: 0 }); }
            else { onUpdate({ indent: Math.min(cur + 1, 4) }); }
            return;
        }

        // Tab to switch script blocks
        if (e.key === "Tab" && writingMode === 'script') {
            e.preventDefault();
            const types = Array.from(SCRIPT_TYPES);
            const _idx = types.indexOf(blk.type);
            if (_idx !== -1) {
                const nextType = types[(_idx + (e.shiftKey ? -1 : 1) + types.length) % types.length];
                onUpdate({ type: nextType });
            }
            return;
        }

        // Slash command — works in all modes (menu auto-filters to correct block types)
        if (e.key === "/" && (blk.type === "p" || !blk.type)) {
            e.preventDefault();
            openSlashMenu();
            return;
        }

        // Enter
        if (e.key === "Enter" && blk.type !== "code") {
            const curText = ref.current?.innerText || "";
            if (blk.type === "p") {
                if (curText.trim() === "") { e.preventDefault(); onAddAfter("p"); }
                return; // otherwise let browser wrap naturally
            }
            e.preventDefault();
            if ((blk.type === "ul" || blk.type === "ol" || blk.type === "todo") && curText.trim() === "") {
                const ind = blk.indent || 0;
                if (ind > 0) onUpdate({ indent: ind - 1 });
                else onUpdate({ type: "p", content: "", indent: 0 });
                return;
            }
            if (blk.type === "ul") { onAddAfter("ul"); return; }
            if (blk.type === "ol") { onAddAfter("ol"); return; }
            if (blk.type === "todo") { onAddAfter("todo"); return; }
            onAddAfter("p");
        }

        // Backspace on empty block = delete block
        if (e.key === "Backspace" && (ref.current?.innerText || "").trim() === "") {
            const html = ref.current?.innerHTML || "";
            if (html === "" || html === "<br>") {
                e.preventDefault();
                onDelete();
            }
        }
        if (e.key === "ArrowUp") {
            const sel = window.getSelection();
            if (sel?.anchorOffset === 0) { e.preventDefault(); onFocusPrev(); }
        }
        if (e.key === "ArrowDown") {
            const len = ref.current?.innerText?.length || 0;
            const sel = window.getSelection();
            if (sel?.anchorOffset >= len) { e.preventDefault(); onFocusNext(); }
        }
    };

    const handleInput = e => {
        let val = e.currentTarget.innerHTML || "";
        if (val === "<br>") val = "";
        onUpdate({ content: val });
        onSlashClose();
    };

    const handlePaste = e => {
        const html = e.clipboardData.getData("text/html");
        const text = e.clipboardData.getData("text/plain");
        if (onPasteHTML && (html || text)) {
            if (onPasteHTML(html, text, idx)) e.preventDefault();
        }
    };

    const handleContextMenu = e => {
        e.preventDefault();
        setCtxMenu({ x: e.clientX, y: e.clientY });
    };

    // Drag — ONLY activated from the ⠿ handle (via mousedown on that span)
    const handleDragStart = e => {
        if (!isDraggingFromHandle.current) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(idx);
    };
    const handleDragEnd = () => { isDraggingFromHandle.current = false; };
    const handleDragOver = e => { e.preventDefault(); onDragOver?.(idx); };
    const handleDrop = e => { e.preventDefault(); onDrop?.(idx); };

    // Props for the drag grip handle
    const dragHandleProps = {
        onMouseDown: () => { isDraggingFromHandle.current = true; },
        onMouseUp: () => { isDraggingFromHandle.current = false; },
    };

    const wrapperStyle = {
        position: "relative",
        opacity: isDragging ? 0.4 : 1,
        outline: isDragOver ? `2px dashed ${t.accent}` : "none",
        borderRadius: 6,
        transition: "opacity .15s, outline .1s, background .1s",
        background: isSelected ? (dark ? "rgba(0,114,255,0.2)" : "rgba(0,114,255,0.1)") : "transparent"
    };
    const indentPx = (blk.indent || 0) * 22;

    const hoverProps = {
        onMouseEnter: () => setHov(true),
        onMouseLeave: () => setHov(false),
        onContextMenu: handleContextMenu,
    };
    const dragProps = { draggable: true, onDragStart: handleDragStart, onDragEnd: handleDragEnd, onDragOver: handleDragOver, onDrop: handleDrop };

    const contextMenuEl = ctxMenu && (
        <ContextMenu
            x={ctxMenu.x} y={ctxMenu.y} t={t} blkType={blk.type}
            onDelete={() => { setCtxMenu(null); onDelete(); }}
            onDuplicate={() => { setCtxMenu(null); onDuplicate?.(); }}
            onConvert={type => { setCtxMenu(null); onConvert?.(type); }}
            onClose={() => setCtxMenu(null)}
        />
    );

    // ── Script / Lyrics delegation ──
    if (SCRIPT_TYPES.has(blk.type)) return (
        <div style={wrapperStyle} {...dragProps} {...hoverProps}>
            {contextMenuEl}
            <BlockHandle hov={hov} t={t} dragHandleProps={dragHandleProps} />
            <ScriptBlock blk={blk} idx={idx} t={t} onUpdate={onUpdate} onDelete={onDelete} onAddAfter={onAddAfter} onFocusPrev={onFocusPrev} onFocusNext={onFocusNext} sectionNumber={sectionNumber} onSlash={openSlashMenu} />
        </div>
    );
    if (LYRICS_TYPES.has(blk.type)) return (
        <div style={wrapperStyle} {...dragProps} {...hoverProps}>
            {contextMenuEl}
            <BlockHandle hov={hov} t={t} dragHandleProps={dragHandleProps} />
            <LyricsBlock blk={blk} idx={idx} t={t} onUpdate={onUpdate} onDelete={onDelete} onAddAfter={onAddAfter} onFocusPrev={onFocusPrev} onFocusNext={onFocusNext} sectionNumber={sectionNumber} onSlash={openSlashMenu} />
        </div>
    );

    // ── DIVIDER ──
    if (blk.type === "divider") return (
        <div className="blkr" style={{ ...wrapperStyle, padding: "6px 0" }} {...dragProps} {...hoverProps}>
            {contextMenuEl}
            <BlockHandle hov={hov} t={t} dragHandleProps={dragHandleProps} />
            <hr tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); onAddAfter("p"); } if (e.key === "ArrowUp") { e.preventDefault(); onFocusPrev(); } }}
                style={{ border: "none", borderTop: `1.5px solid ${t.noteBorder}`, margin: "4px 0", cursor: "default", outline: "none" }} />
        </div>
    );

    // ── CODE ──
    if (blk.type === "code") return (
        <div className="blkr" style={{ ...wrapperStyle, margin: "4px 0" }} {...dragProps} {...hoverProps}>
            {contextMenuEl}
            <BlockHandle hov={hov} t={t} dragHandleProps={dragHandleProps} />
            <div style={{ background: t.codeBg, borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}` }}>
                <div style={{ padding: "7px 14px", borderBottom: `1px solid ${t.noteBorder}22`, display: "flex", alignItems: "center", gap: 5 }}>
                    {["#ff5f57", "#ffbd2e", "#28c840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
                    <span style={{ marginLeft: 6, fontSize: 10.5, color: t.t3, fontFamily: t.mono }}>code</span>
                </div>
                <textarea value={blk.content} onChange={e => onUpdate({ content: e.target.value })}
                    onKeyDown={e => e.key === "Tab" && (e.preventDefault(), onUpdate({ content: blk.content + "  " }))}
                    style={{ width: "100%", background: "transparent", border: "none", color: t.codeText, fontFamily: t.mono, fontSize: 12.5, lineHeight: 1.7, padding: "10px 16px", resize: "none", minHeight: 80, outline: "none", display: "block" }}
                    rows={Math.max(3, (blk.content?.match(/\n/g) || []).length + 2)} />
            </div>
        </div>
    );

    // ── CALLOUT ──
    if (blk.type === "callout") return (
        <div className="blkr" style={{ ...wrapperStyle, margin: "4px 0" }} {...dragProps} {...hoverProps}>
            {contextMenuEl}
            <BlockHandle hov={hov} t={t} dragHandleProps={dragHandleProps} />
            <div style={{ display: "flex", gap: 11, padding: "11px 14px", borderRadius: 10, background: t.calloutBg, border: `1px solid ${t.calloutBorder}` }}>
                <span style={{ fontSize: 17, flexShrink: 0, marginTop: 1 }}>💡</span>
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="Add a callout…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    onFocus={handleFocus} onBlur={handleBlur}
                    style={{ flex: 1, fontSize: 13.5, color: t.calloutText, lineHeight: 1.65, fontFamily: `var(--doc-font, ${t.disp})`, wordBreak: "break-word", outline: "none" }} />
            </div>
        </div>
    );

    // ── QUOTE ──
    if (blk.type === "quote") return (
        <div className="blkr" style={{ ...wrapperStyle, margin: "4px 0" }} {...dragProps} {...hoverProps}>
            {contextMenuEl}
            <BlockHandle hov={hov} t={t} dragHandleProps={dragHandleProps} />
            <div style={{ display: "flex" }}>
                <div style={{ width: 3, borderRadius: 3, background: t.quoteBorder, flexShrink: 0 }} />
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="Add a quote…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    onFocus={handleFocus} onBlur={handleBlur}
                    style={{ flex: 1, fontSize: 15, color: t.quoteText, lineHeight: 1.7, fontFamily: `var(--doc-font, 'Lora', serif)`, fontStyle: "italic", padding: "4px 16px", wordBreak: "break-word", outline: "none" }} />
            </div>
        </div>
    );

    // ── TODO ──
    if (blk.type === "todo") return (
        <div className="blkr" style={{ ...wrapperStyle, paddingLeft: indentPx }} {...dragProps} {...hoverProps}>
            {contextMenuEl}
            <BlockHandle hov={hov} t={t} dragHandleProps={dragHandleProps} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "3px 0" }}>
                <button onClick={() => onUpdate({ checked: !blk.checked })}
                    style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 3, border: `1.5px solid ${blk.checked ? t.accent : t.noteBorder}`, background: blk.checked ? t.accent : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                    {!!blk.checked && <I d={IC.chk} sz={9} c={dark ? "#000" : "#fff"} sw={3} />}
                </button>
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="To-do…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    onFocus={handleFocus} onBlur={handleBlur}
                    style={{ flex: 1, fontSize: 14, lineHeight: 1.65, wordBreak: "break-word", color: blk.checked ? t.noteMuted : t.noteText, fontFamily: `var(--doc-font, ${t.disp})`, textDecoration: blk.checked ? "line-through" : "none", transition: "all .2s", outline: "none" }} />
            </div>
        </div>
    );

    // ── BULLET LIST (ul) ──
    if (blk.type === "ul") return (
        <div className="blkr" style={{ ...wrapperStyle, paddingLeft: indentPx }} {...dragProps} {...hoverProps}>
            {contextMenuEl}
            <BlockHandle hov={hov} t={t} dragHandleProps={dragHandleProps} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "2px 0" }}>
                <span style={{ color: t.accent, fontSize: (blk.indent || 0) > 0 ? 12 : 18, lineHeight: 1.6, flexShrink: 0, userSelect: "none", marginTop: 1 }}>
                    {(blk.indent || 0) === 0 ? "•" : (blk.indent || 0) === 1 ? "◦" : "▸"}
                </span>
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="List item…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    onFocus={() => setFocused(true)} onBlur={handleBlur}
                    style={{ flex: 1, fontSize: 14.5, lineHeight: 1.8, wordBreak: "break-word", color: t.noteSubText, fontFamily: `var(--doc-font, ${t.disp})`, outline: "none" }} />
            </div>
        </div>
    );

    // ── NUMBERED LIST (ol) ──
    if (blk.type === "ol") return (
        <div className="blkr" style={{ ...wrapperStyle, paddingLeft: indentPx }} {...dragProps} {...hoverProps}>
            {contextMenuEl}
            <BlockHandle hov={hov} t={t} dragHandleProps={dragHandleProps} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "2px 0" }}>
                <span style={{ color: t.accent, fontSize: 13.5, fontWeight: 700, lineHeight: 1.9, flexShrink: 0, userSelect: "none", fontFamily: t.mono, minWidth: 20, textAlign: "right" }}>
                    {(olIndex || 0) + 1}.
                </span>
                <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                    data-ph="List item…" onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                    onFocus={() => setFocused(true)} onBlur={handleBlur}
                    style={{ flex: 1, fontSize: 14.5, lineHeight: 1.8, wordBreak: "break-word", color: t.noteSubText, fontFamily: `var(--doc-font, ${t.disp})`, outline: "none" }} />
            </div>
        </div>
    );

    // ── LINK ──
    if (blk.type === "link") return (
        <div className="blkr" style={{ ...wrapperStyle, margin: "4px 0" }} {...dragProps} {...hoverProps}>
            {contextMenuEl}
            <BlockHandle hov={hov} t={t} dragHandleProps={dragHandleProps} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 14px", borderRadius: 8, background: t.card, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <I d={IC.lnk} sz={16} c={t.accent} />
                    <input value={blk.label || ""} onChange={e => onUpdate({ label: e.target.value })} placeholder="Link text…"
                        style={{ flex: 1, background: "transparent", border: "none", color: t.t1, fontSize: 13, fontWeight: 600, outline: "none" }} />
                    {blk.url && <button onClick={() => window.open(blk.url, "_blank")} style={{ background: t.accentDim, border: "none", color: t.accent, padding: "4px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: t.disp, fontWeight: 700 }}>Open</button>}
                </div>
                <input value={blk.url || ""} onChange={e => onUpdate({ url: e.target.value })} placeholder="https://..."
                    style={{ background: t.inset, border: `1px solid ${t.border}`, color: t.t2, fontSize: 11, padding: "6px 10px", borderRadius: 6, outline: "none", fontFamily: t.mono }} />
            </div>
        </div>
    );

    // ── TEXT BLOCKS (h1, h2, h3, p) ──
    const textStyles = {
        h1: { fontSize: 28, fontWeight: 700, lineHeight: 1.25, fontFamily: `var(--doc-font, 'Lora', serif)`, color: t.noteText, paddingTop: 18, paddingBottom: 3 },
        h2: { fontSize: 20, fontWeight: 700, lineHeight: 1.3, fontFamily: `var(--doc-font, ${t.disp})`, color: t.noteText, paddingTop: 12, paddingBottom: 2 },
        h3: { fontSize: 16, fontWeight: 600, lineHeight: 1.4, fontFamily: `var(--doc-font, ${t.disp})`, color: t.noteText, paddingTop: 8, paddingBottom: 1 },
        p: { fontSize: 14.5, fontWeight: 400, lineHeight: 1.8, fontFamily: `var(--doc-font, ${t.disp})`, color: t.noteSubText, paddingTop: 1, paddingBottom: 1 },
    };
    const st = textStyles[blk.type] || textStyles.p;
    const placeholder = blk.type === "h1" ? "Heading 1" : blk.type === "h2" ? "Heading 2" : blk.type === "h3" ? "Heading 3" : "";

    return (
        <div className="blkr" style={{ ...wrapperStyle }} {...dragProps} {...hoverProps}>
            {contextMenuEl}
            <BlockHandle hov={hov} t={t} dragHandleProps={dragHandleProps} />
            <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
                data-ph={blk.type === "p" && !focused ? "" : placeholder}
                onInput={handleInput} onKeyDown={handleKey} onPaste={handlePaste}
                onFocus={handleFocus} onBlur={handleBlur}
                style={{ ...st, color: writingMode ? "var(--doc-color, inherit)" : st.color, wordBreak: "break-word", cursor: "text", outline: "none", minHeight: st.fontSize + 10 }} />
            {showPreview && !dismissedUrls.includes("all") && (
                <LinkPreview content={blk.content} t={t}
                    onDismiss={url => {
                        setDismissedUrls(p => [...p, url]);
                        const urls = blk.content?.match(/https?:\/\/[^\s]+/g) || [];
                        if (urls.filter(u => !dismissedUrls.includes(u) && u !== url).length === 0) setShowPreview(false);
                    }} />
            )}
        </div>
    );
}
