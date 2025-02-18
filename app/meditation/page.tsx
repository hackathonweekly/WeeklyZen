"use client";
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogPortal } from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { Music2, BookOpen, Image as ImageIcon, ChevronLeft, Volume2, VolumeX } from 'lucide-react'
import { sounds } from '../sounds'

// 引导语内容
const guidances = [
  {
    id: 'beginner',
    name: '冥想入门',
    content: '请找一个安静的地方坐下，保持背部挺直，双手自然放在膝盖上。闭上眼睛，深呼吸几次...'
  },
  {
    id: 'breath',
    name: '观察呼吸',
    content: '将注意力集中在呼吸上，感受空气进入身体，然后缓缓呼出...'
  },
  {
    id: 'body',
    name: '扫描身体',
    content: '从头顶开始，慢慢将注意力移向脚趾，观察身体的每个部分...'
  }
]

// 可选的冥想时长（分钟）
const durations = [5, 10, 15, 30, 60]

const backgroundImages = [
  '/images/boy-meditation.jpg',
  '/images/meditation-man.jpg',
  '/images/meditation-woman.jpg'
]

export default function MeditationPage() {
  // 添加返回首页按钮
  const BackButton = () => (
    <Link href="/" className="absolute top-6 left-6 z-20">
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
    </Link>
  )
  const [selectedDuration, setSelectedDuration] = useState(5)
  const [timeLeft, setTimeLeft] = useState(5 * 60)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSound, setSelectedSound] = useState<string | null>(null)
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const previousVolume = useRef(50)
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 生成渐变色背景
  const generateGradient = () => {
    const hue = (Date.now() / 100) % 360
    return `linear-gradient(${hue}deg,
      hsl(${hue}, 70%, 15%) 0%,
      hsl(${(hue + 30) % 360}, 70%, 20%) 50%,
      hsl(${(hue + 60) % 360}, 70%, 25%) 100%
    )`
  }
  const [gradient, setGradient] = useState(generateGradient())

  useEffect(() => {
    if (!selectedBackground && isPlaying) {
      const interval = setInterval(() => {
        setGradient(generateGradient())
      }, 100)
      return () => clearInterval(interval)
    }
  }, [selectedBackground, isPlaying])

  // 处理音频播放
  useEffect(() => {
    if (selectedSound) {
      const sound = sounds.find(s => s.id === selectedSound)
      if (sound && audioRef.current) {
        audioRef.current.src = sound.audioUrl
        audioRef.current.volume = volume / 100
        if (isPlaying) {
          audioRef.current.play()
        }
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [selectedSound, isPlaying, volume])

  // 处理计时器
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false)
            clearInterval(timerRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 重置计时器
  const resetTimer = (duration: number) => {
    setSelectedDuration(duration)
    setTimeLeft(duration * 60)
    setIsPlaying(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative transition-all duration-1000"
      style={{
        background: selectedBackground ? 'none' : gradient,
      }}
    >
      <BackButton />
      {selectedBackground && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-10" />
          <Image
            src={selectedBackground}
            alt="冥想背景"
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
        {/* 圆形计时器 */}
        <div className="relative w-[20rem] h-[20rem] md:w-[32rem] md:h-[32rem] mx-auto mb-8 md:mb-12">
          <div className="absolute inset-4 rounded-full bg-black/40 backdrop-blur-lg shadow-2xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.h1
              className="text-5xl md:text-7xl font-extralight tracking-[0.2em] mb-6 text-white drop-shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {formatTime(timeLeft)}
            </motion.h1>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
            <div className="mt-24 md:mt-40">
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-wrap justify-center gap-3 mb-6"
                  >
                    {durations.map(duration => (
                      <Button
                        key={duration}
                        variant="ghost"
                        size="sm"
                        onClick={() => resetTimer(duration)}
                        className={`text-white hover:text-white hover:bg-white/20 backdrop-blur-sm ${
                          selectedDuration === duration ? 'bg-white/20' : ''
                        }`}
                      >
                        {duration}分钟
                      </Button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="min-w-[120px] bg-white text-black hover:bg-white/90 backdrop-blur-sm"
                  >
                    {isPlaying ? '暂停' : '开始'}
                  </Button>
                </motion.div>

                {selectedSound && (
                  <div className="flex items-center gap-4 px-4 fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-sm rounded-full py-2 min-w-[200px] justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (isMuted) {
                          setVolume(previousVolume.current)
                          setIsMuted(false)
                        } else {
                          previousVolume.current = volume
                          setVolume(0)
                          setIsMuted(true)
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Slider
                      value={[volume]}
                      onValueChange={([value]) => {
                        setVolume(value)
                        setIsMuted(value === 0)
                      }}
                      max={100}
                      step={1}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-6">
          {/* 背景选择 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white"
              >
                <ImageIcon className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogPrimitive.Content
                className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-black/20 backdrop-blur-xl border-white/10 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl"
              >
              <DialogHeader>
                <DialogTitle className="text-white">选择背景</DialogTitle>
                <DialogDescription className="text-white/80">
                  选择一个静态背景图片或使用动态渐变色
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Button
                  variant="ghost"
                  className={`h-auto py-4 text-white hover:text-white hover:bg-white/20 ${!selectedBackground ? 'bg-white/20' : ''}`}
                  onClick={() => setSelectedBackground(null)}
                >
                  渐变色
                </Button>
                {backgroundImages.map(img => (
                  <Button
                    key={img}
                    variant="ghost"
                    className={`h-auto py-4 text-white hover:text-white hover:bg-white/20 ${selectedBackground === img ? 'bg-white/20' : ''}`}
                    onClick={() => setSelectedBackground(img)}
                  >
                    {img.split('/').pop()?.split('.')[0]}
                  </Button>
                ))}
              </div>
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="h-4 w-4 text-white" />
                  <span className="sr-only">关闭</span>
                </DialogPrimitive.Close>
              </DialogPrimitive.Content>
            </DialogPortal>
          </Dialog>

          {/* 音效选择 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white"
              >
                <Music2 className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogPrimitive.Content
                className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-black/20 backdrop-blur-xl border-white/10 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl"
              >
              <DialogHeader>
                <DialogTitle className="text-white">背景音效</DialogTitle>
                <DialogDescription className="text-white/80">
                  选择一个背景音效来帮助您进入冥想状态
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {sounds.map(sound => (
                  <Button
                    key={sound.id}
                    variant="ghost"
                    className={`h-auto py-4 text-white hover:text-white hover:bg-white/20 ${selectedSound === sound.id ? 'bg-white/20' : ''}`}
                    onClick={() => setSelectedSound(sound.id)}
                  >
                    {sound.name}
                  </Button>
                ))}
              </div>

                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="h-4 w-4 text-white" />
                  <span className="sr-only">关闭</span>
                </DialogPrimitive.Close>
              </DialogPrimitive.Content>
            </DialogPortal>
          </Dialog>

          {/* 引导语选择 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white"
              >
                <BookOpen className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogPrimitive.Content
                className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-black/20 backdrop-blur-xl border-white/10 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl"
              >
              <DialogHeader>
                <DialogTitle className="text-white">引导语</DialogTitle>
                <DialogDescription className="text-white/80">
                  选择一个引导语来帮助您进入冥想状态
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue={guidances[0].id} className="mt-4">
                <TabsList className="w-full bg-white/10">

                  {guidances.map(guidance => (
                    <TabsTrigger
                      key={guidance.id}
                      value={guidance.id}
                      className="flex-1"
                    >
                      {guidance.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {guidances.map(guidance => (
                  <TabsContent key={guidance.id} value={guidance.id}>
                    <p className="text-white/80 leading-relaxed">
                      {guidance.content}
                    </p>
                  </TabsContent>
                ))}
              </Tabs>
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="h-4 w-4 text-white" />
                  <span className="sr-only">关闭</span>
                </DialogPrimitive.Close>
              </DialogPrimitive.Content>
            </DialogPortal>
          </Dialog>
        </div>
      </div>
      <audio ref={audioRef} loop />
    </div>
  )
}
