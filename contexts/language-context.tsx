"use client";

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';

type Language = 'zh' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (zh: string, en: string) => string;
  currentLanguage: string;
}

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 语言提供者组件
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // 默认使用中文
  const [language, setLanguage] = useState<Language>('zh');

  // 在组件挂载时，尝试从本地存储获取语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // 当语言变化时，保存到本地存储
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // 翻译函数
  const t = (zh: string, en: string) => {
    return language === 'zh' ? zh : en;
  };

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      currentLanguage: language,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// 自定义钩子，方便在组件中使用语言上下文
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 