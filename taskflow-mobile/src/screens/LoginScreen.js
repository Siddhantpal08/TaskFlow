import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { DARK as t } from '../data/themes';

WebBrowser.maybeCompleteAuthSession();

// Web Client ID fallback
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '491185646983-sprdq04cfjcfq3mphq97a09qmhomobcj.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export default function LoginScreen({ navigation }) {
    const { login, googleLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // useIdTokenAuthRequest triggers native Android Play Services login (no browser required)
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: WEB_CLIENT_ID,
        androidClientId: ANDROID_CLIENT_ID,
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleToken(id_token);
        } else if (response?.type === 'error') {
            setError(response.error?.message || 'Google login failed');
        }
    }, [response]);

    const handleGoogleToken = async (idToken) => {
        setLoading(true);
        setError('');
        try {
            // Send the Google ID Token to backend to verify and create session
            await googleLogin(idToken);
        } catch (e) {
            setError(e.message || 'Google Auth failed');
        } finally {
            setLoading(false);
        }
    };

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
        setError('');
        promptAsync();
    };

    return (
        <View style={s.container}>
            <View style={s.card}>
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

                <View style={s.orContainer}>
                    <View style={s.orLine} />
                    <Text style={s.orText}>OR</Text>
                    <View style={s.orLine} />
                </View>

                <TouchableOpacity style={s.googleBtn} onPress={handleGoogleLogin} disabled={!request || loading}>
                    <Ionicons name="logo-google" size={18} color={t.t1} style={{ marginRight: 10 }} />
                    <Text style={s.googleBtnTxt}>Continue with Google</Text>
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
    link: { marginTop: 14, alignItems: 'center' },
    linkTxt: { color: t.t3, fontSize: 13 },
    orContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    orLine: { flex: 1, height: 1, backgroundColor: t.border },
    orText: { color: t.t3, paddingHorizontal: 10, fontSize: 12, fontWeight: 'bold' },
    googleBtn: {
        flexDirection: 'row', backgroundColor: t.card, borderRadius: 10, padding: 14,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.border,
        marginBottom: 10,
    },
    googleBtnTxt: { color: t.t1, fontWeight: 'bold', fontSize: 15 },
});
