import { useState, useEffect, useRef } from "react";
import { I, IC } from "./ui/Icon.jsx";

export default function CommandPalette({ t, setPage, open, setOpen, pages, navigateNote }) {
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        if (listRef.current && listRef.current.children[selectedIndex]) {
            listRef.current.children[selectedIndex].scrollIntoView({ block: "nearest" });
        }
    }, [selectedIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setOpen(p => !p);
            }
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [setOpen]);

    useEffect(() => {
        if (open) {
            setSearch("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    if (!open) return null;

    const navItems = [
        { label: "Go to Dashboard", action: () => setPage("dashboard"), icon: "🏠" },
        { label: "Go to Tasks", action: () => setPage("tasks"), icon: "✅" },
        { label: "Go to Calendar", action: () => setPage("calendar"), icon: "📅" },
        { label: "Go to Notes", action: () => setPage("notes"), icon: "📝" },
        { label: "Go to Team", action: () => setPage("team"), icon: "👥" },
        { label: "Help & Guide", action: () => setPage("guide"), icon: "📖" },
        { label: "Customize Theme", action: () => setPage("customize"), icon: "🎨" },
    ];

    const noteItems = Object.values(pages || {}).filter(p => p.id !== "root").map(p => ({
        label: `Note: ${p.title || "Untitled"}`,
        action: () => { setPage("notes"); setTimeout(() => navigateNote(p.id), 50); },
        icon: p.emoji || "📄"
    }));

    const allItems = [...navItems, ...noteItems];
    const filtered = allItems.filter(item => item.label.toLowerCase().includes(search.toLowerCase()));

    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filtered[selectedIndex]) {
                filtered[selectedIndex].action();
                setOpen(false);
            }
        }
    };

    return (
        <div onClick={() => setOpen(false)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999,
            display: "flex", justifyContent: "center", paddingTop: "15vh", backdropFilter: "blur(12px)"
        }}>
            <div className="fadeUp" onClick={e => e.stopPropagation()} style={{
                background: t.card, border: `1px solid ${t.border}`, borderRadius: 16,
                width: 550, maxWidth: "90vw", maxHeight: "65vh", display: "flex", flexDirection: "column",
                boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${t.accent}22`, overflow: "hidden"
            }}>
                <div style={{ padding: "18px 22px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 12, background: t.inset }}>
                    <I d={IC.srch} sz={20} c={t.accent} />
                    <input
                        ref={inputRef}
                        value={search}
                        onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
                        onKeyDown={handleKeyDown}
                        placeholder="What do you want to do?"
                        style={{
                            flex: 1, background: "transparent", border: "none", color: t.t1,
                            fontSize: 18, fontWeight: 500, outline: "none", fontFamily: t.disp
                        }}
                    />
                    <kbd style={{ background: t.card, border: `1px solid ${t.border}`, padding: "4px 8px", borderRadius: 6, fontSize: 11, color: t.t3, fontFamily: t.mono, fontWeight: 600 }}>ESC</kbd>
                </div>
                <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                    {filtered.length === 0 ? (
                        <div style={{ padding: "40px 20px", textAlign: "center", color: t.t3, fontSize: 14, fontFamily: t.disp }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                            No matching commands found.
                        </div>
                    ) : (
                        filtered.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => { item.action(); setOpen(false); }}
                                onMouseEnter={() => setSelectedIndex(i)}
                                style={{
                                    padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    background: selectedIndex === i ? t.accentDim : "transparent",
                                    color: selectedIndex === i ? t.accent : t.t1,
                                    transition: "all .15s", marginBottom: 4,
                                    border: `1px solid ${selectedIndex === i ? t.accent + '44' : 'transparent'}`
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <span style={{ fontSize: 20, width: 28, textAlign: "center", filter: selectedIndex === i ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none', transition: "all .2s", transform: selectedIndex === i ? 'scale(1.1)' : 'scale(1)' }}>{item.icon}</span>
                                    <span style={{ fontSize: 14, fontWeight: selectedIndex === i ? 600 : 500, fontFamily: t.disp }}>{item.label}</span>
                                </div>
                                {selectedIndex === i && (
                                    <span style={{ fontSize: 12, fontWeight: 700, color: t.accent, letterSpacing: '0.5px', fontFamily: t.mono }}>↵ JUMP</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <div style={{ padding: "12px 18px", background: t.inset, borderTop: `1px solid ${t.border}`, fontSize: 11, color: t.t3, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: t.mono }}>
                    <div style={{ display: "flex", gap: 12 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><kbd style={{ background: t.card, padding: "2px 6px", borderRadius: 4, border: `1px solid ${t.border}` }}>↑</kbd> <kbd style={{ background: t.card, padding: "2px 6px", borderRadius: 4, border: `1px solid ${t.border}` }}>↓</kbd> Navigate</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><kbd style={{ background: t.card, padding: "2px 6px", borderRadius: 4, border: `1px solid ${t.border}` }}>↵</kbd> Select</span>
                    </div>
                    <span style={{ fontWeight: 600, color: t.t2, letterSpacing: '0.5px' }}>COMMAND PALETTE</span>
                </div>
            </div>
        </div>
    );
}
