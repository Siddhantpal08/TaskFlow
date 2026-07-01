import { useState } from "react";

const GUIDE_DATA = {
    "getting-started": {
        label: "Getting Started",
        icon: "🚀",
        items: [
            {
                title: "Set Up Your Profile",
                desc: "Add your name, avatar, and timezone. Go to Profile → Edit Profile. Your avatar initials are auto-generated from your name.",
                shortcut: "Click your name in the sidebar bottom",
                tags: ["profile", "setup", "account"],
            },
            {
                title: "Create Your First Task",
                desc: "Click '+ New Task' in the Tasks page or use the Quick Capture button (⊕) in the bottom-right corner. Set title, priority, due date, and assignee.",
                shortcut: "Quick Capture: Ctrl+K (coming soon)",
                tags: ["tasks", "create", "quick"],
            },
            {
                title: "Write Your First Note",
                desc: "Click '+ New Page' in the sidebar. Start typing immediately. Use '/' to open the command palette for blocks (headings, lists, code, etc.)",
                shortcut: "/ → Command palette",
                tags: ["notes", "create", "blocks"],
            },
            {
                title: "Invite Team Members",
                desc: "Go to Team page → Invite Member. Enter their email. They'll receive an invitation and can join your workspace. Free plan supports 3 members.",
                shortcut: "Team → Invite",
                tags: ["team", "invite", "collaboration"],
            },
            {
                title: "Connect Your Calendar",
                desc: "Open the Calendar page to see all events and deadlines. Click any date to add an event. Tasks with due dates appear automatically.",
                shortcut: "Sidebar → Calendar",
                tags: ["calendar", "events", "dates"],
            },
        ],
    },
    "notes": {
        label: "Notes & Docs",
        icon: "📝",
        items: [
            {
                title: "Block Editor — All Block Types",
                desc: "TaskFlow uses a block-based editor. Type '/' to open the menu. Available blocks: Heading 1/2/3, Paragraph, Bullet List, Numbered List, Checkbox, Quote, Callout, Code, Divider, Image, Table.",
                shortcut: "/ → pick block type",
                tags: ["blocks", "editor", "markdown"],
            },
            {
                title: "Keyboard Shortcuts",
                desc: "Ctrl+B = Bold, Ctrl+I = Italic, Ctrl+Z = Undo, Ctrl+Y = Redo, Enter = New block, Backspace on empty = delete block, Tab = indent, Shift+Tab = unindent.",
                shortcut: "Ctrl+Z, Ctrl+B, Ctrl+I",
                tags: ["shortcuts", "keyboard", "editor"],
            },
            {
                title: "Writing Modes (Pro)",
                desc: "Switch between modes at the top of any note: Normal (default), Script Mode (screenplay format), Lyrics Mode (music/poetry), Focus Mode (distraction-free).",
                shortcut: "Top bar → Mode switcher",
                tags: ["writing", "modes", "pro", "script", "lyrics"],
                pro: true,
            },
            {
                title: "Page Organization",
                desc: "Drag pages in the sidebar to reorder them. Nest pages under each other to create a hierarchy. Use emoji to visually identify pages quickly.",
                shortcut: "Drag in sidebar",
                tags: ["organization", "sidebar", "hierarchy"],
            },
            {
                title: "Share a Note",
                desc: "Open any note → 3-dot menu → Share Link. Anyone with the link can view the note (read-only). Shared notes are available on Starter and Pro plans.",
                shortcut: "⋯ → Share Link",
                tags: ["share", "link", "collaboration"],
                pro: false,
                starter: true,
            },
            {
                title: "Duplicate & Delete Pages",
                desc: "Right-click any page in the sidebar to see options: Duplicate, Delete, Rename, Change Emoji. Deleting removes all sub-pages too.",
                shortcut: "Right-click page in sidebar",
                tags: ["duplicate", "delete", "manage"],
            },
            {
                title: "Note Templates",
                desc: "Start a new page and choose from templates: Meeting Notes, Weekly Review, Project Brief, Bug Report, Study Notes, Daily Journal.",
                shortcut: "+ New Page → Choose Template",
                tags: ["templates", "quick-start"],
            },
        ],
    },
    "tasks": {
        label: "Tasks",
        icon: "✅",
        items: [
            {
                title: "Create & Manage Tasks",
                desc: "Add tasks from the Tasks page or Dashboard. Each task has: Title, Status (Pending/Active/Done), Priority (Low/Med/High/Critical), Due Date, and Assignee.",
                shortcut: "+ New Task button",
                tags: ["create", "status", "priority"],
            },
            {
                title: "Kanban Board View",
                desc: "Toggle between List view and Board view in the Tasks page. Board view shows tasks in columns: Pending | Active | Done | Overdue. Drag cards to change status.",
                shortcut: "Tasks → Board icon (top right)",
                tags: ["kanban", "board", "drag-drop"],
            },
            {
                title: "Filter & Sort Tasks",
                desc: "Use the filter bar to show tasks by status, priority, or assignee. Sort by due date, priority, or creation date. Filters are saved per session.",
                shortcut: "Filter bar in Tasks",
                tags: ["filter", "sort", "search"],
            },
            {
                title: "Task Drawer",
                desc: "Click any task to open its detail drawer. Add description, subtasks, comments, and attachments. See full history of changes.",
                shortcut: "Click any task row",
                tags: ["details", "drawer", "description"],
            },
            {
                title: "Subtasks",
                desc: "Inside any task drawer, click '+ Add Subtask'. Subtasks have their own status and can be checked off independently. Parent task auto-completes when all subtasks done.",
                shortcut: "Task Drawer → + Add Subtask",
                tags: ["subtasks", "checklist", "nesting"],
            },
            {
                title: "Assign Tasks to Team Members",
                desc: "Open any task → click the Assignee field → select from your team. The assigned member receives a notification. You can also self-assign tasks.",
                shortcut: "Task → Assignee field",
                tags: ["assign", "team", "collaboration"],
            },
        ],
    },
    "calendar": {
        label: "Calendar",
        icon: "📅",
        items: [
            {
                title: "Add Events",
                desc: "Click any date on the calendar to add an event. Set title, description, start/end time, and color. Events sync across all devices in real-time.",
                shortcut: "Click a date → Add Event",
                tags: ["events", "add", "schedule"],
            },
            {
                title: "View Modes",
                desc: "Switch between Monthly and Weekly views using the toggle in the top-right. Monthly shows all events at a glance. Weekly shows time slots.",
                shortcut: "Month / Week toggle",
                tags: ["month", "week", "view"],
            },
            {
                title: "Tasks on Calendar",
                desc: "Tasks with due dates automatically appear on the calendar as colored markers. Click a task marker to open the task drawer.",
                shortcut: "Automatic — set due date on task",
                tags: ["tasks", "due-date", "integration"],
            },
        ],
    },
    "team": {
        label: "Team & Collaboration",
        icon: "👥",
        items: [
            {
                title: "Team Roles",
                desc: "Members can have roles: Admin (full access), Member (standard access). Admins can invite/remove members and manage team settings.",
                shortcut: "Team → Member → Change Role",
                tags: ["roles", "admin", "permissions"],
            },
            {
                title: "Real-time Presence",
                desc: "Green dots in the Team panel show who is currently online. Presence updates in real-time via WebSocket. See who's active right now.",
                shortcut: "Team panel in dashboard",
                tags: ["online", "presence", "realtime"],
            },
            {
                title: "Team Chat",
                desc: "Use the Chat widget (bottom-right) for quick team messages. Chat is persistent and searchable. Different from task comments which are task-specific.",
                shortcut: "💬 Chat button (bottom-right)",
                tags: ["chat", "messages", "communication"],
            },
            {
                title: "Friends & Connections",
                desc: "Add colleagues as Friends to assign tasks to people outside your primary team. Search by email or username.",
                shortcut: "Sidebar → Friends",
                tags: ["friends", "connections", "network"],
            },
        ],
    },
    "pro": {
        label: "Pro Features",
        icon: "✦",
        items: [
            {
                title: "Unlimited Everything",
                desc: "Pro removes all limits: unlimited note pages (Free: 10), unlimited tasks (Free: 20), unlimited team members (Free: 3). Work without constraints.",
                shortcut: "Upgrade → Pro",
                tags: ["unlimited", "limits", "pro"],
                pro: true,
            },
            {
                title: "Custom Themes — Full App",
                desc: "Pro users get access to the Custom Builder in Theme Studio. Pick any accent and secondary color — the entire app (background, nav, cards, text) adapts to your palette.",
                shortcut: "Sidebar → Customize → Theme Studio",
                tags: ["themes", "customize", "colors"],
            },
            {
                title: "Script & Lyrics Writing Modes",
                desc: "Toggle special writing modes in any note. Script Mode formats text like a screenplay (character, action, dialogue). Lyrics Mode adds verse/chorus structure.",
                shortcut: "Note editor → Mode dropdown",
                tags: ["script", "lyrics", "writing", "creative"],
                pro: true,
            },
            {
                title: "Note Sharing with Links",
                desc: "Share any note via a public link. The recipient can view (not edit) the note without needing a TaskFlow account.",
                shortcut: "Note ⋯ menu → Share Link",
                tags: ["share", "public", "link"],
                starter: true,
            },
            {
                title: "Priority Support",
                desc: "Pro subscribers get priority responses on the Feedback page. Issues are addressed within 24 hours.",
                shortcut: "Feedback → Pro Priority",
                tags: ["support", "help", "priority"],
                pro: true,
            },
            {
                title: "Razorpay Billing — India First",
                desc: "TaskFlow uses Razorpay for payments. Supports UPI, Credit/Debit Cards, Net Banking, EMI. Plans start at ₹49/month. Cancel anytime from Profile → Subscription.",
                shortcut: "Sidebar → Upgrade",
                tags: ["billing", "payment", "subscription", "UPI"],
            },
        ],
    },
};

const ALL_SECTIONS = Object.entries(GUIDE_DATA);

export default function GuideHubPage({ t, setPage }) {
    const [activeTab, setActiveTab] = useState("getting-started");
    const [search, setSearch] = useState("");
    const [expandedItem, setExpandedItem] = useState(null);
    
    // Form states
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    
    // Support Ticket Form
    const [ticket, setTicket] = useState({ title: "", category: "bug", desc: "" });
    // Feedback Form
    const [feedback, setFeedback] = useState({ type: "feature", desc: "", rating: 5 });

    const handleSupportSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setMsg("Ticket submitted successfully. Our team will review it shortly.");
            setLoading(false);
            setTicket({ title: "", category: "bug", desc: "" });
        }, 1000);
    };

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setMsg("Feedback sent! Thank you for helping improve TaskFlow.");
            setLoading(false);
            setFeedback({ type: "feature", desc: "", rating: 5 });
        }, 1000);
    };

    const section = GUIDE_DATA[activeTab];

    // Search across all sections
    const searchResults = search.trim().length > 1
        ? ALL_SECTIONS.flatMap(([key, sec]) =>
            sec.items
                .filter(item =>
                    item.title.toLowerCase().includes(search.toLowerCase()) ||
                    item.desc.toLowerCase().includes(search.toLowerCase()) ||
                    (item.tags || []).some(tag => tag.includes(search.toLowerCase()))
                )
                .map(item => ({ ...item, sectionKey: key, sectionLabel: sec.label, sectionIcon: sec.icon }))
        )
        : null;

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <style>{`
                .guide-tab:hover { background: ${t.accentDim} !important; color: ${t.accent} !important; }
                .guide-item:hover { border-color: ${t.accent}44 !important; background: ${t.accentDim} !important; }
                .guide-item-expand { background: ${t.inset}; border-top: 1px solid ${t.border}; padding: 14px 18px; }
                @media (max-width: 768px) {
                    .guide-layout { flex-direction: column !important; }
                    .guide-tabs  { flex-direction: row !important; overflow-x: auto; border-right: none !important; border-bottom: 1px solid ${t.border} !important; }
                    .guide-tab   { white-space: nowrap; flex-shrink: 0; }
                }
            `}</style>

            {/* ── Header ── */}
            <div style={{ padding: "28px 32px 20px", background: `linear-gradient(120deg, ${t.accent}10 0%, ${t.accent}04 50%, transparent 100%)`, borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 12px", borderRadius: 999, background: t.accentDim, border: `1px solid ${t.accent}40`, fontSize: 11, color: t.accent, fontFamily: t.mono, fontWeight: 700, letterSpacing: "0.5px", marginBottom: 12 }}>
                            ✦ HELP & GUIDE HUB
                        </div>
                        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: t.t1, letterSpacing: "-0.5px" }}>
                            Feature Documentation
                        </h1>
                        <p style={{ margin: "6px 0 0", fontSize: 13, color: t.t2 }}>
                            Everything you need to master TaskFlow — shortcuts, features, and tips.
                        </p>
                    </div>
                    {/* Search */}
                    <div style={{ position: "relative", minWidth: 240 }}>
                        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" }}>🔍</div>
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search features, shortcuts…"
                            style={{
                                width: "100%", padding: "10px 14px 10px 38px",
                                background: t.card, border: `1px solid ${t.border}`,
                                borderRadius: 10, color: t.t1, fontSize: 13,
                                fontFamily: t.disp, outline: "none", boxSizing: "border-box",
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="guide-layout" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* ── Tab Sidebar ── */}
                <div className="guide-tabs" style={{
                    width: 200, flexShrink: 0, borderRight: `1px solid ${t.border}`,
                    padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto",
                    background: t.nav,
                }}>
                    {ALL_SECTIONS.map(([key, sec]) => (
                        <button key={key} className="guide-tab"
                            onClick={() => { setActiveTab(key); setSearch(""); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 9,
                                padding: "9px 12px", borderRadius: 8, border: "none",
                                background: activeTab === key ? t.accentDim : "transparent",
                                color: activeTab === key ? t.accent : t.t2,
                                fontFamily: t.disp, fontSize: 13, fontWeight: activeTab === key ? 700 : 400,
                                cursor: "pointer", textAlign: "left", width: "100%",
                                borderLeft: `3px solid ${activeTab === key ? t.accent : "transparent"}`,
                                transition: "all .15s",
                            }}>
                            <span style={{ fontSize: 16 }}>{sec.icon}</span>
                            {sec.label}
                        </button>
                    ))}

                    <div style={{ height: 1, background: t.border, margin: "6px 0" }} />

                    <button className="guide-tab" onClick={() => { setActiveTab("support"); setSearch(""); setMsg(""); }}
                        style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 8, border: "none", background: activeTab === "support" ? t.accentDim : "transparent", color: activeTab === "support" ? t.accent : t.t2, fontFamily: t.disp, fontSize: 13, fontWeight: activeTab === "support" ? 700 : 400, cursor: "pointer", textAlign: "left", width: "100%", borderLeft: `3px solid ${activeTab === "support" ? t.accent : "transparent"}`, transition: "all .15s" }}>
                        <span style={{ fontSize: 16 }}>🎫</span> Support Ticket
                    </button>
                    <button className="guide-tab" onClick={() => { setActiveTab("feedback"); setSearch(""); setMsg(""); }}
                        style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 8, border: "none", background: activeTab === "feedback" ? t.accentDim : "transparent", color: activeTab === "feedback" ? t.accent : t.t2, fontFamily: t.disp, fontSize: 13, fontWeight: activeTab === "feedback" ? 700 : 400, cursor: "pointer", textAlign: "left", width: "100%", borderLeft: `3px solid ${activeTab === "feedback" ? t.accent : "transparent"}`, transition: "all .15s" }}>
                        <span style={{ fontSize: 16 }}>⭐</span> Share Feedback
                    </button>                    <div style={{ marginTop: "auto", padding: "10px 4px" }}>
                        <div style={{ background: t.accentDim, border: `1px solid ${t.accent}30`, borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, marginBottom: 4 }}>✦ TaskFlow Pro</div>
                            <div style={{ fontSize: 10.5, color: t.t2, lineHeight: 1.5 }}>Unlock unlimited notes, tasks, team members & more.</div>
                            <button onClick={() => setPage("dashboard")}
                                style={{ marginTop: 8, width: "100%", padding: "5px 0", borderRadius: 6, border: "none", background: t.accent, color: "#000", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: t.disp }}>
                                Upgrade ↗
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Content ── */}
                <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

                    {/* Search Results */}
                    {searchResults ? (
                        <div>
                            <div style={{ fontSize: 12, color: t.t3, fontFamily: t.mono, marginBottom: 16 }}>
                                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{search}"
                            </div>
                            {searchResults.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "60px 0", color: t.t3 }}>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: t.t2 }}>No results found</div>
                                    <div style={{ fontSize: 12, marginTop: 4 }}>Try different keywords</div>
                                </div>
                            ) : searchResults.map((item, i) => (
                                <GuideCard key={i} item={item} t={t} showSection />
                            ))}
                        </div>
                    ) : (
                        <div>
                            {activeTab === "support" ? (
                                <div style={{ maxWidth: 600 }}>
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: t.t1, display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 28 }}>🎫</span> Submit Support Ticket</div>
                                        <div style={{ fontSize: 13, color: t.t2, marginTop: 6 }}>Experiencing an issue? Open a ticket and we'll help you out.</div>
                                    </div>
                                    <form onSubmit={handleSupportSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        <input required value={ticket.title} onChange={e => setTicket(p => ({ ...p, title: e.target.value }))} placeholder="Ticket Subject" style={{ width: "100%", padding: "12px 14px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, color: t.t1, fontSize: 13, fontFamily: t.disp, outline: "none", boxSizing: "border-box" }} />
                                        <select value={ticket.category} onChange={e => setTicket(p => ({ ...p, category: e.target.value }))} style={{ width: "100%", padding: "12px 14px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, color: t.t1, fontSize: 13, fontFamily: t.disp, outline: "none", boxSizing: "border-box" }}>
                                            <option value="bug">Bug Report</option>
                                            <option value="billing">Billing Issue</option>
                                            <option value="account">Account Access</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <textarea required rows={5} value={ticket.desc} onChange={e => setTicket(p => ({ ...p, desc: e.target.value }))} placeholder="Describe the issue in detail..." style={{ width: "100%", padding: "12px 14px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, color: t.t1, fontSize: 13, fontFamily: t.disp, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                                        <button disabled={loading} style={{ padding: "12px", background: t.accent, color: "#000", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontFamily: t.disp, transition: "opacity .2s" }}>{loading ? "Submitting..." : "Submit Ticket"}</button>
                                        {msg && <div style={{ color: t.green, fontSize: 13, fontWeight: 600 }}>{msg}</div>}
                                    </form>
                                </div>
                            ) : activeTab === "feedback" ? (
                                <div style={{ maxWidth: 600 }}>
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: t.t1, display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 28 }}>⭐</span> Share Feedback</div>
                                        <div style={{ fontSize: 13, color: t.t2, marginTop: 6 }}>Help us shape the future of TaskFlow. What should we build next?</div>
                                    </div>
                                    <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        <select value={feedback.type} onChange={e => setFeedback(p => ({ ...p, type: e.target.value }))} style={{ width: "100%", padding: "12px 14px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, color: t.t1, fontSize: 13, fontFamily: t.disp, outline: "none", boxSizing: "border-box" }}>
                                            <option value="feature">Feature Request</option>
                                            <option value="ui">UI/UX Suggestion</option>
                                            <option value="general">General Feedback</option>
                                        </select>
                                        <textarea required rows={5} value={feedback.desc} onChange={e => setFeedback(p => ({ ...p, desc: e.target.value }))} placeholder="I would love it if..." style={{ width: "100%", padding: "12px 14px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, color: t.t1, fontSize: 13, fontFamily: t.disp, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                                        <button disabled={loading} style={{ padding: "12px", background: t.accent, color: "#000", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontFamily: t.disp, transition: "opacity .2s" }}>{loading ? "Sending..." : "Send Feedback"}</button>
                                        {msg && <div style={{ color: t.green, fontSize: 13, fontWeight: 600 }}>{msg}</div>}
                                    </form>
                                </div>
                            ) : section ? (
                                <div>
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: t.t1, display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{ fontSize: 28 }}>{section.icon}</span>
                                            {section.label}
                                        </div>
                                        <div style={{ fontSize: 13, color: t.t2, marginTop: 4 }}>
                                            {section.items.length} feature{section.items.length !== 1 ? "s" : ""} documented
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {section.items.map((item, i) => (
                                            <GuideCard
                                                key={i} item={item} t={t}
                                                expanded={expandedItem === i}
                                                onToggle={() => setExpandedItem(expandedItem === i ? null : i)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function GuideCard({ item, t, showSection = false, expanded, onToggle }) {
    return (
        <div className="guide-item"
            style={{
                background: t.card, border: `1px solid ${t.border}`, borderRadius: 12,
                overflow: "hidden", transition: "all .18s", cursor: onToggle ? "pointer" : "default",
            }}
            onClick={onToggle}
        >
            <div style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                {/* Indicator */}
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.accent, flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: t.t1 }}>{item.title}</span>
                        {item.pro && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: t.accent, background: t.accentDim, padding: "2px 7px", borderRadius: 999, fontFamily: t.mono, border: `1px solid ${t.accent}30` }}>PRO</span>
                        )}
                        {item.starter && !item.pro && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: t.amber, background: t.amber + "14", padding: "2px 7px", borderRadius: 999, fontFamily: t.mono, border: `1px solid ${t.amber}30` }}>STARTER+</span>
                        )}
                        {showSection && (
                            <span style={{ fontSize: 10, color: t.t3, fontFamily: t.mono }}>· {item.sectionIcon} {item.sectionLabel}</span>
                        )}
                    </div>
                    <div style={{ fontSize: 12.5, color: t.t2, marginTop: 5, lineHeight: 1.6 }}>{item.desc}</div>
                    {item.shortcut && (
                        <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, color: t.t3, fontFamily: t.mono }}>Quick access:</span>
                            <code style={{ fontSize: 10, background: t.inset, border: `1px solid ${t.border}`, borderRadius: 5, padding: "2px 7px", color: t.accent, fontFamily: t.mono }}>{item.shortcut}</code>
                        </div>
                    )}
                </div>
                {onToggle && (
                    <div style={{ color: t.t3, fontSize: 16, flexShrink: 0, transition: "transform .15s", transform: expanded ? "rotate(180deg)" : "none" }}>
                        ▾
                    </div>
                )}
            </div>
        </div>
    );
}
