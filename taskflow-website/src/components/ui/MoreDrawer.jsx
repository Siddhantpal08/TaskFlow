import { useEffect } from "react";
import { I, IC } from "./Icon.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function MoreDrawer({ t, user, onClose, setPage }) {
    const { logout } = useAuth();

    // Prevent background scrolling when open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const items = [
        { id: "profile", label: "Profile", icon: IC.user, isProfile: true },
        { id: "guide", label: "Help & Guide", icon: IC.book },
        { id: "customize", label: "Customize", icon: IC.pal },
        { id: "trash", label: "Recycle Bin", icon: IC.trash },
    ];

    if (user?.role === 'admin') {
        items.push({ id: "admin", label: "Admin Panel", icon: IC.edt });
    }

    const navigate = (id) => {
        setPage(id);
        onClose();
    };

    return (
        <>
            <div 
                onClick={onClose} 
                style={{ 
                    position: "fixed", inset: 0, zIndex: 998, 
                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
                    transition: "opacity 0.2s" 
                }} 
            />
            <div className="slideUp-mobile" style={{
                position: "fixed", left: 0, right: 0, bottom: 0,
                background: t.card, borderTop: `1px solid ${t.border}`,
                borderRadius: "24px 24px 0 0", zIndex: 999,
                padding: "24px 20px 40px", display: "flex", flexDirection: "column",
                boxShadow: "0 -10px 40px rgba(0,0,0,0.3)",
                maxHeight: "85vh", overflowY: "auto"
            }}>
                <div style={{ width: 40, height: 4, background: t.border, borderRadius: 2, alignSelf: "center", marginBottom: 24 }} />
                
                <h3 style={{ fontSize: 18, fontWeight: 700, color: t.t1, margin: "0 0 16px 8px" }}>More</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {items.map(item => (
                        <button key={item.id} onClick={() => navigate(item.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                                background: item.isProfile ? t.accentDim : "transparent",
                                border: `1px solid ${item.isProfile ? t.accent + "44" : "transparent"}`,
                                borderRadius: 12, cursor: "pointer", textAlign: "left", width: "100%",
                                color: item.isProfile ? t.accent : t.t1, fontSize: 15, fontFamily: t.disp, fontWeight: 500
                            }}>
                            <I d={item.icon} sz={18} c={item.isProfile ? t.accent : t.t2} sw={2} />
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.isProfile && (
                                <div style={{ 
                                    width: 24, height: 24, borderRadius: "50%", 
                                    background: user?.avatar_url ? `url(${user.avatar_url}) center/cover` : `linear-gradient(135deg, ${t.accent}40, #0072FF40)`,
                                    display: "flex", alignItems: "center", justifyContent: "center", 
                                    fontSize: 9, fontWeight: 700, color: t.accent,
                                    border: `1px solid ${t.accent}44` 
                                }}>
                                    {!user?.avatar_url && (user?.avatar_initials || "?")}
                                </div>
                            )}
                        </button>
                    ))}
                    
                    <div style={{ height: 1, background: t.border, margin: "8px 0" }} />
                    
                    <button onClick={logout}
                        style={{
                            display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                            background: "transparent", border: "none", borderRadius: 12, 
                            cursor: "pointer", textAlign: "left", width: "100%",
                            color: t.red, fontSize: 15, fontFamily: t.disp, fontWeight: 500
                        }}>
                        <I d={IC.out} sz={18} c={t.red} sw={2} />
                        Sign Out
                    </button>
                </div>
            </div>
            
            <style>{`
                @keyframes slideUpMobile {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .slideUp-mobile {
                    animation: slideUpMobile 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </>
    );
}
