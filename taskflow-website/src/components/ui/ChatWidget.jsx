import { useState, useRef, useEffect } from "react";
import { useData } from "../../context/DataContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { chatApi } from "../../api/chat.js";
import { teamApi } from "../../api/team.js";
import { I, IC } from "./Icon.jsx";
import { Av } from "./Av.jsx";

export default function ChatWidget({ t }) {
    const { user } = useAuth();
    const { socket } = useData();
    const [teams, setTeams] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [msgs, setMsgs] = useState([]);
    const [txt, setTxt] = useState("");
    const [loading, setLoading] = useState(false);
    const [mentionQuery, setMentionQuery] = useState(null);
    const [mentionMembers, setMentionMembers] = useState([]);
    const [mentionIndex, setMentionIndex] = useState(0);
    const endRef = useRef();
    const inputRef = useRef();

    useEffect(() => {
        teamApi.getMyTeams().then(res => setTeams(res.data || [])).catch(() => {});
        const handleOpenChat = (e) => {
            const teamToOpen = e.detail?.team;
            if (teamToOpen) {
                setSelectedTeam(teamToOpen);
                setOpen(true);
            }
        };
        window.addEventListener('open-team-chat', handleOpenChat);
        return () => window.removeEventListener('open-team-chat', handleOpenChat);
    }, []);

    useEffect(() => {
        if (selectedTeam) {
            setLoading(true);
            chatApi.getMessages(selectedTeam.id).then(res => {
                setMsgs(res.data || []);
                endRef.current?.scrollIntoView({ behavior: "smooth" });
            }).finally(() => setLoading(false));

            teamApi.getTeamMembers(selectedTeam.id).then(res => {
                setMentionMembers(res.data || []);
            }).catch(() => {});
        }
    }, [selectedTeam]);

    useEffect(() => {
        if (!socket) return;
        const handleMsg = (msg) => {
            if (selectedTeam && msg.team_id === selectedTeam.id) {
                setMsgs(prev => [...prev, msg]);
                setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }
        };
        const handleMsgDeleted = (data) => {
            if (selectedTeam && data.team_id === selectedTeam.id) {
                setMsgs(prev => prev.filter(m => m.id !== data.id));
            }
        };
        socket.on('chat:message', handleMsg);
        socket.on('chat:message_deleted', handleMsgDeleted);
        return () => {
            socket.off('chat:message', handleMsg);
            socket.off('chat:message_deleted', handleMsgDeleted);
        };
    }, [socket, selectedTeam]);

    const send = async () => {
        if (!txt.trim() || !selectedTeam) return;
        const msgText = txt.trim();
        setTxt(""); // optimistic clear
        setMentionQuery(null);
        
        // Optimistic UI append
        const tempMsg = {
            id: 'temp_' + Date.now(),
            team_id: selectedTeam.id,
            user_id: user.id,
            message: msgText,
            sender_name: user.name,
            sender_initials: user.avatar_initials,
            sender_avatar: user.avatar_url,
            created_at: new Date().toISOString()
        };
        setMsgs(prev => [...prev, tempMsg]);
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

        try {
            const res = await chatApi.sendMessage(selectedTeam.id, msgText);
            // Replace temp msg with real one to get correct ID
            setMsgs(prev => prev.map(m => m.id === tempMsg.id ? res.data : m));
        } catch (err) {
            console.error(err);
            // Revert on fail
            setMsgs(prev => prev.filter(m => m.id !== tempMsg.id));
            setTxt(msgText);
        }
    };

    const handleTextChange = (e) => {
        const val = e.target.value;
        setTxt(val);
        const lastWordMatch = val.match(/@(\w*)$/);
        if (lastWordMatch) {
            setMentionQuery(lastWordMatch[1].toLowerCase());
            setMentionIndex(0);
        } else {
            setMentionQuery(null);
        }
    };

    const insertMention = (name) => {
        const newTxt = txt.replace(/@\w*$/, `@${name.replace(/\s+/g, '')} `);
        setTxt(newTxt);
        setMentionQuery(null);
        inputRef.current?.focus();
    };

    const filteredMentionMembers = mentionQuery !== null ? mentionMembers.filter(m => m.name.toLowerCase().replace(/\s+/g, '').includes(mentionQuery)) : [];

    const handleKeyDown = (e) => {
        if (mentionQuery !== null && filteredMentionMembers.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setMentionIndex(prev => (prev + 1) % filteredMentionMembers.length);
                return;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setMentionIndex(prev => (prev - 1 + filteredMentionMembers.length) % filteredMentionMembers.length);
                return;
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                insertMention(filteredMentionMembers[mentionIndex].name);
                return;
            }
        }
        if (e.key === "Enter") {
            send();
        }
    };

    const handleDeleteMsg = async (messageId) => {
        try {
            await chatApi.deleteMessage(messageId);
            setMsgs(prev => prev.filter(m => m.id !== messageId));
        } catch (err) {
            console.error("Failed to delete message:", err);
        }
    };

    if (!open) {
        return (
            <button 
                onClick={() => setOpen(true)}
                className="hvrPop"
                style={{
                    position: "fixed", bottom: 20, right: 24, zIndex: 100, width: 56, height: 56,
                    borderRadius: "50%", background: t.accent, color: t.accent === '#FAFAFA' ? '#000' : '#000', border: `1px solid ${t.border}`,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}
            >
                <I d={IC.msg || IC.mail} sz={24} />
            </button>
        );
    }

    return (
        <div className="slideUp" style={{
            position: "fixed", bottom: 20, right: 24, zIndex: 100, width: 340, height: 480,
            background: t.card, border: `1px solid ${t.border}`, borderRadius: 16,
            boxShadow: t.shadow, display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
            {/* Header */}
            <div style={{ background: t.inset, padding: "14px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: 15, color: t.t1, fontFamily: t.disp, display: "flex", alignItems: "center", gap: 8 }}>
                        {selectedTeam && (
                            <button onClick={() => setSelectedTeam(null)} title="Back to Teams" style={{ background:"none", border:"none", color:t.t3, cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:4, fontSize: 12 }}>
                                <span>←</span>
                            </button>
                        )}
                        {selectedTeam ? selectedTeam.name : "Team Chat Hub"}
                    </h3>
                    <div style={{ fontSize: 11, color: t.t3, marginTop: 2 }}>{selectedTeam ? "Real-time communication" : "Select a team to chat"}</div>
                </div>
                <button onClick={() => { setOpen(false); setSelectedTeam(null); }} style={{ background: "none", border: "none", color: t.t3, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>&times;</button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", position: "relative" }}>
                {!selectedTeam ? (
                    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                        {teams.length === 0 ? (
                            <div style={{ textAlign: "center", color: t.t3, fontSize: 13, marginTop: 40, fontFamily: t.mono }}>No teams available</div>
                        ) : (
                            teams.map(tm => (
                                <button key={tm.id} onClick={() => setSelectedTeam(tm)} style={{
                                    width: "100%", padding: "14px", background: t.inset, border: `1px solid ${t.border}`,
                                    borderRadius: 10, color: t.t1, fontSize: 14, fontFamily: t.disp, fontWeight: 600,
                                    cursor: "pointer", textAlign: "left", transition: "all .2s"
                                }} onMouseEnter={e => e.currentTarget.style.borderColor = t.accent} onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                                    {tm.name} <span style={{ float: "right", color: t.t3 }}>→</span>
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    <>
                        <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
                            {loading ? (
                                <div style={{ textAlign: "center", color: t.t3, fontSize: 12, marginTop: 20 }}>Loading messages...</div>
                            ) : msgs.length === 0 ? (
                                <div style={{ textAlign: "center", color: t.t3, fontSize: 12, marginTop: 20 }}>No messages yet. Say hi!</div>
                            ) : (
                                msgs.map(m => {
                                    const isMe = m.user_id === user.id;
                                    const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    return (
                                        <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                                            {!isMe && (
                                                <div style={{ paddingBottom: 16 }}>
                                                    <Av u={{ name: m.sender_name, avatar_initials: m.sender_initials, avatar_url: m.sender_avatar, color: t.accent }} sz={24} />
                                                </div>
                                            )}
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                                                {!isMe && <span style={{ fontSize: 9, color: t.t3, marginBottom: 2, marginLeft: 2 }}>{m.sender_name?.split(" ")[0]}</span>}
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, flexDirection: isMe ? "row-reverse" : "row" }}>
                                                    <div style={{
                                                        background: isMe ? t.accent : t.inset,
                                                        color: isMe ? "#000" : t.t1,
                                                        padding: "8px 12px",
                                                        borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                                                        fontSize: 12.5, fontFamily: t.disp, lineHeight: 1.4, wordBreak: "break-word"
                                                    }}>
                                                        {m.message.split(/(@[a-zA-Z0-9_]+)/g).map((part, i) => 
                                                            part.startsWith('@') ? <span key={i} style={{ color: isMe ? '#000' : t.accent, fontWeight: 800 }}>{part}</span> : part
                                                        )}
                                                    </div>
                                                    {isMe && !String(m.id).startsWith("temp_") && (
                                                        <button 
                                                            onClick={() => handleDeleteMsg(m.id)}
                                                            title="Delete message"
                                                            style={{
                                                                background: "none",
                                                                border: "none",
                                                                color: t.red,
                                                                fontSize: 11,
                                                                cursor: "pointer",
                                                                opacity: 0.35,
                                                                padding: "4px",
                                                                display: "flex",
                                                                alignItems: "center"
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                            onMouseLeave={e => e.currentTarget.style.opacity = 0.35}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: 8.5, color: t.t3, marginTop: 4, fontFamily: t.mono }}>{time}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={endRef} />
                        </div>
                        {/* Input Area */}
                        <div style={{ position: "relative" }}>
                            {mentionQuery !== null && filteredMentionMembers.length > 0 && (
                                <div style={{
                                    position: "absolute", bottom: "100%", left: 12, right: 12, marginBottom: 8,
                                    background: t.card, border: `1px solid ${t.border}`, borderRadius: 12,
                                    boxShadow: t.shadow, maxHeight: 150, overflowY: "auto", zIndex: 10
                                }}>
                                    {filteredMentionMembers.map((m, idx) => (
                                        <div key={m.id} onClick={() => insertMention(m.name)} style={{
                                            padding: "8px 12px", fontSize: 12, color: t.t1, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                                            borderBottom: `1px solid ${t.border}`,
                                            background: mentionIndex === idx ? t.accentDim : "transparent"
                                        }} onMouseEnter={() => setMentionIndex(idx)}>
                                            <Av u={{ name: m.name, avatar_initials: m.avatar_initials, color: t.accent }} sz={20} />
                                            {m.name.replace(/\s+/g, '')}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ padding: 12, borderTop: `1px solid ${t.border}`, background: t.card }}>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <input ref={inputRef} value={txt} onChange={handleTextChange} onKeyDown={handleKeyDown}
                                        placeholder="Type your message..."
                                        style={{ flex: 1, padding: "10px 14px", borderRadius: 20, border: `1px solid ${t.border}`, background: t.inset, color: t.t1, outline: "none", fontSize: 12.5, fontFamily: t.disp }} />
                                    <button onClick={send} disabled={!txt.trim()}
                                        style={{ background: txt.trim() ? t.accent : t.inset, color: txt.trim() ? "#000" : t.t3, border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: txt.trim() ? "pointer" : "default", transition: "all .2s" }}>
                                        <I d={IC.send || IC.mail} sz={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
