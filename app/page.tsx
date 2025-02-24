'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useEffect, useRef } from 'react'

// 粒子动效组件
const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const particlesRef = useRef<any[]>([])
  const animationFrameRef = useRef<number>()

  // 初始化画布和粒子
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    contextRef.current = context

    // 设置画布尺寸为全屏
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 创建粒子
    const createParticles = () => {
      particlesRef.current = []
      const numberOfParticles = Math.floor(
        (canvas.width * canvas.height) / 15000
      )

      for (let i = 0; i < numberOfParticles; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1 + 0.5,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          hue: Math.random() * 60 - 30, // 色相变化范围
        })
      }
    }

    createParticles()
    window.addEventListener('resize', createParticles)

    // 动画循环
    const animate = () => {
      if (!contextRef.current) return

      // 创建渐变透明效果
      contextRef.current.fillStyle = 'rgba(0, 0, 0, 0.05)'
      contextRef.current.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle, index) => {
        // 更新粒子位置
        particle.x += particle.speedX
        particle.y += particle.speedY

        // 边界检查
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

        // 绘制粒子
        const baseHue = (Date.now() / 50) % 360 // 基础色相随时间变化
        contextRef.current.beginPath()
        contextRef.current.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        )
        contextRef.current.fillStyle = `hsla(${baseHue + particle.hue}, 70%, 70%, 0.8)`
        contextRef.current.fill()

        // 连接临近粒子
        for (let j = index + 1; j < particlesRef.current.length; j++) {
          const dx = particle.x - particlesRef.current[j].x
          const dy = particle.y - particlesRef.current[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            contextRef.current.beginPath()
            contextRef.current.strokeStyle = `hsla(${baseHue + particle.hue}, 70%, 70%, ${0.2 * (1 - distance / 100)})`
            contextRef.current.lineWidth = 0.5
            contextRef.current.moveTo(particle.x, particle.y)
            contextRef.current.lineTo(
              particlesRef.current[j].x,
              particlesRef.current[j].y
            )
            contextRef.current.stroke()
          }
        }
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // 清理函数
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('resize', createParticles)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      style={{ background: 'black' }}
    />
  )
}

export default function IndexPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ParticleCanvas />
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <Link
              href="/"
              className="text-lg font-semibold text-emerald-700 transition-colors hover:text-emerald-600 md:text-xl"
            >
              WeeklyZen.Club
              <span className="hidden text-emerald-600/80 sm:inline">
                {' '}
                · 周周冥想小组
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-4 md:space-x-6">
              <Link
                // href="/about"
                href="https://hackathonweekly.feishu.cn/wiki/space/7468108015674425346?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home"
                className="text-sm text-gray-600 transition-colors hover:text-emerald-600 md:text-base"
              >
                关于我们
              </Link>
              <Link
                href="https://hackathonweekly.feishu.cn/wiki/NyJBwc3AsiHI5Gko2Z2cTBIqnCg"
                className="text-sm text-gray-600 transition-colors hover:text-emerald-600 md:text-base"
              >
                冥想入门
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Add padding top to account for fixed header */}
      <div className="pt-16"></div>
      {/* Hero Section */}
      <section className="relative flex h-screen items-center justify-center">
        <ParticleCanvas />
        {/* <div className="absolute inset-0 z-0">
          <Image
            src="/images/boy-meditation.jpg"
            alt="冥想背景"
            fill
            className="object-cover object-[70%_center] md:object-center"
            priority
          />
        </div> */}
        <div className="relative z-30 w-full max-w-4xl px-4 text-center md:px-8">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br backdrop-blur-md" />
            <div className="absolute inset-0" />
            <div className="relative z-10 p-6 text-center md:p-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-4 text-3xl font-medium leading-tight tracking-wide text-white drop-shadow-lg sm:text-4xl md:mb-6 md:text-6xl"
              >
                开启您的冥想之旅
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6 text-base font-medium tracking-wide text-white drop-shadow-lg sm:text-lg md:mb-10 md:text-xl"
              >
                让内心平静，找回生活的平衡
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <Link
                  href="/meditation"
                  className="relative z-10 inline-block w-full sm:w-auto"
                >
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full rounded-full  px-8 py-4 text-base   shadow-lg transition-all duration-300 hover:bg-emerald-700 hover:shadow-xl sm:w-auto sm:px-12 sm:py-6 sm:text-lg"
                  >
                    开始冥想
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold md:mb-12 md:text-3xl">
            关于冥想小组
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
            <Card className="p-6">
              <h3 className="mb-4 text-xl font-semibold">每周聚会</h3>
              <p className="text-muted-foreground">
                我们每周举行线上冥想聚会，共同练习和分享冥想体验。
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="mb-4 text-xl font-semibold">专业指导</h3>
              <p className="text-muted-foreground">
                经验丰富的导师提供个性化指导，帮助您更好地理解和实践冥想。
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="mb-4 text-xl font-semibold">社区支持</h3>
              <p className="text-muted-foreground">
                加入我们的社区，与志同道合的伙伴一起成长。
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-br from-green-100 to-green-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">常见问题</h2>
          <Accordion type="single" collapsible className="mx-auto max-w-2xl">
            <AccordionItem value="item-1">
              <AccordionTrigger>冥想对初学者来说难吗？</AccordionTrigger>
              <AccordionContent>
                不会很难。我们为初学者准备了简单的引导冥想，通过循序渐进的方式帮助您掌握基本技巧。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>每天需要冥想多长时间？</AccordionTrigger>
              <AccordionContent>
                建议初学者从每天5-10分钟开始，随着练习逐渐增加时间。关键是保持规律性，而不是时间长短。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>如何加入冥想小组？</AccordionTrigger>
              <AccordionContent>
                您可以通过网站报名参加我们的线上活动，或者关注我们的社交媒体获取最新活动信息。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-8 text-3xl font-bold">加入我们</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            无论您是冥想新手还是有经验的练习者，我们都欢迎您加入我们的社区。
            一起探索内心的平静，提升生活品质。
          </p>
          <Button size="lg" className="px-8 text-lg">
            立即加入
          </Button>
        </div>
      </section>
    </div>
  )
}
