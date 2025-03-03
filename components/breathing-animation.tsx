"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function BreathingAnimation() {
  const [isBreathing, setIsBreathing] = useState(false);

  useEffect(() => {
    // 启动动画
    setIsBreathing(true);
    
    // 设置一个定时器，确保动画在页面加载后始终运行
    const interval = setInterval(() => {
      setIsBreathing(true);
    }, 10000); // 每10秒重置一次动画状态，确保它继续运行
    
    return () => clearInterval(interval);
  }, []);

  // 定义呼吸循环动画
  const breathingCycle = {
    initial: { scale: 0.8, opacity: 0.7 },
    inhale: { 
      scale: 1.2, 
      opacity: 1,
      transition: { 
        duration: 4,
        ease: "easeInOut" 
      }
    },
    exhale: { 
      scale: 0.8, 
      opacity: 0.7,
      transition: { 
        duration: 6,
        ease: "easeInOut" 
      }
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        className="absolute rounded-full bg-white dark:bg-black mix-blend-difference"
        style={{ width: "30vmin", height: "30vmin" }}
        initial="initial"
        animate={isBreathing ? ["inhale", "exhale"] : "initial"}
        variants={breathingCycle}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
      <motion.div 
        className="absolute rounded-full border-2 border-white dark:border-gray-800"
        style={{ width: "60vmin", height: "60vmin" }}
        initial={{ opacity: 0.2 }}
        animate={{ 
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
    </div>
  );
} 