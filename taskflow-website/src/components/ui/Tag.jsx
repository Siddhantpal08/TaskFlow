export function Tag({ label, color }) {
    return (
        <span style={{
            padding: "2px 9px", borderRadius: 20, fontSize: 10.5, fontWeight: 600,
            color, background: color + "20", fontFamily: "'Outfit'", letterSpacing: "0.2px",
            whiteSpace: "nowrap"
        }}>
            {label}
        </span>
    );
}

export function PriTag({ p, t }) {
    const m = { high: [t.red, "High"], medium: [t.amber, "Med"], low: [t.green, "Low"] };
    const [c, l] = m[p] || [t.t2, p];
    return <Tag label={l} color={c} />;
}

export function StTag({ s, t }) {
    const m = { done: [t.green, "Done"], active: [t.accent, "Active"], pending: [t.t2, "Pending"], pending_approval: [t.orange || '#FFB020', "Needs Apprvl"], refused: [t.red, "Refused"] };
    const [c, l] = m[s] || [t.t2, s];
    return <Tag label={l} color={c} />;
}
