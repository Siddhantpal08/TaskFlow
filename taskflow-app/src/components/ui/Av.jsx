export function Av({ u, sz = 32 }) {
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
