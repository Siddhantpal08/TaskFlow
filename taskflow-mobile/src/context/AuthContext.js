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

    // On app start — try to restore session from stored token
    const checkSession = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) { setLoading(false); return; }

            const res = await authApi.getMe();
            if (res.success && res.data) {
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

    // Login — stores tokens and sets user
    const login = async (email, password) => {
        const res = await authApi.login(email, password);
        if (res.success && res.data) {
            await AsyncStorage.setItem('token', res.data.accessToken);
            if (res.data.refreshToken) {
                await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
            }
            setUser(res.data);
        }
        return res;
    };

    /**
     * Register — Step 1 of 2.
     * Backend sends OTP to email. Does NOT return tokens.
     * After this succeeds, navigate to OTP verification screen.
     */
    const register = async (name, email, password) => {
        const res = await authApi.register(name, email, password);
        return res; // { success: true, data: { message, email } }
    };

    /**
     * Verify email with OTP — Step 2 of 2.
     * Backend returns tokens on success. Sets the user and stores tokens.
     */
    const verifyEmail = async (email, otp) => {
        const res = await authApi.verifyEmail(email, otp);
        if (res.success && res.data?.accessToken) {
            await AsyncStorage.setItem('token', res.data.accessToken);
            if (res.data.refreshToken) {
                await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
            }
            setUser(res.data);
        }
        return res;
    };

    // Resend OTP
    const resendOtp = async (email) => {
        return await authApi.resendOtp(email);
    };

    // Logout — clears all storage and resets user state
    const logout = async () => {
        try { await authApi.logout(); } catch (_) { }
        await AsyncStorage.multiRemove(['token', 'refreshToken']);
        setUser(null);
    };

    // Password reset — Step 1: request OTP
    const requestReset = async (email) => {
        return await authApi.requestPasswordReset(email);
    };

    // Password reset — Step 2: verify OTP + set new password
    const verifyReset = async (email, otp, newPassword) => {
        return await authApi.verifyPasswordReset(email, otp, newPassword);
    };

    return (
        <AuthContext.Provider value={{
            user, loading,
            login, register, verifyEmail, resendOtp,
            logout, requestReset, verifyReset,
            setUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
