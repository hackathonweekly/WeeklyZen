"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface MeditationTimerProps {
  duration: number; // 冥想时长（分钟）
  isPlaying: boolean;
  isPlayingEndSound: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onTimerEnd: () => void;
  isDarkTheme: boolean;
}

export function MeditationTimer({
  duration,
  isPlaying,
  isPlayingEndSound,
  onPlayPause,
  onReset,
  onTimerEnd,
  isDarkTheme
}: MeditationTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // 重置计时器
  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);
  
  // 处理计时器
  useEffect(() => {
    // 清除现有计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // 如果正在播放，启动计时器
    if (isPlaying && !isPlayingEndSound) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // 时间到，触发结束事件
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            onTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // 组件卸载时清理
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, isPlayingEndSound, onTimerEnd]);
  
  // 计算进度百分比
  const progressPercent = 100 - (timeLeft / (duration * 60)) * 100;
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 计时器显示 */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* 进度环 */}
        <svg className="absolute w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isDarkTheme ? 'rgba(99, 102, 241, 0.2)' : 'rgba(219, 234, 254, 0.8)'}
            strokeWidth="5"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isDarkTheme ? 'rgba(129, 140, 248, 0.8)' : 'rgba(59, 130, 246, 0.8)'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progressPercent) / 100}
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 - (283 * progressPercent) / 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>
        
        {/* 时间显示 */}
        <span className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
      
      {/* 控制按钮 */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPlayPause}
          disabled={isPlayingEndSound}
          className={`${isDarkTheme ? 'bg-indigo-900/30 border-indigo-700 hover:bg-indigo-800/50' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          disabled={isPlayingEndSound}
          className={`${isDarkTheme ? 'bg-indigo-900/30 border-indigo-700 hover:bg-indigo-800/50' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`}
        >
          <RotateCcw size={20} />
        </Button>
      </div>
    </div>
  );
} 