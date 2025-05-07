'use client'
export const dynamic = "force-dynamic";
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

// 创建一个包含useSearchParams的内部组件
function OpenInWechatContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [copied, setCopied] = useState(false);

    // 获取需要在微信中打开的目标URL
    const redirectUrl = searchParams.get('redirect') || '/';

    // 复制URL到剪贴板功能
    const copyUrlToClipboard = () => {
        navigator.clipboard.writeText(redirectUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('无法复制URL: ', err);
        });
    };

    // 检测是否是iOS设备
    const isIOS = () => {
        return /iphone|ipad|ipod/i.test(navigator.userAgent);
    };

    // 尝试直接唤起微信（在某些浏览器中可能会被阻止）
    const openWechat = () => {
        if (isIOS()) {
            window.location.href = 'weixin://';
        } else {
            window.location.href = 'intent://scan/#Intent;scheme=weixin;package=com.tencent.mm;end';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">在微信中打开</CardTitle>
                    <CardDescription className="text-center">请按照以下步骤在微信中完成登录</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertDescription className="text-yellow-800">
                            微信登录需要在微信内部浏览器中完成，请按照以下步骤操作
                        </AlertDescription>
                    </Alert>

                    <ol className="space-y-4 list-decimal pl-5">
                        <li className="text-sm">点击下方的"复制链接"按钮</li>
                        <li className="text-sm">打开微信</li>
                        <li className="text-sm">在微信中点击右上角的"+"</li>
                        <li className="text-sm">选择"粘贴并搜索"</li>
                        <li className="text-sm">点击打开粘贴的链接完成登录</li>
                    </ol>

                    <div className="space-y-3 pt-2">
                        <Button
                            onClick={copyUrlToClipboard}
                            className="w-full bg-green-500 hover:bg-green-600"
                        >
                            {copied ? '✓ 链接已复制!' : '复制链接'}
                        </Button>

                        <Button
                            onClick={openWechat}
                            variant="outline"
                            className="w-full"
                        >
                            尝试打开微信
                        </Button>

                        <Button
                            onClick={() => router.push('/')}
                            variant="ghost"
                            className="w-full"
                        >
                            返回首页
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// 页面加载中显示的内容
function OpenInWechatLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">加载中...</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                </CardContent>
            </Card>
        </div>
    );
}

// 主页面组件，使用Suspense包裹使用useSearchParams的内容组件
export default function OpenInWechatPage() {
    return (
        <Suspense fallback={<OpenInWechatLoading />}>
            <OpenInWechatContent />
        </Suspense>
    );
} 