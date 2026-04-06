export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap');`;

export const DARK = {
    bg: "#060B12", surf: "#0C1420", card: "#0F1C2E", border: "#182A42",
    accent: "#00E5CC", accentDim: "#00E5CC14", accentGlow: "0 0 28px #00E5CC44",
    red: "#FF3D5A", amber: "#FFAA00", green: "#00D67B", blue: "#0072FF",
    t1: "#E2EFFF", t2: "#6A88AA", t3: "#2E4A68",
    nav: "#080E18", mono: "'IBM Plex Mono',monospace", disp: "'Outfit',sans-serif",
    shadow: "0 8px 32px #00000066", inset: "#060B12",
    noteBg: "#0C1420", noteCard: "#0F1C2E", noteBorder: "#182A42",
    noteText: "#E2EFFF", noteSubText: "#6A88AA", noteMuted: "#2E4A68",
    noteHover: "#00E5CC0A", noteActive: "#00E5CC14",
    codeBg: "#020609", codeText: "#00E5CC",
    calloutBg: "#0F1C2E", calloutBorder: "#FFAA0033", calloutText: "#FFAA00",
    quoteBorder: "#0072FF", quoteText: "#9AB8CC",
};

export const LIGHT = {
    bg: "#EFF3FA", surf: "#FFFFFF", card: "#FFFFFF", border: "#D8E2F0",
    accent: "#007A6A", accentDim: "#007A6A12", accentGlow: "0 0 24px #007A6A22",
    red: "#DC2626", amber: "#D97706", green: "#059669", blue: "#0051CC",
    t1: "#0D1B2E", t2: "#4A607A", t3: "#9AAEC8",
    nav: "#FFFFFF", mono: "'IBM Plex Mono',monospace", disp: "'Outfit',sans-serif",
    shadow: "0 4px 20px #00000012", inset: "#EFF3FA",
    noteBg: "#F9FAFB", noteCard: "#FFFFFF", noteBorder: "#E5E7EB",
    noteText: "#111827", noteSubText: "#6B7280", noteMuted: "#9CA3AF",
    noteHover: "#F3F4F6", noteActive: "#E0F7F4",
    codeBg: "#1E1E2E", codeText: "#A6E3A1",
    calloutBg: "#FFFBEB", calloutBorder: "#FDE68A", calloutText: "#92400E",
    quoteBorder: "#0051CC", quoteText: "#6B7280",
};

export const PURE_DARK = {
    ...DARK,
    bg: "#000000", surf: "#0A0A0A", card: "#111111", border: "#1A1A1A",
    nav: "#050505", inset: "#000000",
    noteBg: "#0A0A0A", noteCard: "#111111", noteBorder: "#1A1A1A",
    noteHover: "#00E5CC08",
};

export const PURE_LIGHT = {
    ...LIGHT,
    bg: "#FFFFFF", surf: "#FFFFFF", card: "#FAFAFA", border: "#E5E7EB",
    nav: "#FFFFFF", inset: "#F9FAFB",
    noteBg: "#FFFFFF", noteCard: "#FAFAFA", noteBorder: "#E5E7EB",
    noteHover: "#F3F4F6",
};

export const SEPIA = {
    ...LIGHT,
    bg: "#F5EDD6", surf: "#FDF6E3", card: "#FDF6E3", border: "#D4B896",
    accent: "#8B5E3C", accentDim: "#8B5E3C14", accentGlow: "0 0 24px #8B5E3C22",
    t1: "#2C1810", t2: "#6B4226", t3: "#B8956A",
    nav: "#FDF6E3", inset: "#F5EDD6",
    noteBg: "#FDF6E3", noteCard: "#F5EDD6", noteBorder: "#D4B896",
    noteText: "#2C1810", noteSubText: "#6B4226", noteMuted: "#B8956A",
    noteHover: "#8B5E3C0A",
    quoteBorder: "#8B5E3C", quoteText: "#6B4226",
    calloutBg: "#FEF3C7", calloutBorder: "#FDE68A", calloutText: "#78350F",
};

export const MIDNIGHT = {
    ...DARK,
    bg: "#0B0F1C", surf: "#111827", card: "#1A2233", border: "#1E3050",
    accent: "#60A5FA", accentDim: "#60A5FA14", accentGlow: "0 0 28px #60A5FA44",
    t1: "#F0F4FF", t2: "#718096", t3: "#2D3B55",
    nav: "#080C18", inset: "#0B0F1C",
    noteBg: "#111827", noteCard: "#1A2233", noteBorder: "#1E3050",
    noteText: "#F0F4FF", noteSubText: "#718096", noteMuted: "#2D3B55",
    noteHover: "#60A5FA0A", noteActive: "#60A5FA14",
    codeBg: "#060912", codeText: "#60A5FA",
    quoteBorder: "#3B82F6", quoteText: "#93C5FD",
    calloutBg: "#1A2233", calloutBorder: "#60A5FA33", calloutText: "#93C5FD",
};

export const THEMES = {
    dark: DARK,
    light: LIGHT,
    pureDark: PURE_DARK,
    pureLight: PURE_LIGHT,
    sepia: SEPIA,
    midnight: MIDNIGHT,
};

/**
 * Build a complete theme from 2 user-chosen colors.
 * @param {string} primary   - hex accent color, e.g. "#FF6B00"
 * @param {string} secondary - hex secondary color, e.g. "#0051CC"
 * @param {'dark'|'light'} base
 */
export function buildCustomTheme(primary, secondary, base = "dark") {
    const baseTheme = base === "dark" ? DARK : LIGHT;
    // Derive a dimmed version (15% opacity) and glow
    const accentDim = primary + "20";
    const accentGlow = `0 0 28px ${primary}44`;

    return {
        ...baseTheme,
        accent: primary,
        accentDim,
        accentGlow,
        blue: secondary,
        quoteBorder: secondary,
        noteHover: primary + "0A",
        noteActive: primary + "18",
        codeBg: base === "dark" ? "#020609" : "#1E1E2E",
        codeText: primary,
        calloutBorder: primary + "44",
        calloutText: primary,
    };
}
