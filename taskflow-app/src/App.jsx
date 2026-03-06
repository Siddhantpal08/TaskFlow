import { useState } from "react";
import { FONTS, DARK, LIGHT } from "./data/themes.js";
import { INIT_PAGES, mkId, mkBlock, EMOJIS } from "./data/notes.js";
import "./styles/global.css";

// Auth
import { useAuth } from "./context/AuthContext.jsx";
import { DataProvider } from "./context/DataContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";

// Layout
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";

// Pages
import Dashboard from "./components/Dashboard.jsx";
import Tasks from "./components/Tasks.jsx";
import Calendar from "./components/Calendar.jsx";
import Team from "./components/Team.jsx";
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

    // Notes state
    const [pages, setPages] = useState(INIT_PAGES);
    const [notePageId, setNotePageId] = useState("np1");
    const [expanded, setExpanded] = useState({ root: true, np1: true });

    const t = dark ? DARK : LIGHT;

    const themeCss = `
    :root {
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

    const addNotePage = parentId => {
        const id = mkId();
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        setPages(prev => ({
            ...prev,
            [id]: { id, title: "Untitled", emoji, parentId, childIds: [], blocks: [mkBlock("h1", "Untitled"), mkBlock("p", "")], updatedAt: "Just now" },
            [parentId]: { ...prev[parentId], childIds: [...(prev[parentId].childIds || []), id] },
        }));
        setExpanded(prev => ({ ...prev, [parentId]: true }));
        setNotePageId(id);
        setPage("notes");
    };

    const deleteNotePage = id => {
        const pg = pages[id];
        if (!pg || id === "root") return;
        setPages(prev => {
            const next = { ...prev };
            if (pg.parentId && next[pg.parentId])
                next[pg.parentId] = { ...next[pg.parentId], childIds: next[pg.parentId].childIds.filter(c => c !== id) };
            const del = pid => { const p = next[pid]; if (!p) return; p.childIds?.forEach(del); delete next[pid]; };
            del(id);
            return next;
        });
        if (notePageId === id) setNotePageId(pg.parentId === "root" ? "np1" : pg.parentId);
    };

    const updateNotePage = (id, changes) =>
        setPages(prev => ({ ...prev, [id]: { ...prev[id], ...changes, updatedAt: "Just now" } }));

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
                        addNotePage={addNotePage} deleteNotePage={deleteNotePage} />

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
                        <Topbar t={t} dark={dark} setDark={setDark} notif={notif}
                            setNotif={setNotif} page={page} setModal={setModal} />
                        <main style={{ flex: 1, overflow: "auto" }} className="fadeUp" key={page}>
                            {page === "dashboard" && <Dashboard t={t} setPage={setPage} setTask={setTask} />}
                            {page === "tasks" && <Tasks t={t} setTask={setTask} />}
                            {page === "notes" && <NotesPage t={t} dark={dark} pages={pages} notePageId={notePageId}
                                navigateNote={navigateNote} updateNotePage={updateNotePage}
                                addNotePage={addNotePage} deleteNotePage={deleteNotePage} />}
                            {page === "calendar" && <Calendar t={t} />}
                            {page === "team" && <Team t={t} />}
                        </main>
                    </div>

                    {notif && <NotifPanel t={t} onClose={() => setNotif(false)} />}
                    {task && <TaskDrawer t={t} task={task} onClose={() => setTask(null)} />}
                    {modal && <AssignModal t={t} onClose={() => setModal(false)} />}
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
