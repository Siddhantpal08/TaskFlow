import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import NoteTreeItem from "./NoteTreeItem.jsx";
import TFLogo from "./ui/TFLogo.jsx";
import { PlanBadge } from "./ui/UpgradeModal.jsx";
import ConfirmModal from "./ui/ConfirmModal.jsx";

// ── Tooltip wrapper for collapsed icons ─────────────────────────────────────
function Tip({ label, disabled, children }) {
    const [show, setShow] = useState(false);
    return (
        <div style={{ position: "relative", display: "flex", width: "100%" }}
            onMouseEnter={() => !disabled && setShow(true)} onMouseLeave={() => setShow(false)}>
            {children}
            {show && !disabled && (
                <div style={{
                    position: "absolute", left: "calc(100% + 10px)", top: "50%", transform: "translateY(-50%)",
                    background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                    padding: "5px 10px", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--t1)",
                    whiteSpace: "nowrap", zIndex: 999, pointerEvents: "none",
                    boxShadow: "var(--shadow)",
                }}>
                    {label}
                </div>
            )}
        </div>
    );
}

export default function Sidebar({ t, page, setPage, pages, expanded, setExpanded,
    notePageId, navigateNote, addNotePage, deleteNotePage, duplicateNotePage, reorderNotePage, updateNotePage, onUpgrade, user: userProp, className }) {
    const { user: authUser, logout } = useAuth();
    const user = userProp || authUser;

    // ── Collapse state — persisted in localStorage ───────────────────────────
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem("tf_sidebar_pinned");
        return saved === null ? true : saved === "collapsed";
    });
    const [hovered, setHovered] = useState(false);
    const [noteSearch, setNoteSearch] = useState("");
    const [showNotes, setShowNotes] = useState(true);
    const [pageToDelete, setPageToDelete] = useState(null);

    const pinCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem("tf_sidebar_pinned", next ? "collapsed" : "expanded");
    };

    const isOpen = !collapsed || hovered; // show expanded if hovered OR pinned open
    const W = isOpen ? 240 : 64;

    // Primary nav items
    const nav = [
        { id: "dashboard", label: "Dashboard", ic: IC.dash },
        { id: "tasks",     label: "Tasks",     ic: IC.task },
        { id: "calendar",  label: "Calendar",  ic: IC.cal  },
        { id: "notes",     label: "Notes",     ic: IC.note },
        { id: "team",      label: "Team",      ic: IC.team },
    ];

    const bottomNav = [
        { id: "feedback",  label: "Feedback",  ic: IC.star  },
        { id: "customize", label: "Customize", ic: IC.pal   },
        ...(user?.role === 'admin' ? [{ id: "admin", label: "Admin", ic: IC.edt }] : []),
    ];

    const NavBtn = ({ n, bottom = false }) => {
        const a = page === n.id;
        return (
            <Tip label={n.label} disabled={isOpen}>
                <button key={n.id} onClick={() => setPage(n.id)}
                    style={{
                        display: "flex", alignItems: "center",
                        gap: 10, justifyContent: "flex-start",
                        padding: "10px 12px",
                        width: "100%",
                        borderRadius: 9, border: "none", cursor: "pointer", textAlign: "left",
                        fontFamily: t.disp, fontSize: 13.5, fontWeight: a ? 700 : 400,
                        background: a ? t.accentDim : "transparent",
                        color: a ? t.accent : t.t2,
                        borderLeft: `3px solid ${a ? t.accent : "transparent"}`,
                        transition: "background 0.15s, color 0.15s, border-left 0.15s",
                        overflow: "hidden"
                    }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 20, flexShrink: 0 }}>
                        <I d={n.ic} sz={17} c={a ? t.accent : t.t3} sw={a ? 2.2 : 1.8} />
                    </div>
                    <span style={{ 
                        transition: "opacity 0.2s ease, max-width 0.22s ease", 
                        opacity: isOpen ? 1 : 0,
                        maxWidth: isOpen ? 150 : 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        display: "inline-block"
                    }}>
                        {n.label}
                    </span>
                </button>
            </Tip>
        );
    };

    const rootPage = pages["root"];

    return (
        <div className={className}
            style={{
                width: W, background: t.nav, borderRight: `1px solid ${t.border}`,
                display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
                position: "relative", transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
            }}
            onMouseEnter={() => collapsed && setHovered(true)}
            onMouseLeave={() => collapsed && setHovered(false)}
        >
            {/* ── Header ── */}
            <div style={{ padding: isOpen ? "16px 14px 12px" : "16px 0 12px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: isOpen ? "space-between" : "center" }}>
                {isOpen ? (
                    <div onClick={() => setPage("dashboard")} style={{ cursor: "pointer", opacity: 1, transition: "opacity .15s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        <TFLogo size={28} showText={true} textColor={t.t1} />
                    </div>
                ) : (
                    <Tip label="TaskFlow">
                        <div onClick={() => setPage("dashboard")} style={{ cursor: "pointer" }}>
                            <TFLogo size={28} showText={false} />
                        </div>
                    </Tip>
                )}
                {/* Pin/collapse toggle */}
                {isOpen && (
                    <button onClick={pinCollapsed} title={collapsed ? "Pin sidebar open" : "Collapse sidebar"}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 5, color: t.t3, transition: "color .15s" }}
                        onMouseEnter={e => e.currentTarget.style.color = t.accent}
                        onMouseLeave={e => e.currentTarget.style.color = t.t3}>
                        <I d={collapsed ? IC.arr : IC.x} sz={13} c="currentColor" />
                    </button>
                )}
            </div>

            {/* ── Primary Nav ── */}
            <div style={{ padding: isOpen ? "10px 10px 4px" : "10px 0 4px", display: "flex", flexDirection: "column", gap: 2 }}>
                {nav.map(n => <NavBtn key={n.id} n={n} />)}
            </div>

            {/* ── Notes Tree (only when expanded + notes visible) ── */}
            {isOpen && (
                <div style={{ flex: 1, overflow: "auto", padding: "4px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                    {/* Notes section header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px", marginBottom: 2 }}>
                        <span onClick={() => setShowNotes(p => !p)}
                            style={{ fontSize: 9.5, fontWeight: 700, color: t.t3, textTransform: "uppercase", letterSpacing: "0.7px", cursor: "pointer", userSelect: "none" }}>
                            {showNotes ? "▾" : "▸"} Pages
                        </span>
                        <button onClick={() => addNotePage("root")} title="New page"
                            style={{
                                width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
                                border: `1px solid ${t.border}`, background: t.accentDim, cursor: "pointer",
                                borderRadius: 4, color: t.accent,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = "#000"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = t.accentDim; e.currentTarget.style.color = t.accent; }}>
                            <I d={IC.plus} sz={12} c="currentColor" />
                        </button>
                    </div>

                    {showNotes && (
                        <>
                            {/* Search */}
                            <div style={{ padding: "0 2px 4px", position: "relative" }}>
                                <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", marginTop: -2, pointerEvents: "none" }}>
                                    <I d={IC.srch} sz={11} c={t.t3} />
                                </div>
                                <input value={noteSearch} onChange={e => setNoteSearch(e.target.value)}
                                    placeholder="Search pages…"
                                    style={{ width: "100%", boxSizing: "border-box", padding: "5px 8px 5px 26px", borderRadius: 6, border: `1px solid ${t.border}`, background: t.inset, color: t.t1, fontSize: 11, fontFamily: t.disp, outline: "none" }} />
                            </div>

                            {/* Tree */}
                            {noteSearch ? (
                                Object.values(pages).filter(p => p.id !== "root" && p.title?.toLowerCase().includes(noteSearch.toLowerCase())).length === 0
                                    ? <div style={{ fontSize: 11, color: t.t3, padding: "4px 8px" }}>No pages found</div>
                                    : Object.values(pages)
                                        .filter(p => p.id !== "root" && p.title?.toLowerCase().includes(noteSearch.toLowerCase()))
                                        .map(p => (
                                            <div key={p.id} onClick={() => { navigateNote(p.id); setNoteSearch(""); }} className="nsi"
                                                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 5, cursor: "pointer" }}>
                                                <span style={{ fontSize: 13 }}>{p.emoji || "📄"}</span>
                                                <span style={{ fontSize: 11.5, color: t.t1, fontWeight: notePageId === p.id ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title || "Untitled"}</span>
                                            </div>
                                        ))
                            ) : rootPage?.childIds?.map(id => (
                                <NoteTreeItem key={id} pageId={id} parentId="root" pages={pages} expanded={expanded}
                                    toggleExp={(i, e) => { e.stopPropagation(); setExpanded(p => ({ ...p, [i]: !p[i] })); }}
                                    activeId={notePageId} isNotePage={page === "notes"}
                                    navigateNote={navigateNote} addNotePage={addNotePage}
                                    deleteNotePage={id => setPageToDelete(id)} duplicateNotePage={duplicateNotePage}
                                    reorderNotePage={reorderNotePage} updateNotePage={updateNotePage} depth={0} t={t} />
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* ── Spacer when collapsed ── */}
            {!isOpen && <div style={{ flex: 1 }} />}

            {/* ── Bottom Nav ── */}
            <div style={{ padding: isOpen ? "4px 10px 6px" : "4px 0 6px", borderTop: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 2 }}>
                {isOpen && (
                    <div style={{ padding: "6px 10px 4px" }}>
                        <PlanBadge
                            t={t}
                            userPlan={user?.plan}
                            onClick={user?.plan && user.plan !== 'free' ? undefined : onUpgrade}
                        />
                    </div>
                )}

                {bottomNav.map(n => <NavBtn key={n.id} n={n} bottom />)}
            </div>

            {/* ── User Row ── */}
            <div style={{ padding: isOpen ? "8px 12px 10px" : "8px 0 10px", borderTop: `1px solid ${t.border}` }}>
                {isOpen ? (
                    <div onClick={() => setPage("profile")}
                        style={{ padding: "7px 8px", borderRadius: 9, background: t.card, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 9, cursor: "pointer", transition: "border-color .15s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = t.accent + "66"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: user?.avatar_url ? `url(${user.avatar_url}) center/cover` : `linear-gradient(135deg, ${t.accent}40, #0072FF40)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: t.accent, border: `1.5px solid ${t.accent}44`, backgroundSize: "cover", backgroundPosition: "center" }}>
                            {!user?.avatar_url && (user?.avatar_initials || "?")}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: t.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "User"}</div>
                            <div style={{ fontSize: 9.5, color: t.t3, fontFamily: t.mono, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email || ""}</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); logout(); }} aria-label="Sign out" title="Logout"
                            className="logout-btn"
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 5, color: t.t3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "color .15s" }}>
                            <I d={IC.out} sz={15} c="currentColor" />
                        </button>
                    </div>
                ) : (
                    <Tip label={user?.name || "Profile"}>
                        <div onClick={() => setPage("profile")} style={{ display: "flex", justifyContent: "center", padding: "4px 0", width: "100%", cursor: "pointer" }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: user?.avatar_url ? `url(${user.avatar_url}) center/cover` : `linear-gradient(135deg, ${t.accent}40, #0072FF40)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: t.accent, border: `1.5px solid ${t.accent}44`, backgroundSize: "cover", backgroundPosition: "center" }}>
                                {!user?.avatar_url && (user?.avatar_initials || "?")}
                            </div>
                        </div>
                    </Tip>
                )}
            </div>

            {pageToDelete && (
                <ConfirmModal
                    t={t}
                    title="Delete Note?"
                    description={<>Are you sure you want to delete <span style={{ color: t.accent }}>"{pages[pageToDelete]?.title || "Untitled"}"</span>? All sub-notes will also be deleted.</>}
                    confirmText="Delete"
                    onConfirm={() => {
                        deleteNotePage(pageToDelete);
                        setPageToDelete(null);
                    }}
                    onCancel={() => setPageToDelete(null)}
                    danger={true}
                    icon="🗑️"
                />
            )}
        </div>
    );
}
