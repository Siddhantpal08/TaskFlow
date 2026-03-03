import { useState } from "react";
import { FONTS, DARK, LIGHT } from "./data/themes.js";
import { INIT_PAGES, mkId, mkBlock, EMOJIS } from "./data/notes.js";
import "./styles/global.css";

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

export default function App() {
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

    // Dynamic theme CSS vars (used by global.css utility classes)
    const themeCss = `
    :root {
      --accent:    ${t.accent};
      --accentDim: ${t.accentDim};
      --accentGlow:${t.accentGlow};
      --border:    ${t.border};
      --t3:        ${t.t3};
      --noteHover: ${t.noteHover};
    }
    /* Theme-sensitive hover overrides */
    .hvr:hover  { background: ${t.accentDim} !important; }
    .hvrC:hover { transform: translateY(-2px); box-shadow: ${t.accentGlow} !important; }
    .hvrI:hover { color: ${t.accent} !important; }
    .pill:hover { border-color: ${t.accent} !important; color: ${t.accent} !important; }
    .nsi:hover  { background: ${t.noteHover} !important; }
  `;

    // Notes helpers
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
            <div style={{ display: "flex", height: "100vh", width: "100%", background: t.bg, color: t.t1, fontFamily: t.disp, overflow: "hidden" }}>

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
        </>
    );
}
