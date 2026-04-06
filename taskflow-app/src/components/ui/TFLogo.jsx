/**
 * TFLogo — TaskFlow brand mark
 *
 * Usage:
 *   import TFLogo from '../ui/TFLogo.jsx';
 *   <TFLogo size={34} />                        // icon only
 *   <TFLogo size={34} showText />               // icon + "TaskFlow" wordmark
 *   <TFLogo size={34} showText monoText />      // "Task" is also white (monochrome text)
 */
export default function TFLogo({ size = 34, showText = false, textColor = "#E2EFFF", monoText = false }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
            {/* TF squircle icon */}
            <svg
                width={size} height={size}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="TaskFlow logo"
                role="img"
                style={{ flexShrink: 0 }}
            >
                <defs>
                    <linearGradient id="tfLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00E5CC" />
                        <stop offset="100%" stopColor="#0072FF" />
                    </linearGradient>
                </defs>
                {/* Squircle background */}
                <rect width="100" height="100" rx="24" fill="url(#tfLogoGrad)" />
                {/* T crossbar */}
                <rect x="18" y="24" width="64" height="12" rx="6" fill="white" />
                {/* T stem + F stem (vertical bar) */}
                <rect x="44" y="24" width="12" height="55" rx="6" fill="white" />
                {/* F middle arm */}
                <rect x="44" y="50" width="32" height="10" rx="5" fill="white" />
            </svg>

            {/* Optional wordmark */}
            {showText && (
                <span style={{
                    fontSize: size * 0.53,
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: textColor,
                    fontFamily: "'Outfit', sans-serif",
                    lineHeight: 1,
                    userSelect: "none",
                }}>
                    {monoText
                        ? "TaskFlow"
                        : <>Task<span style={{ color: "#00E5CC" }}>Flow</span></>
                    }
                </span>
            )}
        </div>
    );
}
