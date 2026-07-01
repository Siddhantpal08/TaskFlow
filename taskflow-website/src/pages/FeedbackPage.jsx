import { useState } from 'react';
import { feedbackApi } from '../api/feedback.js';
import { toastSuccess, toastError } from '../components/ui/Toast.jsx';

const RATINGS = [
    { val: 1, emoji: '😞', label: 'Poor' },
    { val: 2, emoji: '😕', label: 'Fair' },
    { val: 3, emoji: '😐', label: 'Okay' },
    { val: 4, emoji: '😊', label: 'Good' },
    { val: 5, emoji: '🤩', label: 'Love it!' },
];

export default function FeedbackPage({ t }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) return toastError('Please select a rating first.');
        if (!message.trim()) return toastError('Please describe your experience.');
        setLoading(true);
        try {
            await feedbackApi.submit(rating, message.trim());
            toastSuccess('Thank you! Your feedback means a lot 🙏');
            setDone(true);
        } catch (err) {
            toastError(err.message || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const active = hover || rating;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '40px 24px' }}>
            <div className="fadeUp" style={{
                width: '100%', maxWidth: 520,
                background: t.card, border: `1px solid ${t.border}`,
                borderRadius: 20, padding: '40px 36px',
                boxShadow: t.shadow,
            }}>
                {done ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: t.t1, margin: '0 0 10px', fontFamily: t.disp }}>
                            Feedback received!
                        </h2>
                        <p style={{ fontSize: 14, color: t.t2, lineHeight: 1.6, margin: 0 }}>
                            We read every single response. Your input directly shapes the future of TaskFlow.
                        </p>
                        <button onClick={() => { setDone(false); setRating(0); setMessage(''); }}
                            style={{ marginTop: 28, padding: '10px 28px', borderRadius: 10, border: 'none', background: t.accentDim, color: t.accent, fontWeight: 700, fontSize: 13, fontFamily: t.disp, cursor: 'pointer' }}>
                            Submit another →
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                            <h1 style={{ fontSize: 22, fontWeight: 800, color: t.t1, margin: '0 0 6px', fontFamily: t.disp }}>
                                Share your feedback
                            </h1>
                            <p style={{ fontSize: 13, color: t.t2, margin: 0, lineHeight: 1.5 }}>
                                How's TaskFlow working for you? Be brutally honest — we can take it.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                            {/* Star / Emoji Rating */}
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: t.t2, marginBottom: 12, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: t.mono }}>
                                    Overall rating
                                </div>
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                    {RATINGS.map(r => {
                                        const isActive = r.val <= active;
                                        return (
                                            <button key={r.val} type="button"
                                                onClick={() => setRating(r.val)}
                                                onMouseEnter={() => setHover(r.val)}
                                                onMouseLeave={() => setHover(0)}
                                                style={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                                    padding: '10px 12px', borderRadius: 12,
                                                    border: `2px solid ${isActive ? t.accent : t.border}`,
                                                    background: isActive ? t.accentDim : t.inset,
                                                    cursor: 'pointer', transition: 'all .15s', minWidth: 64,
                                                }}>
                                                <span style={{ fontSize: 26, lineHeight: 1, transition: 'transform .15s', transform: isActive ? 'scale(1.15)' : 'scale(1)' }}>{r.emoji}</span>
                                                <span style={{ fontSize: 10, color: isActive ? t.accent : t.t3, fontWeight: 600, fontFamily: t.mono }}>{r.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: t.t2, display: 'block', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: t.mono }}>
                                    What's on your mind?
                                </label>
                                <textarea
                                    value={message} onChange={e => setMessage(e.target.value)}
                                    placeholder="Tell us what you love, what's broken, what's missing, or how we can make TaskFlow better…"
                                    rows={5}
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        background: t.inset, border: `1px solid ${t.border}`,
                                        borderRadius: 10, padding: '11px 14px', color: t.t1,
                                        fontSize: 13.5, fontFamily: t.disp, outline: 'none', resize: 'vertical',
                                        lineHeight: 1.6, transition: 'border-color .2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = t.accent}
                                    onBlur={e => e.target.style.borderColor = t.border}
                                />
                                <div style={{ textAlign: 'right', fontSize: 10, color: t.t3, fontFamily: t.mono, marginTop: 4 }}>
                                    {message.length}/2000
                                </div>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={loading || !rating || !message.trim()}
                                style={{
                                    width: '100%', padding: '13px',
                                    background: `linear-gradient(135deg, ${t.accent}, #0072FF)`,
                                    color: '#060B12', border: 'none', borderRadius: 10,
                                    fontWeight: 800, fontSize: 14, fontFamily: t.disp, cursor: 'pointer',
                                    opacity: loading || !rating || !message.trim() ? 0.5 : 1,
                                    transition: 'opacity .2s',
                                }}>
                                {loading ? 'Sending…' : 'Send Feedback →'}
                            </button>
                        </form>

                        {/* Contact link */}
                        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: t.t3 }}>
                            Or email us directly at{' '}
                            <a href="mailto:taskflowappbysidd@gmail.com"
                                style={{ color: t.accent, textDecoration: 'none', fontWeight: 600 }}>
                                taskflowappbysidd@gmail.com
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
