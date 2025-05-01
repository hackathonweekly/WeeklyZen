"use client";

import { useUser } from "@/contexts/user-context";
import { useLanguage } from "@/contexts/language-context";
import { useAppTheme } from "@/contexts/theme-context";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { useState } from "react";

export function UserAvatarMenu() {
    const { user, logout } = useUser();
    const { t } = useLanguage();
    const { isDarkTheme } = useAppTheme();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    if (!user) return null;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                    <Avatar className="h-8 w-8 cursor-pointer border border-slate-200 dark:border-slate-800">
                        <AvatarImage src={user.avatar} alt={user.nickname} />
                        <AvatarFallback className={isDarkTheme ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-800"}>
                            {user.nickname.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-56 ${isDarkTheme ? "bg-slate-900 border-slate-800" : ""}`}>
                <DropdownMenuLabel className="flex flex-col gap-1">
                    <span className="font-medium">{user.nickname}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.openid}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                        setOpen(false); // 关闭下拉菜单
                        router.push("/about"); // 导航到关于页面
                    }}
                >
                    <User className="mr-2 h-4 w-4" />
                    <span>{t("关于我们", "About")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer text-red-500 focus:text-red-500 dark:focus:text-red-400"
                    onClick={logout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("退出登录", "Log out")}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 