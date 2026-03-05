import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Expo Go on physical device (LAN) or emulator (localhost)
// We default to your machine's IP address if not provided via env, but for now we'll use localhost.
// NOTE: Android Emulator usually needs 10.0.2.2 instead of localhost to reach the host machine.
const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1');

class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export const doFetch = async (endpoint, options = {}) => {
    let token = await AsyncStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    let res = await fetch(`${API_URL}${endpoint}`, config);

    // Auto token refresh on 401
    if (res.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                // We use the patched backend which accepts refreshToken in body
                const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                });

                if (refreshRes.ok) {
                    const rfData = await refreshRes.json();
                    await AsyncStorage.setItem('token', rfData.accessToken);
                    // Retry original request
                    config.headers['Authorization'] = `Bearer ${rfData.accessToken}`;
                    res = await fetch(`${API_URL}${endpoint}`, config);
                } else {
                    await AsyncStorage.multiRemove(['token', 'refreshToken']);
                    throw new ApiError(401, 'Session expired');
                }
            } catch (err) {
                await AsyncStorage.multiRemove(['token', 'refreshToken']);
                throw new ApiError(401, 'Session expired');
            }
        }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new ApiError(res.status, data.message || 'An error occurred');
    }
    return data;
};
