import { useState, useEffect } from 'react';
import { friendsApi } from '../api/friends.js';
import { toastSuccess, toastError } from './ui/Toast.jsx';

export default function Friends({ t }) {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [emailStr, setEmailStr] = useState('');

    const fetchFriends = async () => {
        try {
            setLoading(true);
            const { data } = await friendsApi.getFriends();
            setFriends(data.friends || []);
            setRequests(data.requests || []);
        } catch (e) {
            toastError("Failed to fetch friends.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    const handleSendRequest = async (e) => {
        e.preventDefault();
        if (!emailStr.trim()) return toastError("Please enter an email");
        try {
            setLoading(true);
            await friendsApi.sendRequest(emailStr);
            toastSuccess("Friend request sent!");
            setEmailStr('');
        } catch (e) {
            toastError(e.response?.data?.message || e.message || "Failed to send request");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            setLoading(true);
            await friendsApi.acceptRequest(requestId);
            toastSuccess("Friend request accepted!");
            fetchFriends();
        } catch (e) {
            toastError(e.message || "Failed to accept");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (friendshipId) => {
        if (!confirm("Are you sure?")) return;
        try {
            setLoading(true);
            await friendsApi.removeFriend(friendshipId);
            toastSuccess("Removed successfully.");
            fetchFriends();
        } catch (e) {
            toastError(e.message || "Failed to remove");
        } finally {
            setLoading(false);
        }
    };

    const inp = {
        flex: 1, background: t.inset || '#0C1420', border: `1px solid ${t.border}`,
        borderRadius: 8, padding: '10px 14px', color: t.t1, fontSize: 13,
        fontFamily: t.disp, outline: 'none', boxSizing: 'border-box'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <div style={{ padding: "22px 26px" }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: t.t1, margin: '0 0 24px 0' }}>Friends & Collaboration</h2>
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
                    <h3 style={{ fontSize: 14, color: t.t1, marginBottom: 12, marginTop: 0, fontFamily: t.disp }}>Add a Friend</h3>
                    <form onSubmit={handleSendRequest} style={{ display: 'flex', gap: 10 }}>
                        <input type="email" value={emailStr} onChange={e => setEmailStr(e.target.value)}
                            placeholder="Friend's email address..." style={inp} />
                        <button type="submit" disabled={loading}
                            style={{ background: t.accent, color: '#000', border: 'none', borderRadius: 8, padding: '0 20px', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp }}>
                            Send Request
                        </button>
                    </form>
                </div>

                {/* Grid for Requests & Friends */}
                <div style={{ display: "grid", gridTemplateColumns: requests.length > 0 ? "1fr 1fr" : "1fr", gap: 20 }}>
                    {requests.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: 13, color: t.t2, marginBottom: 12, marginTop: 0 }}>Pending Requests</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {requests.map(req => (
                                    <div key={req.request_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: `1px solid ${t.border}`, background: t.card, borderRadius: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: t.inset, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: t.t1, fontWeight: 700 }}>
                                                {req.avatar_initials || "?"}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: t.t1 }}>{req.name}</div>
                                                <div style={{ fontSize: 11, color: t.t3 }}>{req.email}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => handleAcceptRequest(req.request_id)} style={{ background: t.accentDim, color: t.accent, border: `1px solid ${t.accent}44`, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>Accept</button>
                                            <button onClick={() => handleRemove(req.request_id)} style={{ background: 'transparent', color: t.t3, border: `1px solid ${t.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Decline</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 style={{ fontSize: 13, color: t.t2, marginBottom: 12, marginTop: 0 }}>My Friends</h4>
                        {friends.length === 0 ? (
                            <div style={{ color: t.t3, fontSize: 13 }}>You haven't added any friends yet.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {friends.map(f => (
                                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: `1px solid ${t.border}`, background: t.card, borderRadius: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: t.inset, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: t.t1, fontWeight: 700 }}>
                                                {f.avatar_initials || "?"}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: t.t1, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    {f.name}
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: f.is_online ? '#10B981' : t.border }}></div>
                                                </div>
                                                <div style={{ fontSize: 11, color: t.t3 }}>{f.email}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
