"use client";

import { useEffect, useState, ReactNode } from 'react';
import fs from 'fs/promises';
import path from 'path';

// 定义引导语类型
export interface GuidanceType {
  content: ReactNode;
  id: string;
  title: string;
  description: string;
  paragraphs: string[];
  audioUrl?: string;
}

// 引导语基本信息
const guidanceInfo = [
  {
    id: 'basic',
    title: '基础引导',
    description: '适合初学者的简单引导',
  },
  {
    id: 'breath',
    title: '呼吸观察',
    description: '专注于呼吸的冥想练习',
  },
  {
    id: 'body',
    title: '身体扫描',
    description: '从头到脚感受身体的冥想',
  }
];

// 客户端组件：加载引导语内容
export function useGuidanceTexts() {
  const [guidanceTexts, setGuidanceTexts] = useState<GuidanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGuidanceTexts() {
      try {
        const loadedGuidances: GuidanceType[] = [];

        // 并行加载所有引导语文件
        const promises = guidanceInfo.map(async (info) => {
          try {
            const response = await fetch(`/ai-txts/${info.id}.txt`);
            if (!response.ok) {
              throw new Error(`Failed to load ${info.id}.txt: ${response.status}`);
            }
            const text = await response.text();

            // 按段落分割文本
            const paragraphs = text
              .split('\n')
              .filter(line => line.trim() !== '')
              .map(line => line.trim());

            loadedGuidances.push({
              ...info,
              paragraphs,
              content: paragraphs.join('\n')
            });
          } catch (err) {
            console.error(`Error loading ${info.id}.txt:`, err);
            // 如果某个文件加载失败，添加一个带有错误信息的占位符
            loadedGuidances.push({
              ...info,
              paragraphs: [`无法加载 ${info.id} 引导语内容`],
              content: `无法加载 ${info.id} 引导语内容`
            });
          }
        });

        // 等待所有文件加载完成
        await Promise.all(promises);

        setGuidanceTexts(loadedGuidances);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load guidance texts:', err);
        setError('加载引导语内容失败');
        setLoading(false);
      }
    }

    loadGuidanceTexts();
  }, []);

  return { guidanceTexts, loading, error };
}

// 为了向后兼容，保留静态导出
export const guidanceTexts = [
  {
    id: 'basic',
    title: '基础引导',
    description: '适合初学者的简单引导',
    paragraphs: [
      '欢迎来到冥想入门练习。让我们开始冥想——冥想，能够帮助专注、放松。',
      '找个舒服姿势，椅子或垫子，背挺直，肩膀放松，双手放腿上，闭眼。',
      '尝试深呼吸几次，吸气……到腹部，呼气……放松。重复几次，自然呼吸。专注呼吸，感受自然。',
      '如果发现思绪飘走，别担心，这很正常。温和地发现它，再轻轻把注意力拉回呼吸。感受一下，吸气时，鼻腔的凉意，呼气时，那股暖意。',
      '注意力会游走，这是大脑的天性。发现走神，别沮丧，友善地回到呼吸上。这个过程，就是冥想的关键。',
      '现在，专注呼吸，感受胸腹起伸。不必刻意改变，就觉察当下的感受。',
      '现在，让我们准备结束这次冥想练习。慢慢地动一动手指和脚趾，唤醒你的身体，深吸一口气，然后缓缓呼出。',
      '按自己的节奏，轻轻睁开眼，温和地回到当下。环顾四周，感受内在和外在的状态。',
      '无论此刻你感到平静、轻松，或没有特别的感觉，都请接纳它。',
      '接下来是10分钟行禅时间，边走边专注，完成行禅的洗礼。缓慢地步伐行走，感受每一步。',
      '脚掌贴地的触感，腿部肌肉的运动。不用改变平常走路的方式，专注于走路这个动作上。',
      '请起身，我们一起开始行禅练习。'
    ]
  },
  {
    id: 'breath',
    title: '呼吸观察',
    description: '专注于呼吸的冥想练习',
    paragraphs: [
      '欢迎来到观察呼吸练习。这是一个回归内在平静、感受当下的练习。',
      '请找个舒服姿势坐下或躺下，身体放松。闭上眼睛，沉浸在这份宁静里。',
      '现在，把注意力放在呼吸上。保持自然呼吸，用鼻子轻柔地吸气……呼气。',
      '留意空气进入鼻腔时的温度，从凉到暖。感受胸腹部的起伏，呼吸带来的微妙变化。',
      '注意呼吸之间的短暂停顿，就像提醒我们，放慢脚步。试着把心安在当下，不纠结过去，不担心未来。',
      '初学者可以从5到10分钟开始，练习久了，可以慢慢延长到半小时到一小时。',
      '当被思绪带走，别着急，这是大脑的正常反应。发现走神，温柔地，把注意力拉回呼吸上。',
      '感受空气进出鼻腔的温度，胸腹的起伏，留意呼吸的间隙。每次回到呼吸，就是对自己的一次温柔提醒。',
      '不刻意改变呼吸节奏，安静观察它的自然流动。活在当下，感受每一刻，让身心在呼吸中找到宁静和自在。',
      '现在，让我们准备结束这次观察练习。轻轻动一动手指和脚趾，感受身体醒过来。',
      '深吸一口气，让清新的空气充满全身，然后慢慢呼出。准备好一切，慢慢睁开眼睛，回到周围环境。',
      '不管你现在是平静、放松，还是其他感受，都请接纳它们。觉察呼吸，就是回归当下的练习，帮助我们找到内心的宁静。',
      '希望你今天感受到了自在和安宁。'
    ]
  },
  {
    id: 'body',
    title: '身体扫描',
    description: '从头到脚感受身体的冥想',
    paragraphs: [
      '欢迎来到身体扫描练习。这是一次深度连接身体的旅程。',
      '找一个安静舒适的地方，坐下或躺下，身体放松。闭上眼睛，沉浸当下的宁静。',
      '从脚趾开始，慢慢向上扫描全身。依次感受双脚，小腿，大腿，臀部，腹部，胸部，后背，双手，肩膀，颈部，面部。',
      '留意每个部位的温度，重量，触感。不刻意改变，简单地觉察。',
      '注意力开始漂移，这是很自然的。轻轻把注意力拉回，从脚趾开始，再次感受身体。',
      '就像用内心镜头，缓缓扫过每个角落。记住，身体扫描是为了觉察，而非改变。',
      '每一次回归，都是对当下的重新连接。',
      '现在，让我们准备结束这次扫描练习。慢慢动动手指和脚趾，感受身体的活力。',
      '深吸一口气，让空气充满全身，缓缓呼出。准备好了，就慢慢睁开眼睛，回到周围环境。',
      '无论你感到平静、放松，还是别的感受，都请接纳它们。身体扫描，是一次和自己对话的过程。',
      '希望你在这次练习中，找到了内心的宁静。'
    ]
  }
]; 