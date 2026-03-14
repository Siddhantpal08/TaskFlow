import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.js';
import { configureClient } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('tf_token'));
    const [loading, setLoading] = useState(true);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('tf_token');
        localStorage.removeItem('tf_refresh');
        setToken(null);
        setUser(null);
    }, []);

    // Configure the API client with token management
    useEffect(() => {
        configureClient({
            getToken: () => localStorage.getItem('tf_token'),
            setToken: (t) => {
                localStorage.setItem('tf_token', t);
                setToken(t);
            },
            onLogout: handleLogout,
        });
    }, [handleLogout]);

    // On mount: verify stored token by fetching current user
    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        authApi.getMe()
            .then((res) => setUser(res.data))
            .catch(() => handleLogout())
            .finally(() => setLoading(false));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const login = async (email, password) => {
        const res = await authApi.login(email, password);
        const { accessToken, ...userData } = res.data;
        localStorage.setItem('tf_token', accessToken);
        setToken(accessToken);
        setUser(userData);
        return userData;
    };

    const register = async (name, email, password) => {
        const res = await authApi.register(name, email, password);
        const { accessToken, ...userData } = res.data;
        localStorage.setItem('tf_token', accessToken);
        setToken(accessToken);
        setUser(userData);
        return userData;
    };

    const logout = async () => {
        try { await authApi.logout(); } catch { /* ignore */ }
        handleLogout();
    };

    const requestReset = (email) => authApi.requestPasswordReset(email);
    const verifyReset = (email, otp, newPassword) => authApi.verifyPasswordReset(email, otp, newPassword);

    return (
        <AuthContext.Provider value={{ user, setUser, token, loading, login, register, logout, requestReset, verifyReset }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
