"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Music, BookOpen, Volume2, VolumeX, Play, Pause, Sliders, Clock, ChevronDown, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider as UISlider } from '@/components/ui/slider';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MeditationTimer } from './MeditationTimer';
import { SoundSelector } from './SoundSelector';
import { GuidanceSelector } from './GuidanceSelector';
import { CourseSelector } from './CourseSelector';
import { BreathingSphere } from '@/components/breathing-sphere';

// 简单的翻译函数
const t = (zh: string, en: string): string => {
  // 这里可以根据实际需求实现语言切换逻辑
  return zh; // 默认返回中文
};

// 可选的冥想时长
const durationOptions = [
  { value: 5/60, label: '5秒', isTest: true },
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

  // 潮汐冥想课程相关
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [courseAudio, setCourseAudio] = useState<HTMLAudioElement | null>(null);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  
  // 引导语相关
  const { guidanceTexts } = useGuidanceTexts();
  const [selectedGuidance, setSelectedGuidance] = useState<GuidanceType | null>(guidanceTexts[0] || null);
  const [guidanceAudio, setGuidanceAudio] = useState<HTMLAudioElement | null>(null);
  
  // 对话框状态
  const [showSoundDialog, setShowSoundDialog] = useState(false);
  const [showGuidanceDialog, setShowGuidanceDialog] = useState(false);
  
  // 音频元素引用
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  
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
    return () => {
      // 停止所有音频
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      if (endSoundRef.current) {
        endSoundRef.current.pause();
        endSoundRef.current.src = '';
      }
      
      if (guidanceAudio) {
        guidanceAudio.pause();
        guidanceAudio.src = '';
      }

      if (courseAudio) {
        courseAudio.pause();
        courseAudio.src = '';
      }
      
      // 停止Web Audio API音频
      audioManager.current.stopAllSounds();
      audioManager.current.closeAudioContext();
    };
  }, [guidanceAudio, courseAudio]);
  
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
    setSelectedGuidance(guidance);
    setShowGuidanceDialog(false);
    
    // 如果有正在播放的引导语音频，先停止
    if (guidanceAudio) {
      guidanceAudio.pause();
      guidanceAudio.src = '';
    }
    
    // 创建新的引导语音频（如果有对应的音频文件）
    if (guidance.id) {
      const audio = new Audio(`/ai-audio/${guidance.id}.mp3`);
      audio.volume = isMuted ? 0 : volume / 100;
      setGuidanceAudio(audio);
      
      // 如果正在冥想，自动播放引导语
      if (isPlaying) {
        audio.play().catch(error => {
          console.error('播放引导语音频失败:', error);
          // 静默失败，不显示错误提示
        });
      }
    }
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
    setIsPlaying(newPlayingState);
    
    // 如果开始播放
    if (newPlayingState) {
      // 根据选择的内容播放对应的音频
      if (selectedCourse && courseAudio) {
        // 播放课程音频
        courseAudio.currentTime = 0; // 从头开始播放
        courseAudio.play().catch(error => {
          console.error('播放课程音频失败:', error);
          toast.error('播放课程音频失败，请重试');
        });
      } else {
        // 播放背景音效
        if (selectedSound && audioRef.current) {
          // 设置音频源（如果尚未设置）
          if (!audioRef.current.src || !audioRef.current.src.includes(selectedSound.id)) {
            audioRef.current.src = selectedSound.audioUrl;
            audioRef.current.loop = true;
          }
          
          // 设置音量
          audioRef.current.volume = isMuted ? 0 : volume / 100;
          
          // 播放音频
          audioRef.current.play().catch(error => {
            console.error('播放音频失败:', error);
            toast.error('播放音频失败，请重试');
          });
        }
        
        // 播放引导语音频
        if (guidanceAudio) {
          guidanceAudio.currentTime = 0; // 从头开始播放
          guidanceAudio.play().catch(console.error);
        }
      }
    } else {
      // 暂停所有音频
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      if (guidanceAudio) {
        guidanceAudio.pause();
      }

      if (courseAudio) {
        courseAudio.pause();
      }
    }
  };
  
  // 重置冥想
  const resetMeditation = () => {
    // 停止播放
    setIsPlaying(false);
    
    // 重置计时器
    setTimeLeft(selectedDuration * 60);
    
    // 停止背景音效
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // 停止引导语音频
    if (guidanceAudio) {
      guidanceAudio.pause();
      guidanceAudio.currentTime = 0;
    }

    // 停止课程音频
    if (courseAudio) {
      courseAudio.pause();
      courseAudio.currentTime = 0;
    }
    
    // 停止Web Audio API音频
    audioManager.current.stopAllSounds();
    
    // 重置状态
    setIsPlayingEndSound(false);
  };
  
  // 处理计时器结束
  const handleTimerEnd = () => {
    setIsPlaying(false);
    setIsPlayingEndSound(true);
    
    // 停止背景音效
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // 停止引导语音频
    if (guidanceAudio) {
      guidanceAudio.pause();
    }

    // 停止课程音频
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
  };
  
  // 处理时长选择
  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
    setTimeLeft(duration * 60);
    setShowDurationMenu(false);
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
  
  return (
    <div className={`min-h-screen ${bgGradient} ${textColor} flex flex-col`}>
      {/* 顶部导航 */}
      <div className="p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/')}
          className="rounded-full"
        >
          <ArrowLeft size={20} />
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSoundDialog(true)}
            className={`rounded-full ${buttonStyle}`}
          >
            <Music size={16} className="mr-1" />
            {t("背景音效", "Sound")}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowGuidanceDialog(true)}
            className={`rounded-full ${buttonStyle}`}
          >
            <BookOpen size={16} className="mr-1" />
            {t("引导语", "Guidance")}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowCourseDialog(true)}
            className={`rounded-full ${buttonStyle}`}
          >
            <Headphones size={16} className="mr-1" />
            {t("冥想课程", "Courses")}
          </Button>
          
          {/* 时长选择下拉菜单 */}
          <DropdownMenu open={showDurationMenu} onOpenChange={setShowDurationMenu}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`rounded-full ${buttonStyle}`}
              >
                <Clock size={16} className="mr-1" />
                {selectedDuration < 1 
                  ? `${Math.round(selectedDuration * 60)}${t("秒", "sec")}`
                  : `${selectedDuration}${t("分钟", "min")}`}
                <ChevronDown size={14} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className={isDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
              {durationOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className={`${
                    option.isTest ? 'text-orange-500' : isDarkTheme ? 'text-slate-200' : 'text-slate-700'
                  } cursor-pointer`}
                  onClick={() => handleDurationSelect(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* 主题切换按钮 */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleTheme}
            className={`rounded-full ${buttonStyle}`}
          >
            {isDarkTheme 
              ? '☀️' 
              : '🌙'}
          </Button>
        </div>
        
        <div className="relative">
          <Button 
            id="volume-button"
            variant="ghost" 
            size="icon" 
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="rounded-full"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
          
          {/* 音量滑块 - 优化设计 */}
          {showVolumeSlider && (
            <div 
              id="volume-slider-container"
              className={`absolute right-0 top-full mt-2 p-4 rounded-lg shadow-lg z-50 w-48 
                ${isDarkTheme 
                  ? 'bg-slate-900/90 border border-slate-800' 
                  : 'bg-white/90 border border-slate-200'} 
                backdrop-blur-sm transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <VolumeX size={16} className="text-slate-500" />
                <span className={`text-xs ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                  {volume}%
                </span>
                <Volume2 size={16} className="text-slate-500" />
              </div>
              <UISlider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className={`my-2 ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-200'}`}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleMute} 
                className={`w-full mt-2 text-xs ${
                  isDarkTheme 
                    ? 'hover:bg-slate-800 text-slate-300' 
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                {isMuted ? t("取消静音", "Unmute") : t("静音", "Mute")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 选中课程显示 */}
      {selectedCourse && (
        <div className={`text-center px-4 py-2 ${isDarkTheme ? 'bg-indigo-900/30' : 'bg-blue-100'}`}>
          <div className="flex items-center justify-center">
            <Headphones size={16} className="mr-2" />
            <span className="font-semibold">{selectedCourse.name}</span>
          </div>
          <div className="text-xs mt-1 opacity-80">
            {t("来源：潮汐APP", "Source: Tide APP")} | {selectedCourse.duration} {t("分钟", "min")}
          </div>
        </div>
      )}
      
      {/* 主要内容 - 居中显示 */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* 呼吸球背景 - 放在最底层 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[80vmin] h-[80vmin] max-w-[500px] max-h-[500px] relative">
            <BreathingSphere 
              isPlaying={isPlaying}
              showText={false}
              size="medium"
            />
          </div>
        </div>
        
        {/* 计时器显示 - 放在球的正中间 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="text-7xl font-light tracking-widest text-center">
            {formatTime(timeLeft)}
          </div>
        </div>
        
        {/* 播放/暂停按钮 - 放在最上层 */}
        <div className="relative z-20 mt-[60vh]">
          <Button
            variant="outline"
            size="icon"
            className={`w-16 h-16 rounded-full ${
              isDarkTheme 
                ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-600/30' 
                : 'bg-white/80 hover:bg-white text-blue-600 border border-blue-200'
            }`}
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </Button>
        </div>
      </div>
      
      {/* 音效选择对话框 */}
      <Dialog open={showSoundDialog} onOpenChange={setShowSoundDialog}>
        <DialogContent className={isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
          <DialogHeader>
            <DialogTitle>{t("选择背景音效", "Choose Background Sound")}</DialogTitle>
          </DialogHeader>
          <SoundSelector
            sounds={sounds}
            selectedSound={selectedSound}
            onSoundSelect={handleSoundSelect}
            isDarkTheme={isDarkTheme}
            t={t}
          />
        </DialogContent>
      </Dialog>
      
      {/* 引导语选择对话框 */}
      <Dialog open={showGuidanceDialog} onOpenChange={setShowGuidanceDialog}>
        <DialogContent className={isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
          <DialogHeader>
            <DialogTitle>{t("选择引导语", "Choose Guidance")}</DialogTitle>
          </DialogHeader>
          <GuidanceSelector
            guidances={guidanceTexts}
            selectedGuidance={selectedGuidance}
            onGuidanceSelect={handleGuidanceSelect}
            onShowFullText={() => {}}
            isDarkTheme={isDarkTheme}
            t={t}
          />
        </DialogContent>
      </Dialog>

      {/* 冥想课程选择对话框 */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className={isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
          <DialogHeader>
            <DialogTitle>{t("选择冥想课程", "Choose Meditation Course")}</DialogTitle>
          </DialogHeader>
          <CourseSelector
            courses={courses}
            selectedCourse={selectedCourse}
            onCourseSelect={handleCourseSelect}
            isDarkTheme={isDarkTheme}
            t={t}
          />
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