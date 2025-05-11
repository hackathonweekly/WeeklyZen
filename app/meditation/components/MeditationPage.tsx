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

// 添加音频事件处理器的类型定义
type AudioEndHandler = (event: Event) => void;

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

  // 添加音频播放跟踪引用
  const hasPlayedCustomAudioRef = useRef(false);
  const handleAudioEndRef = useRef<AudioEndHandler | null>(null);

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

  // 修改倒计时useEffect，优化检测逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    // console.log('[调试] 倒计时effect触发');

    // 确保timeLeft不为异常值
    if (timeLeft <= 0 && !isPlayingEndSound) {
      console.log('[调试] 纠正异常timeLeft值，设置为', selectedDuration * 60, '秒');
      setTimeLeft(selectedDuration * 60);
      return; // 提前返回，避免设置计时器
    }

    if (isPlaying && timeLeft > 0) {
      // console.log('[调试] 开始倒计时，初始值:', timeLeft);
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // 如果倒计时结束，清除定时器并触发结束事件
            if (interval) {
              console.log('[调试] 清除倒计时定时器');
              clearInterval(interval);
            }

            // 异步调用，避免setState嵌套问题
            setTimeout(() => {
              console.log('[调试] 异步触发handleTimerEnd');
              handleTimerEnd();
            }, 0);

            // 这里关键是不要返回0，而是让handleTimerEnd负责设置新值
            return 1; // 保持最小值为1，避免显示为0
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isPlaying && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, timeLeft, isPlayingEndSound, selectedDuration]);

  // handleTimerEnd函数 - 直接定义为普通函数，避免useCallback依赖问题
  const handleTimerEnd = () => {
    console.log('[调试] handleTimerEnd - 开始处理计时结束');

    // 先停止所有音频，再修改状态
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (guidanceAudio) {
      guidanceAudio.pause();
    }
    if (courseAudio) {
      courseAudio.pause();
    }

    // 设置播放结束音效状态
    setIsPlayingEndSound(true);
    setIsPlaying(false);
    setShowGuidanceTextDialog(false);

    // 计算新的计时器值
    const newTimeValue = selectedDuration * 60;
    console.log('[调试] 计时结束，重置计时器到', selectedDuration, '分钟 (', newTimeValue, '秒)');

    // 重置计时器到选定的时长
    setTimeLeft(newTimeValue);

    // 播放结束音效 - 增强版本
    const playEndSound = async () => {
      const endSoundUrl = 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/temple-bells.mp3';
      console.log('[调试] 尝试播放结束音效:', endSoundUrl);

      // 每次播放时都创建新的Audio元素，确保状态干净
      console.log('[调试] 创建新的结束音效Audio元素');
      // 确保没有现有引用，先清理
      if (endSoundRef.current) {
        console.log('[调试] 发现现有音频引用，先清理');
        if (!endSoundRef.current.paused) {
          endSoundRef.current.pause();
        }
        endSoundRef.current.src = '';
        endSoundRef.current.onended = null;
        endSoundRef.current.oncanplaythrough = null;
      }

      // 创建全新的音频元素
      endSoundRef.current = new Audio();

      // 设置调试输出，帮助跟踪音频元素状态
      endSoundRef.current.onloadeddata = () => console.log('[调试] 结束音效音频数据加载完成');
      endSoundRef.current.onplay = () => console.log('[调试] 结束音效开始播放');
      endSoundRef.current.onended = () => console.log('[调试] 结束音效播放完成');

      let playAttempts = 0;
      const maxAttempts = 3;

      console.log('[调试] 使用以下方法尝试播放:', {
        isPlayingEndSound,
        endSoundRef: endSoundRef.current ? '已创建' : '未创建'
      });

      // 清理结束音效资源的函数
      const cleanupEndSound = () => {
        if (endSoundRef.current) {
          console.log('[调试] 清理结束音效资源');
          // 停止播放
          if (!endSoundRef.current.paused) {
            endSoundRef.current.pause();
          }

          // 移除所有事件监听器
          endSoundRef.current.oncanplaythrough = null;
          endSoundRef.current.onended = null;
          endSoundRef.current.onerror = null;
          endSoundRef.current.onloadeddata = null;

          // 释放资源
          endSoundRef.current.src = '';
          endSoundRef.current.load(); // 强制重置

          // 不完全重置引用，而是创建新的Audio元素，确保下次播放时可用
          console.log('[调试] 创建新的干净Audio元素，准备下次播放');
          endSoundRef.current = new Audio();
          endSoundRef.current.onloadeddata = () => console.log('[调试] 新音频元素就绪');
        } else {
          // 如果引用不存在，也创建一个
          console.log('[调试] 引用不存在，创建新Audio元素');
          endSoundRef.current = new Audio();
        }
      };

      const attemptPlaySound = async () => {
        try {
          // 首选方式：使用AudioManager播放
          try {
            const buffer = await audioManager.current.loadAudioBuffer(endSoundUrl, 'end-sound');
            console.log('[调试] AudioManager加载音频成功，开始播放');
            audioManager.current.playSound(buffer, volume / 100, false);
            console.log('[调试] 成功使用AudioManager播放结束音效');
            return true;
          } catch (error) {
            console.warn('[调试] AudioManager播放失败，尝试备用方式:', error);
            throw error; // 让外层catch处理
          }
        } catch (error) {
          // 备用方式：使用Audio元素播放
          try {
            if (endSoundRef.current) {
              // 清理之前可能存在的事件监听器，避免内存泄漏
              endSoundRef.current.oncanplaythrough = null;
              endSoundRef.current.onended = null;
              endSoundRef.current.onerror = null;

              console.log('[调试] 设置音频源:', endSoundUrl);
              endSoundRef.current.src = endSoundUrl;
              endSoundRef.current.volume = isMuted ? 0 : volume / 100;
              console.log('[调试] 设置音频音量:', endSoundRef.current.volume);

              // 确保音频加载完成
              return new Promise<boolean>((resolve) => {
                if (!endSoundRef.current) return resolve(false);

                // 设置一次性事件监听器
                const onCanPlay = async () => {
                  // 移除事件监听器
                  if (endSoundRef.current) {
                    endSoundRef.current.removeEventListener('canplaythrough', onCanPlay);
                  }

                  try {
                    if (endSoundRef.current) {
                      console.log('[调试] 尝试播放音频');
                      await endSoundRef.current.play();
                      console.log('[调试] 成功使用备用Audio元素播放结束音效');

                      // 添加播放结束事件
                      endSoundRef.current.onended = () => {
                        console.log('[调试] 结束音效播放完成');
                        // 播放完成后，记录成功状态，但不立即清理资源
                        // 资源清理统一在finally块中进行，避免过早清理导致引用丢失
                        console.log('[调试] 标记播放成功，等待最终清理');
                        resolve(true);
                      };

                      // 添加错误处理
                      endSoundRef.current.onerror = () => {
                        console.error('[调试] 音频播放过程中出错');
                        // 不立即清理资源，统一在finally中处理
                        console.log('[调试] 标记播放失败，等待最终清理');
                        resolve(false);
                      };
                    }
                  } catch (playError) {
                    console.error('[调试] 备用播放方式也失败:', playError);
                    // 不立即清理资源，统一在finally中处理
                    console.log('[调试] 标记播放尝试失败，等待最终清理');
                    resolve(false);
                  }
                };

                // 添加加载完成事件
                if (endSoundRef.current) {
                  console.log('[调试] 设置canplaythrough事件监听器');
                  endSoundRef.current.addEventListener('canplaythrough', onCanPlay, { once: true });

                  // 设置超时，避免oncanplaythrough不触发
                  setTimeout(() => {
                    if (endSoundRef.current && endSoundRef.current.paused) {
                      // 移除之前的监听器
                      endSoundRef.current.removeEventListener('canplaythrough', onCanPlay);

                      console.log('[调试] canplaythrough超时，尝试直接播放');
                      // 尝试直接播放
                      endSoundRef.current.play()
                        .then(() => {
                          console.log('[调试] 超时后成功播放音效');
                          resolve(true);
                        })
                        .catch(e => {
                          console.error('[调试] 超时后尝试播放失败:', e);
                          // 不立即清理资源，统一在finally中处理
                          console.log('[调试] 标记超时播放失败，等待最终清理');
                          resolve(false);
                        });
                    }
                  }, 2000);
                }

                // 如果10秒后还没有播放完成，认为失败
                setTimeout(() => {
                  if (endSoundRef.current && !endSoundRef.current.ended) {
                    console.log('[调试] 音效播放超时，强制结束');
                    // 不立即清理资源，统一在finally中处理
                    console.log('[调试] 标记播放超时，等待最终清理');
                    resolve(false);
                  }
                }, 10000);
              });
            }
            return false;
          } catch (error2) {
            console.error('[调试] 所有播放方式都失败:', error2);
            return false;
          }
        }
      };

      // 尝试播放，如果失败则重试
      try {
        while (playAttempts < maxAttempts) {
          const success = await attemptPlaySound();
          if (success) break;
          playAttempts++;
          console.log(`[调试] 播放尝试 ${playAttempts}/${maxAttempts} 失败，${playAttempts < maxAttempts ? '正在重试...' : '已达到最大重试次数'}`);
          // 重试前等待短暂时间
          if (playAttempts < maxAttempts) await new Promise(r => setTimeout(r, 500));
        }
      } catch (error) {
        console.error('[调试] 播放过程中发生未捕获的错误:', error);
      } finally {
        // 无论播放成功与否，5秒后重置状态
        setTimeout(() => {
          console.log('[调试] 重置结束音效播放状态并清理资源');

          // 明确重置isPlayingEndSound状态为false
          if (isPlayingEndSound) {
            console.log('[调试] 将isPlayingEndSound重置为false');
            setIsPlayingEndSound(false);
          }

          // 停止所有音频
          audioManager.current.stopAllSounds();

          // 确保结束音效资源被清理，并创建新的干净实例
          cleanupEndSound();

          // 确保结束音效引用已准备就绪
          if (!endSoundRef.current) {
            console.log('[调试] 确保Audio元素存在');
            endSoundRef.current = new Audio();
          }

          // 再次确认计时器已重置 - 防止任何意外
          if (timeLeft <= 1 || timeLeft !== newTimeValue) {
            console.log('[调试] 结束音效播放完毕，确认计时器已重置为:', newTimeValue);
            setTimeLeft(newTimeValue);
          }

          console.log('[调试] 结束音效资源处理完成，准备就绪等待下一次计时');
        }, 5000);
      }
    };

    // 立即执行播放
    console.log('[调试] 开始执行playEndSound函数');
    playEndSound();

    // 显示鼓励信息
    showEncouragement();

    // 重置引导语音频，准备下一次播放
    if (guidanceAudio && selectedGuidance?.audioUrl) {
      // 创建新的音频实例以重置播放位置
      console.log('[调试] 重置引导语音频，准备下一次播放');
      const audio = new Audio(selectedGuidance.audioUrl);
      audio.volume = isMuted ? 0 : volume / 100;

      // 如果存在自定义音频URL，添加onended处理器
      if ((selectedGuidance.id === 'custom-guidance' ||
        selectedGuidance.audioUrl.includes('start.mp3')) &&
        customAudioUrl) {

        console.log('[调试] 重置引导语音频时设置自定义音频播放逻辑');

        // 重置自定义音频播放状态
        hasPlayedCustomAudioRef.current = false;

        // 添加引导语结束后的处理函数
        audio.onended = () => {
          console.log('[调试] 新的引导语音频播放结束，开始播放自定义音频');

          // 如果已经播放过自定义音频，不再重复播放
          if (hasPlayedCustomAudioRef.current) {
            console.log('[调试] 自定义音频已经播放过，不再重复播放');
            return;
          }

          if (customAudioUrl) {
            // 直接修改现有引导语音频的src，而不是创建新对象
            if (guidanceAudio) {
              guidanceAudio.src = customAudioUrl;
              guidanceAudio.volume = isMuted ? 0 : volume / 100;

              // 播放自定义音频
              guidanceAudio.play().then(() => {
                console.log('[调试] 自定义音频开始播放成功');
                hasPlayedCustomAudioRef.current = true;
              }).catch(error => {
                console.error('[调试] 播放自定义音频失败:', error);
                toast.error('播放自定义音频失败，请重试');
              });
            }
          }
        };
      }

      setGuidanceAudio(audio);
    }

    // 使用多个setTimeout带不同延迟确保计时器值被正确应用
    const checkAndFixTimer = () => {
      if (timeLeft <= 1 || timeLeft !== newTimeValue) {
        console.log('[调试] 延迟检查 - 确保计时器已重置为', newTimeValue, '秒');
        setTimeLeft(newTimeValue);
      }
    };

    setTimeout(checkAndFixTimer, 50);
    setTimeout(checkAndFixTimer, 500);
    setTimeout(checkAndFixTimer, 1000);
  };

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          customAudio.play().then(() => {
            console.log('[调试] 自定义音频开始播放成功');
            // 保存引用以便于后续控制
            setGuidanceAudio(customAudio);
          }).catch(error => {
            console.error('[调试] 播放自定义音频失败:', error);
            toast.error('播放自定义音频失败，请重试');
          });
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

  // 显示鼓励对话框
  const showEncouragement = () => {
    console.log('[调试] 显示鼓励对话框');
    // 增加冥想次数
    const newCount = meditationCount + 1;
    setMeditationCount(newCount);
    // 保存到localStorage
    localStorage.setItem('meditationCount', newCount.toString());

    setIsShowingEncouragement(true);
  };

  // 处理鼓励对话框关闭
  const handleEncouragementClose = () => {
    console.log('[调试] 关闭鼓励对话框');
    setIsShowingEncouragement(false);
  };

  // 处理鼓励对话框中的"再来一次"按钮点击
  const handleRestartMeditation = () => {
    console.log('[调试] 鼓励对话框中点击"再来一次"按钮');
    // 关闭对话框
    setIsShowingEncouragement(false);

    // 使用setTimeout确保状态更新后再重置冥想
    setTimeout(() => {
      // 重置冥想
      resetMeditation();

      // 短暂延迟后自动开始新的冥想
      setTimeout(() => {
        console.log('[调试] 自动开始新的冥想');
        togglePlayPause();
      }, 500);
    }, 100);
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

          // 重置播放状态标记
          hasPlayedCustomAudioRef.current = false;

          // 添加音频播放结束事件
          guidanceAudio.onended = function () {
            console.log('[调试] 引导语音频播放结束，开始播放自定义音频');

            // 如果已经播放过自定义音频，不再重复播放
            if (hasPlayedCustomAudioRef.current) {
              console.log('[调试] 自定义音频已经播放过，不再重复播放');
              return;
            }

            // 直接修改现有引导语音频的src，而不是创建新对象
            // 这样可以保持原有的音频控制逻辑不变
            if (guidanceAudio) {
              guidanceAudio.src = customAudioUrl;
              guidanceAudio.volume = isMuted ? 0 : volume / 100;

              // 播放自定义音频
              guidanceAudio.play().then(() => {
                console.log('[调试] 自定义音频开始播放成功');
                hasPlayedCustomAudioRef.current = true;
              }).catch(error => {
                console.error('[调试] 播放自定义音频失败:', error);
                toast.error('播放自定义音频失败，请重试');
              });
            }
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

    // 确保不在播放状态 - 先停止播放，再重置时间
    setIsPlaying(false);
    setIsPlayingEndSound(false); // 确保结束音效状态被重置

    // 停止所有可能的音效
    audioManager.current.stopAllSounds();

    if (audioRef.current) {
      audioRef.current.pause();
    }

    // 清理结束音效的资源和引用
    if (endSoundRef.current) {
      console.log('[调试] 重置冥想时清理结束音效资源');
      endSoundRef.current.pause();
      endSoundRef.current.src = '';
      endSoundRef.current.onended = null;
      endSoundRef.current.oncanplaythrough = null;
      endSoundRef.current.onerror = null;
      endSoundRef.current.load();

      // 不完全清除引用，而是创建新的Audio元素
      console.log('[调试] 清理后创建新的Audio元素，准备下次播放');
      endSoundRef.current = new Audio();
    } else {
      // 如果引用不存在，创建一个新的
      console.log('[调试] 创建新的结束音效Audio元素 (resetMeditation)');
      endSoundRef.current = new Audio();
    }

    if (courseAudio) {
      console.log('[调试] 停止课程音频');
      courseAudio.pause();
    }

    // 重置时间到选择的时长 - 在所有音频停止后
    const newDurationInSeconds = selectedDuration * 60;
    console.log('[调试] 重置计时器到', selectedDuration, '分钟 (', newDurationInSeconds, '秒)');
    setTimeLeft(newDurationInSeconds);

    // 使用setTimeout确保时间重置被正确应用
    setTimeout(() => {
      if (timeLeft <= 1 || timeLeft !== newDurationInSeconds) {
        console.log('[调试] 延迟检查 - 纠正计时器值到', newDurationInSeconds, '秒');
        setTimeLeft(newDurationInSeconds);
      }
    }, 100);

    console.log('[调试] 冥想重置完成');
  };

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
  }, [handleGuidanceSelect]);

  // 添加接收customAudioUrl的回调函数
  const handleCustomAudioGenerated = useCallback((audioUrl: string | undefined) => {
    console.log('[调试] 收到自定义引导语音频URL:', audioUrl ? `长度: ${audioUrl.length}` : 'undefined');

    // 重置播放状态
    hasPlayedCustomAudioRef.current = false;

    // 更新URL
    setCustomAudioUrl(audioUrl);

    // 如果音频URL过长，提示用户音频仅在当前会话有效
    if (audioUrl && audioUrl.length > 10000) {
      console.log('[调试] 自定义音频URL长度超过限制，长度:', audioUrl.length);
      toast.info(t('音频仅在本次会话有效', 'Audio valid only for current session'), {
        description: t('由于浏览器存储限制，自定义音频将不会在页面刷新后保留', 'Due to browser storage limitations, custom audio will not persist after page refresh')
      });
    }
  }, []);

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
        onClose={handleEncouragementClose}
        onRestart={handleRestartMeditation}
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