import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import { tasksApi } from '../api/tasks.js';
import { eventsApi } from '../api/events.js';
import { teamApi } from '../api/team.js';
import { notificationsApi } from '../api/notifications.js';

const DataContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? new URL(import.meta.env.VITE_API_URL).origin
    : 'http://localhost:5000';

export function DataProvider({ children }) {
    const { user, token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [taskDates, setTaskDates] = useState([]);
    const [teams, setTeams] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    // ─── Stable refresh helpers ────────────────────────────────────────────────
    const refreshTeams = useCallback(async () => {
        try {
            const [tRes, mRes] = await Promise.all([
                teamApi.getMyTeams(),
                teamApi.getMembers()
            ]);
            setTeams(Array.isArray(tRes.data) ? tRes.data : []);
            setTeamMembers(Array.isArray(mRes.data) ? mRes.data : []);
        } catch (e) { console.error('refreshTeams failed:', e); }
    }, []);

    const refreshNotifications = useCallback(async () => {
        try {
            const res = await notificationsApi.list();
            let notifs = Array.isArray(res.data) ? res.data 
                : (res.data?.notifications || []);
            const clearedAt = parseInt(localStorage.getItem('tf_notifs_cleared_at') || '0', 10);
            if (clearedAt) notifs = notifs.filter(n => new Date(n.created_at).getTime() > clearedAt);
            setNotifications(notifs);
        } catch (e) { console.error('refreshNotifications failed:', e); }
    }, []);

    const refreshTasks = useCallback(async () => {
        try {
            const res = await tasksApi.list();
            setTasks(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error('refreshTasks failed:', e); }
    }, []);

    // ─── Initial data load ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!user || !token) { setLoading(false); return; }

        const now = new Date();
        setLoading(true);
        Promise.all([
            tasksApi.list(),
            eventsApi.list(now.getFullYear(), now.getMonth() + 1),
            teamApi.getMyTeams(),
            teamApi.getMembers(),
            notificationsApi.list(),
        ]).then(([t, e, ts, tm, n]) => {
            setTasks(Array.isArray(t.data) ? t.data : []);
            const calData = e.data || {};
            setEvents(Array.isArray(calData) ? calData : (calData.events || []));
            setTaskDates(calData.taskDates || []);
            setTeams(Array.isArray(ts.data) ? ts.data : []);
            setTeamMembers(Array.isArray(tm.data) ? tm.data : []);
            let notifs = Array.isArray(n.data) ? n.data : (n.data?.notifications || []);
            const clearedAt = parseInt(localStorage.getItem('tf_notifs_cleared_at') || '0', 10);
            if (clearedAt) notifs = notifs.filter(notif => new Date(notif.created_at).getTime() > clearedAt);
            setNotifications(notifs);
        }).catch(console.error)
            .finally(() => setLoading(false));

        // Refresh when user returns to this tab
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') refreshAll();
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [user, token]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Socket.IO real-time sync ──────────────────────────────────────────────
    useEffect(() => {
        if (!user || !token) return;

        const socket = io(SOCKET_URL, {
            auth: { token, userId: user.id },
            query: { userId: user.id },
            // Robust reconnection for Render free-tier spin-down
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            // Re-join user room after reconnect (Render spin-down recovery)
            socket.emit('join', { userId: user.id });
        });

        socket.on('connect_error', (err) => {
            console.warn('[Socket] connect_error:', err.message);
        });

        // ── Task events ────────────────────────────────────────────────────────
        socket.on('task:assigned', (task) => {
            if (!task?.id) return;
            setTasks(prev => [task, ...(prev || []).filter(t => t.id !== task.id)]);
            setNotifications(prev => [{
                id: `local_${Date.now()}`, type: 'task_assigned',
                message: `New task assigned: "${task.title}"`, is_read: false,
                created_at: new Date().toISOString()
            }, ...(prev || [])]);
        });

        socket.on('task:updated', (task) => {
            if (!task?.id) return;
            setTasks(prev => {
                const arr = prev || [];
                if (arr.some(t => t.id === task.id)) {
                    return arr.map(t => t.id === task.id ? task : t);
                }
                return [task, ...arr];
            });
        });

        socket.on('task:delegated', (task) => {
            if (!task?.id) return;
            setTasks(prev => [task, ...(prev || []).filter(t => t.id !== task.id)]);
            setNotifications(prev => [{
                id: `local_${Date.now()}`, type: 'task_delegated',
                message: `Task delegated to you: "${task.title}"`, is_read: false,
                created_at: new Date().toISOString()
            }, ...(prev || [])]);
        });

        // Task refused — update the parent task's status for the assigner
        socket.on('task:refused', (task) => {
            if (!task?.id) return;
            setTasks(prev => (prev || []).map(t => t.id === task.id ? task : t));
        });

        // ── Notification events ────────────────────────────────────────────────
        socket.on('notification:new', (notif) => {
            if (!notif) return;
            const clearedAt = parseInt(localStorage.getItem('tf_notifs_cleared_at') || '0', 10);
            if (clearedAt && new Date(notif.created_at).getTime() <= clearedAt) return;
            setNotifications(prev => [notif, ...(prev || [])]);
            // If a team member joined, refresh our team members list
            if (notif.type === 'team_joined') {
                refreshTeams();
            }
        });

        // ── Online presence ────────────────────────────────────────────────────
        socket.on('users:online_list', ({ onlineUsers }) => {
            setOnlineUsers(new Set(onlineUsers));
        });
        socket.on('user:online', ({ userId }) => {
            setOnlineUsers(prev => new Set([...prev, String(userId)]));
        });
        socket.on('user:offline', ({ userId }) => {
            setOnlineUsers(prev => { const s = new Set(prev); s.delete(String(userId)); return s; });
        });

        // ── Team events ────────────────────────────────────────────────────────
        // Emitted when a member joins or is removed — refresh team member list
        socket.on('team:refresh', () => refreshTeams());
        socket.on('team:member_added', () => refreshTeams());
        socket.on('team:member_removed', () => refreshTeams());

        socket.on('team:leave_request', () => {
            // Admin: a leave request notification arrives — refresh notifications
            refreshNotifications();
        });

        // Team deleted by admin — immediately wipe tasks/members, then re-fetch
        socket.on('team:deleted', () => {
            setTasks([]);
            setTeamMembers([]);
            // Re-fetch to get any remaining personal/other-team tasks
            refreshTasks();
            refreshTeams();
            refreshNotifications();
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user, token]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Task mutations ────────────────────────────────────────────────────────
    const createTask = async (data) => {
        const res = await tasksApi.create(data);
        const newTask = res.data;
        if (newTask?.id) {
            setTasks(prev => (prev || []).some(t => t.id === newTask.id) ? prev : [newTask, ...(prev || [])]);
        }
        return newTask;
    };

    const updateTaskStatus = async (id, status) => {
        const res = await tasksApi.updateStatus(id, status);
        setTasks(prev => (prev || []).map(t => t.id === id ? res.data : t));
        return res.data;
    };

    const updateTask = async (id, data) => {
        const res = await tasksApi.update(id, data);
        setTasks(prev => (prev || []).map(t => t.id === id ? res.data : t));
        return res.data;
    };

    const delegateTask = async (id, assigned_to) => {
        const res = await tasksApi.delegate(id, assigned_to);
        setTasks(prev => (prev || []).some(t => t.id === res.data.id) ? prev : [res.data, ...(prev || [])]);
        return res.data;
    };

    const splitTask = async (id, subtasks) => {
        const res = await tasksApi.split(id, subtasks);
        setTasks(prev => {
            const newTasks = (res.data || []).filter(nt => !(prev || []).some(pt => pt.id === nt.id));
            return [...newTasks, ...(prev || [])];
        });
        return res.data;
    };

    const deleteTask = async (id) => {
        await tasksApi.delete(id);
        setTasks(prev => (prev || []).filter(t => t.id !== id));
    };

    // ─── Event mutations ───────────────────────────────────────────────────────
    const createEvent = async (data) => {
        const res = await eventsApi.create(data);
        setEvents(prev => [...(prev || []), res.data]);
        return res.data;
    };

    const deleteEvent = async (id) => {
        await eventsApi.delete(id);
        setEvents(prev => (prev || []).filter(e => e.id !== id));
    };

    const fetchEventsForMonth = async (year, month) => {
        try {
            const res = await eventsApi.list(year, month);
            const calData = res.data || {};
            setEvents(Array.isArray(calData) ? calData : (calData.events || []));
            setTaskDates(calData.taskDates || []);
        } catch (err) {
            console.error('Failed to fetch events for month:', err);
        }
    };

    // ─── Notification mutations ────────────────────────────────────────────────
    const markNotifRead = async (id) => {
        await notificationsApi.markRead(id);
        setNotifications(prev => (prev || []).map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const markAllNotifRead = async () => {
        await notificationsApi.markAllRead();
        setNotifications(prev => (prev || []).map(n => ({ ...n, is_read: true })));
    };

    const clearAllNotif = async () => {
        setNotifications([]);
        localStorage.setItem('tf_notifs_cleared_at', Date.now().toString());
        try { await notificationsApi.clearAll(); } catch(e) {}
    };

    const unreadCount = (notifications || []).filter(n => !n.is_read).length;

    // ─── Manual full refresh ───────────────────────────────────────────────────
    const refreshAll = async () => {
        try {
            const now = new Date();
            const [taskRes, tRes, memberRes, notifRes] = await Promise.all([
                tasksApi.list(),
                teamApi.getMyTeams(),
                teamApi.getMembers(),
                notificationsApi.list(),
            ]);
            setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
            setTeams(Array.isArray(tRes.data) ? tRes.data : []);
            setTeamMembers(Array.isArray(memberRes.data) ? memberRes.data : []);
            let notifs = Array.isArray(notifRes.data) ? notifRes.data : (notifRes.data?.notifications || []);
            const clearedAt = parseInt(localStorage.getItem('tf_notifs_cleared_at') || '0', 10);
            if (clearedAt) notifs = notifs.filter(notif => new Date(notif.created_at).getTime() > clearedAt);
            setNotifications(notifs);
        } catch (e) { console.error('refreshAll failed:', e); }
    };

    return (
        <DataContext.Provider value={{
            tasks: tasks || [], events: events || [], taskDates, teams: teams || [], teamMembers: teamMembers || [],
            notifications: notifications || [], onlineUsers,
            loading, unreadCount, refreshTeams, refreshAll, refreshTasks,
            createTask, updateTaskStatus, updateTask, delegateTask, splitTask, deleteTask,
            createEvent, deleteEvent, fetchEventsForMonth,
            markNotifRead, markAllNotifRead, clearAllNotif,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used inside DataProvider');
    return ctx;
};
