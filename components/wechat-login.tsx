"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAppTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WechatLoginProps {
    onLoginSuccess?: (userInfo: any) => void;
    buttonText?: string;
    buttonVariant?: "default" | "outline" | "ghost";
    buttonSize?: "default" | "sm" | "lg" | "icon";
    redirectUrl?: string;
}

// 微信登录配置
interface WechatLoginConfig {
    appId: string;
    redirectUri: string;
    scope: 'snsapi_base' | 'snsapi_userinfo'; // 授权作用域
}

export function WechatLogin({
    onLoginSuccess,
    buttonText,
    buttonVariant = "default",
    buttonSize = "default",
    redirectUrl = '/'
}: WechatLoginProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isWechatBrowser, setIsWechatBrowser] = useState(false);
    const { isDarkTheme } = useAppTheme();
    const { t } = useLanguage();
    const router = useRouter();

    // 检测是否在微信浏览器中
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const ua = window.navigator.userAgent.toLowerCase();
            setIsWechatBrowser(ua.indexOf('micromessenger') !== -1);
        }
    }, []);

    // 微信登录配置
    const wechatConfig: WechatLoginConfig = {
        appId: process.env.NEXT_PUBLIC_WECHAT_APP_ID || '',
        redirectUri: typeof window !== 'undefined'
            ? `${window.location.origin}/api/wechat/callback?redirect=${encodeURIComponent(redirectUrl)}`
            : '',
        scope: 'snsapi_userinfo' // 使用 snsapi_userinfo 可以获取用户基本信息
    };

    // 生成授权URL
    const generateAuthUrl = () => {
        const redirectUri = encodeURIComponent(wechatConfig.redirectUri);
        const state = redirectUrl; // 使用重定向URL作为state参数
        return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wechatConfig.appId}&redirect_uri=${redirectUri}&response_type=code&scope=${wechatConfig.scope}&state=${state}#wechat_redirect`;
    };

    // 处理登录点击
    const handleLogin = () => {
        if (!wechatConfig.appId) {
            toast.error(t('微信AppID未配置，请联系管理员', 'WeChat AppID is not configured, please contact the administrator'));
            return;
        }

        setIsLoading(true);

        try {
            // 跳转到微信授权页面
            window.location.href = generateAuthUrl();
        } catch (error) {
            console.error('微信登录错误:', error);
            toast.error(t('微信登录失败，请稍后再试', 'WeChat login failed, please try again later'));
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={buttonVariant}
            size={buttonSize}
            onClick={handleLogin}
            disabled={isLoading}
            className={`flex items-center gap-2 ${isDarkTheme ? "hover:bg-indigo-800/20" : "hover:bg-blue-100/60"}`}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.69,11.52c-0.41,0-0.75-0.34-0.75-0.75s0.34-0.75,0.75-0.75s0.75,0.34,0.75,0.75S9.1,11.52,8.69,11.52z M11.79,11.52
            c-0.41,0-0.75-0.34-0.75-0.75s0.34-0.75,0.75-0.75s0.75,0.34,0.75,0.75S12.2,11.52,11.79,11.52z M15.44,12.39
            c-0.35,0-0.63,0.28-0.63,0.63c0,0.35,0.28,0.63,0.63,0.63s0.63-0.28,0.63-0.63C16.07,12.67,15.79,12.39,15.44,12.39z
            M18,12.39c-0.35,0-0.63,0.28-0.63,0.63c0,0.35,0.28,0.63,0.63,0.63s0.63-0.28,0.63-0.63C18.63,12.67,18.35,12.39,18,12.39z
            M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M19.89,14.9L19.89,14.9c-1.04,1.83-2.87,3.11-4.91,3.45
            c-0.71,0.12-1.4,0.12-2.07,0.01c-0.29-0.04-0.62-0.15-0.93-0.28c-0.36-0.14-0.92-0.35-1.46-0.35c-0.54,0-1.1,0.21-1.46,0.35
            c-0.31,0.12-0.64,0.23-0.93,0.28c-0.67,0.1-1.36,0.1-2.07-0.01c-2.04-0.34-3.87-1.62-4.91-3.45l0,0
            C0.73,14.24,0.51,13.5,0.51,12.7l0-0.35c0.06-2.21,1.27-4.2,3.19-5.3C5.73,5.95,7.62,5.59,9.51,5.97l0.01,0
            c0.21,0.04,0.42,0.15,0.73,0.3c0.32,0.15,0.75,0.34,1.24,0.34l0,0c0.55,0,1.01-0.2,1.36-0.36c0.28-0.13,0.5-0.23,0.64-0.27
            c1.86-0.38,3.71-0.02,5.75,1.05c1.92,1.1,3.13,3.08,3.19,5.29l0,0.01l0,0.34C22.49,13.49,22.27,14.24,19.89,14.9z" />
                </svg>
            )}
            {isLoading ? t("登录中...", "Logging in...") : buttonText || t("微信登录", "WeChat Login")}
        </Button>
    );
} 