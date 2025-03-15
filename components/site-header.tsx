"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { useTheme } from 'next-themes'

import { siteConfig } from '@/config/site'
import { MainNav } from '@/components/main-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitch } from '@/components/language-switch'
import { cn } from '@/lib/utils'
import { useAppTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

// 添加scrolled属性接口
interface SiteHeaderProps {
  scrolled?: boolean;
}

export function SiteHeader({ scrolled = false }: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDarkTheme = resolvedTheme === 'dark'

  return (
    <header className={cn(
      "fixed top-0 z-40 w-full border-b transition-all duration-300",
      scrolled 
        ? "border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" 
        : "border-transparent bg-transparent"
    )}>
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        {/* Logo 和移动端菜单按钮 */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <div className="relative h-8 w-auto">
              <Image
                src={isDarkTheme ? "/WZRightWhite.svg" : "/WZRight.svg"}
                alt="WeeklyZen Logo"
                width={145}
                height={52}
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* 桌面端导航 */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <MainNav items={siteConfig.mainNav} />
          <div className="flex items-center space-x-3">
            <LanguageSwitch />
            <ThemeToggle />
          </div>
        </div>

        {/* 移动端导航 */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
              <div className="flex flex-col space-y-4 py-4">
                {siteConfig.mainNav.map(
                  (item) =>
                    item.href && (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-sm font-medium transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.title}
                      </Link>
                    )
                )}
                <div className="flex items-center space-x-4 mt-4">
                  <LanguageSwitch />
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
