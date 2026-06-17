import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

import { tasksApi } from '../api/tasks';
import { eventsApi } from '../api/events';
import { teamApi } from '../api/team';
import { notificationsApi } from '../api/notifications';
import { friendsApi } from '../api/friends';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1'))
    .replace('/api/v1', ''); // Socket.IO connects to base URL, not /api/v1

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

    const socketRef = useRef(null);

    // ─── Stable refresh helpers ────────────────────────────────────────────────
    const refreshTasks = useCallback(async () => {
        try {
            const res = await tasksApi.list();
            setTasks(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error('refreshTasks failed:', e); }
    }, []);

    const refreshTeams = useCallback(async () => {
        try {
            const res = await teamApi.getMembers();
            setTeamMembers(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error('refreshTeams failed:', e); }
    }, []);

    const refreshNotifications = useCallback(async () => {
        try {
            const res = await notificationsApi.list();
            const notifs = Array.isArray(res.data) ? res.data : (res.data?.notifications || []);
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.is_read).length);
        } catch (e) { console.error('refreshNotifications failed:', e); }
    }, []);

    const refreshFriends = useCallback(async () => {
        try {
            const res = await friendsApi.list();
            if (res?.data) {
                setFriends(Array.isArray(res.data.friends) ? res.data.friends : []);
                setFriendRequests(Array.isArray(res.data.requests) ? res.data.requests : []);
            }
        } catch (e) { console.error('refreshFriends failed:', e); }
    }, []);

    useEffect(() => {
        if (!user) {
            setTasks([]); setEvents([]); setTeamMembers([]);
            setNotifications([]); setUnreadCount(0);
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
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
                    friendsApi.list(),
                ]);

                setTasks(Array.isArray(tRes.data) ? tRes.data : []);
                const evData = eRes.data;
                setEvents(Array.isArray(evData) ? evData : Array.isArray(evData?.events) ? evData.events : []);
                setTeamMembers(Array.isArray(tmRes.data) ? tmRes.data : []);

                const notifs = Array.isArray(nRes.data) ? nRes.data : (nRes.data?.notifications || []);
                setNotifications(notifs);
                setUnreadCount(notifs.filter(n => !n.is_read).length);

                if (fRes?.data) {
                    setFriends(Array.isArray(fRes.data.friends) ? fRes.data.friends : []);
                    setFriendRequests(Array.isArray(fRes.data.requests) ? fRes.data.requests : []);
                }

                setupSocket();
            } catch (err) {
                console.error('Failed to fetch initial data', err);
            } finally {
                setLoading(false);
            }
        };

        const setupSocket = async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            // Disconnect any existing socket before creating new one
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }

            const socket = io(BASE_URL, {
                auth: { token, userId: user.id },
                query: { userId: user.id },
                transports: ['websocket', 'polling'],
                // Robust reconnection for Render free-tier spin-down
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: Infinity,
            });
            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('[Socket] Connected:', socket.id);
                // Re-join user room after reconnect
                socket.emit('join', { userId: user.id });
            });

            let _errCount = 0;
            socket.on('connect_error', (err) => {
                _errCount++;
                // Only log on first error, then every 10 attempts to reduce spam
                if (_errCount === 1 || _errCount % 10 === 0) {
                    console.warn(`[Socket] connect_error (attempt ${_errCount}):`, err.message);
                }
            });

            socket.on('disconnect', (reason) => {
                _errCount = 0; // reset on disconnect
                console.warn('[Socket] Disconnected:', reason);
                // Socket.IO auto-reconnects unless disconnected by server intentionally
            });

            // ── Online presence ────────────────────────────────────────────────
            socket.on('online_users', (users) => {
                setOnlineUsers(new Set(users.map(String)));
            });
            socket.on('user:online', ({ userId }) => {
                setOnlineUsers(prev => new Set([...prev, String(userId)]));
            });
            socket.on('user:offline', ({ userId }) => {
                setOnlineUsers(prev => { const s = new Set(prev); s.delete(String(userId)); return s; });
            });

            // ── Task events ────────────────────────────────────────────────────
            socket.on('task:assigned', t => {
                if (!t?.id) return;
                setTasks(p => [t, ...p.filter(x => x.id !== t.id)]);
            });
            socket.on('task:updated', t => {
                if (!t?.id) return;
                setTasks(p => p.map(x => x.id === t.id ? t : x));
            });
            socket.on('task:deleted', id => setTasks(p => p.filter(x => x.id !== id)));
            socket.on('task:delegated', t => {
                if (!t?.id) return;
                setTasks(p => [t, ...p.filter(x => x.id !== t.id)]);
            });
            socket.on('task:refused', t => {
                if (!t?.id) return;
                setTasks(p => p.map(x => x.id === t.id ? t : x));
            });
            // Backwards-compat underscore variants
            socket.on('task_created', t => t?.id && setTasks(p => [t, ...p.filter(x => x.id !== t.id)]));
            socket.on('task_updated', t => t?.id && setTasks(p => p.map(x => x.id === t.id ? t : x)));
            socket.on('task_deleted', id => setTasks(p => p.filter(x => x.id !== id)));

            // ── Event events ───────────────────────────────────────────────────
            socket.on('event_created', e => {
                if (!e?.id) return;
                setEvents(p => [...p, e].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));
            });
            socket.on('event_updated', e => {
                if (!e?.id) return;
                setEvents(p => p.map(x => x.id === e.id ? e : x).sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));
            });
            socket.on('event_deleted', id => setEvents(p => p.filter(x => x.id !== id)));

            // ── Notification events ────────────────────────────────────────────
            const handleNewNotif = (n) => {
                if (!n) return;
                setNotifications(p => [n, ...p]);
                setUnreadCount(c => c + 1);
                if (n.type === 'friend_request' || n.type === 'friend_accepted') {
                    refreshFriends();
                }
            };
            socket.on('notification_new', handleNewNotif);
            socket.on('notification:new', handleNewNotif);

            // ── Team events ────────────────────────────────────────────────────
            // team:refresh — emitted when member joins or is removed
            socket.on('team:refresh', () => refreshTeams());
            socket.on('team:member_added', () => refreshTeams());
            socket.on('team:member_removed', () => refreshTeams());

            socket.on('team:leave_request', () => {
                // Admin receives a leave request — refresh notifications
                refreshNotifications();
            });

            // Team deleted — wipe tasks/members, then re-fetch remaining data
            socket.on('team:deleted', () => {
                setTasks([]);
                setTeamMembers([]);
                refreshTasks();
                refreshTeams();
                refreshNotifications();
            });
        };

        initData();

        // Auto-sync when app returns to foreground
        const appStateRef = { current: AppState.currentState };
        const sub = AppState.addEventListener('change', nextState => {
            if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
                // Re-fetch all data when app comes to foreground
                Promise.all([
                    tasksApi.list(),
                    teamApi.getMembers(),
                    notificationsApi.list(),
                    friendsApi.list(),
                ]).then(([tRes, tmRes, nRes, fRes]) => {
                    setTasks(Array.isArray(tRes.data) ? tRes.data : []);
                    setTeamMembers(Array.isArray(tmRes.data) ? tmRes.data : []);
                    const notifs = Array.isArray(nRes.data) ? nRes.data : (nRes.data?.notifications || []);
                    setNotifications(notifs);
                    setUnreadCount(notifs.filter(n => !n.is_read).length);
                    if (fRes?.data) {
                        setFriends(Array.isArray(fRes.data.friends) ? fRes.data.friends : []);
                        setFriendRequests(Array.isArray(fRes.data.requests) ? fRes.data.requests : []);
                    }
                }).catch(() => {});

                // Reconnect socket if it dropped
                if (socketRef.current && !socketRef.current.connected) {
                    socketRef.current.connect();
                }
            }
            appStateRef.current = nextState;
        });

        return () => {
            sub?.remove();
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Task mutations ────────────────────────────────────────────────────────
    const createTask = async (data) => {
        const res = await tasksApi.create(data);
        const newTask = res.data;
        if (newTask?.id) {
            setTasks(p => [newTask, ...p.filter(t => t.id !== newTask.id)]);
        }
        return newTask;
    };

    const updateTask = async (id, data) => {
        const res = await tasksApi.update(id, data);
        if (res?.data) setTasks(p => p.map(t => t.id === id ? res.data : t));
        return res?.data;
    };

    const updateTaskStatus = async (id, status) => {
        // Optimistic update first
        setTasks(p => p.map(t => t.id === id ? { ...t, status } : t));
        try {
            const res = await tasksApi.updateStatus(id, status);
            // Update with full server response (includes all names/fields)
            if (res?.data) setTasks(p => p.map(t => t.id === id ? res.data : t));
            return res?.data;
        } catch (e) {
            // Revert on failure by re-fetching
            refreshTasks();
            throw e;
        }
    };

    const deleteTask = async (id) => {
        setTasks(p => p.filter(t => t.id !== id));
        await tasksApi.delete(id).catch(e => {
            console.error('Delete failed', e);
            refreshTasks();
        });
    };

    const delegateTask = async (id, assigneeId) => {
        const res = await tasksApi.delegate(id, assigneeId);
        if (res?.data) {
            setTasks(p => [res.data, ...p.filter(t => t.id !== res.data.id)]);
        }
        return res;
    };

    const splitTask = async (id, subtasks) => {
        const res = await tasksApi.split(id, subtasks);
        if (res?.data) {
            setTasks(p => {
                const newTasks = res.data.filter(nt => !p.some(pt => pt.id === nt.id));
                return [...newTasks, ...p];
            });
        }
        return res;
    };

    // ─── Event mutations ───────────────────────────────────────────────────────
    const createEvent = async (data) => {
        await eventsApi.create(data);
        const res = await eventsApi.list();
        const d = res.data;
        setEvents(Array.isArray(d) ? d : Array.isArray(d?.events) ? d.events : []);
    };

    const deleteEvent = async (id) => {
        setEvents(p => p.filter(e => e.id !== id));
        await eventsApi.delete(id).catch(console.error);
    };

    // ─── Notification mutations ────────────────────────────────────────────────
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

    // ─── Manual full refresh ───────────────────────────────────────────────────
    const refreshAll = async () => {
        try {
            const [taskRes, eventRes, memberRes, notifRes, friendRes] = await Promise.all([
                tasksApi.list(),
                eventsApi.list(),
                teamApi.getMembers(),
                notificationsApi.list(),
                friendsApi.list(),
            ]);
            setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
            const evData = eventRes.data;
            setEvents(Array.isArray(evData) ? evData : Array.isArray(evData?.events) ? evData.events : []);
            setTeamMembers(Array.isArray(memberRes.data) ? memberRes.data : []);
            const notifs = Array.isArray(notifRes.data) ? notifRes.data : (notifRes.data?.notifications || []);
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.is_read).length);
            if (friendRes?.data) {
                setFriends(Array.isArray(friendRes.data.friends) ? friendRes.data.friends : []);
                setFriendRequests(Array.isArray(friendRes.data.requests) ? friendRes.data.requests : []);
            }
        } catch (e) { console.error('refreshAll failed:', e); }
    };

    const sendFriendRequest = async (email) => {
        const res = await friendsApi.sendRequest(email);
        await refreshFriends();
        return res;
    };

    const acceptFriendRequest = async (requestId) => {
        const res = await friendsApi.acceptRequest(requestId);
        await refreshFriends();
        return res;
    };

    const removeFriend = async (friendshipId) => {
        setFriends(p => p.filter(f => f.friendship_id !== friendshipId));
        const res = await friendsApi.remove(friendshipId).catch(e => {
            console.error('removeFriend failed:', e);
            refreshFriends();
            throw e;
        });
        return res;
    };

    return (
        <DataContext.Provider value={{
            tasks, events, teamMembers, notifications, unreadCount, onlineUsers, loading,
            friends, friendRequests,
            createTask, updateTaskStatus, updateTask, deleteTask, delegateTask, splitTask,
            createEvent, deleteEvent, markNotifRead, markAllNotifRead,
            sendFriendRequest, acceptFriendRequest, removeFriend, refreshFriends,
            refreshAll, refreshTasks, refreshTeams, refreshNotifications,
        }}>
            {children}
        </DataContext.Provider>
    );
};
