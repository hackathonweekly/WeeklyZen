'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

// 创建主题上下文
type ThemeContextType = {
  isDarkTheme: boolean
  themeStyles: {
    background: string
    text: string
    primaryText: string
    secondaryText: string
    accentColor: string
    cardBackground: string
    cardBorder: string
    buttonBackground: string
    buttonHover: string
    buttonText: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// 主题提供者组件
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // 确保只在客户端渲染后获取主题
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 判断是否为暗色主题
  // 使用resolvedTheme避免初始渲染时的"undefined"问题
  const isDarkTheme = mounted ? (resolvedTheme === 'dark') : true // 默认假设是暗色主题

  // 定义全局主题样式
  const themeStyles = {
    // 背景色
    background: isDarkTheme 
    // ? 'bg-gradient-to-b from-slate-950 via-blue-950 to-indigo-950'
      ? 'bg-gradient-to-b from-indigo-200 via-purple-100 to-blue-200' // 恢复原始的深色背景
      : 'bg-gradient-to-b from-sky-100 via-blue-50 to-indigo-100',
    
    // 文本颜色
    text: isDarkTheme ? 'text-white' : 'text-slate-800',
    primaryText: isDarkTheme ? 'text-white' : 'text-slate-900',
    secondaryText: isDarkTheme ? 'text-indigo-200/70' : 'text-slate-600',
    
    // 强调色
    accentColor: isDarkTheme ? 'indigo-500' : 'blue-500',
    
    // 卡片样式
    cardBackground: isDarkTheme 
      ? 'bg-indigo-950/30 backdrop-blur-md' 
      : 'bg-white/80 backdrop-blur-md',
    cardBorder: isDarkTheme 
      ? 'border-indigo-600/10' 
      : 'border-blue-200/50',
    
    // 按钮样式
    buttonBackground: isDarkTheme ? 'bg-indigo-600' : 'bg-blue-500',
    buttonHover: isDarkTheme ? 'hover:bg-indigo-700' : 'hover:bg-blue-600',
    buttonText: 'text-white',
  }

  return (
    <ThemeContext.Provider value={{ isDarkTheme, themeStyles }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 自定义钩子，用于访问主题上下文
export function useAppTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useAppTheme must be used within an AppThemeProvider')
  }
  return context
} 