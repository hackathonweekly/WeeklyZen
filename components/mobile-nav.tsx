"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Home, User, BookOpen, TimerIcon } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useAppTheme } from "@/contexts/theme-context";

export function MobileNav() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const { isDarkTheme } = useAppTheme();

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
            label: t("关于我们", "About"),
            href: "/about",
            icon: User,
            active: pathname === "/about",
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
                {navItems.map((item) => (
                    <Link
                        key={item.href}
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
                ))}
            </div>
        </nav>
    );
} 