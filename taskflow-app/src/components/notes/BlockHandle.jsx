// BlockHandle — only the ⠿ drag grip now.
// All options (delete, convert, duplicate) moved to right-click context menu in NoteBlock.
export default function BlockHandle({ hov, t, dragHandleProps }) {
    return (
        <div className="blkh" style={{
            position: "absolute", left: -30, top: "50%", transform: "translateY(-50%)",
            opacity: hov ? 1 : 0, transition: "opacity .15s", zIndex: 10,
            display: "flex", alignItems: "center",
        }}>
            <span
                {...dragHandleProps}
                style={{
                    fontSize: 14, color: t.t3, cursor: "grab", padding: "2px 3px",
                    borderRadius: 4, lineHeight: 1, userSelect: "none",
                    display: "flex", alignItems: "center",
                }}
                title="Drag to reorder"
            >⠿</span>
        </div>
    );
}
