"use client";

import { ReactNode, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, VolumeX, Volume2 } from 'lucide-react';
import { CustomGuidance } from './CustomGuidance';

interface GuidanceType {
  content: ReactNode;
  id: string;
  title: string;
  description: string;
  paragraphs: string[];
  audioUrl?: string;
}

interface GuidanceSelectorProps {
  guidances: GuidanceType[];
  selectedGuidance: GuidanceType | null;
  onGuidanceSelect: (guidance: GuidanceType) => void;
  onShowFullText: () => void;
  isDarkTheme: boolean;
  t: (zh: string, en: string) => string;
}

// 创建"无引导语"选项
const createNoGuidanceOption = (t: (zh: string, en: string) => string): GuidanceType => ({
  id: 'no-guidance',
  title: t('无引导语', 'No Guidance'),
  description: t('专注于呼吸，无语音引导', 'Focus on your breath without voice guidance'),
  paragraphs: [],
  content: <></>,
});

// 音频资源映射
const guidanceAudioMap: Record<string, string> = {
  'basic': 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/meditation.mp3',
  'breath': 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/breathtrain.mp3',
  'body': 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/bodyscan.mp3',
};

export function GuidanceSelector({
  guidances,
  selectedGuidance,
  onGuidanceSelect,
  onShowFullText,
  isDarkTheme,
  t
}: GuidanceSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [guidanceAudio, setGuidanceAudio] = useState<HTMLAudioElement | null>(null);

  // 创建无引导语选项
  const noGuidanceOption = createNoGuidanceOption(t);

  // 组件卸载时清理音频
  useEffect(() => {
    return () => {
      if (guidanceAudio) {
        guidanceAudio.pause();
        guidanceAudio.src = '';
      }
    };
  }, [guidanceAudio]);

  // 处理引导语选择
  const handleGuidanceSelect = (guidance: GuidanceType) => {
    // 如果有正在播放的音频，先停止
    if (guidanceAudio) {
      guidanceAudio.pause();
      guidanceAudio.src = '';
    }

    // 添加音频URL（预设的引导语）
    let updatedGuidance = { ...guidance };

    // 如果是预设引导语，添加对应的音频URL
    if (guidanceAudioMap[guidance.id]) {
      console.log(`引导语ID: ${guidance.id} 找到对应音频URL: ${guidanceAudioMap[guidance.id]}`);
      updatedGuidance.audioUrl = guidanceAudioMap[guidance.id];
    } else {
      console.log(`引导语ID: ${guidance.id} 没有找到对应音频`);
    }

    // 调用父组件的选择函数
    console.log('传递引导语到父组件', updatedGuidance);
    onGuidanceSelect(updatedGuidance);
    setShowCustom(false);
  };

  const handleGuidanceCreated = (newGuidance: GuidanceType) => {
    handleGuidanceSelect(newGuidance);
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

        <div className="flex items-center gap-2">
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

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCustom(!showCustom)}
            className={`text-xs ${isDarkTheme ? 'text-indigo-300 hover:text-indigo-200' : 'text-blue-600 hover:text-blue-700'}`}
          >
            {showCustom
              ? t("返回列表", "Back to List")
              : t("创建自定义", "Create Custom")}
          </Button>
        </div>
      </div>

      {showCustom ? (
        <CustomGuidance
          onGuidanceCreated={handleGuidanceCreated}
          isDarkTheme={isDarkTheme}
          t={t}
        />
      ) : (
        <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-2">
          {/* 无引导语选项 */}
          <Button
            key={noGuidanceOption.id}
            variant="outline"
            className={`flex justify-between items-center p-3 h-auto text-left ${selectedGuidance?.id === noGuidanceOption.id
              ? (isDarkTheme ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400')
              : (isDarkTheme ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
              }`}
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

          {/* 其他引导语选项 */}
          {guidances.map((guidance) => (
            <Button
              key={guidance.id}
              variant="outline"
              className={`flex justify-between items-center p-3 h-auto text-left ${selectedGuidance?.id === guidance.id
                ? (isDarkTheme ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400')
                : (isDarkTheme ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                }`}
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
      )}
    </div>
  );
} 