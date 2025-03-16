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
    subtleBackground: string
    focusRing: string
    divider: string
    shadow: string
    inputBackground: string
    inputBorder: string
    inputFocus: string
    scrollbarThumb: string
    scrollbarTrack: string
    selection: string
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
  const isDarkTheme = mounted ? (resolvedTheme === 'dark') : false // 默认假设是亮色主题

  // 定义全局主题样式
  const themeStyles = {
    // 背景色 - 优化夜间模式减少蓝光
    background: isDarkTheme 
      ? 'bg-gradient-to-b from-slate-950 via-indigo-950/90 to-slate-950' // 更深沉的背景，减少蓝光
      : 'bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50', // 更柔和的亮色背景
    
    // 文本颜色 - 优化对比度和可读性
    text: isDarkTheme ? 'text-slate-200' : 'text-slate-800', // 略微降低暗色模式文本亮度，减少眼睛疲劳
    primaryText: isDarkTheme ? 'text-slate-100' : 'text-slate-900',
    secondaryText: isDarkTheme ? 'text-slate-400' : 'text-slate-600', // 更柔和的次要文本
    
    // 强调色 - 夜间模式使用更柔和的紫色调
    accentColor: isDarkTheme ? 'indigo-400' : 'blue-500', // 夜间模式使用更柔和的强调色
    
    // 卡片样式 - 增强层次感
    cardBackground: isDarkTheme 
      ? 'bg-slate-900/80 backdrop-blur-md' // 更深色的卡片背景
      : 'bg-white/90 backdrop-blur-md',
    cardBorder: isDarkTheme 
      ? 'border-slate-800/50' // 更微妙的边框
      : 'border-slate-200/70',
    
    // 按钮样式 - 优化交互体验
    buttonBackground: isDarkTheme ? 'bg-indigo-600/90' : 'bg-blue-500/90', // 半透明效果
    buttonHover: isDarkTheme ? 'hover:bg-indigo-500' : 'hover:bg-blue-600',
    buttonText: isDarkTheme ? 'text-slate-100' : 'text-white',
    
    // 新增样式 - 微妙背景
    subtleBackground: isDarkTheme 
      ? 'bg-slate-900/50' 
      : 'bg-slate-100/70',
    
    // 新增样式 - 焦点环
    focusRing: isDarkTheme 
      ? 'focus:ring-indigo-500/40' 
      : 'focus:ring-blue-500/40',
    
    // 新增样式 - 分隔线
    divider: isDarkTheme 
      ? 'border-slate-800/60' 
      : 'border-slate-200/80',
    
    // 新增样式 - 阴影效果
    shadow: isDarkTheme 
      ? 'shadow-lg shadow-indigo-950/20' 
      : 'shadow-lg shadow-blue-200/30',
    
    // 新增样式 - 输入框背景
    inputBackground: isDarkTheme 
      ? 'bg-slate-900/70' 
      : 'bg-white/80',
    
    // 新增样式 - 输入框边框
    inputBorder: isDarkTheme 
      ? 'border-slate-700/50' 
      : 'border-slate-300/70',
    
    // 新增样式 - 输入框焦点
    inputFocus: isDarkTheme 
      ? 'focus:border-indigo-500/50 focus:ring-indigo-500/20' 
      : 'focus:border-blue-500/50 focus:ring-blue-500/20',
    
    // 新增样式 - 滚动条滑块
    scrollbarThumb: isDarkTheme 
      ? 'bg-slate-700 hover:bg-slate-600' 
      : 'bg-slate-300 hover:bg-slate-400',
    
    // 新增样式 - 滚动条轨道
    scrollbarTrack: isDarkTheme 
      ? 'bg-slate-900/50' 
      : 'bg-slate-100/50',
    
    // 新增样式 - 文本选择
    selection: isDarkTheme 
      ? 'selection:bg-indigo-900/70 selection:text-indigo-100' 
      : 'selection:bg-blue-100 selection:text-blue-900',
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