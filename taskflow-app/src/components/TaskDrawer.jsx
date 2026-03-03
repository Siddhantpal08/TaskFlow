import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { Tag, PriTag, StTag } from "./ui/Tag.jsx";
import { USERS } from "../data/data.js";

export default function TaskDrawer({ t, task, onClose }) {
    const by = USERS.find(u => u.id === task.by) || USERS[0];
    const to = USERS.find(u => u.id === task.to) || USERS[0];

    return (
        <>
            <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 40, backdropFilter: "blur(2px)" }} />
            <div className="slideRight" style={{
                position: "fixed", top: 0, right: 0, height: "100vh", width: 360, zIndex: 50,
                background: t.surf, borderLeft: `1px solid ${t.border}`, display: "flex", flexDirection: "column",
                overflow: "hidden", boxShadow: "-20px 0 60px #00000044"
            }}>
                <div style={{ padding: "15px 18px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.t1 }}>Task Detail</span>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }} className="hvrI">
                        <I d={IC.x} sz={17} c={t.t2} />
                    </button>
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: 18 }}>
                    <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
                        <StTag s={task.st} t={t} /><PriTag p={task.pri} t={t} />
                        {task.delegated && <Tag label="Delegated ↗" color={t.amber} />}
                    </div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: t.t1, marginBottom: 10, letterSpacing: "-0.3px", lineHeight: 1.4 }}>
                        {task.title.trim()}
                    </h2>
                    <p style={{ fontSize: 12.5, color: t.t2, lineHeight: 1.7, marginBottom: 18, fontFamily: t.mono }}>{task.desc}</p>
                    {[
                        { label: "Assigned By", el: <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Av u={by} sz={22} /><span style={{ fontSize: 12.5, color: t.t1 }}>{by.name}</span></div> },
                        { label: "Assigned To", el: <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Av u={to} sz={22} /><span style={{ fontSize: 12.5, color: t.t1 }}>{to.name}</span></div> },
                        { label: "Due Date", el: <span style={{ fontSize: 12.5, color: t.t1, fontFamily: t.mono }}>{task.due}</span> },
                    ].map(({ label, el }) => (
                        <div key={label} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${t.border}` }}>
                            <div style={{ fontSize: 10, color: t.t3, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: t.mono }}>{label}</div>
                            {el}
                        </div>
                    ))}
                    <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 18 }}>
                        <button style={{ padding: "10px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: t.disp, fontSize: 13, fontWeight: 700, background: `linear-gradient(135deg,${t.green},#009950)`, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                            <I d={IC.chk} sz={15} c="#000" sw={2.5} />Mark Complete
                        </button>
                        <button style={{ padding: "10px", borderRadius: 9, cursor: "pointer", fontFamily: t.disp, fontSize: 13, fontWeight: 700, border: `1px solid ${t.amber}44`, background: t.amber + "12", color: t.amber, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                            <I d={IC.del} sz={15} c={t.amber} />Delegate Task
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
