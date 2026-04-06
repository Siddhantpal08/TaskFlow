import { I, IC } from "../ui/Icon.jsx";
import { mkBlock } from "../../data/notes.js";

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
    const subPages = pages["root"]?.childIds?.map(id => pages[id]).filter(Boolean) || [];

    const handleTemplate = async (tpl) => {
        // Create page with correct emoji and title
        const created = await addNotePage("root", { title: tpl.title, emoji: tpl.emoji, initBlocks: tpl.blocks });
        // addNotePage returns the new id — navigate to it
        // Navigation handled inside addNotePage
    };

    return (
        <div style={{ flex: 1, overflow: "auto" }}>
            <div style={{ height: 5, background: `linear-gradient(to right,${t.accent},${t.blue || '#0072FF'})` }} />
            <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 48px 80px" }}>

                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: t.t1, fontFamily: "'Outfit',sans-serif", letterSpacing: "-0.5px" }}>
                        🏠 Workspace Home
                    </div>
                    <div style={{ fontSize: 14, color: t.t2, marginTop: 6, fontFamily: t.disp }}>
                        Your notes, journals, and creative docs — all in one place.
                    </div>
                </div>

                {/* Recent pages */}
                {subPages.length > 0 && (
                    <div style={{ marginBottom: 44 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 600, color: t.t3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14, fontFamily: t.mono }}>
                            Recent Pages
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                            {subPages.slice(0, 6).map(pg => (
                                <div key={pg.id} onClick={() => navigateNote(pg.id)}
                                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: `1px solid ${t.border}`, cursor: "pointer", background: t.card, transition: "all .15s" }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent + "66"; e.currentTarget.style.background = t.noteHover; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.card; }}>
                                    <span style={{ fontSize: 22 }}>{pg.emoji || "📄"}</span>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: t.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pg.title || "Untitled"}</div>
                                        <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>{pg.updatedAt || "—"}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Start from template */}
                <div style={{ fontSize: 10.5, fontWeight: 600, color: t.t3, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14, fontFamily: t.mono }}>
                    Start from a Template
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                    {TEMPLATES.map(tpl => (
                        <div key={tpl.type} onClick={() => handleTemplate(tpl)}
                            style={{ padding: "18px 16px", borderRadius: 12, border: `1px solid ${t.border}`, cursor: "pointer", background: t.card, transition: "all .18s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent + "66"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = t.accentGlow; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{tpl.emoji}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: t.t1, marginBottom: 4 }}>{tpl.title}</div>
                            <div style={{ fontSize: 11, color: t.t3, lineHeight: 1.5 }}>{tpl.desc}</div>
                        </div>
                    ))}

                    {/* Blank page */}
                    <div onClick={() => addNotePage("root")}
                        style={{ padding: "18px 16px", borderRadius: 12, border: `1.5px dashed ${t.border}`, cursor: "pointer", background: "transparent", transition: "all .18s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 100, gap: 6 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.background = t.accentDim; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = "transparent"; }}>
                        <span style={{ fontSize: 24, color: t.t3 }}>+</span>
                        <span style={{ fontSize: 12, color: t.t3, fontFamily: t.disp }}>Blank Page</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
