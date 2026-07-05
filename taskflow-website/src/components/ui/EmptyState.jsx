import { I, IC } from "./Icon.jsx";

export default function EmptyState({ t, icon = "task", title, description, ctaText, onCta, style = {} }) {
    // Pick icon path or fallback
    const iconPath = IC[icon] || IC.task;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px 24px",
            background: `linear-gradient(180deg, ${t.card}22 0%, ${t.card}44 100%)`,
            border: `1px dashed ${t.border}`,
            borderRadius: 16,
            margin: "12px 0",
            position: "relative",
            overflow: "hidden",
            ...style
        }}>
            {/* Visual spot illustration background */}
            <div style={{
                position: "absolute",
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${t.accent}0a 0%, transparent 70%)`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none"
            }} />

            {/* Glowing Icon Frame */}
            <div style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: t.inset,
                border: `1.5px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: t.accent,
                boxShadow: `0 8px 20px ${t.accent}08`,
                marginBottom: 16,
                position: "relative",
                zIndex: 1
            }}>
                <I d={iconPath} sz={22} c="currentColor" sw={1.8} />
            </div>

            {/* Title */}
            <h4 style={{
                fontSize: 15,
                fontWeight: 700,
                color: t.t1,
                margin: "0 0 6px 0",
                position: "relative",
                zIndex: 1,
                fontFamily: t.disp
            }}>
                {title}
            </h4>

            {/* Description */}
            <p style={{
                fontSize: 12,
                color: t.t2,
                margin: "0 0 20px 0",
                maxWidth: 290,
                lineHeight: 1.5,
                position: "relative",
                zIndex: 1,
                fontFamily: t.disp
            }}>
                {description}
            </p>

            {/* CTA Button */}
            {ctaText && onCta && (
                <button
                    onClick={onCta}
                    style={{
                        padding: "8px 18px",
                        borderRadius: 9,
                        cursor: "pointer",
                        background: t.accentDim,
                        color: t.accent,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: t.disp,
                        border: `1px solid ${t.accent}44`,
                        boxShadow: `0 4px 12px ${t.accent}12`,
                        transition: "all .18s",
                        position: "relative",
                        zIndex: 1
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = t.accent;
                        e.currentTarget.style.color = "#000";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = t.accentDim;
                        e.currentTarget.style.color = t.accent;
                    }}
                >
                    {ctaText}
                </button>
            )}
        </div>
    );
}
