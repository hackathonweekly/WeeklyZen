"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAppTheme } from "@/contexts/theme-context";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AboutPage() {
  const { t } = useLanguage();
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
          
          {/* 添加星空效果 */}
          <div className="absolute inset-0 opacity-60">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 2 + 1 + 'px',
                  height: Math.random() * 2 + 1 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-light ${themeStyles.primaryText} mb-6 leading-tight`}>
              {t("关于我们", "About Us")}
            </h1>
            <p className={themeStyles.secondaryText + " max-w-2xl mx-auto"}>
              {t(
                "了解周周冥想小组的理念、历史和参与方式",
                "Learn about the philosophy, history, and how to participate in WeeklyZen"
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
            {/* 第一部分：我们的故事 */}
            <div className="mb-12">
              <h2 className={`text-2xl font-light ${themeStyles.primaryText} mb-6 pb-2 border-b ${isDarkTheme ? 'border-indigo-800/30' : 'border-blue-200/50'}`}>
                {t("我们的故事", "Our Story")}
              </h2>
              <div className="space-y-4">
                <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                  {t(
                    "周周冥想起源于2021年，一群热爱冥想的创客和开发者在讨论如何将冥想融入忙碌的工作生活中。我们注意到许多开发者面临压力、注意力分散等挑战，而冥想正是解决这些问题的有效方法。",
                    "WeeklyZen began in 2021 when a group of meditation enthusiasts who were also makers and developers discussed how to integrate meditation into busy work lives. We noticed that many developers face challenges such as stress and attention fragmentation, and meditation is an effective way to address these issues."
                  )}
                </p>
                <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                  {t(
                    "从最初的几个人开始，我们逐渐发展成为一个温暖的社区，每周在线上和线下共同练习冥想。我们的目标是创建一个简单、纯粹、可持续的冥想空间，帮助每个人在日常生活中培养正念和专注力。",
                    "Starting with just a few people, we have gradually grown into a warm community, practicing meditation together online and offline every week. Our goal is to create a simple, pure, and sustainable meditation space to help everyone cultivate mindfulness and focus in daily life."
                  )}
                </p>
              </div>
            </div>

            {/* 第二部分：我们的价值观 */}
            <div className="mb-12">
              <h2 className={`text-2xl font-light ${themeStyles.primaryText} mb-6 pb-2 border-b ${isDarkTheme ? 'border-indigo-800/30' : 'border-blue-200/50'}`}>
                {t("我们的价值观", "Our Values")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                  <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-3`}>
                    {t("简单与纯粹", "Simplicity & Purity")}
                  </h3>
                  <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                    {t(
                      "我们相信冥想应该是简单易行的，不需要复杂的仪式或设备。我们专注于呼吸和专注力练习的核心，使冥想变得容易上手和坚持。",
                      "We believe meditation should be simple and actionable, without complex rituals or equipment. We focus on the core of breathing and concentration practices, making meditation easy to start and maintain."
                    )}
                  </p>
                </div>
                <div className={`${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                  <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-3`}>
                    {t("互助与社区", "Mutual Support & Community")}
                  </h3>
                  <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                    {t(
                      "共同练习比独自练习更有力量。我们鼓励成员之间相互支持、分享经验，一起成长。社区的力量让我们每个人都能在冥想道路上走得更远。",
                      "Practicing together is more powerful than practicing alone. We encourage members to support each other, share experiences, and grow together. The power of community allows each of us to go further on the path of meditation."
                    )}
                  </p>
                </div>
                <div className={`${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                  <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-3`}>
                    {t("可持续与一致", "Sustainability & Consistency")}
                  </h3>
                  <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                    {t(
                      "我们注重培养可持续的冥想习惯，而不是短暂的热情。每天5分钟的一致练习胜过偶尔的长时间冥想。我们帮助成员建立适合自己生活节奏的冥想习惯。",
                      "We focus on cultivating sustainable meditation habits rather than temporary enthusiasm. Consistent 5-minute daily practice is better than occasional long meditation sessions. We help members establish meditation habits that fit their own life rhythms."
                    )}
                  </p>
                </div>
                <div className={`${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                  <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-3`}>
                    {t("非商业与开放", "Non-commercial & Open")}
                  </h3>
                  <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed`}>
                    {t(
                      "周周冥想是一个非商业性的开放社区，我们不收取任何费用，也不推广任何特定的宗教或意识形态。我们欢迎任何有兴趣的人加入，无论背景或经验如何。",
                      "WeeklyZen is a non-commercial open community. We don't charge any fees, nor do we promote any specific religion or ideology. We welcome anyone interested to join, regardless of background or experience."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* 第三部分：如何参与 */}
            <div className="mb-12">
              <h2 className={`text-2xl font-light ${themeStyles.primaryText} mb-6 pb-2 border-b ${isDarkTheme ? 'border-indigo-800/30' : 'border-blue-200/50'}`}>
                {t("如何参与", "How to Participate")}
              </h2>
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className={`flex-1 ${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                    <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-3`}>
                      {t("线上活动", "Online Activities")}
                    </h3>
                    <ul className={`space-y-3 ${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'}`}>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        <div>
                          <strong>{t("每日打卡", "Daily Check-in")}</strong>
                          <p>{t("工作日 7:30-8:00，通过微信群或Discord进行", "Weekdays 7:30-8:00, via WeChat group or Discord")}</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        <div>
                          <strong>{t("线上分享会", "Online Sharing Session")}</strong>
                          <p>{t("每周四 21:00-22:00，分享冥想经验和学习", "Thursday 21:00-22:00, sharing meditation experiences and learning")}</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className={`flex-1 ${isDarkTheme ? 'bg-indigo-900/20' : 'bg-blue-50/80'} p-6 rounded-xl border ${isDarkTheme ? 'border-indigo-600/10' : 'border-blue-200/50'}`}>
                    <h3 className={`text-xl font-medium ${themeStyles.primaryText} mb-3`}>
                      {t("线下活动", "Offline Activities")}
                    </h3>
                    <ul className={`space-y-3 ${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'}`}>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        <div>
                          <strong>{t("周末冥想坐", "Weekend Meditation")}</strong>
                          <p>{t("每周六 10:00-13:00，在北京、上海等城市有线下场地", "Saturday 10:00-13:00, with offline venues in cities like Beijing and Shanghai")}</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className={`${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'} mr-2`}>•</span>
                        <div>
                          <strong>{t("冥想工作坊", "Meditation Workshop")}</strong>
                          <p>{t("每月一次，由资深冥想练习者带领", "Once a month, led by experienced meditation practitioners")}</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 加入我们 */}
            <div className={`${isDarkTheme ? 'bg-indigo-900/30' : 'bg-blue-50/80'} p-8 rounded-2xl border ${isDarkTheme ? 'border-indigo-600/20' : 'border-blue-200/50'} mb-10 text-center`}>
              <h2 className={`text-2xl font-light ${themeStyles.primaryText} mb-4`}>
                {t("加入我们", "Join Us")}
              </h2>
              <p className={`${isDarkTheme ? 'text-indigo-100/90' : 'text-slate-700'} leading-relaxed mb-6 max-w-2xl mx-auto`}>
                {t(
                  "无论您是冥想新手还是有经验的练习者，我们都欢迎您加入周周冥想小组，一起探索内心的宁静。扫描下方二维码或发送邮件至 contact@weeklyzen.com",
                  "Whether you're new to meditation or an experienced practitioner, we welcome you to join the WeeklyZen group and explore inner peace together. Scan the QR code below or send an email to contact@weeklyzen.com"
                )}
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/meditation">
                  <Button
                    variant="outline"
                    className={`px-8 py-2 rounded-full ${
                      isDarkTheme 
                        ? " bg-blue-600/95 text-indigo-100 hover:bg-blue-400/95"
                        : " bg-blue-600/95 text-indigo-100 hover:bg-blue-400/95"
                    } backdrop-blur-sm transition-all duration-200`}
                  >
                    {t("开始冥想", "Start Meditating")}
                  </Button>
                </Link>
                <Link href="/introduction">
                  <Button variant="outline" className={`px-8 py-2 rounded-full ${isDarkTheme ? 'text-indigo-300 border-indigo-600/30 hover:bg-indigo-950/50' : 'text-blue-600 border-blue-300/50 hover:bg-blue-50'}`}>
                    {t("了解更多", "Learn More")}
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
