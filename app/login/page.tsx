"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WechatLogin } from '@/components/wechat-login';
import { useWechatAuth } from '@/hooks/useWechatAuth';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/language-context';
import { useAppTheme } from '@/contexts/theme-context';

// 页面加载时显示的内容
function OpenInWechatLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-md border border-border">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">正在加载...</h1>
                    <p className="mt-2 text-muted-foreground">请稍候...</p>
                </div>
            </div>
        </div>
    );
}

interface WechatUserData {
    openid: string;
    nickname: string;
    avatar: string;
}

function OpenInWechatContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading, isLoggedIn } = useWechatAuth();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const { t } = useLanguage();
    const { isDarkTheme } = useAppTheme();

    useEffect(() => {
        // 检查URL中是否有错误参数
        const error = searchParams.get('error');
        if (error) {
            toast.error(error);
        }

        // 检查用户是否已经登录
        if (!loading && isLoggedIn) {
            router.push('/');
        }

        // 设置检查认证状态完成
        setIsCheckingAuth(false);
    }, [router, searchParams, loading, isLoggedIn]);

    if (loading || isCheckingAuth) {
        return <OpenInWechatLoading />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-md border border-border">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">{t("欢迎登录", "Welcome")}</h1>
                    <p className="mt-2 text-muted-foreground">{t("请使用下面的方式登录系统", "Please login using the methods below")}</p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="flex flex-col space-y-4">
                        <WechatLogin
                            onLoginSuccess={(userData: WechatUserData) => {
                                toast.success(t(`欢迎回来，${userData.nickname}！`, `Welcome back, ${userData.nickname}!`));
                                router.push('/');
                            }}
                        />

                        <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className={`px-2 ${isDarkTheme ? 'bg-card' : 'bg-card'} text-muted-foreground`}>
                                    {t("其他登录方式开发中", "Other login methods coming soon")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OpenInWechatPage() {
    return (
        <Suspense fallback={<OpenInWechatLoading />}>
            <OpenInWechatContent />
        </Suspense>
    );
} 