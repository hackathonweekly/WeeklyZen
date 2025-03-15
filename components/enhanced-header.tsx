'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

import { siteConfig } from '@/config/site'
import { MainNav } from '@/components/main-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitch } from '@/components/language-switch'
import { cn } from '@/lib/utils'
import { useAppTheme } from '@/contexts/theme-context'

// 添加scrolled属性接口
interface EnhancedHeaderProps {
  scrolled?: boolean;
}

export function EnhancedHeader({ scrolled = false }: EnhancedHeaderProps) {
  const { isDarkTheme, themeStyles } = useAppTheme()
  
  return (
    <header className={cn(
      "fixed top-0 z-40 w-full border-b transition-all duration-300",
      scrolled 
        ? `${themeStyles.divider} ${isDarkTheme ? 'bg-slate-900/85' : 'bg-white/85'} backdrop-blur-md supports-[backdrop-filter]:bg-background/60` 
        : "border-transparent bg-transparent"
    )}>
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-2">
          <motion.nav 
            className="flex items-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={`p-1 rounded-full ${scrolled ? (isDarkTheme ? 'bg-slate-800/50' : 'bg-slate-100/50') : ''} transition-colors duration-300`}>
              <LanguageSwitch />
            </div>
            <div className={`p-1 rounded-full ${scrolled ? (isDarkTheme ? 'bg-slate-800/50' : 'bg-slate-100/50') : ''} transition-colors duration-300`}>
              <ThemeToggle />
            </div>
          </motion.nav>
        </div>
      </div>
      
      {/* 滚动指示器 */}
      {scrolled && (
        <motion.div 
          className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r ${
            isDarkTheme 
              ? 'from-indigo-600/30 via-indigo-400/40 to-indigo-600/30' 
              : 'from-blue-500/30 via-blue-400/40 to-blue-500/30'
          }`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.5 }}
        />
      )}
    </header>
  )
} 