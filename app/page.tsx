"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/language-context';
import { SiteHeader } from '@/components/site-header';
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from 'react';
import { useTheme } from "next-themes";
import { useAppTheme } from '@/contexts/theme-context';
import { DialogContent } from "@/components/ui/dialog";
import { BreathingSphere } from '@/components/breathing-sphere';

export default function IndexPage() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();
  const { isDarkTheme, themeStyles } = useAppTheme();
  const [mounted, setMounted] = useState(false);
  
  // 组件挂载检查，确保只在客户端渲染后应用样式
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // 如果组件尚未挂载，先返回一个基础结构，避免水合不匹配
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-indigo-950 to-blue-950 text-white">
        <div className="fixed top-0 left-0 w-full z-50 invisible">
          <SiteHeader scrolled={false} />
        </div>
        <div className="h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen overflow-hidden ${themeStyles.background}`}>
      <SiteHeader scrolled={scrolled} />
      
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* 背景动画 */}
        <div className="absolute inset-0">
          {/* 柔和的波浪动画 - 调整透明度和大小 */}
          <motion.div 
            className="absolute inset-0 opacity-10"
            style={{ 
              background: isDarkTheme 
                ? "radial-gradient(circle at center, rgba(99, 102, 241, 0.2) 0%, transparent 70%)"
                : "radial-gradient(circle at center, rgba(37, 99, 235, 0.3) 0%, transparent 70%)",
            }}
            animate={{ 
              scale: [1.5, 1.7, 1.5],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* 呼吸球容器 - 绝对定位在第一屏中心 */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vmin] h-[70vmin] pointer-events-none`}>
            <BreathingSphere 
              isPlaying={true}
              showText={false}
              size="large"
              position="center"
            />
          </div>
        </div>
        
        {/* 主标题区域 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-4 inline-block"
          >
            <div className={`text-sm md:text-base ${isDarkTheme ? 'text-indigo-500' : 'text-blue-900'} font-medium tracking-wide uppercase mb-1`}>
              {t("周周冥想", "Weekly Zen")}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key="breathing-text"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.5 }}
                className={`text-sm md:text-base ${isDarkTheme ? 'text-indigo-500/80' : 'text-blue-900/80'} font-medium tracking-wide mb-3`}
              >
                {/* {t("跟随呼吸球，调整呼吸", "Follow the breathing sphere, adjust your breath")} */}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className={`text-3xl sm:text-4xl md:text-6xl font-light tracking-tight ${themeStyles.primaryText} mb-6 leading-tight`}
          >
            {t(
              "掌控呼吸，掌控生命",
              "Who controls his breath controls his life"
            )}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className={`text-sm sm:text-base md:text-lg ${isDarkTheme ? 'text-indigo-100/80' : 'text-slate-700'} font-light mb-12 md:mb-16 max-w-xl mx-auto leading-relaxed`}
          >
            {t(
              "周周冥想是一个专注纯粹冥想练习的温暖小组，致力于为创客和开发者提供一个简单、可持续的冥想空间。",
              "WeeklyZen is a warm meditation group dedicated to providing a simple and sustainable meditation space for makers and developers."
            )}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/meditation">
              <Button
                size={isMobile ? "default" : "lg"}
                className={`w-full sm:w-auto px-6 sm:px-10 py-2.5 sm:py-6 rounded-full ${
                  isDarkTheme 
                    ? "border border-blue-500/50 bg-blue-600/95 text-indigo-100 hover:bg-blue-400/95"
                    : "border border-blue-500/50 bg-blue-600/95 text-indigo-100 hover:bg-blue-400/95"
                } backdrop-blur-sm transition-all duration-200`}
              >
                <span className="relative z-10">{t("开始冥想", "Start Meditation")}</span>
              </Button>
            </Link>
            <Link href="/introduction">
              <Button
                size={isMobile ? "default" : "lg"}
                variant="outline"
                className={`w-full sm:w-auto px-6 sm:px-10 py-2.5 sm:py-6 rounded-full ${
                  isDarkTheme 
                    ? "border-indigo-600/30 bg-indigo-950/95 text-indigo-100 hover:bg-indigo-900/95"
                    : "border-blue-200/50 bg-indigo-100/95 text-blue-600 hover:bg-indigo-200/95"
                } transition-all duration-200`}
              >
                {t("冥想入门", "Introduction")}
              </Button>
            </Link>
          </motion.div>
        </div>
        
        {/* 向下滚动提示 */}
        <motion.div 
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center ${isDarkTheme ? 'text-indigo-300/60' : 'text-blue-700/60'} cursor-pointer`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 2, duration: 1 },
            y: { delay: 2, duration: 2, repeat: Infinity, repeatType: "loop" }
          }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-xs mb-2 text-center">{t("了解更多", "Learn more")}</span>
          <ChevronDown size={20} />
        </motion.div>
      </section>
      
      {/* 核心理念部分 */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        {/* 背景效果 */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className={`absolute inset-0 ${isDarkTheme ? 'bg-gradient-to-b from-blue-950/30 to-indigo-950/50' : 'bg-gradient-to-b from-purple-100/50 to-blue-100/70'}`} />
          <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${isDarkTheme ? 'via-indigo-500/20' : 'via-blue-400/30'} to-transparent`} />
        </div>
        
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-light ${themeStyles.primaryText} mb-4`}>
              {t("探索内心的宁静", "Explore Inner Peace")}
            </h2>
            <p className={`${isDarkTheme ? 'text-indigo-200/70' : 'text-slate-600'} max-w-2xl mx-auto`}>
              {t(
                "周周冥想提供一个温暖的空间，让你在繁忙的生活中找到片刻的宁静与觉知。",
                "WeeklyZen provides a warm space for you to find moments of peace and awareness in your busy life."
              )}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* 核心价值 */}
            <motion.div 
              className={`${themeStyles.cardBackground} rounded-2xl p-8 backdrop-blur-md border ${themeStyles.cardBorder} shadow-lg ${isDarkTheme ? 'shadow-indigo-900/5' : 'shadow-blue-300/10'} relative overflow-hidden group`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              {/* 闪光效果 */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-${themeStyles.accentColor}/0 via-${themeStyles.accentColor}/20 to-${themeStyles.accentColor}/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-500 animate-tilt`}></div>
              <div className="relative">
                <div className={`w-12 h-12 rounded-full ${isDarkTheme ? 'bg-indigo-900/50' : 'bg-blue-100/80'} flex items-center justify-center mb-6`}>
                  <span className={`text-xl ${isDarkTheme ? 'text-indigo-300' : 'text-blue-600'}`}>✨</span>
                </div>
                <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-4`}>
                  {t("核心价值", "Core Values")}
                </h3>
                <p className={`${isDarkTheme ? 'text-indigo-200/70' : 'text-slate-600'} text-sm leading-relaxed mb-4`}>
                  {t("简单·纯粹·互助·可持续", "Simple · Pure · Mutual Aid · Sustainable")}
                </p>
                <p className={`${isDarkTheme ? 'text-indigo-200/70' : 'text-slate-600'} text-sm leading-relaxed`}>
                  {t("三无承诺：无收费/无宗教/无干扰", "Three promises: No fees / No religion / No interference")}
                </p>
              </div>
            </motion.div>
            
            {/* 参与方式 */}
            <motion.div 
              className={`${themeStyles.cardBackground} rounded-2xl p-8 backdrop-blur-md border ${themeStyles.cardBorder} shadow-lg ${isDarkTheme ? 'shadow-indigo-900/5' : 'shadow-blue-300/10'} relative overflow-hidden group`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* 闪光效果 */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-${themeStyles.accentColor}/0 via-${themeStyles.accentColor}/20 to-${themeStyles.accentColor}/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-500 animate-tilt`}></div>
              <div className="relative">
                <div className={`w-12 h-12 rounded-full ${isDarkTheme ? 'bg-indigo-900/50' : 'bg-blue-100/80'} flex items-center justify-center mb-6`}>
                  <span className={`text-xl ${isDarkTheme ? 'text-indigo-300' : 'text-blue-600'}`}>🧘</span>
                </div>
                <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-4`}>
                  {t("参与方式", "How to Join")}
                </h3>
                <p className={`${isDarkTheme ? 'text-indigo-200/70' : 'text-slate-600'} text-sm leading-relaxed mb-3`}>
                  {t("日常打卡: 工作日 7:30-8:00", "Daily Check-in: Weekdays 7:30-8:00")}
                </p>
                <p className={`${isDarkTheme ? 'text-indigo-200/70' : 'text-slate-600'} text-sm leading-relaxed`}>
                  {t("周末冥想: 每周六 10:00-13:00", "Weekend Meditation: Saturday 10:00-13:00")}
                </p>
              </div>
            </motion.div>
            
            {/* 资源链接 */}
            <motion.div 
              className={`${themeStyles.cardBackground} rounded-2xl p-8 backdrop-blur-md border ${themeStyles.cardBorder} shadow-lg ${isDarkTheme ? 'shadow-indigo-900/5' : 'shadow-blue-300/10'} relative overflow-hidden group`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* 闪光效果 */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-${themeStyles.accentColor}/0 via-${themeStyles.accentColor}/20 to-${themeStyles.accentColor}/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-500 animate-tilt`}></div>
              <div className="relative">
                <div className={`w-12 h-12 rounded-full ${isDarkTheme ? 'bg-indigo-900/50' : 'bg-blue-100/80'} flex items-center justify-center mb-6`}>
                  <span className={`text-xl ${isDarkTheme ? 'text-indigo-300' : 'text-blue-600'}`}>🔗</span>
                </div>
                <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-4`}>
                  {t("实用资源", "Resources")}
                </h3>
                <Link href="/meditation" className={`${isDarkTheme ? 'text-indigo-400 hover:text-indigo-300' : 'text-blue-400 hover:text-blue-300'} text-sm mb-3 block`}>
                  {t("冥想倒计时", "Meditation Timer")}
                </Link>
                <Link href="/introduction" className={`${isDarkTheme ? 'text-indigo-400 hover:text-indigo-300' : 'text-blue-400 hover:text-blue-300'} text-sm hover:text-blue-300`}>
                  {t("冥想入门指南", "Meditation Guide")}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* 引言部分 */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        {/* 背景效果 */}
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/50 to-indigo-950/30" />
          <motion.div 
            className="absolute inset-0 opacity-20"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: "linear",
            }}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%239C92AC" fill-opacity="0.1" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
        </div>
        
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bg-indigo-950/20 backdrop-blur-sm p-10 rounded-3xl border border-indigo-600/10 shadow-lg shadow-indigo-900/5"
          >
            <blockquote className="text-xl sm:text-2xl md:text-3xl font-light text-white/90 italic leading-relaxed">
              {t(
                "冥想就像是给大脑清理缓存，让你专注于真正重要的事情。",
                "Meditation is like clearing the cache for your brain, allowing you to focus on what really matters."
              )}
            </blockquote>
            <p className="mt-4 text-sm text-indigo-300/70">— Naval Ravikant</p>
          </motion.div>
        </div>
      </section>
      
      {/* 冥想益处 */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        {/* 背景效果 */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className={`absolute inset-0 ${isDarkTheme ? 'bg-gradient-to-b from-purple-950/30 to-blue-950/50' : 'bg-gradient-to-b from-purple-100/50 to-blue-100/70'}`} />
          <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${isDarkTheme ? 'via-indigo-500/20' : 'via-blue-400/30'} to-transparent`} />
        </div>
        
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-light ${themeStyles.primaryText} mb-4`}>
              {t("冥想如何助力创客？", "How Meditation Helps Makers")}
            </h2>
            <p className={`${isDarkTheme ? 'text-indigo-200/70' : 'text-slate-600'} max-w-2xl mx-auto`}>
              {t(
                "全球顶尖创客与企业家，如乔布斯、纳瓦尔，都将冥想视为保持巅峰状态的秘密武器。",
                "Top makers and entrepreneurs worldwide, like Steve Jobs and Naval Ravikant, see meditation as their secret weapon for peak performance."
              )}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              className={`p-6 border ${themeStyles.cardBorder} rounded-xl ${isDarkTheme ? 'bg-blue-950/20' : 'bg-white/70'} backdrop-blur-sm relative overflow-hidden group`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              {/* 悬停效果 */}
              <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-${isDarkTheme ? 'indigo-500' : 'blue-500'} to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              <div className={`text-3xl ${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mb-4`}>🚀</div>
              <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-2`}>{t("提升专注力", "Enhance Focus")}</h3>
              <p className={`text-sm ${isDarkTheme ? 'text-indigo-200/70' : 'text-slate-600'}`}>
                {t("减少分心，更快进入深度工作状态", "Reduce distractions, enter deep work states faster")}
              </p>
            </motion.div>
            
            <motion.div 
              className={`p-6 border ${themeStyles.cardBorder} rounded-xl ${isDarkTheme ? 'bg-blue-950/20' : 'bg-white/70'} backdrop-blur-sm relative overflow-hidden group`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* 悬停效果 */}
              <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-${isDarkTheme ? 'indigo-500' : 'blue-500'} to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              <div className={`text-3xl ${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mb-4`}>💡</div>
              <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-2`}>{t("激发创造力", "Spark Creativity")}</h3>
              <p className={`text-sm ${isDarkTheme ? 'text-indigo-200/70' : 'text-slate-600'}`}>
                {t("清空杂念，让灵感自然流动", "Clear your mind, let inspiration flow naturally")}
              </p>
            </motion.div>
            
            <motion.div 
              className={`p-6 border ${themeStyles.cardBorder} rounded-xl ${isDarkTheme ? 'bg-blue-950/20' : 'bg-white/70'} backdrop-blur-sm relative overflow-hidden group`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* 悬停效果 */}
              <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-${isDarkTheme ? 'indigo-500' : 'blue-500'} to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              <div className={`text-3xl ${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mb-4`}>😌</div>
              <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-2`}>{t("缓解压力", "Reduce Stress")}</h3>
              <p className={`text-sm ${isDarkTheme ? 'text-indigo-200/70' : 'text-slate-600'}`}>
                {t("高效管理情绪，保持思维清晰", "Manage emotions efficiently, maintain mental clarity")}
              </p>
            </motion.div>
            
            <motion.div 
              className={`p-6 border ${themeStyles.cardBorder} rounded-xl ${isDarkTheme ? 'bg-blue-950/20' : 'bg-white/70'} backdrop-blur-sm relative overflow-hidden group`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* 悬停效果 */}
              <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-${isDarkTheme ? 'indigo-500' : 'blue-500'} to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              <div className={`text-3xl ${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mb-4`}>🤝</div>
              <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-2`}>{t("增强协作力", "Improve Collaboration")}</h3>
              <p className={`text-sm ${isDarkTheme ? 'text-indigo-200/70' : 'text-slate-600'}`}>
                {t("培养耐心、理解与更开放的沟通方式", "Develop patience, understanding and open communication")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* 加入按钮 */}
      <section className="py-20 sm:py-28 mb-10 relative overflow-hidden">
        {/* 背景动画 */}
        <div className="absolute inset-0 -z-10">
          <div className={`absolute inset-0 ${isDarkTheme ? 'bg-gradient-to-b from-blue-950/50 to-indigo-950/80' : 'bg-gradient-to-b from-blue-100/70 to-indigo-100/50'}`} />
          <motion.div 
            className="absolute inset-0 opacity-10"
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ 
              duration: 60, 
              repeat: Infinity,
              repeatType: 'reverse',
              ease: "linear",
            }}
            style={{
              backgroundImage: isDarkTheme 
                ? `radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.4) 0%, transparent 50%),
                   radial-gradient(circle at 70% 60%, rgba(79, 70, 229, 0.4) 0%, transparent 50%),
                   radial-gradient(circle at 40% 80%, rgba(124, 58, 237, 0.4) 0%, transparent 50%),
                   radial-gradient(circle at 80% 20%, rgba(55, 48, 163, 0.4) 0%, transparent 50%)`
                : `radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
                   radial-gradient(circle at 70% 60%, rgba(37, 99, 235, 0.4) 0%, transparent 50%),
                   radial-gradient(circle at 40% 80%, rgba(29, 78, 216, 0.4) 0%, transparent 50%),
                   radial-gradient(circle at 80% 20%, rgba(30, 64, 175, 0.4) 0%, transparent 50%)`,
              backgroundSize: '200% 200%',
            }}
          />
        </div>
        
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-xl mx-auto"
          >
            <h2 className={`text-2xl sm:text-3xl font-light ${themeStyles.primaryText} mb-6`}>
              {t("加入周周冥想小组", "Join WeeklyZen Meditation Group")}
            </h2>
            <p className={`${isDarkTheme ? 'text-indigo-200/70' : 'text-slate-600'} mb-10`}>
              {t(
                "无论您是冥想新手还是有经验的练习者，我们都欢迎您加入我们的小组，一起探索内心的宁静。",
                "Whether you're new to meditation or an experienced practitioner, we welcome you to join our group and explore inner peace together."
              )}
            </p>
            <Link href="/introduction">
              <Button 
                size="lg" 
                className={`rounded-full px-8 py-6 ${
                  isDarkTheme
                    ? "border border-indigo-600/30 bg-indigo-950/95 text-indigo-100 hover:bg-indigo-900/95"
                    : "border border-blue-200/50 bg-white/95 text-blue-600 hover:bg-blue-50/95"
                } backdrop-blur-sm transition-all duration-200`}
              >
                <span className="relative z-10">{t("了解如何加入", "Learn How to Join")}</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* 页脚 */}
      <footer className={`py-12 border-t ${isDarkTheme ? 'border-blue-800/20' : 'border-blue-300/30'}`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <div className={`text-lg font-medium ${themeStyles.primaryText}`}>WeeklyZen</div>
              <div className={`text-sm ${isDarkTheme ? 'text-indigo-300/70' : 'text-slate-600'}`}>{t("周周冥想小组", "Weekly Meditation Group")}</div>
            </div>
            
            <div className={`text-sm ${isDarkTheme ? 'text-indigo-300/70' : 'text-slate-600'} text-center md:text-right`}>
              <p className="mb-2">© 2024 WeeklyZen</p>
              <p>{t("版权声明: CC BY-NC-SA 4.0", "License: CC BY-NC-SA 4.0")}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
