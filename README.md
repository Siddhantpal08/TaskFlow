# TaskFlow

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

TaskFlow is a premium, high-performance peer-to-peer productivity suite designed to merge the best elements of task delegation, deep nested note-taking, and real-time collaboration.

## 🔗 Live Deployments

- **Web Frontend:** [https://taskflow-by-crevio.vercel.app](https://taskflow-by-crevio.vercel.app)
- **Backend API:** Hosted on Render
- **Database:** Aiven MySQL 8 (Cloud)

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
- **Avatars & Profiles**: Users can upload custom avatars or fallback to auto-generated colorful initial bubbles.
- **Bio & Identity**: Users maintain a customizable bio and social presence within the internal network.

### 3.2 Dashboard & Command Center
- **Context-Aware Hero Strip**: Contextual greeting paired with a rotating motivational quote.
- **Progress Ring**: Animated SVG circular progress bar calculates the percentage of completed tasks.
- **Metrics Grid**: Glowing, animated stat cards display Total Tasks, Completed Tasks, In Progress, and Overdue.
- **Focus Today**: A dedicated widget pulling tasks exclusively due on the current calendar day.
- **Command Palette (`Ctrl+K`)**: Global search bar to instantly navigate, toggle dark mode, or initiate tasks.

### 3.3 Task Management Engine (Delegation & Approvals)
- **Peer-to-Peer Delegation**: Assign tasks to yourself, or delegate them to Friends and Team Members. 
- **Parent/Child Hierarchies**: A delegated task becomes a "Child". The system algorithmically prevents a Parent task from being marked as `Done` if Child tasks are active.
- **Approval Workflow**: Assignees complete tasks, triggering a `pending_approval` state for the Assigner to manually Review and Approve.
- **Slide-In Task Drawer**: Smoothly animated right-side drawer containing granular details: sub-tasks, priority tags, descriptions, and an activity audit log.
- **Dynamic Filters**: Filter views by All, Pending, Active, Done, Delegated, and Needs Approval.

### 3.4 Infinite Notes Suite (Notion-Style Block Editor)
- **Infinite Nesting**: Users can create sub-pages within sub-pages infinitely.
- **Breadcrumb Navigation**: Dynamic top-bar breadcrumbs track the exact nested path.
- **Block-Based Editing**: Every paragraph, header, or list is a unique row in the database.
- **Slash Menu (`/`)**: Summons a floating menu to instantly convert blocks into Headers, To-Do Checklists, Blockquotes, Code Snippets, etc.
- **Drag & Drop**: Grab block handles (⋮⋮) to physically drag and reorder paragraphs and lists.
- **Auto-Save Engine**: Keystrokes are debounced by `500ms` and patches are continuously synced to the backend.

### 3.5 Calendar & Events
- **Custom Grid Engine**: Rendered mathematically using raw JavaScript Date objects.
- **Month/Week Toggles**: Switch between high-level monthly overviews and dense weekly schedules.
- **Color Coding**: Events are hashed to a theme color based on their ID.

### 3.6 Team & Collaboration Tools
- **Team Hub**: Create corporate or study groups with role management (Owners, Admins, Members).
- **Leave Requests**: HR-lite workflow for submitting and approving absence requests.
- **Friend System**: Send P2P friend requests to enable cross-account task delegation outside of formal teams.

### 3.7 Guide Hub & Community Board
- **Feature Documentation**: Read-only guides explaining how to use TaskFlow's advanced features.
- **Support Tickets**: Submit private bug reports or billing issues directly to admins.
- **Community Board**: Public forum for Feature Requests and UI/UX Suggestions with an **Upvoting System**.

### 3.8 Admin Controls (God Mode)
- **Ticket Management**: Read all global support tickets, change statuses, and trigger automated resolution emails.
- **Feedback Moderation**: Mark feature requests as `done`, delete spam, and monitor platform health.

---

## 4. Mobile Application Ecosystem
The React Native companion app brings TaskFlow to iOS and Android.
- **Bottom Tab Navigation**: Fluid, native-feeling transitions between Dashboard, Tasks, Notes, and Calendar.
- **Adaptive Theming**: Inherits exact color hexes from the web platform for brand consistency.
- **Mobile Block Editor**: Notion-style editor ported to mobile, utilizing `KeyboardAvoidingView`.
- **Socket Integration**: Listens to real-time Socket.IO rooms ensuring seamless sync with the web client.

---

## 5. Backend Infrastructure & Database Mechanics

### Security & Optimization
- **Rate Limiting**: `express-rate-limit` prevents brute-force attacks.
- **XSS & Injection Protection**: Raw SQL parameters (`?`) ensure immunity to SQL injection. 
- **Socket Rooms**: Users only join a room bearing their specific UUID to prevent data leakage.

### Background Jobs (Cron)
- **Event Reminder Job**: Scans `tasks` and `events` for items due within 24 hours and alerts active users via WebSockets.

### Database Schema Map
- **`users`**: `id`, `name`, `email`, `password`, `avatar_url`, `role`
- **`tasks`**: `id`, `title`, `description`, `priority`, `status`, `assigned_by`, `assigned_to`, `parent_task_id`, `due_date`
- **`notes_pages`**: `id` (UUID), `user_id`, `parent_id`, `title`, `emoji`, `position`
- **`notes_blocks`**: `id` (UUID), `page_id`, `type`, `content`, `position`, `checked`
- **`support_tickets`**: `id`, `user_id`, `title`, `category`, `description`, `status`, `upvotes`
- **`feedback`**: `id`, `user_id`, `rating`, `message`, `status`, `upvotes`

---

## 6. Deployment & DevOps

- **Web Frontend**: CI/CD pipeline integrated directly with Vercel. Pushes to `main` trigger a production build.
- **Backend API**: Hosted on Render. Uses `app.set('trust proxy', 1)`.
- **Database**: Cloud-hosted Aiven MySQL 8 instance with automated nightly backups.
- **Mobile Builds**: Compiled natively via Expo EAS into standalone `.apk` and `.ipa` binaries.
