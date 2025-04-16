"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Headphones, Volume2, PencilIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAppTheme } from '@/contexts/theme-context';
import { useTheme } from 'next-themes';
import { sounds } from '@/app/sounds';
import { courses } from '@/app/courses';
import { useGuidanceTexts } from '@/app/guidance';
import { MeditationHeader } from './MeditationHeader';
import { MeditationEncouragement } from './MeditationEncouragement';
import { useMeditationAudio } from './MeditationAudioController';
import { useMeditationDialogs } from './MeditationDialogController';
import MeditationDialogController from './MeditationDialogController';
import MeditationCore, { formatTime } from './MeditationCore';
import type { SoundData } from '@/app/sounds';
import type { GuidanceType } from '@/app/guidance';
import type { CourseData } from '@/app/courses';

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

export default function RefactoredMeditationPage() {
    const router = useRouter();

    // 主题相关
    const { isDarkTheme } = useAppTheme();
    const { theme, setTheme } = useTheme();

    // 状态管理
    const [selectedDuration, setSelectedDuration] = useState(5);
    const [timeLeft, setTimeLeft] = useState(5 * 60);
    const [isShowingEncouragement, setIsShowingEncouragement] = useState(false);
    const [meditationCount, setMeditationCount] = useState(0);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showDurationMenu, setShowDurationMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // 引导语、音效和课程状态
    const { guidanceTexts } = useGuidanceTexts();
    const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
    const defaultSound = sounds.find(s => s.id === 'creek') || null;
    const [selectedSound, setSelectedSound] = useState<SoundData | null>(defaultSound);
    const [selectedGuidance, setSelectedGuidance] = useState<GuidanceType | null>({
        id: 'custom-guidance',
        title: t('创建专属引导语', 'Create Custom Guidance'),
        description: t('分享你的困扰，AI为你生成个性化的冥想引导', 'Share your concerns, AI generates personalized meditation guidance'),
        paragraphs: [],
        content: <></>,
        audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/start.mp3',
    });

    // 使用自定义Hook管理音频
    const audio = useMeditationAudio();

    // 使用自定义Hook管理对话框
    const dialogs = useMeditationDialogs();

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

    // 检测timeLeft变化，更新计时器
    useEffect(() => {
        if (audio.isPlaying && timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [audio.isPlaying, timeLeft]);

    // 处理音效选择
    const handleSoundSelect = (sound: SoundData | null) => {
        audio.handleSoundSelect(sound);
        setSelectedSound(sound);
        dialogs.setShowSoundDialog(false);
    };

    // 处理引导语选择
    const handleGuidanceSelect = (guidance: GuidanceType) => {
        console.log('[调试] 选中引导语:', guidance.id, guidance.title);
        setSelectedGuidance(guidance);
        audio.handleGuidanceSelect(guidance);

        // 重置冥想
        resetMeditation();
        dialogs.setShowGuidanceDialog(false);
    };

    // 处理课程选择
    const handleCourseSelect = (course: CourseData | null) => {
        setSelectedCourse(course);

        // 如果选择了课程，停止其他音频并更新时长
        if (course) {
            // 更新冥想时长为课程时长
            setSelectedDuration(course.duration);
            setTimeLeft(course.duration * 60);
        }

        audio.handleCourseSelect(course);
        dialogs.setShowCourseDialog(false);
    };

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

    // 显示鼓励语
    const showEncouragement = () => {
        // 更新冥想次数
        const newCount = meditationCount + 1;
        setMeditationCount(newCount);
        localStorage.setItem('meditationCount', newCount.toString());

        // 显示鼓励对话框
        setIsShowingEncouragement(true);
    };

    // 切换播放/暂停
    const togglePlayPause = () => {
        audio.togglePlayPause();
    };

    // 重置冥想
    const resetMeditation = () => {
        console.log('[调试] 开始重置冥想...');

        // 重置时间到选择的时长
        setTimeLeft(selectedDuration * 60);

        // 重置音频状态
        audio.resetMeditation();
    };

    // 处理计时器结束
    const handleTimerEnd = useCallback(() => {
        // 停止所有音频
        audio.pauseAllAudio();

        // 播放结束音效
        audio.playEndSound();

        // 显示鼓励信息
        showEncouragement();

        // 重置状态
        audio.setIsPlaying(false);
        dialogs.setShowGuidanceTextDialog(false);
    }, [audio, dialogs]);

    // 处理时长选择
    const handleDurationSelect = (duration: number) => {
        console.log('[调试] 选择新的冥想时长:', duration, '分钟');
        setSelectedDuration(duration);
        setTimeLeft(duration * 60);
        setShowDurationMenu(false);

        // 重置冥想状态，但保持当前选中的引导语
        resetMeditation();
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

    // 显示自定义引导语选项
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
        dialogs.setShowGuidanceDialog(true);
    }, [t, dialogs]);

    // 更新showDurationMenu的设置逻辑
    const handleShowDurationMenu = (open: boolean) => {
        if (!audio.isPlaying) {
            setShowDurationMenu(open);
        } else if (open) {
            // 可选：添加提示，告知用户需要先暂停
            toast.info(t('请先暂停冥想后再更改时长', 'Please pause meditation before changing duration'));
        }
    };

    return (
        <div className={`min-h-screen ${bgGradient} ${textColor} flex flex-col`}>
            <MeditationHeader
                isDarkTheme={isDarkTheme}
                isPlaying={audio.isPlaying}
                isMuted={audio.isMuted}
                volume={audio.volume}
                showVolumeSlider={showVolumeSlider}
                selectedDuration={selectedDuration}
                showDurationMenu={showDurationMenu}
                durationOptions={durationOptions}
                buttonStyle={isDarkTheme ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}
                onBack={() => router.push('/')}
                onSoundClick={() => dialogs.handleShowSoundDialog(audio.isPlaying)}
                onGuidanceClick={() => dialogs.handleShowGuidanceDialog(audio.isPlaying)}
                onThemeToggle={toggleTheme}
                onVolumeClick={() => setShowVolumeSlider(!showVolumeSlider)}
                onVolumeChange={(value: number[]) => audio.handleVolumeChange(value[0])}
                onMuteToggle={audio.toggleMute}
                onDurationSelect={handleDurationSelect}
                onDurationMenuChange={handleShowDurationMenu}
                setShowVolumeSlider={setShowVolumeSlider}
                t={t}
            />

            {/* 选中课程显示 */}
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
                            {t("来源：周周冥想", "Source: WeeklyZen") + " | " + t("不低于13分钟", "At least 13 minutes")}
                        </div>
                    </>
                )}
                {/* 顶部提示词 - 始终显示 */}
                <div
                    className="text-xs opacity-60 my-4 hover:opacity-100 transition-all cursor-pointer flex items-center justify-center gap-2"
                    onClick={setShowCustomGuidance}
                >
                    <PencilIcon className="w-3 h-3" />
                    {t("分享你的困扰，AI 为你定制专属冥想引导", "Share your concerns, let AI create your personalized meditation guidance")}
                </div>
            </div>

            {/* 冥想核心组件 */}
            <MeditationCore
                timeLeft={timeLeft}
                isPlaying={audio.isPlaying}
                selectedDuration={selectedDuration}
                isDarkTheme={isDarkTheme}
                onTogglePlayPause={togglePlayPause}
                onTimerEnd={handleTimerEnd}
            />

            {/* 鼓励对话框 */}
            <MeditationEncouragement
                isDarkTheme={isDarkTheme}
                showEncouragement={isShowingEncouragement}
                selectedDuration={selectedDuration}
                onClose={() => setIsShowingEncouragement(false)}
                t={t}
            />

            {/* 对话框组件 */}
            <MeditationDialogController
                // 对话框状态
                showSoundDialog={dialogs.showSoundDialog}
                showGuidanceDialog={dialogs.showGuidanceDialog}
                showGuidanceTextDialog={dialogs.showGuidanceTextDialog}
                showCourseDialog={dialogs.showCourseDialog}

                // 选中项
                selectedSound={selectedSound}
                selectedGuidance={selectedGuidance}
                selectedCourse={selectedCourse}

                // 其他配置
                sounds={sounds}
                guidances={guidanceTexts}
                courses={courses}
                isDarkTheme={isDarkTheme}
                isPlaying={audio.isPlaying}

                // 回调函数
                onSoundSelect={handleSoundSelect}
                onGuidanceSelect={handleGuidanceSelect}
                onCourseSelect={handleCourseSelect}
                onCustomAudioGenerated={(audioUrl: string | undefined) => audioUrl && audio.handleCustomAudioGenerated(audioUrl)}

                // 对话框控制
                setShowSoundDialog={dialogs.setShowSoundDialog}
                setShowGuidanceDialog={dialogs.setShowGuidanceDialog}
                setShowGuidanceTextDialog={dialogs.setShowGuidanceTextDialog}
                setShowCourseDialog={dialogs.setShowCourseDialog}

                // 其他回调
                onPlay={togglePlayPause}

                // 翻译函数
                t={t}
            />

            {/* 音频元素 */}
            <audio ref={audio.audioRef} loop>
                <track kind="captions" />
            </audio>
            <audio ref={audio.endSoundRef}>
                <track kind="captions" />
            </audio>
        </div>
    );
} 