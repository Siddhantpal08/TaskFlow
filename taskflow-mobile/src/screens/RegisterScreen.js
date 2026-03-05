import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DARK as t } from '../data/themes';

export default function RegisterScreen({ navigation }) {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleReg = async () => {
        if (!name || !email || !password) { setError('Fill all fields'); return; }
        setError(''); setLoading(true);
        try {
            await register(name, email, password);
        } catch (e) {
            setError(e.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <View style={s.container}>
            <View style={s.card}>
                <View style={s.header}>
                    <Text style={s.title}>Join Task<Text style={{ color: t.accent }}>Flow</Text></Text>
                </View>

                {error ? <Text style={s.err}>{error}</Text> : null}

                <Text style={s.lbl}>NAME</Text>
                <TextInput style={s.inp} value={name} onChangeText={setName} autoCapitalize="words" />

                <Text style={s.lbl}>EMAIL</Text>
                <TextInput style={s.inp} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

                <Text style={s.lbl}>PASSWORD</Text>
                <TextInput style={s.inp} value={password} onChangeText={setPassword} secureTextEntry />

                <TouchableOpacity style={s.btn} onPress={handleReg} disabled={loading}>
                    {loading ? <ActivityIndicator color="#000" /> : <Text style={s.btntxt}>Create Account</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, alignItems: 'center' }}>
                    <Text style={{ color: t.t3, fontSize: 13 }}>Already have an account? <Text style={{ color: t.accent, fontWeight: 'bold' }}>Sign In</Text></Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg, justifyContent: 'center', padding: 20 },
    card: { backgroundColor: t.surf, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: t.border },
    header: { alignItems: 'center', marginBottom: 25 },
    title: { fontSize: 24, fontWeight: '800', color: t.t1, letterSpacing: -0.5 },
    lbl: { fontSize: 12, fontWeight: 'bold', color: t.t3, marginBottom: 8, marginTop: 15 },
    inp: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 10, padding: 14, color: t.t1, fontSize: 15 },
    btn: { backgroundColor: t.accent, borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 25 },
    btntxt: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    err: { color: t.red, backgroundColor: t.red + '22', padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 13, overflow: 'hidden' }
});
