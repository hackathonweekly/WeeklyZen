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
import Image from "next/image";
import { useAppTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";

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
    const [loginStatus, setLoginStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
    const [qrCode, setQrCode] = useState<string | null>(null);
    const { isDarkTheme } = useAppTheme();
    const { t } = useLanguage();

    // 模拟生成二维码
    const generateQRCode = async () => {
        setIsLoading(true);
        setLoginStatus("scanning");

        try {
            // 这里是模拟，实际项目中应该调用微信登录接口获取二维码
            await new Promise(resolve => setTimeout(resolve, 1500));
            setQrCode("/wechat_qrcode.jpg"); // 使用示例图片替代
            setIsLoading(false);
        } catch (error) {
            console.error("获取二维码失败", error);
            setLoginStatus("error");
            setIsLoading(false);
        }
    };

    // 模拟检查登录状态
    const checkLoginStatus = () => {
        if (loginStatus === "scanning" && qrCode) {
            // 实际项目中应该轮询后端接口检查登录状态
            const timer = setTimeout(() => {
                // 这里仅作演示，实际项目应该根据后端返回的状态更新
                const mockUserInfo = {
                    nickname: "用户" + Math.floor(Math.random() * 1000),
                    avatar: "https://api.dicebear.com/6.x/micah/svg?seed=" + Math.random(),
                    openid: "wx_" + Math.random().toString(36).substring(2, 15)
                };

                setLoginStatus("success");

                if (onLoginSuccess) {
                    onLoginSuccess(mockUserInfo);
                }

                // 延迟关闭弹窗
                setTimeout(() => setIsOpen(false), 1000);
            }, 3000);

            return () => clearTimeout(timer);
        }
    };

    // 打开弹窗时生成二维码
    useEffect(() => {
        if (isOpen) {
            generateQRCode();
        } else {
            // 重置状态
            setLoginStatus("idle");
            setQrCode(null);
        }
    }, [isOpen]);

    // 监测登录状态
    useEffect(() => {
        const cleanup = checkLoginStatus();
        return cleanup;
    }, [loginStatus, qrCode]);

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
                            {t("请使用微信扫描下方二维码登录", "Scan the QR code below with WeChat to login")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center justify-center p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center">
                                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                                <p className={isDarkTheme ? "text-slate-300" : "text-slate-600"}>
                                    {t("正在加载二维码...", "Loading QR code...")}
                                </p>
                            </div>
                        ) : loginStatus === "scanning" && qrCode ? (
                            <div className="flex flex-col items-center">
                                <div className={`w-56 h-56 relative border-4 ${isDarkTheme ? "border-slate-700" : "border-slate-200"} rounded-md overflow-hidden`}>
                                    <Image
                                        src={qrCode}
                                        alt="WeChat QR Code"
                                        width={200}
                                        height={200}
                                        className="object-cover"
                                    />
                                </div>
                                <p className="mt-4 text-sm text-center text-muted-foreground">
                                    {t("请使用微信扫一扫，关注公众号并登录", "Scan with WeChat, follow the official account to login")}
                                </p>
                            </div>
                        ) : loginStatus === "success" ? (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className={isDarkTheme ? "text-white" : "text-gray-800"}>
                                    {t("登录成功", "Login successful")}
                                </p>
                            </div>
                        ) : loginStatus === "error" ? (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                    <X className="h-8 w-8 text-red-600" />
                                </div>
                                <p className={isDarkTheme ? "text-white" : "text-gray-800"}>
                                    {t("登录失败，请重试", "Login failed, please try again")}
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={generateQRCode}
                                    className="mt-4"
                                >
                                    {t("重新获取二维码", "Get new QR code")}
                                </Button>
                            </div>
                        ) : null}
                    </div>

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
                            <a href="#" className="text-primary hover:underline ml-1">
                                {t("用户协议", "Terms of Service")}
                            </a>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 