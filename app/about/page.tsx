"use client";
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-200/50 to-green-400/30" />
          <Image
            src="/images/boy-meditation.jpg"
            alt="冥想背景"
            fill
            className="object-cover mix-blend-overlay"
            priority
          />
        </div>
        <div className="relative z-10 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            关于我们
          </motion.h1>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-16 bg-gradient-to-br from-green-50/50 to-green-100/50">
        {/* Introduction */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-6">冥想的起源与意义</h2>
          <div className="prose prose-lg">
            <p className="text-muted-foreground leading-relaxed mb-4">
              冥想的历史可以追溯到数千年前，最早出现在古印度。作为一种心灵修行方式，
              冥想帮助人们培养专注力、减轻压力、提高情绪管理能力，并获得内心的平静。
            </p>
            <p className="text-muted-foreground leading-relaxed">
              在现代社会，冥想已经成为一种科学认可的方法，被广泛应用于心理健康、压力管理和个人成长等领域。
              越来越多的研究表明，持续的冥想练习能够带来诸多积极影响。
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">冥想的益处</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">减轻压力</h3>
              <p className="text-muted-foreground">
                通过冥想，您可以学会更好地应对日常压力，保持心理平衡。
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">提升专注力</h3>
              <p className="text-muted-foreground">
                规律的冥想练习能够增强注意力，提高工作和学习效率。
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">改善睡眠</h3>
              <p className="text-muted-foreground">
                冥想有助于放松身心，改善睡眠质量，让您享受更好的休息。
              </p>
            </Card>
          </div>
        </section>

        {/* Join Meditation Group */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-6">加入冥想小组</h2>
          <div className="prose prose-lg">
            <p className="text-muted-foreground leading-relaxed mb-4">
              我们的冥想小组每周举办线上冥想活动，由经验丰富的导师带领大家一起练习。
              无论您是初学者还是有经验的练习者，都可以在这里找到适合自己的练习方式。
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              加入我们，您将获得：
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-6">
              <li>专业导师的个性化指导</li>
              <li>定期的线上冥想活动</li>
              <li>与志同道合者交流的机会</li>
              <li>丰富的冥想资源和教材</li>
            </ul>
          </div>
          <div className="text-center">
            <Button size="lg" className="text-lg px-8">
              立即加入小组
            </Button>
          </div>
        </section>

        {/* Contact Information */}
        <section className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">联系我们</h2>
          <p className="text-muted-foreground mb-4">
            如果您有任何问题或建议，欢迎随时与我们联系
          </p>
          <p className="text-muted-foreground">
            邮箱：contact@meditation.com<br />
            微信公众号：每日冥想
          </p>
        </section>
      </div>
    </div>
  )
}
