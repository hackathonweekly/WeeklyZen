"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SoundSelector } from './SoundSelector';
import { GuidanceSelector } from './GuidanceSelector';
import { CourseSelector } from './CourseSelector';
import type { SoundData } from '@/app/sounds';
import type { GuidanceType } from '@/app/guidance';
import type { CourseData } from '@/app/courses';

export interface MeditationDialogControllerProps {
    // 对话框状态
    showSoundDialog: boolean;
    showGuidanceDialog: boolean;
    showGuidanceTextDialog: boolean;
    showCourseDialog: boolean;

    // 选中项
    selectedSound: SoundData | null;
    selectedGuidance: GuidanceType | null;
    selectedCourse: CourseData | null;

    // 其他配置
    sounds: SoundData[];
    guidances: GuidanceType[];
    courses: CourseData[];
    isDarkTheme: boolean;
    isPlaying: boolean;

    // 回调函数
    onSoundSelect: (sound: SoundData | null) => void;
    onGuidanceSelect: (guidance: GuidanceType) => void;
    onCourseSelect: (course: CourseData | null) => void;
    onCustomAudioGenerated?: (audioUrl: string | undefined) => void;

    // 对话框控制
    setShowSoundDialog: (show: boolean) => void;
    setShowGuidanceDialog: (show: boolean) => void;
    setShowGuidanceTextDialog: (show: boolean) => void;
    setShowCourseDialog: (show: boolean) => void;

    // 其他回调
    onPlay?: () => void;

    // 翻译函数
    t: (zh: string, en: string) => string;
}

export const useMeditationDialogs = () => {
    // 对话框状态
    const [showSoundDialog, setShowSoundDialog] = useState(false);
    const [showGuidanceDialog, setShowGuidanceDialog] = useState(false);
    const [showGuidanceTextDialog, setShowGuidanceTextDialog] = useState(false);
    const [showCourseDialog, setShowCourseDialog] = useState(false);

    // 处理对话框显示逻辑，确保在播放状态下无法打开
    const handleShowGuidanceDialog = useCallback((isPlaying: boolean) => {
        if (!isPlaying) {
            setShowGuidanceDialog(true);
        } else {
            // 可选：添加提示，告知用户需要先暂停
            toast.info("请先暂停冥想后再更换引导语", {
                description: "冥想进行中无法切换引导语"
            });
        }
    }, []);

    // 处理显示音效选择对话框
    const handleShowSoundDialog = useCallback((isPlaying: boolean) => {
        if (!isPlaying) {
            setShowSoundDialog(true);
        } else {
            toast.info("请先暂停冥想后再更换音效", {
                description: "冥想进行中无法切换音效"
            });
        }
    }, []);

    // 处理显示引导语全文对话框
    const handleShowGuidanceText = useCallback((guidance: GuidanceType | null) => {
        if (guidance) {
            setShowGuidanceTextDialog(true);
        }
    }, []);

    // 处理显示课程选择对话框
    const handleShowCourseDialog = useCallback((isPlaying: boolean) => {
        if (!isPlaying) {
            setShowCourseDialog(true);
        } else {
            toast.info("请先暂停冥想后再更换课程", {
                description: "冥想进行中无法切换课程"
            });
        }
    }, []);

    return {
        // 状态
        showSoundDialog,
        showGuidanceDialog,
        showGuidanceTextDialog,
        showCourseDialog,

        // 设置函数
        setShowSoundDialog,
        setShowGuidanceDialog,
        setShowGuidanceTextDialog,
        setShowCourseDialog,

        // 处理函数
        handleShowGuidanceDialog,
        handleShowSoundDialog,
        handleShowGuidanceText,
        handleShowCourseDialog
    };
};

/**
 * MeditationDialogController 组件 - 负责管理冥想页面中的各种对话框
 */
const MeditationDialogController: React.FC<MeditationDialogControllerProps> = ({
    // 对话框状态
    showSoundDialog,
    showGuidanceDialog,
    showGuidanceTextDialog,
    showCourseDialog,

    // 选中项
    selectedSound,
    selectedGuidance,
    selectedCourse,

    // 其他配置
    sounds,
    guidances,
    courses,
    isDarkTheme,
    isPlaying,

    // 回调函数
    onSoundSelect,
    onGuidanceSelect,
    onCourseSelect,
    onCustomAudioGenerated,

    // 对话框控制
    setShowSoundDialog,
    setShowGuidanceDialog,
    setShowGuidanceTextDialog,
    setShowCourseDialog,

    // 其他回调
    onPlay,

    // 翻译函数
    t
}) => {
    // 处理引导语选择对话框的打开状态
    const handleGuidanceDialogChange = (open: boolean) => {
        if (!isPlaying || !open) {
            setShowGuidanceDialog(open);
        }
    };

    // 处理显示全文
    const handleShowFullText = () => {
        if (selectedGuidance) {
            setShowGuidanceTextDialog(true);
        }
    };

    return (
        <>
            {/* 音效选择对话框 */}
            <Dialog open={showSoundDialog} onOpenChange={setShowSoundDialog}>
                <DialogContent className={`${isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} w-[90vw] max-w-md mx-auto`}>
                    <DialogHeader>
                        <DialogTitle>{t("选择背景音效", "Choose Background Sound")}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto">
                        <SoundSelector
                            sounds={sounds}
                            selectedSound={selectedSound}
                            onSoundSelect={onSoundSelect}
                            isDarkTheme={isDarkTheme}
                            t={t}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* 引导语选择对话框 */}
            <Dialog
                open={showGuidanceDialog && !isPlaying}
                onOpenChange={handleGuidanceDialogChange}
            >
                <DialogContent className={`${isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} w-[90vw] max-w-md mx-auto`}>
                    <DialogHeader>
                        <DialogTitle>{t("选择引导语", "Choose Guidance")}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[calc(85vh-120px)] overflow-y-auto">
                        <GuidanceSelector
                            guidances={guidances}
                            selectedGuidance={selectedGuidance}
                            onGuidanceSelect={(guidance) => {
                                onGuidanceSelect({ ...guidance, audioUrl: guidance.audioUrl || undefined });
                            }}
                            onShowFullText={handleShowFullText}
                            isDarkTheme={isDarkTheme}
                            t={t}
                            onCloseDialog={() => setShowGuidanceDialog(false)}
                            onPlay={onPlay}
                            onCustomAudioGenerated={onCustomAudioGenerated}
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

            {/* 课程选择对话框 */}
            {courses && (
                <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
                    <DialogContent className={`${isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} w-[90vw] max-w-md mx-auto`}>
                        <DialogHeader>
                            <DialogTitle>{t("选择冥想课程", "Choose Meditation Course")}</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-y-auto">
                            <CourseSelector
                                courses={courses}
                                selectedCourse={selectedCourse}
                                onCourseSelect={onCourseSelect}
                                isDarkTheme={isDarkTheme}
                                t={t}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default MeditationDialogController; 