# TaskFlow: Comprehensive End-to-End Project Documentation

TaskFlow is a premium, high-performance peer-to-peer productivity suite designed to merge the best elements of task delegation, deep nested note-taking, and real-time collaboration.

This document serves as the absolute master overview, cataloging every single feature, mechanic, and technical design choice across the Web, Backend, and Mobile platforms.

---

## 1. Executive Summary & Philosophy

TaskFlow is built on the philosophy of **"Flow State Productivity"**. It eliminates cluttered interfaces in favor of a sleek, dark-mode-first aesthetic. 
- **No Page Reloads**: The entire web application operates as a seamless Single Page Application without reliance on traditional routing libraries.
- **Peer-to-Peer Foundation**: Unlike traditional top-down project management tools, TaskFlow allows any user to assign tasks to any other connected user, creating dynamic, organic delegation chains.
- **Immediate Context**: Every action—from dragging a note block to approving a delegated task—is pushed in real-time across all connected devices via WebSockets.

---

## 2. Complete Technology Stack

### 🌐 Web Frontend (`taskflow-website`)
- **Core**: React 18, Vite 5 (Pure JS + JSX, No TypeScript).
- **State & Routing**: Context API for global state (`AuthContext`, `DataContext`). Custom state-based router (`activePage`) avoids the overhead of `react-router`.
- **Styling Engine**: 100% Custom CSS relying on CSS variables and a JavaScript theming dictionary (`themes.js`). No external UI frameworks (No Tailwind, MUI, etc.) to ensure absolute control over animations and border-radius aesthetics.
- **Onboarding**: `react-joyride` for interactive, localized feature tours.

### ⚙️ Backend API & Real-Time Engine (`taskflow-backend`)
- **Core**: Node.js, Express 4.18 (CommonJS module system).
- **Database**: Aiven MySQL 8 (Cloud Database).
- **Querying**: Raw SQL via `mysql2` connection pool using strictly prepared statements. No ORMs (like Prisma or Sequelize) are used to maximize query execution speed and control.
- **Real-Time**: Socket.IO 4.7 for bi-directional event pushing.
- **Authentication**: JWT (JSON Web Tokens). Access tokens are short-lived, while refresh tokens are stored securely in `HttpOnly` cookies.
- **Mail Services**: `nodemailer` integrated with Brevo (Sendinblue) for OTPs and transactional alerts.

### 📱 Mobile Companion (`taskflow-mobile`)
- **Core**: React Native 0.81.5, Expo 54.
- **Navigation**: `@react-navigation/bottom-tabs` and native stack navigators.
- **Storage**: `AsyncStorage` for local token caching.

---

## 3. Comprehensive Feature Breakdown

### 3.1 Authentication & User Identity
- **Secure Access**: Standard Email/Password registration encrypted via `bcrypt`.
- **Password Recovery**: Automated OTP pipeline sending 6-digit codes via email.
- **Avatars & Profiles**: Users can upload custom avatars (handled via `avatar_url`), or the system gracefully falls back to auto-generated colorful initial bubbles (`avatar_initials`).
- **Bio & Identity**: Users maintain a customizable bio and social presence within the internal network.

### 3.2 Dashboard & Command Center
- **Context-Aware Hero Strip**: The dashboard reads the local machine time and delivers a contextual greeting ("Good morning", "Good evening") paired with a rotating motivational quote.
- **Progress Ring**: A mathematical, animated SVG circular progress bar calculates the percentage of completed tasks dynamically against the total assigned workload.
- **Metrics Grid**: Four glowing, animated stat cards display:
  - Total Tasks (All-time tracking)
  - Completed Tasks (Success rate)
  - In Progress (Currently active)
  - Overdue (Pulsing red alert for tasks past their due date)
- **Focus Today**: A dedicated widget pulling tasks exclusively due on the current calendar day.
- **Command Palette (`Ctrl+K`)**: A global event listener allows power users to summon an invisible search bar from anywhere to instantly navigate pages, toggle dark mode, or initiate task creation without using a mouse.

### 3.3 Task Management Engine (Delegation & Approvals)
TaskFlow's task engine goes far beyond simple checklists.
- **Peer-to-Peer Delegation**: Users can assign tasks to themselves, or directly delegate them to Friends and Team Members. 
- **Parent/Child Hierarchies**: A delegated task becomes a "Child" (`parent_task_id`). 
- **Blocker Mechanics**: The system algorithmically prevents a Parent task from being marked as `Done` if any of its Child tasks are still pending or active.
- **Approval Workflow**: 
  1. Assignee finishes the work and clicks "Complete".
  2. The task enters a `pending_approval` state.
  3. The Assigner (Creator) receives a notification and must manually Review and Approve the work.
  4. Only upon approval does the task finalize to `done`.
- **Slide-In Task Drawer**: Clicking a task smoothly animates a right-side drawer containing granular details: sub-tasks, priority tags (Low, Medium, High, Critical), descriptions, and an activity audit log.
- **Dynamic Filters**: Quick-toggle pill buttons to filter views by: All, Pending, Active, Done, Delegated, and Needs Approval.

### 3.4 Infinite Notes Suite (Notion-Style Block Editor)
A deeply engineered, hierarchical document system built entirely from scratch.
- **Infinite Nesting**: Every user is automatically provisioned a root "Workspace" page. From there, users can create sub-pages within sub-pages infinitely.
- **Breadcrumb Navigation**: Dynamic top-bar breadcrumbs track the exact nested path, allowing rapid traversal back up the tree.
- **Block-Based Editing**: Text isn't stored as a single blob. Every paragraph, header, or list is a unique row in the database (`notes_blocks`).
- **Slash Menu (`/`)**: Typing `/` summons a floating menu to instantly convert the current block into:
  - Headers (H1, H2, H3)
  - To-Do Checklists
  - Blockquotes
  - Code Snippets
  - Dividers
- **Drag & Drop**: Users can grab block handles (⋮⋮) to physically drag and reorder paragraphs and lists. The frontend calculates the new geometric `position` indices and silently syncs to the backend.
- **Auto-Save Engine**: To prevent data loss and UI stutter, keystrokes are debounced by `500ms`. The system continuously patches diffs to the backend transparently.
- **Focus Modes**: Includes a specialized "Typewriter/Lyrics Mode" for distraction-free writing.

### 3.5 Calendar & Events
- **Custom Grid Engine**: The calendar is rendered mathematically using raw JavaScript Date objects, completely avoiding heavy external calendar libraries.
- **Month/Week Toggles**: Users can switch between high-level monthly overviews and dense weekly schedules.
- **Color Coding**: Events are automatically hashed to a theme color (Red, Amber, Green, Blue, Accent) based on their ID to maintain visual variety.

### 3.6 Team & Collaboration Tools
- **Team Hub**: Users can create corporate or study groups.
- **Role Management**: Owners, Admins, and standard Members.
- **Leave Requests**: A built-in HR-lite workflow where members can submit absence requests. Admins receive dashboard notifications to Approve or Reject the leave.
- **Friend System**: Outside of formal teams, users can send P2P friend requests to enable cross-account task delegation.

### 3.7 Guide Hub & Community Board
An interactive documentation and feedback portal.
- **Feature Documentation**: Read-only guides explaining how to use TaskFlow's advanced features.
- **Support Tickets**: Users can submit private bug reports or billing issues directly to admins.
- **Community Board**: A public forum where users submit Feature Requests and UI/UX Suggestions.
- **Upvoting System**: Users can upvote community board posts. The board is sorted by top-voted features, allowing the developers to gauge community demand.
- **Status Tags**: Admin-applied tags (`Open`, `Closed`) visibly update the community on the progress of tickets.

### 3.8 Admin Controls (God Mode)
Users with the `admin` role in the database gain access to a hidden Admin Panel.
- **Ticket Management**: Admins can read all global support tickets, change their statuses to `closed`, and trigger automated resolution emails back to the submitting user.
- **Feedback Moderation**: Admins can mark feature requests as `done`, delete spam, and monitor platform health.

---

## 5. Mobile Application Ecosystem
The React Native companion app brings TaskFlow to iOS and Android.
- **Bottom Tab Navigation**: Fluid, native-feeling transitions between Dashboard, Tasks, Notes, and Calendar.
- **Adaptive Theming**: Inherits the exact color hexes from the web platform for brand consistency.
- **Mobile Block Editor**: The Notion-style editor was carefully ported to mobile, utilizing `KeyboardAvoidingView` to ensure the on-screen keyboard never covers the text cursor.
- **Socket Integration**: Listens to the same real-time Socket.IO rooms as the web client, ensuring tasks completed on a laptop instantly cross off on the phone screen.

---

## 6. Backend Infrastructure & Database Mechanics

### Security & Optimization
- **Rate Limiting**: `express-rate-limit` prevents brute-force attacks on login and OTP routes.
- **XSS & Injection Protection**: Raw SQL parameters (`?`) ensure 100% immunity to SQL injection. React naturally escapes DOM outputs to prevent Cross-Site Scripting.
- **Socket Rooms**: Users only join a room bearing their specific UUID (`user:1234`). Events are targeted exclusively to that room, preventing data leakage to other clients.

### Background Jobs (Cron)
- **Event Reminder Job**: A background worker runs periodically, scanning the `tasks` and `events` tables for items due within the next 24 hours. It constructs a payload and fires it down the WebSockets pipe to alert active users.

### Database Schema Map
- **`users`**: `id`, `name`, `email`, `password`, `avatar_url`, `role`
- **`tasks`**: `id`, `title`, `description`, `priority`, `status`, `assigned_by`, `assigned_to`, `parent_task_id`, `due_date`
- **`notes_pages`**: `id` (UUID), `user_id`, `parent_id`, `title`, `emoji`, `position`
- **`notes_blocks`**: `id` (UUID), `page_id`, `type`, `content`, `position`, `checked`
- **`support_tickets`**: `id`, `user_id`, `title`, `category`, `description`, `status`, `upvotes`
- **`feedback`**: `id`, `user_id`, `rating`, `message`, `status`, `upvotes`

---

## 7. Deployment & DevOps

- **Web Frontend**: CI/CD pipeline integrated directly with Vercel. Pushes to the `main` branch automatically trigger a production build (`vite build`).
- **Backend API**: Hosted on Render. Uses `app.set('trust proxy', 1)` to accurately read client IP addresses through Render's reverse proxy layer.
- **Database**: Cloud-hosted Aiven MySQL 8 instance. Automated nightly backups.
- **Mobile Builds**: Compiled natively via Expo EAS (Expo Application Services) into standalone `.apk` and `.ipa` binaries.
