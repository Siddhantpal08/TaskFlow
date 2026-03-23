import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toastSuccess, toastError } from '../components/ui/Toast.jsx';

export default function ProfilePage({ t, onGoBack }) {
    const { user, setUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [initials, setInitials] = useState(user?.avatar_initials || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');
    const fileRef = useRef();
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);

    const inp = {
        width: '100%', background: t.inset || '#0C1420', border: `1px solid ${t.border}`,
        borderRadius: 10, padding: '11px 14px', color: t.t1, fontSize: 14,
        fontFamily: t.disp, outline: 'none', boxSizing: 'border-box',
        transition: 'border-color .2s, box-shadow .2s',
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toastError('Image must be under 2MB.'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) { toastError('Name cannot be empty.'); return; }
        setLoading(true);
        try {
            const { api } = await import('../api/client.js');
            const payload = { name, avatar_initials: initials.toUpperCase().slice(0, 2) };
            if (bio) payload.bio = bio;
            if (avatarPreview && avatarPreview !== user?.avatar_url) payload.avatar_url = avatarPreview;
            const res = await api.patch('/users/me', payload);
            setUser(res.data);
            toastSuccess('Profile updated!');
        } catch (err) {
            toastError(err.message || 'Failed to save profile.');
        } finally {
            setLoading(false);
        }
    };

    const fieldStyle = (key) => ({
        ...inp,
        borderColor: focused === key ? t.accent : t.border,
        boxShadow: focused === key ? `0 0 0 3px ${t.accent}20` : 'none',
    });

    return (
        <div style={{ minHeight: '100%', background: t.bg, padding: '32px 26px', fontFamily: t.disp }}>
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
                {/* Back button */}
                <button onClick={onGoBack}
                    style={{ background: 'none', border: 'none', color: t.t3, cursor: 'pointer', fontSize: 13, marginBottom: 24, fontFamily: t.disp, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
                    ← Back
                </button>

                <div style={{ fontSize: 22, fontWeight: 800, color: t.t1, marginBottom: 4 }}>Profile</div>
                <div style={{ fontSize: 13, color: t.t2, marginBottom: 32 }}>Manage your personal information and preferences.</div>

                {/* Avatar section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: 20, background: t.card, border: `1px solid ${t.border}`, borderRadius: 14 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: avatarPreview ? 'transparent' : `linear-gradient(135deg, ${t.accent}40, ${t.purple || '#B083FF'}40)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, fontWeight: 700, color: t.accent,
                            border: `2.5px solid ${t.accent}44`, overflow: 'hidden',
                        }}>
                            {avatarPreview
                                ? <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : (initials || user?.avatar_initials || '?')}
                        </div>
                        <button onClick={() => fileRef.current?.click()}
                            style={{
                                position: 'absolute', bottom: 0, right: 0,
                                width: 22, height: 22, borderRadius: '50%', background: t.accent,
                                border: `2px solid ${t.bg}`, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer', fontSize: 12,
                            }}>✏️</button>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: t.t1 }}>{user?.name}</div>
                        <div style={{ fontSize: 12, color: t.t3, fontFamily: t.mono, marginTop: 2 }}>{user?.email}</div>
                        <button onClick={() => fileRef.current?.click()}
                            style={{ marginTop: 8, background: t.accentDim, color: t.accent, border: `1px solid ${t.accent}44`, borderRadius: 7, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: t.disp, fontWeight: 600 }}>
                            Change Photo
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: t.t3, marginBottom: 6, letterSpacing: '0.5px' }}>FULL NAME</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                            onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                            style={fieldStyle('name')} required />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: t.t3, marginBottom: 6, letterSpacing: '0.5px' }}>INITIALS (MAX 2)</label>
                        <input value={initials} onChange={e => setInitials(e.target.value.toUpperCase().slice(0, 2))}
                            placeholder="e.g. SP"
                            onFocus={() => setFocused('initials')} onBlur={() => setFocused('')}
                            style={fieldStyle('initials')} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: t.t3, marginBottom: 6, letterSpacing: '0.5px' }}>BIO / DESCRIPTION</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)}
                            placeholder="A short description about yourself…"
                            onFocus={() => setFocused('bio')} onBlur={() => setFocused('')}
                            rows={3}
                            style={{ ...fieldStyle('bio'), resize: 'vertical', lineHeight: 1.6 }} />
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                        <button type="button" onClick={onGoBack}
                            style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 20px', color: t.t2, cursor: 'pointer', fontFamily: t.disp, fontSize: 14 }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            style={{ background: `linear-gradient(135deg, ${t.accent}, #009688)`, border: 'none', borderRadius: 10, padding: '10px 24px', color: '#060B12', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 14, opacity: loading ? 0.7 : 1, transition: 'opacity .2s' }}>
                            {loading ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
