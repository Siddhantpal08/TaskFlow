import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DARK as t } from '../data/themes';

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) { setError('Fill all fields'); return; }
        setError(''); setLoading(true);
        try {
            await login(email, password);
        } catch (e) {
            setError(e.message || 'Login failed');
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        Alert.alert(
            'Google Sign-in',
            'Google Sign-in is available on the web version. Please use email & password to sign in on mobile, or visit the web app to sign in with Google.',
            [{ text: 'OK' }]
        );
    };

    return (
        <View style={s.container}>
            <View style={s.card}>
                {/* Logo */}
                <View style={s.header}>
                    <View style={s.logo}><Text style={s.logotxt}>T</Text></View>
                    <Text style={s.title}>Task<Text style={{ color: t.accent }}>Flow</Text></Text>
                </View>

                {error ? <Text style={s.err}>{error}</Text> : null}

                <Text style={s.lbl}>EMAIL</Text>
                <TextInput
                    style={s.inp}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor={t.t3}
                    placeholder="you@example.com"
                />

                <Text style={s.lbl}>PASSWORD</Text>
                <TextInput
                    style={s.inp}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor={t.t3}
                    placeholder="••••••••"
                />

                <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#000" /> : <Text style={s.btntxt}>Sign In</Text>}
                </TouchableOpacity>

                {/* Divider */}
                <View style={s.divRow}>
                    <View style={s.divLine} />
                    <Text style={s.divTxt}>OR</Text>
                    <View style={s.divLine} />
                </View>

                {/* Google Sign-in */}
                <TouchableOpacity style={s.googleBtn} onPress={handleGoogleLogin}>
                    <Text style={s.googleG}>G</Text>
                    <Text style={s.googleTxt}>Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={s.link}>
                    <Text style={s.linkTxt}>Forgot password? <Text style={{ color: t.accent, fontWeight: 'bold' }}>Reset it</Text></Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.link}>
                    <Text style={s.linkTxt}>New here? <Text style={{ color: t.accent, fontWeight: 'bold' }}>Create account</Text></Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg, justifyContent: 'center', padding: 20 },
    card: { backgroundColor: t.surf, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: t.border },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
    logo: { width: 38, height: 38, borderRadius: 10, backgroundColor: t.accent, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    logotxt: { fontSize: 20, fontWeight: '900', color: '#000' },
    title: { fontSize: 24, fontWeight: '800', color: t.t1, letterSpacing: -0.5 },
    lbl: { fontSize: 12, fontWeight: 'bold', color: t.t3, marginBottom: 8, marginTop: 15 },
    inp: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 10, padding: 14, color: t.t1, fontSize: 15 },
    btn: { backgroundColor: t.accent, borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 25 },
    btntxt: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    err: { color: t.red, backgroundColor: t.red + '22', padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 13, overflow: 'hidden' },
    divRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
    divLine: { flex: 1, height: 1, backgroundColor: t.border },
    divTxt: { color: t.t3, fontSize: 11, fontWeight: 'bold', marginHorizontal: 12 },
    googleBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: t.border, borderRadius: 10,
        padding: 13, backgroundColor: t.card,
    },
    googleG: { fontSize: 18, fontWeight: '900', color: '#4285F4', marginRight: 10 },
    googleTxt: { color: t.t1, fontWeight: '700', fontSize: 14 },
    link: { marginTop: 14, alignItems: 'center' },
    linkTxt: { color: t.t3, fontSize: 13 },
});
