export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap');`;

export const DARK = {
    bg: "#060B12", surf: "#0C1420", card: "#0F1C2E", border: "#182A42",
    accent: "#00E5CC", accentDim: "#00E5CC14", accentGlow: "0 0 28px #00E5CC44",
    gold: "#F59E0B", goldDim: "#F59E0B18", goldGlow: "0 0 20px #F59E0B44",
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

export const MONOCHROME = {
    ...PURE_DARK,
    red: "#A1A1AA", amber: "#D4D4D8", green: "#E4E4E7", blue: "#FAFAFA",
    accent: "#FFFFFF", accentDim: "#FFFFFF14", accentGlow: "0 0 28px #FFFFFF44",
    t1: "#FFFFFF", t2: "#A0A0A0", t3: "#505050",
    noteHover: "#FFFFFF0A", noteActive: "#FFFFFF14",
    codeBg: "#050505", codeText: "#FFFFFF",
    quoteBorder: "#FFFFFF", quoteText: "#A0A0A0",
    calloutBg: "#111111", calloutBorder: "#FFFFFF33", calloutText: "#FFFFFF",
};

// ── NEW PRESET: Forest ───────────────────────────────────────────────────────
export const FOREST = {
    bg: "#030D08", surf: "#071510", card: "#0B1E12", border: "#12301A",
    accent: "#22C55E", accentDim: "#22C55E14", accentGlow: "0 0 28px #22C55E44",
    red: "#FF3D5A", amber: "#FBBF24", green: "#4ADE80", blue: "#34D399",
    t1: "#ECFDF5", t2: "#6EE7B7", t3: "#1A4030",
    nav: "#020A06", mono: "'IBM Plex Mono',monospace", disp: "'Outfit',sans-serif",
    shadow: "0 8px 32px #00000066", inset: "#030D08",
    noteBg: "#071510", noteCard: "#0B1E12", noteBorder: "#12301A",
    noteText: "#ECFDF5", noteSubText: "#6EE7B7", noteMuted: "#1A4030",
    noteHover: "#22C55E0A", noteActive: "#22C55E14",
    codeBg: "#010803", codeText: "#22C55E",
    calloutBg: "#0B1E12", calloutBorder: "#FBBF2433", calloutText: "#FBBF24",
    quoteBorder: "#34D399", quoteText: "#A7F3D0",
};

// ── NEW PRESET: Rose Gold ────────────────────────────────────────────────────
export const ROSE_GOLD = {
    bg: "#0F090C", surf: "#1C0E14", card: "#24101A", border: "#3D1828",
    accent: "#F43F5E", accentDim: "#F43F5E14", accentGlow: "0 0 28px #F43F5E44",
    red: "#FB7185", amber: "#FBBF24", green: "#34D399", blue: "#C084FC",
    t1: "#FFF1F2", t2: "#FDA4AF", t3: "#4C1B26",
    nav: "#0A060A", mono: "'IBM Plex Mono',monospace", disp: "'Outfit',sans-serif",
    shadow: "0 8px 32px #00000066", inset: "#0F090C",
    noteBg: "#1C0E14", noteCard: "#24101A", noteBorder: "#3D1828",
    noteText: "#FFF1F2", noteSubText: "#FDA4AF", noteMuted: "#4C1B26",
    noteHover: "#F43F5E0A", noteActive: "#F43F5E14",
    codeBg: "#060305", codeText: "#F43F5E",
    calloutBg: "#24101A", calloutBorder: "#FBBF2433", calloutText: "#FBBF24",
    quoteBorder: "#C084FC", quoteText: "#F9A8D4",
};

// ── NEW PRESET: Ocean ────────────────────────────────────────────────────────
export const OCEAN = {
    bg: "#010C14", surf: "#04182A", card: "#062039", border: "#0A3050",
    accent: "#22D3EE", accentDim: "#22D3EE14", accentGlow: "0 0 28px #22D3EE44",
    red: "#FF6B9D", amber: "#FBBF24", green: "#34D399", blue: "#60A5FA",
    t1: "#E0F7FF", t2: "#67E8F9", t3: "#083D60",
    nav: "#01090F", mono: "'IBM Plex Mono',monospace", disp: "'Outfit',sans-serif",
    shadow: "0 8px 32px #00000077", inset: "#010C14",
    noteBg: "#04182A", noteCard: "#062039", noteBorder: "#0A3050",
    noteText: "#E0F7FF", noteSubText: "#67E8F9", noteMuted: "#083D60",
    noteHover: "#22D3EE0A", noteActive: "#22D3EE14",
    codeBg: "#000608", codeText: "#22D3EE",
    calloutBg: "#062039", calloutBorder: "#FBBF2433", calloutText: "#FBBF24",
    quoteBorder: "#60A5FA", quoteText: "#BAE6FD",
};

// ── NEW PRESET: Sunset ───────────────────────────────────────────────────────
export const SUNSET = {
    bg: "#0F0805", surf: "#1E1008", card: "#271508", border: "#3E2010",
    accent: "#F97316", accentDim: "#F9731614", accentGlow: "0 0 28px #F9731644",
    red: "#EF4444", amber: "#FCD34D", green: "#34D399", blue: "#FB923C",
    t1: "#FFF7ED", t2: "#FED7AA", t3: "#451A03",
    nav: "#0A0603", mono: "'IBM Plex Mono',monospace", disp: "'Outfit',sans-serif",
    shadow: "0 8px 32px #00000066", inset: "#0F0805",
    noteBg: "#1E1008", noteCard: "#271508", noteBorder: "#3E2010",
    noteText: "#FFF7ED", noteSubText: "#FED7AA", noteMuted: "#451A03",
    noteHover: "#F973160A", noteActive: "#F9731614",
    codeBg: "#060300", codeText: "#F97316",
    calloutBg: "#271508", calloutBorder: "#FCD34D33", calloutText: "#FCD34D",
    quoteBorder: "#FB923C", quoteText: "#FDBA74",
};

export const THEMES = {
    dark: DARK,
    light: LIGHT,
    pureDark: PURE_DARK,
    pureLight: PURE_LIGHT,
    sepia: SEPIA,
    midnight: MIDNIGHT,
    monochrome: MONOCHROME,
    forest: FOREST,
    roseGold: ROSE_GOLD,
    ocean: OCEAN,
    sunset: SUNSET,
};

/**
 * Build a COMPLETE theme from user-chosen colors.
 * Changes the ENTIRE app chrome — not just buttons.
 *
 * @param {string} primary    - hex accent color, e.g. "#FF6B00"
 * @param {string} secondary  - hex secondary color, e.g. "#0051CC"
 * @param {'dark'|'light'} base
 */
export function buildCustomTheme(primary, secondary, base = "dark") {
    const accentDim  = primary + "20";
    const accentGlow = `0 0 28px ${primary}44`;

    if (base === "light") {
        return {
            ...LIGHT,
            accent: primary,
            accentDim,
            accentGlow,
            blue: secondary,
            // Tint backgrounds with a faint wash of primary color
            bg:   blendHex("#EFF3FA", primary, 0.04),
            surf: blendHex("#FFFFFF", primary, 0.02),
            card: blendHex("#FFFFFF", primary, 0.01),
            nav:  blendHex("#FFFFFF", primary, 0.03),
            border: blendHex("#D8E2F0", primary, 0.12),
            inset: blendHex("#EFF3FA", primary, 0.04),
            // Text tints
            t1: "#0D1B2E",
            t2: blendHex("#4A607A", primary, 0.1),
            t3: blendHex("#9AAEC8", primary, 0.08),
            // Notes
            noteBg:    blendHex("#F9FAFB", primary, 0.03),
            noteCard:  blendHex("#FFFFFF", primary, 0.01),
            noteBorder: blendHex("#E5E7EB", primary, 0.1),
            noteText:  "#111827",
            noteSubText: blendHex("#6B7280", primary, 0.1),
            noteMuted: "#9CA3AF",
            noteHover:  primary + "0A",
            noteActive: primary + "16",
            // Code/quote
            codeBg: "#1E1E2E", codeText: primary,
            quoteBorder: secondary,
            quoteText:  blendHex("#6B7280", secondary, 0.15),
            calloutBg: blendHex("#FFFBEB", primary, 0.05),
            calloutBorder: primary + "44",
            calloutText: primary,
        };
    }

    // Dark base — derive all dark chrome from primary hue
    return {
        ...DARK,
        accent: primary,
        accentDim,
        accentGlow,
        blue: secondary,
        // Dark backgrounds tinted with primary hue
        bg:   darkenWithHue(primary, 0.04, 0.97),
        surf: darkenWithHue(primary, 0.06, 0.94),
        card: darkenWithHue(primary, 0.08, 0.91),
        nav:  darkenWithHue(primary, 0.03, 0.98),
        border: primary + "28",
        inset: darkenWithHue(primary, 0.03, 0.98),
        shadow: `0 8px 32px ${primary}11`,
        // Text stays mostly white but with a slight primary tint
        t1: blendHex("#E2EFFF", primary, 0.06),
        t2: blendHex("#6A88AA", primary, 0.12),
        t3: primary + "40",
        // Notes
        noteBg:    darkenWithHue(primary, 0.06, 0.94),
        noteCard:  darkenWithHue(primary, 0.08, 0.91),
        noteBorder: primary + "28",
        noteText:  blendHex("#E2EFFF", primary, 0.06),
        noteSubText: blendHex("#6A88AA", primary, 0.12),
        noteMuted:  primary + "40",
        noteHover:  primary + "0A",
        noteActive: primary + "18",
        // Code/quote
        codeBg: darkenWithHue(primary, 0.02, 0.99),
        codeText: primary,
        quoteBorder: secondary,
        quoteText: blendHex("#9AB8CC", secondary, 0.15),
        calloutBg:    darkenWithHue(primary, 0.08, 0.91),
        calloutBorder: primary + "44",
        calloutText:   primary,
    };
}

// ── Color math helpers ────────────────────────────────────────────────────────

/** Blend two hex colors. ratio=1 => pure primary, ratio=0 => pure base */
function blendHex(base, primary, ratio) {
    try {
        const b = hexToRgb(base);
        const p = hexToRgb(primary);
        if (!b || !p) return base;
        const r = Math.round(b.r + (p.r - b.r) * ratio);
        const g = Math.round(b.g + (p.g - b.g) * ratio);
        const bl = Math.round(b.b + (p.b - b.b) * ratio);
        return rgbToHex(r, g, bl);
    } catch { return base; }
}

/** Create a very dark color with the hue of `primary`, at `darkness` level */
function darkenWithHue(primary, saturation, darkness) {
    try {
        const { h } = rgbToHsl(hexToRgb(primary));
        const lightness = (1 - darkness) * 0.18; // 0–18% lightness range
        const s = saturation * 0.5; // low saturation for backgrounds
        const { r, g, b } = hslToRgb(h, s, lightness);
        return rgbToHex(r, g, b);
    } catch { return "#060B12"; }
}

function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
    return m ? { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) } : null;
}

function rgbToHex(r, g, b) {
    return '#' + [r,g,b].map(v => Math.min(255,Math.max(0,v)).toString(16).padStart(2,'0')).join('');
}

function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            default: h = (r - g) / d + 4;
        }
        h /= 6;
    }
    return { h, s, l };
}

function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q-p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q-p) * (2/3-t) * 6;
            return p;
        };
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) };
}
