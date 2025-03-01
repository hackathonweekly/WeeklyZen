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
import _ from 'lodash'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

export default function IndexPage() {
  // 添加canvas的ref
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 添加useEffect来初始化canvas
  useEffect(() => {
    const loadCanvasScripts = async () => {
      try {
        // 在window上挂载lodash
        if (typeof window !== 'undefined') {
          window._ = _
        }

        // 加载 canvasClass.js
        const canvasClassScript = document.createElement('script')
        canvasClassScript.src = '/canvasClass.js'
        await new Promise((resolve, reject) => {
          canvasClassScript.onload = resolve
          canvasClassScript.onerror = reject
          document.body.appendChild(canvasClassScript)
        })

        // 初始化 canvas
        if (canvasRef.current && window.DameDaneParticle) {
          new window.DameDaneParticle(canvasRef.current, {
            src: '/images/particle.png', // 更新图片路径
            renderX: window.innerWidth / 2 - 450,
            renderY: window.innerHeight / 2 - 400,
            w: '900px',
            size: 1,
            spacing: 1,
            validColor: {
              min: 300,
              max: 765,
              invert: false,
              excludeText: 'HIS BREATH',
              solidColor: '#FFFFFF',
            },
            effectParticleMode: 'adsorption',
            Thickness: 25,
          })
        }
      } catch (error) {
        console.error('Failed to load canvas:', error)
      }
    }

    loadCanvasScripts()

    // 清理函数
    return () => {
      // 移除脚本
      const scripts = document.querySelectorAll('script')
      scripts.forEach((script) => {
        if (script.src.includes('canvasClass.js')) {
          document.body.removeChild(script)
        }
      })
    }
  }, [])

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="text-lg font-semibold transition-colors hover:text-primary"
            >
              WeeklyZen.Club
              <span className="hidden text-muted-foreground sm:inline">
                {' '}
                · 周周冥想小组
              </span>
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link
                    href="https://hackathonweekly.feishu.cn/wiki/space/7468108015674425346?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home"
                    legacyBehavior
                    passHref
                  >
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      关于我们
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link
                    href="https://hackathonweekly.feishu.cn/wiki/NyJBwc3AsiHI5Gko2Z2cTBIqnCg"
                    legacyBehavior
                    passHref
                  >
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      冥想入门
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>

      {/* Add padding top to account for fixed header */}
      <div className="pt-14 md:pt-16"></div>

      {/* Hero Section */}
      <section className="relative flex h-screen items-center justify-center">
        <div className="container">
          <canvas
            ref={canvasRef}
            id="akCanvas"
            style={{
              position: 'absolute',
              height: '100vh',
              width: '100%',
              top: 0,
              left: 0,
              zIndex: 20,
            }}
          />
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-20">
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">常见问题</h2>
          <Accordion type="single" collapsible className="mx-auto max-w-2xl">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm md:text-base">
                冥想对初学者来说难吗？
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base">
                不会很难。我们为初学者准备了简单的引导冥想，通过循序渐进的方式帮助您掌握基本技巧。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm md:text-base">
                每天需要冥想多长时间？
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base">
                建议初学者从每天5-10分钟开始，随着练习逐渐增加时间。关键是保持规律性，而不是时间长短。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-sm md:text-base">
                如何加入冥想小组？
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base">
                您可以通过网站报名参加我们的线上活动，或者关注我们的社交媒体获取最新活动信息。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-20">
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
