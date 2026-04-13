// BlockHandle — the ⠿ drag grip + ⋮ options menu that appears on hover to the LEFT of each block.
// The ⋮ menu opens BELOW the dots button (not to the right) so it never overlaps the text area.

const CONVERT_OPTIONS = [
    { label: "Text (p)", type: "p" },
    { label: "Heading 1", type: "h1" },
    { label: "Heading 2", type: "h2" },
    { label: "Heading 3", type: "h3" },
    { label: "Bullet list", type: "ul" },
    { label: "Numbered list", type: "ol" },
    { label: "To-do", type: "todo" },
    { label: "Quote", type: "quote" },
    { label: "Callout", type: "callout" },
    { label: "Code", type: "code" },
    { label: "Divider", type: "divider" },
];

export default function BlockHandle({ hov, menuOpen, setMenuOpen, onDelete, onConvert, t, blkType }) {
    return (
        <div className="blkh" style={{
            position: "absolute", left: -44, top: "50%", transform: "translateY(-50%)",
            display: "flex", alignItems: "center", gap: 2,
            opacity: hov ? 1 : 0, transition: "opacity .15s", zIndex: 10,
        }}>
            {/* Drag grip */}
            <span
                style={{ fontSize: 14, color: t.t3, cursor: "grab", padding: "2px 3px", borderRadius: 4, lineHeight: 1, userSelect: "none" }}
                onMouseEnter={e => e.currentTarget.style.background = t.noteHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                title="Drag to reorder"
            >⠿</span>

            {/* ⋮ Options button — menu opens DOWNWARD from the button */}
            <div style={{ position: "relative" }}>
                <button
                    onClick={() => setMenuOpen(p => !p)}
                    style={{
                        width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                        border: "none", background: "transparent", cursor: "pointer", borderRadius: 4, color: t.t3,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = t.noteHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    title="Block options"
                >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" />
                        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
                        <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
                    </svg>
                </button>

                {menuOpen && (
                    <>
                        {/* Click-away backdrop */}
                        <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 200 }} />

                        {/* Menu opens BELOW the button and to the right within the left margin — never over text */}
                        <div
                            className="slideDown"
                            style={{
                                position: "absolute",
                                top: "100%",   // below the ⋮ button
                                left: 0,       // aligned to the left of the handle (the -44px zone)
                                marginTop: 4,
                                zIndex: 201,
                                background: t.card,
                                border: `1px solid ${t.border}`,
                                borderRadius: 9,
                                boxShadow: t.shadow,
                                width: 160,
                                overflow: "hidden",
                            }}
                        >
                            {/* Delete */}
                            <button
                                onClick={() => { onDelete(); setMenuOpen(false); }}
                                style={{
                                    width: "100%", padding: "8px 12px", border: "none", background: "transparent",
                                    cursor: "pointer", fontSize: 12.5, color: t.red, fontFamily: t.disp,
                                    textAlign: "left", transition: "background .1s", display: "flex", alignItems: "center", gap: 6,
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = t.red + "15"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                🗑 Delete block
                            </button>

                            {/* Separator */}
                            <div style={{ height: 1, background: t.border, margin: "2px 0" }} />

                            {/* "Turn into" label */}
                            <div style={{ padding: "4px 12px 3px", fontSize: 9.5, color: t.t3, fontFamily: t.mono, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                                Turn into
                            </div>

                            {/* Conversion options — skip the current type */}
                            {CONVERT_OPTIONS.filter(o => o.type !== blkType).map(opt => (
                                <button
                                    key={opt.type}
                                    onClick={() => { onConvert?.(opt.type); setMenuOpen(false); }}
                                    style={{
                                        width: "100%", padding: "6px 12px", border: "none", background: "transparent",
                                        cursor: "pointer", fontSize: 12, color: t.t1, fontFamily: t.disp,
                                        textAlign: "left", transition: "background .1s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = t.noteHover}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
