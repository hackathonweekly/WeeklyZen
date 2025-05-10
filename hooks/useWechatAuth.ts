"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/language-context';

interface WechatUser {
    openid: string;
    nickname: string;
    avatar: string;
}

export function useWechatAuth() {
    const [user, setUser] = useState<WechatUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { t } = useLanguage();

    // 检查用户登录状态
    useEffect(() => {
        async function checkLoginStatus() {
            try {
                // 获取当前登录用户信息
                const response = await fetch('/api/wechat/user');

                if (!response.ok) {
                    if (response.status !== 401) {
                        // 如果不是未登录错误，则显示错误提示
                        toast.error(t('获取用户信息失败', 'Failed to get user info'));
                    }
                    setUser(null);
                    setLoading(false);
                    return;
                }

                const userData = await response.json();

                if (userData && userData.openid) {
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error(t('获取微信用户信息失败:', 'Failed to get WeChat user info:'), error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkLoginStatus();
    }, [t]);

    // 登出函数
    const logout = async () => {
        try {
            const response = await fetch('/api/wechat/logout', { method: 'POST' });

            if (response.ok) {
                setUser(null);
                toast.success(t('已成功登出', 'Successfully logged out'));
                router.push('/login');
            } else {
                toast.error(t('登出失败', 'Failed to logout'));
            }
        } catch (error) {
            console.error(t('登出失败:', 'Logout failed:'), error);
            toast.error(t('登出失败，请稍后再试', 'Logout failed, please try again later'));
        }
    };

    return {
        user,
        loading,
        isLoggedIn: !!user,
        logout
    };
} 