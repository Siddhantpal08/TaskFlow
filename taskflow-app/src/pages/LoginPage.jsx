import { useState } from 'react';
import { DARK } from '../data/themes.js';
import { useAuth } from '../context/AuthContext.jsx';
import { GoogleLogin } from '@react-oauth/google';
import { TFLogo } from '../App.jsx';

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
    background: `linear-gradient(135deg, ${t.accent}, #0072FF)`,
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
    const { googleLogin, verifyEmail, resendOtp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');

    // OTP Verification State
    const [needsVerification, setNeedsVerification] = useState(false);
    const [otp, setOtp] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (needsVerification) {
                if (otp.length !== 6) { setError('OTP must be exactly 6 digits.'); setLoading(false); return; }
                await verifyEmail(email, otp);
            } else {
                await onLogin(email, password);
            }
        } catch (err) {
            const msg = err.message || '';
            if (!needsVerification && msg.toLowerCase().includes('verify your email')) {
                setNeedsVerification(true);
                setError('Please check your email for the OTP code.');
                // Attempt to send a fresh OTP automatically
                try { await resendOtp(email); } catch (e) { /* ignore silently */ }
            } else {
                setError(msg || 'Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await resendOtp(email);
            setError('A new OTP has been sent to your email.');
        } catch (e) {
            setError(e.message || 'Failed to resend OTP.');
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
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <TFLogo size={48} showText={true} textColor={t.t1} />
                    </div>
                    <div style={{ fontSize: 13, color: t.t2, marginTop: 6 }}>Sign in to your workspace</div>
                </div>

                {needsVerification ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <h4 style={{ color: t.t1, fontSize: 16, marginBottom: 8, fontFamily: t.disp }}>Check your email</h4>
                            <p style={{ color: t.t2, fontSize: 13, lineHeight: 1.5 }}>
                                Enter the 6-digit OTP sent to <strong style={{ color: t.t1 }}>{email}</strong>
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label htmlFor="login-otp" style={{ fontSize: 12, fontWeight: 600, color: t.t2, display: 'block', marginBottom: 6 }}>
                                    6-DIGIT OTP
                                </label>
                                <input
                                    id="login-otp" name="otp" type="text" required value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    onFocus={() => setFocused('otp')} onBlur={() => setFocused('')}
                                    placeholder="e.g. 123456"
                                    style={{
                                        ...inputStyle,
                                        borderColor: focused === 'otp' ? t.accent : t.border,
                                        boxShadow: focused === 'otp' ? `0 0 0 3px ${t.accent}20` : 'none',
                                    }}
                                />
                            </div>

                            {error && (
                                <div style={{
                                    background: `${t.red}14`, border: `1px solid ${t.red}33`,
                                    borderRadius: 8, padding: '9px 13px', fontSize: 13, color: t.red,
                                }}>{error}</div>
                            )}

                            <button type="submit" disabled={loading || otp.length !== 6} style={{
                                ...btnStyle, opacity: loading || otp.length !== 6 ? 0.65 : 1,
                            }}>
                                {loading ? 'Verifying…' : 'Verify & Sign In →'}
                            </button>
                        </form>
                        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: t.t2 }}>
                            Didn't receive it?{' '}
                            <button type="button" onClick={handleResend} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: t.accent, fontWeight: 600, fontFamily: t.disp, fontSize: 13,
                            }}>Resend code</button>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 10 }}>
                            <button type="button" onClick={() => { setNeedsVerification(false); setError(''); setOtp(''); }} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: t.t3, fontSize: 12, fontFamily: t.disp, textDecoration: 'underline'
                            }}>Back to Login</button>
                        </div>
                    </>
                ) : (
                    <>
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

                        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ flex: 1, height: 1, background: t.border }} />
                            <span style={{ fontSize: 11, color: t.t3, fontFamily: t.mono }}>OR</span>
                            <div style={{ flex: 1, height: 1, background: t.border }} />
                        </div>

                        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={async (cred) => {
                                    setLoading(true);
                                    try {
                                        await googleLogin(cred.credential);
                                    } catch (e) {
                                        setError(e.message || 'Google verification failed.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                onError={() => setError('Google OAuth pop-up closed or failed')}
                                theme="filled_black"
                                shape="pill"
                                size="large"
                            />
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: t.t2 }}>
                            Don't have an account?{' '}
                            <button type="button" onClick={onGoRegister} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: t.accent, fontWeight: 600, fontFamily: t.disp, fontSize: 13,
                            }}>Create one</button>
                        </div>
                    </>
                )}

                <div style={{ textAlign: 'center', marginTop: 16, fontFamily: t.mono, fontSize: 9, color: t.t3 }}>
                    TaskFlow v1.0 · Smart Task Management
                </div>
            </div>
        </div>
    );
}
