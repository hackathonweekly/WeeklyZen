"use client";

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VolumeX } from 'lucide-react';
import { SoundIcon } from '@/app/SoundIcon';
import { SoundData } from '@/app/sounds';

interface SoundSelectorProps {
  sounds: SoundData[];
  selectedSound: SoundData | null;
  onSoundSelect: (sound: SoundData | null) => void;
  isDarkTheme: boolean;
  t: (zh: string, en: string) => string;
}

export function SoundSelector({
  sounds,
  selectedSound,
  onSoundSelect,
  isDarkTheme,
  t
}: SoundSelectorProps) {
  return (
    <div className="w-full">
      {/* 无声选项 */}
      <Button
        variant="outline"
        className={`w-full flex flex-col items-center justify-center p-4 h-auto mb-4 ${
          !selectedSound 
            ? (isDarkTheme ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
            : (isDarkTheme ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
        }`}
        onClick={() => onSoundSelect(null)}
      >
        <VolumeX size={24} className={isDarkTheme ? 'text-indigo-300 mb-2' : 'text-blue-600 mb-2'} />
        <span className="text-sm">{t("无声音", "No Sound")}</span>
      </Button>

      {/* 分类标签页 */}
      <Tabs defaultValue="nature" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger 
            value="nature" 
            className={`${isDarkTheme ? 'data-[state=active]:bg-indigo-800/50' : 'data-[state=active]:bg-blue-100'}`}
          >
            {t("自然", "Nature")}
          </TabsTrigger>
          <TabsTrigger 
            value="rain" 
            className={`${isDarkTheme ? 'data-[state=active]:bg-indigo-800/50' : 'data-[state=active]:bg-blue-100'}`}
          >
            {t("雨声", "Rain")}
          </TabsTrigger>
          <TabsTrigger 
            value="city" 
            className={`${isDarkTheme ? 'data-[state=active]:bg-indigo-800/50' : 'data-[state=active]:bg-blue-100'}`}
          >
            {t("城市", "City")}
          </TabsTrigger>
        </TabsList>

        {/* 自然音效 */}
        <TabsContent value="nature" className="mt-0 max-h-[240px] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-2">
            {sounds
              .filter(sound => sound.category === '自然')
              .map((sound) => (
                <Button
                  key={sound.id}
                  variant="outline"
                  className={`flex flex-col items-center justify-center p-4 h-auto ${
                    selectedSound?.id === sound.id 
                      ? (isDarkTheme ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                      : (isDarkTheme ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                  }`}
                  onClick={() => onSoundSelect(sound)}
                >
                  <SoundIcon iconType={sound.iconType} className={`text-2xl mb-2 ${isDarkTheme ? 'text-indigo-300' : 'text-blue-600'}`} />
                  <span className="text-sm">{t(sound.name, sound.name)}</span>
                </Button>
              ))}
          </div>
        </TabsContent>

        {/* 雨声 */}
        <TabsContent value="rain" className="mt-0 max-h-[240px] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-2">
            {sounds
              .filter(sound => sound.category === '雨声')
              .map((sound) => (
                <Button
                  key={sound.id}
                  variant="outline"
                  className={`flex flex-col items-center justify-center p-4 h-auto ${
                    selectedSound?.id === sound.id 
                      ? (isDarkTheme ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                      : (isDarkTheme ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                  }`}
                  onClick={() => onSoundSelect(sound)}
                >
                  <SoundIcon iconType={sound.iconType} className={`text-2xl mb-2 ${isDarkTheme ? 'text-indigo-300' : 'text-blue-600'}`} />
                  <span className="text-sm">{t(sound.name, sound.name)}</span>
                </Button>
              ))}
          </div>
        </TabsContent>

        {/* 城市 */}
        <TabsContent value="city" className="mt-0 max-h-[240px] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-2">
            {sounds
              .filter(sound => sound.category === '城市')
              .map((sound) => (
                <Button
                  key={sound.id}
                  variant="outline"
                  className={`flex flex-col items-center justify-center p-4 h-auto ${
                    selectedSound?.id === sound.id 
                      ? (isDarkTheme ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                      : (isDarkTheme ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                  }`}
                  onClick={() => onSoundSelect(sound)}
                >
                  <SoundIcon iconType={sound.iconType} className={`text-2xl mb-2 ${isDarkTheme ? 'text-indigo-300' : 'text-blue-600'}`} />
                  <span className="text-sm">{t(sound.name, sound.name)}</span>
                </Button>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 