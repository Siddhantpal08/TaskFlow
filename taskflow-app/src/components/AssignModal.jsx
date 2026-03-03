import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { USERS } from "../data/data.js";

export default function AssignModal({ t, onClose }) {
    const [selUser, setSelUser] = useState(null);
    const [pri, setPri] = useState("medium");

    return (
        <>
            <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 40, backdropFilter: "blur(3px)" }} />
            <div className="popIn" style={{
                position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                width: 440, zIndex: 50, background: t.surf, border: `1px solid ${t.border}`, borderRadius: 16,
                boxShadow: "0 32px 70px #00000066", overflow: "hidden"
            }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontSize: 14.5, fontWeight: 800, color: t.t1 }}>Assign New Task</div>
                        <div style={{ fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 1 }}>Any user can assign to anyone — no fixed roles</div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }} className="hvrI">
                        <I d={IC.x} sz={17} c={t.t2} />
                    </button>
                </div>
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                        <label style={{ fontSize: 10, color: t.t3, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: t.mono }}>Title</label>
                        <input placeholder="e.g. Set up authentication module…"
                            style={{ width: "100%", background: t.inset, border: `1px solid ${t.border}`, borderRadius: 8, padding: "9px 13px", color: t.t1, fontSize: 13, fontFamily: t.disp }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 10, color: t.t3, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: t.mono }}>Description</label>
                        <textarea rows={3} placeholder="Describe the task…"
                            style={{ width: "100%", background: t.inset, border: `1px solid ${t.border}`, borderRadius: 8, padding: "9px 13px", color: t.t1, fontSize: 12.5, fontFamily: t.mono, resize: "none" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 10, color: t.t3, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: t.mono }}>Priority</label>
                            <div style={{ display: "flex", gap: 5 }}>
                                {["low", "medium", "high"].map(p => {
                                    const c = p === "high" ? t.red : p === "medium" ? t.amber : t.green;
                                    return <button key={p} onClick={() => setPri(p)}
                                        style={{ flex: 1, padding: "7px 4px", borderRadius: 7, cursor: "pointer", fontFamily: t.disp, fontSize: 10.5, fontWeight: 600, border: `1px solid ${pri === p ? c : t.border}`, background: pri === p ? c + "18" : "transparent", color: c, transition: "all .15s" }}>
                                        {p.charAt(0).toUpperCase() + p.slice(1)}</button>;
                                })}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: 10, color: t.t3, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: t.mono }}>Due Date</label>
                            <input type="date" style={{ width: "100%", background: t.inset, border: `1px solid ${t.border}`, borderRadius: 8, padding: "7px 11px", color: t.t1, fontSize: 12, fontFamily: t.mono }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 10, color: t.t3, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: t.mono }}>Assign To</label>
                        <div style={{ display: "flex", gap: 8 }}>
                            {USERS.filter(u => u.id !== 1).map(u => (
                                <button key={u.id} onClick={() => setSelUser(u.id)}
                                    style={{ flex: 1, padding: "10px 5px", borderRadius: 9, cursor: "pointer", border: `1px solid ${selUser === u.id ? u.color : t.border}`, background: selUser === u.id ? u.color + "14" : t.inset, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all .15s" }}>
                                    <Av u={u} sz={28} />
                                    <span style={{ fontSize: 10, color: t.t1, fontFamily: t.disp }}>{u.name.split(" ")[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <button className="hvrB"
                        style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: t.disp, fontSize: 13.5, fontWeight: 800, background: `linear-gradient(135deg,${t.accent},#009688)`, color: "#000", marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: t.accentGlow, transition: "all .18s" }}>
                        <I d={IC.send} sz={15} c="#000" sw={2} />Assign Task
                    </button>
                </div>
            </div>
        </>
    );
}
