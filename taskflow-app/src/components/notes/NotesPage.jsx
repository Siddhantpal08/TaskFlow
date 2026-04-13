import { useState, useRef, useEffect, useCallback } from "react";
import { I, IC } from "../ui/Icon.jsx";
import { EMOJIS, mkBlock, BLOCK_TYPES, SCRIPT_BLOCK_TYPES, LYRICS_BLOCK_TYPES, SCRIPT_TYPES, LYRICS_TYPES } from "../../data/notes.js";
import NoteBlock from "./NoteBlock.jsx";
import SlashMenu from "./SlashMenu.jsx";
import { notesApi } from "../../api/notes.js";
import { io } from "socket.io-client";

// ── Lock Gate ──────────────────────────────────────────────────────────────────
function LockGate({ notePageId, t, onUnlock }) {
    const storageKey = `tf_lock_${notePageId}`;
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [showPin, setShowPin] = useState(false);

    const savedPin = localStorage.getItem(storageKey);

    const tryUnlock = () => {
        if (pin === savedPin) { onUnlock(); }
        else { setError("Incorrect PIN"); setPin(""); }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
            <div style={{ fontSize: 48 }}>🔒</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.t1, fontFamily: t.disp }}>This note is locked</div>
            <div style={{ fontSize: 13, color: t.t3, fontFamily: t.disp }}>Enter your PIN to continue</div>
            <div style={{ position: "relative" }}>
                <input type={showPin ? "text" : "password"} maxLength={12} placeholder="PIN"
                    value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={e => e.key === "Enter" && tryUnlock()}
                    style={{ padding: "10px 40px 10px 16px", borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.inset, color: t.t1, fontSize: 24, textAlign: "center", outline: "none", letterSpacing: showPin ? 2 : 10, fontFamily: t.mono, width: 200 }} />
                <button onClick={() => setShowPin(p => !p)}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: t.t3, lineHeight: 1 }}>
                    {showPin ? "🙈" : "👁"}
                </button>
            </div>
            {error && <div style={{ color: t.red, fontSize: 12 }}>{error}</div>}
            <button onClick={tryUnlock} style={{ padding: "9px 28px", borderRadius: 9, background: t.accent, border: "none", color: "#000", fontWeight: 700, fontFamily: t.disp, cursor: "pointer", fontSize: 14 }}>Unlock</button>
        </div>
    );
}

// ── Set Lock Modal ─────────────────────────────────────────────────────────────
function SetLockModal({ notePageId, t, onClose }) {
    const storageKey = `tf_lock_${notePageId}`;
    const existing = localStorage.getItem(storageKey);
    const [mode, setMode] = useState(existing ? "confirm" : "set");
    const [current, setCurrent] = useState("");
    const [newPin, setNewPin] = useState("");
    const [error, setError] = useState("");
    const [showCur, setShowCur] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const handleSet = () => {
        if (mode === "confirm") {
            if (current !== existing) { setError("Wrong current PIN"); return; }
            setMode("set"); setError(""); setCurrent(""); return;
        }
        if (newPin.length < 4) { setError("PIN must be at least 4 digits"); return; }
        localStorage.setItem(storageKey, newPin);
        onClose();
    };
    const handleRemove = () => {
        if (mode === "confirm" && current !== existing) { setError("Wrong current PIN"); return; }
        localStorage.removeItem(storageKey);
        onClose();
    };

    const PinInput = ({ value, onChange, show, setShow, placeholder }) => (
        <div style={{ position: "relative" }}>
            <input type={show ? "text" : "password"} maxLength={12} placeholder={placeholder}
                value={value} onChange={onChange}
                onKeyDown={e => e.key === "Enter" && handleSet()}
                style={{ padding: "8px 40px 8px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.inset, color: t.t1, fontSize: 16, textAlign: "center", outline: "none", letterSpacing: show ? 2 : 6, fontFamily: t.mono, width: "100%" }} />
            <button onClick={() => setShow(p => !p)}
                style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: t.t3 }}>
                {show ? "🙈" : "👁"}
            </button>
        </div>
    );

    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "28px 32px", minWidth: 300, display: "flex", flexDirection: "column", gap: 12, boxShadow: t.shadow }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.t1, fontFamily: t.disp }}>
                    {existing ? (mode === "confirm" ? "🔐 Verify Current PIN" : "🔐 Set New PIN") : "🔐 Lock this Note"}
                </div>
                {mode === "confirm" && <PinInput value={current} onChange={e => setCurrent(e.target.value.replace(/\D/g, ""))} show={showCur} setShow={setShowCur} placeholder="Current PIN" />}
                {mode === "set" && <PinInput value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ""))} show={showNew} setShow={setShowNew} placeholder="New PIN (min 4 digits)" />}
                {error && <div style={{ color: t.red, fontSize: 12 }}>{error}</div>}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={handleSet} style={{ flex: 1, padding: "8px", borderRadius: 8, background: t.accent, border: "none", color: "#000", fontWeight: 700, fontFamily: t.disp, cursor: "pointer", fontSize: 13 }}>
                        {mode === "confirm" ? "Verify" : existing ? "Update PIN" : "Set PIN"}
                    </button>
                    {existing && (
                        <button onClick={handleRemove} style={{ flex: 1, padding: "8px", borderRadius: 8, background: "transparent", border: `1px solid ${t.red}`, color: t.red, fontFamily: t.disp, cursor: "pointer", fontSize: 13 }}>
                            Remove Lock
                        </button>
                    )}
                    <button onClick={onClose} style={{ flex: 1, padding: "8px", borderRadius: 8, background: t.card, border: `1px solid ${t.border}`, color: t.t2, fontFamily: t.disp, cursor: "pointer", fontSize: 13 }}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function NotesPage({ t, dark, pages, notePageId, navigateNote, updateNotePage, addNotePage, deleteNotePage }) {
    const pg = pages[notePageId];
    if (!pg) return null;

    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slash, setSlash] = useState(null);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [writingMode, setWritingMode] = useState(null); // null | 'script' | 'lyrics'
    const [zoom, setZoom] = useState(100);
    const [isListening, setIsListening] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const titleRef = useRef();
    const socketRef = useRef(null);
    const debounceTimers = useRef({});
    const latestBlocksRef = useRef([]);
    const speechRef = useRef(null);
    const activeBlkIdxRef = useRef(0);
    // drag-and-drop
    const dragFromIdx = useRef(null);
    const [dragOver, setDragOver] = useState(null);

    useEffect(() => { latestBlocksRef.current = blocks; }, [blocks]);

    // Lock check
    const storageKey = `tf_lock_${notePageId}`;
    const isLocked = !!localStorage.getItem(storageKey) && !unlocked;

    useEffect(() => {
        setSlash(null);
        setLoading(true);
        setUnlocked(false);
        let active = true;

        notesApi.getPage(notePageId).then(res => {
            const b = res.data.blocks;
            if (active) setBlocks(b && Array.isArray(b) && b.length > 0 ? b : [mkBlock("p", "")]);
        }).catch(() => {
            if (active) setBlocks([mkBlock("p", "")]);
        }).finally(() => { if (active) setLoading(false); });

        const s = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000', { transports: ['websocket'] });
        socketRef.current = s;
        s.emit('note:join', notePageId);

        s.on('note:block:updated', ({ blockId, changes }) => {
            setBlocks(prev => { const idx = prev.findIndex(b => b.id === blockId); if (idx === -1) return prev; const next = [...prev]; next[idx] = { ...next[idx], ...changes }; return next; });
        });
        s.on('note:block:added', ({ block, afterIdx }) => {
            setBlocks(prev => { const next = [...prev]; next.splice(afterIdx + 1, 0, block); return next; });
        });
        s.on('note:block:deleted', ({ idx }) => {
            setBlocks(prev => prev.filter((_, i) => i !== idx));
        });

        const flushPendingSaves = () => {
            const currentBlocks = latestBlocksRef.current;
            const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
            const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('tf_token')}`, 'Content-Type': 'application/json' };
            Object.keys(debounceTimers.current).forEach(blkId => {
                const timer = debounceTimers.current[blkId];
                if (timer) {
                    clearTimeout(timer);
                    delete debounceTimers.current[blkId];
                    const blkToFlush = currentBlocks.find(b => b.id === blkId);
                    if (blkToFlush) {
                        if (blkId.toString().startsWith("loc-")) {
                            const idx = currentBlocks.findIndex(b => b.id === blkId);
                            fetch(`${BASE}/notes/pages/${notePageId}/blocks`, { method: 'POST', headers: authHeader, body: JSON.stringify({ type: blkToFlush.type, content: blkToFlush.content, position: idx }), keepalive: true }).catch(() => { });
                        } else {
                            fetch(`${BASE}/notes/blocks/${blkId}`, { method: 'PUT', headers: authHeader, body: JSON.stringify({ content: blkToFlush.content, checked: blkToFlush.checked, type: blkToFlush.type }), keepalive: true }).catch(() => { });
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

    const save = nb => setBlocks(nb);

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
        const newBlk = { ...nb[idx], ...ch };
        nb[idx] = newBlk;
        save(nb);
        socketRef.current?.emit('note:block:update', { pageId: notePageId, blockId: newBlk.id, changes: ch });
        if (debounceTimers.current[newBlk.id]) clearTimeout(debounceTimers.current[newBlk.id]);
        debounceTimers.current[newBlk.id] = setTimeout(() => {
            delete debounceTimers.current[newBlk.id];
            const latestBlk = latestBlocksRef.current.find(b => b.id === newBlk.id) || newBlk;
            const currentIdx = latestBlocksRef.current.findIndex(b => b.id === newBlk.id);
            if (currentIdx === -1) return;
            if (latestBlk.id.toString().startsWith("loc-")) {
                notesApi.createBlock(notePageId, { type: latestBlk.type, content: latestBlk.content, position: currentIdx }).then(res => {
                    setBlocks(prev => prev.map(p => p.id === latestBlk.id ? { ...p, id: res.data.id } : p));
                }).catch(() => { });
            } else {
                notesApi.updateBlock(latestBlk.id, { content: latestBlk.content, checked: !!latestBlk.checked, type: latestBlk.type }).catch(() => { });
            }
        }, 800);
    };

    // Convert a block to a different type (replace type in place)
    const convertBlk = (idx, newType) => {
        updBlk(idx, { type: newType });
    };

    const focusAtEnd = (id) => {
        setTimeout(() => {
            const el = document.getElementById(id);
            if (!el) return;
            el.focus();
            if (typeof window.getSelection !== "undefined") {
                const range = document.createRange(); range.selectNodeContents(el); range.collapse(false);
                const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
            }
        }, 30);
    };

    const focusAtStart = (id) => {
        setTimeout(() => {
            const el = document.getElementById(id);
            if (!el) return;
            el.focus();
            if (typeof window.getSelection !== "undefined") {
                const range = document.createRange(); range.selectNodeContents(el); range.collapse(true);
                const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
            }
        }, 30);
    };

    const delBlk = idx => {
        if (blocks.length <= 1) { updBlk(0, { content: "" }); return; }
        const blk = blocks[idx];
        const nb = blocks.filter((_, i) => i !== idx); save(nb);
        focusAtEnd("blk-" + Math.max(0, idx - 1));
        socketRef.current?.emit('note:block:delete', { pageId: notePageId, idx });
        if (!blk.id.toString().startsWith("loc-")) notesApi.deleteBlock(blk.id).catch(() => { });
        if (debounceTimers.current[blk.id]) { clearTimeout(debounceTimers.current[blk.id]); delete debounceTimers.current[blk.id]; }
    };

    // ── Drag-and-drop ─────────────────────────────────────────────────────────
    const handleDragStart = (idx) => { dragFromIdx.current = idx; };
    const handleDragOver = (idx) => { setDragOver(idx); };
    const handleDrop = useCallback((toIdx) => {
        const from = dragFromIdx.current;
        if (from === null || from === toIdx) { dragFromIdx.current = null; setDragOver(null); return; }
        const nb = [...latestBlocksRef.current];
        const [moved] = nb.splice(from, 1);
        nb.splice(toIdx, 0, moved);
        setBlocks(nb);
        dragFromIdx.current = null;
        setDragOver(null);
        // Persist reorder — update each moved block's position
        nb.forEach((blk, i) => {
            if (!blk.id.toString().startsWith("loc-")) {
                notesApi.updateBlock(blk.id, { content: blk.content, type: blk.type, checked: !!blk.checked, position: i }).catch(() => { });
            }
        });
    }, []);

    const handlePasteHTML = (html, text, targetIdx) => {
        if (!html && !text) return false;
        let newBlocks = [];

        const parseText = (raw) => {
            const lines = raw.split('\n');
            const blks = [];
            let inCode = false; let codeLines = [];
            for (const raw of lines) {
                const l = raw.trimEnd();
                if (l.startsWith('```')) {
                    if (inCode) { blks.push(mkBlock('code', codeLines.join('\n'))); codeLines = []; inCode = false; }
                    else inCode = true;
                    continue;
                }
                if (inCode) { codeLines.push(l); continue; }
                if (!l.trim()) { blks.push(mkBlock('p', '')); continue; }
                if (/^#{1} (.+)/.test(l)) { blks.push(mkBlock('h1', l.replace(/^# /, ''))); continue; }
                if (/^#{2} (.+)/.test(l)) { blks.push(mkBlock('h2', l.replace(/^## /, ''))); continue; }
                if (/^#{3} (.+)/.test(l)) { blks.push(mkBlock('h3', l.replace(/^### /, ''))); continue; }
                if (/^---+$/.test(l.trim())) { blks.push(mkBlock('divider', '')); continue; }
                if (/^> (.+)/.test(l)) { blks.push(mkBlock('quote', l.replace(/^> /, ''))); continue; }
                if (/^(\d+)\. (.+)/.test(l)) { blks.push(mkBlock('ol', l.replace(/^\d+\. /, ''))); continue; }
                if (/^[-*] \[x\] (.+)/i.test(l)) { blks.push(mkBlock('todo', l.replace(/^[-*] \[x\] /i, ''), { checked: true })); continue; }
                if (/^[-*] \[ \] (.+)/i.test(l)) { blks.push(mkBlock('todo', l.replace(/^[-*] \[ \] /i, ''))); continue; }
                if (/^[-*] (.+)/.test(l)) { blks.push(mkBlock('ul', l.replace(/^[-*] /, ''))); continue; }
                blks.push(mkBlock('p', l));
            }
            if (inCode && codeLines.length) blks.push(mkBlock('code', codeLines.join('\n')));
            return blks;
        };

        const parseHTML = (html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const blks = [];
            const BLOCK_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'li', 'div', 'aside', 'section', 'article', 'header', 'footer', 'hr']);
            const walk = (node) => {
                const tag = node.tagName?.toLowerCase();
                if (tag === 'hr') { blks.push(mkBlock('divider', '')); return; }
                if (tag === 'pre' || (tag === 'code' && node.parentElement?.tagName?.toLowerCase() === 'pre')) {
                    const txt = node.textContent?.trim();
                    if (txt) blks.push(mkBlock('code', txt));
                    return;
                }
                if (BLOCK_TAGS.has(tag)) {
                    let type = 'p';
                    if (tag === 'h1') type = 'h1';
                    else if (tag === 'h2') type = 'h2';
                    else if (tag === 'h3' || tag === 'h4') type = 'h3';
                    else if (tag === 'blockquote') type = 'quote';
                    else if (tag === 'aside') type = 'callout';
                    else if (tag === 'li') {
                        const parentTag = node.parentElement?.tagName?.toLowerCase();
                        if (parentTag === 'ol') type = 'ol';
                        else if (node.querySelector('[data-checked]') || node.closest('[data-block-type="to_do"]')) type = 'todo';
                        else type = 'ul';
                    }
                    const hasBlockChildren = Array.from(node.children).some(c => BLOCK_TAGS.has(c.tagName?.toLowerCase()));
                    if (hasBlockChildren && tag !== 'li') { Array.from(node.children).forEach(walk); return; }
                    const content = node.innerText?.trim() || node.textContent?.trim();
                    if (content) blks.push(mkBlock(type, content));
                } else if (node.nodeType === 1) {
                    Array.from(node.children).forEach(walk);
                }
            };
            Array.from(doc.body.children).forEach(walk);
            return blks;
        };

        newBlocks = html ? parseHTML(html) : parseText(text);
        if (newBlocks.length === 0 && text) newBlocks = parseText(text);
        if (newBlocks.length > 200) newBlocks = newBlocks.slice(0, 200);
        if (newBlocks.length <= 1) return false;

        const nb = [...blocks];
        nb.splice(targetIdx + 1, 0, ...newBlocks);
        setBlocks(nb);
        setTimeout(() => document.getElementById("blk-" + (targetIdx + newBlocks.length))?.focus(), 60);

        (async () => {
            for (let i = 0; i < newBlocks.length; i++) {
                const b = newBlocks[i];
                try {
                    const res = await notesApi.createBlock(notePageId, { type: b.type, content: b.content || '', position: targetIdx + 1 + i, checked: !!b.checked });
                    setBlocks(prev => prev.map(p => p.id === b.id ? { ...p, id: res.data.id } : p));
                } catch { }
                if (i % 10 === 9) await new Promise(r => setTimeout(r, 15));
            }
        })();

        return true;
    };

    const insertSlashType = type => {
        if (slash === null) return;
        const nb = [...blocks];
        // Always CONVERT the current block if it's empty, or INSERT after if not
        const currentContent = nb[slash.idx].content;
        if (currentContent.trim() === "") {
            // Convert in place (don't add new block)
            nb[slash.idx] = { ...nb[slash.idx], type, content: "" };
            save(nb);
            updBlk(slash.idx, { type, content: "" });
            setSlash(null);
            setTimeout(() => document.getElementById("blk-" + slash.idx)?.focus(), 30);
        } else {
            // Insert a new block after with the chosen type
            const b = mkBlock(type, ""); nb.splice(slash.idx + 1, 0, b); save(nb);
            socketRef.current?.emit('note:block:add', { pageId: notePageId, block: b, afterIdx: slash.idx });
            setSlash(null);
            setTimeout(() => document.getElementById("blk-" + (slash.idx + 1))?.focus(), 30);
        }
    };

    // ── Speech-to-Text ────────────────────────────────────────────────────────
    const toggleSpeech = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { alert("Speech recognition is only supported in Chrome/Edge."); return; }
        if (isListening) {
            speechRef.current?.stop();
            speechRef.current = null;
            setIsListening(false);
            return;
        }

        const startRecog = () => {
            const recog = new SpeechRecognition();
            recog.continuous = true;
            recog.interimResults = true;
            recog.lang = "en-IN";
            speechRef.current = recog;

            recog.onstart = () => setIsListening(true);

            // Auto-restart on end only if user hasn't stopped it manually
            recog.onend = () => {
                if (speechRef.current) {
                    // Still supposed to be listening — browser cut us off, restart
                    try { startRecog(); } catch { setIsListening(false); }
                } else {
                    setIsListening(false);
                }
            };

            recog.onerror = (ev) => {
                if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
                    alert('Microphone access denied. Please allow microphone in browser settings.');
                    speechRef.current = null;
                    setIsListening(false);
                }
                // For 'no-speech' or 'network' errors we just let onend handle the restart
            };

            recog.onresult = (event) => {
                let final = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) final += event.results[i][0].transcript;
                }
                if (final.trim()) {
                    const idx = activeBlkIdxRef.current;
                    const el = document.getElementById("blk-" + idx);
                    if (el) {
                        const cur = el.innerText || "";
                        const newContent = cur + (cur.length && !cur.endsWith(" ") ? " " : "") + final.trim();
                        el.innerText = newContent;
                        updBlk(idx, { content: newContent });
                    }
                }
            };

            try { recog.start(); } catch { }
        };

        startRecog();
    };

    // ── Word count + reading time ─────────────────────────────────────────────
    const allText = blocks.map(b => b.content || "").join(" ");
    const wordCount = allText.trim() ? allText.trim().split(/\s+/).length : 0;
    const readMins = Math.max(1, Math.ceil(wordCount / 200));

    // ── Breadcrumb ────────────────────────────────────────────────────────────
    const crumbs = [];
    let cur = notePageId;
    while (cur && pages[cur]) { crumbs.unshift(pages[cur]); cur = pages[cur].parentId; }
    const subPages = (pg.childIds || []).map(id => pages[id]).filter(Boolean);

    const slashBlockTypes = writingMode === 'script' ? SCRIPT_BLOCK_TYPES
        : writingMode === 'lyrics' ? LYRICS_BLOCK_TYPES
            : BLOCK_TYPES;

    // Compute ol-index for numbered list items (per indent level)
    const getOlIndex = (blocks, idx) => {
        const indent = blocks[idx].indent || 0;
        let count = 0;
        for (let i = idx - 1; i >= 0; i--) {
            if (blocks[i].type === 'ol' && (blocks[i].indent || 0) === indent) count++;
            else if ((blocks[i].indent || 0) < indent) break;
            else if ((blocks[i].indent || 0) > indent) continue;
            else break;
        }
        return count;
    };

    // Share note + sub-notes (collect all descendant IDs)
    const getAllDescendantIds = (id) => {
        const result = [id];
        const page = pages[id];
        if (!page) return result;
        (page.childIds || []).forEach(childId => {
            result.push(...getAllDescendantIds(childId));
        });
        return result;
    };

    const shareNote = () => {
        const ids = getAllDescendantIds(notePageId);
        const url = `${window.location.origin}?note=${notePageId}`;
        navigator.clipboard.writeText(url);
        alert(`Link copied! This note (and ${ids.length - 1} sub-note${ids.length !== 2 ? 's' : ''}) will be accessible via the shared link.`);
    };

    // Skeleton loading
    if (loading) return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ height: 5, background: `linear-gradient(to right,${t.accent},${t.blue || '#0072FF'})`, flexShrink: 0 }} />
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 60px", width: "100%" }}>
                <div style={{ height: 46, borderRadius: 8, background: t.border, marginBottom: 24, animation: "skShimmer 1.4s ease infinite", backgroundSize: "200% 100%", backgroundImage: `linear-gradient(90deg, ${t.border} 25%, ${t.noteBorder} 50%, ${t.border} 75%)` }} />
                {[80, 65, 90, 55, 75].map((w, i) => (
                    <div key={i} style={{ height: 16, borderRadius: 6, background: t.border, marginBottom: 12, width: w + "%", animation: "skShimmer 1.4s ease infinite", animationDelay: i * 0.1 + "s", backgroundSize: "200% 100%", backgroundImage: `linear-gradient(90deg, ${t.border} 25%, ${t.noteBorder} 50%, ${t.border} 75%)` }} />
                ))}
            </div>
        </div>
    );

    // Lock gate shown before content if locked
    const isNowLocked = !!localStorage.getItem(storageKey) && !unlocked;

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Breadcrumb bar */}
                <div style={{ display: "flex", alignItems: "center", padding: "9px 28px", borderBottom: `1px solid ${t.border}`, background: t.nav, flexShrink: 0, gap: 0, flexWrap: "wrap" }}>
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
                    <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                        {/* Writing mode toggles */}
                        <button type="button" onClick={() => setWritingMode(writingMode === 'script' ? null : 'script')}
                            title="Script Writing Mode"
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 7, border: `1px solid ${writingMode === 'script' ? t.accent : t.border}`, background: writingMode === 'script' ? t.accentDim : "transparent", cursor: "pointer", color: writingMode === 'script' ? t.accent : t.t2, fontSize: 11, fontFamily: t.disp, transition: "all .15s" }}>
                            📽️ Script
                        </button>
                        <button type="button" onClick={() => setWritingMode(writingMode === 'lyrics' ? null : 'lyrics')}
                            title="Song Lyrics Mode"
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 7, border: `1px solid ${writingMode === 'lyrics' ? t.accent : t.border}`, background: writingMode === 'lyrics' ? t.accentDim : "transparent", cursor: "pointer", color: writingMode === 'lyrics' ? t.accent : t.t2, fontSize: 11, fontFamily: t.disp, transition: "all .15s" }}>
                            🎵 Lyrics
                        </button>

                        {/* Zoom controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: 1, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 7, padding: "1px 4px" }}>
                            <button type="button" onClick={() => setZoom(z => Math.max(50, z - 10))}
                                style={{ background: "none", border: "none", color: t.t2, cursor: "pointer", fontSize: 13, fontFamily: t.mono, padding: "2px 5px", borderRadius: 4 }} title="Zoom out">−</button>
                            <span style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, minWidth: 28, textAlign: "center" }}>{zoom}%</span>
                            <button type="button" onClick={() => setZoom(z => Math.min(150, z + 10))}
                                style={{ background: "none", border: "none", color: t.t2, cursor: "pointer", fontSize: 13, fontFamily: t.mono, padding: "2px 5px", borderRadius: 4 }} title="Zoom in">+</button>
                        </div>

                        {/* Lock */}
                        <button type="button" onClick={() => setShowLockModal(true)}
                            title={localStorage.getItem(storageKey) ? "Note is locked" : "Lock this note"}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 7, border: `1px solid ${localStorage.getItem(storageKey) ? t.accent : t.border}`, background: localStorage.getItem(storageKey) ? t.accentDim : "transparent", cursor: "pointer", color: localStorage.getItem(storageKey) ? t.accent : t.t2, fontSize: 13, transition: "all .15s" }}>
                            {localStorage.getItem(storageKey) ? "🔒" : "🔓"}
                        </button>

                        {/* Speech-to-text */}
                        <button type="button" onClick={toggleSpeech}
                            title="Speech to Text (Beta — Chrome/Edge only)"
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 7, border: `1px solid ${isListening ? t.red : t.border}`, background: isListening ? t.red + "22" : "transparent", cursor: "pointer", color: isListening ? t.red : t.t2, fontSize: 11, fontFamily: t.disp, transition: "all .15s", animation: isListening ? "pulse 1s ease infinite" : "none" }}>
                            🎤 {isListening ? "Listening…" : "Speak"}
                        </button>

                        {/* Share */}
                        <button type="button" onClick={shareNote}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", color: t.t2, fontSize: 11.5, fontFamily: t.disp, transition: "all .15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = t.noteHover}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <I d={IC.lnk} sz={12} c="currentColor" />Share
                        </button>
                        <button type="button" onClick={() => addNotePage(notePageId)}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", color: t.t2, fontSize: 11.5, fontFamily: t.disp, transition: "all .15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = t.noteHover}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <I d={IC.plus} sz={12} c="currentColor" />Sub-page
                        </button>
                    </div>
                </div>

                {/* Lock gate or content */}
                {isNowLocked ? (
                    <div style={{ flex: 1, overflow: "auto" }}>
                        <div style={{ height: 5, background: `linear-gradient(to right,${t.accent},${t.blue || '#0072FF'})` }} />
                        <LockGate notePageId={notePageId} t={t} onUnlock={() => setUnlocked(true)} />
                    </div>
                ) : (
                    <div style={{ flex: 1, overflow: "auto" }} onClick={() => setEmojiOpen(false)}>
                        <div style={{ height: 5, background: `linear-gradient(to right,${t.accent},${t.blue || '#0072FF'})`, flexShrink: 0 }} />
                        {writingMode && (
                            <div style={{ textAlign: "center", padding: "8px 0", background: writingMode === 'script' ? t.inset : t.calloutBg, borderBottom: `1px solid ${t.border}`, fontSize: 11.5, color: writingMode === 'script' ? t.accent : t.amber || t.accent, fontFamily: t.mono, fontWeight: 600, letterSpacing: "0.3px" }}>
                                {writingMode === 'script' ? '📽️ Script Mode — Tab to cycle block types' : '🎵 Lyrics Mode — Tab to cycle section types'}
                            </div>
                        )}

                        {/* zoom wrapper — keeps content centered */}
                        <div style={{
                            flex: 1,
                            overflowX: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <div style={{
                                width: `${(720 * zoom) / 100}px`,
                                maxWidth: '100%',
                                flexShrink: 0,
                                transform: `scale(${zoom / 100})`,
                                transformOrigin: 'top center',
                                paddingBottom: `${80 * zoom / 100}px`,
                            }}>
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
                                        {[
                                            ["Created", pg.updatedAt],
                                            ["Words", wordCount.toLocaleString()],
                                            ["Read", readMins + " min"],
                                            ["Blocks", blocks.length + " blocks"],
                                            ["Sub-pages", (pg.childIds?.length || 0) + " pages"]
                                        ].map(([l, v]) => (
                                            <div key={l}>
                                                <div style={{ fontSize: 9.5, color: t.noteMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2, fontFamily: t.mono }}>{l}</div>
                                                <div style={{ fontSize: 12, color: t.noteSubText }}>{v}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Blocks */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}
                                        onDragEnd={() => { dragFromIdx.current = null; setDragOver(null); }}>
                                        {blocks.map((blk, idx) => {
                                            const olIndex = blk.type === 'ol' ? getOlIndex(blocks, idx) : 0;
                                            return (
                                                <NoteBlock key={blk.id} blk={blk} idx={idx} t={t} dark={dark}
                                                    olIndex={olIndex}
                                                    onUpdate={ch => { updBlk(idx, ch); activeBlkIdxRef.current = idx; }}
                                                    onDelete={() => delBlk(idx)}
                                                    onAddAfter={type => addBlk(idx, type)}
                                                    onSlash={(rect, filter) => setSlash({ idx, x: rect.left, y: rect.bottom + 4, filter })}
                                                    onSlashClose={() => setSlash(null)}
                                                    onFocusPrev={() => focusAtEnd("blk-" + Math.max(0, idx - 1))}
                                                    onFocusNext={() => focusAtStart("blk-" + Math.min(blocks.length - 1, idx + 1))}
                                                    onPasteHTML={(html, text, i) => handlePasteHTML(html, text, i)}
                                                    onConvert={type => convertBlk(idx, type)}
                                                    onDragStart={handleDragStart}
                                                    onDragOver={handleDragOver}
                                                    onDrop={handleDrop}
                                                    isDragging={dragFromIdx.current === idx}
                                                    isDragOver={dragOver === idx} />
                                            );
                                        })}
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
                                            background: `linear-gradient(135deg, ${t.accent}22, ${t.blue || '#0072FF'}22)`,
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
                    </div>
                )}
            </div>

            {/* Slash menu */}
            {slash && <SlashMenu t={t} filter={slash.filter} pos={{ x: slash.x, y: slash.y }} onSelect={insertSlashType} onClose={() => setSlash(null)} blockTypes={slashBlockTypes} />}

            {/* Lock modal */}
            {showLockModal && <SetLockModal notePageId={notePageId} t={t} onClose={() => setShowLockModal(false)} />}
        </div>
    );
}
