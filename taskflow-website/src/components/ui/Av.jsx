import { useState } from "react";

export function Av({ u, sz = 32 }) {
    const [failed, setFailed] = useState(false);
    if (u?.avatar_url && !failed) {
        return (
            <img
                src={u.avatar_url}
                alt={u.name || "Avatar"}
                style={{
                    width: sz, height: sz, borderRadius: "50%", flexShrink: 0,
                    objectFit: "cover", border: `1.5px solid ${u.color}55`
                }}
                onError={() => setFailed(true)}
            />
        );
    }
    return (
        <div style={{
            width: sz, height: sz, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg,${u.color}25,${u.color}50)`,
            border: `1.5px solid ${u.color}55`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: sz * 0.31, fontWeight: 700, color: u.color,
            fontFamily: "'Outfit'", letterSpacing: "-0.5px"
        }}>
            {u.av}
        </div>
    );
}
