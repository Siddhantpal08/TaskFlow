# TaskFlow — Complete AI Context & Project Knowledge Base

> **Authors:** Siddhant Pal, Shubham Mendhe  
> **Course:** BCA VI Semester — College Project  
> **Last Updated:** April 2026  
> **Purpose:** This file is specifically for AI assistants to gain complete, instant context about the TaskFlow project — its architecture, every development phase, all decisions made, current implementation state, and known issues.

---

## 1. What Is TaskFlow?

TaskFlow is a **full-stack, peer-to-peer task management and productivity suite** built as a BCA final-year college project. It is NOT a corporate hierarchy tool — any user can assign tasks to any other user, forming unlimited delegation chains.

### Three Sub-Projects (Mono-repo)

```
d:\Developments\College Project\
├── taskflow-app/          # React 18 + Vite 5 — Web Frontend (deployed to Vercel)
├── taskflow-backend/      # Node.js + Express.js — REST API + Socket.IO (deployed to Render)
├── taskflow-mobile/       # React Native + Expo — Mobile App
├── TASKFLOW_DOCS.md       # Original detailed FRD/TRD specification document
├── TASKFLOW_AI_CONTEXT.md # THIS FILE — AI-facing knowledge base
├── ERDiagram.png          # Entity–Relationship diagram
└── logo.svg / logo.png    # Official brand assets
```

### Deployed URLs (Production)
- **Frontend:** `https://taskflow-by-crevio.vercel.app`
- **Backend API:** Hosted on Render (free tier; URL stored in `.env` on frontend/mobile)
- **Database:** Aiven MySQL (cloud MySQL 8 — NOT PlanetScale as originally planned)

---

## 2. Complete Technology Stack

| Layer | Tech | Notes |
|-------|------|----|
| Web Frontend | React 18 + Vite 5 | No TypeScript — pure JS with JSX |
| Mobile | React Native 0.81.5 + Expo 54 | Bottom-tab + stack navigation |
| Backend | Node.js + Express 4.18 | CommonJS, no TypeScript |
| Database | MySQL 8 (Aiven cloud) | Accessed via `mysql2` with connection pool |
| Auth | JWT (Access + Refresh tokens) | Access: 15 days, Refresh: rotated on use |
| Realtime | Socket.IO 4.7 | Server-sent events for notifications and online status |
| Styling | Pure CSS (CSS variables + themes.js) | No Tailwind, no MUI, no Chakra |
| Auth (optional) | Google OAuth via `@react-oauth/google` | Implemented but may not be fully wired in production |
| Email | Nodemailer | Used for password reset OTP |
| Cron | node-cron | Event reminder background job |
| Security | Helmet + bcrypt (rounds=12) + Joi + express-rate-limit | |
| Deployment | Vercel (web) + Render (API) | Backend `render.yaml` is in repo root config |

---

## 3. Complete Development History (Phase by Phase)

### Phase 1 — Foundation & UI Scaffold (Early 2025)
**What was built:**
- Vite + React project scaffolded from scratch.
- Design system created in `taskflow-app/src/data/themes.js` — two token objects: `DARK` and `LIGHT` (never hardcode hex in components — always use theme tokens).
- Global CSS with CSS custom properties in `taskflow-app/src/styles/global.css`.
- Core layout: `Sidebar.jsx` (persistent left nav) + `Topbar.jsx` (top bar with theme toggle, notifications bell) + `App.jsx` (root state, routing).
- **State-based routing** (not React Router — navigation is managed by `activePage` state in `App.jsx`).
- Dark mode as default; theme toggle persisted in `localStorage`.
- `TaskFlow_Complete.jsx` (82 KB) — a monolithic prototype file; the actual app evolved into separate component files.

### Phase 2 — Core Feature Screens (Early 2025)
**What was built:**
- `Dashboard.jsx`: Stats cards (total tasks, done, delegated, due-soon), recent 5 tasks list, upcoming events panel, team presence.
- `Tasks.jsx`: Filterable task table with tabs (All / Pending / Active / Done / Delegated), live row counts, delegation `↗` amber badge, row-click to open TaskDrawer.
- `NotesPage` / `NoteTreeItem.jsx`: Notion-style infinite nested pages with a collapsible sidebar tree.
- `Calendar.jsx`: Month/week grid view, colored event dots (by priority), day-detail drawer.
- `Team.jsx` / `TeamPage.jsx`: Team member cards with avatars, online status, delegation chain visualizer (horizontal flow).
- `AssignModal.jsx`: Task creation modal — all fields with validation.
- `TaskDrawer.jsx`: Slide-in right panel for task detail — mark complete, delegate, status update sub-tasks.

### Phase 3 — Backend API (Phase 4 in original plan, done ~March 2025)
**What was built:**

#### Database Schema (4 migrations in `taskflow-backend/migrations/`)
| Migration | What it adds |
|-----------|-------------|
| `001_initial_schema.sql` | `users`, `refresh_tokens`, `tasks`, `notes_pages`, `notes_blocks`, `events`, `notifications` |
| `002_teams_and_avatars.sql` | `teams` (with `join_code`), `team_members` (admin/member roles) |
| `003_approval_workflows.sql` | Adds `pending_approval` status to tasks; `team_leave_requests` table |
| `004_friends.sql` | `friends` table (requester_id, recipient_id, status: pending/accepted) |

**Additional columns added via `/db-repair` diagnostic endpoint on live DB:**
- `users.role` (ENUM admin/user)
- `users.google_id` (for Google OAuth)
- `users.avatar_url` (URL to profile photo)
- `users.bio` (TEXT)

#### Backend Route Structure (`/api/v1/...`)
```
/auth          → authRoutes.js + authController.js
/tasks         → taskRoutes.js + taskController.js
/notes         → notesRoutes.js + notesController.js
/calendar      → calendarRoutes.js + calendarController.js
/team          → teamRoutes.js + teamController.js
/friends       → friendRoutes.js + friendController.js
/notifications → notificationRoutes.js + notificationController.js
/users/me      → userRoutes.js + userController.js   (profile, dashboard summary)
```

**Key backend features implemented:**
- JWT auth with access token (15-day expiry — changed from original 15-min spec for college usability) + HttpOnly cookie refresh token.
- Password reset via 6-digit OTP emailed via Nodemailer.
- Task delegation chain via `parent_task_id` FK on `tasks`.
- `task.status` can be: `pending`, `active`, `pending_approval`, `done`.
- Task approval workflow: assignee requests completion → creator reviews → approves/rejects.
- Notes with infinite nesting (`parent_id` FK on `notes_pages`), with a stable "root" page auto-created per user to prevent data loss on refresh.
- Socket.IO: each user joins room `user:<userId>` on connect; events emitted: `task:assigned`, `task:delegated`, `task:updated`, `notification:new`, `user:online`, `user:offline`.
- Background cron job (`startReminderJob`) sends `due_soon` notifications.
- Friends system: send/accept friend requests; used by the `Friends.jsx` tab.
- CORS is configured to allow `localhost`, all `*.vercel.app` subdomains, and LAN IPs (for mobile dev).

### Phase 4 — Mobile App (React Native + Expo, ~early April 2025)
**What was built (12 screens in `taskflow-mobile/src/screens/`):**
- `LoginScreen.js`, `RegisterScreen.js`, `ForgotPasswordScreen.js`
- `DashboardScreen.js`: contextual greeting (Good Morning / Afternoon / Evening / Night based on time), stats cards, recent tasks, upcoming events, in-app notification alerts.
- `TasksScreen.js`: filterable task list.
- `NotesListScreen.js` + `NoteEditorScreen.js`: Full block-level CRUD with sub-page hierarchy navigation. Uses `AsyncStorage` for token/auth persistence.
- `CalendarScreen.js`: Uses `react-native-calendars` library.
- `TeamScreen.js` + `FriendsScreen.js`: Team members and friend requests.
- `NotificationsScreen.js`: In-app notification list.
- `ProfileScreen.js`: User profile view/edit with bio, avatar.

**Navigation:** `@react-navigation/bottom-tabs` + `@react-navigation/stack`. Auth screens use a Stack, main app uses Bottom Tabs (Dashboard, Tasks, Notes, Calendar, Team).

### Phase 5 — Feature Refinement (March–April 2025, multiple conversations)

#### Session Duration Fix
- Changed JWT access token expiry from `15m` to `15d` for college demo convenience.

#### Task Approval Workflow
- Added `pending_approval` status to tasks enum.
- Frontend `TaskDrawer.jsx` shows "Request Approval" button for assignees; creators see "Approve / Reject".
- Team leave requests table added; UI in `Team.jsx`.

#### Notes Editor Deep Fixes
- **Root page problem**: Each user now gets an auto-generated root "Workspace" page on first login. This prevents breadcrumb routing failures on page refresh.
- **Backend auto-block generation**: When a new notes page is created with no blocks, the backend inserts a default `p` block automatically.
- **Slash-command menu**: Triggered by typing `/` in any block; shows block type picker. Fixed positioning issue (was appearing off-screen).
- **Markdown auto-list**: Typing `- ` or `* ` at the start of a line auto-converts block to a list item.
- **Ctrl+A selection**: Fixed to select all content within a focused block.
- **Template content persistence**: Workspace home templates are saved to the backend, not just local state.
- **Zoom persistence**: Zoom level for notes editor is remembered via localStorage.

#### Profile & Avatar System
- User profile now shows avatar (initials fallback if no `avatar_url`).
- Sidebar in web app shows logged-in user's avatar + name (fetched from `/api/v1/users/me`).
- `Av.jsx` component in `taskflow-app/src/components/ui/` renders the avatar circle with initials or image.

#### Password Reset & Security
- PIN field in security settings has a show/hide eye toggle.
- Password strength meter using `zxcvbn` library on registration form.
- OTP-based forgot password fully functional.

#### Friends System
- `Friends.jsx` (web) + `FriendsScreen.js` (mobile): Browse users, send friend requests, accept/reject requests.
- Displays user avatars and bios in friend cards.

#### Search Functionality
- Global search across tasks and notes (repaired in late April productivity suite conversation).

#### Shared Notes / Metadata
- Shared note metadata and persistence implemented.

### Phase 6 — Deployment (April 2025)

#### Infrastructure
- **Backend:** Deployed to **Render** (free tier). `render.yaml` config in `taskflow-backend/`. Start command: `npm start` → runs `server.js`.
- **Frontend:** Deployed to **Vercel**. Auto-deploys from `main` branch of GitHub repo.
- **Database:** **Aiven MySQL** (cloud, free tier). Connection via `mysql2` — credentials in `.env` (not committed to git).
- **Domain:** `taskflow-by-crevio.vercel.app`

#### Testing Done
- Jest + Supertest backend integration tests. Test result files: `test-results.txt`, `test-results2.txt`, `test-results3.txt`, `test-results4.txt` in `taskflow-backend/`.
- A dedicated testing workflow was documented (conversation: `e322d622`).

#### Key Deployment Issues Resolved
- `trust proxy` setting added to Express for Render's reverse proxy (fixes rate-limiter IP detection).
- CORS updated to support LAN IPs for mobile testing.
- `/db-repair` and `/api/v1/diagnose-db` diagnostic endpoints added to apply missing DB columns in production without full migration reruns.
- Notes data loss on refresh fixed via the persistent root page mechanism.
- User profile data (name, avatar) missing after auth fixed by ensuring `/users/me` is called and data stored in `AuthContext`.

---

## 4. Current Implementation State (as of April 2026)

### Web Frontend (`taskflow-app/`)
| Feature | Status |
|---------|--------|
| Auth (Login/Register/Forgot Password) | ✅ Complete |
| Dashboard with live stats | ✅ Complete |
| Task table with filters + delegation | ✅ Complete |
| Task Drawer (detail, status, delegation, approval) | ✅ Complete |
| Create Task Modal | ✅ Complete |
| Notes with infinite nesting | ✅ Complete |
| Notes slash-command menu | ✅ Complete (positioning fixed) |
| Calendar (month/week view + events) | ✅ Complete |
| Team members + delegation visualizer | ✅ Complete |
| Friends system | ✅ Complete |
| Notifications (bell + panel) | ✅ Complete |
| Dark/Light theme toggle | ✅ Complete |
| User profile (avatar, bio, edit mode) | ✅ Complete |
| Global search | ✅ Complete |
| Real-time via Socket.IO | ✅ Complete |
| Google OAuth | ⚠ Partially (library integrated, full flow may need final wiring) |
| Drag-and-drop note reorder | ⚠ Partial |
| E2E tests (Playwright) | ❌ Not done |

### Backend (`taskflow-backend/`)
| Feature | Status |
|---------|--------|
| Auth endpoints (register/login/refresh/logout/reset-password) | ✅ Complete |
| Task CRUD + status + delegation + approval | ✅ Complete |
| Bulk delete tasks | ✅ Complete |
| Notes pages + blocks CRUD | ✅ Complete |
| Root page auto-genesis on first login | ✅ Complete |
| Calendar events CRUD | ✅ Complete |
| Team CRUD (create/join/leave/members) | ✅ Complete |
| Friends (request/accept/reject) | ✅ Complete |
| Notifications (list/mark-read) | ✅ Complete |
| Socket.IO real-time events | ✅ Complete |
| Event reminder cron job (due_soon) | ✅ Complete |
| Nodemailer OTP email | ✅ Complete |
| Rate limiting (general + auth-specific) | ✅ Complete |
| Helmet, CORS, error handler | ✅ Complete |
| Unit/integration tests (Jest + Supertest) | ✅ Done (multiple rounds) |
| Google OAuth (server side) | ⚠ Partial |

### Mobile App (`taskflow-mobile/`)
| Feature | Status |
|---------|--------|
| Login, Register, Forgot Password screens | ✅ Complete |
| Dashboard with contextual greeting + stats | ✅ Complete |
| Tasks screen with filter | ✅ Complete |
| Notes list + full block editor | ✅ Complete |
| Calendar screen | ✅ Complete |
| Team screen | ✅ Complete |
| Friends screen | ✅ Complete |
| Notifications screen + in-app alerts | ✅ Complete |
| Profile screen | ✅ Complete |
| AsyncStorage token persistence | ✅ Complete |
| Socket.IO real-time | ✅ Complete |
| Offline cache (MMKV) | ❌ Not implemented (uses AsyncStorage only) |
| Push notifications (FCM/APNs) | ❌ Not implemented |

---

## 5. Key Architectural Decisions & Rules (IMPORTANT for AI)

1. **No React Router** — Web app uses `activePage` state in `App.jsx` for navigation. Don't suggest React Router-based solutions.
2. **Theme system is mandatory** — Every component receives a `t` (theme tokens) prop. Never hardcode colors. All colors live in `taskflow-app/src/data/themes.js`.
3. **No 3rd-party UI libraries** — No MUI, no Chakra, no Tailwind. Pure CSS only.
4. **Backend only uses CommonJS** (`require`/`module.exports`) — NOT ES modules (`import`/`export`).
5. **JWT access token is 15 DAYS** (not the 15 min spec) — deliberate decision for college convenience.
6. **MySQL2 prepared statements only** — Never string-interpolate SQL. Always use `?` placeholders.
7. **Notes root page** — Every user has an auto-created root "Workspace" page. It cannot be deleted. This is critical for preventing state loss.
8. **Notes auto-save** — Uses 500ms debounce on any change. Save goes to `/api/v1/notes/blocks/:id` (PUT) for blocks and `/api/v1/notes/pages/:id` (PUT) for page meta.
9. **Task status flow** — `pending → active → pending_approval → done`. The `pending_approval` state requires creator to approve before task is marked `done`.
10. **Delegation chain** — `tasks.parent_task_id` FK. A task can only be marked `done` if all its child (delegated) tasks are `done`.
11. **Socket rooms** — `user:<userId>` per-user room. Always emit to the correct room, not broadcast globally.
12. **CORS** — Whitelisted origins: `localhost:5173`, `localhost:3000`, `localhost:8081`, `localhost:19006`, `https://taskflow-by-crevio.vercel.app`. LAN IPs also allowed for mobile dev.
13. **Database is Aiven MySQL** — NOT PlanetScale (original plan changed). Credentials never committed.

---

## 6. File Structure Deep-Dive

### Backend (`taskflow-backend/src/`)
```
src/
├── app.js                  # Express app: middleware chain, routes, Socket.IO, CORS setup
├── controllers/
│   ├── authController.js   # register, login, refresh, logout, forgotPassword, resetPassword, googleAuth
│   ├── calendarController.js # getEvents, createEvent, updateEvent, deleteEvent
│   ├── friendController.js   # sendRequest, acceptRequest, getRequests, getFriends
│   ├── notesController.js    # getPages, createPage, getPage, updatePage, deletePage, createBlock, updateBlock, deleteBlock
│   ├── notificationController.js # getNotifications, markRead, markAllRead
│   ├── taskController.js     # getTasks, createTask, getTask, updateTask, deleteTask, bulkDelete, updateStatus, delegateTask
│   ├── teamController.js     # createTeam, joinTeam, getMembers, leaveTeam, approveLeave, getDelegationChain
│   └── userController.js     # getMe, updateMe, getDashboardSummary
├── middleware/
│   ├── auth.js               # verifyToken middleware (JWT Bearer header check)
│   ├── errorHandler.js       # Global error catcher → HTTP status mapping
│   ├── rateLimiter.js        # generalLimiter (100/min) + authLimiter (5/15min)
│   ├── validate.js           # Joi schema validation middleware
│   └── asyncWrapper.js       # Wraps async route handlers to avoid try/catch everywhere
├── models/
│   ├── calendarModel.js      # DB queries for events
│   ├── friendModel.js        # DB queries for friends table
│   ├── notesModel.js         # DB queries for notes_pages + notes_blocks
│   ├── notificationModel.js  # DB queries for notifications
│   ├── taskModel.js          # DB queries for tasks (incl. delegation chain helpers)
│   ├── teamModel.js          # DB queries for teams + team_members + team_leave_requests
│   └── userModel.js          # DB queries for users + refresh_tokens
├── routes/
│   ├── authRoutes.js
│   ├── calendarRoutes.js
│   ├── friendRoutes.js
│   ├── notesRoutes.js
│   ├── notificationRoutes.js
│   ├── taskRoutes.js
│   ├── teamRoutes.js
│   └── userRoutes.js
├── services/                # Business logic layer (thin controllers delegate here)
└── utils/
    ├── db.js                # mysql2 connection pool (uses .env for credentials)
    ├── socket.js            # initSocket() — attaches Socket.IO handlers
    ├── eventReminderJob.js  # node-cron job for due_soon notifications
    ├── mailer.js            # Nodemailer setup
    ├── jwt.js               # generateAccessToken, generateRefreshToken
    ├── migrate.js           # Migration runner script
    └── logger.js            # Winston or console logger
```

### Web Frontend (`taskflow-app/src/`)
```
src/
├── App.jsx                  # Root: auth state, page routing (activePage), theme context, Socket.IO init
├── main.jsx                 # ReactDOM.createRoot entry point
├── TaskFlow_Complete.jsx    # Original monolithic prototype (not in production use)
├── api/                     # API call functions (one file per domain)
│   ├── auth.js
│   ├── tasks.js
│   ├── notes.js
│   ├── calendar.js
│   ├── team.js
│   ├── friends.js
│   ├── notifications.js
│   └── user.js
├── components/
│   ├── AssignModal.jsx      # Create task modal
│   ├── Calendar.jsx         # Month/week calendar
│   ├── CreateTaskModal.jsx  # Alternate task creation modal
│   ├── Dashboard.jsx        # Stats + recent tasks + events
│   ├── Friends.jsx          # Friends list + requests
│   ├── HierarchyChart.jsx   # Delegation chain visualizer
│   ├── NoteTreeItem.jsx     # Single node in notes sidebar tree
│   ├── NotifPanel.jsx       # Notification slide-in panel
│   ├── Sidebar.jsx          # Left navigation + notes page tree
│   ├── TaskDrawer.jsx       # Task detail slide-in panel
│   ├── Tasks.jsx            # Filterable task table
│   ├── Team.jsx             # Team member cards
│   ├── TeamPage.jsx         # Full team management page
│   ├── Topbar.jsx           # Top bar with search, theme toggle, notifications
│   ├── notes/               # Notes editor suite
│   │   ├── NotesPage.jsx    # Main notes page component
│   │   ├── BlockEditor.jsx  # Individual block editor
│   │   ├── SlashMenu.jsx    # / command picker popup
│   │   └── ...
│   └── ui/                  # Shared UI components
│       ├── Av.jsx           # Avatar component (initials + image fallback)
│       ├── Badge.jsx
│       ├── Button.jsx
│       ├── Spinner.jsx
│       └── ...
├── context/
│   ├── AuthContext.jsx      # Auth state (user, token, login/logout)
│   └── ThemeContext.jsx     # Theme state (dark/light toggle)
├── data/
│   ├── themes.js            # DARK and LIGHT token objects
│   ├── notes.js             # mkId, mkBlock, INIT_PAGES helpers
│   └── mock.js              # Dev seed data
└── styles/
    └── global.css           # Base reset + utility classes
```

### Mobile (`taskflow-mobile/src/`)
```
src/
├── api/                     # Mirror of web api/ folder, same endpoints
├── context/
│   ├── AuthContext.js       # Auth with AsyncStorage for token persistence
│   └── ThemeContext.js
├── data/                    # Shared data helpers
└── screens/
    ├── LoginScreen.js
    ├── RegisterScreen.js
    ├── ForgotPasswordScreen.js
    ├── DashboardScreen.js   # Contextual greeting + stats + events + in-app notifications
    ├── TasksScreen.js
    ├── NotesListScreen.js   # Page tree navigation
    ├── NoteEditorScreen.js  # Full block-level CRUD editor
    ├── CalendarScreen.js    # Uses react-native-calendars
    ├── TeamScreen.js
    ├── FriendsScreen.js
    ├── NotificationsScreen.js
    └── ProfileScreen.js
```

---

## 7. Database Schema (Current Final State)

### `users`
```sql
id, name, email, password (bcrypt), avatar_initials, is_online,
role (admin/user), google_id, avatar_url, bio, created_at, updated_at
```

### `refresh_tokens`
```sql
id, user_id → users(id), token (hashed), expires_at
```

### `tasks`
```sql
id, title, description, priority (low/medium/high),
status (pending/active/pending_approval/done),
assigned_by → users(id), assigned_to → users(id),
parent_task_id → tasks(id) [delegation chain],
due_date, created_at, updated_at
```

### `notes_pages`
```sql
id (UUID), user_id → users(id), parent_id → notes_pages(id),
title, emoji, position, updated_at
```

### `notes_blocks`
```sql
id (UUID), page_id → notes_pages(id),
type (h1/h2/h3/p/todo/quote/callout/code),
content, checked (for todo), position
```

### `events`
```sql
id, user_id → users(id), title, description, event_date, event_time, priority
```

### `notifications`
```sql
id, user_id → users(id),
type (task_assigned/task_delegated/status_update/event_created/due_soon),
message, is_read, ref_id, created_at
```

### `teams`
```sql
team_id, name, join_code (unique), created_by → users(id), created_at
```

### `team_members`
```sql
(team_id, user_id) PK, role (admin/member), joined_at
```

### `team_leave_requests`
```sql
id, team_id → teams(team_id), user_id → users(id),
status (pending/approved/rejected), created_at
```

### `friends`
```sql
id, requester_id → users(id), recipient_id → users(id),
status (pending/accepted), created_at,
UNIQUE(requester_id, recipient_id)
```

---

## 8. Completed Problem-Solving History (Critical Bugs Fixed)

### Notes Data Loss on Refresh
- **Problem:** Navigating away or refreshing caused the active notes page to be lost.
- **Solution:** Added a persistent "root" `Workspace` page in the DB for each user, auto-created at login. Breadcrumb routing always falls back to this root. Root page deletion is blocked on the backend.

### User Profile Missing After Authentication
- **Problem:** After login, `user.name`, `user.avatar`, etc. were undefined in components.
- **Solution:** `AuthContext` now calls `GET /api/v1/users/me` immediately after successful login/token refresh and stores the full user object.

### Notes Slot Race (Paste Crash)
- **Problem:** Pasting text caused the notes editor to crash due to rapid sequential block creation.
- **Solution:** Paste handler debounced; block creation serialized; backend `position` field recalculated correctly on each mutation.

### Socket.IO Online Status Not Persisting
- **Problem:** `is_online` flag in DB was not updating reliably on disconnect.
- **Solution:** `disconnect` event handler now calls `UPDATE users SET is_online = 0 WHERE id = ?` reliably within `initSocket`.

### CORS Failure on Mobile (LAN IP)
- **Problem:** Mobile app on same network could not reach backend via LAN IP.
- **Solution:** Added `isLanOrigin()` regex check in `app.js` CORS config to allow `192.168.x.x`, `10.x.x.x`, `172.16-31.x.x` origins.

### Rate Limiter Behind Reverse Proxy
- **Problem:** All requests appeared to come from Render's proxy IP, hitting rate limits immediately.
- **Solution:** `app.set('trust proxy', 1)` added at the top of `app.js`.

### Refresh Token Expiry
- **Problem:** Long sessions were being logged out unexpectedly.
- **Solution:** Refresh token duration extended; access token changed to 15 days for demo convenience.

### Slash Menu Off-Screen
- **Problem:** The `/` block-type menu appeared off-screen at the bottom of the page.
- **Solution:** `SlashMenu.jsx` now calculates viewport-relative position and flips to render above the cursor if there's insufficient space below.

---

## 9. Known Remaining Gaps / Future Work

- **Google OAuth** — installed (`google-auth-library` on backend, `@react-oauth/google` on frontend) but may need full end-to-end wiring verification in production.
- **Offline support (Mobile)** — currently uses `AsyncStorage` for tokens only; MMKV-based full offline task/notes cache not implemented.
- **Push notifications** — `expo-notifications` + FCM/APNs not integrated. In-app alerts work; native system push does not.
- **Drag-and-drop note reorder** — partial; `PATCH /api/v1/notes/pages/:id/reorder` endpoint exists but DnD UI not fully polished.
- **E2E tests** — Playwright (web) and Detox (mobile) E2E tests not written.
- **Accessibility audit** — `axe-core` not integrated into CI. Keyboard navigation not fully tested.
- **CI/CD Pipeline** — No GitHub Actions workflow yet; deployments to Vercel/Render are triggered manually.
- **React Query** — Documented in spec but not implemented; server state managed with `useState` + `useEffect` + manual fetch calls.
- **TypeScript** — Not used anywhere (backend or frontend), despite being in original spec.

---

## 10. Environment Variables (What Exists — Never Commit Values)

### Backend (`.env` in `taskflow-backend/`)
```
PORT=3000
NODE_ENV=development
DB_HOST=...        # Aiven MySQL host
DB_PORT=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
DB_SSL=true
JWT_SECRET=...
JWT_REFRESH_SECRET=...
EMAIL_USER=...     # Gmail for Nodemailer
EMAIL_PASS=...     # App password
CLIENT_URLS=https://taskflow-by-crevio.vercel.app,...
GOOGLE_CLIENT_ID=...
```

### Web Frontend (`.env` in `taskflow-app/`)
```
VITE_API_URL=https://<render-backend-url>/api/v1
```

### Mobile (`.env` in `taskflow-mobile/`)
```
EXPO_PUBLIC_API_URL=https://<render-backend-url>/api/v1
```

---

## 11. How to Run Locally

### Backend
```powershell
cd "d:\Developments\College Project\taskflow-backend"
npm install
# Ensure .env is configured with local or Aiven DB credentials
npm run dev     # starts with nodemon (hot-reload)
# or
npm start       # production mode
```

### Web Frontend
```powershell
cd "d:\Developments\College Project\taskflow-app"
npm install
npm run dev     # Vite dev server on http://localhost:5173
```

### Mobile
```powershell
cd "d:\Developments\College Project\taskflow-mobile"
npm install
npx expo start  # Opens Expo dev tools; scan QR with Expo Go app
# or
npm run android / npm run ios
```

### Run Backend Tests
```powershell
cd "d:\Developments\College Project\taskflow-backend"
npm test        # Jest --runInBand --forceExit
```

---

## 12. Conversation Log Summary (For AI Reference)

| Date | Conversation | Key Work Done |
|------|-------------|--------------|
| Sep–Oct 2025 | Initial setup | Phase 1–2: Scaffold + UI design system |
| Mar 22, 2025 | Implementing Approval Workflows | Added `pending_approval` status, `team_leave_requests` table, backend + frontend for approval flow |
| Mar 24, 2025 | Phase 5 Feature Refinement | Extended auth token to 15 days; fixed notes keyboard nav; toggle edit mode for profiles; fixed status tag overflow |
| Apr 2, 2025 | Stabilizing Production Deployment | Fixed notes data loss, user profile missing after auth, sidebar avatars, DB schema mismatches, `trust proxy` fix |
| Apr 3 (a), 2025 | Stabilizing Notes Persistence | Persistent root page, backend auto-block generation, friends tab with avatars/bios |
| Apr 3 (b), 2025 | Stabilizing Mobile App | Dashboard contextual greeting, mobile notes block CRUD, in-app notification triggers |
| Apr 5–6, 2025 | Productivity Suite Refinement | Fixed notes paste crash, shared note metadata, workspace home templates, search functionality, team member avatars |
| Apr 6, 2025 | Testing & Deploying | Defined testing workflow, local test process, Render + Vercel deployment verification |
| Apr 13, 2025 | Notes Editor Refinement | Slash menu positioning, markdown auto-list, Ctrl+A fix, speech-to-text, PIN eye toggle, zoom + template persistence |

---

*This document was auto-generated by Antigravity AI on 2026-04-17 to serve as a persistent project context file. Update this file whenever significant new features are added or architectural decisions are changed.*
