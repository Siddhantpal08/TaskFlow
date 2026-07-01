export const mkId = () => "loc-" + Math.random().toString(36).slice(2, 9);
export const mkBlock = (type = "p", content = "", extra = {}) => ({ id: mkId(), type, content, checked: false, ...extra });

export const EMOJIS = ["📝", "📚", "🗂️", "💡", "🎯", "🔬", "⚡", "🌿", "🎨", "🔧", "📊", "🚀", "🧠", "💼", "🌍", "🔐", "📐", "🎵", "🏗️", "✨"];

export const BLOCK_TYPES = [
    { type: "p",       icon: "¶",    label: "Text",         desc: "Plain paragraph" },
    { type: "h1",      icon: "H1",   label: "Heading 1",    desc: "Large title" },
    { type: "h2",      icon: "H2",   label: "Heading 2",    desc: "Section heading" },
    { type: "h3",      icon: "H3",   label: "Heading 3",    desc: "Sub-heading" },
    { type: "ul",      icon: "•",    label: "Bullet List",  desc: "Unordered list item" },
    { type: "ol",      icon: "1.",   label: "Numbered List", desc: "Ordered list item" },
    { type: "todo",    icon: "☐",    label: "To-do",        desc: "Checkbox item" },
    { type: "quote",   icon: "❝",    label: "Quote",        desc: "Block quote" },
    { type: "callout", icon: "💡",   label: "Callout",      desc: "Info callout box" },
    { type: "code",    icon: "</>",  label: "Code",         desc: "Code block" },
    { type: "divider", icon: "—",    label: "Divider",      desc: "Horizontal line" },
    { type: "link",    icon: "🔗",   label: "Link",         desc: "Clickable URL" },
];

export const SCRIPT_BLOCK_TYPES = [
    { type: "scene-heading",  icon: "INT.",  label: "Scene Heading",  desc: "INT./EXT. location" },
    { type: "action",         icon: "Act",   label: "Action",         desc: "Scene description" },
    { type: "character",      icon: "CHR",   label: "Character",      desc: "Character name" },
    { type: "dialogue",       icon: "Dlg",   label: "Dialogue",       desc: "Spoken lines" },
    { type: "parenthetical",  icon: "()",    label: "Parenthetical",  desc: "Acting direction" },
    { type: "transition",     icon: "CUT",   label: "Transition",     desc: "CUT TO: / FADE OUT:" },
];

export const LYRICS_BLOCK_TYPES = [
    { type: "verse",       icon: "V",  label: "Verse",       desc: "Song verse" },
    { type: "chorus",      icon: "Ch", label: "Chorus",      desc: "Song chorus" },
    { type: "bridge",      icon: "Br", label: "Bridge",      desc: "Song bridge" },
    { type: "pre-chorus",  icon: "PC", label: "Pre-Chorus",  desc: "Pre-chorus section" },
    { type: "hook",        icon: "Hk", label: "Hook",        desc: "Song hook" },
    { type: "outro",       icon: "Ou", label: "Outro",       desc: "Song outro" },
];

export const SCRIPT_TYPES = new Set(SCRIPT_BLOCK_TYPES.map(b => b.type));
export const LYRICS_TYPES = new Set(LYRICS_BLOCK_TYPES.map(b => b.type));
export const SCRIPT_ORDER = SCRIPT_BLOCK_TYPES.map(b => b.type);
export const LYRICS_ORDER = LYRICS_BLOCK_TYPES.map(b => b.type);

const todayLong  = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const todayShort = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export const INIT_PAGES = {
    root: { id: "root", title: "Workspace", emoji: "🏠", parentId: null, childIds: ["intro", "np1", "np2", "np3"], blocks: [], updatedAt: "Just now" },

    intro: {
        id: "intro", title: "Quick Start Guide", emoji: "🚀", parentId: "root", childIds: [],
        blocks: [
            mkBlock("h1", "Welcome to TaskFlow ✦"),
            mkBlock("callout", "You're on TaskFlow — a powerful workspace for tasks, notes, and team collaboration by Crevio. Here's everything you need to get started."),
            mkBlock("h2", "✍️ Notes"),
            mkBlock("ul", "Press '/' anywhere to open the command menu — insert headings, lists, code, callouts and more."),
            mkBlock("ul", "Drag the ⠿ handle on the left of any block to reorder it."),
            mkBlock("ul", "Hover a block and click '···' for options: duplicate, delete, change type."),
            mkBlock("ul", "Use 'Sub-page' in the top bar to nest unlimited levels of pages inside each other."),
            mkBlock("h2", "✅ Tasks"),
            mkBlock("ul", "Create tasks from the Tasks view and assign them to team members."),
            mkBlock("ul", "Set priority (High / Med / Low) and due dates on any task."),
            mkBlock("ul", "Delegate sub-tasks — TaskFlow tracks the full delegation chain."),
            mkBlock("h2", "👥 Teams & Friends"),
            mkBlock("ul", "Create a team and share the join code with your colleagues."),
            mkBlock("ul", "Add friends by email to collaborate and share notes privately."),
            mkBlock("h2", "⌨️ Keyboard Shortcuts"),
            mkBlock("code", "Ctrl+S        → Force save all blocks\nCtrl+Z        → Undo last edit\nCtrl+Y        → Redo\n/             → Slash command menu\nEnter         → New block below\nBackspace     → Delete empty block"),
            mkBlock("quote", "Your data is saved automatically as you type. Every change syncs to the cloud in real-time."),
        ], updatedAt: "Just now"
    },

    np1: {
        id: "np1", title: "My Workspace", emoji: "💼", parentId: "root", childIds: ["np1a"],
        blocks: [
            mkBlock("h1", "My Workspace"),
            mkBlock("p", "Use this page as your central hub. Jot down priorities, track ongoing projects, and keep everything in one place."),
            mkBlock("h2", "🎯 This Week's Goals"),
            mkBlock("todo", "Define top 3 priorities for the week"),
            mkBlock("todo", "Clear email inbox"),
            mkBlock("todo", "Review open tasks and update statuses"),
            mkBlock("h2", "📌 Pinned Resources"),
            mkBlock("ul", "Add your most-used links here"),
            mkBlock("ul", "Reference documents, dashboards, wikis"),
            mkBlock("divider", ""),
            mkBlock("p", ""),
        ], updatedAt: "Just now"
    },

    np1a: {
        id: "np1a", title: "Meeting Notes", emoji: "📋", parentId: "np1", childIds: [],
        blocks: [
            mkBlock("h1", "Meeting Notes"),
            mkBlock("h2", `${todayShort} — Team Sync`),
            mkBlock("p", "Attendees:"),
            mkBlock("h2", "📋 Agenda"),
            mkBlock("todo", "Review last week's tasks"),
            mkBlock("todo", "Discuss blockers"),
            mkBlock("todo", "Plan next sprint"),
            mkBlock("h2", "📝 Notes"),
            mkBlock("p", ""),
            mkBlock("h2", "✅ Action Items"),
            mkBlock("ol", ""),
        ], updatedAt: "Just now"
    },

    np2: {
        id: "np2", title: "Ideas & Brain Dump", emoji: "💡", parentId: "root", childIds: [],
        blocks: [
            mkBlock("h1", "Ideas & Brain Dump 💡"),
            mkBlock("callout", "This is your no-judgement zone. Write anything — product ideas, random thoughts, things to research. Good ideas often start messy."),
            mkBlock("h2", "🌱 In Progress"),
            mkBlock("ul", ""),
            mkBlock("h2", "📦 Backlog"),
            mkBlock("ul", ""),
            mkBlock("h2", "🗑️ Parked / Discarded"),
            mkBlock("ul", ""),
        ], updatedAt: "Just now"
    },

    np3: {
        id: "np3", title: "Journal", emoji: "📔", parentId: "root", childIds: [],
        blocks: [
            mkBlock("h1", "Journal 📔"),
            mkBlock("p", "A private space to reflect, think out loud, or track your personal growth."),
            mkBlock("divider", ""),
            mkBlock("h2", todayLong),
            mkBlock("p", "Today I..."),
            mkBlock("p", ""),
            mkBlock("p", "Grateful for:"),
            mkBlock("ul", ""),
            mkBlock("p", "Tomorrow's intention:"),
            mkBlock("p", ""),
        ], updatedAt: "Just now"
    },
};
