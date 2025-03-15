'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Moon, Sun, ArrowLeft, Check, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAppTheme } from '@/contexts/theme-context'
import { EnhancedHeader } from '@/components/enhanced-header'

export default function ThemeDemo() {
  const { isDarkTheme, themeStyles } = useAppTheme()
  const [isEnabled, setIsEnabled] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // 页面动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className={`min-h-screen ${themeStyles.background} ${themeStyles.text} ${themeStyles.selection}`}>
      {/* 使用增强版头部 */}
      <EnhancedHeader scrolled={scrolled} />
      
      {/* 主要内容 */}
      <main className="container max-w-screen-xl mx-auto px-4 pt-28 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* 页面标题 */}
          <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto">
            <h1 className={`text-3xl sm:text-4xl font-light ${themeStyles.primaryText} mb-4`}>
              夜间模式主题展示
            </h1>
            <p className={themeStyles.secondaryText}>
              这个页面展示了各种UI元素在亮色和暗色主题下的样式效果，点击右上角的主题切换按钮可以切换主题。
            </p>
          </motion.div>
          
          {/* 卡片展示 */}
          <motion.section variants={itemVariants} className="space-y-6">
            <h2 className={`text-xl font-medium ${themeStyles.primaryText}`}>卡片与容器</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 基础卡片 */}
              <Card className={`p-6 ${themeStyles.cardBackground} border ${themeStyles.cardBorder} ${themeStyles.shadow}`}>
                <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-3`}>基础卡片</h3>
                <p className={themeStyles.secondaryText}>
                  这是一个基础卡片组件，展示了卡片在当前主题下的样式。卡片使用了微妙的背景模糊效果和边框。
                </p>
              </Card>
              
              {/* 悬停效果卡片 */}
              <Card className={`p-6 ${themeStyles.cardBackground} border ${themeStyles.cardBorder} ${themeStyles.shadow} animate-border-glow group transition-all duration-300 hover:scale-[1.02]`}>
                <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-3 group-hover:text-${themeStyles.accentColor} transition-colors`}>
                  悬停效果卡片
                </h3>
                <p className={themeStyles.secondaryText}>
                  这张卡片添加了悬停效果，当鼠标悬停时会有微妙的缩放和边框发光效果，增强用户交互体验。
                </p>
              </Card>
            </div>
          </motion.section>
          
          {/* 按钮展示 */}
          <motion.section variants={itemVariants} className="space-y-6">
            <h2 className={`text-xl font-medium ${themeStyles.primaryText}`}>按钮样式</h2>
            
            <Card className={`p-6 ${themeStyles.cardBackground} border ${themeStyles.cardBorder} ${themeStyles.shadow}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* 主要按钮 */}
                <div className="space-y-2">
                  <h3 className={`text-sm font-medium ${themeStyles.primaryText}`}>主要按钮</h3>
                  <Button className={`w-full ${themeStyles.buttonBackground} ${themeStyles.buttonHover} ${themeStyles.buttonText}`}>
                    主要按钮
                  </Button>
                </div>
                
                {/* 次要按钮 */}
                <div className="space-y-2">
                  <h3 className={`text-sm font-medium ${themeStyles.primaryText}`}>次要按钮</h3>
                  <Button variant="secondary" className="w-full">
                    次要按钮
                  </Button>
                </div>
                
                {/* 轮廓按钮 */}
                <div className="space-y-2">
                  <h3 className={`text-sm font-medium ${themeStyles.primaryText}`}>轮廓按钮</h3>
                  <Button variant="outline" className="w-full">
                    轮廓按钮
                  </Button>
                </div>
                
                {/* 幽灵按钮 */}
                <div className="space-y-2">
                  <h3 className={`text-sm font-medium ${themeStyles.primaryText}`}>幽灵按钮</h3>
                  <Button variant="ghost" className="w-full">
                    幽灵按钮
                  </Button>
                </div>
              </div>
            </Card>
          </motion.section>
          
          {/* 表单元素 */}
          <motion.section variants={itemVariants} className="space-y-6">
            <h2 className={`text-xl font-medium ${themeStyles.primaryText}`}>表单元素</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 输入框 */}
              <Card className={`p-6 ${themeStyles.cardBackground} border ${themeStyles.cardBorder} ${themeStyles.shadow}`}>
                <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-4`}>输入框</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input 
                      id="name" 
                      placeholder="请输入您的姓名" 
                      className={`${themeStyles.inputBackground} ${themeStyles.inputBorder} ${themeStyles.inputFocus}`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="请输入您的邮箱" 
                      className={`${themeStyles.inputBackground} ${themeStyles.inputBorder} ${themeStyles.inputFocus}`}
                    />
                  </div>
                </div>
              </Card>
              
              {/* 选择器和开关 */}
              <Card className={`p-6 ${themeStyles.cardBackground} border ${themeStyles.cardBorder} ${themeStyles.shadow}`}>
                <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-4`}>选择器和开关</h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">选择主题色</Label>
                    <Select>
                      <SelectTrigger className={`${themeStyles.inputBackground} ${themeStyles.inputBorder} ${themeStyles.inputFocus}`}>
                        <SelectValue placeholder="选择一个主题色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">蓝色</SelectItem>
                        <SelectItem value="purple">紫色</SelectItem>
                        <SelectItem value="indigo">靛蓝色</SelectItem>
                        <SelectItem value="teal">蓝绿色</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications" className="cursor-pointer">启用通知</Label>
                    <Switch 
                      id="notifications" 
                      checked={isEnabled}
                      onCheckedChange={setIsEnabled}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </motion.section>
          
          {/* 标签页 */}
          <motion.section variants={itemVariants} className="space-y-6">
            <h2 className={`text-xl font-medium ${themeStyles.primaryText}`}>标签页</h2>
            
            <Card className={`p-6 ${themeStyles.cardBackground} border ${themeStyles.cardBorder} ${themeStyles.shadow}`}>
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="account">账户</TabsTrigger>
                  <TabsTrigger value="password">密码</TabsTrigger>
                  <TabsTrigger value="settings">设置</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className={`${themeStyles.subtleBackground} p-4 rounded-md`}>
                  <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-2`}>账户信息</h3>
                  <p className={themeStyles.secondaryText}>
                    在这里管理您的账户信息和个人资料设置。
                  </p>
                </TabsContent>
                <TabsContent value="password" className={`${themeStyles.subtleBackground} p-4 rounded-md`}>
                  <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-2`}>密码设置</h3>
                  <p className={themeStyles.secondaryText}>
                    在这里更改您的密码和安全设置。
                  </p>
                </TabsContent>
                <TabsContent value="settings" className={`${themeStyles.subtleBackground} p-4 rounded-md`}>
                  <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-2`}>应用设置</h3>
                  <p className={themeStyles.secondaryText}>
                    在这里管理应用程序的通知、隐私和其他设置。
                  </p>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.section>
          
          {/* 主题切换演示 */}
          <motion.section variants={itemVariants} className="space-y-6">
            <h2 className={`text-xl font-medium ${themeStyles.primaryText}`}>主题切换演示</h2>
            
            <Card className={`p-6 ${themeStyles.cardBackground} border ${themeStyles.cardBorder} ${themeStyles.shadow}`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-2`}>
                    当前主题: {isDarkTheme ? '暗色模式' : '亮色模式'}
                  </h3>
                  <p className={themeStyles.secondaryText}>
                    点击右侧的按钮切换主题，或使用右上角的主题切换按钮。
                  </p>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="lg"
                      className={`relative overflow-hidden rounded-full ${themeStyles.cardBackground} border ${themeStyles.cardBorder} hover:${themeStyles.cardBorder} transition-all duration-300 px-8 py-6`}
                      onClick={() => document.documentElement.classList.toggle('dark')}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isDarkTheme ? (
                          <>
                            <Sun className="size-5 text-amber-300" />
                            <span>切换到亮色模式</span>
                          </>
                        ) : (
                          <>
                            <Moon className="size-5 text-indigo-400" />
                            <span>切换到暗色模式</span>
                          </>
                        )}
                      </span>
                      
                      {/* 背景动画效果 */}
                      <div className={`absolute inset-0 transition-opacity duration-500 ${isDarkTheme ? 'opacity-40' : 'opacity-20'}`}>
                        <div className={`absolute inset-0 ${
                          isDarkTheme 
                            ? 'bg-gradient-to-tr from-indigo-950 via-purple-900 to-blue-900' 
                            : 'bg-gradient-to-tr from-blue-100 via-sky-100 to-indigo-100'
                        }`} />
                      </div>
                      
                      {/* 光晕效果 */}
                      <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                        isDarkTheme 
                          ? 'bg-indigo-500/20' 
                          : 'bg-blue-500/20'
                      }`} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.section>
        </motion.div>
      </main>
      
      {/* 页脚 */}
      <footer className={`py-8 border-t ${themeStyles.divider}`}>
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className={`text-lg font-medium ${themeStyles.primaryText}`}>WeeklyZen</div>
              <div className={themeStyles.secondaryText}>周周冥想小组</div>
            </div>
            
            <div className={themeStyles.secondaryText}>
              <p>© 2024 WeeklyZen</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 