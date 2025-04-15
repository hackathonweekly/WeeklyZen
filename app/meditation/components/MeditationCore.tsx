"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { BreathingSphere } from "@/components/breathing-sphere";

export interface MeditationCoreProps {
    timeLeft: number;
    isPlaying: boolean;
    selectedDuration: number;
    isDarkTheme: boolean;
    onTogglePlayPause: () => void;
    onTimerEnd: () => void;
}

/**
 * 格式化时间显示
 */
export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * MeditationCore - 冥想页面的核心组件，处理计时和播放/暂停功能
 */
const MeditationCore: React.FC<MeditationCoreProps> = ({
    timeLeft,
    isPlaying,
    selectedDuration,
    isDarkTheme,
    onTogglePlayPause,
    onTimerEnd
}) => {
    // 更新倒计时
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isPlaying && timeLeft > 0) {
            interval = setInterval(() => {
                if (timeLeft <= 1) {
                    // 如果倒计时结束，清除定时器并触发结束事件
                    if (interval) clearInterval(interval);
                    onTimerEnd();
                }
            }, 1000);
        } else if (!isPlaying && interval) {
            clearInterval(interval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, timeLeft, onTimerEnd]);

    // 按钮样式 - 根据主题设置不同样式
    const buttonStyle = isDarkTheme
        ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-600/30'
        : 'bg-white/80 hover:bg-white text-blue-600 border border-blue-200';

    return (
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
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${buttonStyle}`}
                    onClick={onTogglePlayPause}
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </Button>
            </div>
        </div>
    );
};

export default MeditationCore; 