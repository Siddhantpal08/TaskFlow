// ── TaskFlow Mobile Theme — Bluish Midnight (matches website MIDNIGHT theme) ──
export const DARK = {
    bg: "#0B0F1C",
    nav: "#080C18",
    card: "#1A2233",
    inset: "#0B0F1C",
    surf: "#111827",

    t1: "#F0F4FF",
    t2: "#8EA3BF",
    t3: "#3D5070",

    border: "#1E3050",

    accent: "#60A5FA",
    accentDim: "rgba(96, 165, 250, 0.12)",
    accentGlow: "0 0 28px rgba(96, 165, 250, 0.4)",

    amber: "#FFAA00",
    red: "#FF4D6A",
    green: "#34D399",
    purple: "#A78BFA",

    disp: "Outfit-Bold",
    body: "Outfit-Regular",
    mono: "Outfit-Medium",
};

export const LIGHT = {
    ...DARK,
}; // Stub if light mode isn't requested, we just use dark.
