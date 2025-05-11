"use client"

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useAppTheme } from '@/contexts/theme-context'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitch } from '@/components/language-switch'
import { WechatLogin } from "@/components/wechat-login";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { useUser } from "@/contexts/user-context";
import { useLanguage } from "@/contexts/language-context";
import { cn } from '@/lib/utils'

// 添加scrolled属性接口
interface SiteHeaderProps {
  scrolled?: boolean;
}

export function SiteHeader({ scrolled = false }: SiteHeaderProps) {
  const { isDarkTheme, themeStyles } = useAppTheme();
  const { t } = useLanguage();
  const { user, setUser } = useUser();

  const headerBackgroundClass = scrolled
    ? isDarkTheme
      ? "bg-slate-950/90 backdrop-blur-md border-slate-800/50"
      : "bg-white/90 backdrop-blur-md border-slate-200/70"
    : "bg-transparent border-transparent";

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${headerBackgroundClass}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* 桌面端导航容器，放在最左侧 */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 mr-6">
            <span className={`text-xl md:text-2xl font-bold ${themeStyles.primaryText}`}>
              WeeklyZen
            </span>
          </Link>

          {/* 桌面端导航项目 */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm transition-colors ${themeStyles.primaryText} hover:opacity-80`}
            >
              {t("首页", "Home")}
            </Link>
            <Link
              href="/meditation"
              className={`text-sm transition-colors ${themeStyles.primaryText} hover:opacity-80`}
            >
              {t("开始冥想", "Meditate")}
            </Link>
            <Link
              href="/introduction"
              className={`text-sm transition-colors ${themeStyles.primaryText} hover:opacity-80`}
            >
              {t("冥想入门", "Introduction")}
            </Link>
            <Link
              href="/about"
              className={`text-sm transition-colors ${themeStyles.primaryText} hover:opacity-80`}
            >
              {t("关于我们", "About")}
            </Link>
          </div>
        </div>

        {/* 右侧工具栏 */}
        <div className="flex items-center space-x-3">
          {/* 移动端和桌面端都显示 */}
          <div className="flex items-center space-x-3">
            <LanguageSwitch />
            <ThemeToggle />
          </div>

          {/* 仅在桌面版显示登录按钮/用户头像 - 临时隐藏微信登录按钮 */}
          <div className="hidden md:block">
            {user ? (
              <UserAvatarMenu />
            ) : (
              /* 微信登录按钮暂时隐藏 
              <WechatLogin
                buttonVariant="outline"
                buttonSize="sm"
                onLoginSuccess={(userInfo) => setUser(userInfo)}
              />
              */
              <span></span> // 空元素替代，保持布局
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
