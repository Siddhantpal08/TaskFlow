import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await authApi.getMe();
            if (res.success) {
                setUser(res.data);
            } else {
                await AsyncStorage.multiRemove(['token', 'refreshToken']);
            }
        } catch (err) {
            await AsyncStorage.multiRemove(['token', 'refreshToken']);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await authApi.login(email, password);
        if (res.success) {
            await AsyncStorage.setItem('token', res.accessToken);
            await AsyncStorage.setItem('refreshToken', res.refreshToken);
            setUser(res.data);
        }
        return res;
    };

    const register = async (name, email, password) => {
        const res = await authApi.register(name, email, password);
        if (res.success) {
            await AsyncStorage.setItem('token', res.accessToken);
            await AsyncStorage.setItem('refreshToken', res.refreshToken);
            setUser(res.data);
        }
        return res;
    };

    const logout = async () => {
        try { await authApi.logout(); } catch (e) { } // Ignore errors
        await AsyncStorage.multiRemove(['token', 'refreshToken']);
        setUser(null);
    };

    const requestReset = async (email) => {
        return await authApi.requestPasswordReset(email);
    };

    const verifyReset = async (email, otp, newPassword) => {
        return await authApi.verifyPasswordReset(email, otp, newPassword);
    };

    return (
        <AuthContext.Provider value={{
            user, loading, login, register, logout, requestReset, verifyReset
        }}>
            {children}
        </AuthContext.Provider>
    );
};
