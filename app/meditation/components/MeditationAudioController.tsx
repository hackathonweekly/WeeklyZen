"use client";

import { useRef, useState, useCallback } from 'react';
import type { SoundData } from '@/app/sounds';
import type { GuidanceType } from '@/app/guidance';
import type { CourseData } from '@/app/courses';

export function useMeditationAudio() {
    // 音频状态
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);

    // 音频引用
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const endSoundRef = useRef<HTMLAudioElement | null>(null);
    const guidanceAudioRef = useRef<HTMLAudioElement | null>(null);

    // 自定义音频URL
    const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);

    // 处理音频选择
    const handleSoundSelect = useCallback((sound: SoundData | null) => {
        if (!audioRef.current) return;

        if (sound) {
            audioRef.current.src = sound.audioUrl;
            if (isPlaying) {
                audioRef.current.play().catch(console.error);
            }
        } else {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
    }, [isPlaying]);

    // 处理引导语选择
    const handleGuidanceSelect = useCallback((guidance: GuidanceType) => {
        // 处理引导语的音频
        if (guidance && guidance.audioUrl) {
            if (guidanceAudioRef.current) {
                guidanceAudioRef.current.src = guidance.audioUrl;
            }
        }
    }, []);

    // 处理课程选择
    const handleCourseSelect = useCallback((course: CourseData | null) => {
        // 课程选择的处理逻辑
        if (course) {
            // 处理课程相关音频
        }
    }, []);

    // 自定义引导语音频处理
    const handleCustomAudioGenerated = useCallback((audioUrl: string) => {
        console.log('[音频控制器] 接收到自定义引导语音频URL:', audioUrl);
        setCustomAudioUrl(audioUrl);
    }, []);

    // 切换播放/暂停
    const togglePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);

        if (!isPlaying) {
            audioRef.current?.play().catch(console.error);
        } else {
            audioRef.current?.pause();
        }
    }, [isPlaying]);

    // 处理音量变化
    const handleVolumeChange = useCallback((value: number) => {
        setVolume(value);
        if (audioRef.current) {
            audioRef.current.volume = value / 100;
        }
    }, []);

    // 切换静音
    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? volume / 100 : 0;
        }
    }, [isMuted, volume]);

    // 重置冥想
    const resetMeditation = useCallback(() => {
        // 重置音频相关状态
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, []);

    // 停止所有音频
    const pauseAllAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (guidanceAudioRef.current) {
            guidanceAudioRef.current.pause();
        }
    }, []);

    // 播放结束音效
    const playEndSound = useCallback(() => {
        if (endSoundRef.current) {
            endSoundRef.current.src = '/sounds/bell.mp3';
            endSoundRef.current.play().catch(console.error);
        }
    }, []);

    return {
        // 状态
        isPlaying,
        volume,
        isMuted,
        customAudioUrl,

        // Refs
        audioRef,
        endSoundRef,
        guidanceAudioRef,

        // 设置器
        setIsPlaying,
        setVolume,
        setIsMuted,

        // 处理函数
        handleSoundSelect,
        handleGuidanceSelect,
        handleCourseSelect,
        handleCustomAudioGenerated,
        handleVolumeChange,
        togglePlayPause,
        toggleMute,
        resetMeditation,
        pauseAllAudio,
        playEndSound
    };
} 