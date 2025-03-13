'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useAppTheme } from '@/contexts/theme-context';

interface BreathingSphereProps {
  isPlaying?: boolean;
  showText?: boolean;
  customText?: {
    inhale: string;
    exhale: string;
    paused?: string;
  };
  size?: 'small' | 'medium' | 'large';
  position?: 'center' | 'top' | 'bottom';
}

export function BreathingSphere({
  isPlaying = true,
  showText = true,
  customText = {
    inhale: "跟随呼吸球，吸气",
    exhale: "跟随呼吸球，呼气",
    paused: "冥想，静心开始。"
  },
  size = 'medium',
  position = 'center'
}: BreathingSphereProps) {
  const [breathingState, setBreathingState] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('rest');
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { isDarkTheme } = useAppTheme();
  
  // 根据尺寸设置大小
  const getSizeValue = () => {
    switch(size) {
      case 'small': return { min: '30vmin', max: '50vmin' };
      case 'large': return { min: '50vmin', max: '80vmin' };
      case 'medium':
      default: return { min: '40vmin', max: '70vmin' };
    }
  };
  
  const { min, max } = getSizeValue();
  
  // 呼吸动画控制
  useEffect(() => {
    // 启动呼吸动画循环
    const startBreathingCycle = () => {
      let cyclePosition = 0;
      
      // 清除任何现有的间隔
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
      
      breathingIntervalRef.current = setInterval(() => {
        // 总周期为 12 秒 (4-2-4-2)
        // 吸气 4 秒，保持 2 秒，呼气 4 秒，休息 2 秒
        if (cyclePosition < 4) {
          setBreathingState('inhale');
        } else if (cyclePosition < 6) {
          setBreathingState('hold');
        } else if (cyclePosition < 10) {
          setBreathingState('exhale');
        } else {
          setBreathingState('rest');
        }
        
        cyclePosition = (cyclePosition + 1) % 12;
      }, 1000);
    };
    
    if (isPlaying) {
      startBreathingCycle();
    } else {
      // 不在播放状态时，设置为休息状态
      setBreathingState('rest');
      
      // 清除任何现有的间隔
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    }
    
    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, [isPlaying]);
  
  // 设置位置样式
  const getPositionStyle = () => {
    // 无论传入什么position值，都返回top-1/2确保居中
    return 'top-1/2';
  };
  
  return (
    <div className="relative w-full h-full">
      {/* 呼吸圆圈 - 根据呼吸状态变化 */}
      <motion.div 
        style={{
          background: isDarkTheme 
            ? 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(165,180,252,0.2) 80%)'
            : 'radial-gradient(circle, rgba(148,189,251,0.95) 0%, rgba(148,189,251,0.9) 100%)',
        }}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-50`}
        animate={{ 
          width: 
            breathingState === 'inhale' ? [min, max] : 
            breathingState === 'hold' ? [max] : 
            breathingState === 'exhale' ? [max, min] : 
            [min],
          height: 
            breathingState === 'inhale' ? [min, max] : 
            breathingState === 'hold' ? [max] : 
            breathingState === 'exhale' ? [max, min] : 
            [min],
          opacity: 
            breathingState === 'inhale' ? [0.9, 1] : 
            breathingState === 'hold' ? [1] : 
            breathingState === 'exhale' ? [1, 0.9] : 
            [0.9],
          boxShadow: isDarkTheme
            ? (breathingState === 'inhale' ? ['0 0 50px rgba(165,180,252,0.3)', '0 0 70px rgba(224,231,255,0.35)'] :
              breathingState === 'hold' ? ['0 0 70px rgba(224,231,255,0.35)'] :
              breathingState === 'exhale' ? ['0 0 70px rgba(224,231,255,0.35)', '0 0 50px rgba(165,180,252,0.3)'] :
              ['0 0 60px rgba(165,180,252,0.4)'])
            : (breathingState === 'inhale' ? ['0 0 100px rgba(148,189,251,0.6)', '0 0 150px rgba(148,189,251,0.7)'] :
              breathingState === 'hold' ? ['0 0 150px rgba(148,189,251,0.7)'] :
              breathingState === 'exhale' ? ['0 0 150px rgba(148,189,251,0.7)', '0 0 100px rgba(148,189,251,0.6)'] :
              ['0 0 100px rgba(148,189,251,0.6)']),
        }}
        transition={{ 
          duration: 
            breathingState === 'inhale' ? 4 : 
            breathingState === 'hold' ? 2 : 
            breathingState === 'exhale' ? 4 : 
            2,
          ease: "easeInOut",
        }}
      />
      
      {/* 光晕效果 */}
      <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 w-12 h-12 rounded-full ${isDarkTheme ? 'bg-blue-500/ z-40' : 'bg-blue-100/30 z-40'} blur-3xl`} />
      <div className={`absolute top-1/2 right-1/3 -translate-y-1/2 w-18 h-18 rounded-full ${isDarkTheme ? 'bg-indigo-500/40 z-40' : 'bg-blue-200/20 z-40'} blur-3xl`} />
      
      {/* 呼吸提示文本 */}
      {showText && (
        <div className={`absolute top-[60%] left-1/2 -translate-x-1/2 text-center z-60`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isPlaying ? (breathingState === 'inhale' || breathingState === 'hold' ? 'inhale' : 'exhale') : 'paused'}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.5 }}
              className={`text-sm md:text-base ${isDarkTheme ? 'text-indigo-500/80' : 'text-slate-600'} font-medium tracking-wide`}
            >
              {!isPlaying 
                ? customText.paused 
                : (breathingState === 'inhale' || breathingState === 'hold') 
                  ? customText.inhale 
                  : customText.exhale}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
      
      {/* 星空效果 */}
      <div className={`absolute inset-0 opacity-50 z-30`}>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${isDarkTheme ? 'bg-white' : 'bg-blue-100'}`}
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  );
} 