"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserInfo {
    nickname: string;
    avatar: string;
    openid: string;
    isLoggedIn: boolean;
    loginType?: string;
    loginTime?: string;
}

interface UserContextType {
    user: UserInfo | null;
    isLoading: boolean;
    setUser: (user: UserInfo | null) => void;
    logout: () => void;
    fetchUserInfo: () => Promise<UserInfo | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 从服务端API获取用户信息
    const fetchUserInfo = async (): Promise<UserInfo | null> => {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();

            if (data.isLoggedIn) {
                return data as UserInfo;
            }
            return null;
        } catch (error) {
            console.error('获取用户信息失败', error);
            return null;
        }
    };

    useEffect(() => {
        // 首次加载时，从服务端获取用户信息
        const getUserData = async () => {
            setIsLoading(true);
            try {
                const userData = await fetchUserInfo();
                if (userData) {
                    setUser(userData);
                }
            } catch (error) {
                console.error('Failed to fetch user data', error);
            } finally {
                setIsLoading(false);
            }
        };

        getUserData();
    }, []);

    const logout = async () => {
        try {
            // 调用登出API
            await fetch('/api/logout', { method: 'POST' });
            setUser(null);
        } catch (error) {
            console.error('登出失败', error);
        }
    };

    return (
        <UserContext.Provider value={{ user, isLoading, setUser, logout, fetchUserInfo }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
} 