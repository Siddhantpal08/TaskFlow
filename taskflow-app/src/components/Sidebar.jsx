import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { USERS } from "../data/data.js";
import NoteTreeItem from "./NoteTreeItem.jsx";

export default function Sidebar({ t, page, setPage, pages, expanded, setExpanded,
    notePageId, navigateNote, addNotePage, deleteNotePage }) {

    const nav = [
        { id: "dashboard", label: "Dashboard", ic: IC.dash },
        { id: "tasks", label: "Tasks", ic: IC.task },
        { id: "calendar", label: "Calendar", ic: IC.cal },
        { id: "team", label: "Team", ic: IC.team },
    ];
    const rootPage = pages["root"];
    const toggleExp = (id, e) => { e.stopPropagation(); setExpanded(p => ({ ...p, [id]: !p[id] })); };

    return (
        <div style={{
            width: 220, background: t.nav, borderRight: `1px solid ${t.border}`,
            display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden"
        }}>
            {/* Logo */}
            <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: `linear-gradient(135deg,${t.accent},#009688)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: t.accentGlow
                    }}>
                        <I d={IC.lnk} sz={15} c="#000" sw={2.4} />
                    </div>
                    <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.5px", color: t.t1 }}>
                        Task<span style={{ color: t.accent }}>Flow</span>
                    </span>
                </div>
                {/* Main nav */}
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {nav.map(n => {
                        const a = page === n.id;
                        return (
                            <button key={n.id} onClick={() => setPage(n.id)} className="pill"
                                style={{
                                    display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                                    borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left",
                                    fontFamily: t.disp, fontSize: 13, fontWeight: a ? 600 : 400,
                                    background: a ? t.accentDim : "transparent", color: a ? t.accent : t.t2,
                                    borderLeft: `2px solid ${a ? t.accent : "transparent"}`, transition: "all .15s"
                                }}>
                                <I d={n.ic} sz={14} c={a ? t.accent : t.t3} sw={a ? 2.2 : 1.8} />{n.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Notes tree */}
            <div style={{ flex: 1, overflow: "auto", padding: "10px 8px" }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "4px 8px", marginBottom: 4
                }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: t.t3, textTransform: "uppercase", letterSpacing: "0.7px" }}>Notes</span>
                    <button onClick={() => addNotePage("root")} title="New page"
                        style={{
                            width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                            border: "none", background: "transparent", cursor: "pointer", color: t.t3,
                            borderRadius: 4, transition: "all .15s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = t.accent}
                        onMouseLeave={e => e.currentTarget.style.color = t.t3}>
                        <I d={IC.plus} sz={13} c="currentColor" />
                    </button>
                </div>
                {rootPage?.childIds?.map(id => (
                    <NoteTreeItem key={id} pageId={id} pages={pages} expanded={expanded}
                        toggleExp={toggleExp} activeId={notePageId} isNotePage={page === "notes"}
                        navigateNote={navigateNote} addNotePage={addNotePage}
                        deleteNotePage={deleteNotePage} depth={0} t={t} />
                ))}
            </div>

            {/* User */}
            <div style={{ padding: "10px 12px", borderTop: `1px solid ${t.border}` }}>
                <div style={{
                    padding: "8px", borderRadius: 9, background: t.card,
                    border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 9
                }}>
                    <Av u={USERS[0]} sz={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: t.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Siddhant Pal</div>
                        <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono }}>BCA VI</div>
                    </div>
                    <I d={IC.out} sz={13} c={t.t3} />
                </div>
            </div>
        </div>
    );
}
