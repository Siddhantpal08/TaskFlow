import { useState, useRef, useEffect } from "react";
import { useData } from "../../../src/context/DataContext.jsx";
import { useAuth } from "../../../src/context/AuthContext.jsx";
import { chatApi } from "../../../src/api/chat.js";
import { teamApi } from "../../../src/api/team.js";
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
    const endRef = useRef();

    useEffect(() => {
        teamApi.getMyTeams().then(res => setTeams(res.data || [])).catch(() => {});
    }, []);

    useEffect(() => {
        if (selectedTeam) {
            setLoading(true);
            chatApi.getMessages(selectedTeam.id).then(res => {
                setMsgs(res.data || []);
                endRef.current?.scrollIntoView({ behavior: "smooth" });
            }).finally(() => setLoading(false));
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
        socket.on('chat:message', handleMsg);
        return () => socket.off('chat:message', handleMsg);
    }, [socket, selectedTeam]);

    const send = async () => {
        if (!txt.trim() || !selectedTeam) return;
        const msgText = txt.trim();
        setTxt(""); // optimistic clear
        
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
                        {selectedTeam && <button onClick={() => setSelectedTeam(null)} style={{ background:"none", border:"none", color:t.t3, cursor:"pointer", padding:0, display:"flex" }}><I d={IC.chk} sz={16}/></button>}
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
                                                <div style={{
                                                    background: isMe ? t.accent : t.inset,
                                                    color: isMe ? "#000" : t.t1,
                                                    padding: "8px 12px",
                                                    borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                                                    fontSize: 12.5, fontFamily: t.disp, lineHeight: 1.4, wordBreak: "break-word"
                                                }}>
                                                    {m.message}
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
                        <div style={{ padding: 12, borderTop: `1px solid ${t.border}`, background: t.card }}>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                                    placeholder="Type your message..."
                                    style={{ flex: 1, padding: "10px 14px", borderRadius: 20, border: `1px solid ${t.border}`, background: t.inset, color: t.t1, outline: "none", fontSize: 12.5, fontFamily: t.disp }} />
                                <button onClick={send} disabled={!txt.trim()}
                                    style={{ background: txt.trim() ? t.accent : t.inset, color: txt.trim() ? "#000" : t.t3, border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: txt.trim() ? "pointer" : "default", transition: "all .2s" }}>
                                    <I d={IC.snd} sz={14} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
