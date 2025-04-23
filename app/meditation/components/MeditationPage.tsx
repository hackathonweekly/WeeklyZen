"use client";

import { useState, useEffect, useRef, useCallback, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Music,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Clock,
  ChevronDown,
  Headphones,
  Menu,
  AlarmCheck,
  AlarmPlus,
  CheckIcon,
  Loader2,
  Moon,
  Settings,
  Sun,
  Text,
  X,
  PencilIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider as UISlider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from 'sonner';
import { sounds } from '@/app/sounds';
import type { SoundData } from '@/app/sounds';
import { courses, defaultCourse } from '@/app/courses';
import type { CourseData } from '@/app/courses';
import { useAppTheme } from '@/contexts/theme-context';
import { useTheme } from 'next-themes';
import { useGuidanceTexts } from '@/app/guidance';
import type { GuidanceType } from '@/app/guidance';
import { AudioManager } from '../utils/AudioUtils';
import { SoundSelector } from './SoundSelector';
import { GuidanceSelector } from './GuidanceSelector';
import { CourseSelector } from './CourseSelector';
import { BreathingSphere } from '@/components/breathing-sphere';
import { MeditationHeader } from './MeditationHeader';
import { MeditationEncouragement } from './MeditationEncouragement';

// 简单的翻译函数
const t = (zh: string, en: string): string => {
  // 这里可以根据实际需求实现语言切换逻辑
  return zh; // 默认返回中文
};

// 可选的冥想时长
const durationOptions = [
  { value: 5 / 60, label: '5秒', isTest: true },
  { value: 5, label: '5分钟' },
  { value: 10, label: '10分钟' },
  { value: 15, label: '15分钟' },
  { value: 30, label: '30分钟' },
  { value: 60, label: '60分钟' },
];

export default function MeditationPage() {
  const router = useRouter();

  // 主题相关
  const { isDarkTheme } = useAppTheme();
  const { theme, setTheme } = useTheme();

  // 音频管理器
  const audioManager = useRef<AudioManager>(new AudioManager());

  // 状态管理
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingEndSound, setIsPlayingEndSound] = useState(false);
  const [showDurationMenu, setShowDurationMenu] = useState(false);

  // 默认使用小溪声音
  const defaultSound = sounds.find(s => s.id === 'creek') || null;
  const [selectedSound, setSelectedSound] = useState<SoundData | null>(defaultSound);
  const [volume, setVolume] = useState(25);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // 添加自定义引导语音频URL状态
  const [customAudioUrl, setCustomAudioUrl] = useState<string | undefined>(undefined);

  // 潮汐冥想课程相关
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [courseAudio, setCourseAudio] = useState<HTMLAudioElement | null>(null);
  const [showCourseDialog, setShowCourseDialog] = useState(false);

  // 引导语相关
  const { guidanceTexts } = useGuidanceTexts();
  const [selectedGuidance, setSelectedGuidance] = useState<GuidanceType | null>({
    id: 'custom-guidance',
    title: t('创建专属引导语', 'Create Custom Guidance'),
    description: t('分享你的困扰，AI为你生成个性化的冥想引导', 'Share your concerns, AI generates personalized meditation guidance'),
    paragraphs: [],
    content: <></>,
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/start.mp3',
  });

  // 初始化引导语音频对象
  const [guidanceAudio, setGuidanceAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/start.mp3');
      audio.volume = 0.25;
      setGuidanceAudio(audio);
    }
  }, []);

  // 对话框状态
  const [showSoundDialog, setShowSoundDialog] = useState(false);
  const [showGuidanceDialog, setShowGuidanceDialog] = useState(false);
  const [showGuidanceTextDialog, setShowGuidanceTextDialog] = useState(false);
  const [isShowingEncouragement, setIsShowingEncouragement] = useState(false);
  const [meditationCount, setMeditationCount] = useState(0);

  // 音频元素引用
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);

  // 新增移动端菜单状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 检测是否是移动设备
  const [isMobile, setIsMobile] = useState(false);

  // 加载冥想次数
  useEffect(() => {
    // 从localStorage获取冥想次数
    const count = localStorage.getItem('meditationCount');
    if (count) {
      setMeditationCount(Number.parseInt(count, 10));
    }
  }, []);

  // 监听窗口大小变化
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 初始检测
    checkIsMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkIsMobile);

    // 清理函数
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // 更新倒计时
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // 如果倒计时结束，清除定时器并触发结束事件
            if (interval) clearInterval(interval);
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isPlaying && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft]);

  // 点击外部关闭音量滑块
  useEffect(() => {
    if (showVolumeSlider) {
      const handleClickOutside = (e: MouseEvent) => {
        const volumeContainer = document.getElementById('volume-slider-container');
        const volumeButton = document.getElementById('volume-button');

        if (volumeContainer &&
          volumeButton &&
          !volumeContainer.contains(e.target as Node) &&
          !volumeButton.contains(e.target as Node)) {
          setShowVolumeSlider(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showVolumeSlider]);

  // 组件卸载时清理
  useEffect(() => {
    const currentAudio = audioRef.current;
    const currentEndSound = endSoundRef.current;
    const currentAudioManager = audioManager.current;

    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }

      if (currentEndSound) {
        currentEndSound.pause();
      }
    };
  }, []);

  // 处理音效选择
  const handleSoundSelect = (sound: SoundData | null) => {
    setSelectedSound(sound);
    setShowSoundDialog(false);

    // 如果正在播放，立即切换音效
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();

      if (sound?.audioUrl) {
        audioRef.current.src = sound.audioUrl;
        audioRef.current.volume = isMuted ? 0 : volume / 100;
        audioRef.current.loop = true;
        audioRef.current.play().catch(console.error);
      }
    }
  };

  // 处理引导语选择
  const handleGuidanceSelect = (guidance: GuidanceType) => {
    // 设置选中的引导语
    console.log('[调试] 选中引导语:', guidance.id, guidance.title);
    setSelectedGuidance(guidance);
    setShowGuidanceDialog(false);

    // 重置冥想（包括时间计时器和音频状态）
    console.log('[调试] 重置冥想计时和音频');
    resetMeditation();

    // 根据引导语类型选择正确的音频URL
    let audioUrl = guidance.audioUrl;

    // 如果引导语有音频URL，创建新的音频元素
    if (audioUrl) {
      console.log('[调试] 引导语有音频URL，创建音频元素:', audioUrl);
      const audio = new Audio(audioUrl);
      audio.volume = isMuted ? 0 : volume / 100;
      console.log('[调试] 设置引导语音频音量:', isMuted ? 0 : volume / 100);

      // 如果是自定义引导语且有自定义音频URL，设置播放结束后继续播放自定义音频
      if ((guidance.id === 'custom-guidance' ||
        audioUrl.includes('start.mp3')) &&
        customAudioUrl) {

        console.log('[调试] 设置自定义引导语音频播放结束事件，将播放:', customAudioUrl);

        audio.onended = () => {
          console.log('[调试] 引导语音频播放结束，开始播放自定义音频');

          // 创建新的音频元素播放自定义音频
          const customAudio = new Audio(customAudioUrl);
          customAudio.volume = isMuted ? 0 : volume / 100;

          // 播放自定义音频
          // customAudio.play().then(() => {
          //   console.log('[调试] 自定义音频开始播放成功');
          //   // 保存引用以便于后续控制
          //   setGuidanceAudio(customAudio);
          // }).catch(error => {
          //   console.error('[调试] 播放自定义音频失败:', error);
          //   toast.error('播放自定义音频失败，请重试');
          // });
        };
      }

      audio.onloadeddata = () => console.log('[调试] 引导语音频加载完成');
      audio.onerror = (e) => console.error('[调试] 引导语音频加载出错:', e);

      setGuidanceAudio(audio);

      // 如果当前正在播放冥想，自动播放引导语
      if (isPlaying) {
        audio.play().then(() => {
          console.log('[调试] 引导语音频开始播放成功');
        }).catch(error => {
          console.error('[调试] 播放引导语音频失败:', error);
          toast.error('播放引导语音频失败，请重试');
        });
      }
    } else {
      console.log('[调试] 引导语没有音频URL');
    }
  };

  // 显示鼓励语
  const showEncouragement = () => {
    // 更新冥想次数
    const newCount = meditationCount + 1;
    setMeditationCount(newCount);
    localStorage.setItem('meditationCount', newCount.toString());

    // 显示鼓励对话框
    setIsShowingEncouragement(true);
  };

  // 处理课程选择
  const handleCourseSelect = (course: CourseData | null) => {
    // 先重置状态
    setSelectedCourse(course);
    setShowCourseDialog(false);

    // 如果选择了课程，停止其他音频
    if (course) {
      // 停止引导语音频
      if (guidanceAudio) {
        guidanceAudio.pause();
        guidanceAudio.src = '';
      }
      setSelectedGuidance(null);

      // 停止背景音效
      if (selectedSound) {
        setSelectedSound(null);
      }

      // 如果有正在播放的课程音频，先停止
      if (courseAudio) {
        courseAudio.pause();
        courseAudio.src = '';
      }

      // 更新冥想时长为课程时长
      setSelectedDuration(course.duration);
      setTimeLeft(course.duration * 60);

      // 创建新的课程音频
      const audio = new Audio(course.audioUrl);
      audio.volume = isMuted ? 0 : volume / 100;
      setCourseAudio(audio);

      // 如果正在冥想，自动播放课程
      if (isPlaying) {
        audio.play().catch(error => {
          console.error('播放课程音频失败:', error);
          toast.error('播放课程音频失败，请重试');
        });
      }
    } else {
      // 如果取消选择课程，清理课程音频
      if (courseAudio) {
        courseAudio.pause();
        courseAudio.src = '';
        setCourseAudio(null);
      }
    }
  };

  // 处理音量变化
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);

    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }

    // 更新所有音频音量
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }

    if (guidanceAudio) {
      guidanceAudio.volume = newVolume / 100;
    }

    if (courseAudio) {
      courseAudio.volume = newVolume / 100;
    }
  };

  // 切换静音
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    // 更新所有音频静音状态
    if (audioRef.current) {
      audioRef.current.volume = newMutedState ? 0 : volume / 100;
    }

    if (guidanceAudio) {
      guidanceAudio.volume = newMutedState ? 0 : volume / 100;
    }

    if (courseAudio) {
      courseAudio.volume = newMutedState ? 0 : volume / 100;
    }
  };

  // 切换播放/暂停
  const togglePlayPause = () => {
    const newPlayingState = !isPlaying;
    console.log(`[调试] 切换播放状态: ${isPlaying} -> ${newPlayingState}`);
    setIsPlaying(newPlayingState);

    // 如果开始播放
    if (newPlayingState) {
      // 只有在不是"无引导语"模式下才播放引导语音频
      if (guidanceAudio && selectedGuidance?.id !== 'no-guidance') {
        console.log('[调试] 播放引导语音频...');
        guidanceAudio.volume = isMuted ? 0 : volume / 100;

        // 检查是否需要设置结束后播放自定义音频的逻辑
        if ((selectedGuidance?.id === 'custom-guidance' ||
          guidanceAudio.src.includes('start.mp3')) &&
          customAudioUrl) {

          console.log('[调试] 设置引导语音频播放结束后的回调，将播放自定义音频:', customAudioUrl);

          // 移除之前可能存在的ended事件监听器
          guidanceAudio.onended = null;

          // 添加音频播放结束事件
          guidanceAudio.onended = () => {
            console.log('[调试] 引导语音频播放结束，开始播放自定义音频');

            // 创建新的音频元素播放自定义音频
            const customAudio = new Audio(customAudioUrl);
            customAudio.volume = isMuted ? 0 : volume / 100;

            // 播放自定义音频
            // customAudio.play().then(() => {
            //   console.log('[调试] 自定义音频开始播放成功');
            //   // 保存引用以便于后续控制
            //   setGuidanceAudio(customAudio);
            // }).catch(error => {
            //   console.error('[调试] 播放自定义音频失败:', error);
            //   toast.error('播放自定义音频失败，请重试');
            // });
          };
        }

        guidanceAudio.play().then(() => {
          console.log('[调试] 引导语音频播放成功!');
        }).catch(error => {
          console.error('[调试] 播放引导语音频失败:', error);
          toast.error('播放引导语音频失败，请重试');
        });
      } else if (selectedGuidance?.id === 'no-guidance') {
        console.log('[调试] 无引导语模式，跳过音频播放');
      }

      // 播放背景音效（如果有）
      if (selectedSound && audioRef.current) {
        console.log('[调试] 播放背景音效:', selectedSound.name);
        if (!audioRef.current.src || !audioRef.current.src.includes(selectedSound.id)) {
          audioRef.current.src = selectedSound.audioUrl;
          audioRef.current.loop = true;
        }
        audioRef.current.volume = isMuted ? 0 : volume / 100;
        audioRef.current.play().catch(error => {
          console.error('[调试] 播放音频失败:', error);
          toast.error('播放音频失败，请重试');
        });
      }
    } else {
      // 暂停所有音频
      console.log('[调试] 暂停所有音频');
      if (guidanceAudio) {
        guidanceAudio.pause();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  // 重置冥想
  const resetMeditation = () => {
    console.log('[调试] 开始重置冥想...');
    // 重置播放标记
    hasPlayedCustomAudioRef.current = false;

    // 重置时间到选择的时长
    setTimeLeft(selectedDuration * 60);
    console.log('[调试] 重置计时器到', selectedDuration, '分钟');

    // 确保不在播放状态
    setIsPlaying(false);
    setIsPlayingEndSound(false);

    // 停止所有可能的音效
    audioManager.current.stopAllSounds();

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (endSoundRef.current) {
      endSoundRef.current.pause();
    }

    // 停止引导语音频，但不清除引导语的选择状态
    if (guidanceAudio) {
      console.log('[调试] 停止引导语音频');
      // 移除onended事件监听器
      guidanceAudio.onended = null;
      guidanceAudio.pause();
      // 创建新的音频实例以重置播放位置
      if (selectedGuidance?.audioUrl) {
        console.log('[调试] 创建新的引导语音频实例:', selectedGuidance.audioUrl);
        const audio = new Audio(selectedGuidance.audioUrl);
        audio.volume = isMuted ? 0 : volume / 100;
        audio.onloadeddata = () => console.log('[调试] 新的引导语音频加载完成');
        setGuidanceAudio(audio);
      } else {
        // 如果没有音频URL，则清除引导语音频
        console.log('[调试] 清除引导语音频');
        guidanceAudio.src = '';
        setGuidanceAudio(null);
      }
    } else {
      console.log('[调试] 没有引导语音频需要重置');
    }

    if (courseAudio) {
      console.log('[调试] 停止课程音频');
      courseAudio.pause();
    }

    console.log('[调试] 冥想重置完成');
  };

  // 使用useCallback包装handleTimerEnd函数
  const handleTimerEnd = useCallback(() => {
    // 停止所有音频
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (guidanceAudio) {
      guidanceAudio.pause();
    }
    if (courseAudio) {
      courseAudio.pause();
    }

    // 播放结束音效
    const endSound = async () => {
      try {
        // 加载并播放结束音效
        const buffer = await audioManager.current.loadAudioBuffer('/sounds/temple-bells.mp3', 'end-sound');
        audioManager.current.playSound(buffer, volume / 100, false);

        // 5秒后停止结束音效状态
        setTimeout(() => {
          setIsPlayingEndSound(false);
          audioManager.current.stopAllSounds();
        }, 5000);
      } catch (error) {
        console.error('播放结束音效失败:', error);
        // 尝试使用备用方法播放
        if (endSoundRef.current) {
          endSoundRef.current.src = '/sounds/temple-bells.mp3';
          endSoundRef.current.volume = isMuted ? 0 : volume / 100;
          endSoundRef.current.play().catch(console.error);

          // 音频播放结束后重置状态
          endSoundRef.current.onended = () => {
            setIsPlayingEndSound(false);
          };
        } else {
          setIsPlayingEndSound(false);
        }
      }
    };

    endSound();

    // 显示鼓励信息
    showEncouragement();

    // 重置状态
    setIsPlaying(false);
    setShowGuidanceTextDialog(false);
  }, [guidanceAudio, courseAudio, showEncouragement, volume, isMuted]);

  // 处理时长选择
  const handleDurationSelect = (duration: number) => {
    console.log('[调试] 选择新的冥想时长:', duration, '分钟');
    setSelectedDuration(duration);
    setTimeLeft(duration * 60);
    setShowDurationMenu(false);

    // 重置冥想状态，但保持当前选中的引导语
    console.log('[调试] 重置冥想状态，保持当前引导语');

    // 确保不在播放状态
    setIsPlaying(false);
    setIsPlayingEndSound(false);

    // 停止所有可能的音效
    audioManager.current.stopAllSounds();

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (endSoundRef.current) {
      endSoundRef.current.pause();
    }

    // 如果有引导语音频，停止并从头开始
    if (guidanceAudio && selectedGuidance) {
      console.log('[调试] 停止引导语音频并重置到开始位置');
      guidanceAudio.pause();

      // 创建新的音频实例以重置播放位置
      if (selectedGuidance.audioUrl) {
        console.log('[调试] 创建新的引导语音频实例以重置播放位置:', selectedGuidance.audioUrl);
        const audio = new Audio(selectedGuidance.audioUrl);
        audio.volume = isMuted ? 0 : volume / 100;
        audio.onloadeddata = () => console.log('[调试] 新的引导语音频加载完成');
        setGuidanceAudio(audio);
      }
    }

    if (courseAudio) {
      console.log('[调试] 停止课程音频');
      courseAudio.pause();
    }
  };

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 切换主题
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // 背景色渐变
  const bgGradient = isDarkTheme
    ? 'bg-gradient-to-b from-slate-950 via-blue-950 to-indigo-950'
    : 'bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200';

  // 文本颜色
  const textColor = isDarkTheme ? 'text-white' : 'text-slate-800';

  // 按钮样式
  const buttonStyle = isDarkTheme
    ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-600/30'
    : 'bg-white/80 hover:bg-white text-blue-600 border border-blue-200';

  // 处理显示引导语全文
  const handleShowGuidanceText = () => {
    if (selectedGuidance) {
      setShowGuidanceTextDialog(true);
    }
  };

  // 在useEffect中初始化时添加无引导语和自定义引导语选项
  useEffect(() => {
    // 创建无引导语选项
    const noGuidanceOption = {
      id: 'no-guidance',
      title: t('无引导语', 'No Guidance'),
      description: t('专注于呼吸，无语音引导', 'Focus on your breath without voice guidance'),
      paragraphs: [],
      content: <></>,
      type: 'none'
    };

    // 创建自定义引导语选项
    const customGuidanceOption = {
      id: 'custom-guidance',
      title: t('创建专属引导语', 'Create Custom Guidance'),
      description: t('分享你的困扰，AI为你生成个性化的冥想引导', 'Share your concerns, AI generates personalized meditation guidance'),
      paragraphs: [],
      content: <></>,
      type: 'custom'
    };
    // 设置默认选中为自定义引导语
    setSelectedGuidance({
      id: 'custom-guidance',
      title: t('创建专属引导语', 'Create Custom Guidance'),
      description: t('分享你的困扰，AI为你生成个性化的冥想引导', 'Share your concerns, AI generates personalized meditation guidance'),
      paragraphs: [],
      content: <></>,
      audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/start.mp3',
    });

    // ... [其他初始化代码]
  }, []);

  // 更新showGuidanceDialog的设置逻辑，确保在播放状态下无法打开
  const handleShowGuidanceDialog = () => {
    if (!isPlaying) {
      setShowGuidanceDialog(true);
    } else {
      // 可选：添加提示，告知用户需要先暂停
      toast.info(t('请先暂停冥想后再更换引导语', 'Please pause meditation before changing guidance'));
    }
  };

  // 更新showDurationMenu的设置逻辑
  const handleShowDurationMenu = (open: boolean) => {
    if (!isPlaying) {
      setShowDurationMenu(open);
    } else if (open) {
      // 可选：添加提示，告知用户需要先暂停
      toast.info(t('请先暂停冥想后再更改时长', 'Please pause meditation before changing duration'));
    }
  };

  // 添加 setShowCustomGuidance 方法
  const setShowCustomGuidance = useCallback(() => {
    // 设置选中的引导语为自定义引导语
    const customGuidance = {
      id: 'custom-guidance',
      title: t('创建专属引导语', 'Create Custom Guidance'),
      description: t('分享你的困扰，AI为你生成个性化的冥想引导', 'Share your concerns, AI generates personalized meditation guidance'),
      paragraphs: [],
      content: <></>,
      audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/start.mp3',
    };

    console.log('[调试] 点击创建专属引导语');
    handleGuidanceSelect(customGuidance);
    setShowGuidanceDialog(true);
  }, [t]);

  // 添加接收customAudioUrl的回调函数
  const handleCustomAudioGenerated = useCallback((audioUrl: string | undefined) => {
    console.log('[调试] 收到自定义引导语音频URL:', audioUrl);
    setCustomAudioUrl(audioUrl);
  }, []);

  // 在组件顶部其他 state 声明附近添加
  const hasPlayedCustomAudioRef = useRef(false);

  // 修改播放自定义音频的 useEffect
  useEffect(() => {
    // 添加1秒延迟
    setTimeout(() => {
      if (!guidanceAudio) return;

      const handleAudioEnd = () => {
        // 只有当播放的是 start.mp3 且有自定义音频，且还没有播放过自定义音频时才继续
        if (guidanceAudio.src.includes('start.mp3') && customAudioUrl && !hasPlayedCustomAudioRef.current) {
          console.log('[调试] start.mp3 播放结束，准备播放自定义音频');
          hasPlayedCustomAudioRef.current = true; // 标记已经播放过

          const customAudio = new Audio(customAudioUrl);
          customAudio.volume = isMuted ? 0 : volume / 100;

          // 设置自定义音频播放完成后的处理
          customAudio.addEventListener('ended', () => {
            console.log('[调试] 自定义音频播放完成');
            setGuidanceAudio(null);
            // 不需要移除事件监听器，因为我们使用了 ref 来跟踪状态
          });

          // 播放自定义音频
          setGuidanceAudio(customAudio);
          customAudio.play().then(() => {
            console.log('[调试] 自定义音频开始播放');
          }).catch(error => {
            console.error('[调试] 播放自定义音频失败:', error);
            toast.error('播放自定义音频失败，请重试');
          });
        }
      };

      guidanceAudio.addEventListener('ended', handleAudioEnd);

      return () => {
        guidanceAudio.removeEventListener('ended', handleAudioEnd);
      };
    }, 1000); // 1秒延迟
  }, [guidanceAudio, selectedGuidance, customAudioUrl, volume, isMuted]);

  // 添加 useEffect 来监听 customAudioUrl 的变化
  useEffect(() => {
    console.log('[调试] customAudioUrl 已更新:', customAudioUrl);
  }, [customAudioUrl]);

  return (
    <div className={`min-h-screen ${bgGradient} ${textColor} flex flex-col`}>
      <MeditationHeader
        isDarkTheme={isDarkTheme}
        isPlaying={isPlaying}
        isMuted={isMuted}
        volume={volume}
        showVolumeSlider={showVolumeSlider}
        selectedDuration={selectedDuration}
        showDurationMenu={showDurationMenu}
        durationOptions={durationOptions}
        buttonStyle={isDarkTheme ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}
        onBack={() => router.push('/')}
        onSoundClick={() => setShowSoundDialog(true)}
        onGuidanceClick={() => setShowGuidanceDialog(true)}
        onThemeToggle={toggleTheme}
        onVolumeClick={() => setShowVolumeSlider(!showVolumeSlider)}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={toggleMute}
        onDurationSelect={handleDurationSelect}
        onDurationMenuChange={handleShowDurationMenu}
        setShowVolumeSlider={setShowVolumeSlider}
        t={t}
      />

      {/* 选中课程显示 - 响应式优化 */}
      {selectedCourse && (
        <div className={`text-center px-4 py-2 ${isDarkTheme ? 'bg-indigo-900/30' : 'bg-blue-100'}`}>
          <div className="flex items-center justify-center flex-wrap">
            <Headphones size={16} className="mr-2" />
            <span className="font-semibold">{selectedCourse.name}</span>
          </div>
          <div className="text-xs mt-1 opacity-80 px-2">
            {t("来源：潮汐APP", "Source: Tide APP")} | {selectedCourse.duration} {t("分钟", "min")}
          </div>
        </div>
      )}

      {/* 选中引导语显示 */}
      <div className={`text-center px-4 py-2 ${isDarkTheme ? 'bg-indigo-900/30' : 'bg-blue-100'}`}>
        {selectedGuidance && selectedGuidance.id !== 'no-guidance' && (
          <>
            <div className="flex items-center justify-center flex-wrap">
              <Volume2 size={16} className="mr-2" />
              <span className="font-semibold">
                {selectedGuidance.id.startsWith('custom-')
                  ? t("自定义引导语", "Custom Guidance")
                  : selectedGuidance.title}
              </span>
            </div>
            <div className="text-xs mt-1 opacity-80 px-2">
              {t("来源：周周冥想", "Source: WeeklyZen") + " | " + t("不低于5分钟", "At least 13 minutes")}
            </div>
          </>
        )}
        {/* 顶部提示词 - 只有非播放状态才能点击 */}
        <div
          className={`text-xs opacity-60 my-4 transition-all flex items-center justify-center gap-2 ${isPlaying
            ? 'cursor-not-allowed'
            : 'hover:opacity-100 cursor-pointer'
            }`}
          onClick={isPlaying ? undefined : setShowCustomGuidance}
        >
          <PencilIcon className="w-3 h-3" />
          {t("分享你的困扰，AI 为你定制专属冥想引导", "Share your concerns, let AI create your personalized meditation guidance")}
          {isPlaying && (
            <span className="ml-1 text-xs opacity-80">
              {t("(请先暂停)", "(Please pause first)")}
            </span>
          )}
        </div>
      </div>

      {/* 主要内容 - 响应式布局优化 */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* 呼吸球背景 - 响应式大小 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[80vmin] h-[80vmin] md:max-w-[500px] md:max-h-[500px] relative">
            <BreathingSphere
              isPlaying={isPlaying}
              showText={false}
              size="medium"
            />
          </div>
        </div>

        {/* 计时器显示 - 自适应字体大小 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="text-4xl md:text-6xl lg:text-7xl font-light tracking-widest text-center">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* 播放/暂停按钮 - 自适应定位 */}
        <div className="relative z-20 mt-[40vh] md:mt-[60vh]">
          <Button
            variant="outline"
            size="icon"
            className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${isDarkTheme
              ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-600/30'
              : 'bg-white/80 hover:bg-white text-blue-600 border border-blue-200'
              }`}
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </Button>
        </div>
      </div>

      {/* 使用新的 MeditationEncouragement 组件 */}
      <MeditationEncouragement
        isDarkTheme={isDarkTheme}
        showEncouragement={isShowingEncouragement}
        selectedDuration={selectedDuration}
        onClose={() => setIsShowingEncouragement(false)}
        t={t}
      />

      {/* 对话框组件 - 优化移动端显示 */}
      <Dialog open={showSoundDialog} onOpenChange={setShowSoundDialog}>
        <DialogContent className={`${isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} w-[90vw] max-w-md mx-auto`}>
          <DialogHeader>
            <DialogTitle>{t("选择背景音效", "Choose Background Sound")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <SoundSelector
              sounds={sounds}
              selectedSound={selectedSound}
              onSoundSelect={handleSoundSelect}
              isDarkTheme={isDarkTheme}
              t={t}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* 引导语选择对话框 - 优化移动端显示 */}
      <Dialog
        open={showGuidanceDialog && !isPlaying}
        onOpenChange={(open) => {
          if (!isPlaying || !open) {
            setShowGuidanceDialog(open);
          }
        }}
      >
        <DialogContent className={`${isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} w-[90vw] max-w-md mx-auto`}>
          <DialogHeader>
            <DialogTitle>{t("选择引导语", "Choose Guidance")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(85vh-120px)] overflow-y-auto">
            <GuidanceSelector
              guidances={guidanceTexts}
              selectedGuidance={selectedGuidance}
              onGuidanceSelect={(guidance) => {
                handleGuidanceSelect({ ...guidance, audioUrl: guidance.audioUrl || undefined });
              }}
              onShowFullText={handleShowGuidanceText}
              isDarkTheme={isDarkTheme}
              t={t}
              onCloseDialog={() => setShowGuidanceDialog(false)}
              onPlay={togglePlayPause}
              onCustomAudioGenerated={handleCustomAudioGenerated}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* 引导语全文对话框 */}
      <Dialog open={showGuidanceTextDialog} onOpenChange={setShowGuidanceTextDialog}>
        <DialogContent className={`${isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} w-[90vw] max-w-md mx-auto`}>
          <DialogHeader>
            <DialogTitle>{selectedGuidance?.title || t("引导语", "Guidance")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {selectedGuidance?.paragraphs.map((paragraph, idx) => (
              <p key={`paragraph-${selectedGuidance.id}-${idx}`} className="mb-3 text-sm">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGuidanceTextDialog(false)}
              className={isDarkTheme ? 'text-indigo-300 hover:text-indigo-200' : 'text-blue-600 hover:text-blue-700'}
            >
              {t("关闭", "Close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 音频元素 */}
      <audio ref={audioRef} loop>
        <track kind="captions" />
      </audio>
      <audio ref={endSoundRef}>
        <track kind="captions" />
      </audio>
    </div>
  );
} 