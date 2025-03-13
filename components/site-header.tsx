import Link from 'next/link'

import { siteConfig } from '@/config/site'
import { MainNav } from '@/components/main-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitch } from '@/components/language-switch'
import { cn } from '@/lib/utils'
import { useAppTheme } from '@/contexts/theme-context'

// 添加scrolled属性接口
interface SiteHeaderProps {
  scrolled?: boolean;
}

export function SiteHeader({ scrolled = false }: SiteHeaderProps) {
  return (
    <header className={cn(
      "fixed top-0 z-40 w-full border-b transition-all duration-300",
      scrolled 
        ? "border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" 
        : "border-transparent bg-transparent"
    )}>
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-3">
            <LanguageSwitch />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
