# TaskFlow — Full Project Documentation
> **Version:** 1.0 · **Date:** February 2025 · **Authors:** Siddhant Pal, Shubham Mendhe · **Semester:** BCA VI

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Functional Requirements](#2-functional-requirements)
3. [Non-Functional Requirements](#3-non-functional-requirements)
4. [System Architecture](#4-system-architecture)
5. [Implementation Plan](#5-implementation-plan)
6. [Database Schema](#6-database-schema)
7. [API Specification](#7-api-specification)
8. [Frontend Guidelines (Web)](#8-frontend-guidelines-web)
9. [Mobile Guidelines (React Native)](#9-mobile-guidelines-react-native)
10. [Backend Guidelines (Node.js)](#10-backend-guidelines-nodejs)
11. [Edge Case Handling](#11-edge-case-handling)
12. [Testing Strategy](#12-testing-strategy)
13. [Coding Rules & Conventions](#13-coding-rules--conventions)
14. [Security Rules](#14-security-rules)
15. [Deployment Checklist](#15-deployment-checklist)

---

## 1. Project Overview

**TaskFlow** is a peer-to-peer task management system that allows any user to assign tasks to any other user (no fixed roles), with unlimited delegation chains, Notion-style nested notes, a calendar view, and team collaboration features.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Frontend | React 18 + Vite 5 |
| Mobile | React Native (Expo) |
| Backend | Node.js + Express.js |
| Database | MySQL 8+ |
| Auth | JWT (Access + Refresh tokens) |
| Realtime | Socket.IO |
| Deployment | Vercel (web) · Railway/Render (API) · PlanetScale (DB) |

---

## 2. Functional Requirements

### 2.1 Authentication (AUTH)

| ID | Requirement |
|----|-------------|
| AUTH-01 | User can register with name, email, and password. |
| AUTH-02 | User can login with email + password; server returns JWT access token (15 min) + refresh token (7 days). |
| AUTH-03 | Refresh token rotates on each use and is stored in HttpOnly cookie. |
| AUTH-04 | User can logout (invalidates refresh token). |
| AUTH-05 | Password reset via email OTP (6 digits, valid 10 min). |
| AUTH-06 | All protected routes require `Authorization: Bearer <token>` header. |

### 2.2 Dashboard (DASH)

| ID | Requirement |
|----|-------------|
| DASH-01 | Display total task count, done count, delegated count, and due-soon count (within 48 h). |
| DASH-02 | Show last 5 recent tasks with status indicator and click-to-open drawer. |
| DASH-03 | Show next 3 upcoming calendar events. |
| DASH-04 | Show team presence (online/offline) with live indicator via WebSocket. |
| DASH-05 | Stats update in real time when any task changes. |

### 2.3 Task Management (TASK)

| ID | Requirement |
|----|-------------|
| TASK-01 | Any authenticated user can create a task with: Title, Description, Priority (Low/Medium/High), Assignee (any user), Due Date. |
| TASK-02 | Task statuses: `pending → active → done`. Status is updated by the assignee only. |
| TASK-03 | Task creator (or assigner) can delete a task. Assignee cannot delete tasks assigned to them. |
| TASK-04 | Filterable task table: All, Pending, Active, Done, Delegated (live counts per tab). |
| TASK-05 | Any row click opens the Task Detail Drawer (slide-in from right). |
| TASK-06 | Delegation: assignee can delegate to another user, forming a `1→M` chain. Delegation is tracked via `parent_task_id`. |
| TASK-07 | Delegated tasks show `↗` amber badge in the table. |
| TASK-08 | Task with a subtask (delegated) cannot be marked Done until all delegated tasks are Done. |
| TASK-09 | Bulk actions: select multiple rows → Mark Complete / Delete. |

### 2.4 Notes (NOTES)

| ID | Requirement |
|----|-------------|
| NOTES-01 | Each user has a personal workspace with infinite nested pages (tree structure). |
| NOTES-02 | Pages contain blocks: `h1`, `h2`, `h3`, `p`, `todo`, `quote`, `callout`, `code`. |
| NOTES-03 | Block created/deleted/reordered inline via slash-command menu (`/`). |
| NOTES-04 | Pages are auto-saved after 500 ms debounce on any change. |
| NOTES-05 | Pages support emoji icon and a title (editable inline). |
| NOTES-06 | Sidebar shows collapsible page tree. Drag-and-drop to rearrange order. |
| NOTES-07 | Sub-pages are shown as clickable cards at the bottom of each page. |
| NOTES-08 | Delete page recursively deletes all child pages (confirmation dialog required). |
| NOTES-09 | Breadcrumb navigation shows full parent path. |

### 2.5 Calendar (CAL)

| ID | Requirement |
|----|-------------|
| CAL-01 | Month view grid; navigate Previous/Next month. |
| CAL-02 | Events shown as colored dots on day cells (color by priority). |
| CAL-03 | Click a day opens Day Detail Drawer: lists events and tasks due that day. |
| CAL-04 | Create event: Title, Date, Time, Description. |
| CAL-05 | Task due dates automatically appear on the calendar. |
| CAL-06 | Week view toggle shows a 7-column hourly grid. |

### 2.6 Team (TEAM)

| ID | Requirement |
|----|-------------|
| TEAM-01 | List all team members (project-scoped). |
| TEAM-02 | Each member card: avatar, name, online status, tasks assigned count. |
| TEAM-03 | Click member → Member Profile Drawer: tasks, activity log, delegation chains. |
| TEAM-04 | Delegation chain visualizer: horizontal flow `Assigner → Delegator → Recipient`. |

### 2.7 Notifications (NOTIF)

| ID | Requirement |
|----|-------------|
| NOTIF-01 | Bell icon in topbar shows unread count badge. |
| NOTIF-02 | Events that trigger notifications: task assigned, task delegated, task status updated, new event created, task due within 24 h. |
| NOTIF-03 | Notification panel: list with icon, text, timestamp. "Mark all as read" action. |
| NOTIF-04 | Notifications delivered in real time via Socket.IO. |
| NOTIF-05 | Unread count resets to 0 when panel is opened. |

### 2.8 Theme System (THEME)

| ID | Requirement |
|----|-------------|
| THEME-01 | Dark mode is the default. |
| THEME-02 | One-click toggle in topbar switches to Light mode; preference persisted in `localStorage`. |
| THEME-03 | All colors, backgrounds, borders, and text adapt system-wide on toggle. |

---

## 3. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Dashboard must load within 2 s on 4G. API responses < 200 ms for GET, < 400 ms for POST/PUT. |
| **Scalability** | API stateless; horizontal scaling via PM2 cluster / Docker containers. |
| **Reliability** | Backend uptime ≥ 99.5 %. DB uses connection pooling (max 20 connections). |
| **Security** | HTTPS everywhere. No plaintext passwords. Input sanitized server-side. Rate limit: 100 req/min per IP. |
| **Accessibility** | WCAG AA: contrast ≥ 4.5:1. All interactive elements keyboard-focusable. ARIA labels on icons. |
| **Responsiveness** | Web: fluid at 360 px–1920 px. Mobile: Expo app targets iOS 14+ and Android 10+. |
| **Offline** | Mobile app caches last-known task list and notes for read-only offline access. |
| **Logging** | Server logs requests with Morgan. Errors logged to file with Winston. |

---

## 4. System Architecture

```
┌─────────────────┐    HTTPS/WSS    ┌──────────────────────────────┐
│  React Web App  │ ◄────────────► │     Express.js REST API       │
│  (Vite + React) │                 │  /api/auth                    │
└─────────────────┘                 │  /api/tasks                   │
                                    │  /api/notes                   │
┌─────────────────┐    HTTPS/WSS    │  /api/calendar                │
│ React Native    │ ◄────────────► │  /api/team                    │
│ (Expo)          │                 │  /api/notifications           │
└─────────────────┘                 └──────────┬───────────────────┘
                                               │
                              ┌────────────────┼────────────────┐
                              ▼                ▼                ▼
                         MySQL 8+       Socket.IO         Redis Cache
                         (Primary DB)   (Realtime)        (Sessions/OTP)
```

### Component Breakdown

```
src/
├── components/
│   ├── ui/              # Shared UI: Avatar (Av.jsx), Badge, Button, Spinner
│   ├── notes/           # NoteTreeItem, BlockEditor, NotesPage
│   ├── AssignModal.jsx  # Task creation modal
│   ├── Calendar.jsx     # Month/week grid
│   ├── Dashboard.jsx    # Stats + recent tasks + events
│   ├── NotifPanel.jsx   # Notification slide-in panel
│   ├── Sidebar.jsx      # Persistent nav + notes tree
│   ├── TaskDrawer.jsx   # Task detail slide-in drawer
│   ├── Tasks.jsx        # Filterable task table
│   ├── Team.jsx         # Team members + delegation visualizer
│   └── Topbar.jsx       # Top navigation bar
├── data/
│   ├── themes.js        # DARK / LIGHT token objects
│   ├── notes.js         # Notes helpers (mkId, mkBlock, INIT_PAGES)
│   └── mock.js          # Seed data for development
├── styles/
│   └── global.css       # Base reset + utility classes
├── App.jsx              # Root: state, routing, theme
└── main.jsx             # ReactDOM.createRoot entry
```

---

## 5. Implementation Plan

### Phase 1 — Foundation (Week 1–2)

- [x] Vite + React project scaffold
- [x] Design system: `themes.js` (DARK/LIGHT token objects)
- [x] Global CSS with CSS variables
- [x] Sidebar, Topbar, App layout (flex shell)
- [x] Basic page routing (state-based navigation)
- [ ] React Router DOM integration (replace state-based routing)
- [ ] `localStorage` theme persistence

### Phase 2 — Core Screens (Week 3–4)

- [x] Dashboard: stats cards, recent tasks, upcoming events, team presence
- [x] Tasks: filterable table, delegation badge, row click
- [x] Notes: infinite nesting tree, block editor, slash commands
- [x] Calendar: month grid, event dots, day detail
- [x] Team: member cards, delegation chain visualizer
- [ ] Task Detail Drawer: full info, sub-tasks, comments, activity log
- [ ] Assign Task Modal: all fields + validations

### Phase 3 — Overlays & Interactions (Week 5)

- [x] TaskDrawer (slide-in): mark complete, delegate
- [x] AssignModal (dialog): create task
- [x] NotifPanel (slide-in): notification list
- [ ] Bulk selection on Tasks table
- [ ] Drag-and-drop note page reorder
- [ ] Calendar event creation from Day Detail Drawer

### Phase 4 — Backend API (Week 6–7)

- [ ] Express.js project setup (TypeScript recommended)
- [ ] MySQL schema migrations (see §6)
- [ ] Auth routes: `/register`, `/login`, `/refresh`, `/logout`, `/reset-password`
- [ ] Task routes: CRUD + delegate + status-update + bulk-delete
- [ ] Notes routes: CRUD pages + CRUD blocks + reorder
- [ ] Calendar routes: CRUD events
- [ ] Team routes: list members + activity feed
- [ ] Notification routes: list + mark-read
- [ ] Socket.IO setup: rooms per user, emit on task/notif events

### Phase 5 — Mobile (React Native / Expo) (Week 8–9)

- [ ] Expo project setup with same design tokens
- [ ] Bottom tab navigator: Dashboard, Tasks, Notes, Calendar, Team
- [ ] Screen parity with web (same API integration)
- [ ] Offline cache with MMKV / AsyncStorage
- [ ] Push notifications (Expo Notifications + FCM)

### Phase 6 — Testing & Polish (Week 10)

- [ ] Unit tests: all utility functions (theme tokens, note helpers)
- [ ] Component tests: Render + interaction for each component (Vitest + @testing-library/react)
- [ ] API integration tests (Jest + Supertest)
- [ ] E2E tests: login → create task → delegate (Playwright/Detox for mobile)
- [ ] Accessibility audit (axe-core, Lighthouse ≥ 90)
- [ ] Performance audit (Lighthouse, React DevTools Profiler)

### Phase 7 — Deployment (Week 11)

- [ ] Production build: `npm run build` → Vercel deploy
- [ ] API deploy to Railway/Render with env vars
- [ ] MySQL on PlanetScale (serverless)
- [ ] CI/CD: GitHub Actions (lint → test → deploy on merge to `main`)

---

## 6. Database Schema

### `users`
```sql
CREATE TABLE users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,  -- bcrypt hash
  avatar_initials CHAR(2),             -- e.g. 'SP'
  is_online   TINYINT(1)   DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### `refresh_tokens`
```sql
CREATE TABLE refresh_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token       VARCHAR(512) NOT NULL UNIQUE,
  expires_at  TIMESTAMP    NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `tasks`
```sql
CREATE TABLE tasks (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255)  NOT NULL,
  description     TEXT,
  priority        ENUM('low','medium','high') DEFAULT 'medium',
  status          ENUM('pending','active','done') DEFAULT 'pending',
  assigned_by     INT UNSIGNED NOT NULL,  -- creator
  assigned_to     INT UNSIGNED NOT NULL,  -- current assignee
  parent_task_id  INT UNSIGNED,           -- delegation chain (nullable)
  due_date        DATE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_by)    REFERENCES users(id),
  FOREIGN KEY (assigned_to)    REFERENCES users(id),
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL
);
```

### `notes_pages`
```sql
CREATE TABLE notes_pages (
  id          VARCHAR(36)  PRIMARY KEY,  -- UUID
  user_id     INT UNSIGNED NOT NULL,
  parent_id   VARCHAR(36),               -- nullable (top-level)
  title       VARCHAR(255) DEFAULT 'Untitled',
  emoji       VARCHAR(8),
  position    INT UNSIGNED DEFAULT 0,    -- order among siblings
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `notes_blocks`
```sql
CREATE TABLE notes_blocks (
  id          VARCHAR(36)  PRIMARY KEY,
  page_id     VARCHAR(36)  NOT NULL,
  type        ENUM('h1','h2','h3','p','todo','quote','callout','code') DEFAULT 'p',
  content     TEXT,
  checked     TINYINT(1) DEFAULT 0,      -- for todo blocks
  position    INT UNSIGNED DEFAULT 0,
  FOREIGN KEY (page_id) REFERENCES notes_pages(id) ON DELETE CASCADE
);
```

### `events`
```sql
CREATE TABLE events (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  event_date  DATE NOT NULL,
  event_time  TIME,
  priority    ENUM('low','medium','high') DEFAULT 'low',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `notifications`
```sql
CREATE TABLE notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,      -- recipient
  type        ENUM('task_assigned','task_delegated','status_update','event_created','due_soon'),
  message     TEXT         NOT NULL,
  is_read     TINYINT(1)  DEFAULT 0,
  ref_id      INT UNSIGNED,               -- task or event ID it refers to
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 7. API Specification

### Base URL: `https://api.taskflow.app/v1`

#### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, receive tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |
| POST | `/auth/reset-password` | Request OTP |
| POST | `/auth/reset-password/verify` | Verify OTP + set new password |

#### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List tasks (query: `status`, `priority`, `assignee`) |
| POST | `/tasks` | Create task |
| GET | `/tasks/:id` | Get task detail |
| PUT | `/tasks/:id` | Update title, description, priority, due-date |
| PATCH | `/tasks/:id/status` | Update status only |
| PATCH | `/tasks/:id/delegate` | Delegate task to another user |
| DELETE | `/tasks/:id` | Delete task (creator only) |
| DELETE | `/tasks` | Bulk delete (body: `{ ids: [...] }`) |

#### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes/pages` | Get full page tree for current user |
| POST | `/notes/pages` | Create page |
| GET | `/notes/pages/:id` | Get page + blocks |
| PUT | `/notes/pages/:id` | Update title, emoji, position |
| DELETE | `/notes/pages/:id` | Delete page + all children |
| POST | `/notes/pages/:id/blocks` | Add block |
| PUT | `/notes/blocks/:id` | Update block content/checked |
| DELETE | `/notes/blocks/:id` | Delete block |
| PATCH | `/notes/pages/:id/reorder` | Reorder children (`{ orderedIds: [...] }`) |

#### Calendar

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/calendar/events` | List events (query: `year`, `month`) |
| POST | `/calendar/events` | Create event |
| PUT | `/calendar/events/:id` | Update event |
| DELETE | `/calendar/events/:id` | Delete event |

#### Team

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/team` | List all team members + task counts |
| GET | `/team/:id/activity` | Activity log for a member |

#### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications for current user |
| PATCH | `/notifications/read-all` | Mark all as read |
| PATCH | `/notifications/:id/read` | Mark one as read |

---

## 8. Frontend Guidelines (Web)

### 8.1 File & Folder Conventions

- Component files: **PascalCase** (e.g., `TaskDrawer.jsx`)
- Utility/data files: **camelCase** (e.g., `themes.js`)
- CSS modules suffix: `.module.css`
- One component per file; no anonymous default exports on complex components.

### 8.2 State Management Rules

- **Global state** (auth, theme, current user): React Context (`AuthContext`, `ThemeContext`).
- **Server state** (tasks, notes, events): React Query (`@tanstack/react-query`) — handles caching, refetching, optimistic updates.
- **Local UI state** (modal open, filter tab): `useState` inside the component.
- **Do not** store server data in plain `useState` — use React Query.

### 8.3 Styling Rules

- All colors come from `themes.js` token objects — **never** hardcode hex values inside components.
- CSS variables injected at `:root` for hover utilities (already in `App.jsx`).
- No 3rd-party UI libraries (MUI, Chakra, etc.) — custom components only.
- Use `px` for fixed sizes, `%` or `flex` for layout, avoid `vw/vh` inside content areas.
- Minimum touch target size: **44×44 px** (important for accessibility).

### 8.4 Component Rules

- Every component must accept a `t` (theme token) prop when it renders themed elements.
- Props must be destructured at the function signature level.
- Use `key={}` when rendering lists — never use array index as key for mutable lists.
- Conditionally rendered components (drawers, modals) use `&&` or `? :`, not CSS `display:none`.
- Always handle loading, empty, and error states in fetching components.

### 8.5 Performance Rules

- Wrap expensive computations in `useMemo`.
- Wrap callbacks passed to child components in `useCallback`.
- Lazy-load route-level components with `React.lazy` + `Suspense`.
- Use `React.memo` on heavy pure display components (e.g., task rows).
- Never call setState inside render; never mutate state directly.

---

## 9. Mobile Guidelines (React Native)

### 9.1 Navigation

- Use **Expo Router** (file-based routing, works with Expo Go).
- Tab navigator: Dashboard, Tasks, Notes, Calendar, Team.
- Stack navigator for drill-down: Task Detail, Member Profile, Note Page.

### 9.2 Design Tokens

- Share the same color tokens from `themes.js` (import in mobile via a shared package or copy).
- Use `StyleSheet.create` for all styles — no inline objects in JSX.
- Use `Platform.OS` checks only when absolutely necessary for platform-specific UI.

### 9.3 Offline Support

- Use **MMKV** (fast key-value) to persist last-fetched tasks and notes.
- On app launch, show cached data immediately; refetch in background.
- Show an offline banner when `NetInfo.isConnected === false`.
- All write actions (create/update/delete) must be queued and retried when back online.

### 9.4 Push Notifications

- Register device token with Expo Notifications on login.
- Send token to backend (`PATCH /users/me/push-token`).
- Backend sends via FCM (Android) / APNs (iOS) on task/notification events.
- Handle notification tap → navigate to the relevant task or event.

### 9.5 Performance

- Use `FlatList` (not `ScrollView`) for all long lists — tasks, notifications.
- Set `keyExtractor` to item `id` always.
- Use `getItemLayout` on fixed-height lists for instant scroll.
- Avoid anonymous functions in `renderItem` — use `useCallback`.

---

## 10. Backend Guidelines (Node.js)

### 10.1 Project Structure

```
server/
├── src/
│   ├── controllers/    # Route handlers (thin, delegates to services)
│   ├── services/       # Business logic
│   ├── models/         # DB query builders (mysql2 prepared statements)
│   ├── middleware/     # auth, rateLimit, validate, errorHandler
│   ├── routes/         # Express routers
│   ├── utils/          # jwt, mailer, socket, logger
│   └── app.js          # Express app + middleware chain
├── migrations/         # SQL migration files (numbered)
├── seeds/              # Dev seed data
├── tests/              # Jest test files
└── server.js           # Entry: app.listen + socket.io attach
```

### 10.2 Middleware Chain

```
Request
  → helmet() (security headers)
  → cors() (whitelist origins)
  → express.json() (parse body, limit 1 mb)
  → morgan() (access log)
  → rateLimiter (100 req/min/IP)
  → route handler
  → errorHandler (catch-all)
```

### 10.2.1 Core Dependencies Explanation

- **Helmet (`helmet`)**: A collection of middleware functions that automatically sets various HTTP headers (like `Content-Security-Policy` and `X-Frame-Options`) to protect the app from common web vulnerabilities like Cross-Site Scripting (XSS) and clickjacking.
- **Morgan (`morgan`)**: An HTTP request logger middleware. It logs details of incoming requests (URL, status code, response time) to the console, which is invaluable for debugging and monitoring API traffic.
- **MySQL2 (`mysql2`)**: A fast MySQL database client for Node.js. It is explicitly used instead of `mysql` because it supports Prepared Statements, which are crucial for preventing SQL injection attacks. It also has excellent built-in support for connection pools and modern Promises (`async`/`await`).

### 10.3 Auth Middleware

```js
// middleware/auth.js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### 10.4 Error Handling

- All controllers wrapped in `asyncWrapper(fn)` — no try/catch in route handlers.
- Error handler middleware: catches errors, maps them to HTTP status codes.
- Custom error classes: `AuthError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ValidationError` (422).

```js
// utils/asyncWrapper.js
const asyncWrapper = fn => (req, res, next) => fn(req, res, next).catch(next);
```

### 10.5 Input Validation

- Use **Joi** or **Zod** schema validation in middleware before the controller runs.
- Validate: data types, string length limits, enum values, date formats.
- Never trust `req.body` directly in database queries.
- Use **mysql2** parameterized prepared statements — never string interpolation in SQL.

### 10.6 Socket.IO Rules

- Each user joins a room named `user:<userId>` on connect.
- Emit events: `task:assigned`, `task:delegated`, `task:updated`, `notification:new`, `user:online`, `user:offline`.
- Authenticate Socket.IO connections with the access token (sent in handshake `auth` object).

---

## 11. Edge Case Handling

### Auth Edge Cases

| Edge Case | Handling |
|-----------|---------|
| Expired access token | Client catches 401 → calls `/auth/refresh` → retries original request once. |
| Expired refresh token | Redirect to login, clear all stored tokens. |
| Concurrent login on multiple devices | Each device gets its own refresh token; logout on one device does not affect others. |
| Duplicate email on register | Return `409 Conflict` with clear message. |
| OTP expired or wrong | Return `422 Unprocessable Entity`; allow max 3 attempts, then block for 15 min. |

### Task Edge Cases

| Edge Case | Handling |
|-----------|---------|
| Mark task Done when sub-task exists and is not Done | Block the action; return `409` with message listing blocking sub-tasks. |
| Delegate task to yourself | Reject with `400 Bad Request`. |
| Delegate a task that is already `Done` | Reject with `409`. |
| Delete a task that has delegated children | Delete parent; set `parent_task_id = NULL` on children (preserve children). |
| Create task with past due date | Allow (some tasks may be back-dated), but warn in response. |
| Task title empty | Reject with `422` on both client and server validation. |
| Bulk delete includes tasks you don't own | Silently skip non-owned tasks; return a partial-success report. |
| Assign task to user not in the team | Allow (peer-to-peer, any user can assign to any user). |

### Notes Edge Cases

| Edge Case | Handling |
|-----------|---------|
| Delete page with children | Show confirmation dialog listing child count. Recursive delete on confirm. |
| Delete the root page | Disallow; root is protected. |
| Slash command on empty block | Show block menu; on Escape, keep empty `p` block. |
| Auto-save when page is deleted mid-edit | Catch 404 on save, show toast "Page was deleted". |
| Very deep nesting (> 10 levels) | No hard limit, but UI collapses indentation at > 5 levels with a "…" indicator. |
| Concurrent edit from two devices | Last write wins; show "Updated from another device" toast on conflict. |

### Calendar Edge Cases

| Edge Case | Handling |
|-----------|---------|
| Event with no time specified | Display as all-day event. |
| Multiple events on same day | Show stacked colored dots (max 3 visible, "+N more" for extras). |
| Navigate to month with no events | Show empty state: "No events this month". |
| Task due date changes after appearing on calendar | Calendar auto-updates via React Query refetch on invalidation. |

### Notification Edge Cases

| Edge Case | Handling |
|-----------|---------|
| Socket disconnection | Missed notifications fetched on reconnect via `/notifications?since=<lastTimestamp>`. |
| Notification references a deleted task | Show notification with "Task deleted" and strike-through text. |
| Unread count badge overflow | Show `99+` if > 99 unread notifications. |

### Mobile-Specific Edge Cases

| Edge Case | Handling |
|-----------|---------|
| Device goes offline mid-operation | Queue action locally; retry exponentially when online (max 5 retries). |
| Push notification received while app is foregrounded | Show in-app toast, not system notification. |
| App backgrounded for > 30 min | Force token refresh before the next API call. |
| Screen rotation on tablet | Use responsive flex layouts; no fixed pixel widths. |
| Permission denied for push notifications | Silently continue; show in-app notification panel only. |

---

## 12. Testing Strategy

### 12.1 Unit Tests (Vitest / Jest)

```
tests/unit/
├── themes.test.js       # Token objects have all required keys
├── notes.test.js        # mkId uniqueness, mkBlock default values
├── taskStatus.test.js   # Status transition logic correctness
└── utils.test.js        # Date formatting, priority helpers
```

**Coverage target: ≥ 80 % for all utility functions.**

### 12.2 Component Tests (Vitest + @testing-library/react)

```
tests/components/
├── Dashboard.test.jsx   # Renders stats, task list, event panel
├── Tasks.test.jsx       # Filter tabs change visible rows
├── AssignModal.test.jsx # Form validates empty title, shows error
├── TaskDrawer.test.jsx  # Delegate button appears only for assignee
├── Sidebar.test.jsx     # Note tree expand/collapse
└── NotifPanel.test.jsx  # Mark all as read clears badge
```

**Key assertions per component:**
- Renders without crash.
- Handles empty data gracefully (no crashes on empty arrays).
- Interactive elements respond to user events.
- Theme tokens applied (dark/light classes present).

### 12.3 API Integration Tests (Jest + Supertest)

```
tests/api/
├── auth.test.js         # register, login, refresh, logout flows
├── tasks.test.js        # CRUD, status transitions, delegation rules
├── notes.test.js        # Page create/delete, block CRUD
├── calendar.test.js     # Event CRUD, month filter
└── notifications.test.js # Emission on events, mark-read
```

**Each test uses a dedicated test DB, seeded before each test suite and dropped after.**

### 12.4 E2E Tests (Playwright for Web / Detox for Mobile)

```
e2e/
├── auth.spec.ts          # Register → Login → Logout flow
├── task-flow.spec.ts     # Create task → Change status → Delegate → Verify chain
├── notes-flow.spec.ts    # Create page → Add blocks → Slash command → Delete
└── theme-toggle.spec.ts  # Toggle dark/light, verify CSS variable change
```

### 12.5 Accessibility Tests

- Run `@axe-core/react` in dev mode to catch violations at runtime.
- CI step: `axe-core` CLI on built app pages; fail if any critical violation found.
- Manual test: Navigate entire app using keyboard only. Tab order must be logical.

### 12.6 Performance Tests

- **Web:** Lighthouse CI in GitHub Actions — minimum scores: Performance 85, Accessibility 90, Best Practices 90.
- **Mobile:** React DevTools Profiler — no component should re-render > 2× on a single user action.
- **Backend:** k6 load test — 100 concurrent users, 300 req/min sustained for 2 min → p95 latency < 400 ms.

---

## 13. Coding Rules & Conventions

### General

- **Language:** JavaScript (ES2022+). TypeScript strongly recommended for the backend.
- **Semicolons:** Required.
- **Quotes:** Double quotes for JSX strings, single quotes for JS strings.
- **Indentation:** 4 spaces (no tabs).
- **Max line length:** 120 characters.
- **Trailing commas:** Required in multi-line arrays/objects.
- **No `console.log` in production code** — use a logger utility.

### React-Specific

- **No class components** — functional components + hooks only.
- **No `any` in TypeScript** (if used) — use proper types or generics.
- Hooks must obey the Rules of Hooks (no conditional hooks).
- All effects must specify a complete dependency array.
- Destructure all props at the function signature (`{ t, task, onClose }`).
- Use `const` → never `var`; use `let` only when the variable must be reassigned.

### Git Workflow

```
main           ← production-ready, protected branch
develop        ← integration branch
feature/<name> ← one branch per feature
fix/<issue>    ← one branch per bugfix
```

- **Commit format:** `type(scope): short description`
  - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`
  - Example: `feat(tasks): add delegation badge to task table`
- Pull requests must pass lint + test CI before merge.
- No force-push to `main` or `develop`.

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| React Components | PascalCase | `TaskDrawer` |
| Functions | camelCase | `addNotePage()` |
| CSS classes | kebab-case | `.task-row` |
| DB tables | snake_case | `notes_pages` |
| DB columns | snake_case | `parent_task_id` |
| Env variables | SCREAMING_SNAKE | `JWT_SECRET` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |

---

## 14. Security Rules

### Backend Security

1. **Passwords** stored as bcrypt hash with `saltRounds = 12`. Never log or return passwords.
2. **JWTs** signed with `HS256` and a secret ≥ 32 random bytes. Access tokens expire in 15 min.
3. **Refresh tokens** stored as SHA-256 hash in DB. Raw token only returned to client once.
4. **CORS** whitelist: only allowed origins. No wildcard `*` in production.
5. **Helmet.js** enabled: sets `Content-Security-Policy`, `X-Frame-Options`, `X-XSS-Protection`.
6. **Rate limiting:** 100 req/min per IP on all routes; 5 req/15 min on `/auth/login` and `/auth/reset-password`.
7. **SQL injection:** Use mysql2 prepared statements exclusively. No string concatenation in queries.
8. **Input sanitization:** Strip all HTML from text inputs server-side (DOMPurify equivalent, e.g., `sanitize-html`).
9. **File uploads** (if added): validate MIME type server-side; store in S3, never on local disk.
10. **Sensitive env vars** never committed to Git — use `.env` + `.gitignore`.

### Frontend Security

1. Never store JWT access token in `localStorage` — keep in memory (React state/Context).
2. Store refresh token in `HttpOnly; Secure; SameSite=Strict` cookie (set by server).
3. Never put sensitive logic or secrets in frontend code — all validation duplicated on server.
4. Sanitize any user-generated content rendered as HTML (e.g., note callout blocks).

---

## 15. Deployment Checklist

### Pre-Deploy

- [ ] `npm run build` succeeds with 0 errors and 0 warnings.
- [ ] All environment variables set in deployment platform (not in code).
- [ ] `.env.example` updated with all required variable names (no values).
- [ ] DB migrations run successfully on production DB.
- [ ] Seed data removed from production environment.

### Web (Vercel)

- [ ] `vite.config.js` `base` set correctly.
- [ ] HTTP → HTTPS redirect enabled.
- [ ] `vercel.json` sets SPA fallback rewrite rule: `/* → /index.html`.

### API (Railway / Render)

- [ ] `NODE_ENV=production` set.
- [ ] `PORT` env var used (not hardcoded).
- [ ] PM2 / cluster mode configured for multi-core utilization.
- [ ] Health check endpoint: `GET /health` returns `200 OK`.

### Database (PlanetScale / RDS)

- [ ] Backups enabled (daily automated snapshots).
- [ ] Connection pool configured (`max: 20, idleTimeout: 30000`).
- [ ] Read replica configured for reporting queries (if scale requires).

### Post-Deploy Smoke Tests

- [ ] Register a new user and login.
- [ ] Create a task, change its status, and delegate it.
- [ ] Create a note page, add blocks, delete a block.
- [ ] Toggle dark/light theme — verify in both modes.
- [ ] Receive a real-time notification via Socket.IO.
- [ ] Lighthouse score ≥ 85 on production URL.

---

> **Document maintained by:** Siddhant Pal & Shubham Mendhe  
> **Last updated:** February 25, 2025
