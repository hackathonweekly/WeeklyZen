"use client";

import { ReactNode, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, VolumeX, Volume2, Plus, ChevronDown } from 'lucide-react';
import { CustomGuidance } from './CustomGuidance';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GuidanceType {
  content: ReactNode;
  id: string;
  title: string;
  description: string;
  paragraphs: string[];
  audioUrl?: string | null;
}

interface GuidanceSelectorProps {
  guidances: GuidanceType[];
  selectedGuidance: GuidanceType | null;
  onGuidanceSelect: (guidance: GuidanceType) => void;
  onShowFullText: () => void;
  isDarkTheme: boolean;
  t: (zh: string, en: string) => string;
  onCloseDialog?: () => void;
  onPlay?: () => void;
  onCustomAudioGenerated?: (audioUrl: string | undefined) => void;
  customAudioUrl?: string;
  volume?: number;
  isMuted?: boolean;
}

// 创建"无引导语"选项
const createNoGuidanceOption = (t: (zh: string, en: string) => string): GuidanceType => ({
  id: 'no-guidance',
  title: t('无引导语', 'No Guidance'),
  description: t('专注于呼吸，无语音引导', 'Focus on your breath without voice guidance'),
  paragraphs: [],
  content: <></>,
});

// 创建"自定义引导语"选项
const createCustomGuidanceOption = (t: (zh: string, en: string) => string): GuidanceType => ({
  id: 'custom-guidance',
  title: t('创建专属引导语', 'Create Custom Guidance'),
  description: t('分享你的困扰，AI为你生成个性化的冥想引导', 'Share your concerns, AI generates personalized meditation guidance'),
  paragraphs: [],
  content: <></>,
});

// 音频资源映射
const guidanceAudioMap: Record<string, string> = {
  'basic': 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/meditation.mp3',
  'breath': 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/breathtrain.mp3',
  'body': 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/bodyscan.mp3',
  'custom-guidance': 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/start.mp3',
};

export function GuidanceSelector({
  guidances,
  selectedGuidance,
  onGuidanceSelect,
  onShowFullText,
  isDarkTheme,
  t,
  onCloseDialog,
  onPlay,
  onCustomAudioGenerated,
  customAudioUrl,
  volume = 100,
  isMuted = false
}: GuidanceSelectorProps) {
  const [showCustom, setShowCustom] = useState(true);
  const [guidanceAudio, setGuidanceAudio] = useState<HTMLAudioElement | null>(null);

  // 创建无引导语和自定义引导语选项
  const noGuidanceOption = createNoGuidanceOption(t);
  const customGuidanceOption = createCustomGuidanceOption(t);

  // 组件卸载时清理音频
  useEffect(() => {
    if (!guidanceAudio) return;

    // 创建定时器
    const timer = setTimeout(() => {
      const handleAudioEnd = () => {
        // 检查三个条件
        const isStartAudio = guidanceAudio.src.includes('start.mp3');
        const isCustomGuidance = selectedGuidance?.id === 'custom-guidance';
        const isSelectedStartAudio = selectedGuidance?.audioUrl?.includes('start.mp3');

        // 如果满足任一条件且存在 customAudioUrl，则播放自定义音频
        if ((isStartAudio || isCustomGuidance || isSelectedStartAudio) && customAudioUrl) {
          // 确保在浏览器环境中运行
          if (typeof window !== 'undefined') {
            const customAudio = new window.Audio(customAudioUrl);
            // 设置音量和静音状态
            customAudio.volume = isMuted ? 0 : volume / 100;
            // 保存音频引用以便控制
            setGuidanceAudio(customAudio);
            // 播放音频
            // customAudio.play().then(() => {
            //   console.log('[调试] 自定义音频开始播放成功');
            // }).catch(error => {
            //   console.error('[调试] 播放自定义音频失败:', error);
            //   toast.error('播放自定义音频失败，请重试');
            // });
          }
        }
      };

      guidanceAudio.addEventListener('ended', handleAudioEnd);

      return () => {
        guidanceAudio.removeEventListener('ended', handleAudioEnd);
      };
    }, 1000);

    // 清理函数：组件卸载时清理定时器
    return () => {
      clearTimeout(timer);
    };
  }, [guidanceAudio, selectedGuidance, customAudioUrl, volume, isMuted]);

  // 处理引导语选择
  const handleGuidanceSelect = (guidance: GuidanceType) => {
    console.log('[GuidanceSelector] 选择引导语:', {
      id: guidance.id,
      title: guidance.title,
    });

    // 停止当前播放的音频
    if (guidanceAudio) {
      guidanceAudio.pause();
      guidanceAudio.currentTime = 0;
    }

    // 如果是"无引导语"选项，不设置音频URL
    if (guidance.id === 'no-guidance') {
      console.log('[GuidanceSelector] 选择无引导语，不设置音频');
      const updatedGuidance = {
        ...guidance,
        audioUrl: null
      };
      onGuidanceSelect(updatedGuidance);
      return;
    }

    // 检查是否存在对应的音频资源
    let audioUrl = guidance.audioUrl;
    if (!audioUrl && guidanceAudioMap[guidance.id]) {
      audioUrl = guidanceAudioMap[guidance.id];
      console.log('[GuidanceSelector] 使用预设音频URL:', audioUrl);
    }

    // 如果是自定义引导语,强制使用 start.mp3
    if (guidance.id === 'custom-guidance') {
      audioUrl = 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/start.mp3';
      console.log('[GuidanceSelector] 使用自定义引导语音频:', audioUrl);
    }

    // 更新选中的引导语，确保包含正确的音频URL
    const updatedGuidance = {
      ...guidance,
      audioUrl: audioUrl
    };


    // 如果是预设引导语且在音频映射表中存在，添加音频URL
    if (guidance.id in guidanceAudioMap && !guidance.audioUrl) {
      updatedGuidance.audioUrl = guidanceAudioMap[guidance.id];
      console.log('[GuidanceSelector] 添加音频URL:', updatedGuidance.audioUrl);
    }

    onGuidanceSelect(updatedGuidance);
  };

  const handleGuidanceCreated = (newGuidance: GuidanceType) => {
    // 确保自定义引导语的ID始终为'custom-guidance'
    const updatedGuidance = {
      ...newGuidance,
      id: 'custom-guidance' // 强制设置ID为'custom-guidance'
    };

    handleGuidanceSelect(updatedGuidance);
    setShowCustom(false);
  };

  // 为每个引导语添加音频图标
  const renderGuidanceIcon = (guidance: GuidanceType) => {
    // 检查是否有音频
    const hasAudio = guidanceAudioMap[guidance.id] || guidance.audioUrl;

    if (hasAudio) {
      return <Volume2 size={18} className={`mr-2 ${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'}`} />;
    }

    return null;
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-medium ${isDarkTheme ? 'text-indigo-200' : 'text-blue-800'}`}>
          {t("引导语", "Guidance")}
        </h3>

        {selectedGuidance && selectedGuidance.id !== 'no-guidance' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowFullText}
            className={`text-xs ${isDarkTheme ? 'text-indigo-300 hover:text-indigo-200' : 'text-blue-600 hover:text-blue-700'}`}
          >
            <BookOpen size={16} className="mr-1" />
            {t("查看引导语", "View Guidance")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[calc(65vh-80px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500">
        {/* 自定义引导语选项 */}
        <div className="space-y-2">
          <Button
            key={customGuidanceOption.id}
            variant="outline"
            className={cn(
              "flex justify-between items-center p-3 h-auto text-left w-full",
              selectedGuidance?.id === customGuidanceOption.id
                ? isDarkTheme
                  ? 'bg-indigo-800/30 border-indigo-600'
                  : 'bg-blue-100 border-blue-400'
                : isDarkTheme
                  ? 'border-indigo-800/30 hover:bg-indigo-900/50'
                  : 'border-blue-200 hover:bg-blue-50'
            )}
            onClick={() => {
              if (selectedGuidance?.id !== customGuidanceOption.id) {
                handleGuidanceSelect(customGuidanceOption);
              }
              setShowCustom(!showCustom);
            }}
          >
            <div className="flex items-center">
              <Plus size={18} className={`mr-2 ${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'}`} />
              <div>
                <div className="font-medium">{customGuidanceOption.title}</div>
                <div className="text-xs opacity-70 mt-1 line-clamp-2">{customGuidanceOption.description}</div>
              </div>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                "flex-shrink-0 ml-2 transition-transform duration-200",
                showCustom ? "transform rotate-180" : ""
              )}
            />
          </Button>

          {/* 自定义引导语表单 - 下拉列表形式 */}
          {showCustom && (
            <div className={cn(
              "pl-4 border-l-2 transition-all duration-200",
              isDarkTheme ? "border-indigo-800/30" : "border-blue-200"
            )}>
              <CustomGuidance
                onGuidanceCreated={handleGuidanceCreated}
                onCustomAudioGenerated={onCustomAudioGenerated}
                isDarkTheme={isDarkTheme}
                t={t}
                onGenerateComplete={() => {
                  // 生成完成后关闭对话框并播放
                  if (onCloseDialog) onCloseDialog();
                  if (onPlay) onPlay();
                }}
              />
            </div>
          )}
        </div>

        {/* 无引导语选项 */}
        <Button
          key={noGuidanceOption.id}
          variant="outline"
          className={cn(
            "flex justify-between items-center p-3 h-auto text-left",
            selectedGuidance?.id === noGuidanceOption.id
              ? isDarkTheme
                ? 'bg-indigo-800/30 border-indigo-600'
                : 'bg-blue-100 border-blue-400'
              : isDarkTheme
                ? 'border-indigo-800/30 hover:bg-indigo-900/50'
                : 'border-blue-200 hover:bg-blue-50'
          )}
          onClick={() => handleGuidanceSelect(noGuidanceOption)}
        >
          <div className="flex items-center">
            <VolumeX size={18} className={`mr-2 ${isDarkTheme ? 'text-indigo-400' : 'text-blue-500'}`} />
            <div>
              <div className="font-medium">{noGuidanceOption.title}</div>
              <div className="text-xs opacity-70 mt-1 line-clamp-2">{noGuidanceOption.description}</div>
            </div>
          </div>
          <ChevronRight size={16} className="flex-shrink-0 ml-2" />
        </Button>

        {/* 预设引导语选项 */}
        {guidances.map((guidance) => (
          <Button
            key={guidance.id}
            variant="outline"
            className={cn(
              "flex justify-between items-center p-3 h-auto text-left",
              selectedGuidance?.id === guidance.id
                ? isDarkTheme
                  ? 'bg-indigo-800/30 border-indigo-600'
                  : 'bg-blue-100 border-blue-400'
                : isDarkTheme
                  ? 'border-indigo-800/30 hover:bg-indigo-900/50'
                  : 'border-blue-200 hover:bg-blue-50'
            )}
            onClick={() => handleGuidanceSelect(guidance)}
          >
            <div className="flex items-center">
              {renderGuidanceIcon(guidance)}
              <div>
                <div className="font-medium">{guidance.title}</div>
                <div className="text-xs opacity-70 mt-1 line-clamp-2">{guidance.description}</div>
              </div>
            </div>
            <ChevronRight size={16} className="flex-shrink-0 ml-2" />
          </Button>
        ))}
      </div>
    </div>
  );
} 