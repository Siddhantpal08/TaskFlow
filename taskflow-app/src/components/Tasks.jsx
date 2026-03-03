import { useState } from "react";
import { I, IC } from "./ui/Icon.jsx";
import { Av } from "./ui/Av.jsx";
import { PriTag, StTag } from "./ui/Tag.jsx";
import { TASKS, USERS } from "../data/data.js";

export default function Tasks({ t, setTask }) {
    const [fil, setFil] = useState("all");
    const tabs = ["all", "pending", "active", "done", "delegated"];
    const count = f => f === "all" ? TASKS.length : f === "delegated" ? TASKS.filter(x => x.delegated).length : TASKS.filter(x => x.st === f).length;
    const list = TASKS.filter(tk => fil === "all" ? true : fil === "delegated" ? tk.delegated : tk.st === fil);

    return (
        <div style={{ padding: "22px 26px" }}>
            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
                {tabs.map(f => {
                    const a = fil === f; return (
                        <button key={f} onClick={() => setFil(f)} className="pill"
                            style={{ padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: t.disp, fontSize: 12, fontWeight: a ? 600 : 400, border: `1px solid ${a ? t.accent : t.border}`, background: a ? t.accentDim : t.card, color: a ? t.accent : t.t2, transition: "all .15s", display: "flex", alignItems: "center", gap: 6 }}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span style={{ fontSize: 10, background: a ? t.accent + "28" : t.border, color: a ? t.accent : t.t3, padding: "1px 6px", borderRadius: 10 }}>{count(f)}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tasks table */}
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", boxShadow: t.shadow }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 100px 80px 88px", padding: "10px 18px", borderBottom: `1px solid ${t.border}`, fontSize: 10, fontWeight: 600, color: t.t3, textTransform: "uppercase", letterSpacing: "0.7px", fontFamily: t.mono }}>
                    <span>Task</span><span>Assigned By</span><span>Due</span><span>Priority</span><span>Status</span>
                </div>
                {list.map(tk => (
                    <div key={tk.id} className="hvr" onClick={() => setTask(tk)}
                        style={{ display: "grid", gridTemplateColumns: "1fr 130px 100px 80px 88px", padding: "12px 18px", borderBottom: `1px solid ${t.border}`, alignItems: "center", cursor: "pointer", background: "transparent", transition: "background .15s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${tk.st === "done" ? t.green : t.border}`, background: tk.st === "done" ? t.green + "20" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {tk.st === "done" && <I d={IC.chk} sz={9} c={t.green} sw={3} />}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: tk.title.startsWith(" ") ? 11.5 : 13, fontWeight: 500, color: t.t1, textDecoration: tk.st === "done" ? "line-through" : "none", opacity: tk.st === "done" ? 0.45 : 1, fontFamily: tk.title.startsWith(" ") ? t.mono : t.disp, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {tk.title}
                                </div>
                                {tk.delegated && <span style={{ fontSize: 10, color: t.amber }}>↗ delegated</span>}
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <Av u={USERS.find(u => u.id === tk.by) || USERS[0]} sz={20} />
                            <span style={{ fontSize: 11.5, color: t.t2 }}>{(USERS.find(u => u.id === tk.by) || USERS[0]).name.split(" ")[0]}</span>
                        </div>
                        <span style={{ fontFamily: t.mono, fontSize: 11, color: t.t3 }}>{tk.due}</span>
                        <PriTag p={tk.pri} t={t} />
                        <StTag s={tk.st} t={t} />
                    </div>
                ))}
            </div>
        </div>
    );
}
