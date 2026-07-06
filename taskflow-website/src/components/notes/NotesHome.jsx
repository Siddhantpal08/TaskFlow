import { useState } from "react";
import { I, IC } from "../ui/Icon.jsx";
import { mkBlock, INIT_PAGES } from "../../data/notes.js";
import EmptyState from "../ui/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

// Suggested note templates for the workspace home
const TEMPLATES = [
    {
        emoji: "📓", title: "Daily Journal", type: "journal", desc: "Your private daily log — thoughts, mood, plans.", blocks: [
            mkBlock("h1", "Daily Journal"),
            mkBlock("p", `${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`),
            mkBlock("h2", "How I'm feeling today"),
            mkBlock("p", ""),
            mkBlock("h2", "What I want to get done"),
            mkBlock("todo", ""),
            mkBlock("todo", ""),
            mkBlock("h2", "Thoughts & Reflections"),
            mkBlock("quote", ""),
        ]
    },
    {
        emoji: "📋", title: "Meeting Notes", type: "meeting", desc: "Capture attendees, decisions and action items.", blocks: [
            mkBlock("h1", "Meeting Notes"),
            mkBlock("p", `Date: ${new Date().toLocaleDateString('en-IN')}`),
            mkBlock("h2", "Attendees"),
            mkBlock("ul", ""),
            mkBlock("h2", "Agenda"),
            mkBlock("ol", ""),
            mkBlock("h2", "Decisions"),
            mkBlock("callout", "Key decisions made in this meeting."),
            mkBlock("h2", "Action Items"),
            mkBlock("todo", ""),
        ]
    },
    {
        emoji: "🚀", title: "Project Plan", type: "project", desc: "Outline goals, milestones and tasks.", blocks: [
            mkBlock("h1", "Project Plan"),
            mkBlock("callout", "Define your project goal clearly before diving into tasks."),
            mkBlock("h2", "Goal"),
            mkBlock("p", ""),
            mkBlock("h2", "Milestones"),
            mkBlock("ol", ""),
            mkBlock("h2", "Task Breakdown"),
            mkBlock("todo", ""),
            mkBlock("todo", ""),
            mkBlock("h2", "Notes"),
            mkBlock("p", ""),
        ]
    },
    {
        emoji: "💡", title: "Idea Scratchpad", type: "idea", desc: "Brain-dump ideas without structure.", blocks: [
            mkBlock("h1", "Ideas 💡"),
            mkBlock("p", "Capture ideas freely — no wrong answers here."),
            mkBlock("ul", ""),
            mkBlock("ul", ""),
            mkBlock("divider"),
            mkBlock("h2", "Best picks"),
            mkBlock("todo", ""),
        ]
    },
    {
        emoji: "📚", title: "Study Notes", type: "study", desc: "Structured notes for learning.", blocks: [
            mkBlock("h1", "Study Notes"),
            mkBlock("h2", "Topic"),
            mkBlock("p", ""),
            mkBlock("h2", "Key Concepts"),
            mkBlock("ul", ""),
            mkBlock("h2", "Summary"),
            mkBlock("quote", ""),
            mkBlock("h2", "Questions"),
            mkBlock("todo", ""),
        ]
    },
    {
        emoji: "🎵", title: "Song Lyrics", type: "lyrics", desc: "Write lyrics with verse / chorus structure.", blocks: [
            mkBlock("h1", "Song Title"),
            mkBlock("verse", ""),
            mkBlock("chorus", ""),
            mkBlock("verse", ""),
            mkBlock("bridge", ""),
            mkBlock("chorus", ""),
        ]
    },
    {
        emoji: "📽️", title: "Script", type: "script", desc: "Fountain-style screenplay / video script.", blocks: [
            mkBlock("scene-heading", "INT. LOCATION — DAY"),
            mkBlock("action", ""),
            mkBlock("character", ""),
            mkBlock("dialogue", ""),
        ]
    },
    {
        emoji: "✅", title: "To-Do List", type: "todo", desc: "Simple checklist to get things done.", blocks: [
            mkBlock("h1", "To-Do"),
            mkBlock("todo", ""),
            mkBlock("todo", ""),
            mkBlock("todo", ""),
            mkBlock("divider"),
            mkBlock("h2", "Someday"),
            mkBlock("ul", ""),
        ]
    },
];

export default function NotesHome({ t, pages, addNotePage, navigateNote }) {
    const { user } = useAuth();
    const { tasks = [], createTask, deleteTask } = useData();
    const subPages = pages["root"]?.childIds?.map(id => pages[id]).filter(Boolean) || [];
    const [restoring, setRestoring] = useState(false);

    const handleTemplate = async (tpl) => {
        const created = await addNotePage("root", { title: tpl.title, emoji: tpl.emoji, initBlocks: tpl.blocks });
    };

    const handleRestoreStarter = async () => {
        if (!confirm("This will merge the default starter notes into your workspace. Existing notes with the same name will be skipped. Continue?")) return;
        setRestoring(true);
        try {
            const idMap = { root: null };
            const order = ["intro", "np1", "np1a", "np1b", "np1b1", "np2", "np3"];
            let firstId = null;
            for (const oldId of order) {
                const pg = INIT_PAGES[oldId];
                if (!pg) continue;

                // Check if already exists
                const existing = Object.values(pages).find(existingPg => existingPg && existingPg.title === pg.title);
                if (existing) {
                    idMap[oldId] = existing.id;
                    continue;
                }

                const newId = await addNotePage(pg.parentId === "root" ? "root" : (idMap[pg.parentId] || "root"), {
                    title: pg.title,
                    emoji: pg.emoji,
                    initBlocks: pg.blocks,
                });
                if (newId) {
                    idMap[oldId] = newId;
                    if (!firstId) firstId = newId;
                }
            }
            if (firstId) navigateNote(firstId);
        } catch (e) {
            console.error("Failed to restore starter notes:", e);
        } finally {
            setRestoring(false);
        }
    };

    return (
        <div style={{ flex: 1, overflow: "auto" }}>
            <style>{`
                .notes-home-root { padding: 40px 48px 80px; }
                @media (max-width: 768px) {
                    .notes-home-root { padding: 20px 16px 80px !important; }
                }
            `}</style>
            <div style={{ height: 5, background: `linear-gradient(to right,${t.accent},${t.blue || '#0072FF'})` }} />
            <div className="notes-home-root" style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
                
                {/* Main Content */}
                <div style={{ flex: 1, minWidth: "min(300px, 100%)" }}>

                {/* Header */}
                <div style={{ marginBottom: 40, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: t.t1, fontFamily: "'Outfit',sans-serif", letterSpacing: "-0.5px" }}>
                            🏠 Workspace Home
                        </div>
                        <div style={{ fontSize: 14, color: t.t2, marginTop: 6, fontFamily: t.disp }}>
                            Your notes, journals, and creative docs — all in one place.
                        </div>
                    </div>
                </div>

                {/* Recent pages */}
                <div style={{ marginBottom: 44 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: t.t3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14, fontFamily: t.mono }}>
                        Recent Pages
                    </div>
                    {subPages.length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                            {subPages.slice(0, 6).map(pg => (
                                <div key={pg.id} onClick={() => navigateNote(pg.id)} className="note-card-hover"
                                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: `1px solid ${t.border}`, cursor: "pointer", background: t.card }}>
                                    <span style={{ fontSize: 22 }}>{pg.emoji || "📄"}</span>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: t.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pg.title || "Untitled"}</div>
                                        <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>{pg.updatedAt || "—"}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            t={t}
                            icon="task"
                            title="No pages yet"
                            description="Create a blank page or choose a template below to start writing."
                        />
                    )}
                </div>

                {/* Start from template */}
                <div style={{ fontSize: 10.5, fontWeight: 600, color: t.t3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14, fontFamily: t.mono }}>
                    Start from a Template
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                    {TEMPLATES.map(tpl => (
                        <div key={tpl.type} onClick={() => handleTemplate(tpl)} className="tpl-card-hover"
                            style={{ padding: "18px 16px", borderRadius: 12, border: `1px solid ${t.border}`, cursor: "pointer", background: t.card }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{tpl.emoji}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: t.t1, marginBottom: 4 }}>{tpl.title}</div>
                            <div style={{ fontSize: 11, color: t.t3, lineHeight: 1.5 }}>{tpl.desc}</div>
                        </div>
                    ))}

                    {/* Blank page */}
                    <div onClick={() => addNotePage("root")} className="blank-card-hover"
                        style={{ padding: "18px 16px", borderRadius: 12, border: `1.5px dashed ${t.border}`, cursor: "pointer", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 100, gap: 6 }}>
                        <span style={{ fontSize: 24, color: t.t3 }}>+</span>
                        <span style={{ fontSize: 12, color: t.t3, fontFamily: t.disp }}>Blank Page</span>
                    </div>
                </div>

                </div>

                {/* Developer / Utilities */}
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ fontSize: 11, color: t.t3, lineHeight: 1.5 }}>
                        Missing the default notes? Restore the starter pages to your workspace.
                    </div>
                    <button
                        onClick={handleRestoreStarter}
                        disabled={restoring}
                        title="Re-add the default starter notes"
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 14px", borderRadius: 8,
                            border: `1px solid ${t.accent}44`,
                            background: restoring ? t.accentDim : `${t.accent}10`,
                            color: t.accent, cursor: restoring ? "not-allowed" : "pointer",
                            fontFamily: t.disp, fontSize: 12, fontWeight: 600,
                            transition: "all .2s", opacity: restoring ? 0.7 : 1,
                        }}
                        onMouseEnter={e => { if (!restoring) e.currentTarget.style.background = `${t.accent}25`; }}
                        onMouseLeave={e => { if (!restoring) e.currentTarget.style.background = `${t.accent}10`; }}
                    >
                        <span style={{ fontSize: 14 }}>{restoring ? "⏳" : "🔄"}</span>
                        {restoring ? "Restoring…" : "Restore Starter Notes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
