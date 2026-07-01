import { useState, useRef, useEffect } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { chatApi } from "../api/chat.js";
import { io } from "socket.io-client";

export default function TeamChatDrawer({ t, team, members = [], user, onClose }) {
    const [msgs, setMsgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [txt, setTxt] = useState("");
    const [mentionSearch, setMentionSearch] = useState(null);
    const endRef = useRef();

    useEffect(() => {
        if (!team?.id) return;
        setLoading(true);
        chatApi.getMessages(team.id).then(res => {
            setMsgs(res.data || res || []);
        }).catch(() => {}).finally(() => setLoading(false));

        const handleMsg = (newMsg) => {
            if (newMsg.team_id === team.id || newMsg.teamId === team.id) {
                setMsgs(prev => [...prev, newMsg]);
            }
        };

        const handleMsgDeleted = ({ id }) => {
            setMsgs(prev => prev.filter(m => m.id !== id));
        };

        const socketBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
            .replace('/api/college/v1', '').replace('/api/v1', '');
        const socket = io(socketBase, {
            transports: ['websocket'],
            auth: { userId: user?.id }
        });

        socket.on('chat:message', handleMsg);
        socket.on('chat:message_deleted', handleMsgDeleted);

        return () => {
            socket.off('chat:message', handleMsg);
            socket.off('chat:message_deleted', handleMsgDeleted);
            socket.disconnect();
        };
    }, [team?.id, user?.id]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [msgs]);

    const send = async () => {
        if (!txt.trim() || !team?.id) return;
        const msgText = txt.trim();
        setTxt("");
        try {
            const res = await chatApi.sendMessage(team.id, msgText);
            const saved = res.data || res;
            setMsgs(m => [...m, saved]);
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    return (
        <>
            <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }} />
            <div className="slideLeft" style={{
                position: "fixed", top: 0, right: 0, bottom: 0, width: 360, maxWidth: "100%",
                background: t.card, borderLeft: `1px solid ${t.border}`, boxShadow: t.shadow,
                zIndex: 999, display: "flex", flexDirection: "column"
            }}>
                {/* Header */}
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, color: t.t1, fontFamily: t.disp, display: "flex", alignItems: "center", gap: 8 }}>
                            <I d={IC.msg} sz={16} c={t.accent} /> Team Chat
                        </h3>
                        <div style={{ fontSize: 11, color: t.t3, marginTop: 4 }}>{team?.name || "Workspace"}</div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: t.t3, fontSize: 24, cursor: "pointer", lineHeight: 1 }}>&times;</button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {loading ? (
                        <div style={{ textAlign: "center", fontSize: 12, color: t.t3, fontFamily: t.mono, padding: "20px 0" }}>Loading team messages...</div>
                    ) : msgs.length === 0 ? (
                        <div style={{ textAlign: "center", fontSize: 12, color: t.t3, fontFamily: t.mono, padding: "20px 0" }}>No messages yet. Start the conversation!</div>
                    ) : msgs.map(m => {
                        const senderId = m.user_id || m.sender;
                        if (senderId === "system") {
                            return (
                                <div key={m.id} style={{ textAlign: "center", fontSize: 11, color: t.t3, margin: "10px 0", fontFamily: t.mono }}>
                                    — {m.message || m.text} —
                                </div>
                            );
                        }
                        const isMe = String(senderId) === String(user?.id);
                        const mem = members.find(x => String(x.id) === String(senderId)) || { name: m.sender_name || m.user_name || "Member" };
                        const formattedTime = m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : m.time || "";
                        
                        return (
                            <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
                                {!isMe && (
                                    <div style={{ paddingBottom: 20 }}>
                                        <Av u={{ ...mem, av: mem.avatar_initials || mem.name?.slice(0, 2), color: t.accent, avatar_url: mem.avatar_url }} sz={28} />
                                    </div>
                                )}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                                    {!isMe && <span style={{ fontSize: 10, color: t.t3, marginBottom: 4, marginLeft: 2 }}>{mem.name.split(" ")[0]}</span>}
                                    <div style={{
                                        background: isMe ? t.accent : t.inset,
                                        color: isMe ? "#000" : t.t1,
                                        padding: "10px 14px",
                                        borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                                        fontSize: 13, fontFamily: t.disp, lineHeight: 1.4, wordBreak: "break-word"
                                    }}>
                                        {m.message || m.text}
                                    </div>
                                    <span style={{ fontSize: 9, color: t.t3, marginTop: 4, fontFamily: t.mono }}>{formattedTime}</span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={endRef} />
                </div>

                {/* Input */}
                <div style={{ padding: 16, borderTop: `1px solid ${t.border}`, background: t.card, position: "relative" }}>
                    {mentionSearch !== null && (
                        <div style={{
                            position: "absolute", bottom: "100%", left: 16, right: 16, marginBottom: 8,
                            background: t.card, border: `1px solid ${t.border}`, borderRadius: 12,
                            boxShadow: t.shadow, maxHeight: 160, overflowY: "auto", zIndex: 10
                        }}>
                            {members.filter(m => String(m.id) !== String(user?.id) && m.name.toLowerCase().includes(mentionSearch)).map(m => (
                                <div key={m.id} className="hvr" onClick={() => {
                                    const lastAt = txt.lastIndexOf('@');
                                    setTxt(txt.slice(0, lastAt) + '@' + m.name + ' ');
                                    setMentionSearch(null);
                                }} style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", borderBottom: `1px solid ${t.border}44` }}>
                                    <span style={{ fontSize: 13, color: t.t1, fontFamily: t.disp }}>{m.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ display: "flex", gap: 10 }}>
                        <input value={txt} onChange={e => {
                            const val = e.target.value;
                            setTxt(val);
                            const lastAt = val.lastIndexOf('@');
                            if (lastAt !== -1 && (lastAt === 0 || val[lastAt - 1] === ' ')) {
                                const search = val.slice(lastAt + 1);
                                if (!search.includes(' ')) {
                                    setMentionSearch(search.toLowerCase());
                                    return;
                                }
                            }
                            setMentionSearch(null);
                        }} onKeyDown={e => e.key === "Enter" && send()}
                            placeholder="Type a message..."
                            style={{ flex: 1, padding: "10px 14px", borderRadius: 20, border: `1px solid ${t.border}`, background: t.inset, color: t.t1, outline: "none", fontSize: 13, fontFamily: t.disp }} />
                        <button onClick={send} disabled={!txt.trim()}
                            style={{ background: txt.trim() ? t.accent : t.inset, color: txt.trim() ? "#000" : t.t3, border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: txt.trim() ? "pointer" : "default", transition: "all .2s" }}>
                            <I d={IC.snd} sz={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
