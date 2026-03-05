import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

import { tasksApi } from '../api/tasks';
import { eventsApi } from '../api/events';
import { teamApi } from '../api/team';
import { notificationsApi } from '../api/notifications';

const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [loading, setLoading] = useState(true);

    const socket = useRef(null);

    useEffect(() => {
        if (!user) {
            setTasks([]); setEvents([]); setTeamMembers([]);
            setNotifications([]); setUnreadCount(0);
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
            }
            return;
        }

        const initData = async () => {
            setLoading(true);
            try {
                const [tRes, eRes, tmRes, nRes] = await Promise.all([
                    tasksApi.list(),
                    eventsApi.list(),
                    teamApi.getMembers(),
                    notificationsApi.list(),
                ]);

                setTasks(tRes.data || []);
                setEvents(eRes.data || []);
                setTeamMembers(tmRes.data || []);

                const notifs = nRes.data?.notifications || nRes.data || [];
                setNotifications(notifs);
                setUnreadCount(nRes.data?.unreadCount || notifs.filter(n => !n.is_read).length);

                setupSocket();
            } catch (err) {
                console.error("Failed to fetch initial data", err);
            } finally {
                setLoading(false);
            }
        };

        const setupSocket = async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            socket.current = io(API_URL, {
                auth: { token },
                transports: ['websocket'],
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
            });

            socket.current.on('connect', () => {
                // Could fetch missed events here using a 'since' timestamp
            });

            socket.current.on('online_users', (users) => {
                setOnlineUsers(new Set(users.map(String)));
            });

            socket.current.on('task_created', t => setTasks(p => [t, ...p]));
            socket.current.on('task_updated', t => setTasks(p => p.map(x => x.id === t.id ? t : x)));
            socket.current.on('task_deleted', id => setTasks(p => p.filter(x => x.id !== id)));

            socket.current.on('event_created', e => setEvents(p => [...p, e].sort((a, b) => new Date(a.event_date) - new Date(b.event_date))));
            socket.current.on('event_updated', e => setEvents(p => p.map(x => x.id === e.id ? e : x).sort((a, b) => new Date(a.event_date) - new Date(b.event_date))));
            socket.current.on('event_deleted', id => setEvents(p => p.filter(x => x.id !== id)));

            socket.current.on('notification_new', n => {
                setNotifications(p => [n, ...p]);
                setUnreadCount(c => c + 1);
            });
        };

        initData();

        return () => {
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
            }
        };
    }, [user]);

    // Mutations
    const createTask = async (data) => {
        const res = await tasksApi.create(data);
        const newTask = await tasksApi.get(res.data.id || res.taskId);
        setTasks(p => [newTask.data, ...p]);
        return newTask.data;
    };

    const updateTaskStatus = async (id, status) => {
        setTasks(p => p.map(t => t.id === id ? { ...t, status } : t));
        await tasksApi.updateStatus(id, status).catch(e => {
            // Revert on error could go here
            console.error("Update failed", e);
        });
    };

    const deleteTask = async (id) => {
        setTasks(p => p.filter(t => t.id !== id));
        await tasksApi.delete(id).catch(console.error);
    };

    const createEvent = async (data) => {
        await eventsApi.create(data);
        const res = await eventsApi.list();
        setEvents(res.data || []);
    };

    const markNotifRead = async (id) => {
        setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        setUnreadCount(c => Math.max(0, c - 1));
        await notificationsApi.markRead(id).catch(console.error);
    };

    const markAllNotifRead = async () => {
        setNotifications(p => p.map(n => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
        await notificationsApi.markAllRead().catch(console.error);
    };

    return (
        <DataContext.Provider value={{
            tasks, events, teamMembers, notifications, unreadCount, onlineUsers, loading,
            createTask, updateTaskStatus, deleteTask,
            createEvent, markNotifRead, markAllNotifRead
        }}>
            {children}
        </DataContext.Provider>
    );
};
