"use client";
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
// const durations = [0.0833, 5, 15, 30, 60] // 0.0833 分钟 = 5 秒 方便调试
const durations = [5, 15, 30, 60]

const backgroundImages = [
  '/images/boy-meditation.jpg',
  '/images/meditation-man.jpg',
  '/images/meditation-woman.jpg'
]

export default function MeditationPage() {
  // 清理资源的函数
  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (endSoundRef.current) {
      endSoundRef.current.pause()
      endSoundRef.current = null
    }
  }

  // 添加返回首页按钮
  const BackButton = () => {
    const router = useRouter()
    return (
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 sm:top-6 left-4 sm:left-6 z-50 w-10 h-10 rounded-full bg-black/30 text-white transition-colors duration-200 hover:bg-black/40 active:bg-black/50"
        onClick={() => router.push('/')}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
    )
  }
  const [selectedDuration, setSelectedDuration] = useState(5)
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [customDuration, setCustomDuration] = useState(5)
  const [showGuidance, setShowGuidance] = useState(false)
  const endSoundRef = useRef<HTMLAudioElement | null>(null)
  const [timeLeft, setTimeLeft] = useState(5 * 60)
  const [isPlaying, setIsPlaying] = useState(false)
  // 默认使用光环扩散效果
  const [animationType, setAnimationType] = useState(3)
  // 设置默认音效（篝火）
  const defaultSound = sounds.find(s => s.isDefault)?.id || null
  const [selectedSound, setSelectedSound] = useState<string | null>(defaultSound)
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const previousVolume = useRef(50)
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null)
  const [selectedGuidance, setSelectedGuidance] = useState(guidances[0])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 获取当前状态名称
  const getStatusNames = () => {
    const selectedSoundName = selectedSound ? sounds.find(s => s.id === selectedSound)?.name : '无'
    const backgroundName = selectedBackground ? selectedBackground.split('/').pop()?.split('.')[0] : '渐变色'
    return {
      backgroundName,
      soundName: selectedSoundName,
      guidanceName: selectedGuidance.name
    }
  }

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

  // 初始化音频
  useEffect(() => {
    if (selectedSound) {
      const sound = sounds.find(s => s.id === selectedSound)
      if (sound) {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
        const audio = new Audio(sound.audioUrl)
        audio.loop = true
        audio.volume = volume / 100
        audioRef.current = audio
        if (isPlaying) {
          const playPromise = audio.play()
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log('音频播放失败:', error)
            })
          }
        }
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [selectedSound, volume, isPlaying])

  // 处理音量变化
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  // 处理播放状态
  useEffect(() => {
    const handleAudioPlay = async () => {
      if (!audioRef.current) return

      try {
        if (isPlaying) {
          // 先设置音量，避免突然的声音
          audioRef.current.volume = volume / 100
          const playPromise = audioRef.current.play()
          if (playPromise !== undefined) {
            await playPromise
          }
        } else {
          audioRef.current.pause()
        }
      } catch (error) {
        console.error('音频播放出错:', error)
        // 如果播放失败，重置播放状态
        setIsPlaying(false)
      }
    }

    handleAudioPlay()
  }, [isPlaying, volume])

  // 初始化和处理结束音效
  useEffect(() => {
    // 如果已经有音效，只更新音量
    if (endSoundRef.current) {
      endSoundRef.current.volume = volume / 100
      return
    }

    // 初始化结束音效
    const audio = new Audio('/sounds/temple-bells.mp3')
    audio.volume = volume / 100
    // 预加载音频
    audio.load()
    endSoundRef.current = audio

    // 组件卸载时清理
    return () => {
      if (endSoundRef.current) {
        endSoundRef.current.pause()
        endSoundRef.current = null
      }
    }
  }, [volume])

  // 处理计时器和结束音效
  useEffect(() => {
    let isMounted = true

    const playEndSound = async () => {
      if (!endSoundRef.current) return

      try {
        // 重置音频时间并重新加载
        endSoundRef.current.currentTime = 0
        endSoundRef.current.volume = volume / 100
        const playPromise = endSoundRef.current.play()
        if (playPromise !== undefined) {
          await playPromise
        }
      } catch (error) {
        console.error('结束音效播放失败:', error)
      }
    }

    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (!isMounted) return

        setTimeLeft(prev => {
          if (prev <= 1) {
            // 停止计时器
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            // 停止播放
            setIsPlaying(false)
            // 播放结束音效
            playEndSound()
            // 重置为上次选择的时间
            return selectedDuration * 60
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      isMounted = false
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, selectedDuration, volume])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 重置计时器
  const resetTimer = (duration: number, autoStart: boolean = false) => {
    setSelectedDuration(duration)
    setTimeLeft(duration * 60)
    setIsPlaying(autoStart)
  }

  return (
    <div
      className="min-h-screen flex flex-col relative transition-all duration-1000"
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
            priority
            sizes="100vw"
            quality={90}
          />
        </div>
      )}

      {/* 引导语 */}
      <div className="fixed top-16 sm:top-20 md:top-8 left-0 right-0 z-30">
        <div className="relative w-full max-w-2xl mx-auto px-4">
          <AnimatePresence initial={false}>
            {showGuidance ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-black/20 backdrop-blur-sm rounded-lg p-3 sm:p-4"
              >
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                  {selectedGuidance.content}
                </p>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGuidance(false)}
                    className="text-white/60 hover:text-white hover:bg-white/10 text-xs sm:text-sm"
                  >
                    隐藏引导语
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-center"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGuidance(true)}
                  className="text-white/60 hover:text-white hover:bg-white/10 text-xs sm:text-sm"
                >
                  显示引导语
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center relative z-10 w-full max-w-4xl mx-auto px-4 py-8 md:py-0">
        {/* 圆形计时器 */}
        <div className="relative w-[16rem] h-[16rem] sm:w-[20rem] sm:h-[20rem] md:w-[28rem] md:h-[28rem] mx-auto mb-6 sm:mb-8 md:mb-12">
          {/* 光环扩散效果 - 主圆圈 */}
          <motion.div
            className="absolute inset-4 rounded-full bg-black/30 backdrop-blur-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            initial={false}
            animate={isPlaying ? {
              scale: [1, 1.04, 1],
              opacity: [0.4, 0.6, 0.4],
              boxShadow: [
                "0 0 30px rgba(255,255,255,0.2)",
                "0 0 60px rgba(255,255,255,0.4)",
                "0 0 30px rgba(255,255,255,0.2)"
              ]
            } : {
              scale: 1,
              opacity: 0.4,
              boxShadow: "0 0 30px rgba(255,255,255,0.2)"
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* 外层光环1 */}
          <motion.div
            className="absolute inset-4 rounded-full bg-white/10"
            initial={false}
            animate={isPlaying ? {
              scale: [1.1, 1.4, 1.1],
              opacity: [0.15, 0, 0.15]
            } : { scale: 1.1, opacity: 0 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* 外层光环2 - 错开时间 */}
          <motion.div
            className="absolute inset-4 rounded-full bg-white/5"
            initial={false}
            animate={isPlaying ? {
              scale: [1.2, 1.5, 1.2],
              opacity: [0.1, 0, 0.1]
            } : { scale: 1.2, opacity: 0 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-7xl font-extralight tracking-[0.2em] text-white drop-shadow-lg select-none"
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
                    className="fixed bottom-32 left-0 right-0 flex flex-col items-center px-4 z-20"
                  >
                    {/* 当前状态显示 */}
                    <div className="flex gap-4 text-xs text-white/60 mb-4">
                      <span>背景：{getStatusNames().backgroundName}</span>
                      <span>音效：{getStatusNames().soundName}</span>
                      <span>引导语：{getStatusNames().guidanceName}</span>
                    </div>

                    {/* 时长选择按钮 */}
                    <div className="flex flex-wrap justify-center gap-3">
                    {durations.map(duration => (
                      <Button
                        key={duration}
                        variant="ghost"
                        size="sm"
                        onClick={() => resetTimer(duration)}
                        className={`min-w-[4.5rem] text-white hover:text-white hover:bg-white/20 backdrop-blur-sm ${
                          selectedDuration === duration ? 'bg-white/20' : ''
                        }`}
                      >
                        {duration < 1 ? '5秒' : `${duration}分钟`}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCustomDuration(true)}
                      className="text-white hover:text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                      更多
                    </Button>
                    </div>
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



                {/* 音量控制 */}
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

                {/* 自定义时长对话框 */}
                <Dialog open={showCustomDuration} onOpenChange={setShowCustomDuration}>
                  <DialogPortal>
                    <DialogPrimitive.Content
                      className="fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-black/20 backdrop-blur-xl border-white/10 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl"
                    >
                      <DialogHeader>
                        <DialogTitle className="text-white">自定义时长</DialogTitle>
                        <DialogDescription className="text-white/80">
                          请选择冥想时长（1-180分钟）
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[customDuration]}
                          onValueChange={([value]) => setCustomDuration(value)}
                          min={1}
                          max={180}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-white min-w-[4rem]">{customDuration}分钟</span>
                      </div>
                      <div className="flex justify-end gap-3 mt-4">
                        <Button
                          variant="ghost"
                          onClick={() => setShowCustomDuration(false)}
                          className="text-white hover:text-white hover:bg-white/20"
                        >
                          取消
                        </Button>
                        <Button
                          onClick={() => {
                            resetTimer(customDuration)
                            setShowCustomDuration(false)
                          }}
                          className="bg-white text-black hover:bg-white/90"
                        >
                          确定
                        </Button>
                      </div>
                      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4 text-white" />
                        <span className="sr-only">关闭</span>
                      </DialogPrimitive.Close>
                    </DialogPrimitive.Content>
                  </DialogPortal>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-3 sm:gap-6 px-4">
          {/* 背景选择 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogPrimitive.Content
                className="fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-black/20 backdrop-blur-xl border-white/10 p-4 md:p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl md:rounded-2xl"
              >
              <DialogHeader>
                <DialogTitle className="text-white text-lg">选择背景</DialogTitle>
                <DialogDescription className="text-white/80 text-sm">
                  选择一个静态背景图片或使用动态渐变色
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button
                  variant="ghost"
                  className={`h-auto py-3 text-sm text-white hover:text-white hover:bg-white/20 ${!selectedBackground ? 'bg-white/20' : ''}`}
                  onClick={() => setSelectedBackground(null)}
                >
                  渐变色
                </Button>
                {backgroundImages.map(img => (
                  <Button
                    key={img}
                    variant="ghost"
                    className={`h-auto py-3 text-sm text-white hover:text-white hover:bg-white/20 ${selectedBackground === img ? 'bg-white/20' : ''}`}
                    onClick={() => setSelectedBackground(img)}
                  >
                    {img.split('/').pop()?.split('.')[0]}
                  </Button>
                ))}
              </div>
                <DialogPrimitive.Close className="absolute right-2 md:right-4 top-2 md:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
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
                size="icon"
                className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white"
              >
                <Music2 className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogPrimitive.Content
                className="fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-black/20 backdrop-blur-xl border-white/10 p-4 md:p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl md:rounded-2xl"
              >
              <DialogHeader>
                <DialogTitle className="text-white">背景音效</DialogTitle>
                <DialogDescription className="text-white/80">
                  选择一个背景音效来帮助您进入冥想状态
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="自然" className="mt-4">
                <TabsList className="w-full bg-white/10 h-auto flex flex-wrap gap-1 p-1">
                  {
                    // 获取所有不重复的类别
                    Array.from(new Set(sounds.map(s => s.category))).map(category => (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-1.5 flex-1"
                      >
                        {category}
                      </TabsTrigger>
                    ))
                  }
                </TabsList>
                {
                  // 按类别分组显示音效
                  Array.from(new Set(sounds.map(s => s.category))).map(category => (
                    <TabsContent key={category} value={category} className="mt-4">
                      <div className="grid grid-cols-2 gap-3">
                        {sounds
                          .filter(sound => sound.category === category)
                          .map(sound => (
                            <Button
                              key={sound.id}
                              variant="ghost"
                              className={`h-auto py-3 text-sm text-white hover:text-white hover:bg-white/20 ${selectedSound === sound.id ? 'bg-white/20' : ''}`}
                              onClick={() => setSelectedSound(sound.id)}
                            >
                              {sound.name}
                            </Button>
                          ))
                        }
                      </div>
                    </TabsContent>
                  ))
                }
              </Tabs>

                <DialogPrimitive.Close className="absolute right-2 md:right-4 top-2 md:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
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
                size="icon"
                className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white"
              >
                <BookOpen className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogPrimitive.Content
                className="fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-black/20 backdrop-blur-xl border-white/10 p-4 md:p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl md:rounded-2xl"
              >
              <DialogHeader>
                <DialogTitle className="text-white">引导语</DialogTitle>
                <DialogDescription className="text-white/80">
                  选择一个引导语来帮助您进入冥想状态
                </DialogDescription>
              </DialogHeader>
              <Tabs
                defaultValue={guidances[0].id}
                className="mt-4"
                onValueChange={(value) => {
                  const guidance = guidances.find(g => g.id === value)
                  if (guidance) setSelectedGuidance(guidance)
                }}
              >
                <TabsList className="w-full bg-white/10 h-auto flex flex-col sm:flex-row gap-1 p-1">
                  {guidances.map(guidance => (
                    <TabsTrigger
                      key={guidance.id}
                      value={guidance.id}
                      className="flex-1 px-3 py-1.5 text-sm"
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
                <DialogPrimitive.Close className="absolute right-2 md:right-4 top-2 md:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
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
