import { useState, useRef, useEffect } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";

export default function TeamChatDrawer({ t, team, members, user, onClose }) {
    const [msgs, setMsgs] = useState([
        { id: 1, text: "Welcome to the team chat! This feature is currently in beta.", sender: "system", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [txt, setTxt] = useState("");
    const endRef = useRef();

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [msgs]);

    const send = () => {
        if (!txt.trim()) return;
        setMsgs(m => [...m, { id: Date.now(), text: txt, sender: user.id, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setTxt("");
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
                        <div style={{ fontSize: 11, color: t.t3, marginTop: 4 }}>{team?.name}</div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: t.t3, fontSize: 24, cursor: "pointer", lineHeight: 1 }}>&times;</button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {msgs.map(m => {
                        if (m.sender === "system") {
                            return (
                                <div key={m.id} style={{ textAlign: "center", fontSize: 11, color: t.t3, margin: "10px 0", fontFamily: t.mono }}>
                                    — {m.text} —
                                </div>
                            );
                        }
                        const isMe = m.sender === user.id;
                        const mem = members.find(x => x.id === m.sender);
                        return (
                            <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
                                {!isMe && mem && (
                                    <div style={{ paddingBottom: 20 }}>
                                        <Av u={{ ...mem, av: mem.avatar_initials || mem.name?.slice(0, 2), color: t.accent, avatar_url: mem.avatar_url }} sz={28} />
                                    </div>
                                )}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                                    {!isMe && mem && <span style={{ fontSize: 10, color: t.t3, marginBottom: 4, marginLeft: 2 }}>{mem.name.split(" ")[0]}</span>}
                                    <div style={{
                                        background: isMe ? t.accent : t.inset,
                                        color: isMe ? "#000" : t.t1,
                                        padding: "10px 14px",
                                        borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                                        fontSize: 13, fontFamily: t.disp, lineHeight: 1.4, wordBreak: "break-word"
                                    }}>
                                        {m.text}
                                    </div>
                                    <span style={{ fontSize: 9, color: t.t3, marginTop: 4, fontFamily: t.mono }}>{m.time}</span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={endRef} />
                </div>

                {/* Input */}
                <div style={{ padding: 16, borderTop: `1px solid ${t.border}`, background: t.card }}>
                    <div style={{ display: "flex", gap: 10 }}>
                        <input value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
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
