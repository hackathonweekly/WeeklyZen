'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // 在组件挂载后设置mounted为true，确保只在客户端渲染图标
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // 如果组件尚未挂载，返回一个占位按钮，避免水合不匹配
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="opacity-0">
        <Sun className="size-6" />
        <span className="sr-only">切换主题</span>
      </Button>
    )
  }

  // 确定当前主题
  const isDark = resolvedTheme === 'dark'

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="relative overflow-hidden rounded-full bg-background/10 backdrop-blur-sm border border-border/20 hover:bg-background/20 hover:border-border/30 transition-all duration-300"
        aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
      >
        <div className="relative z-10 flex items-center justify-center">
          {isDark ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Sun className="size-5 text-amber-300" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Moon className="size-5 text-indigo-400" />
            </motion.div>
          )}
        </div>
        
        {/* 背景动画效果 */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isDark ? 'opacity-40' : 'opacity-20'}`}>
          <div className={`absolute inset-0 ${
            isDark 
              ? 'bg-gradient-to-tr from-indigo-950 via-purple-900 to-blue-900' 
              : 'bg-gradient-to-tr from-blue-100 via-sky-100 to-indigo-100'
          }`} />
        </div>
        
        {/* 光晕效果 */}
        <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
          isDark 
            ? 'bg-indigo-500/20' 
            : 'bg-blue-500/20'
        }`} />
        
        <span className="sr-only">切换主题</span>
      </Button>
    </motion.div>
  )
}
