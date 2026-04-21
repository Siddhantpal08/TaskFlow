import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import { tasksApi } from '../api/tasks.js';
import { eventsApi } from '../api/events.js';
import { teamApi } from '../api/team.js';
import { notificationsApi } from '../api/notifications.js';

const DataContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api/v1', '')
    : 'http://localhost:5000';

export function DataProvider({ children }) {
    const { user, token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [taskDates, setTaskDates] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    // ─── Initial data load ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!user || !token) { setLoading(false); return; }

        const now = new Date();
        setLoading(true);
        Promise.all([
            tasksApi.list(),
            eventsApi.list(now.getFullYear(), now.getMonth() + 1),
            teamApi.getMembers(),
            notificationsApi.list(),
        ]).then(([t, e, tm, n]) => {
            setTasks(t.data || []);
            // Calendar API returns { events: [...], taskDates: [...] }
            const calData = e.data || {};
            setEvents(Array.isArray(calData) ? calData : (calData.events || []));
            setTaskDates(calData.taskDates || []);
            setTeamMembers(tm.data || []);
            // Notifications returns { data: { notifications, unreadCount } }
            setNotifications(n.data?.notifications || n.data || []);
            setNotifications(n.data?.notifications || n.data || []);
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, [user, token]);

    const refreshTeams = async () => {
        try {
            const { data } = await teamApi.getMembers();
            setTeamMembers(data || []);
        } catch (e) { console.error(e); }
    };

    // ─── Socket.IO real-time sync ──────────────────────────────────────────────
    useEffect(() => {
        if (!user || !token) return;

        const socket = io(SOCKET_URL, {
            auth: { token, userId: user.id },
        });
        socketRef.current = socket;

        socket.on('task:assigned', (task) => {
            setTasks(prev => [task, ...prev.filter(t => t.id !== task.id)]);
            setNotifications(prev => [{
                id: Date.now(), type: 'task_assigned',
                message: `New task assigned: "${task.title}"`, is_read: false, created_at: new Date().toISOString()
            }, ...prev]);
        });

        socket.on('task:updated', (task) => {
            setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        });

        socket.on('task:delegated', (task) => {
            setTasks(prev => [task, ...prev.filter(t => t.id !== task.id)]);
            setNotifications(prev => [{
                id: Date.now(), type: 'task_delegated',
                message: `Task delegated to you: "${task.title}"`, is_read: false, created_at: new Date().toISOString()
            }, ...prev]);
        });

        socket.on('notification:new', (notif) => {
            setNotifications(prev => [notif, ...prev]);
        });

        socket.on('user:online', ({ userId }) => {
            setOnlineUsers(prev => new Set([...prev, String(userId)]));
        });

        socket.on('user:offline', ({ userId }) => {
            setOnlineUsers(prev => { const s = new Set(prev); s.delete(String(userId)); return s; });
        });

        return () => { socket.disconnect(); socketRef.current = null; };
    }, [user, token]);

    // ─── Task mutations ────────────────────────────────────────────────────────
    const createTask = async (data) => {
        const res = await tasksApi.create(data);
        setTasks(prev => prev.some(t => t.id === res.data.id) ? prev : [res.data, ...prev]);
        return res.data;
    };

    const updateTaskStatus = async (id, status) => {
        const res = await tasksApi.updateStatus(id, status);
        setTasks(prev => prev.map(t => t.id === id ? res.data : t));
        return res.data;
    };

    const updateTask = async (id, data) => {
        const res = await tasksApi.update(id, data);
        setTasks(prev => prev.map(t => t.id === id ? res.data : t));
        return res.data;
    };

    const delegateTask = async (id, assigned_to) => {
        const res = await tasksApi.delegate(id, assigned_to);
        setTasks(prev => prev.some(t => t.id === res.data.id) ? prev : [res.data, ...prev]);
        return res.data;
    };

    const deleteTask = async (id) => {
        await tasksApi.delete(id);
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    // ─── Event mutations ───────────────────────────────────────────────────────
    const createEvent = async (data) => {
        const res = await eventsApi.create(data);
        setEvents(prev => [...prev, res.data]);
        return res.data;
    };

    const deleteEvent = async (id) => {
        await eventsApi.delete(id);
        setEvents(prev => prev.filter(e => e.id !== id));
    };

    /**
     * Fetch events + task due dates for a specific month.
     * Called by Calendar when the user navigates months.
     */
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
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const markAllNotifRead = async () => {
        await notificationsApi.markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    const clearAllNotif = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <DataContext.Provider value={{
            tasks, events, taskDates, teamMembers, notifications, onlineUsers,
            loading, unreadCount, refreshTeams,
            createTask, updateTaskStatus, updateTask, delegateTask, deleteTask,
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
