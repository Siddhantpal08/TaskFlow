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
    const [isEditing, setIsEditing] = useState(false);
    const fileRef = useRef();
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);

    // Image Zoom Modal
    const [imgModal, setImgModal] = useState(false);

    // Password Change Flow
    const [passModal, setPassModal] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

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
            payload.bio = bio;
            payload.avatar_url = avatarPreview;
            const res = await api.patch('/users/me', payload);
            setUser(res.data);
            setIsEditing(false);
            toastSuccess('Profile updated!');
        } catch (err) {
            toastError(err.message || 'Failed to save profile.');
        } finally {
            setLoading(false);
        }
    };

    const startPasswordChange = async () => {
        setPassLoading(true);
        try {
            const { authApi } = await import('../api/auth.js');
            await authApi.forgotPassword(user.email);
            toastSuccess('OTP sent to your email.');
            setPassModal(true);
        } catch (err) {
            toastError(err.message || 'Failed to send OTP.');
        } finally {
            setPassLoading(false);
        }
    };

    const submitPasswordChange = async (e) => {
        e.preventDefault();
        setPassLoading(true);
        try {
            const { authApi } = await import('../api/auth.js');
            await authApi.resetPassword(user.email, otp, newPassword);
            toastSuccess('Password changed successfully! You may need to log in again.');
            setPassModal(false);
            setOtp('');
            setNewPassword('');
        } catch (err) {
            toastError(err.message || 'Failed to change password.');
        } finally {
            setPassLoading(false);
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: t.t1, marginBottom: 4 }}>Profile</div>
                        <div style={{ fontSize: 13, color: t.t2 }}>Manage your personal information and preferences.</div>
                    </div>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} style={{ background: t.accentDim, color: t.accent, border: `1px solid ${t.accent}44`, borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontFamily: t.disp, fontWeight: 600 }}>
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* Avatar section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: 20, background: t.card, border: `1px solid ${t.border}`, borderRadius: 14 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div onClick={() => avatarPreview && setImgModal(true)} style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: avatarPreview ? 'transparent' : `linear-gradient(135deg, ${t.accent}40, ${t.purple || '#B083FF'}40)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, fontWeight: 700, color: t.accent,
                            border: `2.5px solid ${t.accent}44`, overflow: 'hidden',
                            cursor: avatarPreview ? 'zoom-in' : 'default'
                        }}>
                            {avatarPreview
                                ? <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : (initials || user?.avatar_initials || '?')}
                        </div>
                        {isEditing && (
                            <button onClick={() => fileRef.current?.click()}
                                style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    width: 22, height: 22, borderRadius: '50%', background: t.accent,
                                    border: `2px solid ${t.bg}`, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', cursor: 'pointer', fontSize: 12,
                                }}>✏️</button>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: t.t1 }}>{user?.name}</div>
                        <div style={{ fontSize: 12, color: t.t3, fontFamily: t.mono, marginTop: 2 }}>{user?.email}</div>
                        {isEditing && (
                            <button onClick={() => fileRef.current?.click()}
                                style={{ marginTop: 8, background: t.accentDim, color: t.accent, border: `1px solid ${t.accent}44`, borderRadius: 7, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: t.disp, fontWeight: 600 }}>
                                Change Photo
                            </button>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: t.t3, marginBottom: 6, letterSpacing: '0.5px' }}>FULL NAME</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                            onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                            style={fieldStyle('name')} required disabled={!isEditing} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: t.t3, marginBottom: 6, letterSpacing: '0.5px' }}>INITIALS (MAX 2)</label>
                        <input value={initials} onChange={e => setInitials(e.target.value.toUpperCase().slice(0, 2))}
                            placeholder="e.g. SP"
                            onFocus={() => setFocused('initials')} onBlur={() => setFocused('')}
                            style={fieldStyle('initials')} disabled={!isEditing} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: t.t3, marginBottom: 6, letterSpacing: '0.5px' }}>BIO / DESCRIPTION</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)}
                            placeholder={isEditing ? "A short description about yourself…" : ""}
                            onFocus={() => setFocused('bio')} onBlur={() => setFocused('')}
                            rows={3}
                            style={{ ...fieldStyle('bio'), resize: isEditing ? 'vertical' : 'none', lineHeight: 1.6 }} disabled={!isEditing} />
                    </div>

                    {isEditing && (
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                            <button type="button" onClick={() => setIsEditing(false)}
                                style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 20px', color: t.t2, cursor: 'pointer', fontFamily: t.disp, fontSize: 14 }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={loading}
                                style={{ background: `linear-gradient(135deg, ${t.accent}, #009688)`, border: 'none', borderRadius: 10, padding: '10px 24px', color: '#060B12', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 14, opacity: loading ? 0.7 : 1, transition: 'opacity .2s' }}>
                                {loading ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>

                {/* Security Section */}
                <div style={{ marginTop: 40, paddingTop: 32, borderTop: `1px solid ${t.border}` }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: t.t1, marginBottom: 8 }}>Security</div>
                    <div style={{ fontSize: 13, color: t.t2, marginBottom: 16 }}>Update your password using a secure OTP sent to your email.</div>
                    <button type="button" onClick={startPasswordChange} disabled={passLoading}
                        style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 18px', color: t.t1, cursor: 'pointer', fontFamily: t.disp, fontSize: 13, fontWeight: 600 }}>
                        {passLoading ? 'Requesting...' : 'Change Password'}
                    </button>
                </div>

            </div>

            {/* Avatar Zoom Modal */}
            {imgModal && avatarPreview && (
                <div onClick={() => setImgModal(false)} className="popIn" style={{ position: 'fixed', inset: 0, background: '#000000dd', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
                    <img src={avatarPreview} alt="Avatar Large" onClick={e => e.stopPropagation()} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
                </div>
            )}

            {/* Password Change OTP Modal */}
            {
                passModal && (
                    <div onClick={e => e.target === e.currentTarget && setPassModal(false)} style={{
                        position: 'fixed', inset: 0, background: '#00000088', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div className="popIn" style={{
                            background: t.card, border: `1px solid ${t.border}`, borderRadius: 16,
                            padding: '24px', width: 340, boxShadow: t.shadow,
                        }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: t.t1, marginBottom: 18 }}>Change Password</div>
                            <form onSubmit={submitPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, color: t.t3, marginBottom: 4, fontFamily: t.mono }}>OTP (SENT TO EMAIL)</label>
                                    <input required value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" style={inp} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, color: t.t3, marginBottom: 4, fontFamily: t.mono }}>NEW PASSWORD</label>
                                    <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" style={inp} minLength={6} />
                                </div>
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                                    <button type="button" onClick={() => setPassModal(false)} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 16px', color: t.t2, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>Cancel</button>
                                    <button type="submit" disabled={passLoading} style={{ background: t.accent, border: 'none', borderRadius: 8, padding: '8px 18px', color: '#060B12', fontWeight: 700, cursor: 'pointer', fontFamily: t.disp, fontSize: 13 }}>
                                        {passLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
