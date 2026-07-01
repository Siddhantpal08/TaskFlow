export const USERS = [
    { id: 1, name: "Siddhant Pal", av: "SP", color: "#00E5CC" },
    { id: 2, name: "Shubham Mendhe", av: "SM", color: "#B083FF" },
    { id: 3, name: "Priya Sharma", av: "PS", color: "#00D67B" },
    { id: 4, name: "Rahul Verma", av: "RV", color: "#FFAA00" },
];

export const TASKS = [
    { id: 1, title: "Design MySQL schema", st: "done", pri: "high", by: 1, to: 1, due: "Feb 18", delegated: false, desc: "Create normalized tables for Users, Tasks, Notes, Events, Notifications with FK constraints." },
    { id: 2, title: "Build REST API (Node.js)", st: "active", pri: "high", by: 2, to: 1, due: "Feb 22", delegated: false, desc: "Express routes for auth, task CRUD, delegation logic. JWT middleware on all protected routes." },
    { id: 3, title: "JWT authentication system", st: "pending", pri: "medium", by: 1, to: 2, due: "Feb 24", delegated: false, desc: "bcrypt password hashing + JWT token issuance and validation middleware." },
    { id: 4, title: "React dashboard UI", st: "pending", pri: "high", by: 1, to: 3, due: "Feb 26", delegated: true, desc: "Main dashboard with stats, task list, calendar, team overview. Vite + React + dark/light mode." },
    { id: 5, title: "  └─ Sidebar nav component", st: "active", pri: "medium", by: 3, to: 4, due: "Feb 23", delegated: false, desc: "Delegated sub-task: collapsible sidebar with route-based active states." },
    { id: 6, title: "Firebase push notifications", st: "pending", pri: "low", by: 2, to: 1, due: "Mar 01", delegated: false, desc: "FCM setup for React Native. Notification triggers on task assign, delegate, complete." },
    { id: 7, title: "FullCalendar integration", st: "pending", pri: "low", by: 1, to: 2, due: "Mar 05", delegated: false, desc: "Calendar view for tasks by due date + events with month/week toggle." },
];

export const EVENTS = [
    { id: 1, title: "Project Presentation", date: "Feb 28", time: "10:00 AM", c: "#FF3D5A" },
    { id: 2, title: "Sprint Review", date: "Feb 22", time: "2:00 PM", c: "#00E5CC" },
    { id: 3, title: "Code Review Session", date: "Feb 24", time: "4:30 PM", c: "#00D67B" },
];

export const NOTIFS = [
    { id: 1, txt: "Shubham assigned 'Build REST API' to you", time: "10m", read: false, sym: "⬡" },
    { id: 2, txt: "Priya delegated 'Sidebar nav' to Rahul", time: "1h", read: false, sym: "↗" },
    { id: 3, txt: "Rahul accepted 'Sidebar nav component'", time: "3h", read: true, sym: "✓" },
    { id: 4, txt: "New event: Sprint Review on Feb 22 @ 2pm", time: "1d", read: true, sym: "◈" },
];
