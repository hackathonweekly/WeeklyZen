"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-indigo-950 text-white">
      <SiteHeader scrolled={scrolled} />

      {/* 页面头部 */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        {/* 背景效果 */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/50 to-indigo-950/80" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-6 leading-tight">
              {t("关于周周冥想", "About WeeklyZen")}
            </h1>
            <p className="text-indigo-200/70 max-w-2xl mx-auto">
              {t(
                "探索我们的故事、使命和价值观，了解我们如何将冥想带入创客社区。",
                "Explore our story, mission, and values, and learn how we bring meditation to the maker community."
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
            className="bg-indigo-950/30 rounded-2xl p-8 md:p-12 backdrop-blur-md border border-indigo-600/10 shadow-lg shadow-indigo-900/5"
          >
            <div className="prose prose-invert max-w-none prose-headings:font-light prose-p:text-indigo-100/90 prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-strong:text-white prose-img:rounded-xl prose-img:shadow-lg">
              {/* 我们是谁 */}
              <h2 className="text-2xl font-light text-white mb-6 pb-2 border-b border-indigo-800/30">
                {t("我们是谁", "Who We Are")}
              </h2>
              <div className="mb-10 space-y-4">
                <p className="text-indigo-100/90 leading-relaxed">
                  {t(
                    "周周冥想是周周黑客松社区下的一个专注纯粹冥想练习的温暖小组，致力于为创客和开发者提供一个简单、可持续的冥想空间。",
                    "WeeklyZen is a warm meditation group under the Weekly Hackathon community, dedicated to providing a pure meditation practice space for makers and developers."
                  )}
                </p>
                <p className="text-indigo-100/90 leading-relaxed">
                  {t(
                    "通过线上线下结合的方式，我们希望将冥想文化融入创客社区，帮助大家在创新与协作中找到内心的平衡与力量。",
                    "Through both online and offline activities, we aim to integrate meditation culture into the maker community, helping everyone find inner balance and strength in innovation and collaboration."
                  )}
                </p>
              </div>

              {/* 核心价值 */}
              <h2 className="text-2xl font-light text-white mb-6 pb-2 border-b border-indigo-800/30">
                {t("核心价值", "Core Values")}
              </h2>
              <div className="mb-10">
                <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-600/10 mb-8">
                  <h3 className="text-xl font-medium text-white mb-3 text-center">
                    {t("简单·纯粹·互助·可持续", "Simple · Pure · Mutual Aid · Sustainable")}
                  </h3>
                  <div className="h-px w-1/2 bg-indigo-500/20 mx-auto my-4"></div>
                  <p className="text-center text-indigo-200/70">
                    {t("三无承诺：无收费/无宗教/无干扰（不讨论与冥想无关内容）", "Three promises: No fees / No religion / No interference (no discussion of content unrelated to meditation)")}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-600/10">
                    <h3 className="text-xl font-medium text-white mb-3">
                      {t("简单", "Simple")}
                    </h3>
                    <p className="text-indigo-100/90">
                      {t(
                        "我们相信最简单的方法往往最有效。冥想不需要复杂的仪式或高深的理论，只需要持续的练习和专注的态度。",
                        "We believe the simplest methods are often the most effective. Meditation doesn't require complex rituals or profound theories, just consistent practice and a focused attitude."
                      )}
                    </p>
                  </div>
                  <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-600/10">
                    <h3 className="text-xl font-medium text-white mb-3">
                      {t("纯粹", "Pure")}
                    </h3>
                    <p className="text-indigo-100/90">
                      {t(
                        "我们专注于冥想本身，而不是附加的各种理念。冥想是一种工具和方法，而不是一种信仰或教条。",
                        "We focus on meditation itself, not on various attached ideologies. Meditation is a tool and method, not a belief or dogma."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* 参与方式 */}
              <h2 className="text-2xl font-light text-white mb-6 pb-2 border-b border-indigo-800/30">
                {t("参与方式", "How to Participate")}
              </h2>
              <div className="mb-10 space-y-8">
                <div className="relative pl-8 border-l-2 border-indigo-500/30">
                  <span className="absolute left-[-15px] top-0 w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-indigo-300">1</span>
                  <h3 className="text-xl font-medium text-white mb-2">
                    {t("日常打卡", "Daily Check-in")}
                  </h3>
                  <div className="space-y-2 text-indigo-100/90">
                    <p className="flex items-center">
                      <span className="font-medium text-white mr-2">{t("时间：", "Time: ")}</span>
                      {t("工作日 7:30-8:00", "Weekdays 7:30-8:00")}
                    </p>
                    <p className="flex items-start">
                      <span className="font-medium text-white mr-2">{t("仪式感：", "Ceremony: ")}</span>
                      <span>
                        {t("开启摄像头轻监督 + 静音（支架拍摄半身画面，可不露脸）", "Turn on camera for light supervision + mute (bracket for half-body frame, face optional)")}
                      </span>
                    </p>
                    <p className="flex items-start">
                      <span className="font-medium text-white mr-2">{t("流程：", "Process: ")}</span>
                      <span>
                        {t("30 分钟静坐冥想（音频引导），结束后自由交流或静默离场", "30 minutes of sitting meditation (audio guidance), followed by free communication or silent departure")}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="relative pl-8 border-l-2 border-indigo-500/30">
                  <span className="absolute left-[-15px] top-0 w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-indigo-300">2</span>
                  <h3 className="text-xl font-medium text-white mb-2">
                    {t("周末冥想活动", "Weekend Meditation Activity")}
                  </h3>
                  <p className="text-indigo-100/90 mb-4">
                    {t("每周末我们还会组织线下或线上的集体冥想活动！日常打卡是小清洁，那么周末冥想就是大扫除！", "Every weekend, we organize offline or online group meditation activities! If daily check-in is light cleaning, weekend meditation is a deep clean!")}
                  </p>
                  <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-600/10">
                    <h4 className="font-medium text-white mb-2">
                      {t("线下周末冥想活动", "Offline Weekend Meditation")}
                    </h4>
                    <div className="space-y-2 text-indigo-100/90">
                      <p className="flex items-center">
                        <span className="font-medium text-white mr-2">{t("时间：", "Time: ")}</span>
                        {t("每周六 10:00-13:00", "Every Saturday 10:00-13:00")}
                      </p>
                      <p className="flex items-center">
                        <span className="font-medium text-white mr-2">{t("地点：", "Location: ")}</span>
                        {t("深圳南山（其他城市待定）", "Shenzhen Nanshan (other cities to be determined)")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 冥想的好处 */}
              <h2 className="text-2xl font-light text-white mb-6 pb-2 border-b border-indigo-800/30">
                {t("冥想的好处", "Benefits of Meditation")}
              </h2>
              <div className="mb-10">
                <p className="text-indigo-100/90 leading-relaxed mb-6">
                  {t(
                    "在硅谷，冥想早已成为了生活方式和生产力工具。从乔布斯到谷歌，从火人节的冥想营地到硅谷创业者的日常实践，冥想正在改变人们的工作方式和生活态度。",
                    "In Silicon Valley, meditation has become a lifestyle and productivity tool. From Steve Jobs to Google, from the meditation camps at Burning Man to the daily practices of Silicon Valley entrepreneurs, meditation is changing the way people work and live."
                  )}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-600/10">
                    <h3 className="text-xl font-medium text-white mb-3">
                      {t("提升专注力", "Enhance Focus")}
                    </h3>
                    <p className="text-indigo-100/90">
                      {t(
                        "冥想训练可以帮助你减少分心，更快进入深度工作状态，提高工作效率。",
                        "Meditation training can help you reduce distractions, enter deep work states faster, and improve work efficiency."
                      )}
                    </p>
                  </div>
                  <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-600/10">
                    <h3 className="text-xl font-medium text-white mb-3">
                      {t("激发创造力", "Inspire Creativity")}
                    </h3>
                    <p className="text-indigo-100/90">
                      {t(
                        "通过清空杂念，你可以让灵感自然流动，发现新的创意和解决方案。",
                        "By clearing the mind, you can let inspiration flow naturally, discovering new ideas and solutions."
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-600/10">
                    <h3 className="text-xl font-medium text-white mb-3">
                      {t("缓解压力", "Relieve Stress")}
                    </h3>
                    <p className="text-indigo-100/90">
                      {t(
                        "冥想可以帮助你更好地管理情绪，减轻压力和焦虑，保持思维清晰。",
                        "Meditation can help you better manage emotions, reduce stress and anxiety, and maintain clear thinking."
                      )}
                    </p>
                  </div>
                  <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-600/10">
                    <h3 className="text-xl font-medium text-white mb-3">
                      {t("增强协作力", "Strengthen Collaboration")}
                    </h3>
                    <p className="text-indigo-100/90">
                      {t(
                        "冥想可以培养耐心、理解与同理心，帮助你建立更开放的沟通方式。",
                        "Meditation can cultivate patience, understanding and empathy, helping you establish more open communication methods."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* 加入我们 */}
              <div className="bg-indigo-900/30 p-8 rounded-2xl border border-indigo-600/20">
                <h2 className="text-2xl font-light text-white mb-4 text-center">
                  {t("加入我们", "Join Us")}
                </h2>
                <p className="text-indigo-100/90 leading-relaxed text-center mb-6">
                  {t(
                    "想加入周周冥想小组？请先完成十分钟冥想入门指引，然后联系我们的小助手。",
                    "Want to join the WeeklyZen group? Please complete the ten-minute meditation introduction guide first, then contact our assistant."
                  )}
                </p>
                <div className="flex justify-center flex-wrap gap-4">
                  <Link href="/introduction">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-2">
                      {t("冥想入门指引", "Meditation Introduction Guide")}
                    </Button>
                  </Link>
                  <Link href="/meditation">
                    <Button variant="outline" className="border-indigo-500/50 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-950/50 rounded-full px-8 py-2">
                      {t("开始冥想", "Start Meditation")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
