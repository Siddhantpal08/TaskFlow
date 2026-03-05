export const DARK = {
    bg: "#060B12",
    nav: "#09101A",
    card: "#0C1420",
    inset: "#060A10",
    surf: "#0F1927",

    t1: "#F1F5F9",
    t2: "#94A3B8",
    t3: "#64748B",

    border: "#1E2A3B",

    accent: "#00E5CC",
    accentDim: "rgba(0, 229, 204, 0.12)",
    accentGlow: "0 0 16px rgba(0, 229, 204, 0.4)",

    amber: "#FFAA00",
    red: "#FF3D5A",
    green: "#00D67B",
    purple: "#B083FF",

    disp: "Outfit-Bold",
    body: "Outfit-Regular",
    mono: "Outfit-Medium",
};

export const LIGHT = {
    ...DARK,
}; // Stub if light mode isn't requested, we just use dark.
