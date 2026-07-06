import { I } from "./Icon.jsx";

export default function MobileFAB({ t, icon, label, onClick, color }) {
    const bg = color || `linear-gradient(135deg, ${t.gold || '#F59E0B'}, #F97316)`;
    const shadowColor = color ? `${color}44` : '#F59E0B44';
    
    return (
        <button
            className="mobile-fab hvrC"
            onClick={onClick}
            style={{
                position: 'fixed',
                bottom: 84, // Above the tab bar (which is 64px + 8px padding)
                right: 20,
                width: 56,
                height: 56,
                borderRadius: 28,
                background: bg,
                color: '#000',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: `0 8px 24px ${shadowColor}`,
                zIndex: 800,
                transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s'
            }}
            aria-label={label}
        >
            <I d={icon} sz={24} c="#000" sw={2.5} />
        </button>
    );
}
