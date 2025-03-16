"use client";

import { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { SoundData } from '@/app/sounds';

interface AudioControllerProps {
  selectedSound: SoundData | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
  isDarkTheme: boolean;
}

export function AudioController({
  selectedSound,
  isPlaying,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  isDarkTheme
}: AudioControllerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // 处理音频播放
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (selectedSound && isPlaying) {
      // 设置音频源
      if (audioRef.current.src !== selectedSound.url) {
        audioRef.current.src = selectedSound.url;
        audioRef.current.loop = true;
      }
      
      // 设置音量
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      
      // 播放音频
      audioRef.current.play().catch(error => {
        console.error('播放音频失败:', error);
      });
    } else {
      // 暂停音频
      audioRef.current.pause();
    }
    
    // 组件卸载时清理
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [selectedSound, isPlaying, volume, isMuted]);
  
  // 处理音量变化
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);
  
  return (
    <div className="flex items-center space-x-2 w-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMute}
        className={`${isDarkTheme ? 'text-indigo-300 hover:text-indigo-200' : 'text-blue-600 hover:text-blue-700'}`}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </Button>
      
      <Slider
        value={[volume]}
        min={0}
        max={100}
        step={1}
        onValueChange={(value) => onVolumeChange(value[0])}
        className={`${isDarkTheme ? 'bg-indigo-900/50' : 'bg-blue-100'}`}
      />
      
      <audio ref={audioRef} loop />
    </div>
  );
} 