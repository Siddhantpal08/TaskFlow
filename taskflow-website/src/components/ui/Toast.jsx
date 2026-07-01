import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastCtx = createContext(null);

let _add = null;

export function toast(msg, type = 'info') {
    if (_add) _add(msg, type);
}
export function toastError(msg) { toast(msg, 'error'); }
export function toastSuccess(msg) { toast(msg, 'success'); }

export function ToastProvider({ children, t }) {
    const [toasts, setToasts] = useState([]);

    const add = useCallback((msg, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
    }, []);

    useEffect(() => { _add = add; return () => { _add = null; }; }, [add]);

    const colors = {
        error: { bg: '#FF3D5A18', border: '#FF3D5A44', text: '#FF3D5A', icon: '✕' },
        success: { bg: '#00D67B18', border: '#00D67B44', text: '#00D67B', icon: '✓' },
        info: { bg: '#00E5CC12', border: '#00E5CC33', text: '#00E5CC', icon: 'ℹ' },
    };

    return (
        <ToastCtx.Provider value={add}>
            {children}
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
                {toasts.map(({ id, msg, type }) => {
                    const c = colors[type] || colors.info;
                    return (
                        <div key={id} className="popIn" style={{
                            background: t?.surf || '#0C1420',
                            border: `1px solid ${c.border}`,
                            borderRadius: 10,
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            maxWidth: 340,
                            boxShadow: '0 8px 32px #00000066',
                            pointerEvents: 'auto',
                        }}>
                            <span style={{ color: c.text, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{c.icon}</span>
                            <span style={{ color: t?.t1 || '#E2EFFF', fontSize: 12.5, lineHeight: 1.4, fontFamily: t?.disp || 'sans-serif' }}>{msg}</span>
                        </div>
                    );
                })}
            </div>
        </ToastCtx.Provider>
    );
}
