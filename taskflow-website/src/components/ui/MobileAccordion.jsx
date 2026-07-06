import { useState } from "react";
import { I, IC } from "./Icon.jsx";

export default function MobileAccordion({ t, title, icon, defaultOpen = false, children }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div style={{ 
            background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, 
            overflow: "hidden", marginBottom: 12, transition: "all 0.2s" 
        }}>
            <button onClick={() => setOpen(!open)}
                style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", 
                    width: "100%", padding: "14px 16px", background: "transparent", border: "none", 
                    cursor: "pointer", color: t.t1, fontSize: 14, fontWeight: 600, fontFamily: t.disp
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {icon && <I d={icon} sz={16} c={t.t2} />}
                    {title}
                </div>
                <div style={{ 
                    transform: open ? "rotate(180deg)" : "rotate(0deg)", 
                    transition: "transform 0.2s", display: "flex" 
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.t2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </button>
            
            <div style={{ 
                maxHeight: open ? "1000px" : "0px", 
                opacity: open ? 1 : 0,
                transition: "max-height 0.3s ease-in-out, opacity 0.2s ease-in-out",
                overflow: "hidden" 
            }}>
                <div style={{ padding: "0 16px 16px 16px", borderTop: open ? `1px solid ${t.border}44` : "none" }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
