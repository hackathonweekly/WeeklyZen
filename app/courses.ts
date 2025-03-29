"use client";

import { ReactNode } from 'react';

// 定义冥想课程类型
export interface CourseData {
  id: string;
  name: string;
  description: string;
  audioUrl: string;
  duration: number;  // 单位：分钟
  iconType: 'course';
  source: string;    // 音频来源
}

// 潮汐APP冥想课程数据
export const courses: CourseData[] = [
  // 7天冥想入门课程
  {
    id: '1day',
    name: '第1天：初识冥想',
    description: '7天冥想入门课程的第一天，帮助你了解冥想的基础知识。',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/1day.mp3',
    duration: 10,  // 假设时长为10分钟，实际应根据音频调整
    iconType: 'course',
    source: '潮汐APP'
  },
  {
    id: '2day',
    name: '第2天：呼吸与觉察',
    description: '7天冥想入门课程的第二天，专注于呼吸的觉察。',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/2day.mp3',
    duration: 10,
    iconType: 'course',
    source: '潮汐APP'
  },
  {
    id: '3day',
    name: '第3天：身体扫描',
    description: '7天冥想入门课程的第三天，进行全身的觉察。',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/3day.mp3',
    duration: 10,
    iconType: 'course',
    source: '潮汐APP'
  },
  {
    id: '4day',
    name: '第4天：情绪觉察',
    description: '7天冥想入门课程的第四天，觉察自己的情绪变化。',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/4day.mp3',
    duration: 10,
    iconType: 'course',
    source: '潮汐APP'
  },
  {
    id: '5day',
    name: '第5天：思维觉察',
    description: '7天冥想入门课程的第五天，觉察自己的思维模式。',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/5day.mp3',
    duration: 10,
    iconType: 'course',
    source: '潮汐APP'
  },
  {
    id: '6day',
    name: '第6天：慈心练习',
    description: '7天冥想入门课程的第六天，培养对自己和他人的慈悲之心。',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/6day.mp3',
    duration: 10,
    iconType: 'course',
    source: '潮汐APP'
  },
  {
    id: '7day',
    name: '第7天：正念生活',
    description: '7天冥想入门课程的最后一天，学习将冥想融入日常生活。',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/7day.mp3',
    duration: 10,
    iconType: 'course',
    source: '潮汐APP'
  },

  // 专题练习
  {
    id: 'bodyscan',
    name: '身体扫描练习',
    description: '全面的身体扫描冥想，帮助你深入感受身体的每一部分。',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bodyscan.mp3',
    duration: 15,
    iconType: 'course',
    source: '潮汐APP'
  },
  {
    id: 'breathtrain',
    name: '呼吸练习',
    description: '专注于呼吸的冥想练习，培养专注力和平静心态。',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/breathtrain.mp3',
    duration: 15,
    iconType: 'course',
    source: '潮汐APP'
  }
];

// 为了向后兼容，导出默认课程
export const defaultCourse = courses.find(c => c.id === '1day') || courses[0]; 