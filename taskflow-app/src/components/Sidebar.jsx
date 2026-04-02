import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import NoteTreeItem from "./NoteTreeItem.jsx";

export default function Sidebar({ t, page, setPage, pages, expanded, setExpanded,
    notePageId, navigateNote, addNotePage, deleteNotePage, className }) {
    const { user, logout } = useAuth();
    const [width, setWidth] = useState(230);

    const handleMouseDown = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startW = width;
        const onMouseMove = (ev) => setWidth(Math.max(200, Math.min(ev.clientX - startX + startW, 450)));
        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    const nav = [
        { id: "dashboard", label: "Dashboard", ic: IC.dash },
        { id: "tasks", label: "Tasks", ic: IC.task },
        { id: "calendar", label: "Calendar", ic: IC.cal },
        { id: "team", label: "Team", ic: IC.team },
        { id: "friends", label: "Friends", ic: IC.user },
    ];
    const rootPage = pages["root"];
    const toggleExp = (id, e) => { e.stopPropagation(); setExpanded(p => ({ ...p, [id]: !p[id] })); };

    return (
        <div className={className} style={{
            width, background: t.nav, borderRight: `1px solid ${t.border}`,
            display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden", position: "relative"
        }}>
            {/* Resizer Handle */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    position: "absolute", right: 0, top: 0, bottom: 0, width: 4, cursor: "col-resize", zIndex: 10
                }}
                onMouseEnter={e => e.currentTarget.style.background = t.accent + "44"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            />

            {/* Logo — clickable → Dashboard */}
            <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${t.border}` }}>
                <div onClick={() => setPage("dashboard")}
                    style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16, cursor: "pointer" }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                        background: `linear-gradient(135deg,${t.accent},#009688)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: t.accentGlow
                    }}>
                        <I d={IC.lnk} sz={16} c="#000" sw={2.4} />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px", color: t.t1 }}>
                        Task<span style={{ color: t.accent }}>Flow</span>
                    </span>
                </div>
                {/* Main nav */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {nav.map(n => {
                        const a = page === n.id;
                        return (
                            <button key={n.id} onClick={() => setPage(n.id)} className="pill"
                                style={{
                                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                                    borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left",
                                    fontFamily: t.disp, fontSize: 14, fontWeight: a ? 600 : 400,
                                    background: a ? t.accentDim : "transparent", color: a ? t.accent : t.t2,
                                    borderLeft: `2px solid ${a ? t.accent : "transparent"}`, transition: "all .15s"
                                }}>
                                <I d={n.ic} sz={16} c={a ? t.accent : t.t3} sw={a ? 2.2 : 1.8} />{n.label}
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
                            width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                            border: `1px solid ${t.border}`, background: t.accentDim, cursor: "pointer",
                            borderRadius: 5, transition: "all .15s", color: t.accent,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = "#000"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = t.accentDim; e.currentTarget.style.color = t.accent; }}>
                        <I d={IC.plus} sz={14} c="currentColor" />
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
                <div
                    onClick={() => setPage("profile")}
                    style={{
                        padding: "8px", borderRadius: 9, background: t.card,
                        border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 9,
                        cursor: "pointer", transition: "border-color .15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = t.accent + "66"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
                >
                    <div style={{
                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                        background: `linear-gradient(135deg, ${t.accent}40, ${t.purple || '#B083FF'}40)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, color: t.accent,
                        border: `1.5px solid ${t.accent}44`
                    }}>{user?.avatar_initials || "?"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: t.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "User"}</div>
                        <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email || ""}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); logout(); }}
                        title="Logout"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 5, color: t.t3, fontSize: 16, flexShrink: 0, transition: "color .15s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#FF3D5A"}
                        onMouseLeave={e => e.currentTarget.style.color = t.t3}>⏻</button>
                </div>
            </div>
        </div>
    );
}
