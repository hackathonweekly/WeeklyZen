"use client";
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { X, Volume2, VolumeX, Settings, Music, ChevronRight, Palette, VolumeIcon, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogPortal, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { sounds } from '../sounds'

// 引导语内容
const guidances = [
  {
    id: 'none',
    name: '无引导语',
    content: '您选择了无引导语模式，专注于自己的呼吸和感受，享受宁静的冥想时光...'
  },
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
const durations = [5, 15, 30]

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
    if (startSoundRef.current) {
      startSoundRef.current.pause()
      startSoundRef.current = null
    }
    if (midSoundRef.current) {
      midSoundRef.current.pause()
      midSoundRef.current = null
    }
    if (endGuideSoundRef.current) {
      endGuideSoundRef.current.pause()
      endGuideSoundRef.current = null
    }
    // 清理音频上下文
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error)
      audioContextRef.current = null
    }
  }

  // 添加返回首页按钮
  const BackButton = () => {
    const router = useRouter()
    const handleBack = () => {
      // 先停止倒计时和音频
      cleanup()
      setIsPlaying(false)
      // 然后返回首页
      router.push('/')
    }

    return (
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 sm:top-6 left-4 sm:left-6 z-[100] w-10 h-10 rounded-full bg-black/30 text-white transition-colors duration-200 hover:bg-black/40 active:bg-black/50"
        onClick={handleBack}
      >
        <ChevronRight className="w-5 h-5" />
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
  // 控制按钮风格，1: 简约圆形, 2: 渐变光效, 3: 经典按钮
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
  const startSoundRef = useRef<HTMLAudioElement | null>(null)
  // 添加中间音频和结束引导音频的引用
  const midSoundRef = useRef<HTMLAudioElement | null>(null)
  const endGuideSoundRef = useRef<HTMLAudioElement | null>(null)
  // 添加引导音频状态
  const [guideState, setGuideState] = useState<'start' | 'mid' | 'end' | 'none'>('none')
  // 记录音频播放位置，用于暂停后继续播放
  const audioPositionRef = useRef<{start: number, mid: number, end: number}>({start: 0, mid: 0, end: 0})
  // 记录是否已经播放过中间音频
  const midSoundPlayedRef = useRef(false)
  // 添加 Web Audio API 相关引用
  const audioContextRef = useRef<AudioContext | null>(null)
  const endSoundBufferRef = useRef<AudioBuffer | null>(null)
  const templeBellsBufferRef = useRef<AudioBuffer | null>(null)
  // 添加音频源节点引用，用于停止音频播放
  const activeAudioSourcesRef = useRef<AudioBufferSourceNode[]>([])
  // 添加是否正在播放结束音频的状态
  const [isPlayingEndSound, setIsPlayingEndSound] = useState(false)

  // 停止结束音效播放
  const stopEndSound = () => {
    // 停止所有活跃的音频源
    activeAudioSourcesRef.current.forEach(source => {
      try {
        source.stop()
      } catch (error) {
        // 忽略已经停止的音频源
      }
    })
    
    // 清空活跃音频源列表
    activeAudioSourcesRef.current = []
    
    // 重置状态
    setGuideState('none')
    setIsPlayingEndSound(false)
    
    // 重置中间音效播放标记，以便下次冥想时能再次播放
    midSoundPlayedRef.current = false
  }

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

    // 初始化结束音效（现在只用于创建一个空的引用，实际播放时会使用合成的音频）
    const audio = new Audio()
    audio.volume = volume / 100
    endSoundRef.current = audio

    // 组件卸载时清理
    return () => {
      if (endSoundRef.current) {
        endSoundRef.current.pause()
        endSoundRef.current = null
      }
    }
  }, [volume])

  // 初始化开始音效
  useEffect(() => {
    // 如果已经有音效，只更新音量
    if (startSoundRef.current) {
      startSoundRef.current.volume = volume / 100
      return
    }

    // 初始化开始音效
    const audio = new Audio('/ai-sounds/start.mp3')
    audio.volume = volume / 100
    // 预加载音频
    audio.load()
    startSoundRef.current = audio

    // 组件卸载时清理
    return () => {
      if (startSoundRef.current) {
        startSoundRef.current.pause()
        startSoundRef.current = null
      }
    }
  }, [volume])

  // 初始化中间音效
  useEffect(() => {
    // 如果已经有音效，只更新音量
    if (midSoundRef.current) {
      midSoundRef.current.volume = volume / 100
      return
    }

    // 初始化中间音效
    const audio = new Audio('/ai-sounds/mid.mp3')
    audio.volume = volume / 100
    // 预加载音频
    audio.load()
    midSoundRef.current = audio

    // 组件卸载时清理
    return () => {
      if (midSoundRef.current) {
        midSoundRef.current.pause()
        midSoundRef.current = null
      }
    }
  }, [volume])

  // 处理开始音效播放
  useEffect(() => {
    const playStartSound = async () => {
      if (!startSoundRef.current) return

      try {
        if (guideState === 'start') {
          // 设置音频时间到上次暂停的位置
          startSoundRef.current.currentTime = audioPositionRef.current.start
          startSoundRef.current.volume = volume / 100
          
          // 监听音频结束事件
          const handleEnded = () => {
            setGuideState('none')
            startSoundRef.current?.removeEventListener('ended', handleEnded)
            audioPositionRef.current.start = 0
          }
          
          startSoundRef.current.addEventListener('ended', handleEnded)
          
          const playPromise = startSoundRef.current.play()
          if (playPromise !== undefined) {
            await playPromise
          }
        }
      } catch (error) {
        console.error('开始音效播放失败:', error)
      }
    }

    // 当计时开始并且引导状态为start时播放开始音效
    if (isPlaying && guideState === 'start') {
      playStartSound()
    } else if (!isPlaying && guideState === 'start') {
      // 当计时暂停时保存当前播放位置并暂停播放
      if (startSoundRef.current && !startSoundRef.current.paused) {
        audioPositionRef.current.start = startSoundRef.current.currentTime
        startSoundRef.current.pause()
      }
    }
  }, [isPlaying, volume, guideState])

  // 处理中间音效播放
  useEffect(() => {
    const playMidSound = async () => {
      if (!midSoundRef.current) return

      try {
        if (guideState === 'mid') {
          // 设置音频时间到上次暂停的位置
          midSoundRef.current.currentTime = audioPositionRef.current.mid
          midSoundRef.current.volume = volume / 100
          
          // 监听音频结束事件
          const handleEnded = () => {
            setGuideState('none')
            midSoundRef.current?.removeEventListener('ended', handleEnded)
            audioPositionRef.current.mid = 0
          }
          
          midSoundRef.current.addEventListener('ended', handleEnded)
          
          const playPromise = midSoundRef.current.play()
          if (playPromise !== undefined) {
            await playPromise
          }
        }
      } catch (error) {
        console.error('中间音效播放失败:', error)
      }
    }

    // 当计时开始并且引导状态为mid时播放中间音效
    if (isPlaying && guideState === 'mid') {
      playMidSound()
    } else if (!isPlaying && guideState === 'mid') {
      // 当计时暂停时保存当前播放位置并暂停播放
      if (midSoundRef.current && !midSoundRef.current.paused) {
        audioPositionRef.current.mid = midSoundRef.current.currentTime
        midSoundRef.current.pause()
      }
    }
  }, [isPlaying, volume, guideState])

  // 处理计时器和结束音效
  useEffect(() => {
    let isMounted = true

    const playEndSound = async () => {
      // 确保音频上下文和缓冲区已加载
      if (!audioContextRef.current || !endSoundBufferRef.current || !templeBellsBufferRef.current) {
        console.error('音频资源未加载完成')
        return
      }

      try {
        // 设置正在播放结束音频状态
        setIsPlayingEndSound(true)
        
        // 恢复音频上下文（如果被暂停）
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }

        // 设置引导状态为end
        setGuideState('end')
        
        // 获取当前音频上下文时间
        const currentTime = audioContextRef.current.currentTime
        
        // 创建第一个音频源节点（end.mp3）
        const endSoundSource = audioContextRef.current.createBufferSource()
        endSoundSource.buffer = endSoundBufferRef.current
        
        // 添加到活跃音频源列表
        activeAudioSourcesRef.current.push(endSoundSource)
        
        // 创建增益节点（用于控制音量）
        const endSoundGain = audioContextRef.current.createGain()
        endSoundGain.gain.value = volume / 100
        
        // 连接节点
        endSoundSource.connect(endSoundGain)
        endSoundGain.connect(audioContextRef.current.destination)
        
        // 获取第一个音频的持续时间
        const endSoundDuration = endSoundBufferRef.current.duration
        
        // 创建第二个音频源节点（temple-bells.mp3）
        const templeBellsSource = audioContextRef.current.createBufferSource()
        templeBellsSource.buffer = templeBellsBufferRef.current
        
        // 添加到活跃音频源列表
        activeAudioSourcesRef.current.push(templeBellsSource)
        
        // 创建增益节点
        const templeBellsGain = audioContextRef.current.createGain()
        templeBellsGain.gain.value = volume / 100
        
        // 连接节点
        templeBellsSource.connect(templeBellsGain)
        templeBellsGain.connect(audioContextRef.current.destination)
        
        // 设置第二个音频在第一个音频结束后开始播放
        // 使用精确的时间安排，而不是依赖onended事件
        endSoundSource.start(currentTime)
        templeBellsSource.start(currentTime + endSoundDuration)
        
        // 计算总时长
        const totalDuration = endSoundDuration + templeBellsBufferRef.current.duration
        
        // 设置一个定时器，在所有音频播放完成后重置状态
        setTimeout(() => {
          if (isMounted) {
            setGuideState('none')
            setIsPlayingEndSound(false)
          }
        }, totalDuration * 1000 + 500) // 添加500ms的缓冲时间
        
      } catch (error) {
        console.error('结束音效播放失败:', error)
        // 出错时重置状态
        setGuideState('none')
        setIsPlayingEndSound(false)
      }
    }

    const updateTimer = () => {
      if (!isMounted) return

      setTimeLeft(prev => {
        // 计算总时间和已经过去的时间
        const totalTime = selectedDuration * 60
        const elapsedTime = totalTime - prev
        
        // 如果时间超过50秒，并且到达一半时间点，播放中间音效
        if (totalTime > 50 && !midSoundPlayedRef.current && elapsedTime >= totalTime / 2 - 1 && elapsedTime <= totalTime / 2 + 1) {
          midSoundPlayedRef.current = true
          setGuideState('mid')
        }
        
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
    }

    // 清理旧的计时器
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // 创建新的计时器
    if (isPlaying) {
      timerRef.current = setInterval(updateTimer, 1000)
    }

    return () => {
      isMounted = false
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, selectedDuration, volume])

  // 加载音频缓冲区
  useEffect(() => {
    // 创建音频上下文
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.error('创建音频上下文失败:', error)
        return
      }
    }

    // 加载结束引导音频
    const loadEndSound = async (timestamp?: number) => {
      try {
        console.log('开始加载结束引导音频')
        const response = await fetch(`/ai-sounds/end.mp3?t=${timestamp || new Date().getTime()}`)
        if (!response.ok) {
          throw new Error(`加载失败: ${response.status} ${response.statusText}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        if (audioContextRef.current) {
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
          endSoundBufferRef.current = audioBuffer
          console.log('结束引导音频加载成功，时长:', audioBuffer.duration)
        }
      } catch (error) {
        console.error('加载结束引导音频失败:', error)
      }
    }

    // 加载寺庙钟声音频
    const loadTempleBells = async () => {
      try {
        console.log('开始加载寺庙钟声音频')
        const response = await fetch('/sounds/temple-bells.mp3')
        if (!response.ok) {
          throw new Error(`加载失败: ${response.status} ${response.statusText}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        if (audioContextRef.current) {
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
          templeBellsBufferRef.current = audioBuffer
          console.log('寺庙钟声音频加载成功，时长:', audioBuffer.duration)
        }
      } catch (error) {
        console.error('加载寺庙钟声音频失败:', error)
      }
    }

    // 加载开始引导音频
    const loadStartSound = async () => {
      try {
        console.log('开始加载开始引导音频')
        const response = await fetch('/ai-sounds/start.mp3')
        if (!response.ok) {
          throw new Error(`加载失败: ${response.status} ${response.statusText}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        if (audioContextRef.current) {
          startSoundRef.current = new Audio('/ai-sounds/start.mp3')
          console.log('开始引导音频加载成功')
        }
      } catch (error) {
        console.error('加载开始引导音频失败:', error)
      }
    }

    // 加载中间引导音频
    const loadMidSound = async () => {
      try {
        console.log('开始加载中间引导音频')
        midSoundRef.current = new Audio('/ai-sounds/mid.mp3')
        console.log('中间引导音频加载成功')
      } catch (error) {
        console.error('加载中间引导音频失败:', error)
      }
    }

    // 加载所有音频
    Promise.all([loadEndSound(), loadTempleBells(), loadStartSound(), loadMidSound()])
      .then(() => console.log('所有音频加载完成'))
      .catch(error => console.error('加载音频失败:', error))

    // 组件卸载时清理
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error)
        audioContextRef.current = null
      }
      endSoundBufferRef.current = null
      templeBellsBufferRef.current = null
    }
  }, [])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 重置计时器
  const resetTimer = (duration: number, autoStart: boolean = false) => {
    // 如果正在播放结束音频，不允许重置计时器
    if (isPlayingEndSound) return
    
    setSelectedDuration(duration)
    setTimeLeft(duration * 60)
    
    // 重置引导音频状态
    setGuideState('none')
    midSoundPlayedRef.current = false
    audioPositionRef.current = {start: 0, mid: 0, end: 0}
    
    // 只有当总时间足够长（大于50秒）且选择的是"观察呼吸"引导语时才设置开始引导音效
    if (duration * 60 > 50 && autoStart && selectedGuidance.id === 'breath') {
      setGuideState('start')
    }
    
    setIsPlaying(autoStart)
  }

  // 自定义TTS引导语
  const [showCustomTTS, setShowCustomTTS] = useState(false)
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false)
  const [customTTS, setCustomTTS] = useState({
    start: '',
    mid: '',
    end: ''
  })

  // 生成TTS音频
  const generateTTS = async () => {
    try {
      setIsGeneratingTTS(true)
      
      // 检查是否至少有一个字段不为空
      if (!customTTS.start && !customTTS.mid && !customTTS.end) {
        toast.error('请至少填写一个引导语内容')
        setIsGeneratingTTS(false)
        return
      }
      
      // 创建要处理的任务数组
      const tasks = []
      
      if (customTTS.start) {
        tasks.push(
          fetch('/api/tts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'start',
              text: customTTS.start
            }),
          })
        )
      }
      
      if (customTTS.mid) {
        tasks.push(
          fetch('/api/tts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'mid',
              text: customTTS.mid
            }),
          })
        )
      }
      
      if (customTTS.end) {
        tasks.push(
          fetch('/api/tts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'end',
              text: customTTS.end
            }),
          })
        )
      }
      
      // 并行处理所有任务
      const results = await Promise.all(tasks)
      
      // 检查所有响应
      for (const response of results) {
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '生成TTS失败')
        }
      }
      
      // 成功处理所有任务
      toast.success('引导语音频生成成功')
      setShowCustomTTS(false)
      
      // 添加时间戳以避免缓存问题
      const timestamp = new Date().getTime()
      
      // 强制重新加载音频文件
      if (startSoundRef.current) {
        startSoundRef.current.pause()
        startSoundRef.current = new Audio(`/ai-sounds/start.mp3?t=${timestamp}`)
        startSoundRef.current.load() // 确保加载新文件
        startSoundRef.current.volume = volume / 100
      }
      
      if (midSoundRef.current) {
        midSoundRef.current.pause()
        midSoundRef.current = new Audio(`/ai-sounds/mid.mp3?t=${timestamp}`)
        midSoundRef.current.load() // 确保加载新文件
        midSoundRef.current.volume = volume / 100
      }
      
      // 重新加载结束音频
      loadEndSound(timestamp)
      
    } catch (error) {
      console.error('生成TTS错误:', error)
      if (error instanceof Error) {
        toast.error(`生成TTS失败: ${error.message}`)
      } else {
        toast.error('生成TTS失败: 未知错误')
      }
    } finally {
      setIsGeneratingTTS(false)
    }
  }

  return (
    <div
      className="h-[100vh] flex flex-col relative transition-all duration-1000 touch-none select-none"
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
                        className={`min-w-[4.5rem] text-white hover:text-white hover:bg-white/20 ${selectedDuration === duration ? 'bg-white/20' : ''}`}
                        disabled={isPlayingEndSound} // 在播放结束音频时禁用时长选择
                      >
                        {duration < 1 ? '5秒' : `${duration}分钟`}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCustomDuration(true)}
                      className="text-white hover:text-white hover:bg-white/20 backdrop-blur-sm"
                      disabled={isPlayingEndSound} // 在播放结束音频时禁用自定义时长
                    >
                      更多
                    </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-12 sm:mt-16 md:mt-20 space-y-8">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    if (isPlayingEndSound) {
                      // 如果正在播放结束音频，点击按钮停止播放
                      stopEndSound()
                    } else if (timerRef.current) {
                      // 如果计时器正在运行，暂停计时
                      clearInterval(timerRef.current)
                      timerRef.current = null
                      setIsPlaying(false)
                    } else if (!isPlaying) {
                      // 如果是从暂停状态变为播放状态
                      // 如果是刚开始计时且时间足够长（大于50秒）且选择的是"观察呼吸"引导语，播放开始引导音效
                      const totalTime = selectedDuration * 60
                      const elapsedTime = totalTime - timeLeft
                      
                      if (elapsedTime < 1 && totalTime > 50 && selectedGuidance.id === 'breath') {
                        setGuideState('start')
                      }
                      
                      setIsPlaying(true)
                    }
                  }}
                  className="min-w-[120px] bg-black/20 hover:bg-black/30 text-white/90 hover:text-white backdrop-blur-sm transition-all duration-300 active:scale-95 rounded-full px-8 border-0"
                  disabled={isPlayingEndSound && guideState !== 'end'} // 在播放结束音频时禁用按钮，除非是停止按钮
                >
                  {isPlayingEndSound ? '重置' : isPlaying ? '暂停' : '开始'}
                </Button>



                {/* 音量控制 */}
                {selectedSound && (
                  <div className="flex items-center gap-4 px-4 fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-sm rounded-full py-2 min-w-[200px] justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        // 只有在暂停状态下才能调整音量
                        if (!isPlaying && !isPlayingEndSound) {
                          if (isMuted) {
                            setVolume(previousVolume.current)
                            setIsMuted(false)
                          } else {
                            previousVolume.current = volume
                            setVolume(0)
                            setIsMuted(true)
                          }
                        }
                      }}
                      className={`w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white ${
                        isPlaying || isPlayingEndSound ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={isPlaying || isPlayingEndSound} // 在播放状态下禁用按钮
                      title={isPlaying || isPlayingEndSound ? "暂停冥想后可调整音量" : "调整音量"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <div className="flex flex-col items-center">
                      <Slider
                        value={[volume]}
                        onValueChange={([value]) => {
                          // 只有在暂停状态下才能调整音量
                          if (!isPlaying && !isPlayingEndSound) {
                            setVolume(value)
                            setIsMuted(value === 0)
                          }
                        }}
                        max={100}
                        step={1}
                        className={`w-32 ${isPlaying || isPlayingEndSound ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isPlaying || isPlayingEndSound} // 在播放状态下禁用滑块
                      />
                      {/* {(isPlaying || isPlayingEndSound) && (
                        <p className="text-white/60 text-xs mt-1">暂停后可调整音量</p>
                      )} */}
                    </div>
                  </div>
                )}
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
                <Palette className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogPrimitive.Content
                className="fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-black/20 backdrop-blur-xl border-white/10 p-4 md:p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl md:rounded-2xl"
              >
              <DialogHeader>
                <DialogTitle className="text-white">选择背景</DialogTitle>
                <DialogDescription className="text-white/80">
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
                <Music className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogPrimitive.Content
                className="fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-black/20 backdrop-blur-xl border-white/10 p-4 md:p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl md:rounded-2xl"
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
                className="fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-black/20 backdrop-blur-xl border-white/10 p-4 md:p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl md:rounded-2xl"
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
                    if (guidance) {
                      setSelectedGuidance(guidance)
                      
                      // 如果选择的是"观察呼吸"，自动重置计时器并开始播放
                      if (guidance.id === 'breath') {
                        // 首先停止所有正在播放的音频
                        if (isPlaying) {
                          if (timerRef.current) {
                            clearInterval(timerRef.current)
                            timerRef.current = null
                          }
                          setIsPlaying(false);
                        }
                        if (isPlayingEndSound) {
                          stopEndSound();
                        }
                        
                        // 重置计时器，并自动开始（传入true表示自动开始）
                        // 重置为当前已选择的时长
                        resetTimer(selectedDuration, true);
                        
                        // 自动关闭对话框
                        const closeButton = document.querySelector('[aria-label="关闭"]') as HTMLButtonElement | null;
                        if (closeButton) {
                          closeButton.click();
                        }
                      } else if (guidance.id !== 'breath' && guideState === 'start') {
                        // 如果不是选择"观察呼吸"，但当前处于开始引导状态，则取消引导状态
                        setGuideState('none')
                      }
                    }
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomTTS(true)}
                  className="text-white hover:text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  自定义引导语
                </Button>
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
                disabled={isPlaying || isPlayingEndSound} // 在播放状态下禁用滑块
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
                disabled={isPlaying || isPlayingEndSound} // 在播放状态下禁用确定按钮
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
      {/* 自定义TTS引导语对话框 */}
      <Dialog open={showCustomTTS} onOpenChange={setShowCustomTTS}>
        <DialogPortal>
          <DialogPrimitive.Content
            className="fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-black/20 backdrop-blur-xl border-white/10 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl"
          >
            <DialogHeader>
              <DialogTitle className="text-white">自定义TTS引导语</DialogTitle>
              <DialogDescription className="text-white/80">
                请输入您的自定义引导语
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Label className="text-white">开始引导语</Label>
              <Textarea
                value={customTTS.start}
                onChange={(e) => setCustomTTS(prev => ({...prev, start: e.target.value}))}
                className="bg-black/20 text-white p-2 rounded-md"
              />
              <Label className="text-white">中间引导语</Label>
              <Textarea
                value={customTTS.mid}
                onChange={(e) => setCustomTTS(prev => ({...prev, mid: e.target.value}))}
                className="bg-black/20 text-white p-2 rounded-md"
              />
              <Label className="text-white">结束引导语</Label>
              <Textarea
                value={customTTS.end}
                onChange={(e) => setCustomTTS(prev => ({...prev, end: e.target.value}))}
                className="bg-black/20 text-white p-2 rounded-md"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="ghost"
                onClick={() => setShowCustomTTS(false)}
                className="text-white hover:text-white hover:bg-white/20"
              >
                取消
              </Button>
              <Button
                onClick={generateTTS}
                className="bg-white text-black hover:bg-white/90"
                disabled={isGeneratingTTS}
              >
                {isGeneratingTTS ? '生成中...' : '生成'}
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
  )
}
function loadEndSound(timestamp: number) {
  throw new Error('Function not implemented.');
}

