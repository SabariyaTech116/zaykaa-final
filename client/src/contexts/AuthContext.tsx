'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, authApi } from '@/lib/api';

interface User {
    id: string;
    phone: string;
    name?: string;
    email?: string;
    role: 'customer' | 'homemaker' | 'admin';
    isNewUser: boolean;
    isFirstOrder: boolean;
    wallet: {
        balance: number;
    };
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (phone: string, otp: string) => Promise<void>;
    sendOtp: (phone: string) => Promise<void>;
    logout: () => void;
    updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('zaykaa_token');
        if (token) {
            loadUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const response = await authApi.getMe() as { data: { user: User } };
            setUser(response.data.user);
        } catch (error) {
            // Token invalid, clear it
            localStorage.removeItem('zaykaa_token');
        } finally {
            setIsLoading(false);
        }
    };

    const sendOtp = async (phone: string) => {
        await authApi.sendOtp(phone);
    };

    const login = async (phone: string, otp: string) => {
        const response = await authApi.verifyOtp(phone, otp) as {
            data: {
                token: string;
                refreshToken: string;
                user: User;
            }
        };

        api.setToken(response.data.token);
        localStorage.setItem('zaykaa_refresh_token', response.data.refreshToken);
        setUser(response.data.user);
    };

    const logout = () => {
        api.clearToken();
        localStorage.removeItem('zaykaa_refresh_token');
        setUser(null);
    };

    const updateProfile = async (data: { name?: string; email?: string }) => {
        const response = await authApi.updateProfile(data) as { data: { user: User } };
        setUser(response.data.user);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                sendOtp,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
