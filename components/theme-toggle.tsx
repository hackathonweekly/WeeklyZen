'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
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
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? (
        <Sun className="size-6" />
      ) : (
        <Moon className="size-6" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
