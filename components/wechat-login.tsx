"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Loader2, X } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { useAppTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";
import { useUser } from "@/contexts/user-context";
import { PrivacyPolicyDialog } from "@/components/privacy-policy-dialog";

interface WechatLoginProps {
    onLoginSuccess?: (userInfo: any) => void;
    buttonText?: string;
    buttonVariant?: "default" | "outline" | "ghost";
    buttonSize?: "default" | "sm" | "lg" | "icon";
}

export function WechatLogin({
    onLoginSuccess,
    buttonText,
    buttonVariant = "default",
    buttonSize = "default"
}: WechatLoginProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [browserType, setBrowserType] = useState<'loading' | 'wechat' | 'mobile' | 'pc'>('loading');
    const { isDarkTheme } = useAppTheme();
    const { t } = useLanguage();
    const { fetchUserInfo } = useUser();

    // 检测浏览器类型
    useEffect(() => {
        if (typeof window !== 'undefined' && isOpen) {
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
            const isWechat = /micromessenger/i.test(userAgent);

            if (isWechat) {
                setBrowserType('wechat');
            } else if (isMobile) {
                setBrowserType('mobile');
            } else {
                setBrowserType('pc');
            }
        }
    }, [isOpen]);

    // 生成微信公众号授权链接
    const generateWechatAuthUrl = () => {
        const appId = process.env.NEXT_PUBLIC_WECHAT_APPID;
        if (!appId) {
            console.error('未配置微信公众号AppID');
            return '#';
        }

        const redirectUri = encodeURIComponent(`${window.location.origin}/api/wechat/callback`);
        const scope = 'snsapi_userinfo'; // 获取用户头像和昵称
        const state = Math.random().toString(36).substring(2, 15);

        // 保存state用于防止CSRF攻击
        localStorage.setItem('wechat_auth_state', state);

        return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
    };

    // 生成微信开放平台扫码登录链接
    const generateQrCodeUrl = () => {
        const appId = process.env.NEXT_PUBLIC_WECHAT_OPEN_APPID;
        if (!appId) {
            console.error('未配置微信开放平台AppID');
            return 'https://example.com/error';
        }

        const redirectUri = encodeURIComponent(`${window.location.origin}/api/wechat/qr-callback`);
        const state = Math.random().toString(36).substring(2, 15);

        localStorage.setItem('wechat_qr_state', state);

        return `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
    };

    // 创建要在微信中打开的URL
    const generateOpenInWechatUrl = () => {
        return `${window.location.origin}/login/open-wechat?redirect=${encodeURIComponent(window.location.href)}`;
    };

    // 登录成功后的处理
    const handleLoginSuccess = async () => {
        try {
            // 获取用户信息
            const userInfo = await fetchUserInfo();
            if (userInfo && onLoginSuccess) {
                onLoginSuccess(userInfo);
            }
            setIsOpen(false);
        } catch (error) {
            console.error('获取用户信息失败', error);
        }
    };

    // 处理微信浏览器内登录
    const handleWechatBrowserLogin = () => {
        window.location.href = generateWechatAuthUrl();
    };

    // 处理移动端浏览器登录
    const handleMobileBrowserLogin = () => {
        window.location.href = generateOpenInWechatUrl();
    };

    // 弹窗内容根据浏览器类型显示不同内容
    const renderLoginContent = () => {
        if (browserType === 'loading') {
            return (
                <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            );
        }

        if (browserType === 'wechat') {
            return (
                <div className="flex flex-col items-center justify-center p-6">
                    <Button
                        onClick={handleWechatBrowserLogin}
                        className="bg-green-500 hover:bg-green-600 w-full py-6 text-lg"
                    >
                        <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.5,13.5A1,1,0,1,0,9.5,14.5,1,1,0,0,0,8.5,13.5Zm6.5,0a1,1,0,1,0,1,1A1,1,0,0,0,15,13.5ZM8.5,8.5a1,1,0,1,0,1,1A1,1,0,0,0,8.5,8.5Zm6.5,0a1,1,0,1,0,1,1A1,1,0,0,0,15,8.5ZM18.47,16.83A9.08,9.08,0,0,0,20,12.5a7.06,7.06,0,0,0-3.32-6,8.12,8.12,0,0,0-8.19-.83A7.53,7.53,0,0,0,3,12.5a8.32,8.32,0,0,0,1.33,4.34L3.5,19.59c-.14.29,0,.48.33.33l3-1.34A9.29,9.29,0,0,0,12,20a8.56,8.56,0,0,0,5.17-1.84l2.5,1.17c.29.14.48,0,.33-.33Z" />
                        </svg>
                        {t("微信一键登录", "WeChat Login")}
                    </Button>
                </div>
            );
        }

        if (browserType === 'pc') {
            return (
                <div className="flex flex-col items-center justify-center p-6">
                    <div className={`w-56 h-56 relative border-4 ${isDarkTheme ? "border-slate-700" : "border-slate-200"} rounded-md overflow-hidden p-2 bg-white`}>
                        <QRCodeSVG
                            value={generateQrCodeUrl()}
                            size={208}
                            level="H"
                        />
                    </div>
                    <p className="mt-4 text-sm text-center text-muted-foreground">
                        {t("请打开微信，使用“扫一扫”扫描二维码登录", "Open WeChat and scan the QR code to login")}
                    </p>
                </div>
            );
        }

        // 移动端非微信浏览器
        return (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
                <p className="text-sm text-center text-muted-foreground">
                    {t("请使用微信扫码登录", "Please use WeChat to scan the QR code to login")}
                </p>
                <Button
                    onClick={handleMobileBrowserLogin}
                    className="bg-green-500 hover:bg-green-600 w-full"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.5,13.5A1,1,0,1,0,9.5,14.5,1,1,0,0,0,8.5,13.5Zm6.5,0a1,1,0,1,0,1,1A1,1,0,0,0,15,13.5ZM8.5,8.5a1,1,0,1,0,1,1A1,1,0,0,0,8.5,8.5Zm6.5,0a1,1,0,1,0,1,1A1,1,0,0,0,15,8.5ZM18.47,16.83A9.08,9.08,0,0,0,20,12.5a7.06,7.06,0,0,0-3.32-6,8.12,8.12,0,0,0-8.19-.83A7.53,7.53,0,0,0,3,12.5a8.32,8.32,0,0,0,1.33,4.34L3.5,19.59c-.14.29,0,.48.33.33l3-1.34A9.29,9.29,0,0,0,12,20a8.56,8.56,0,0,0,5.17-1.84l2.5,1.17c.29.14.48,0,.33-.33Z" />
                    </svg>
                    {t("在微信中打开", "Open in WeChat")}
                </Button>
            </div>
        );
    };

    // 定期检查登录状态
    useEffect(() => {
        if (!isOpen) return;

        // 每3秒检查一次登录状态
        const checkInterval = setInterval(async () => {
            const userInfo = await fetchUserInfo();
            if (userInfo) {
                if (onLoginSuccess) {
                    onLoginSuccess(userInfo);
                }
                clearInterval(checkInterval);
                setIsOpen(false);
            }
        }, 3000);

        return () => clearInterval(checkInterval);
    }, [isOpen, fetchUserInfo, onLoginSuccess]);

    return (
        <>
            <Button
                variant={buttonVariant}
                size={buttonSize}
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 ${isDarkTheme ? "hover:bg-indigo-800/20" : "hover:bg-blue-100/60"}`}
            >
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
                {buttonText || t("微信登录", "WeChat Login")}
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className={`sm:max-w-md ${isDarkTheme ? "bg-slate-900 border-slate-800" : "bg-white"}`}>
                    <DialogHeader>
                        <DialogTitle className={isDarkTheme ? "text-white" : "text-gray-800"}>
                            {t("微信登录", "WeChat Login")}
                        </DialogTitle>
                        <DialogDescription>
                            {(() => {
                                if (browserType === 'pc') {
                                    return t("请使用微信扫描下方二维码登录", "Scan the QR code below with WeChat to login");
                                } else if (browserType === 'wechat') {
                                    return t("点击下方按钮一键登录", "Click the button below to login");
                                } else {
                                    return t("选择登录方式", "Choose login method");
                                }
                            })()}
                        </DialogDescription>
                    </DialogHeader>

                    {renderLoginContent()}

                    <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                        >
                            {t("取消", "Cancel")}
                        </Button>

                        <div className="text-xs text-muted-foreground mt-4 sm:mt-0">
                            {t("登录即表示同意", "By logging in, you agree to our")}
                            <span className="ml-1"><PrivacyPolicyDialog /></span>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 