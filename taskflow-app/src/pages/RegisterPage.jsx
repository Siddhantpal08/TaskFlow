import { useState } from 'react';
import { DARK } from '../data/themes.js';

const t = DARK;

const inputStyle = {
    width: '100%',
    background: '#0C1420',
    border: `1px solid ${t.border}`,
    borderRadius: 10,
    padding: '11px 14px',
    color: t.t1,
    fontSize: 14,
    fontFamily: t.disp,
    outline: 'none',
    transition: 'border-color .2s, box-shadow .2s',
};

const btnStyle = {
    width: '100%',
    padding: '12px',
    background: t.accent,
    color: '#060B12',
    border: 'none',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
    fontFamily: t.disp,
    cursor: 'pointer',
    marginTop: 6,
    transition: 'opacity .2s',
    letterSpacing: '0.2px',
};

function Field({ label, type, value, onChange, placeholder, focusKey, focused, setFocused, children }) {
    return (
        <div>
            <label htmlFor={focusKey} style={{ fontSize: 12, fontWeight: 600, color: t.t2, display: 'block', marginBottom: 6 }}>
                {label}
            </label>
            <input
                id={focusKey} name={focusKey} autoComplete={type === 'password' ? (focusKey === 'confirm' || focusKey === 'pass' ? 'new-password' : 'current-password') : (type === 'email' ? 'email' : 'name')}
                type={type} required value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(focusKey)} onBlur={() => setFocused('')}
                placeholder={placeholder}
                style={{
                    ...inputStyle,
                    borderColor: focused === focusKey ? t.accent : t.border,
                    boxShadow: focused === focusKey ? `0 0 0 3px ${t.accent}20` : 'none',
                }}
            />
            {children}
        </div>
    );
}

export default function RegisterPage({ onRegister, onGoLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            await onRegister(name, email, password);
        } catch (err) {
            setError(err.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: t.bg, fontFamily: t.disp,
        }}>
            <div style={{
                position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
                width: 600, height: 300,
                background: `radial-gradient(ellipse at center, ${t.purple}0A 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            <div className="fadeUp" style={{
                width: '100%', maxWidth: 440, margin: '0 16px',
                background: `linear-gradient(145deg, #0C1420ee, #0F1C2Eee)`,
                border: `1px solid ${t.border}`,
                borderRadius: 20,
                padding: '36px 32px',
                boxShadow: '0 24px 64px #00000088',
                backdropFilter: 'blur(16px)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: `linear-gradient(135deg, ${t.accent}, ${t.accent}88)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, fontWeight: 900, color: '#060B12',
                        }}>T</div>
                        <span style={{ fontSize: 22, fontWeight: 800, color: t.t1, letterSpacing: '-0.5px' }}>
                            Task<span style={{ color: t.accent }}>Flow</span>
                        </span>
                    </div>
                    <div style={{ fontSize: 13, color: t.t2 }}>Create your account</div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field label="FULL NAME" type="text" value={name} onChange={setName}
                        placeholder="Siddhant Pal" focusKey="name" focused={focused} setFocused={setFocused} />

                    <Field label="EMAIL" type="email" value={email} onChange={setEmail}
                        placeholder="you@example.com" focusKey="email" focused={focused} setFocused={setFocused} />

                    <Field label="PASSWORD" type="password" value={password} onChange={setPassword}
                        placeholder="Min. 6 characters" focusKey="pass" focused={focused} setFocused={setFocused}>
                        {password.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{
                                        flex: 1, height: 3, borderRadius: 3,
                                        background: password.length >= i * 2
                                            ? (password.length >= 10 ? t.green : password.length >= 6 ? t.amber : t.red)
                                            : t.border,
                                        transition: 'background .3s',
                                    }} />
                                ))}
                            </div>
                        )}
                    </Field>

                    <Field label="CONFIRM PASSWORD" type="password" value={confirm} onChange={setConfirm}
                        placeholder="Repeat password" focusKey="confirm" focused={focused} setFocused={setFocused} />

                    {error && (
                        <div style={{
                            background: `${t.red}14`, border: `1px solid ${t.red}33`,
                            borderRadius: 8, padding: '9px 13px', fontSize: 13, color: t.red,
                        }}>{error}</div>
                    )}

                    <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.65 : 1 }}>
                        {loading ? 'Creating account…' : 'Create Account →'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: t.t2 }}>
                    Already have an account?{' '}
                    <button type="button" onClick={onGoLogin} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: t.accent, fontWeight: 600, fontFamily: t.disp, fontSize: 13,
                    }}>Sign in</button>
                </div>
            </div>
        </div>
    );
}
