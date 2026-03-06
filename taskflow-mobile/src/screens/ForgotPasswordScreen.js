import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DARK as t } from '../data/themes';

const OTP_LEN = 6;

export default function ForgotPasswordScreen({ navigation }) {
    const { requestReset, verifyReset } = useAuth();

    const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(Array(OTP_LEN).fill(''));
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const otpRefs = useRef([]);

    // ─── Step 1: Request OTP ────────────────────────────────────────────────────
    const handleRequestOtp = async () => {
        setErr('');
        if (!email.trim()) { setErr('Please enter your email.'); return; }
        setLoading(true);
        try {
            const res = await requestReset(email.trim().toLowerCase());
            if (res.success) {
                setStep(2);
            } else {
                setErr(res.message || 'Failed to send OTP. Check the email and try again.');
            }
        } catch (e) {
            setErr('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ─── OTP digit input ────────────────────────────────────────────────────────
    const handleOtpChange = (val, idx) => {
        const clean = val.replace(/\D/g, '').slice(-1);
        const next = [...otp];
        next[idx] = clean;
        setOtp(next);
        if (clean && idx < OTP_LEN - 1) {
            otpRefs.current[idx + 1]?.focus();
        }
    };

    const handleOtpKeyPress = ({ nativeEvent }, idx) => {
        if (nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
            otpRefs.current[idx - 1]?.focus();
        }
    };

    // ─── Step 3: Reset Password ─────────────────────────────────────────────────
    const handleReset = async () => {
        setErr('');
        const code = otp.join('');
        if (code.length < OTP_LEN) { setErr('Please complete the 6-digit OTP.'); return; }
        if (!newPass) { setErr('Please enter a new password.'); return; }
        if (newPass !== confirmPass) { setErr('Passwords do not match.'); return; }
        if (newPass.length < 8) { setErr('Password must be at least 8 characters.'); return; }
        setLoading(true);
        try {
            const res = await verifyReset(email.trim().toLowerCase(), code, newPass);
            if (res.success) {
                Alert.alert('Success', 'Your password has been reset. Please log in.', [
                    { text: 'Login', onPress: () => navigation.navigate('Login') }
                ]);
            } else {
                setErr(res.message || 'Invalid or expired OTP. Please try again.');
            }
        } catch (e) {
            setErr('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const stepLabels = ['Enter Email', 'Verify OTP', 'New Password'];

    return (
        <View style={s.root}>
            {/* Logo */}
            <View style={s.logoWrap}>
                <View style={s.logo}><Text style={s.logoTxt}>T</Text></View>
                <Text style={s.brand}>TaskFlow</Text>
            </View>

            <Text style={s.title}>Forgot Password</Text>
            <Text style={s.sub}>{stepLabels[step - 1]}</Text>

            {/* Step indicators */}
            <View style={s.steps}>
                {stepLabels.map((_, i) => (
                    <View key={i} style={[s.stepDot, i + 1 <= step && { backgroundColor: t.accent }]} />
                ))}
            </View>

            <View style={s.card}>
                {/* ── Step 1: Email ── */}
                {step === 1 && (
                    <>
                        <Text style={s.label}>Email Address</Text>
                        <TextInput
                            style={s.input}
                            placeholder="your@email.com"
                            placeholderTextColor={t.t3}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            onSubmitEditing={handleRequestOtp}
                            returnKeyType="send"
                        />
                        {!!err && <Text style={s.err}>{err}</Text>}
                        <TouchableOpacity style={s.btn} onPress={handleRequestOtp} disabled={loading}>
                            {loading ? <ActivityIndicator color="#000" /> : <Text style={s.btnTxt}>Send OTP</Text>}
                        </TouchableOpacity>
                    </>
                )}

                {/* ── Step 2: OTP ── */}
                {step === 2 && (
                    <>
                        <Text style={s.label}>Enter the 6-digit code sent to</Text>
                        <Text style={[s.label, { color: t.accent, marginBottom: 20 }]}>{email}</Text>
                        <View style={s.otpRow}>
                            {otp.map((digit, i) => (
                                <TextInput
                                    key={i}
                                    ref={r => otpRefs.current[i] = r}
                                    style={[s.otpBox, digit && { borderColor: t.accent }]}
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    value={digit}
                                    onChangeText={v => handleOtpChange(v, i)}
                                    onKeyPress={e => handleOtpKeyPress(e, i)}
                                    selectionColor={t.accent}
                                />
                            ))}
                        </View>
                        {!!err && <Text style={s.err}>{err}</Text>}
                        <TouchableOpacity style={s.btn} onPress={() => { setErr(''); setStep(3); }} disabled={otp.join('').length < OTP_LEN}>
                            <Text style={[s.btnTxt, otp.join('').length < OTP_LEN && { opacity: 0.5 }]}>Continue</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.link} onPress={() => { setOtp(Array(OTP_LEN).fill('')); setStep(1); }}>
                            <Text style={s.linkTxt}>← Change email</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* ── Step 3: New Password ── */}
                {step === 3 && (
                    <>
                        <Text style={s.label}>New Password</Text>
                        <TextInput
                            style={s.input}
                            placeholder="Min. 8 characters"
                            placeholderTextColor={t.t3}
                            secureTextEntry
                            value={newPass}
                            onChangeText={setNewPass}
                        />
                        <Text style={[s.label, { marginTop: 14 }]}>Confirm Password</Text>
                        <TextInput
                            style={s.input}
                            placeholder="Repeat password"
                            placeholderTextColor={t.t3}
                            secureTextEntry
                            value={confirmPass}
                            onChangeText={setConfirmPass}
                            onSubmitEditing={handleReset}
                            returnKeyType="done"
                        />
                        {!!err && <Text style={s.err}>{err}</Text>}
                        <TouchableOpacity style={s.btn} onPress={handleReset} disabled={loading}>
                            {loading ? <ActivityIndicator color="#000" /> : <Text style={s.btnTxt}>Reset Password</Text>}
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <TouchableOpacity style={s.link} onPress={() => navigation.navigate('Login')}>
                <Text style={s.linkTxt}>← Back to Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
    logoWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    logo: {
        width: 38, height: 38, borderRadius: 10,
        backgroundColor: t.accent, justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    logoTxt: { color: '#000', fontWeight: '900', fontSize: 20 },
    brand: { fontSize: 22, fontWeight: '800', color: t.t1, letterSpacing: -0.5 },
    title: { fontSize: 26, fontWeight: '900', color: t.t1, marginBottom: 4, letterSpacing: -0.5 },
    sub: { fontSize: 14, color: t.t3, marginBottom: 16 },

    steps: { flexDirection: 'row', gap: 8, marginBottom: 28 },
    stepDot: { width: 24, height: 5, borderRadius: 3, backgroundColor: t.border },

    card: {
        width: '100%', backgroundColor: t.card,
        borderWidth: 1, borderColor: t.border,
        borderRadius: 20, padding: 24,
    },
    label: { fontSize: 12, fontWeight: '700', color: t.t2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: {
        backgroundColor: t.inset || t.surf, borderWidth: 1, borderColor: t.border,
        borderRadius: 10, padding: 14, color: t.t1, fontSize: 14, marginBottom: 6,
    },
    err: { color: t.red, fontSize: 12, marginVertical: 8 },
    btn: {
        backgroundColor: t.accent, borderRadius: 12, padding: 15,
        alignItems: 'center', marginTop: 16,
    },
    btnTxt: { color: '#000', fontWeight: '800', fontSize: 15 },
    link: { marginTop: 20 },
    linkTxt: { color: t.accent, fontSize: 13, fontWeight: '600', textAlign: 'center' },

    // OTP
    otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    otpBox: {
        width: 44, height: 54, borderRadius: 10,
        backgroundColor: t.inset || t.surf, borderWidth: 1.5, borderColor: t.border,
        textAlign: 'center', color: t.t1, fontSize: 22, fontWeight: '800',
    },
});
