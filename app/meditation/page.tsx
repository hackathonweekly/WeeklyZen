"use client";
import { useState, useEffect, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { X, Volume2, VolumeX, Settings, Music, ChevronRight, Palette, BookOpen, Play, Pause, Check, RotateCcw } from 'lucide-react'
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
import { sounds, SoundData } from '../sounds'
import { useAppTheme } from '@/contexts/theme-context'
import { useTheme } from 'next-themes'
import { BackButton } from '../../components/back-button'
import { useGuidanceTexts, guidanceTexts as defaultGuidanceTexts } from '@/app/guidance'
import { SoundIcon } from '@/app/SoundIcon'

// 引导语内容
const guidances = [
  {
    id: 'none',
    name: '无引导语',
    content: '您选择了无引导语模式，专注于自己的呼吸和感受，享受宁静的冥想时光...'
  },
  {
    id: 'primer',
    name: '冥想入门',
    content: '请找一个安静的地方坐下，保持背部挺直，双手自然放在膝盖上。闭上眼睛，深呼吸几次...'
  },
  {
    id: 'breathe',
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

// 简单的翻译函数
const t = (zh: string, en: string) => {
  // 这里可以根据实际需求实现语言切换逻辑
  return en; // 默认返回英文
};

// 定义引导语类型
interface GuidanceType {
  content: ReactNode;
  id: string;
  title: string;
  description: string;
  paragraphs: string[];
}

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
  // 获取主题样式
  const { isDarkTheme: isDarkThemeTop } = useAppTheme();
  const { theme: themeTop } = useTheme();

  const [selectedDuration, setSelectedDuration] = useState(5)
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [customDuration, setCustomDuration] = useState(5)
  const [showGuidance, setShowGuidance] = useState(false)
  const [showGuidanceSelector, setShowGuidanceSelector] = useState(false)
  const endSoundRef = useRef<HTMLAudioElement | null>(null)
  const [timeLeft, setTimeLeft] = useState(5 * 60)
  const [isPlaying, setIsPlaying] = useState(false)
  // 默认使用光环扩散效果
  const [animationType, setAnimationType] = useState(3)
  // 设置默认音效（篝火）
  const defaultSound = sounds.find(s => s.isDefault) || null
  const [selectedSound, setSelectedSound] = useState<SoundData | null>(defaultSound)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const previousVolume = useRef(50)
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null)
  const [selectedGuidance, setSelectedGuidance] = useState<GuidanceType | null>(null)
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
  const [guidanceFullText, setGuidanceFullText] = useState('')
  const [showFullTextDialog, setShowFullTextDialog] = useState(false)
  const [breathingState, setBreathingState] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('rest');
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { isDarkTheme: themeIsDark, themeStyles: themeStyles } = useAppTheme();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // 确保组件挂载后再渲染
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 呼吸动画控制
  useEffect(() => {
    // 只有在播放状态下才启动呼吸动画
    if (isPlaying) {
      // 启动呼吸动画循环
      const startBreathingCycle = () => {
        let cyclePosition = 0;
        
        // 清除任何现有的间隔
        if (breathingIntervalRef.current) {
          clearInterval(breathingIntervalRef.current);
        }
        
        breathingIntervalRef.current = setInterval(() => {
          // 总周期为 12 秒 (4-2-4-2)
          // 吸气 4 秒，保持 2 秒，呼气 4 秒，休息 2 秒
          if (cyclePosition < 4) {
            setBreathingState('inhale');
          } else if (cyclePosition < 6) {
            setBreathingState('hold');
          } else if (cyclePosition < 10) {
            setBreathingState('exhale');
          } else {
            setBreathingState('rest');
          }
          
          cyclePosition = (cyclePosition + 1) % 12;
        }, 1000);
      };
      
      startBreathingCycle();
    } else {
      // 不在播放状态时，设置为休息状态
      setBreathingState('rest');
      
      // 清除任何现有的间隔
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    }
    
    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // 初始化音频
  useEffect(() => {
    if (selectedSound) {
      const sound = sounds.find(s => s.id === selectedSound.id)
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
    // 清理之前的音频
    if (startSoundRef.current) {
      startSoundRef.current.pause();
      startSoundRef.current = null;
    }

    // 如果没有选择引导语或选择了"无引导语"，不加载音频
    if (!selectedGuidance || selectedGuidance.id === 'none') {
      return;
    }

    try {
      // 初始化开始音效，使用正确的文件路径
      const audio = new Audio(`/ai-sounds/start_${selectedGuidance.id}.mp3`);
      audio.volume = volume / 100;
      // 预加载音频
      audio.load();
      startSoundRef.current = audio;
      console.log(`已加载开始引导音频: /ai-sounds/start_${selectedGuidance.id}.mp3`);
    } catch (error) {
      console.error('加载开始引导音频失败:', error);
    }

    // 组件卸载时清理
    return () => {
      if (startSoundRef.current) {
        startSoundRef.current.pause();
        startSoundRef.current = null;
      }
    }
  }, [volume, selectedGuidance]);

  // 初始化中间音效
  useEffect(() => {
    // 清理之前的音频
    if (midSoundRef.current) {
      midSoundRef.current.pause();
      midSoundRef.current = null;
    }

    // 如果没有选择引导语或选择了"无引导语"，不加载音频
    if (!selectedGuidance || selectedGuidance.id === 'none') {
      return;
    }

    try {
      // 初始化中间音效，使用正确的文件路径
      const audio = new Audio(`/ai-sounds/mid_${selectedGuidance.id}.mp3`);
      audio.volume = volume / 100;
      // 预加载音频
      audio.load();
      midSoundRef.current = audio;
      console.log(`已加载中间引导音频: /ai-sounds/mid_${selectedGuidance.id}.mp3`);
    } catch (error) {
      console.error('加载中间引导音频失败:', error);
    }

    // 组件卸载时清理
    return () => {
      if (midSoundRef.current) {
        midSoundRef.current.pause();
        midSoundRef.current = null;
      }
    }
  }, [volume, selectedGuidance]);

  // 处理开始音效播放
  useEffect(() => {
    const playStartSound = async () => {
      if (!startSoundRef.current) {
        console.error('开始引导音频未加载');
        return;
      }

      try {
        if (guideState === 'start') {
          console.log('开始播放开始引导语');
          // 设置音频时间到上次暂停的位置
          startSoundRef.current.currentTime = audioPositionRef.current.start;
          startSoundRef.current.volume = volume / 100;
          
          // 监听音频结束事件
          const handleEnded = () => {
            console.log('开始引导语播放结束');
            setGuideState('none');
            startSoundRef.current?.removeEventListener('ended', handleEnded);
            audioPositionRef.current.start = 0;
          };
          
          startSoundRef.current.addEventListener('ended', handleEnded);
          
          const playPromise = startSoundRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        }
      } catch (error) {
        console.error('开始音效播放失败:', error);
        // 出错时重置状态
        setGuideState('none');
      }
    };

    // 当计时开始并且引导状态为start时播放开始音效
    if (isPlaying && guideState === 'start') {
      playStartSound();
    } else if (!isPlaying && guideState === 'start') {
      // 当计时暂停时保存当前播放位置并暂停播放
      if (startSoundRef.current && !startSoundRef.current.paused) {
        audioPositionRef.current.start = startSoundRef.current.currentTime;
        startSoundRef.current.pause();
      }
    }
  }, [isPlaying, volume, guideState]);

  // 处理中间音效播放
  useEffect(() => {
    const playMidSound = async () => {
      if (!midSoundRef.current) {
        console.error('中间引导音频未加载');
        return;
      }

      try {
        if (guideState === 'mid') {
          console.log('开始播放中间引导语');
          // 设置音频时间到上次暂停的位置
          midSoundRef.current.currentTime = audioPositionRef.current.mid;
          midSoundRef.current.volume = volume / 100;
          
          // 监听音频结束事件
          const handleEnded = () => {
            console.log('中间引导语播放结束');
            setGuideState('none');
            midSoundRef.current?.removeEventListener('ended', handleEnded);
            audioPositionRef.current.mid = 0;
          };
          
          midSoundRef.current.addEventListener('ended', handleEnded);
          
          const playPromise = midSoundRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        }
      } catch (error) {
        console.error('中间音效播放失败:', error);
        // 出错时重置状态
        setGuideState('none');
      }
    };

    // 当计时开始并且引导状态为mid时播放中间音效
    if (isPlaying && guideState === 'mid') {
      playMidSound();
    } else if (!isPlaying && guideState === 'mid') {
      // 当计时暂停时保存当前播放位置并暂停播放
      if (midSoundRef.current && !midSoundRef.current.paused) {
        audioPositionRef.current.mid = midSoundRef.current.currentTime;
        midSoundRef.current.pause();
      }
    }
  }, [isPlaying, volume, guideState]);

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

        // 只有在时间至少10分钟且不是"无引导语"时才设置引导状态为end
        if (selectedDuration >= 10 && selectedGuidance?.id !== 'none') {
        setGuideState('end')
        }
        
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
        
        // 如果时间至少10分钟，且不是"无引导语"，并且到达一半时间点，播放中间音效
        if (selectedDuration >= 10 && selectedGuidance?.id !== 'none' && !midSoundPlayedRef.current && elapsedTime >= totalTime / 2 - 1 && elapsedTime <= totalTime / 2 + 1) {
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

    // 加载结束引导音频
    const loadEndSound = async (timestamp?: number) => {
      try {
      console.log(`开始加载结束引导音频: ${selectedGuidance?.id}`)
      if (!selectedGuidance || selectedGuidance.id === 'none') {
        // 无引导语模式使用默认结束音效
        const response = await fetch(`/sounds/temple-bells.mp3?t=${timestamp || new Date().getTime()}`)
        if (!response.ok) {
          throw new Error(`加载失败: ${response.status} ${response.statusText}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        if (audioContextRef.current) {
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
          endSoundBufferRef.current = audioBuffer
          console.log('结束引导音频加载成功，时长:', audioBuffer.duration)
        }
      } else {
        // 根据选择的引导语类型加载对应的音频
        const audioPath = `/ai-sounds/end_${selectedGuidance.id}.mp3?t=${timestamp || new Date().getTime()}`
        const response = await fetch(audioPath)
        if (!response.ok) {
          throw new Error(`加载失败: ${response.status} ${response.statusText}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        if (audioContextRef.current) {
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
          endSoundBufferRef.current = audioBuffer
          console.log('结束引导音频加载成功，时长:', audioBuffer.duration)
        }
        }
      } catch (error) {
        console.error('加载结束引导音频失败:', error)
    }
  }

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
        console.log(`开始加载开始引导音频: ${selectedGuidance?.id}`)
        if (selectedGuidance?.id === 'none') {
          // 无引导语模式不加载音频
          startSoundRef.current = null
          return
        }
        
        // 根据选择的引导语类型加载对应的音频
        const audioPath = `/ai-sounds/start_${selectedGuidance?.id}.mp3`
        console.log('加载音频路径:', audioPath);
        
        // 先清理之前的音频
        if (startSoundRef.current) {
          startSoundRef.current.pause();
          startSoundRef.current = null;
        }
        
        startSoundRef.current = new Audio(audioPath)
        startSoundRef.current.volume = volume / 100
        // 预加载音频
        startSoundRef.current.load()
          console.log('开始引导音频加载成功')
      } catch (error) {
        console.error('加载开始引导音频失败:', error)
      }
    }

    // 加载中间引导音频
    const loadMidSound = async () => {
      try {
        console.log(`开始加载中间引导音频: ${selectedGuidance?.id}`)
        if (selectedGuidance?.id === 'none') {
          // 无引导语模式不加载音频
          midSoundRef.current = null
          return
        }
        
        // 根据选择的引导语类型加载对应的音频
        const audioPath = `/ai-sounds/mid_${selectedGuidance?.id}.mp3`
        console.log('加载音频路径:', audioPath);
        
        // 先清理之前的音频
        if (midSoundRef.current) {
          midSoundRef.current.pause();
          midSoundRef.current = null;
        }
        
        midSoundRef.current = new Audio(audioPath)
        midSoundRef.current.volume = volume / 100
        // 预加载音频
        midSoundRef.current.load()
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
  }, [selectedGuidance, volume])

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
    
    // 保存当前设置，而不是使用默认设置
    setTimeLeft(duration * 60);
    
    // 如果时间小于10分钟且当前选择的不是"无引导语"，强制设置为"无引导语"
    if (duration < 10 && selectedGuidance?.id !== 'none') {
      const noneGuidance = guidances.find(g => g.id === 'none') as unknown as GuidanceType;
      if (noneGuidance) {
        setSelectedGuidance(noneGuidance);
      }
    }
    
    // 重置引导音频状态
    setGuideState('none');
    midSoundPlayedRef.current = false;
    audioPositionRef.current = {start: 0, mid: 0, end: 0};
    
    // 如果背景音效已暂停，重新开始播放
    if (selectedSound && audioRef.current && audioRef.current.paused) {
      audioRef.current.volume = volume / 100;
      audioRef.current.play().catch(error => {
        console.error('重新播放背景音效失败:', error);
      });
    }
    
    // 设置isPlaying状态
    setIsPlaying(autoStart);
  };

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
        startSoundRef.current = new Audio(`/ai-sounds/start_${selectedGuidance?.id}.mp3?t=${timestamp}`)
        startSoundRef.current.load() // 确保加载新文件
        startSoundRef.current.volume = volume / 100
      }
      
      if (midSoundRef.current) {
        midSoundRef.current.pause()
        midSoundRef.current = new Audio(`/ai-sounds/mid_${selectedGuidance?.id}.mp3?t=${timestamp}`)
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

  // 使用 hook 加载引导语内容
  const { guidanceTexts: dynamicGuidanceTexts, loading: guidanceLoading, error: guidanceError } = useGuidanceTexts();
  
  // 合并引导语数据，优先使用动态加载的内容
  const guidances = guidanceLoading ? defaultGuidanceTexts : dynamicGuidanceTexts;
  
  // 加载引导语文本
  useEffect(() => {
    const loadGuidanceText = async () => {
      if (!selectedGuidance) {
        setGuidanceFullText('无引导语模式，专注于自己的呼吸和感受，享受宁静的冥想时光...');
        return;
      }
      
      if (selectedGuidance.id === 'none') {
        setGuidanceFullText('无引导语模式，专注于自己的呼吸和感受，享受宁静的冥想时光...');
        return;
      }
      
      try {
        // 如果已经有段落内容，直接使用
        if (selectedGuidance.paragraphs && selectedGuidance.paragraphs.length > 0) {
          setGuidanceFullText(selectedGuidance.paragraphs.join('\n'));
          return;
        }
        
        // 否则从文件加载
        const response = await fetch(`/ai-txts/${selectedGuidance.id}.txt`);
        if (!response.ok) {
          throw new Error(`加载文本失败: ${response.status}`);
        }
        const text = await response.text();
        setGuidanceFullText(text);
      } catch (error) {
        console.error('加载引导语文本失败:', error);
        setGuidanceFullText('无法加载引导语文本');
      }
    };
    
    loadGuidanceText();
  }, [selectedGuidance]);
  
  // 如果组件尚未挂载，先返回一个基础结构
  if (!mounted) {
  return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-indigo-950 text-white">
        <div className="h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
                    </div>
    );
  }
  
  // 修复 sound.id 和 sound.icon 的使用
  const handleSoundSelect = (sound: SoundData) => {
    setSelectedSound(sound);
    // 其他逻辑...
  };

  // 处理引导语选择
  const handleGuidanceSelect = (guidance: GuidanceType) => {
    // 如果正在播放，不允许切换引导语
    if (isPlaying) return;
    
    // 清理当前的音频资源
    if (startSoundRef.current) {
      startSoundRef.current.pause();
      startSoundRef.current = null;
    }
    if (midSoundRef.current) {
      midSoundRef.current.pause();
      midSoundRef.current = null;
    }
    
    // 重置引导语状态
    setGuideState('none');
    midSoundPlayedRef.current = false;
    audioPositionRef.current = {start: 0, mid: 0, end: 0};
    
    // 设置新的引导语
    setSelectedGuidance(guidance);
    
    // 如果选择的不是"无引导语"且当前时间小于10分钟，自动设置为10分钟
    if (guidance.id !== 'none' && selectedDuration < 10) {
      toast.info('引导语需要至少10分钟的冥想时间，已自动调整为10分钟');
      setSelectedDuration(10);
      setTimeLeft(10 * 60);
    } else {
      // 重置计时器，但不自动开始
      resetTimer(selectedDuration, false);
    }
    
    // 关闭选择对话框
    setShowGuidanceSelector(false);
  };

  // 添加缺失的 stopEndSound 函数
  const stopEndSound = () => {
    // 停止所有活跃的音频源
    activeAudioSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (error) {
        console.error('停止音频源失败:', error);
      }
    });
    
    // 清空活跃音频源列表
    activeAudioSourcesRef.current = [];
    
    // 重置状态
    setIsPlayingEndSound(false);
    setGuideState('none');
  };

  // 音量控制
  const handleVolumeChange = (value: number) => {
    setVolume(value);
    setIsMuted(value === 0);
    
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
  };
  
  // 切换静音
  const toggleMute = () => {
                          if (isMuted) {
      setIsMuted(false);
      setVolume(volume === 0 ? 80 : volume);
      if (audioRef.current) {
        audioRef.current.volume = (volume === 0 ? 80 : volume) / 100;
      }
                          } else {
      setIsMuted(true);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  };
  
  // 播放/暂停切换
  const togglePlayPause = () => {
    if (isPlayingEndSound) {
      stopEndSound();
    } else if (isPlaying) {
      setIsPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else {
      // 如果时间为0，说明已经结束，需要重置
      if (timeLeft === 0) {
        // 重置为当前选择的时长，而不是默认时长
        resetTimer(selectedDuration, true);
      } else {
        setIsPlaying(true);
        startTimer();
      }
    }
  };
  
  // 启动计时器
  const startTimer = () => {
    // 如果正在播放结束音频，不启动计时器
    if (isPlayingEndSound) return;
    
    // 如果选择了引导语且不是"无引导语"，则设置引导状态为'start'
    if (selectedGuidance && selectedGuidance.id !== 'none') {
      console.log('设置引导状态为start，准备播放开始引导语');
      setGuideState('start');
    }
    
    // 设置中间引导语播放标记为未播放
    midSoundPlayedRef.current = false;
    
    // 启动计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        // 如果时间到了，停止计时器并播放结束音效
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsPlaying(false);
          
          // 停止背景音效
          if (audioRef.current) {
            // 不直接暂停，而是逐渐降低音量
            const fadeOutInterval = setInterval(() => {
              if (audioRef.current) {
                if (audioRef.current.volume > 0.05) {
                  audioRef.current.volume -= 0.05;
                } else {
                  audioRef.current.pause();
                  clearInterval(fadeOutInterval);
                }
              } else {
                clearInterval(fadeOutInterval);
              }
            }, 100);
          }
          
          // 调用播放结束音效的函数
          playEndSound();
          return 0;
        }
        
        // 计算剩余时间的一半，用于播放中间引导语
        const halfTime = selectedDuration * 30; // 总时间的一半（秒）
        
        // 如果时间过了一半，且选择了引导语，且不是"无引导语"，且中间引导语还未播放
        // 且冥想时间至少为10分钟
        if (prev <= halfTime && selectedGuidance && selectedGuidance.id !== 'none' 
            && !midSoundPlayedRef.current && selectedDuration >= 10) {
          // 设置中间引导语播放标记为已播放
          midSoundPlayedRef.current = true;
          // 设置引导状态为'mid'
          console.log('设置引导状态为mid，准备播放中间引导语');
          setGuideState('mid');
        }
        
        return prev - 1;
      });
    }, 1000);
  };

  // 播放结束音效
  const playEndSound = async () => {
    // 确保音频上下文和缓冲区已加载
    if (!audioContextRef.current || !endSoundBufferRef.current) {
      console.error('音频资源未加载完成');
      return;
    }

    try {
      // 设置正在播放结束音频状态
      setIsPlayingEndSound(true);
      
      // 恢复音频上下文（如果被暂停）
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // 只有在时间至少10分钟且不是"无引导语"时才设置引导状态为end
      if (selectedDuration >= 10 && selectedGuidance?.id !== 'none') {
        console.log('设置引导状态为end，准备播放结束引导语');
        setGuideState('end');
      }
      
      // 获取当前音频上下文时间
      const currentTime = audioContextRef.current.currentTime;
      
      // 创建音频源节点（结束音效）
      const endSoundSource = audioContextRef.current.createBufferSource();
      endSoundSource.buffer = endSoundBufferRef.current;
      
      // 添加到活跃音频源列表
      activeAudioSourcesRef.current.push(endSoundSource);
      
      // 创建增益节点（用于控制音量）
      const endSoundGain = audioContextRef.current.createGain();
      endSoundGain.gain.value = volume / 100;
      
      // 连接节点
      endSoundSource.connect(endSoundGain);
      endSoundGain.connect(audioContextRef.current.destination);
      
      // 获取音频的持续时间
      const endSoundDuration = endSoundBufferRef.current.duration;
      
      // 开始播放
      endSoundSource.start(currentTime);
      console.log('开始播放结束引导语，持续时间:', endSoundDuration);
      
      // 设置一个定时器，在音频播放完成后重置状态
      setTimeout(() => {
        console.log('结束引导语播放完成');
        setGuideState('none');
        setIsPlayingEndSound(false);
      }, endSoundDuration * 1000 + 500); // 添加500ms的缓冲时间
      
    } catch (error) {
      console.error('结束音效播放失败:', error);
      // 出错时重置状态
      setGuideState('none');
      setIsPlayingEndSound(false);
    }
  };

  // 在 UI 中显示加载状态
  if (guidanceLoading) {
    return (
      <div className={`min-h-screen ${themeStyles.background} ${themeStyles.text} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current mx-auto mb-4"></div>
          <p>加载引导语内容中...</p>
        </div>
      </div>
    );
  }
  
  // 显示错误信息
  if (guidanceError) {
    return (
      <div className={`min-h-screen ${themeStyles.background} ${themeStyles.text} flex items-center justify-center`}>
        <div className="text-center p-4 max-w-md">
          <p className="text-red-500 mb-4">加载引导语内容失败</p>
          <p>{guidanceError}</p>
          <Button 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeStyles.background} ${themeStyles.text}`}>
      {/* 返回按钮 */}
      <div className="fixed top-4 left-4 z-50">
      <BackButton />
        </div>

      {/* 音频设置按钮组 - 固定在右上角 */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* 背景音效选择 - 保持可用 */}
          <Dialog>
            <DialogTrigger asChild>
                  <Button
              variant="outline" 
                    size="sm"
              className={`rounded-full ${isDarkThemeTop ? 'bg-indigo-950/50 border-indigo-600/30 text-indigo-300 hover:bg-indigo-900/50' : 'bg-blue-50/80 border-blue-300/50 text-blue-700 hover:bg-blue-100/80'}`}
                  >
              <Music size={16} className="mr-1" />
              {t("Sounds", "背景音效")}
                  </Button>
            </DialogTrigger>
          <DialogContent className={`${isDarkThemeTop ? 'bg-indigo-950 border-indigo-800/30 text-indigo-100' : 'bg-white border-blue-200/50 text-slate-800'} max-w-md max-h-[80vh] overflow-y-auto`}>
              <DialogHeader>
                <DialogTitle>{t("Choose Background Sound", "选择背景音效")}</DialogTitle>
              </DialogHeader>
              
              {/* 无声选项 */}
                <Button
                variant="outline"
                className={`w-full flex flex-col items-center justify-center p-4 h-auto mb-4 ${
                  !selectedSound 
                    ? (theme === 'dark' ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                    : (theme === 'dark' ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                }`}
                onClick={() => setSelectedSound(null)}
              >
                <VolumeX size={24} className={isDarkThemeTop ? 'text-indigo-300 mb-2' : 'text-blue-600 mb-2'} />
                <span className="text-sm">{t("No Sound", "无声音")}</span>
                </Button>

              {/* 分类标签页 */}
              <Tabs defaultValue="nature" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="nature" className={`${isDarkThemeTop ? 'data-[state=active]:bg-indigo-800/50' : 'data-[state=active]:bg-blue-100'}`}>
                    自然
                  </TabsTrigger>
                  <TabsTrigger value="rain" className={`${isDarkThemeTop ? 'data-[state=active]:bg-indigo-800/50' : 'data-[state=active]:bg-blue-100'}`}>
                    雨声
                  </TabsTrigger>
                  <TabsTrigger value="city" className={`${isDarkThemeTop ? 'data-[state=active]:bg-indigo-800/50' : 'data-[state=active]:bg-blue-100'}`}>
                    城市
                  </TabsTrigger>
                  <TabsTrigger value="end" className={`${isDarkThemeTop ? 'data-[state=active]:bg-indigo-800/50' : 'data-[state=active]:bg-blue-100'}`}>
                    结束
                  </TabsTrigger>
                </TabsList>

                {/* 自然音效 */}
                <TabsContent value="nature" className="mt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {sounds
                      .filter(sound => ['bird', 'stream', 'leaves', 'campfire', 'forest-night', 'waves', 'breeze', 'waterfall', 'beach'].includes(sound.id))
                      .map((sound) => (
                        <Button
                          key={sound.id}
                          variant="outline"
                          className={`flex flex-col items-center justify-center p-4 h-auto ${
                            selectedSound?.id === sound.id 
                              ? (isDarkThemeTop ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                              : (isDarkThemeTop ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                          }`}
                          onClick={() => handleSoundSelect(sound)}
                        >
                          <SoundIcon iconType={sound.iconType} className={`text-2xl mb-2 ${isDarkThemeTop ? 'text-indigo-300' : 'text-blue-600'}`} />
                          <span className="text-sm">{t(sound.name, sound.name)}</span>
                        </Button>
                    ))}
          </div>
                </TabsContent>

                {/* 雨声 */}
                <TabsContent value="rain" className="mt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {sounds
                      .filter(sound => ['light-rain', 'heavy-rain', 'roof-rain', 'window-rain', 'thunder-rain', 'rain-leaves', 'rain-puddle'].includes(sound.id))
                      .map((sound) => (
                      <Button
                          key={sound.id}
                          variant="outline"
                          className={`flex flex-col items-center justify-center p-4 h-auto ${
                            selectedSound?.id === sound.id 
                              ? (isDarkThemeTop ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                              : (isDarkThemeTop ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                          }`}
                          onClick={() => handleSoundSelect(sound)}
                        >
                          <SoundIcon iconType={sound.iconType} className={`text-2xl mb-2 ${isDarkThemeTop ? 'text-indigo-300' : 'text-blue-600'}`} />
                          <span className="text-sm">{t(sound.name, sound.name)}</span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                {/* 城市 */}
                <TabsContent value="city" className="mt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {sounds
                      .filter(sound => ['city-traffic', 'cafe', 'keyboard', 'subway', 'park', 'train'].includes(sound.id))
                      .map((sound) => (
                    <Button
                          key={sound.id}
                          variant="outline"
                          className={`flex flex-col items-center justify-center p-4 h-auto ${
                            selectedSound?.id === sound.id 
                              ? (isDarkThemeTop ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                              : (isDarkThemeTop ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                          }`}
                          onClick={() => handleSoundSelect(sound)}
                        >
                          <SoundIcon iconType={sound.iconType} className={`text-2xl mb-2 ${isDarkThemeTop ? 'text-indigo-300' : 'text-blue-600'}`} />
                          <span className="text-sm">{t(sound.name, sound.name)}</span>
                    </Button>
                    ))}
                    </div>
                </TabsContent>

                {/* 结束声 */}
                <TabsContent value="end" className="mt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {sounds
                      .filter(sound => ['temple-bells'].includes(sound.id))
                      .map((sound) => (
                    <Button
                          key={sound.id}
                          variant="outline"
                          className={`flex flex-col items-center justify-center p-4 h-auto ${
                            selectedSound?.id === sound.id 
                              ? (isDarkThemeTop ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                              : (isDarkThemeTop ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                          }`}
                          onClick={() => handleSoundSelect(sound)}
                        >
                          <SoundIcon iconType={sound.iconType} className={`text-2xl mb-2 ${isDarkThemeTop ? 'text-indigo-300' : 'text-blue-600'}`} />
                          <span className="text-sm">{t(sound.name, sound.name)}</span>
                    </Button>
                    ))}
                    </div>
                </TabsContent>
              </Tabs>
          </DialogContent>
          </Dialog>

        {/* 引导语选择 - 冥想时禁用 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
              variant="outline" 
              size="sm"
              disabled={isPlaying || isPlayingEndSound}
              className={`rounded-full ${
                isPlaying || isPlayingEndSound 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              } ${isDarkThemeTop ? 'bg-indigo-950/50 border-indigo-600/30 text-indigo-300 hover:bg-indigo-900/50' : 'bg-blue-50/80 border-blue-300/50 text-blue-700 hover:bg-blue-100/80'}`}
            >
              <BookOpen size={16} className="mr-1" />
              {t("Guidance", "引导语")}
              </Button>
            </DialogTrigger>
          <DialogContent className={`${isDarkThemeTop ? 'bg-indigo-950 border-indigo-800/30 text-indigo-100' : 'bg-white border-blue-200/50 text-slate-800'} max-w-md max-h-[80vh] overflow-y-auto`}>
              <DialogHeader>
              <DialogTitle>{t("Choose Guidance", "选择引导语")}</DialogTitle>
              </DialogHeader>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {/* 无引导选项 */}
                <Button
                variant="outline"
                className={`flex items-center justify-between p-4 h-auto ${
                  !selectedGuidance 
                    ? (isDarkThemeTop ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                    : (isDarkThemeTop ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                }`}
                onClick={() => {
                  setSelectedGuidance(null);
                  // 重置计时器
                  setTimeLeft(selectedDuration * 60);
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{t("No Guidance", "无引导语")}</span>
                  <span className="text-xs opacity-70 mt-1">{t("Pure meditation experience", "纯净冥想体验")}</span>
                </div>
                </Button>
              
              {/* 引导语选项 */}
              {guidances.map((guidance) => (
                  <Button
                  key={guidance.id}
                  variant="outline"
                  className={`flex items-center justify-between p-4 h-auto ${
                    selectedGuidance?.id === guidance.id
                      ? (isDarkThemeTop ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                      : (isDarkThemeTop ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                  }`}
                  onClick={() => {
                    // 创建一个包含所有必要属性的 GuidanceType 对象
                    const guidanceObj: GuidanceType = {
                      id: guidance.id,
                      title: guidance.title,
                      description: guidance.description,
                      paragraphs: guidance.paragraphs,
                      content: guidance.paragraphs.join('\n')
                    };
                    handleGuidanceSelect(guidanceObj);
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{t(guidance.title, guidance.title)}</span>
                    <span className="text-xs opacity-70 mt-1">{t(guidance.description, guidance.description)}</span>
                  </div>
                  {selectedGuidance?.id === guidance.id && <Check size={18} />}
                </Button>
                ))}
              </div>
          </DialogContent>
          </Dialog>

        {/* 时长选择 - 冥想时禁用 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
              variant="outline" 
              size="sm"
              disabled={isPlaying}
              className={`rounded-full ${
                isPlaying 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              } ${isDarkThemeTop ? 'bg-indigo-950/50 border-indigo-600/30 text-indigo-300 hover:bg-indigo-900/50' : 'bg-blue-50/80 border-blue-300/50 text-blue-700 hover:bg-blue-100/80'}`}
            >
              <span className="mr-1">{selectedDuration}</span>
              {t("min", "分钟")}
              </Button>
            </DialogTrigger>
          <DialogContent className={`${isDarkThemeTop ? 'bg-indigo-950 border-indigo-800/30 text-indigo-100' : 'bg-white border-blue-200/50 text-slate-800'} max-w-md`}>
              <DialogHeader>
              <DialogTitle>{t("Choose Duration", "选择冥想时长")}</DialogTitle>
              </DialogHeader>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[5, 10, 15, 20, 30, 45, 60].map((duration) => (
                            <Button
                  key={duration}
                  variant="outline"
                  size="sm"
                  disabled={isPlaying || isPlayingEndSound}
                  onClick={() => {
                    // 如果选择的时间小于10分钟且当前不是"无引导语"，提示用户并切换到"无引导语"
                    if (duration < 10 && selectedGuidance && selectedGuidance.id !== 'none') {
                      toast.info('短于10分钟的冥想将切换为无引导语模式');
                      // 切换到无引导语模式
                      setSelectedGuidance(null);
                    }
                    
                    // 重置计时器
                    setSelectedDuration(duration);
                    setTimeLeft(duration * 60);
                    
                    // 重置引导语状态
                    setGuideState('none');
                    midSoundPlayedRef.current = false;
                    audioPositionRef.current = {start: 0, mid: 0, end: 0};
                  }}
                  className={`${
                    selectedDuration === duration
                      ? (isDarkThemeTop ? 'bg-indigo-800/50 border-indigo-600 text-white' : 'bg-blue-100 border-blue-400 text-blue-800')
                      : (isDarkThemeTop ? 'bg-transparent border-indigo-800/30 text-indigo-300' : 'bg-transparent border-blue-300/50 text-blue-700')
                  } ${
                    (isPlaying || isPlayingEndSound) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {duration} {t("min", "分钟")}
                            </Button>
              ))}
                      </div>
            
            {/* 自定义时长 */}
            <div className="mt-4">
              <Label htmlFor="custom-duration" className="text-sm mb-2 block">
                {t("Custom Duration", "自定义时长")}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="custom-duration"
                  type="number"
                  min="1"
                  max="180"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(parseInt(e.target.value) || 5)}
                  disabled={isPlaying || isPlayingEndSound}
                  className={`${isDarkThemeTop ? 'bg-indigo-900/50 border-indigo-700' : 'bg-blue-50 border-blue-200'}`}
                />
                <Button
                  onClick={() => {
                    if (customDuration >= 1 && customDuration <= 180) {
                      setSelectedDuration(customDuration);
                      setTimeLeft(customDuration * 60);
                    }
                  }}
                  disabled={isPlaying || isPlayingEndSound || customDuration < 1 || customDuration > 180}
                  className={isDarkThemeTop ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-500 hover:bg-blue-600'}
                >
                  {t("Set", "设置")}
                </Button>
        </div>
      </div>
          </DialogContent>
          </Dialog>

        {/* 音量控制 - 冥想时禁用 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
              variant="outline" 
              size="sm"
              disabled={isPlaying}
              className={`rounded-full ${
                isPlaying 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              } ${isDarkThemeTop ? 'bg-indigo-950/50 border-indigo-600/30 text-indigo-300 hover:bg-indigo-900/50' : 'bg-blue-50/80 border-blue-300/50 text-blue-700 hover:bg-blue-100/80'}`}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </Button>
            </DialogTrigger>
          <DialogContent className={`${isDarkThemeTop ? 'bg-indigo-950 border-indigo-800/30 text-indigo-100' : 'bg-white border-blue-200/50 text-slate-800'} max-w-xs`}>
                <DialogHeader>
              <DialogTitle>{t("Volume Control", "音量控制")}</DialogTitle>
                </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className={isDarkThemeTop ? 'text-indigo-300 hover:bg-indigo-900/50' : 'text-blue-700 hover:bg-blue-100/80'}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>
                <span className="text-lg font-medium">{volume}%</span>
        </div>
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => handleVolumeChange(value[0])}
                className={isDarkThemeTop ? 'bg-indigo-800/30' : 'bg-blue-200/50'}
              />
              <div className="grid grid-cols-3 gap-2">
              <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => handleVolumeChange(25)}
                  className={volume === 25 ? (isDarkThemeTop ? 'bg-indigo-800/50' : 'bg-blue-100') : ''}
                >
                  25%
              </Button>
              <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => handleVolumeChange(50)}
                  className={volume === 50 ? (isDarkThemeTop ? 'bg-indigo-800/50' : 'bg-blue-100') : ''}
                >
                  50%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleVolumeChange(75)}
                  className={volume === 75 ? (isDarkThemeTop ? 'bg-indigo-800/50' : 'bg-blue-100') : ''}
                >
                  75%
              </Button>
            </div>
            </div>
          </DialogContent>
      </Dialog>
        
        {/* 引导语显示开关 - 改为纵向文本按钮 */}
        <motion.div 
          className={`fixed right-8 top-1/2 -translate-y-1/2 flex flex-col items-center ${
            isDarkThemeTop 
              ? 'text-indigo-300/60' 
              : 'text-blue-700/60'
          } cursor-pointer z-50`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={() => setShowGuidance(!showGuidance)}
        >
          <span className="text-xs writing-mode-vertical tracking-wider">
            {showGuidance ? "隐藏引导语" : "显示引导语"}
          </span>
        </motion.div>
      </div>
      
      {/* 添加垂直文本的样式 */}
      <style jsx global>{`
        .writing-mode-vertical {
          writing-mode: vertical-rl;
          text-orientation: upright;
          letter-spacing: 0.2em;
        }
      `}</style>
      
      {/* 主要内容区域 */}
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* 背景动画 */}
        <div className="absolute inset-0 -z-10">
          {/* 星空效果 */}
          <div className="absolute inset-0 opacity-80">
            {Array.from({ length: 70 }).map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full ${isDarkThemeTop ? 'bg-white' : 'bg-blue-500'}`}
                style={{
                  width: Math.random() * 3 + 1 + 'px',
                  height: Math.random() * 3 + 1 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.6 + 0.3,
                  animation: `twinkle ${Math.random() * 5 + 5}s ease-in-out ${Math.random() * 5}s infinite alternate`
                }}
              />
            ))}
          </div>
          
          {/* 柔和的波浪动画 */}
          <div 
            className="absolute inset-0 opacity-20 -z-5"
            style={{ 
              background: isDarkThemeTop 
                ? "radial-gradient(circle at center, rgba(99, 102, 241, 0.3) 0%, transparent 70%)"
                : "radial-gradient(circle at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
              transform: "scale(1.5)",
              animation: "pulse 15s ease-in-out infinite"
            }}
              />
            </div>
        
        {/* 呼吸球部分 */}
        <div className="relative z-20 w-[70vmin] h-[70vmin] flex items-center justify-center">
          {/* 固定位置的内容 - 使用绝对定位确保不会抖动 */}
          <div className="absolute inset-0 z-30">
            <div className="relative w-full h-full flex flex-col items-center">
              {/* 计时器显示 - 放在正中间偏上 */}
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className={`text-6xl md:text-7xl lg:text-8xl font-light tracking-widest ${themeStyles.primaryText}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
              
              {/* 呼吸提示文本 - 放在计时器下方固定距离 */}
              <div className="absolute top-[50%] left-1/2 -translate-x-1/2 text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isPlaying ? (breathingState === 'inhale' || breathingState === 'hold' ? 'inhale' : 'exhale') : 'paused'}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className={`text-base md:text-lg font-light ${isDarkThemeTop ? 'text-indigo-500' : 'text-blue-900'}`}
                  >
                    {!isPlaying 
                      ? "冥想，静心开始。" 
                      : (breathingState === 'inhale' || breathingState === 'hold') 
                        ? "冥想中...吸气" 
                        : "冥想中...呼气"}
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* 播放/暂停按钮 - 放在文本下方固定距离 */}
              <div className="absolute top-[65%] left-1/2 -translate-x-1/2 text-center">
              <Button
                  disabled={isPlayingEndSound && guideState !== 'end'}
                  onClick={togglePlayPause}
                  className={`rounded-full w-14 h-14 ${
                    isPlayingEndSound 
                      ? (isDarkThemeTop ? 'bg-indigo-800/50 text-indigo-300 cursor-not-allowed' : 'bg-blue-300/50 text-blue-700 cursor-not-allowed')
                      : isPlaying
                        ? (isDarkThemeTop ? 'bg-indigo-700 hover:bg-indigo-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white')
                        : (isDarkThemeTop ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-blue-500 hover:bg-blue-400 text-white')
                  }`}
                >
                  {isPlaying ? <Pause size={24} /> : 
                   timeLeft === 0 ? <RotateCcw size={24} /> : <Play size={24} />}
              </Button>
            </div>
    </div>
          </div>

          {/* 呼吸圆圈 - 根据呼吸状态变化 */}
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: isDarkThemeTop 
                ? 'radial-gradient(circle, rgba(224,231,255,0.9) 0%, rgba(165,180,252,0.8) 100%)' 
                : 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(96,165,250,0.5) 100%)',
              width: breathingState === 'inhale' ? '70vmin' : 
                    breathingState === 'hold' ? '70vmin' : 
                    breathingState === 'exhale' ? '40vmin' : '40vmin',
              height: breathingState === 'inhale' ? '70vmin' : 
                     breathingState === 'hold' ? '70vmin' : 
                     breathingState === 'exhale' ? '40vmin' : '40vmin',
              opacity: breathingState === 'inhale' ? 1 : 
                      breathingState === 'hold' ? 1 : 
                      breathingState === 'exhale' ? 0.9 : 0.9,
              boxShadow: isDarkThemeTop
                ? (breathingState === 'inhale' ? '0 0 100px rgba(79,70,229,0.7), 0 0 150px rgba(79,70,229,0.9)' :
                  breathingState === 'hold' ? '0 0 150px rgba(79,70,229,0.9)' :
                  breathingState === 'exhale' ? '0 0 150px rgba(79,70,229,0.9), 0 0 100px rgba(79,70,229,0.7)' :
                  '0 0 100px rgba(79,70,229,0.7)')
                : (breathingState === 'inhale' ? '0 0 50px rgba(59,130,246,0.5), 0 0 100px rgba(59,130,246,0.7)' :
                  breathingState === 'hold' ? '0 0 100px rgba(59,130,246,0.7)' :
                  breathingState === 'exhale' ? '0 0 100px rgba(59,130,246,0.7), 0 0 50px rgba(59,130,246,0.5)' :
                  '0 0 50px rgba(59,130,246,0.5)'),
              transition: `all ${
                breathingState === 'inhale' ? 4 : 
                breathingState === 'hold' ? 2 : 
                breathingState === 'exhale' ? 4 : 2
              }s ease-in-out`
            }}
            className="rounded-full z-20"
          />
        </div>
        
        {/* 引导文本显示 - 改为右侧固定侧边栏 */}
        <AnimatePresence>
          {showGuidance && selectedGuidance && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={`fixed right-0 top-0 h-full w-80 ${
                isDarkThemeTop 
                  ? 'bg-indigo-950/95 border-l border-indigo-800/30 text-indigo-100' 
                  : 'bg-white/95 border-l border-blue-200/50 text-slate-800'
              } backdrop-blur-sm z-30 p-6 pt-20 overflow-y-auto`}
            >
              <div className="prose prose-sm max-w-none">
                <h3 className={`${isDarkThemeTop ? 'text-indigo-300' : 'text-blue-700'} mb-4`}>
                  {selectedGuidance.title}
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {selectedGuidance.content}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 音频元素 */}
      <audio ref={audioRef} loop />
      <audio ref={startSoundRef} />
      <audio ref={midSoundRef} />
      <audio ref={endSoundRef} />
    </div>
  );
}