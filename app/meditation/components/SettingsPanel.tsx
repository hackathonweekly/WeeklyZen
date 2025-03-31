"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SettingsPanelProps {
  durations: number[];
  selectedDuration: number;
  customDuration: number;
  showCustomDuration: boolean;
  isPlaying: boolean;
  isPlayingEndSound: boolean;
  onDurationSelect: (duration: number) => void;
  onCustomDurationChange: (duration: number) => void;
  onToggleCustomDuration: () => void;
  isDarkTheme: boolean;
  t: (zh: string, en: string) => string;
}

export function SettingsPanel({
  durations,
  selectedDuration,
  customDuration,
  showCustomDuration,
  isPlaying,
  isPlayingEndSound,
  onDurationSelect,
  onCustomDurationChange,
  onToggleCustomDuration,
  isDarkTheme,
  t
}: SettingsPanelProps) {
  return (
    <div className="w-full space-y-4">
      <h3 className={`text-lg font-medium ${isDarkTheme ? 'text-indigo-200' : 'text-blue-800'}`}>
        {t("冥想时长", "Meditation Duration")}
      </h3>
      
      {/* 预设时长选项 */}
      <div className="grid grid-cols-3 gap-2">
        {durations.map((duration) => (
          <Button
            key={duration}
            variant="outline"
            className={`${
              selectedDuration === duration && !showCustomDuration
                ? (isDarkTheme ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                : (isDarkTheme ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
            }`}
            onClick={() => onDurationSelect(duration)}
            disabled={isPlaying || isPlayingEndSound}
          >
            {duration} {t("分钟", "min")}
          </Button>
        ))}
        
        {/* 自定义时长按钮 */}
        <Button
          variant="outline"
          className={`${
            showCustomDuration
              ? (isDarkTheme ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
              : (isDarkTheme ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
          }`}
          onClick={onToggleCustomDuration}
          disabled={isPlaying || isPlayingEndSound}
        >
          {t("自定义", "Custom")}
        </Button>
      </div>
      
      {/* 自定义时长输入 */}
      {showCustomDuration && (
        <div className="space-y-2">
          <Label htmlFor="custom-duration" className={isDarkTheme ? 'text-indigo-200' : 'text-blue-800'}>
            {t("自定义时长（分钟）", "Custom Duration (minutes)")}
          </Label>
          <Input
            id="custom-duration"
            type="number"
            min="1"
            max="180"
            value={customDuration}
            onChange={(e) => onCustomDurationChange(Number.parseInt(e.target.value) || 5)}
            disabled={isPlaying || isPlayingEndSound}
            className={`${isDarkTheme ? 'bg-indigo-900/50 border-indigo-700' : 'bg-blue-50 border-blue-200'}`}
          />
        </div>
      )}
    </div>
  );
} 