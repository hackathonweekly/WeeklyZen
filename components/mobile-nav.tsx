"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Home, User, BookOpen, TimerIcon, LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useAppTheme } from "@/contexts/theme-context";
import { useUser } from "@/contexts/user-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WechatLogin } from "@/components/wechat-login";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function MobileNav() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const { isDarkTheme } = useAppTheme();
    const { user, logout, setUser } = useUser();
    const [sheetOpen, setSheetOpen] = useState(false);

    // 导航项定义
    const navItems = [
        {
            label: t("首页", "Home"),
            href: "/",
            icon: Home,
            active: pathname === "/",
        },
        {
            label: t("开始冥想", "Meditate"),
            href: "/meditation",
            icon: TimerIcon,
            active: pathname === "/meditation",
        },
        {
            label: t("冥想入门", "Introduction"),
            href: "/introduction",
            icon: BookOpen,
            active: pathname === "/introduction",
        },
        {
            label: t("我的", "Me"),
            href: "#",
            icon: User,
            active: false,
            component: (
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <button
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full text-xs py-1 transition-colors",
                                isDarkTheme
                                    ? "text-slate-400 hover:text-indigo-300"
                                    : "text-slate-500 hover:text-blue-500"
                            )}
                        >
                            {user ? (
                                <Avatar className="h-6 w-6 mb-1 border border-slate-200 dark:border-slate-800">
                                    <AvatarImage src={user.avatar} alt={user.nickname} />
                                    <AvatarFallback className={isDarkTheme ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-800"}>
                                        {user.nickname.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <LogIn className="h-5 w-5 mb-1" />
                            )}
                            <span className="text-xs">{user ? t("我的", "Me") : t("登录", "Login")}</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
                        <SheetHeader className="pb-4 border-b">
                            <SheetTitle>{t("个人中心", "User Center")}</SheetTitle>
                        </SheetHeader>
                        <div className="py-6">
                            {user ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16 border border-slate-200 dark:border-slate-800">
                                            <AvatarImage src={user.avatar} alt={user.nickname} />
                                            <AvatarFallback className={isDarkTheme ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-800"}>
                                                {user.nickname.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-medium">{user.nickname}</h3>
                                            <p className="text-sm text-muted-foreground">{user.openid}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => {
                                                setSheetOpen(false); // 关闭弹窗
                                                window.location.href = "/about"; // 导航到关于页面
                                            }}
                                            className={cn(
                                                "flex items-center gap-2 p-3 rounded-md w-full text-left",
                                                isDarkTheme ? "hover:bg-slate-800" : "hover:bg-slate-100"
                                            )}
                                        >
                                            <User className="h-5 w-5" />
                                            <span>{t("关于我们", "About")}</span>
                                        </button>
                                    </div>

                                    <Button
                                        onClick={logout}
                                        variant="destructive"
                                        className="w-full mt-8"
                                    >
                                        {t("退出登录", "Logout")}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 space-y-6">
                                    <p className="text-center text-muted-foreground">
                                        {t("登录以获取更多功能", "Login to access more features")}
                                    </p>
                                    <WechatLogin
                                        onLoginSuccess={(userInfo) => setUser(userInfo)}
                                    />
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            ),
        },
    ];

    return (
        <nav className={cn(
            "fixed bottom-0 left-0 right-0 z-50 border-t pb-safe md:hidden",
            isDarkTheme
                ? "bg-slate-950/90 backdrop-blur-md border-slate-800/50"
                : "bg-white/90 backdrop-blur-md border-slate-200/70"
        )}>
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item, index) => (
                    <div key={item.href} className="flex-1">
                        {item.component ? (
                            item.component
                        ) : (
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full text-xs py-1 transition-colors",
                                    item.active
                                        ? isDarkTheme
                                            ? "text-indigo-400"
                                            : "text-blue-600"
                                        : isDarkTheme
                                            ? "text-slate-400 hover:text-indigo-300"
                                            : "text-slate-500 hover:text-blue-500"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 mb-1",
                                    item.active && "fill-current"
                                )} />
                                <span className="text-xs">{item.label}</span>
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </nav>
    );
} 