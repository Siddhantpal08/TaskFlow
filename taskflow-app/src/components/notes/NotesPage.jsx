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
    const [forgotMode, setForgotMode] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const savedPin = localStorage.getItem(storageKey);

    const tryUnlock = () => {
        if (pin === savedPin) { onUnlock(); }
        else { setError("Incorrect PIN"); setPin(""); }
    };

    const handleForgot = async () => {
        setLoading(true); setError("");
        try {
            const { authApi } = await import("../../api/auth");
            await authApi.requestPinReset();
            setOtpSent(true);
        } catch (e) {
            setError(e.response?.data?.message || "Failed to send OTP.");
        } finally { setLoading(false); }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) { setError("Enter 6-digit OTP"); return; }
        setLoading(true); setError("");
        try {
            const { authApi } = await import("../../api/auth");
            await authApi.verifyPinReset(otp);
            localStorage.removeItem(storageKey);
            onUnlock(); // successfully removed PIN, proceed
        } catch (e) {
            setError(e.response?.data?.message || "Invalid OTP.");
        } finally { setLoading(false); }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
            <div style={{ fontSize: 48 }}>{forgotMode ? "📧" : "🔒"}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.t1, fontFamily: t.disp }}>{forgotMode ? (otpSent ? "Enter OTP" : "Forgot PIN") : "This note is locked"}</div>
            <div style={{ fontSize: 13, color: t.t3, fontFamily: t.disp, textAlign: "center", maxWidth: 300 }}>
                {forgotMode
                    ? (otpSent ? "Check your email for the 6-digit code to remove the lock." : "We'll send an OTP to your email to remove the lock from this browser.")
                    : "Enter your PIN to continue"}
            </div>

            {!forgotMode ? (
                <>
                    <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={12}
                        placeholder="Enter PIN"
                        value={pin}
                        onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                        onKeyDown={e => e.key === "Enter" && tryUnlock()}
                        style={{
                            padding: "11px 18px", borderRadius: 10,
                            border: `1.5px solid ${error ? t.red : t.border}`,
                            background: t.inset, color: t.t1,
                            fontSize: 22, outline: "none",
                            fontFamily: t.mono, width: 200, textAlign: "center",
                            letterSpacing: "6px",
                        }}
                    />
                    {error && <div style={{ color: t.red, fontSize: 12 }}>{error}</div>}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                        <button onClick={tryUnlock} style={{ padding: "9px 28px", borderRadius: 9, background: t.accent, border: "none", color: "#000", fontWeight: 700, fontFamily: t.disp, cursor: "pointer", fontSize: 14 }}>Unlock</button>
                        <button onClick={() => setForgotMode(true)} style={{ background: "none", border: "none", color: t.t3, fontSize: 12, cursor: "pointer", fontFamily: t.disp }}>Forgot PIN?</button>
                    </div>
                </>
            ) : (
                <>
                    {otpSent ? (
                        <>
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                                style={{
                                    padding: "11px 18px", borderRadius: 10,
                                    border: `1.5px solid ${error ? t.red : t.border}`,
                                    background: t.inset, color: t.t1,
                                    fontSize: 22, outline: "none",
                                    fontFamily: t.mono, width: 200, textAlign: "center",
                                    letterSpacing: "8px",
                                }}
                            />
                            {error && <div style={{ color: t.red, fontSize: 12 }}>{error}</div>}
                            <button onClick={handleVerifyOtp} disabled={loading} style={{ padding: "9px 28px", borderRadius: 9, background: t.accent, border: "none", color: "#000", fontWeight: 700, fontFamily: t.disp, cursor: "pointer", fontSize: 14, marginTop: 4 }}>
                                {loading ? "Verifying…" : "Reset PIN"}
                            </button>
                        </>
                    ) : (
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <button onClick={() => { setForgotMode(false); setError(""); }} style={{ padding: "9px 18px", borderRadius: 9, background: t.card, border: `1px solid ${t.border}`, color: t.t2, fontFamily: t.disp, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancel</button>
                            <button onClick={handleForgot} disabled={loading} style={{ padding: "9px 20px", borderRadius: 9, background: t.accent, border: "none", color: "#000", fontWeight: 700, fontFamily: t.disp, cursor: "pointer", fontSize: 13 }}>
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                        </div>
                    )}
                </>
            )}
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
                style={{ padding: "8px 40px 8px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.inset, color: t.t1, fontSize: 16, textAlign: "center", outline: "none", letterSpacing: show ? "2px" : "6px", fontFamily: t.mono, width: "100%" }} />
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
    const [docTheme, setDocTheme] = useState(() => localStorage.getItem("tf_docTheme") || 'light');
    const [useTypewriter, setUseTypewriter] = useState(() => localStorage.getItem("tf_docFont") === 'true');
    const [zoom, setZoom] = useState(100);

    const toggleDocTheme = () => { const nv = docTheme === 'light' ? 'dark' : 'light'; setDocTheme(nv); localStorage.setItem("tf_docTheme", nv); };
    const toggleDocFont = () => { const nv = !useTypewriter; setUseTypewriter(nv); localStorage.setItem("tf_docFont", nv.toString()); };
    const [isListening, setIsListening] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const [selectedBlockIds, setSelectedBlockIds] = useState(new Set());
    const [dragBox, setDragBox] = useState(null); // { x1, y1, x2, y2 }

    const titleRef = useRef();
    const socketRef = useRef(null);
    const debounceTimers = useRef({});
    const latestBlocksRef = useRef([]);
    const speechRef = useRef(null);
    const activeBlkIdxRef = useRef(0);
    const listeningRef = useRef(false);
    // drag-and-drop
    const dragFromIdx = useRef(null);
    const [dragOver, setDragOver] = useState(null);
    // loc- ID → real backend ID mapping (fixes save race condition)
    const idMapRef = useRef({});
    // undo/redo
    const historyRef = useRef([]);
    const futureRef = useRef([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [hasSpeechSupport, setHasSpeechSupport] = useState(false);

    useEffect(() => {
        const checkSpeech = async () => {
            const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
            let isBrave = false;
            if (navigator.brave && navigator.brave.isBrave) {
                isBrave = await navigator.brave.isBrave();
            }
            setHasSpeechSupport(isSupported && !isBrave);
        };
        checkSpeech();
    }, []);

    useEffect(() => { latestBlocksRef.current = blocks; }, [blocks]);

    // ── History helpers ───────────────────────────────────────────────────────
    const pushHistory = () => {
        const snap = latestBlocksRef.current.map(b => ({ ...b }));
        historyRef.current = [...historyRef.current.slice(-49), snap];
        futureRef.current = [];
        setCanUndo(true);
        setCanRedo(false);
    };

    const syncDiffToBackend = (sourceBlocks, targetBlocks) => {
        const sourceMap = new Map(sourceBlocks.map(b => [b.id, b]));
        const targetMap = new Map(targetBlocks.map(b => [b.id, b]));

        sourceBlocks.forEach(b => {
            if (!targetMap.has(b.id)) {
                const realId = idMapRef.current[b.id] || b.id;
                if (!realId.toString().startsWith("loc-")) notesApi.deleteBlock(realId).catch(() => { });
            }
        });
        targetBlocks.forEach((b, idx) => {
            const s = sourceMap.get(b.id);
            const realId = idMapRef.current[b.id] || b.id;
            if (!s) {
                if (realId.toString().startsWith("loc-")) {
                    notesApi.createBlock(notePageId, { type: b.type, content: b.content, position: idx, indent: b.indent || 0 }).then(res => idMapRef.current[b.id] = res.data.id).catch(() => { });
                } else {
                    notesApi.createBlock(notePageId, { type: b.type, content: b.content, position: idx, indent: b.indent || 0 }).catch(() => { });
                }
            } else if (s.content !== b.content || s.type !== b.type || s.checked !== b.checked || s.indent !== b.indent || sourceBlocks.indexOf(s) !== idx) {
                if (!realId.toString().startsWith("loc-")) {
                    notesApi.updateBlock(realId, { content: b.content, type: b.type, checked: !!b.checked, position: idx, indent: b.indent || 0 }).catch(() => { });
                }
            }
        });
    };

    const undo = () => {
        if (!historyRef.current.length) return;
        const prev = historyRef.current.pop();
        const current = latestBlocksRef.current;
        futureRef.current.push(current.map(b => ({ ...b })));
        setBlocks(prev);
        syncDiffToBackend(current, prev);
        setCanUndo(historyRef.current.length > 0);
        setCanRedo(true);
    };

    const redo = () => {
        if (!futureRef.current.length) return;
        const next = futureRef.current.pop();
        const current = latestBlocksRef.current;
        historyRef.current.push(current.map(b => ({ ...b })));
        setBlocks(next);
        syncDiffToBackend(current, next);
        setCanUndo(true);
        setCanRedo(futureRef.current.length > 0);
    };


    // Global keyboard undo/redo — only fires when focus is NOT inside contenteditable
    useEffect(() => {
        const handler = (e) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            const inEditable = document.activeElement?.isContentEditable;
            if (e.key === 'z' || e.key === 'Z') {
                if (e.shiftKey) {
                    if (!inEditable) { e.preventDefault(); redo(); }
                } else {
                    if (!inEditable) { e.preventDefault(); undo(); }
                }
            }
            if ((e.key === 'y' || e.key === 'Y') && !e.shiftKey) {
                if (!inEditable) { e.preventDefault(); redo(); }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        historyRef.current = [];
        futureRef.current = [];
        setCanUndo(false);
        setCanRedo(false);
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
                            fetch(`${BASE}/notes/pages/${notePageId}/blocks`, { method: 'POST', headers: authHeader, body: JSON.stringify({ type: blkToFlush.type, content: blkToFlush.content, position: idx, indent: blkToFlush.indent || 0 }), keepalive: true }).catch(() => { });
                        } else {
                            fetch(`${BASE}/notes/blocks/${blkId}`, { method: 'PUT', headers: authHeader, body: JSON.stringify({ content: blkToFlush.content, checked: blkToFlush.checked, type: blkToFlush.type, indent: blkToFlush.indent || 0 }), keepalive: true }).catch(() => { });
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

    const addBlk = async (afterIdx, type = "p", content = "") => {
        pushHistory();
        const b = mkBlock(type, content);
        const nb = [...blocks]; nb.splice(afterIdx + 1, 0, b); setBlocks(nb);
        setTimeout(() => document.getElementById("blk-" + (afterIdx + 1))?.focus(), 30);
        socketRef.current?.emit('note:block:add', { pageId: notePageId, block: b, afterIdx });
        try {
            const res = await notesApi.createBlock(notePageId, { type, content, position: afterIdx + 1, indent: 0 });
            const realId = res.data.id;
            idMapRef.current[b.id] = realId;
            // Flush any typed content that came in while we were waiting for the real ID
            const pendingTimer = debounceTimers.current[b.id];
            if (pendingTimer) {
                clearTimeout(pendingTimer);
                delete debounceTimers.current[b.id];
                const latestBlk = latestBlocksRef.current.find(bl => bl.id === b.id);
                if (latestBlk && latestBlk.content) {
                    notesApi.updateBlock(realId, { content: latestBlk.content, type: latestBlk.type, checked: !!latestBlk.checked, indent: latestBlk.indent || 0 }).catch(() => { });
                }
            }
            setBlocks(prev => prev.map(p => p.id === b.id ? { ...p, id: realId } : p));
        } catch (e) { }
    };

    const updBlk = (idx, ch) => {
        const nb = [...blocks];
        const newBlk = { ...nb[idx], ...ch };
        nb[idx] = newBlk;
        setBlocks(nb);
        socketRef.current?.emit('note:block:update', { pageId: notePageId, blockId: newBlk.id, changes: ch });
        const timerId = newBlk.id;
        if (debounceTimers.current[timerId]) clearTimeout(debounceTimers.current[timerId]);
        debounceTimers.current[timerId] = setTimeout(() => {
            delete debounceTimers.current[timerId];
            // Resolve real ID if this was a loc- block
            const resolvedId = idMapRef.current[newBlk.id] || newBlk.id;
            const latestBlk = latestBlocksRef.current.find(b => b.id === resolvedId || b.id === newBlk.id) || newBlk;
            const latestContent = latestBlk.content ?? newBlk.content;
            const latestType = latestBlk.type ?? newBlk.type;
            const latestChecked = latestBlk.checked ?? newBlk.checked;
            const latestIndent = latestBlk.indent ?? newBlk.indent ?? 0;
            if (resolvedId.toString().startsWith("loc-")) {
                // Still a loc- ID AND no real ID mapped yet — create it
                const currentIdx = latestBlocksRef.current.findIndex(b => b.id === newBlk.id);
                if (currentIdx === -1) return;
                notesApi.createBlock(notePageId, { type: latestType, content: latestContent, position: currentIdx, indent: latestIndent })
                    .then(res => {
                        idMapRef.current[newBlk.id] = res.data.id;
                        setBlocks(prev => prev.map(p => p.id === newBlk.id ? { ...p, id: res.data.id } : p));
                    }).catch(() => { });
            } else {
                notesApi.updateBlock(resolvedId, { content: latestContent, checked: !!latestChecked, type: latestType, indent: latestIndent }).catch(() => { });
            }
        }, 600);
    };

    // Convert a block type (with undo history)
    const convertBlk = (idx, newType) => {
        pushHistory();
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
        pushHistory();
        const blk = blocks[idx];
        const nb = blocks.filter((_, i) => i !== idx); setBlocks(nb);
        focusAtEnd("blk-" + Math.max(0, idx - 1));
        socketRef.current?.emit('note:block:delete', { pageId: notePageId, idx });
        if (!blk.id.toString().startsWith("loc-")) notesApi.deleteBlock(blk.id).catch(() => { });
        if (debounceTimers.current[blk.id]) { clearTimeout(debounceTimers.current[blk.id]); delete debounceTimers.current[blk.id]; }
    };

    const dupBlk = (idx) => {
        pushHistory();
        const src = blocks[idx];
        const copy = { ...src, id: 'loc-' + Math.random().toString(36).slice(2, 9) };
        const nb = [...blocks]; nb.splice(idx + 1, 0, copy); setBlocks(nb);
        setTimeout(() => document.getElementById('blk-' + (idx + 1))?.focus(), 30);
        notesApi.createBlock(notePageId, { type: copy.type, content: copy.content, position: idx + 1 })
            .then(res => { idMapRef.current[copy.id] = res.data.id; setBlocks(prev => prev.map(b => b.id === copy.id ? { ...b, id: res.data.id } : b)); })
            .catch(() => { });
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
                notesApi.updateBlock(blk.id, { content: blk.content, type: blk.type, checked: !!blk.checked, position: i, indent: blk.indent || 0 }).catch(() => { });
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
        if (!hasSpeechSupport) { alert("Speech recognition is only supported in Chrome/Edge."); return; }

        if (isListening || listeningRef.current) {
            listeningRef.current = false;
            speechRef.current?.abort();
            speechRef.current = null;
            setIsListening(false);
            return;
        }

        listeningRef.current = true;
        setIsListening(true);

        const startNew = () => {
            if (!listeningRef.current) return;

            const recog = new SpeechRecognition();
            recog.continuous = true;   // stream until explicitly stopped
            recog.interimResults = false;
            recog.lang = navigator.language || 'en-US';
            speechRef.current = recog;

            recog.onresult = (event) => {
                // Only take the newly finalized result added in this event 
                // instead of joining all historical results which causes repetition
                const latestResult = event.results[event.resultIndex];
                if (!latestResult) return;

                const transcript = latestResult[0].transcript;

                if (transcript.trim()) {
                    const idx = activeBlkIdxRef.current;
                    const el = document.getElementById('blk-' + idx);
                    if (el) {
                        const cur = el.innerHTML || '';
                        const sep = cur.length && !cur.endsWith(' ') ? ' ' : '';
                        const newContent = cur + sep + transcript.trim();
                        el.innerHTML = newContent;
                        // Place cursor at end safely
                        const range = document.createRange();
                        range.selectNodeContents(el);
                        range.collapse(false);
                        window.getSelection()?.removeAllRanges();
                        window.getSelection()?.addRange(range);
                        updBlk(idx, { content: newContent });
                    }
                }
            };

            recog.onend = () => {
                // If it wasn't manually stopped, restart it to keep listening
                if (listeningRef.current) {
                    setTimeout(startNew, 150);
                } else {
                    setIsListening(false);
                }
            };

            recog.onerror = (ev) => {
                if (ev.error === 'no-speech') return; // ignore silence
                if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
                    alert('Microphone access denied. Please allow microphone in browser settings.');
                    listeningRef.current = false;
                    setIsListening(false);
                }
            };

            try { recog.start(); } catch (e) {
                // Already started elsewhere — wait and retry
                if (listeningRef.current) setTimeout(startNew, 300);
            }
        };

        startNew();
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

    const getSectionNumber = (blocks, idx) => {
        const type = blocks[idx].type;
        if (!['scene-heading', 'verse', 'chorus', 'hook', 'bridge'].includes(type)) return null;
        let count = 1;
        for (let i = 0; i < idx; i++) {
            if (blocks[i].type === type) count++;
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

    // Global Selection Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.closest('[contenteditable]') || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            // Bulk Delete
            if (e.key === 'Backspace' || e.key === 'Delete') {
                setSelectedBlockIds(curr => {
                    if (curr.size === 0) return curr;
                    e.preventDefault();
                    setBlocks(p => {
                        const remaining = p.filter(x => !curr.has(x.id));
                        const toDel = p.filter(x => curr.has(x.id));
                        if (remaining.length === 0) remaining.push({ id: crypto.randomUUID(), type: 'p', content: '', indent: 0 });

                        if (socketRef.current?.readyState === WebSocket.OPEN) {
                            toDel.forEach(b => socketRef.current.send(JSON.stringify({ type: 'delete', blockId: b.id })));
                        }
                        setTimeout(() => setSelectedBlockIds(new Set()), 0);
                        return remaining;
                    });
                    return curr;
                });
            }
            // Bulk Copy (Ctrl+C)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedBlockIds.size > 0 && !e.target.closest('[contenteditable]') && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                setBlocks(p => {
                    const toCopy = p.filter(x => selectedBlockIds.has(x.id)).map(x => x.content).join('\n');
                    navigator.clipboard.writeText(toCopy);
                    return p;
                });
            }

            // Bulk Duplicate (Ctrl+D)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D') && selectedBlockIds.size > 0 && !e.target.closest('[contenteditable]') && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                setBlocks(p => {
                    const st = [...p];
                    const newBlocks = [];
                    st.forEach(b => {
                        if (selectedBlockIds.has(b.id)) {
                            const clone = { ...b, id: crypto.randomUUID() };
                            newBlocks.push(clone);
                            if (socketRef.current?.readyState === WebSocket.OPEN) {
                                socketRef.current.send(JSON.stringify({ type: 'create', block: clone }));
                            }
                        }
                    });
                    // Insert duplicates after the last selected block
                    const lastIdx = [...p].findLastIndex(x => selectedBlockIds.has(x.id));
                    if (lastIdx !== -1) {
                        st.splice(lastIdx + 1, 0, ...newBlocks);
                    }
                    setTimeout(() => setSelectedBlockIds(new Set()), 0);
                    return st;
                });
            }

            // Ctrl+A (Select All)
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                // IMPORTANT: Ensure it actually cancels default Ctrl+A if the user is not focused on an input/editable field.
                if (e.target.closest('[contenteditable]') || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                e.preventDefault();
                setBlocks(p => {
                    setSelectedBlockIds(new Set(p.map(x => x.id)));
                    return p;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Drag-to-select logic
    const handleWrapperMouseDown = (e) => {
        if (e.button !== 0) return; // only left click
        if (e.target.closest('.blkr') || e.target.closest('button') || e.target.closest('.tf-no-drag')) {
            if (!e.shiftKey && !e.ctrlKey && !e.metaKey && selectedBlockIds.size > 0 && !e.target.closest('.blkr')) {
                setSelectedBlockIds(new Set());
            }
            return;
        }

        const startX = e.clientX;
        const startY = e.clientY;
        setDragBox({ x1: startX, y1: startY, x2: startX, y2: startY });
        const isShift = e.shiftKey || e.ctrlKey || e.metaKey;
        if (!isShift) setSelectedBlockIds(new Set());

        const removeListeners = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        const initialSelected = isShift ? new Set(selectedBlockIds) : new Set();

        const onMove = (me) => {
            me.preventDefault(); // prevent text selection while dragging box
            setDragBox({ x1: startX, y1: startY, x2: me.clientX, y2: me.clientY });

            const boxRect = {
                left: Math.min(startX, me.clientX),
                right: Math.max(startX, me.clientX),
                top: Math.min(startY, me.clientY),
                bottom: Math.max(startY, me.clientY),
            };

            setBlocks(prev => {
                const ns = new Set(initialSelected);
                prev.forEach((blk, idx) => {
                    const el = document.getElementById(`blk-wrapper-${idx}`);
                    if (el) {
                        const r = el.getBoundingClientRect();
                        const overlaps = !(boxRect.right < r.left || boxRect.left > r.right || boxRect.bottom < r.top || boxRect.top > r.bottom);
                        if (overlaps) ns.add(blk.id);
                        else if (!isShift) ns.delete(blk.id);
                    }
                });
                setSelectedBlockIds(ns);
                return prev;
            });
        };

        const onUp = () => {
            setDragBox(null);
            removeListeners();
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
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
    const storageKey = `tf_lock_${notePageId}`;
    const isNowLocked = !!localStorage.getItem(storageKey) && !unlocked;

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            <style>
                {`
                @media print {
                    body * { visibility: hidden !important; }
                    .tf-print-area, .tf-print-area * { visibility: visible !important; }
                    .tf-print-area { position: absolute; left: 0; top: 0; width: 100%; max-width: none !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; background: #fff !important; color: #000 !important; }
                    /* hide UI elements */
                    .tf-print-area button { display: none !important; }
                    @page { margin: 20mm; }
                }
                `}
            </style>
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
                        {/* Undo / Redo */}
                        <div style={{ display: "flex", gap: 1, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 7, padding: "1px 2px" }}>
                            <button type="button" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"
                                style={{ background: "none", border: "none", color: canUndo ? t.t2 : t.t3, cursor: canUndo ? "pointer" : "default", fontSize: 14, padding: "2px 6px", borderRadius: 5, opacity: canUndo ? 1 : 0.4, transition: "opacity .15s" }}>↩</button>
                            <button type="button" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)"
                                style={{ background: "none", border: "none", color: canRedo ? t.t2 : t.t3, cursor: canRedo ? "pointer" : "default", fontSize: 14, padding: "2px 6px", borderRadius: 5, opacity: canRedo ? 1 : 0.4, transition: "opacity .15s" }}>↪</button>
                        </div>

                        {/* Writing mode toggles */}
                        <button type="button" onClick={() => {
                            if (writingMode === 'script') {
                                if (blocks.some(b => SCRIPT_TYPES.has(b.type))) {
                                    alert("This document contains script blocks and cannot be reverted back to a standard note.");
                                    return;
                                }
                                setWritingMode(null);
                            } else {
                                setWritingMode('script');
                            }
                        }}
                            title="Screenplay / Script Mode"
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 7, border: `1px solid ${writingMode === 'script' ? t.accent : t.border}`, background: writingMode === 'script' ? t.accentDim : "transparent", cursor: "pointer", color: writingMode === 'script' ? t.accent : t.t2, fontSize: 11, fontFamily: t.disp, transition: "all .15s" }}>
                            📽️ Script
                        </button>
                        <button type="button" onClick={() => {
                            if (writingMode === 'lyrics') {
                                if (blocks.some(b => LYRICS_TYPES.has(b.type))) {
                                    alert("This document contains lyrics blocks and cannot be reverted back to a standard note.");
                                    return;
                                }
                                setWritingMode(null);
                            } else {
                                setWritingMode('lyrics');
                            }
                        }}
                            title="Song Lyrics Mode"
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 7, border: `1px solid ${writingMode === 'lyrics' ? t.accent : t.border}`, background: writingMode === 'lyrics' ? t.accentDim : "transparent", cursor: "pointer", color: writingMode === 'lyrics' ? t.accent : t.t2, fontSize: 11, fontFamily: t.disp, transition: "all .15s" }}>
                            🎵 Lyrics
                        </button>

                        {/* Document tools */}
                        {writingMode && (
                            <div style={{ display: "flex", alignItems: "center", gap: 3, paddingLeft: 4, marginLeft: 4, borderLeft: `1px solid ${t.border}` }}>
                                <button type="button" onClick={toggleDocTheme}
                                    title="Toggle Light/Dark Page"
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 6px", borderRadius: 6, border: `1px solid ${t.border}`, background: docTheme === 'light' ? '#fff' : '#1e1e1e', cursor: "pointer", color: docTheme === 'light' ? '#000' : '#fff', fontSize: 13, transition: "all .15s" }}>
                                    {docTheme === 'light' ? '🌙' : '☀️'}
                                </button>
                                <button type="button" onClick={toggleDocFont}
                                    title="Toggle Typewriter Font"
                                    style={{ display: "flex", alignItems: "center", padding: "4px 8px", borderRadius: 6, border: `1px solid ${useTypewriter ? t.accent : t.border}`, background: useTypewriter ? t.accentDim : "transparent", cursor: "pointer", color: useTypewriter ? t.accent : t.t2, fontSize: 11, fontFamily: useTypewriter ? "'Courier', monospace" : t.disp, transition: "all .15s" }}>
                                    Typewriter Font
                                </button>
                                <button type="button" onClick={() => window.print()}
                                    title="Export to PDF"
                                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6, border: `1px solid ${t.border}`, background: "transparent", cursor: "pointer", color: t.t2, fontSize: 11, fontFamily: t.disp, transition: "all .15s" }}>
                                    ⬇️ Export PDF
                                </button>
                            </div>
                        )}

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
                        {hasSpeechSupport && (
                            <button type="button" onClick={toggleSpeech}
                                title="Speech to Text (Beta)"
                                style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 7, border: `1px solid ${isListening ? t.red : t.border}`, background: isListening ? t.red + "22" : "transparent", cursor: "pointer", color: isListening ? t.red : t.t2, fontSize: 11, fontFamily: t.disp, transition: "all .15s", animation: isListening ? "pulse 1s ease infinite" : "none" }}>
                                🎤 {isListening ? "Listening…" : "Speak"}
                            </button>
                        )}

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
                    <div className="tf-scroll-wrapper" style={{ flex: 1, overflow: "auto", background: writingMode ? '#020408' : 'transparent', transition: "background .3s ease" }} onClick={() => setEmojiOpen(false)} onMouseDown={handleWrapperMouseDown}>
                        <div style={{ height: 5, background: `linear-gradient(to right,${t.accent},${t.blue || '#0072FF'})`, flexShrink: 0 }} />
                        {writingMode && (
                            <div style={{ textAlign: "center", padding: "8px 0", background: writingMode === 'script' ? t.inset : t.calloutBg, borderBottom: `1px solid ${t.border}`, fontSize: 11.5, color: writingMode === 'script' ? t.accent : t.amber || t.accent, fontFamily: t.mono, fontWeight: 600, letterSpacing: "0.3px", zIndex: 10, position: "sticky", top: 0 }}>
                                {writingMode === 'script' ? '📽️ Script Mode — Tab to cycle block types' : '🎵 Lyrics Mode — Tab to cycle section types'}
                            </div>
                        )}

                        {/* zoom wrapper — overflow:visible so block handles at left:-44px are NOT clipped */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            overflow: 'visible',
                            padding: writingMode ? "48px 0" : 0
                        }}>
                            <div style={{
                                width: zoom === 100 ? (writingMode ? "210mm" : "100%") : (writingMode ? `calc(210mm * ${zoom / 100})` : `${720 * zoom / 100}px`),
                                maxWidth: '100%',
                                flexShrink: 0,
                                transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none',
                                transformOrigin: 'top center',
                            }}>
                                <div className="tf-print-area" style={{
                                    maxWidth: writingMode ? "none" : 720,
                                    width: "100%",
                                    margin: "0 auto",
                                    padding: writingMode ? "80px 96px" : "32px 60px 80px",
                                    position: "relative",
                                    background: writingMode ? (docTheme === 'light' ? '#FFFFFF' : '#1A1C22') : 'transparent',
                                    color: writingMode ? (docTheme === 'light' ? '#000000' : '#E2EFFF') : t.noteText,
                                    minHeight: writingMode ? "297mm" : "auto",
                                    boxShadow: writingMode ? "0 16px 48px rgba(0,0,0,0.4)" : "none",
                                    borderRadius: writingMode ? 2 : 0,
                                    border: writingMode ? `1px solid ${docTheme === 'light' ? '#DDDDDD' : '#333333'}` : "none",
                                    fontFamily: writingMode && useTypewriter ? "'Courier New', Courier, monospace" : (writingMode ? t.disp : undefined),
                                    transition: "background .3s ease, color .3s ease",
                                    '--doc-font': writingMode && useTypewriter ? "'Courier New', Courier, monospace" : (writingMode ? t.disp : undefined),
                                    '--doc-color': writingMode ? (docTheme === 'light' ? '#000000' : '#E2EFFF') : undefined
                                }}>
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

                                    {/* Meta - hide in script mode */}
                                    {!writingMode && (
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
                                    )}

                                    {/* Blocks */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}
                                        onDragEnd={() => { dragFromIdx.current = null; setDragOver(null); }}>
                                        {blocks.map((blk, idx) => {
                                            const olIndex = blk.type === 'ol' ? getOlIndex(blocks, idx) : 0;
                                            const sectionNumber = getSectionNumber(blocks, idx);
                                            return (
                                                <div id={`blk-wrapper-${idx}`} key={blk.id}>
                                                    <NoteBlock blk={blk} idx={idx} t={t} dark={dark}
                                                        olIndex={olIndex} sectionNumber={sectionNumber} isSelected={selectedBlockIds.has(blk.id)}
                                                        onUpdate={ch => { updBlk(idx, ch); activeBlkIdxRef.current = idx; }}
                                                        onFocusBlock={i => activeBlkIdxRef.current = i}
                                                        onDelete={() => delBlk(idx)}
                                                        onDuplicate={() => dupBlk(idx)}
                                                        onAddAfter={type => addBlk(idx, type)}
                                                        onSlash={(r, q) => setSlash({ x: r.left, y: r.bottom + 4, idx, q })}
                                                        onSlashClose={() => setSlash(null)}
                                                        onFocusPrev={() => document.getElementById("blk-" + (idx - 1))?.focus()}
                                                        onFocusNext={() => document.getElementById("blk-" + (idx + 1))?.focus()}
                                                        onPasteHTML={(h, t) => handlePasteHTML(idx, h, t)}
                                                        isDragging={dragFromIdx.current === idx}
                                                        isDragOver={dragOver === idx}
                                                        onDragStart={(i) => { dragFromIdx.current = i; }}
                                                        onDragOver={(i) => setDragOver(i)}
                                                        onDrop={(i) => moveBlk(dragFromIdx.current, i)}
                                                        onConvert={type => {
                                                            const nb = [...blocks]; nb[idx] = { ...nb[idx], type };
                                                            if (socketRef.current?.readyState === WebSocket.OPEN) {
                                                                socketRef.current.send(JSON.stringify({ type: 'update', block: nb[idx] }));
                                                            }
                                                            setBlocks(nb);
                                                            setTimeout(() => document.getElementById("blk-" + idx)?.focus(), 30);
                                                        }}
                                                    />
                                                </div>
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
