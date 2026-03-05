import { useState, useRef } from 'react';
import { DARK } from '../data/themes.js';

const t = DARK;

const inputStyle = {
    background: '#0C1420',
    border: `1px solid ${t.border}`,
    borderRadius: 10,
    padding: '11px 14px',
    color: t.t1,
    fontSize: 14,
    fontFamily: t.disp,
    outline: 'none',
    width: '100%',
    transition: 'border-color .2s, box-shadow .2s',
};

const btnStyle = {
    width: '100%', padding: '12px',
    background: t.accent, color: '#060B12',
    border: 'none', borderRadius: 10,
    fontWeight: 700, fontSize: 15, fontFamily: t.disp,
    cursor: 'pointer', marginTop: 6, transition: 'opacity .2s',
};

// 6-box OTP input
function OtpInput({ value, onChange }) {
    const refs = Array.from({ length: 6 }, () => useRef(null)); // eslint-disable-line react-hooks/rules-of-hooks
    const handleKey = (i, e) => {
        if (e.key === 'Backspace') {
            const next = value.split('');
            next[i] = '';
            onChange(next.join(''));
            if (i > 0) refs[i - 1].current?.focus();
        }
    };
    const handleChange = (i, e) => {
        const ch = e.target.value.replace(/\D/, '').slice(-1);
        if (!ch) return;
        const next = value.padEnd(6, ' ').split('');
        next[i] = ch;
        onChange(next.join('').trim());
        if (i < 5) refs[i + 1].current?.focus();
    };
    return (
        <div style={{ display: 'flex', gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <input
                    key={i} ref={refs[i]}
                    type="text" inputMode="numeric" maxLength={1}
                    value={value[i] || ''}
                    onChange={e => handleChange(i, e)}
                    onKeyDown={e => handleKey(i, e)}
                    style={{
                        width: 44, height: 50, textAlign: 'center',
                        fontSize: 22, fontWeight: 700, fontFamily: t.mono,
                        background: '#0C1420', color: t.accent,
                        border: `1px solid ${value[i] ? t.accent : t.border}`,
                        borderRadius: 10, outline: 'none',
                        boxShadow: value[i] ? `0 0 0 2px ${t.accent}30` : 'none',
                        transition: 'border-color .15s, box-shadow .15s',
                    }}
                />
            ))}
        </div>
    );
}

export default function ForgotPasswordPage({ onRequest, onVerify, onGoLogin }) {
    const [step, setStep] = useState(1); // 1=email, 2=otp+pass, 3=done
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');

    const handleStep1 = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await onRequest(email);
            setStep(2);
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Try again.');
        } finally { setLoading(false); }
    };

    const handleStep2 = async (e) => {
        e.preventDefault();
        setError('');
        if (otp.length < 6) { setError('Please enter all 6 digits.'); return; }
        if (newPassword !== confirmPass) { setError('Passwords do not match.'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            await onVerify(email, otp, newPassword);
            setStep(3);
        } catch (err) {
            setError(err.message || 'Invalid OTP or expired. Try again.');
        } finally { setLoading(false); }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: t.bg, fontFamily: t.disp,
        }}>
            <div style={{
                position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
                width: 600, height: 300,
                background: `radial-gradient(ellipse at center, ${t.amber}08 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            <div className="fadeUp" style={{
                width: '100%', maxWidth: 420, margin: '0 16px',
                background: `linear-gradient(145deg, #0C1420ee, #0F1C2Eee)`,
                border: `1px solid ${t.border}`, borderRadius: 20,
                padding: '36px 32px', boxShadow: '0 24px 64px #00000088',
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

                    {/* Step indicators */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                        {[1, 2, 3].map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                    width: s < step ? 8 : s === step ? 24 : 8, height: 8, borderRadius: 4,
                                    background: s <= step ? t.accent : t.border,
                                    transition: 'all .3s',
                                }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 1: Email */}
                {step === 1 && (
                    <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: t.t1, marginBottom: 4 }}>Reset Password</div>
                            <div style={{ fontSize: 13, color: t.t2 }}>Enter your email and we'll send a 6-digit OTP.</div>
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: t.t2, display: 'block', marginBottom: 6 }}>EMAIL</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                                placeholder="you@example.com"
                                style={{
                                    ...inputStyle,
                                    borderColor: focused === 'email' ? t.accent : t.border,
                                    boxShadow: focused === 'email' ? `0 0 0 3px ${t.accent}20` : 'none',
                                }} />
                        </div>
                        {error && <div style={{ background: `${t.red}14`, border: `1px solid ${t.red}33`, borderRadius: 8, padding: '9px 13px', fontSize: 13, color: t.red }}>{error}</div>}
                        <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.65 : 1 }}>
                            {loading ? 'Sending OTP…' : 'Send OTP →'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP + New Password */}
                {step === 2 && (
                    <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: t.t1, marginBottom: 4 }}>Enter OTP</div>
                            <div style={{ fontSize: 13, color: t.t2 }}>Check your inbox at <span style={{ color: t.accent }}>{email}</span></div>
                        </div>
                        <OtpInput value={otp} onChange={setOtp} />
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: t.t2, display: 'block', marginBottom: 6 }}>NEW PASSWORD</label>
                            <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                onFocus={() => setFocused('np')} onBlur={() => setFocused('')}
                                placeholder="Min. 6 characters"
                                style={{ ...inputStyle, borderColor: focused === 'np' ? t.accent : t.border, boxShadow: focused === 'np' ? `0 0 0 3px ${t.accent}20` : 'none' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: t.t2, display: 'block', marginBottom: 6 }}>CONFIRM PASSWORD</label>
                            <input type="password" required value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                                onFocus={() => setFocused('cp')} onBlur={() => setFocused('')}
                                placeholder="Repeat new password"
                                style={{ ...inputStyle, borderColor: focused === 'cp' ? t.accent : t.border, boxShadow: focused === 'cp' ? `0 0 0 3px ${t.accent}20` : 'none' }} />
                        </div>
                        {error && <div style={{ background: `${t.red}14`, border: `1px solid ${t.red}33`, borderRadius: 8, padding: '9px 13px', fontSize: 13, color: t.red }}>{error}</div>}
                        <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.65 : 1 }}>
                            {loading ? 'Resetting…' : 'Reset Password →'}
                        </button>
                        <button type="button" onClick={() => { setStep(1); setError(''); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.t2, fontSize: 13, fontFamily: t.disp }}>
                            ← Back
                        </button>
                    </form>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: `${t.green}18`, border: `2px solid ${t.green}44`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 26,
                        }}>✓</div>
                        <div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: t.t1, marginBottom: 4 }}>Password Reset!</div>
                            <div style={{ fontSize: 13, color: t.t2 }}>Your password has been updated. You can now sign in.</div>
                        </div>
                        <button onClick={onGoLogin} style={{ ...btnStyle, marginTop: 0 }}>Back to Sign In →</button>
                    </div>
                )}

                {step !== 3 && (
                    <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: t.t2 }}>
                        Remember your password?{' '}
                        <button type="button" onClick={onGoLogin} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: t.accent, fontWeight: 600, fontFamily: t.disp, fontSize: 13,
                        }}>Sign in</button>
                    </div>
                )}
            </div>
        </div>
    );
}
