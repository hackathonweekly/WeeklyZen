'use client'
import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
    // 浏览器类型状态：loading(加载中), wechat(微信浏览器), mobile(移动浏览器), pc(电脑浏览器)
    const [browserType, setBrowserType] = useState<'loading' | 'wechat' | 'mobile' | 'pc'>('loading');

    useEffect(() => {
        // 检测用户浏览器和设备类型
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
        const isWechat = /micromessenger/i.test(userAgent);

        // 根据检测结果设置浏览器类型
        if (isWechat) {
            setBrowserType('wechat');
        } else if (isMobile) {
            setBrowserType('mobile');
        } else {
            setBrowserType('pc');
        }
    }, []);

    // 生成微信公众号授权链接
    const generateWechatAuthUrl = () => {
        const appId = process.env.NEXT_PUBLIC_WECHAT_APPID;
        const redirectUri = encodeURIComponent(`${window.location.origin}/api/wechat/callback`);
        const scope = 'snsapi_userinfo'; // 使用snsapi_userinfo获取用户头像和昵称
        const state = Math.random().toString(36).substring(2, 15);

        // 保存state到本地存储，用于防止CSRF攻击
        localStorage.setItem('wechat_auth_state', state);

        return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
    };

    // 生成微信开放平台扫码登录链接
    const generateQrCodeUrl = () => {
        const appId = process.env.NEXT_PUBLIC_WECHAT_OPEN_APPID;
        const redirectUri = encodeURIComponent(`${window.location.origin}/api/wechat/qr-callback`);
        const state = Math.random().toString(36).substring(2, 15);

        localStorage.setItem('wechat_qr_state', state);

        return `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
    };

    // 创建要在微信中打开的URL
    const generateOpenInWechatUrl = () => {
        return `${window.location.origin}/login/open-wechat?redirect=${encodeURIComponent(window.location.href)}`;
    };

    // 加载状态显示Loading
    if (browserType === 'loading') {
        return <div className="flex h-screen items-center justify-center">加载中...</div>;
    }

    // 微信浏览器内 - 显示微信一键登录按钮
    if (browserType === 'wechat') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">微信登录</CardTitle>
                        <CardDescription className="text-center">使用微信账号一键登录</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button
                            onClick={() => window.location.href = generateWechatAuthUrl()}
                            className="bg-green-500 hover:bg-green-600 w-full py-6 text-lg"
                        >
                            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.5,13.5A1,1,0,1,0,9.5,14.5,1,1,0,0,0,8.5,13.5Zm6.5,0a1,1,0,1,0,1,1A1,1,0,0,0,15,13.5ZM8.5,8.5a1,1,0,1,0,1,1A1,1,0,0,0,8.5,8.5Zm6.5,0a1,1,0,1,0,1,1A1,1,0,0,0,15,8.5ZM18.47,16.83A9.08,9.08,0,0,0,20,12.5a7.06,7.06,0,0,0-3.32-6,8.12,8.12,0,0,0-8.19-.83A7.53,7.53,0,0,0,3,12.5a8.32,8.32,0,0,0,1.33,4.34L3.5,19.59c-.14.29,0,.48.33.33l3-1.34A9.29,9.29,0,0,0,12,20a8.56,8.56,0,0,0,5.17-1.84l2.5,1.17c.29.14.48,0,.33-.33Z" />
                            </svg>
                            微信一键登录
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // PC浏览器 - 显示微信扫码登录
    if (browserType === 'pc') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">微信扫码登录</CardTitle>
                        <CardDescription className="text-center">请使用微信扫一扫以下二维码</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="border-4 border-green-500 rounded-lg p-4 bg-white mb-4">
                            <QRCodeSVG
                                value={generateQrCodeUrl()}
                                size={200}
                                level="H"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            打开微信，点击"+"，使用"扫一扫"即可登录
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 移动端非微信浏览器 - 显示在微信中打开选项及其他登录方式
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">登录</CardTitle>
                    <CardDescription className="text-center">选择登录方式</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Alert className="bg-green-50 border-green-200">
                            <AlertDescription>
                                推荐使用微信登录，微信登录更快捷、更安全
                            </AlertDescription>
                        </Alert>

                        <Button
                            onClick={() => window.location.href = generateOpenInWechatUrl()}
                            className="bg-green-500 hover:bg-green-600 w-full"
                            variant="outline"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.5,13.5A1,1,0,1,0,9.5,14.5,1,1,0,0,0,8.5,13.5Zm6.5,0a1,1,0,1,0,1,1A1,1,0,0,0,15,13.5ZM8.5,8.5a1,1,0,1,0,1,1A1,1,0,0,0,8.5,8.5Zm6.5,0a1,1,0,1,0,1,1A1,1,0,0,0,15,8.5ZM18.47,16.83A9.08,9.08,0,0,0,20,12.5a7.06,7.06,0,0,0-3.32-6,8.12,8.12,0,0,0-8.19-.83A7.53,7.53,0,0,0,3,12.5a8.32,8.32,0,0,0,1.33,4.34L3.5,19.59c-.14.29,0,.48.33.33l3-1.34A9.29,9.29,0,0,0,12,20a8.56,8.56,0,0,0,5.17-1.84l2.5,1.17c.29.14.48,0,.33-.33Z" />
                            </svg>
                            在微信中打开
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    或选择其他登录方式
                                </span>
                            </div>
                        </div>

                        <Tabs defaultValue="phone" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="phone">手机号登录</TabsTrigger>
                                <TabsTrigger value="account">账号密码</TabsTrigger>
                            </TabsList>
                            <TabsContent value="phone" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Input placeholder="请输入手机号" />
                                    <div className="flex space-x-2">
                                        <Input placeholder="请输入验证码" />
                                        <Button variant="outline">获取验证码</Button>
                                    </div>
                                </div>
                                <Button className="w-full">登录</Button>
                            </TabsContent>
                            <TabsContent value="account" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Input placeholder="请输入账号" />
                                    <Input type="password" placeholder="请输入密码" />
                                </div>
                                <Button className="w-full">登录</Button>
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 