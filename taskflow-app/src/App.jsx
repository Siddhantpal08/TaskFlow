import { useState, useEffect, useRef } from "react";
import { FONTS, THEMES, buildCustomTheme } from "./data/themes.js";
import { INIT_PAGES, mkId, mkBlock, EMOJIS } from "./data/notes.js";
import { I, IC } from "./components/ui/Icon.jsx";
import TFLogo from "./components/ui/TFLogo.jsx";
import "./styles/global.css";
import { notesApi } from "./api/notes.js";
import ThemePicker from "./components/ui/ThemePicker.jsx";

// Auth
import { useAuth } from "./context/AuthContext.jsx";
import { DataProvider } from "./context/DataContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Layout
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";

// Pages
import Dashboard from "./components/Dashboard.jsx";
import Tasks from "./components/Tasks.jsx";
import Calendar from "./components/Calendar.jsx";
import TeamPage from "./components/TeamPage.jsx";
import Friends from "./components/Friends.jsx";
import NotesPage from "./components/notes/NotesPage.jsx";
import NotesHome from "./components/notes/NotesHome.jsx";

// Overlays
import NotifPanel from "./components/NotifPanel.jsx";
import TaskDrawer from "./components/TaskDrawer.jsx";
import AssignModal from "./components/AssignModal.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";

// ── Credits Modal ────────────────────────────────────────────────────────────
function CreditsModal({ onClose }) {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
            onClick={onClose}>
            <div className="slideDown" style={{ background: "linear-gradient(145deg,#0C1420,#0F1C2E)", border: "1px solid #00E5CC33", borderRadius: 24, padding: "44px 48px", maxWidth: 480, width: "90%", textAlign: "center", boxShadow: "0 32px 80px #00000099" }}
                onClick={e => e.stopPropagation()}>
                <TFLogo size={60} showText={false} />
                <h2 style={{ margin: "20px 0 6px", fontSize: 28, fontWeight: 800, fontFamily: "'Outfit',sans-serif", background: "linear-gradient(135deg,#00E5CC,#0072FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TaskFlow</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#6A88AA", fontFamily: "'IBM Plex Mono',monospace" }}>v1.0.0-sprint · BCA Project</p>
                <div style={{ margin: "28px 0", padding: "20px", background: "rgba(0,229,204,0.06)", borderRadius: 12, border: "1px solid #00E5CC22" }}>
                    <div style={{ fontSize: 12, color: "#2E4A68", fontFamily: "'IBM Plex Mono',monospace", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Created & Owned By</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#E2EFFF", fontFamily: "'Outfit',sans-serif" }}>Siddhant Pal</div>
                    <div style={{ fontSize: 12, color: "#6A88AA", marginTop: 4 }}>All rights reserved © 2025-2026</div>
                </div>
                <p style={{ fontSize: 12, color: "#2E4A68", fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.7 }}>
                    Built with React + Vite · Node.js + Express<br />MySQL · Socket.IO · React Native
                </p>
                <button onClick={onClose} style={{ marginTop: 24, padding: "10px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#00E5CC,#0072FF)", color: "#000", fontWeight: 700, fontFamily: "'Outfit',sans-serif", fontSize: 14, cursor: "pointer" }}>Close</button>
            </div>
        </div>
    );
}

// ── Top Loader ───────────────────────────────────────────────────────────────
function TopLoader({ active, color }) {
    const [width, setWidth] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (active) {
            setVisible(true);
            setWidth(30);
            const t1 = setTimeout(() => setWidth(60), 200);
            const t2 = setTimeout(() => setWidth(85), 600);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        } else {
            setWidth(100);
            const t = setTimeout(() => { setVisible(false); setWidth(0); }, 400);
            return () => clearTimeout(t);
        }
    }, [active]);

    if (!visible) return null;
    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9998, background: "transparent" }}>
            <div style={{ height: "100%", width: width + "%", background: `linear-gradient(90deg, ${color}, ${color}88)`, transition: "width 0.4s ease", borderRadius: "0 3px 3px 0", boxShadow: `0 0 10px ${color}88` }} />
        </div>
    );
}

function MainApp() {
    // ── Theme State ──────────────────────────────────────────────────────────
    const storedTheme = (() => { try { return JSON.parse(localStorage.getItem("tf_theme") || "{}"); } catch { return {}; } })();
    const [themeKey, setThemeKey] = useState(storedTheme.key || "dark");
    const [customTheme, setCustomTheme] = useState(storedTheme.custom || null);
    const [showThemePicker, setShowThemePicker] = useState(false);

    const t = customTheme || THEMES[themeKey] || THEMES.dark;

    const applyPreset = (key) => {
        setThemeKey(key);
        setCustomTheme(null);
        setShowThemePicker(false);
        localStorage.setItem("tf_theme", JSON.stringify({ key }));
    };

    const applyCustom = (primary, secondary, base) => {
        const built = buildCustomTheme(primary, secondary, base);
        setCustomTheme(built);
        setThemeKey("custom");
        setShowThemePicker(false);
        localStorage.setItem("tf_theme", JSON.stringify({ key: "custom", custom: built }));
    };

    // ── Page State (with session persistence) ───────────────────────────────
    const [page, setPage] = useState(() => sessionStorage.getItem("tf_page") || "dashboard");
    const [notif, setNotif] = useState(false);
    const [task, setTask] = useState(null);
    const [modal, setModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [pageLoading, setPageLoading] = useState(false);

    const setPageWithPersist = (p) => {
        setPage(p);
        sessionStorage.setItem("tf_page", p);
        setPageLoading(true);
        setTimeout(() => setPageLoading(false), 600);
    };

    // ── Notes State ──────────────────────────────────────────────────────────
    const [pages, setPages] = useState({});
    const [notePageId, setNotePageId] = useState(() => sessionStorage.getItem("tf_notePageId") || null);
    const [expanded, setExpanded] = useState({ root: true });

    // Persist notePageId
    const setNotePageIdWithPersist = (id) => {
        setNotePageId(id);
        if (id) sessionStorage.setItem("tf_notePageId", id);
    };

    // ── Credits Modal ────────────────────────────────────────────────────────
    const [showCredits, setShowCredits] = useState(() => new URLSearchParams(window.location.search).has("credits"));

    useEffect(() => {
        (async () => {
            try {
                const res = await notesApi.getPages();
                const urlParams = new URLSearchParams(window.location.search);
                const sharedNoteId = urlParams.get('note');
                const roots = res.data;

                const buildPages = (roots) => {
                    const newPages = { root: { id: "root", title: "Workspace Home", emoji: "🏠", parentId: null, childIds: [], updatedAt: "Server Sync" } };
                    let firstId = null;
                    const walk = (node, parentId) => {
                        if (!firstId) firstId = node.id;
                        newPages[node.id] = { id: node.id, title: node.title, emoji: node.emoji || "📄", parentId: parentId || "root", childIds: [], updatedAt: "Server Sync" };
                        newPages[parentId || "root"].childIds.push(node.id);
                        node.children?.forEach(c => walk(c, node.id));
                    };
                    roots.forEach(r => walk(r, null));
                    return { newPages, firstId };
                };

                if (roots.length === 0 && !sharedNoteId) {
                    const initPages = async () => {
                        try {
                            const idMap = { root: null };
                            const order = ["intro", "np1", "np1a", "np1b", "np1b1", "np2", "np3"];
                            for (const oldId of order) {
                                const pg = INIT_PAGES[oldId];
                                if (!pg) continue;
                                const res = await notesApi.createPage({ title: pg.title, emoji: pg.emoji, parentId: idMap[pg.parentId] });
                                idMap[oldId] = res.data.id;
                                for (let i = 0; i < pg.blocks.length; i++) {
                                    await notesApi.createBlock(res.data.id, { type: pg.blocks[i].type, content: pg.blocks[i].content, position: i, checked: pg.blocks[i].checked });
                                }
                            }
                            const treeRes = await notesApi.getPages();
                            const { newPages, firstId } = buildPages(treeRes.data);
                            setPages(newPages);
                            const restoredNote = sessionStorage.getItem("tf_notePageId");
                            setNotePageIdWithPersist(restoredNote && newPages[restoredNote] ? restoredNote : firstId);
                        } catch (e) { console.error(e); }
                    };
                    initPages();
                } else {
                    const { newPages, firstId } = buildPages(roots);
                    if (sharedNoteId) {
                        // Fetch real title/emoji for shared note
                        let sharedTitle = "Shared Note"; let sharedEmoji = "🔗";
                        try {
                            const meta = await notesApi.getPage(sharedNoteId);
                            sharedTitle = meta.data?.title || sharedTitle;
                            sharedEmoji = meta.data?.emoji || sharedEmoji;
                        } catch { }
                        if (!newPages[sharedNoteId]) {
                            newPages[sharedNoteId] = { id: sharedNoteId, title: sharedTitle, emoji: sharedEmoji, parentId: "root", childIds: [], updatedAt: "Shared Link" };
                            newPages["root"].childIds.push(sharedNoteId);
                        } else {
                            newPages[sharedNoteId].title = sharedTitle;
                            newPages[sharedNoteId].emoji = sharedEmoji;
                        }
                        setPages(newPages);
                        setNotePageIdWithPersist(sharedNoteId);
                        setPageWithPersist("notes");
                        window.history.replaceState({}, document.title, window.location.pathname);
                    } else {
                        setPages(newPages);
                        const restoredNote = sessionStorage.getItem("tf_notePageId");
                        setNotePageIdWithPersist(restoredNote && newPages[restoredNote] ? restoredNote : firstId);
                    }
                }
            }
        } catch (e) { console.error(e); }
    })();
    }, []);

    const themeCss = `
    :root {
      color-scheme: ${themeKey.includes("light") || themeKey === "sepia" || themeKey === "pureLight" ? "light" : "dark"};
      --accent:    ${t.accent};
      --accentDim: ${t.accentDim};
      --accentGlow:${t.accentGlow};
      --border:    ${t.border};
      --t3:        ${t.t3};
      --noteHover: ${t.noteHover};
    }
    .hvr:hover  { background: ${t.accentDim} !important; }
    .hvrC:hover { transform: translateY(-2px); box-shadow: ${t.accentGlow} !important; }
    .hvrI:hover { color: ${t.accent} !important; }
    .pill:hover { border-color: ${t.accent} !important; color: ${t.accent} !important; }
    .nsi:hover  { background: ${t.noteHover} !important; }
    @keyframes skShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fadeUp { animation: fadeSlideIn 0.3s ease both; }
    `;

const [isAddingPage, setIsAddingPage] = useState(false);
const addingPageRef = useRef(false);

const addNotePage = async (parentId, meta = {}) => {
    if (addingPageRef.current) return;
    addingPageRef.current = true;
    setIsAddingPage(true);
    const title = meta.title || "Untitled";
    const emoji = meta.emoji || "📄";
    const initBlocks = meta.initBlocks || [];
    try {
        const r = await notesApi.createPage({ title, emoji, parentId: parentId === 'root' ? null : parentId });
        const id = r.data.id;
        // Create initial blocks for template pages
        for (let i = 0; i < initBlocks.length; i++) {
            const b = initBlocks[i];
            try { await notesApi.createBlock(id, { type: b.type, content: b.content || "", position: i, checked: !!b.checked }); } catch { }
        }
        setPages(prev => ({
            ...prev,
            [id]: { id, title, emoji, parentId, childIds: [], updatedAt: "Just now" },
            [parentId]: { ...prev[parentId], childIds: [...(prev[parentId]?.childIds || []), id] },
        }));
        setExpanded(prev => ({ ...prev, [parentId]: true }));
        setNotePageIdWithPersist(id);
        setPageWithPersist("notes");
        return id;
    } catch (e) {
    } finally {
        addingPageRef.current = false;
        setIsAddingPage(false);
    }
};

const deleteNotePage = async (id) => {
    const pg = pages[id];
    if (!pg || id === "root") return;
    try {
        await notesApi.deletePage(id);
        setPages(prev => {
            const next = { ...prev };
            if (pg.parentId && next[pg.parentId])
                next[pg.parentId] = { ...next[pg.parentId], childIds: next[pg.parentId].childIds.filter(c => c !== id) };
            const del = pid => { const p = next[pid]; if (!p) return; p.childIds?.forEach(del); delete next[pid]; };
            del(id);
            return next;
        });
        if (notePageId === id) setNotePageIdWithPersist(pg.parentId === "root" ? Object.keys(pages)[0] : pg.parentId);
    } catch (e) { }
};

const updateNotePage = (id, changes) => {
    setPages(prev => ({ ...prev, [id]: { ...prev[id], ...changes, updatedAt: "Just now" } }));
    notesApi.updatePage(id, changes).catch(() => { });
};

const navigateNote = id => {
    setNotePageIdWithPersist(id);
    setPageWithPersist("notes");
};

return (
    <>
        <style>{FONTS}{themeCss}</style>
        {/* Hidden watermark DOM element */}
        <div aria-hidden="true" style={{ position: "absolute", opacity: 0, pointerEvents: "none", userSelect: "none", zIndex: -1, fontSize: 0 }}>
            Created and owned by Siddhant Pal. TaskFlow v1.0. All rights reserved 2025-2026.
        </div>
        <TopLoader active={pageLoading} color={t.accent} />
        <ToastProvider t={t}>
            <div style={{ display: "flex", height: "100vh", width: "100%", background: t.bg, color: t.t1, fontFamily: t.disp, overflow: "hidden" }}
                className="app-root">

                <Sidebar t={t} page={page} setPage={setPageWithPersist}
                    pages={pages} expanded={expanded} setExpanded={setExpanded}
                    notePageId={notePageId} navigateNote={navigateNote}
                    addNotePage={addNotePage} deleteNotePage={deleteNotePage}
                    className="sidebar-desktop" />

                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
                    <Topbar t={t} themeKey={themeKey} showThemePicker={showThemePicker} setShowThemePicker={setShowThemePicker}
                        notif={notif} setNotif={setNotif} page={page} setPage={setPageWithPersist} setModal={setModal}
                        searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                    <main style={{ flex: 1, overflow: "auto" }} className="fadeUp" key={page}>
                        {page === "dashboard" && <Dashboard t={t} setPage={setPageWithPersist} setTask={setTask} />}
                        {page === "tasks" && <Tasks t={t} setTask={setTask} searchQuery={searchQuery} />}
                        {page === "notes" && notePageId && <NotesPage t={t} dark={themeKey.includes("dark") || themeKey === "midnight"} pages={pages} notePageId={notePageId}
                            navigateNote={navigateNote} updateNotePage={updateNotePage}
                            addNotePage={addNotePage} deleteNotePage={deleteNotePage}
                            searchQuery={searchQuery} />}
                        {page === "notes" && !notePageId && <NotesHome t={t} pages={pages} addNotePage={addNotePage} navigateNote={navigateNote} />}
                        {page === "calendar" && <Calendar t={t} />}
                        {page === "team" && <TeamPage t={t} />}
                        {page === "friends" && <Friends t={t} />}
                        {page === "profile" && <ProfilePage t={t} onGoBack={() => setPageWithPersist("dashboard")} />}
                    </main>
                </div>

                {notif && <NotifPanel t={t} onClose={() => setNotif(false)} />}
                {task && <TaskDrawer t={t} task={task} onClose={() => setTask(null)} />}
                {modal && <AssignModal t={t} onClose={() => setModal(false)} />}
                {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
                {showThemePicker && (
                    <ThemePicker t={t} themeKey={themeKey} customTheme={customTheme}
                        onApplyPreset={applyPreset} onApplyCustom={applyCustom}
                        onClose={() => setShowThemePicker(false)} />
                )}

                {/* Mobile bottom nav */}
                <nav className="mobile-nav">
                    {[
                        { id: "dashboard", label: "Home", icon: IC.dash },
                        { id: "tasks", label: "Tasks", icon: IC.task },
                        { id: "notes", label: "Notes", icon: IC.note },
                        { id: "calendar", label: "Cal", icon: IC.cal },
                        { id: "team", label: "Team", icon: IC.team },
                        { id: "friends", label: "Friends", icon: IC.user },
                    ].map(n => (
                        <button key={n.id} onClick={() => setPageWithPersist(n.id)}
                            className={`mobile-nav-btn${page === n.id ? ' active' : ''}`}>
                            <I d={n.icon} sz={20} c={page === n.id ? t.accent : t.t3} sw={page === n.id ? 2.2 : 1.7} />
                            <span style={{ color: page === n.id ? t.accent : t.t3 }}>{n.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </ToastProvider>
    </>
);
}

export default function App() {
    const { user, loading, login, register, logout, requestReset, verifyReset } = useAuth();
    const [authPage, setAuthPage] = useState("login");

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060B12", flexDirection: "column", gap: 16 }}>
                <div style={{ animation: "fadeSlideIn 0.5s ease both" }}>
                    <svg width="56" height="56" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ animation: "glow 1.5s ease infinite", filter: "drop-shadow(0 0 16px #00E5CC88)" }}>
                        <defs>
                            <linearGradient id="tfGradLoading" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#00E5CC" />
                                <stop offset="100%" stopColor="#0072FF" />
                            </linearGradient>
                        </defs>
                        <rect width="100" height="100" rx="24" fill="url(#tfGradLoading)" />
                        <rect x="18" y="24" width="64" height="12" rx="6" fill="white" />
                        <rect x="44" y="24" width="12" height="55" rx="6" fill="white" />
                        <rect x="44" y="50" width="32" height="10" rx="5" fill="white" />
                    </svg>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#00E5CC", opacity: 0.5, animation: "pulse 1.2s ease infinite", animationDelay: i * 0.2 + "s" }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!user) {
        if (authPage === "login") return <LoginPage onLogin={login} onGoRegister={() => setAuthPage("register")} onGoForgot={() => setAuthPage("forgot")} />;
        if (authPage === "register") return <RegisterPage onRegister={register} onGoLogin={() => setAuthPage("login")} />;
        if (authPage === "forgot") return <ForgotPasswordPage onRequest={requestReset} onVerify={verifyReset} onGoLogin={() => setAuthPage("login")} />;
    }

    return (
        <DataProvider>
            <MainApp />
        </DataProvider>
    );
}
