import { useState } from 'react';
import { DARK } from '../data/themes.js';
import zxcvbn from 'zxcvbn';
import { useAuth } from '../context/AuthContext.jsx';
import { GoogleLogin } from '@react-oauth/google';
import { toastSuccess, toastError } from '../components/ui/Toast.jsx';

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

export default function RegisterPage({ onGoLogin }) {
    const { register, verifyEmail, resendOtp } = useAuth();
    const [step, setStep] = useState('form'); // 'form' or 'otp'

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    // OTP state
    const [otp, setOtp] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) { setError('Passwords do not match.'); return; }
        // Stricter validation: length and character variety
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        if (password.length < 8 || !(hasUpper && hasLower && hasNumber && hasSpecial)) {
            setError('Password must be at least 8 characters and include upper, lower, number, and special character.');
            return;
        }
        setLoading(true);
        try {
            await register(name, email, password);
            toastSuccess('Account created! Please verify your email.');
            setStep('otp');
        } catch (err) {
            setError(err.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        if (otp.length !== 6) { setError('OTP must be exactly 6 digits.'); return; }
        setLoading(true);
        try {
            await verifyEmail(email, otp);
            toastSuccess('Email verified successfully! Logging in...');
        } catch (err) {
            setError(err.message || 'Verification failed. Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await resendOtp(email);
            toastSuccess('A new OTP has been sent to your email.');
        } catch (e) {
            toastError(e.message || 'Failed to resend OTP.');
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

                {step === 'form' ? (
                    <>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <Field label="FULL NAME" type="text" value={name} onChange={setName}
                                placeholder="Siddhant Pal" focusKey="name" focused={focused} setFocused={setFocused} />

                            <Field label="EMAIL" type="email" value={email} onChange={setEmail}
                                placeholder="you@example.com" focusKey="email" focused={focused} setFocused={setFocused} />

                            <Field label="PASSWORD" type="password" value={password} onChange={setPassword}
                                placeholder="Min. 6 characters" focusKey="pass" focused={focused} setFocused={setFocused}>
                                {password.length > 0 && (
                                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                                        {[1, 2, 3, 4].map(i => {
                                            const score = zxcvbn(password).score;
                                            const filled = i <= score + 1;
                                            let bg = t.border;
                                            if (filled) {
                                                if (score <= 1) bg = t.red;
                                                else if (score === 2) bg = t.amber;
                                                else bg = t.green;
                                            }
                                            return (
                                                <div key={i} style={{
                                                    flex: 1, height: 3, borderRadius: 3,
                                                    background: bg,
                                                    transition: 'background .3s',
                                                }} />
                                            );
                                        })}
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

                        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ flex: 1, height: 1, background: t.border }} />
                            <span style={{ fontSize: 11, color: t.t3, fontFamily: t.mono }}>OR</span>
                            <div style={{ flex: 1, height: 1, background: t.border }} />
                        </div>

                        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                text="signup_with"
                                onSuccess={async (cred) => {
                                    setLoading(true);
                                    try {
                                        await googleLogin(cred.credential);
                                        // Auto logs in via context if successful.
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
                            Already have an account?{' '}
                            <button type="button" onClick={onGoLogin} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: t.accent, fontWeight: 600, fontFamily: t.disp, fontSize: 13,
                            }}>Sign in</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <h4 style={{ color: t.t1, fontSize: 16, marginBottom: 8, fontFamily: t.disp }}>Check your email</h4>
                            <p style={{ color: t.t2, fontSize: 13, lineHeight: 1.5 }}>
                                We've sent a 6-digit one-time password to <strong style={{ color: t.t1 }}>{email}</strong>.
                                It will expire in 10 minutes.
                            </p>
                        </div>
                        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <Field label="6-DIGIT OTP" type="text" value={otp} onChange={(val) => setOtp(val.replace(/[^0-9]/g, ''))}
                                placeholder="e.g. 123456" focusKey="otp" focused={focused} setFocused={setFocused} />

                            {error && (
                                <div style={{
                                    background: `${t.red}14`, border: `1px solid ${t.red}33`,
                                    borderRadius: 8, padding: '9px 13px', fontSize: 13, color: t.red,
                                }}>{error}</div>
                            )}

                            <button type="submit" disabled={loading || otp.length !== 6} style={{ ...btnStyle, opacity: loading || otp.length !== 6 ? 0.65 : 1 }}>
                                {loading ? 'Verifying…' : 'Verify Email'}
                            </button>
                        </form>
                        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: t.t2 }}>
                            Didn't receive it?{' '}
                            <button type="button" onClick={handleResend} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: t.accent, fontWeight: 600, fontFamily: t.disp, fontSize: 13,
                            }}>Resend code</button>
                        </div>
                    </>
                )}
            </div>
        </div >
    );
}
