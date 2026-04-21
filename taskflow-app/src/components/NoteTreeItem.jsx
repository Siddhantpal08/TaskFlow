import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { I, IC } from "./ui/Icon.jsx";

export default function NoteTreeItem({ pageId, pages, expanded, toggleExp, activeId, isNotePage,
    navigateNote, addNotePage, deleteNotePage, duplicateNotePage, depth, t }) {

    const pg = pages[pageId];
    if (!pg) return null;
    const isActive = isNotePage && activeId === pageId;
    const isExp = expanded[pageId];
    const hasKids = pg.childIds?.length > 0;

    const [cmPos, setCmPos] = useState(null);

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCmPos({ x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        const handleClick = () => setCmPos(null);
        if (cmPos) window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [cmPos]);

    return (
        <div>
            <div className="nsi"
                onContextMenu={handleContextMenu}
                style={{
                    display: "flex", alignItems: "center", borderRadius: 7,
                    cursor: "pointer", background: isActive ? t.noteActive : "transparent",
                    marginBottom: 1, transition: "background .12s", paddingLeft: depth * 14
                }}>
                <button onClick={e => toggleExp(pageId, e)}
                    style={{
                        width: 18, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
                        border: "none", background: "transparent", cursor: "pointer", color: t.t3,
                        flexShrink: 0, opacity: hasKids ? 1 : 0, pointerEvents: hasKids ? "auto" : "none"
                    }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        style={{ transform: isExp ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .15s" }}>
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5, padding: "4px 4px 4px 2px", minWidth: 0 }}
                    onClick={() => navigateNote(pageId)}>
                    <span style={{ fontSize: 13, flexShrink: 0 }}>{pg.emoji || "📄"}</span>
                    <span style={{
                        fontSize: 12.5, color: isActive ? t.accent : t.t2, fontWeight: isActive ? 600 : 400,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1
                    }}>{pg.title || "Untitled"}</span>
                </div>
                <div className="nsa" style={{ display: "flex", opacity: 0, transition: "opacity .15s", gap: 1, paddingRight: 4, flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); addNotePage(pageId); }}
                        style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 4, color: t.t3 }}
                        onMouseEnter={e => e.currentTarget.style.background = t.border}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <I d={IC.plus} sz={11} c="currentColor" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteNotePage(pageId); }}
                        style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", borderRadius: 4, color: t.t3 }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#FF3D5A22"; e.currentTarget.style.color = t.red; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.t3; }}>
                        <I d={IC.trash} sz={11} c="currentColor" />
                    </button>
                </div>
            </div>
            {isExp && hasKids && pg.childIds.map(cid => (
                <NoteTreeItem key={cid} pageId={cid} pages={pages} expanded={expanded}
                    toggleExp={toggleExp} activeId={activeId} isNotePage={isNotePage}
                    navigateNote={navigateNote} addNotePage={addNotePage}
                    deleteNotePage={deleteNotePage} duplicateNotePage={duplicateNotePage} depth={depth + 1} t={t} />
            ))}

            {cmPos && createPortal(
                <div style={{
                    position: "fixed", top: cmPos.y, left: cmPos.x, zIndex: 9999,
                    background: t.card, border: `1px solid ${t.border}`, borderRadius: 8,
                    padding: "4px", display: "flex", flexDirection: "column", gap: 2,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)", minWidth: 160
                }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => { duplicateNotePage(pageId); setCmPos(null); }}
                        style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                            borderRadius: 6, border: "none", background: "transparent",
                            color: t.t1, fontSize: 13, fontFamily: t.disp, cursor: "pointer", textAlign: "left"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = t.accentDim}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        📑 Duplicate Page
                    </button>
                    {depth > 0 && (
                        <button onClick={() => { deleteNotePage(pageId); setCmPos(null); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                                borderRadius: 6, border: "none", background: "transparent",
                                color: "#FF3D5A", fontSize: 13, fontFamily: t.disp, cursor: "pointer", textAlign: "left"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#FF3D5A22"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            🗑️ Delete Page
                        </button>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}
