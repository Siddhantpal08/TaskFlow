export const mkId = () => "loc-" + Math.random().toString(36).slice(2, 9);
export const mkBlock = (type = "p", content = "", extra = {}) => ({ id: mkId(), type, content, checked: false, ...extra });

export const EMOJIS = ["📝", "📚", "🗂️", "💡", "🎯", "🔬", "⚡", "🌿", "🎨", "🔧", "📊", "🚀", "🧠", "💼", "🌍", "🔐", "📐", "🎵", "🏗️", "✨"];

export const BLOCK_TYPES = [
    { type: "p", icon: "¶", label: "Text", desc: "Plain paragraph" },
    { type: "h1", icon: "H1", label: "Heading 1", desc: "Large title" },
    { type: "h2", icon: "H2", label: "Heading 2", desc: "Section heading" },
    { type: "h3", icon: "H3", label: "Heading 3", desc: "Sub-heading" },
    { type: "todo", icon: "☐", label: "To-do", desc: "Checkbox item" },
    { type: "quote", icon: "❝", label: "Quote", desc: "Block quote" },
    { type: "callout", icon: "💡", label: "Callout", desc: "Info callout box" },
    { type: "code", icon: "</>", label: "Code", desc: "Code block" },
    { type: "divider", icon: "—", label: "Divider", desc: "Horizontal line" },
    { type: "link", icon: "🔗", label: "Link", desc: "Clickable URL" },
];

export const INIT_PAGES = {
    root: { id: "root", title: "Notes", emoji: "📝", parentId: null, childIds: ["intro", "np1", "np2", "np3"], blocks: [], updatedAt: "Just now" },
    intro: {
        id: "intro", title: "Welcome to Notes! 📝", emoji: "✨", parentId: "root", childIds: [],
        blocks: [
            mkBlock("h1", "Welcome to TaskFlow Notes ✨"),
            mkBlock("p", "This is your secure, deeply collaborative starting point for all your ideas. Notes are synchronized completely in real-time — meaning anyone in your workspace can type seamlessly with you!"),
            mkBlock("h2", "A few tips to get you started:"),
            mkBlock("todo", "Press '/' (slash) and start typing to see the commands menu instantly.", { checked: false }),
            mkBlock("todo", "Hit 'Enter' at the end of a block to quickly spawn another.", { checked: false }),
            mkBlock("todo", "You can also hover over the left edge of any paragraph to reveal the drag options and change block types on the fly.", { checked: false }),
            mkBlock("quote", "Notes sync dynamically and reliably — nothing gets lost. Try opening this page on your phone alongside your computer to watch the magic happen."),
            mkBlock("callout", "Use the 'Add sub-page' functionality in the bottom or in the navigation to structure your documents indefinitely."),
        ], updatedAt: "Just now"
    },
    np1: {
        id: "np1", title: "BCA Project — TaskFlow", emoji: "🚀", parentId: "root", childIds: ["np1a", "np1b"],
        blocks: [
            mkBlock("h1", "BCA Project — TaskFlow"),
            mkBlock("callout", "This document tracks the full development of TaskFlow — a peer-to-peer task management system built for BCA VI Semester."),
            mkBlock("h2", "Project Status"),
            mkBlock("todo", "Design MySQL database schema", { checked: true }),
            mkBlock("todo", "Build REST API with Node.js + Express"),
            mkBlock("todo", "Implement JWT authentication"),
            mkBlock("todo", "Build React frontend dashboard"),
            mkBlock("todo", "Add Firebase push notifications"),
            mkBlock("h2", "Tech Stack"),
            mkBlock("p", "Frontend: React + Vite · Backend: Node.js + Express · Database: MySQL · Mobile: React Native"),
        ], updatedAt: "Feb 20, 2025"
    },
    np1a: {
        id: "np1a", title: "Database Schema", emoji: "🗄️", parentId: "np1", childIds: [],
        blocks: [
            mkBlock("h1", "Database Schema"),
            mkBlock("p", "MySQL relational schema for the TaskFlow system with self-referencing FK for delegation chains."),
            mkBlock("h2", "Tasks Table"),
            mkBlock("code", "CREATE TABLE tasks (\n  task_id    INT PRIMARY KEY AUTO_INCREMENT,\n  title      VARCHAR(255) NOT NULL,\n  status     ENUM('pending','in_progress','completed') DEFAULT 'pending',\n  priority   ENUM('low','medium','high') DEFAULT 'medium',\n  parent_task_id INT REFERENCES tasks(task_id),\n  assigned_by    INT REFERENCES users(user_id),\n  assigned_to    INT REFERENCES users(user_id),\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);"),
            mkBlock("quote", "parent_task_id is a self-referencing FK that enables unlimited task delegation chains — the architectural core of TaskFlow."),
        ], updatedAt: "Feb 19, 2025"
    },
    np1b: {
        id: "np1b", title: "API Documentation", emoji: "⚡", parentId: "np1", childIds: ["np1b1"],
        blocks: [
            mkBlock("h1", "API Documentation"),
            mkBlock("p", "REST API endpoints for the TaskFlow backend (Node.js + Express)."),
            mkBlock("h2", "Task Endpoints"),
            mkBlock("code", "GET    /api/tasks              → list tasks for current user\nPOST   /api/tasks              → create and assign a task\nPATCH  /api/tasks/:id/status   → update task status\nPOST   /api/tasks/:id/delegate → delegate task to another user"),
            mkBlock("callout", "All endpoints require Authorization: Bearer <token> header except /auth/register and /auth/login."),
        ], updatedAt: "Feb 20, 2025"
    },
    np1b1: {
        id: "np1b1", title: "Auth Endpoints", emoji: "🔐", parentId: "np1b", childIds: [],
        blocks: [
            mkBlock("h1", "Auth Endpoints"),
            mkBlock("code", "POST /api/auth/register  → create account\nPOST /api/auth/login     → returns JWT token\nPOST /api/auth/logout    → invalidate session"),
            mkBlock("h2", "JWT Middleware"),
            mkBlock("p", "All protected routes validate the Bearer token using jsonwebtoken. bcrypt is used for password hashing with a salt factor of 12."),
        ], updatedAt: "Feb 18, 2025"
    },
    np2: {
        id: "np2", title: "Meeting Notes", emoji: "📋", parentId: "root", childIds: [],
        blocks: [
            mkBlock("h1", "Meeting Notes"),
            mkBlock("h2", "Feb 20, 2025 — Architecture Review"),
            mkBlock("p", "Attendees: Siddhant Pal, Shubham Mendhe, Dr. Sunita Dwivedi"),
            mkBlock("todo", "Removed fixed role hierarchy — any user can assign to any user", { checked: true }),
            mkBlock("todo", "Delegation depth is unlimited (parent_task_id self-reference)", { checked: true }),
            mkBlock("todo", "Notifications: email via NodeMailer + mobile push via Firebase FCM"),
            mkBlock("todo", "Dark/light mode toggle using React context + CSS variables"),
            mkBlock("h2", "Action Items"),
            mkBlock("todo", "Siddhant: finalize DB schema by Feb 21"),
            mkBlock("todo", "Shubham: set up Node.js project structure"),
        ], updatedAt: "Feb 20, 2025"
    },
    np3: {
        id: "np3", title: "Research & Ideas", emoji: "💡", parentId: "root", childIds: [],
        blocks: [
            mkBlock("h1", "Research & Ideas"),
            mkBlock("callout", "The global task management software market is valued at over $4 billion and growing at ~14% annually."),
            mkBlock("h2", "Comparable Products"),
            mkBlock("p", "Studied for reference: Todoist, Asana, Linear, Notion, ClickUp"),
            mkBlock("quote", "TaskFlow fills the gap between overly simple to-do apps and heavyweight enterprise tools — targeting students and small teams."),
            mkBlock("h2", "Future Features"),
            mkBlock("todo", "Real-time collaboration (Socket.io)"),
            mkBlock("todo", "In-app chat between task participants"),
            mkBlock("todo", "PDF/Excel export (pdfkit, exceljs)"),
            mkBlock("todo", "AI task suggestions"),
        ], updatedAt: "Feb 18, 2025"
    },
};
