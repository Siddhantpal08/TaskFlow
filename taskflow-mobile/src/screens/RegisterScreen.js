import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DARK as t } from '../data/themes';

export default function RegisterScreen({ navigation }) {
    const { register, verifyEmail, resendOtp } = useAuth();

    // Step: 'form' → fill details | 'otp' → verify email
    const [step, setStep] = useState('form');
    const [pendingEmail, setPendingEmail] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // OTP state — 6 individual digits
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    // ── Step 1: Submit registration form ─────────────────────────────────────────
    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('Please fill in all fields.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setError(''); setLoading(true);
        try {
            await register(name.trim(), email.trim().toLowerCase(), password);
            setPendingEmail(email.trim().toLowerCase());
            setStep('otp');
        } catch (e) {
            setError(e.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Verify OTP ────────────────────────────────────────────────────────
    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) { setError('Enter the full 6-digit code.'); return; }
        setError(''); setLoading(true);
        try {
            await verifyEmail(pendingEmail, code);
            // AuthContext sets user → NavigationContainer will auto-switch to app
        } catch (e) {
            setError(e.message || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    // OTP digit input handler
    const handleOtpChange = (val, idx) => {
        const digits = [...otp];
        digits[idx] = val.replace(/\D/g, '').slice(-1);
        setOtp(digits);
        if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpKey = (e, idx) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
            otpRefs.current[idx - 1]?.focus();
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        try {
            await resendOtp(pendingEmail);
            Alert.alert('Sent!', 'A new OTP has been sent to your email.');
            setResendCooldown(30);
            const interval = setInterval(() => {
                setResendCooldown(c => {
                    if (c <= 1) { clearInterval(interval); return 0; }
                    return c - 1;
                });
            }, 1000);
        } catch (e) {
            Alert.alert('Error', 'Could not resend OTP. Try again.');
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────────
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
                <View style={s.card}>
                    {step === 'form' ? (
                        <>
                            <Text style={s.title}>
                                Join Task<Text style={{ color: t.accent }}>Flow</Text>
                            </Text>
                            <Text style={s.subtitle}>Create your account</Text>

                            {error ? <Text style={s.err}>{error}</Text> : null}

                            <Text style={s.lbl}>FULL NAME</Text>
                            <TextInput
                                style={s.inp} value={name} onChangeText={setName}
                                placeholder="Your name" placeholderTextColor={t.t3}
                                autoCapitalize="words"
                            />

                            <Text style={s.lbl}>EMAIL</Text>
                            <TextInput
                                style={s.inp} value={email} onChangeText={setEmail}
                                placeholder="you@example.com" placeholderTextColor={t.t3}
                                autoCapitalize="none" keyboardType="email-address"
                            />

                            <Text style={s.lbl}>PASSWORD</Text>
                            <TextInput
                                style={s.inp} value={password} onChangeText={setPassword}
                                placeholder="Min 6 characters" placeholderTextColor={t.t3}
                                secureTextEntry
                            />

                            <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
                                {loading
                                    ? <ActivityIndicator color="#000" />
                                    : <Text style={s.btnTxt}>Create Account</Text>
                                }
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.goBack()} style={s.linkRow}>
                                <Text style={s.linkTxt}>
                                    Already have an account?{' '}
                                    <Text style={{ color: t.accent, fontWeight: 'bold' }}>Sign In</Text>
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={s.title}>Verify Email</Text>
                            <Text style={s.subtitle}>
                                Enter the 6-digit code sent to{'\n'}
                                <Text style={{ color: t.accent }}>{pendingEmail}</Text>
                            </Text>

                            {error ? <Text style={s.err}>{error}</Text> : null}

                            <View style={s.otpRow}>
                                {otp.map((digit, i) => (
                                    <TextInput
                                        key={i}
                                        ref={r => otpRefs.current[i] = r}
                                        style={s.otpBox}
                                        value={digit}
                                        onChangeText={v => handleOtpChange(v, i)}
                                        onKeyPress={e => handleOtpKey(e, i)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        textAlign="center"
                                        selectionColor={t.accent}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity style={s.btn} onPress={handleVerify} disabled={loading}>
                                {loading
                                    ? <ActivityIndicator color="#000" />
                                    : <Text style={s.btnTxt}>Verify & Continue</Text>
                                }
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleResend} style={s.linkRow} disabled={resendCooldown > 0}>
                                <Text style={[s.linkTxt, resendCooldown > 0 && { opacity: 0.4 }]}>
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive it? "}
                                    {resendCooldown === 0 && <Text style={{ color: t.accent, fontWeight: 'bold' }}>Resend OTP</Text>}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setStep('form')} style={[s.linkRow, { marginTop: 8 }]}>
                                <Text style={[s.linkTxt, { color: t.t3 }]}>← Back to registration</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: t.bg },
    card: { backgroundColor: t.surf, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: t.border },
    title: { fontSize: 26, fontWeight: '800', color: t.t1, letterSpacing: -0.5, textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 13, color: t.t3, textAlign: 'center', marginBottom: 22, lineHeight: 19 },
    err: { color: t.red, backgroundColor: t.red + '18', padding: 12, borderRadius: 10, marginBottom: 14, fontSize: 13, overflow: 'hidden', lineHeight: 18 },
    lbl: { fontSize: 11, fontWeight: '800', color: t.t3, marginBottom: 7, marginTop: 15, letterSpacing: 0.5 },
    inp: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 10, padding: 14, color: t.t1, fontSize: 15 },
    btn: { backgroundColor: t.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
    btnTxt: { color: '#000', fontWeight: '800', fontSize: 16 },
    linkRow: { alignItems: 'center', marginTop: 18 },
    linkTxt: { color: t.t2, fontSize: 13 },
    otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 22 },
    otpBox: {
        width: 46, height: 56, borderRadius: 10, borderWidth: 1.5,
        borderColor: t.border, backgroundColor: t.card, color: t.t1,
        fontSize: 22, fontWeight: '800',
    },
});
