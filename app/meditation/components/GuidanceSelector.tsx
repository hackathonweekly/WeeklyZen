"use client";

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight } from 'lucide-react';

interface GuidanceType {
  content: ReactNode;
  id: string;
  title: string;
  description: string;
  paragraphs: string[];
}

interface GuidanceSelectorProps {
  guidances: GuidanceType[];
  selectedGuidance: GuidanceType | null;
  onGuidanceSelect: (guidance: GuidanceType) => void;
  onShowFullText: () => void;
  isDarkTheme: boolean;
  t: (zh: string, en: string) => string;
}

export function GuidanceSelector({
  guidances,
  selectedGuidance,
  onGuidanceSelect,
  onShowFullText,
  isDarkTheme,
  t
}: GuidanceSelectorProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-medium ${isDarkTheme ? 'text-indigo-200' : 'text-blue-800'}`}>
          {t("引导语", "Guidance")}
        </h3>
        
        {selectedGuidance && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowFullText}
            className={`text-xs ${isDarkTheme ? 'text-indigo-300 hover:text-indigo-200' : 'text-blue-600 hover:text-blue-700'}`}
          >
            <BookOpen size={16} className="mr-1" />
            {t("查看全文", "View Full Text")}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-2">
        {guidances.map((guidance) => (
          <Button
            key={guidance.id}
            variant="outline"
            className={`flex justify-between items-center p-3 h-auto text-left ${
              selectedGuidance?.id === guidance.id 
                ? (isDarkTheme ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                : (isDarkTheme ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
            }`}
            onClick={() => onGuidanceSelect(guidance)}
          >
            <div>
              <div className="font-medium">{guidance.title}</div>
              <div className="text-xs opacity-70 mt-1 line-clamp-2">{guidance.description}</div>
            </div>
            <ChevronRight size={16} className="flex-shrink-0 ml-2" />
          </Button>
        ))}
      </div>
    </div>
  );
} 