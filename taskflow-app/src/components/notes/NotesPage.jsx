import { useState, useRef, useEffect } from "react";
import { I, IC } from "../ui/Icon.jsx";
import { EMOJIS, mkBlock } from "../../data/notes.js";
import NoteBlock from "./NoteBlock.jsx";
import SlashMenu from "./SlashMenu.jsx";
import { notesApi } from "../../api/notes.js";
import { io } from "socket.io-client";

export default function NotesPage({ t, dark, pages, notePageId, navigateNote, updateNotePage, addNotePage, deleteNotePage, searchQuery = "" }) {
    const pg = pages[notePageId];
    if (!pg) return null;

    const [blocks, setBlocks] = useState([]);
    const [slash, setSlash] = useState(null);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const titleRef = useRef();
    const socketRef = useRef(null);
    const debounceTimers = useRef({});
    const latestBlocksRef = useRef([]);

    // Keep the ref strictly synced with state so we can flush on unmount
    useEffect(() => {
        latestBlocksRef.current = blocks;
    }, [blocks]);

    useEffect(() => {
        setSlash(null);
        let active = true;

        notesApi.getPage(notePageId).then(res => {
            const b = res.data.blocks;
            if (active) setBlocks(b && Array.isArray(b) && b.length > 0 ? b : [mkBlock("p", "")]);
        }).catch(e => {
            if (active) setBlocks([mkBlock("p", "")]);
        });

        // Socket setup
        const s = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000');
        socketRef.current = s;
        s.emit('note:join', notePageId);

        s.on('note:block:updated', ({ blockId, changes }) => {
            setBlocks(prev => {
                const idx = prev.findIndex(b => b.id === blockId);
                if (idx === -1) return prev;
                const next = [...prev];
                next[idx] = { ...next[idx], ...changes };
                return next;
            });
        });

        s.on('note:block:added', ({ block, afterIdx }) => {
            setBlocks(prev => {
                const next = [...prev];
                next.splice(afterIdx + 1, 0, block);
                return next;
            });
        });

        s.on('note:block:deleted', ({ idx }) => {
            setBlocks(prev => prev.filter((_, i) => i !== idx));
        });

        const flushPendingSaves = () => {
            const currentBlocks = latestBlocksRef.current;
            const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
            const authHeader = {
                'Authorization': `Bearer ${localStorage.getItem('tf_token')}`,
                'Content-Type': 'application/json'
            };

            Object.keys(debounceTimers.current).forEach(blkId => {
                const timer = debounceTimers.current[blkId];
                if (timer) {
                    clearTimeout(timer);
                    delete debounceTimers.current[blkId];

                    const blkToFlush = currentBlocks.find(b => b.id === blkId);
                    if (blkToFlush) {
                        if (blkId.toString().startsWith("loc-")) {
                            const idx = currentBlocks.findIndex(b => b.id === blkId);
                            // Standard fetch with keepalive instead of axios/custom api
                            fetch(`${BASE}/notes/pages/${notePageId}/blocks`, {
                                method: 'POST',
                                headers: authHeader,
                                body: JSON.stringify({ type: blkToFlush.type, content: blkToFlush.content, position: idx }),
                                keepalive: true
                            }).catch(() => { });
                        } else {
                            fetch(`${BASE}/notes/blocks/${blkId}`, {
                                method: 'PUT',
                                headers: authHeader,
                                body: JSON.stringify({ content: blkToFlush.content, checked: blkToFlush.checked, type: blkToFlush.type }),
                                keepalive: true
                            }).catch(() => { });
                        }
                    }
                }
            });
        };

        window.addEventListener('beforeunload', flushPendingSaves);

        return () => {
            active = false;
            flushPendingSaves();
            window.removeEventListener('beforeunload', flushPendingSaves);
            s.emit('note:leave', notePageId);
            s.disconnect();
        };
    }, [notePageId]);

    const save = nb => { setBlocks(nb); };

    const addBlk = async (afterIdx, type = "p", content = "") => {
        const b = mkBlock(type, content);
        const nb = [...blocks]; nb.splice(afterIdx + 1, 0, b); save(nb);
        setTimeout(() => document.getElementById("blk-" + (afterIdx + 1))?.focus(), 30);
        socketRef.current?.emit('note:block:add', { pageId: notePageId, block: b, afterIdx });
        try {
            const res = await notesApi.createBlock(notePageId, { type, content, position: afterIdx + 1 });
            setBlocks(prev => prev.map(p => p.id === b.id ? { ...p, id: res.data.id } : p));
        } catch (e) { }
    };

    const updBlk = (idx, ch) => {
        const nb = [...blocks];
        const prevBlk = nb[idx];
        const newBlk = { ...prevBlk, ...ch };
        nb[idx] = newBlk;
        save(nb);

        socketRef.current?.emit('note:block:update', { pageId: notePageId, blockId: newBlk.id, changes: ch });

        // Debounce update to backend securely
        if (debounceTimers.current[newBlk.id]) {
            clearTimeout(debounceTimers.current[newBlk.id]);
        }

        debounceTimers.current[newBlk.id] = setTimeout(() => {
            delete debounceTimers.current[newBlk.id];

            // Re-fetch the absolutely latest version from the ref to ensure no data is lost
            const latestBlk = latestBlocksRef.current.find(b => b.id === newBlk.id) || newBlk;
            const currentIdx = latestBlocksRef.current.findIndex(b => b.id === newBlk.id);
            if (currentIdx === -1) return; // Block deleted before save

            if (latestBlk.id.toString().startsWith("loc-")) {
                notesApi.createBlock(notePageId, { type: latestBlk.type, content: latestBlk.content, position: currentIdx }).then(res => {
                    setBlocks(prev => prev.map(p => p.id === latestBlk.id ? { ...p, id: res.data.id } : p));
                }).catch(() => { });
            } else {
                notesApi.updateBlock(latestBlk.id, { content: latestBlk.content, checked: !!latestBlk.checked, type: latestBlk.type }).catch(() => { });
            }
        }, 800);
    };
    const focusAtEnd = (id) => {
        setTimeout(() => {
            const el = document.getElementById(id);
            if (!el) return;
            el.focus();
            if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
                const range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }, 30);
    };

    const focusAtStart = (id) => {
        setTimeout(() => {
            const el = document.getElementById(id);
            if (!el) return;
            el.focus();
            if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
                const range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(true);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }, 30);
    };

    const delBlk = idx => {
        if (blocks.length <= 1) { updBlk(0, { content: "" }); return; }
        const blk = blocks[idx];
        const nb = blocks.filter((_, i) => i !== idx); save(nb);
        focusAtEnd("blk-" + Math.max(0, idx - 1));

        socketRef.current?.emit('note:block:delete', { pageId: notePageId, idx });

        if (!blk.id.toString().startsWith("loc-")) {
            notesApi.deleteBlock(blk.id).catch(() => { });
        }

        if (debounceTimers.current[blk.id]) {
            clearTimeout(debounceTimers.current[blk.id]);
            delete debounceTimers.current[blk.id];
        }
    };

    const handlePasteHTML = (html, text, targetIdx) => {
        if (!html && !text) return false;
        let newBlocks = [];

        if (html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const walk = (node) => {
                const tag = node.tagName?.toLowerCase();
                const isBlock = ['h1', 'h2', 'h3', 'p', 'blockquote', 'pre', 'li', 'div'].includes(tag);
                if (isBlock) {
                    let type = 'p';
                    if (tag === 'h1') type = 'h1';
                    else if (tag === 'h2') type = 'h2';
                    else if (tag === 'h3') type = 'h3';
                    else if (tag === 'blockquote') type = 'quote';
                    else if (tag === 'pre') type = 'code';
                    else if (tag === 'li') {
                        // Notion todo lists check
                        if (node.querySelector('.pseudoCheckbox') || node.closest('.to-do-list')) type = 'todo';
                    }
                    const content = node.innerText.trim();
                    if (content) newBlocks.push(mkBlock(type, content));
                } else if (node.nodeType === 1) {
                    Array.from(node.children).forEach(walk);
                }
            };
            Array.from(doc.body.children).forEach(walk);
        } else if (text) {
            const lines = text.split('\n').map(l => l.trim()).filter(l => l);
            newBlocks = lines.map(l => mkBlock('p', l));
        }

        // Only intercept if pasting multiple blocks, otherwise default paste inline
        if (newBlocks.length <= 1) return false;

        const nb = [...blocks];
        nb.splice(targetIdx + 1, 0, ...newBlocks);
        save(nb);
        newBlocks.forEach((newBlk, offsetIndex) => {
            socketRef.current?.emit('note:block:add', { pageId: notePageId, block: newBlk, afterIdx: targetIdx + offsetIndex });
            // Let the first timer trigger creation
            updBlk(targetIdx + 1 + offsetIndex, { content: newBlk.content });
        });
        setTimeout(() => document.getElementById("blk-" + (targetIdx + newBlocks.length))?.focus(), 30);
        return true;
    };

    const insertSlashType = type => {
        if (slash === null) return;
        const nb = [...blocks];
        const currentContent = nb[slash.idx].content;

        if (currentContent.trim() === "") {
            nb[slash.idx] = { ...nb[slash.idx], type, content: "" };
            save(nb);
            socketRef.current?.emit('note:block:update', { pageId: notePageId, blockId: nb[slash.idx].id, changes: { type, content: "" } });
            updBlk(slash.idx, { type, content: "" });
            setSlash(null);
            setTimeout(() => document.getElementById("blk-" + slash.idx)?.focus(), 30);
        } else {
            const b = mkBlock(type, ""); nb.splice(slash.idx + 1, 0, b); save(nb);
            socketRef.current?.emit('note:block:add', { pageId: notePageId, block: b, afterIdx: slash.idx });
            setSlash(null);
            setTimeout(() => document.getElementById("blk-" + (slash.idx + 1))?.focus(), 30);
        }
    };

    // Breadcrumb
    const crumbs = [];
    let cur = notePageId;
    while (cur && pages[cur]) { crumbs.unshift(pages[cur]); cur = pages[cur].parentId; }
    const subPages = (pg.childIds || [])
        .map(id => pages[id])
        .filter(Boolean)
        .filter(sp => !searchQuery || sp.title?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Breadcrumb bar */}
                <div style={{ display: "flex", alignItems: "center", padding: "9px 28px", borderBottom: `1px solid ${t.border}`, background: t.nav, flexShrink: 0, gap: 0 }}>
                    {crumbs.map((p, i) => (
                        <div key={p.id} style={{ display: "flex", alignItems: "center" }}>
                            {i > 0 && <span style={{ color: t.t3, fontSize: 11, margin: "0 5px" }}>/</span>}
                            <button type="button" onClick={() => navigateNote(p.id)}
                                style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 7px", borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", color: i < crumbs.length - 1 ? t.t2 : t.t1, fontFamily: t.disp, fontSize: 12, fontWeight: i === crumbs.length - 1 ? 600 : 400, transition: "background .12s" }}
                                onMouseEnter={e => { if (i < crumbs.length - 1) e.currentTarget.style.background = t.noteHover; }}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <span style={{ fontSize: 11 }}>{p.emoji || "📄"}</span>{p.title || "Untitled"}
                            </button>
                        </div>
                    ))}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                        <button type="button" onClick={() => {
                            const url = `${window.location.origin}?note=${notePageId}`;
                            navigator.clipboard.writeText(url);
                            alert("Link copied to clipboard! Share it with your friends to collaborate.");
                        }}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", color: t.t2, fontSize: 11.5, fontFamily: t.disp, transition: "all .15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = t.noteHover}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <I d={IC.lnk} sz={12} c="currentColor" />Share Note
                        </button>
                        <button type="button" onClick={() => addNotePage(notePageId)}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", color: t.t2, fontSize: 11.5, fontFamily: t.disp, transition: "all .15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = t.noteHover}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <I d={IC.plus} sz={12} c="currentColor" />Add sub-page
                        </button>
                        <span style={{ fontSize: 10, color: t.t3, fontFamily: t.mono }}>Updated {pg.updatedAt}</span>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: "auto" }} onClick={() => setEmojiOpen(false)}>
                    {/* Cover strip */}
                    <div style={{ height: 5, background: `linear-gradient(to right,${t.accent},${t.purple})`, flexShrink: 0 }} />

                    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 60px 80px", position: "relative" }}>
                        {/* Emoji picker */}
                        <div style={{ position: "relative", display: "inline-block", marginBottom: 6 }}>
                            <button type="button" onClick={e => { e.stopPropagation(); setEmojiOpen(p => !p); }}
                                style={{ fontSize: 52, background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: 4, borderRadius: 8, transition: "background .15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = t.noteHover}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                {pg.emoji || "📄"}
                            </button>
                            {emojiOpen && (
                                <div className="slideDown" style={{ position: "absolute", top: "100%", left: 0, zIndex: 60, background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 10, boxShadow: t.shadow, display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 3, width: 230, maxHeight: 280, overflowY: "auto" }}
                                    onClick={e => e.stopPropagation()}>
                                    {EMOJIS.map(em => (
                                        <button type="button" key={em} onClick={() => { updateNotePage(notePageId, { emoji: em }); setEmojiOpen(false); }}
                                            style={{ fontSize: 19, background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, transition: "background .1s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = t.noteHover}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                            {em}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <div contentEditable suppressContentEditableWarning ref={titleRef}
                            data-ph="Untitled"
                            onBlur={e => updateNotePage(notePageId, { title: e.target.innerText || "Untitled" })}
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); document.getElementById("blk-0")?.focus(); } }}
                            style={{ fontSize: 38, fontWeight: 700, color: t.noteText, lineHeight: 1.2, marginBottom: 20, fontFamily: "'Lora',serif", wordBreak: "break-word", minHeight: 46, cursor: "text" }}>
                            {pg.title}
                        </div>

                        {/* Meta */}
                        <div style={{ display: "flex", gap: 20, marginBottom: 28, paddingBottom: 18, borderBottom: `1px solid ${t.noteBorder}` }}>
                            {[["Created", pg.updatedAt], ["Blocks", blocks.length + " blocks"], ["Sub-pages", (pg.childIds?.length || 0) + " pages"]].map(([l, v]) => (
                                <div key={l}>
                                    <div style={{ fontSize: 9.5, color: t.noteMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2, fontFamily: t.mono }}>{l}</div>
                                    <div style={{ fontSize: 12, color: t.noteSubText }}>{v}</div>
                                </div>
                            ))}
                        </div>

                        {/* Blocks */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {blocks.map((blk, idx) => (
                                <NoteBlock key={blk.id} blk={blk} idx={idx} t={t} dark={dark}
                                    onUpdate={ch => updBlk(idx, ch)}
                                    onDelete={() => delBlk(idx)}
                                    onAddAfter={type => addBlk(idx, type)}
                                    onSlash={(rect, filter) => setSlash({ idx, x: rect.left, y: rect.bottom + 4, filter })}
                                    onSlashClose={() => setSlash(null)}
                                    onFocusPrev={() => focusAtEnd("blk-" + Math.max(0, idx - 1))}
                                    onFocusNext={() => focusAtStart("blk-" + Math.min(blocks.length - 1, idx + 1))}
                                    onPasteHTML={(html, text, i) => handlePasteHTML(html, text, i)} />
                            ))}
                        </div>

                        {/* Sub-pages */}
                        {subPages.length > 0 && (
                            <div style={{ marginTop: 36 }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: t.noteMuted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10, fontFamily: t.mono }}>Sub-pages</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                                    {subPages.map(sp => (
                                        <div key={sp.id} onClick={() => navigateNote(sp.id)}
                                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, border: `1px solid ${t.noteBorder}`, cursor: "pointer", background: t.noteCard, transition: "all .15s" }}
                                            onMouseEnter={e => { e.currentTarget.style.background = t.noteHover; e.currentTarget.style.borderColor = t.accent + "44"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = t.noteCard; e.currentTarget.style.borderColor = t.noteBorder; }}>
                                            <span style={{ fontSize: 22 }}>{sp.emoji || "📄"}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: t.noteText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sp.title || "Untitled"}</div>
                                                <div style={{ fontSize: 10.5, color: t.noteMuted, marginTop: 1, fontFamily: t.mono }}>
                                                    {sp.childIds?.length > 0 ? `${sp.childIds.length} sub-pages · ` : ""}Updated {sp.updatedAt}
                                                </div>
                                            </div>
                                            <I d={IC.chev} sz={13} c={t.t3} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add sub-page CTA */}
                        <button type="button" onClick={() => addNotePage(notePageId)}
                            style={{
                                marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                padding: "18px 24px", borderRadius: 12, border: "none", cursor: "pointer",
                                background: `linear-gradient(135deg, ${t.accent}22, ${t.purple || '#B083FF'}22)`,
                                color: t.accent, fontSize: 15, fontWeight: 700, fontFamily: t.disp, width: "100%",
                                transition: "all .2s", boxShadow: t.shadow
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = t.accentGlow; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = t.shadow; }}>
                            <I d={IC.plus} sz={18} c="currentColor" sw={2.5} />
                            Create New Note Inside "{pg.title || "this page"}"
                        </button>
                    </div>
                </div>
            </div>

            {/* Slash menu */}
            {slash && <SlashMenu t={t} filter={slash.filter} pos={{ x: slash.x, y: slash.y }} onSelect={insertSlashType} onClose={() => setSlash(null)} />}
        </div>
    );
}
