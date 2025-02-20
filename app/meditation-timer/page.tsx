"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, Calendar, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

// 时间选项，每15度一个刻度，总共24个点
const TIME_MARKS = Array.from({ length: 24 }, (_, i) => {
  const value = (i + 1) * 5 * 60; // 从5分钟开始
  const angle = (i * 15 - 90) % 360; // 从12点钟开始，顺时针方向
  return {
    angle,
    value,
    label: `${value / 60}分钟`
  };
});

// 根据角度获取时间
const getTimeFromAngle = (angle: number) => {
  // 将角度规范化到 -90 到 270 度范围内
  const normalizedAngle = ((angle + 90) % 360) - 90;
  // 找到最接近的刻度
  const closestMark = TIME_MARKS.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.angle - normalizedAngle);
    const currDiff = Math.abs(curr.angle - normalizedAngle);
    return currDiff < prevDiff ? curr : prev;
  });
  return closestMark.value;
};

// 计算角度对应的坐标
const getCoordinates = (angle: number, radius: number) => {
  const radian = (angle - 90) * (Math.PI / 180); // 从12点钟方向开始
  return {
    x: Math.cos(radian) * radius,
    y: Math.sin(radian) * radius
  };
};

export default function MeditationTimer() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(5 * 60); // 初始值为5分钟
  const [time, setTime] = useState(selectedDuration);
  const [currentTime, setCurrentTime] = useState(format(new Date(), 'HH:mm'));
  const [angle, setAngle] = useState(-90); // 初始角度为-90度，对应12点钟方向

  // 处理鼠标拖动选择时间
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || isRunning) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // 计算角度
    let angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    // 将角度对齐刻度，顺时针方向
    const snapAngle = (Math.round(angle / 15) * 15 - 90) % 360;
    setAngle(snapAngle);
    
    // 设置时间
    const newTime = getTimeFromAngle(snapAngle);
    setSelectedDuration(newTime);
    setTime(newTime);
  };

  useEffect(() => {
    // 更新当前时间
    const timeInterval = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm'));
    }, 1000);

    // 更新倒计时
    let countdownInterval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      countdownInterval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => {
      clearInterval(timeInterval);
      clearInterval(countdownInterval);
    };
  }, [isRunning, time]);

  // 格式化倒计时时间
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 relative flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center">
        <span className="text-sm">{currentTime}</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mt-2">
        <button 
          onClick={() => router.push('/')}
          className="text-lg font-light flex items-center gap-2 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
        <Settings className="w-5 h-5" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-20">
        {/* Main Circle */}
        <div 
          className="relative w-80 h-80 flex items-center justify-center mb-12"
          onMouseDown={() => !isRunning && setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Breathing Circles */}
          <AnimatePresence>
            {/* 同心圈效果 */}
            {[...Array(6)].map((_, i) => {
              // 计算每个圈的大小和透明度
              const baseScale = 0.3 + (i * 0.1); // 从0.3到0.8
              const opacityBase = 0.8 - (i * 0.1); // 从0.8到0.3
              
              return (
                <motion.div
                  key={`circle-${i}`}
                  className="absolute w-full h-full rounded-full border-2 border-white/60"
                  initial={{ 
                    scale: baseScale,
                    opacity: opacityBase * 0.5 // 静止状态下的透明度
                  }}
                  animate={{
                    scale: isRunning 
                      ? [baseScale, baseScale + 0.15, baseScale]
                      : baseScale,
                    opacity: isRunning
                      ? [opacityBase, opacityBase * 0.4, opacityBase]
                      : opacityBase * 0.5
                  }}
                  transition={{
                    duration: 4,
                    repeat: isRunning ? Infinity : 0,
                    ease: "easeInOut",
                    delay: 0
                  }}
                />
              );
            })}
          </AnimatePresence>

          {/* Time Selection Circle */}
          {!isRunning && (
            <>
              {/* Time Marks */}
              {TIME_MARKS.map((mark) => {
                const coords = getCoordinates(mark.angle, 150);
                return (
                  <div
                    key={mark.angle}
                    className={`absolute w-1 h-1 rounded-full transition-all duration-300 ${mark.value === selectedDuration ? 'bg-white scale-150' : 'bg-white/30'}`}
                    style={{
                      transform: `translate(${coords.x}px, ${coords.y}px)`,
                    }}
                  />
                );
              })}

              {/* Clock Hand */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-1 h-32 bg-white/50 origin-top rounded-full"
                style={{ 
                  transform: `translate(-50%, 0) rotate(${angle}deg)`,
                }}
                animate={{ opacity: isDragging ? 0.8 : 0.5 }}
                transition={{ duration: 0.2 }}
              />
            </>
          )}
          
          {/* Center Text */}
          <div className="text-center z-10">
            {isRunning ? (
              <div className="flex flex-col items-center">
                <p className="text-6xl font-light">{formatCountdown(time)}</p>
              </div>
            ) : (
              <div className="text-2xl font-light text-white/80">
                {TIME_MARKS.find(mark => mark.value === selectedDuration)?.label}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-8">
          <button 
            className={`px-12 py-3 rounded-full text-lg font-medium transition-all ${isRunning
              ? 'border-2 border-white/30 text-white hover:bg-white/10'
              : 'bg-white text-black hover:bg-gray-200'}`}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? '暂停' : '开始'}
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="mt-auto pt-8 flex justify-between items-center">
        <button className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="mt-2 text-sm">
            <span className="text-white">+{(time / 60).toFixed(1)}</span>
            <span className="text-xs">m</span>
            <div className="text-xs text-white/60">今日</div>
          </div>
        </button>

        <button className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
          <Volume2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
