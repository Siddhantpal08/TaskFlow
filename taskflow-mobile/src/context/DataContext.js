import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

import { tasksApi } from '../api/tasks';
import { eventsApi } from '../api/events';
import { teamApi } from '../api/team';
import { notificationsApi } from '../api/notifications';
import { friendsApi } from '../api/friends';

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
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const socket = useRef(null);

    useEffect(() => {
        if (!user) {
            setTasks([]); setEvents([]); setTeamMembers([]);
            setNotifications([]); setUnreadCount(0);
            setFriends([]); setFriendRequests([]);
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
            }
            return;
        }

        const initData = async () => {
            setLoading(true);
            try {
                const [tRes, eRes, tmRes, nRes, fRes] = await Promise.all([
                    tasksApi.list(),
                    eventsApi.list(),
                    teamApi.getMembers(),
                    notificationsApi.list(),
                    friendsApi.list().catch(() => ({ data: { friends: [], requests: [] } })),
                ]);

                setTasks(Array.isArray(tRes.data) ? tRes.data : []);
                // Calendar API returns { events: [], taskDueDates: [] } inside data
                const evData = eRes.data;
                setEvents(Array.isArray(evData) ? evData : Array.isArray(evData?.events) ? evData.events : []);
                setTeamMembers(Array.isArray(tmRes.data) ? tmRes.data : []);

                const notifs = nRes.data?.notifications || nRes.data || [];
                setNotifications(notifs);
                setUnreadCount(nRes.data?.unreadCount || notifs.filter(n => !n.is_read).length);

                setFriends(fRes.data?.friends || []);
                setFriendRequests(fRes.data?.requests || []);

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

            // Send both token and userId — backend uses whichever is available
            socket.current = io(API_URL, {
                auth: { token, userId: user.id },
                transports: ['websocket'],
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
            });

            socket.current.on('connect', () => { });

            socket.current.on('online_users', (users) => {
                setOnlineUsers(new Set(users.map(String)));
            });

            socket.current.on('task_created', t => setTasks(p => [t, ...p]));
            socket.current.on('task_updated', t => setTasks(p => p.map(x => x.id === t.id ? t : x)));
            socket.current.on('task_deleted', id => setTasks(p => p.filter(x => x.id !== id)));

            socket.current.on('event_created', e => setEvents(p => [...p, e].sort((a, b) => new Date(a.event_date) - new Date(b.event_date))));
            socket.current.on('event_updated', e => setEvents(p => p.map(x => x.id === e.id ? e : x).sort((a, b) => new Date(a.event_date) - new Date(b.event_date))));
            socket.current.on('event_deleted', id => setEvents(p => p.filter(x => x.id !== id)));

            // Handle both event name conventions for backwards compatibility
            const handleNewNotif = (n) => {
                setNotifications(p => [n, ...p]);
                setUnreadCount(c => c + 1);
            };
            socket.current.on('notification_new', handleNewNotif);
            socket.current.on('notification:new', handleNewNotif);
        };

        initData();

        return () => {
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
            }
        };
    }, [user]);

    const createTask = async (data) => {
        const res = await tasksApi.create(data);
        const newTask = await tasksApi.get(res.data.id || res.taskId);
        setTasks(p => [newTask.data, ...p]);
        return newTask.data;
    };

    const updateTaskStatus = async (id, status) => {
        setTasks(p => p.map(t => t.id === id ? { ...t, status } : t));
        await tasksApi.updateStatus(id, status).catch(e => console.error("Update failed", e));
    };

    const deleteTask = async (id) => {
        setTasks(p => p.filter(t => t.id !== id));
        await tasksApi.delete(id).catch(console.error);
    };

    const createEvent = async (data) => {
        await eventsApi.create(data);
        const res = await eventsApi.list();
        const d = res.data;
        setEvents(Array.isArray(d) ? d : Array.isArray(d?.events) ? d.events : []);
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

    const sendFriendRequest = async (email) => {
        return await friendsApi.sendRequest(email);
    };

    const acceptFriendRequest = async (requestId) => {
        await friendsApi.acceptRequest(requestId);
        const res = await friendsApi.list().catch(() => null);
        if (res) {
            setFriends(res.data?.friends || []);
            setFriendRequests(res.data?.requests || []);
        }
    };

    const removeFriend = async (friendshipId) => {
        setFriends(p => p.filter(f => f.id !== friendshipId));
        await friendsApi.remove(friendshipId).catch(console.error);
    };

    const refreshFriends = async () => {
        const res = await friendsApi.list().catch(() => null);
        if (res) {
            setFriends(res.data?.friends || []);
            setFriendRequests(res.data?.requests || []);
        }
    };

    return (
        <DataContext.Provider value={{
            tasks, events, teamMembers, notifications, unreadCount, onlineUsers, loading,
            friends, friendRequests,
            createTask, updateTaskStatus, deleteTask,
            createEvent, markNotifRead, markAllNotifRead,
            sendFriendRequest, acceptFriendRequest, removeFriend, refreshFriends,
        }}>
            {children}
        </DataContext.Provider>
    );
};
