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
    transition: 'opacity .2s, transform .2s',
    letterSpacing: '0.2px',
};

export default function LoginPage({ onLogin, onGoRegister, onGoForgot }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onLogin(email, password);
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: t.bg, fontFamily: t.disp,
        }}>
            {/* Background glow */}
            <div style={{
                position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
                width: 600, height: 300,
                background: `radial-gradient(ellipse at center, ${t.accent}0A 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            <div className="fadeUp" style={{
                width: '100%', maxWidth: 420, margin: '0 16px',
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
                    <div style={{ fontSize: 13, color: t.t2 }}>Sign in to your workspace</div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label htmlFor="login-email" style={{ fontSize: 12, fontWeight: 600, color: t.t2, display: 'block', marginBottom: 6 }}>
                            EMAIL
                        </label>
                        <input
                            id="login-email" name="email" autoComplete="email"
                            type="email" required value={email}
                            onChange={e => setEmail(e.target.value)}
                            onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                            placeholder="you@example.com"
                            style={{
                                ...inputStyle,
                                borderColor: focused === 'email' ? t.accent : t.border,
                                boxShadow: focused === 'email' ? `0 0 0 3px ${t.accent}20` : 'none',
                            }}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <label htmlFor="login-pass" style={{ fontSize: 12, fontWeight: 600, color: t.t2 }}>PASSWORD</label>
                            <button type="button" onClick={onGoForgot} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 11, color: t.accent, fontFamily: t.disp,
                            }}>Forgot password?</button>
                        </div>
                        <input
                            id="login-pass" name="password" autoComplete="current-password"
                            type="password" required value={password}
                            onChange={e => setPassword(e.target.value)}
                            onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                            placeholder="••••••••"
                            style={{
                                ...inputStyle,
                                borderColor: focused === 'pass' ? t.accent : t.border,
                                boxShadow: focused === 'pass' ? `0 0 0 3px ${t.accent}20` : 'none',
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: `${t.red}14`, border: `1px solid ${t.red}33`,
                            borderRadius: 8, padding: '9px 13px', fontSize: 13, color: t.red,
                        }}>{error}</div>
                    )}

                    <button type="submit" disabled={loading} style={{
                        ...btnStyle, opacity: loading ? 0.65 : 1,
                    }}>
                        {loading ? 'Signing in…' : 'Sign In →'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: t.t2 }}>
                    Don't have an account?{' '}
                    <button type="button" onClick={onGoRegister} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: t.accent, fontWeight: 600, fontFamily: t.disp, fontSize: 13,
                    }}>Create one</button>
                </div>

                <div style={{ textAlign: 'center', marginTop: 16, fontFamily: t.mono, fontSize: 9, color: t.t3 }}>
                    BCA VI · 2024–25 · TaskFlow v1.0
                </div>
            </div>
        </div>
    );
}
