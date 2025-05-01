"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserInfo {
    nickname: string;
    avatar: string;
    openid: string;
}

interface UserContextType {
    user: UserInfo | null;
    isLoading: boolean;
    setUser: (user: UserInfo | null) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 首次加载时，尝试从 localStorage 中恢复用户信息
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse stored user', e);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    // 当用户状态变化时，更新 localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }, [user]);

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <UserContext.Provider value={{ user, isLoading, setUser, logout }}>
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