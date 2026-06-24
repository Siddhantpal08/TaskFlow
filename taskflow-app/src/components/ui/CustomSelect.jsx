import { useState, useEffect, useRef } from "react";

export default function CustomSelect({ options, value, onChange, t, style, disabled }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close when clicking outside the dropdown container
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value)) || options[0];

    const handleSelect = (val) => {
        if (disabled) return;
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} style={{ position: "relative", width: "100%", ...style }}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(p => !p)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: t.inset || "rgba(0,0,0,0.2)",
                    border: `1px solid ${isOpen ? t.accent : t.border}`,
                    borderRadius: 8,
                    padding: "9px 12px",
                    color: selectedOption ? t.t1 : t.t3,
                    fontSize: 13,
                    fontFamily: t.disp,
                    width: "100%",
                    outline: "none",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                    boxShadow: isOpen ? `0 0 0 2px ${t.accent}22` : "none",
                    textAlign: "left",
                }}
            >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedOption ? selectedOption.label : "Select option..."}
                </span>
                <span style={{ fontSize: 9, color: t.t3, marginLeft: 8, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                    ▼
                </span>
            </button>

            {isOpen && !disabled && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    background: t.card || "#111827",
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    boxShadow: t.shadow || "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                    zIndex: 9999,
                    maxHeight: 200,
                    overflowY: "auto",
                    padding: 4,
                }} className="fadeUp">
                    {options.map((opt) => {
                        const isSelected = String(opt.value) === String(value);
                        return (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 6,
                                    color: isSelected ? t.accent : t.t2,
                                    background: isSelected ? t.accentDim : "transparent",
                                    fontSize: 13,
                                    fontFamily: t.disp,
                                    cursor: "pointer",
                                    transition: "background 0.1s ease, color 0.1s ease",
                                    userSelect: "none",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                                onMouseEnter={e => {
                                    if (!isSelected) {
                                        e.currentTarget.style.background = t.noteHover || "rgba(255,255,255,0.05)";
                                        e.currentTarget.style.color = t.t1;
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isSelected) {
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.color = t.t2;
                                    }
                                }}
                            >
                                {opt.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
