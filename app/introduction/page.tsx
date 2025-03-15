"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAppTheme } from "@/contexts/theme-context";
import { useIsMobile } from "@/hooks/use-mobile";

export default function IntroductionPage() {
  const { t, language } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const { isDarkTheme, themeStyles } = useAppTheme();
  const isMobile = useIsMobile();

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <div className={`min-h-screen ${themeStyles.background} ${themeStyles.text}`}>
      <SiteHeader scrolled={scrolled} />

      {/* 页面头部 */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        {/* 背景效果 */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className={`absolute inset-0 ${isDarkTheme ? 'bg-gradient-to-b from-blue-950/50 to-indigo-950/80' : 'bg-gradient-to-b from-blue-100/50 to-indigo-100/80'}`} />
          <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${isDarkTheme ? 'via-indigo-500/20' : 'via-blue-500/20'} to-transparent`} />
        </div>

        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-light ${themeStyles.primaryText} mb-6 leading-tight`}>
              {t("冥想入门", "Meditation Introduction")}
            </h1>
            <p className={themeStyles.secondaryText + " max-w-2xl mx-auto"}>
              {t(
                "探索冥想的基础知识、技巧和常见问题，开始您的内心之旅。",
                "Explore the basics, techniques, and FAQs about meditation to begin your journey inward."
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 内容区域 */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`${themeStyles.cardBackground} rounded-2xl p-8 md:p-12 backdrop-blur-md border ${themeStyles.cardBorder} shadow-lg ${isDarkTheme ? 'shadow-indigo-900/5' : 'shadow-blue-300/5'}`}
          >
            <div className={`prose ${isDarkTheme ? 'prose-invert' : ''} max-w-none prose-headings:font-light ${isDarkTheme ? 'prose-p:text-indigo-100/90' : 'prose-p:text-slate-700'} ${isDarkTheme ? 'prose-a:text-indigo-400 hover:prose-a:text-indigo-300' : 'prose-a:text-blue-600 hover:prose-a:text-blue-700'} ${isDarkTheme ? 'prose-strong:text-white' : 'prose-strong:text-slate-900'} prose-img:rounded-xl prose-img:shadow-lg`}>
              {/* 第一部分：什么是冥想 */}
              <h2 className={`text-2xl font-light ${themeStyles.primaryText} mb-6 pb-2 border-b ${isDarkTheme ? 'border-indigo-800/30' : 'border-blue-200/50'}`}>
                {t("什么是冥想？", "What is Meditation?")}
              </h2>
              <div className="mb-10 space-y-4">
                <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                  {t(
                    "冥想是一种精神训练，通过将注意力集中在特定对象、思想或活动上，来训练专注力和意识，从而达到精神上清晰平静的状态。",
                    "Meditation is a mental training that involves focusing your attention on a particular object, thought, or activity to train awareness and attention, achieving a mentally clear and emotionally calm state."
                  )}
                </p>
                <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                  {t(
                    "通过冥想，你可以清除心中的混乱，获得内心的平静。这就像是给大脑清理缓存，让你专注于真正重要的事情。",
                    "Through meditation, you can clear the clutter in your mind and gain inner peace. It's like clearing the cache for your brain, allowing you to focus on what really matters."
                  )}
                </p>
              </div>

              {/* 第二部分：冥想的好处 */}
              <h2 className={`text-2xl font-light ${themeStyles.primaryText} mb-6 pb-2 border-b ${isDarkTheme ? 'border-indigo-800/30' : 'border-blue-200/50'}`}>
                {t("冥想的好处", "Benefits of Meditation")}
              </h2>
              <div className="mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className={`${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                    <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-3`}>
                      {t("身体健康", "Physical Health")}
                    </h3>
                    <ul className={`space-y-2 ${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'}`}>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        {t("降低血压", "Lowers blood pressure")}
                      </li>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        {t("改善睡眠", "Improves sleep")}
                      </li>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        {t("减轻疼痛", "Reduces pain")}
                      </li>
                    </ul>
                  </div>
                  <div className={`${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                    <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-3`}>
                      {t("心理健康", "Mental Health")}
                    </h3>
                    <ul className={`space-y-2 ${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'}`}>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        {t("减轻压力和焦虑", "Reduces stress and anxiety")}
                      </li>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        {t("增强注意力和集中力", "Enhances attention and focus")}
                      </li>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        {t("提升情绪", "Improves mood")}
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                    <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-3`}>
                      {t("认知功能", "Cognitive Function")}
                    </h3>
                    <ul className={`space-y-2 ${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'}`}>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        {t("提高创造力", "Increases creativity")}
                      </li>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        {t("改善决策能力", "Improves decision-making")}
                      </li>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        {t("增强记忆力", "Enhances memory")}
                      </li>
                    </ul>
                  </div>
                  <div className={`${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                    <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-3`}>
                      {t("情感管理", "Emotional Management")}
                    </h3>
                    <ul className={`space-y-2 ${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'}`}>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        {t("增强自我意识", "Increases self-awareness")}
                      </li>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        {t("培养同理心", "Develops empathy")}
                      </li>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        {t("增强耐心和宽容", "Increases patience and tolerance")}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 第三部分：如何开始冥想 */}
              <h2 className={`text-2xl font-light ${themeStyles.primaryText} mb-6 pb-2 border-b ${isDarkTheme ? 'border-indigo-800/30' : 'border-blue-200/50'}`}>
                {t("如何开始冥想", "How to Start Meditating")}
              </h2>
              <div className="mb-10 space-y-8">
                <div className="relative pl-8 border-l-2 border-indigo-500/30">
                  <span className="absolute left-[-15px] top-0 w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-indigo-300">1</span>
                  <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-2`}>
                    {t("选择一个安静的地方", "Choose a Quiet Space")}
                  </h3>
                  <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                    {t(
                      "找一个不会被打扰的安静地方。可以坐在椅子上、地板上或是瑜伽垫上，保持背部挺直但不紧张。",
                      "Find a quiet place where you won't be disturbed. You can sit on a chair, on the floor, or on a yoga mat, keeping your back straight but not tense."
                    )}
                  </p>
                </div>
                
                <div className="relative pl-8 border-l-2 border-indigo-500/30">
                  <span className="absolute left-[-15px] top-0 w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-indigo-300">2</span>
                  <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-2`}>
                    {t("定一个短时间", "Set a Short Time")}
                  </h3>
                  <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                    {t(
                      "初学者可以从 5-10 分钟开始，随着练习逐渐延长时间。设置一个温和的闹钟，以便不用担心时间。",
                      "Beginners can start with 5-10 minutes and gradually extend the time as you practice. Set a gentle alarm so you don't have to worry about timing."
                    )}
                  </p>
                </div>
                
                <div className="relative pl-8 border-l-2 border-indigo-500/30">
                  <span className="absolute left-[-15px] top-0 w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-indigo-300">3</span>
                  <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-2`}>
                    {t("关注呼吸", "Focus on Your Breath")}
                  </h3>
                  <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                    {t(
                      "闭上眼睛，关注呼吸的自然节奏。感受空气进入和离开你的身体。如果思绪游走，温和地将注意力带回呼吸。",
                      "Close your eyes and focus on the natural rhythm of your breath. Feel the air entering and leaving your body. If your mind wanders, gently bring your attention back to your breath."
                    )}
                  </p>
                </div>
                
                <div className="relative pl-8 border-l-2 border-indigo-500/30">
                  <span className="absolute left-[-15px] top-0 w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-indigo-300">4</span>
                  <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-2`}>
                    {t("保持耐心", "Be Patient")}
                  </h3>
                  <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                    {t(
                      "冥想是一种技能，需要时间来发展。不要对分心感到沮丧，这是正常的。关键是注意到分心，然后重新回到呼吸上。",
                      "Meditation is a skill that takes time to develop. Don't feel frustrated about distractions, they're normal. The key is to notice when you're distracted and then return to your breath."
                    )}
                  </p>
                </div>
              </div>

              {/* 第四部分：常见问题 */}
              <h2 className={`text-2xl font-light ${themeStyles.primaryText} mb-6 pb-2 border-b ${isDarkTheme ? 'border-indigo-800/30' : 'border-blue-200/50'}`}>
                {t("常见问题", "Frequently Asked Questions")}
              </h2>
              <div className="mb-10 space-y-6">
                <div className={`${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                  <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-2`}>
                    {t("我的思绪一直在游走，我做错了吗？", "My mind keeps wandering, am I doing it wrong?")}
                  </h3>
                  <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                    {t(
                      "完全没有！心智游走是正常的，每个人都会经历。冥想的要点不是消除想法，而是注意到想法并温和地将注意力拉回呼吸或其他焦点上。",
                      "Not at all! Mind-wandering is normal and happens to everyone. The point of meditation is not to eliminate thoughts, but to notice them and gently bring your attention back to your breath or other focus."
                    )}
                  </p>
                </div>
                
                <div className={`${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                  <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-2`}>
                    {t("我应该多久冥想一次？", "How often should I meditate?")}
                  </h3>
                  <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                    {t(
                      "理想情况下，每天冥想都会带来最大的收益。但即使每周只冥想几次，也能带来好处。关键是保持一致性，哪怕时间很短。",
                      "Ideally, daily meditation will bring the most benefits. But even meditating a few times a week can be beneficial. The key is consistency, even if it's for a short time."
                    )}
                  </p>
                </div>
                
                <div className={`${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                  <h3 className={`text-lg font-medium ${themeStyles.primaryText} mb-2`}>
                    {t("冥想需要特殊装备吗？", "Do I need special equipment to meditate?")}
                  </h3>
                  <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                    {t(
                      "不需要！虽然有些人喜欢使用冥想垫或凳子，但冥想只需要一个安静的地方和舒适的坐姿。",
                      "No! While some people like to use meditation cushions or benches, all you need for meditation is a quiet place and a comfortable sitting position."
                    )}
                  </p>
                </div>
              </div>

              {/* 引导冥想 */}
              <div className={`${isDarkTheme ? 'bg-indigo-900/30' : 'bg-blue-50/80'} p-8 rounded-2xl border ${isDarkTheme ? 'border-indigo-600/20' : 'border-blue-200/50'} mb-10`}>
                <h2 className={`text-2xl font-light ${themeStyles.primaryText} mb-4`}>
                  {t("准备好开始冥想了吗？", "Ready to Start Meditating?")}
                </h2>
                <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed mb-6`}>
                  {t(
                    "尝试我们的引导冥想，让您轻松进入冥想状态。",
                    "Try our guided meditation to help you easily enter a meditative state."
                  )}
                </p>
                <Link href="/meditation">
                  <Button
                    className={`px-8 py-2 rounded-full ${
                      isDarkTheme 
                        ? "border border-blue-500/50 bg-blue-600/95 text-indigo-100 hover:bg-blue-400/95"
                        : "border border-blue-500/50 bg-blue-600/95 text-indigo-100 hover:bg-blue-400/95"
                    } backdrop-blur-sm transition-all duration-200`}
                  >
                    {t("开始冥想", "Start Meditating")}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 