import { useState, useEffect } from "react";
import { FONTS, DARK, LIGHT } from "./data/themes.js";
import { INIT_PAGES, mkId, mkBlock, EMOJIS } from "./data/notes.js";
import { I, IC } from "./components/ui/Icon.jsx";
import "./styles/global.css";
import { notesApi } from "./api/notes.js";

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

// Overlays
import NotifPanel from "./components/NotifPanel.jsx";
import TaskDrawer from "./components/TaskDrawer.jsx";
import AssignModal from "./components/AssignModal.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";

function MainApp() {
    const [dark, setDark] = useState(true);
    const [page, setPage] = useState("dashboard");
    const [notif, setNotif] = useState(false);
    const [task, setTask] = useState(null);
    const [modal, setModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Notes state
    const [pages, setPages] = useState({});
    const [notePageId, setNotePageId] = useState(null);
    const [expanded, setExpanded] = useState({ root: true });

    useEffect(() => {
        notesApi.getPages().then(res => {
            const roots = res.data;
            if (roots.length === 0) {
                const initPages = async () => {
                    try {
                        const idMap = { root: null };
                        const order = ["np1", "np1a", "np1b", "np1b1", "np2", "np3"];

                        for (const oldId of order) {
                            const pg = INIT_PAGES[oldId];
                            if (!pg) continue;
                            const res = await notesApi.createPage({
                                title: pg.title, emoji: pg.emoji,
                                parentId: idMap[pg.parentId]
                            });
                            idMap[oldId] = res.data.id;
                            for (let i = 0; i < pg.blocks.length; i++) {
                                await notesApi.createBlock(res.data.id, {
                                    type: pg.blocks[i].type, content: pg.blocks[i].content,
                                    position: i, checked: pg.blocks[i].checked
                                });
                            }
                        }

                        // Force a full tree reload to ingest the server's generated structure
                        const treeRes = await notesApi.getPages();
                        const newPages = {};
                        let firstId = null;
                        const walk = (node, parentId) => {
                            if (!firstId) firstId = node.id;
                            newPages[node.id] = {
                                id: node.id, title: node.title, emoji: node.emoji || "📄",
                                parentId: parentId || "root", childIds: node.children?.map(c => c.id) || [],
                                updatedAt: "Server Sync"
                            };
                            node.children?.forEach(c => walk(c, node.id));
                        };
                        treeRes.data.forEach(r => walk(r, null));
                        setPages(newPages);
                        setNotePageId(firstId);
                    } catch (e) { console.error(e); }
                };
                initPages();
            } else {
                const newPages = {};
                let firstId = null;
                const walk = (node, parentId) => {
                    if (!firstId) firstId = node.id;
                    newPages[node.id] = {
                        id: node.id, title: node.title, emoji: node.emoji || "📄",
                        parentId: parentId || "root", childIds: node.children?.map(c => c.id) || [],
                        updatedAt: "Server Sync"
                    };
                    node.children?.forEach(c => walk(c, node.id));
                };
                roots.forEach(r => walk(r, null));
                setPages(newPages);
                setNotePageId(firstId);
            }
        }).catch(e => console.error(e));
    }, []);

    const t = dark ? DARK : LIGHT;

    const themeCss = `
    :root {
      color-scheme: ${dark ? 'dark' : 'light'};
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
  `;

    const addNotePage = async (parentId) => {
        try {
            const r = await notesApi.createPage({ title: "Untitled", emoji: "📄", parentId: parentId === 'root' ? null : parentId });
            const id = r.data.id;
            setPages(prev => ({
                ...prev,
                [id]: { id, title: "Untitled", emoji: "📄", parentId, childIds: [], updatedAt: "Just now" },
                [parentId]: { ...prev[parentId], childIds: [...(prev[parentId]?.childIds || []), id] },
            }));
            setExpanded(prev => ({ ...prev, [parentId]: true }));
            setNotePageId(id);
            setPage("notes");
        } catch (e) { }
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
            if (notePageId === id) setNotePageId(pg.parentId === "root" ? Object.keys(pages)[0] : pg.parentId);
        } catch (e) { }
    };

    const updateNotePage = (id, changes) => {
        setPages(prev => ({ ...prev, [id]: { ...prev[id], ...changes, updatedAt: "Just now" } }));
        notesApi.updatePage(id, changes).catch(() => { });
    };

    const navigateNote = id => { setNotePageId(id); setPage("notes"); };

    return (
        <>
            <style>{FONTS}{themeCss}</style>
            <ToastProvider t={t}>
                <div style={{ display: "flex", height: "100vh", width: "100%", background: t.bg, color: t.t1, fontFamily: t.disp, overflow: "hidden" }}
                    className="app-root">

                    <Sidebar t={t} page={page} setPage={setPage}
                        pages={pages} expanded={expanded} setExpanded={setExpanded}
                        notePageId={notePageId} navigateNote={navigateNote}
                        addNotePage={addNotePage} deleteNotePage={deleteNotePage}
                        className="sidebar-desktop" />

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
                        <Topbar t={t} dark={dark} setDark={setDark} notif={notif}
                            setNotif={setNotif} page={page} setPage={setPage} setModal={setModal}
                            searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                        <main style={{ flex: 1, overflow: "auto" }} className="fadeUp" key={page}>
                            {page === "dashboard" && <Dashboard t={t} setPage={setPage} setTask={setTask} />}
                            {page === "tasks" && <Tasks t={t} setTask={setTask} searchQuery={searchQuery} />}
                            {page === "notes" && <NotesPage t={t} dark={dark} pages={pages} notePageId={notePageId}
                                navigateNote={navigateNote} updateNotePage={updateNotePage}
                                addNotePage={addNotePage} deleteNotePage={deleteNotePage}
                                searchQuery={searchQuery} />}
                            {page === "calendar" && <Calendar t={t} />}
                            {page === "team" && <TeamPage t={t} />}
                            {page === "friends" && <Friends t={t} />}
                            {page === "profile" && <ProfilePage t={t} onGoBack={() => setPage("dashboard")} />}
                        </main>
                    </div>

                    {notif && <NotifPanel t={t} onClose={() => setNotif(false)} />}
                    {task && <TaskDrawer t={t} task={task} onClose={() => setTask(null)} />}
                    {modal && <AssignModal t={t} onClose={() => setModal(false)} />}

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
                            <button key={n.id} onClick={() => setPage(n.id)}
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
    const [authPage, setAuthPage] = useState("login"); // "login" | "register" | "forgot"

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                background: "#060B12",
            }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "linear-gradient(135deg, #00E5CC, #00E5CC88)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 900, color: "#060B12",
                    animation: "glow 1.5s ease infinite",
                }}>T</div>
            </div>
        );
    }

    if (!user) {
        if (authPage === "login") return (
            <LoginPage
                onLogin={login}
                onGoRegister={() => setAuthPage("register")}
                onGoForgot={() => setAuthPage("forgot")}
            />
        );
        if (authPage === "register") return (
            <RegisterPage
                onRegister={register}
                onGoLogin={() => setAuthPage("login")}
            />
        );
        if (authPage === "forgot") return (
            <ForgotPasswordPage
                onRequest={requestReset}
                onVerify={verifyReset}
                onGoLogin={() => setAuthPage("login")}
            />
        );
    }

    return (
        <DataProvider>
            <MainApp />
        </DataProvider>
    );
}
