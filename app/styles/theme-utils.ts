// 主题工具函数和常量
// 这个文件提供了统一的主题样式函数和常量，用于在不同页面之间共享主题样式

import { useAppTheme } from '@/contexts/theme-context';

// 获取基于主题的按钮样式
export const getThemeButtonStyle = (isDarkTheme: boolean, isActive: boolean = false) => {
  if (isActive) {
    return isDarkTheme 
      ? 'bg-indigo-800/30 border-indigo-600 text-indigo-200' 
      : 'bg-blue-100 border-blue-400 text-blue-700';
  }
  return isDarkTheme 
    ? 'border-indigo-800/30 hover:bg-indigo-900/50 text-indigo-300' 
    : 'border-blue-200 hover:bg-blue-50 text-blue-600';
};

// 获取基于主题的卡片样式
export const getThemeCardStyle = (isDarkTheme: boolean, isActive: boolean = false) => {
  if (isActive) {
    return isDarkTheme 
      ? 'bg-indigo-950/70 border-indigo-700/50' 
      : 'bg-blue-50 border-blue-300/50';
  }
  return isDarkTheme 
    ? 'bg-slate-900/80 border-slate-800/50 hover:bg-slate-900/90' 
    : 'bg-white/90 border-slate-200/70 hover:bg-white';
};

// 获取基于主题的输入框样式
export const getThemeInputStyle = (isDarkTheme: boolean, disabled: boolean = false) => {
  const baseStyle = isDarkTheme 
    ? 'bg-slate-900/70 border-slate-700/50 text-slate-200 focus:border-indigo-500/50 focus:ring-indigo-500/20' 
    : 'bg-white/80 border-slate-300/70 text-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20';
  
  if (disabled) {
    return isDarkTheme 
      ? `${baseStyle} opacity-50 cursor-not-allowed` 
      : `${baseStyle} opacity-50 cursor-not-allowed`;
  }
  
  return baseStyle;
};

// 获取基于主题的对话框样式
export const getThemeDialogStyle = (isDarkTheme: boolean) => {
  return isDarkTheme 
    ? 'bg-slate-900 border-slate-800 text-slate-200' 
    : 'bg-white border-slate-200 text-slate-800';
};

// 获取基于主题的圆形按钮样式
export const getThemeRoundButtonStyle = (isDarkTheme: boolean, disabled: boolean = false) => {
  const baseStyle = isDarkTheme 
    ? 'bg-indigo-950/50 border-indigo-600/30 text-indigo-300 hover:bg-indigo-900/50' 
    : 'bg-blue-50/80 border-blue-300/50 text-blue-700 hover:bg-blue-100/80';
  
  if (disabled) {
    return `${baseStyle} opacity-50 cursor-not-allowed`;
  }
  
  return baseStyle;
};

// 获取基于主题的渐变背景样式
export const getThemeGradientStyle = (isDarkTheme: boolean) => {
  return isDarkTheme 
    ? 'bg-gradient-to-b from-slate-950 via-indigo-950/90 to-slate-950' 
    : 'bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50';
};

// 自定义Hook，用于获取所有主题样式
export const useThemeStyles = () => {
  const { isDarkTheme, themeStyles } = useAppTheme();
  
  return {
    isDarkTheme,
    themeStyles,
    buttonStyle: getThemeButtonStyle(isDarkTheme),
    activeButtonStyle: getThemeButtonStyle(isDarkTheme, true),
    cardStyle: getThemeCardStyle(isDarkTheme),
    activeCardStyle: getThemeCardStyle(isDarkTheme, true),
    inputStyle: getThemeInputStyle(isDarkTheme),
    disabledInputStyle: getThemeInputStyle(isDarkTheme, true),
    dialogStyle: getThemeDialogStyle(isDarkTheme),
    roundButtonStyle: getThemeRoundButtonStyle(isDarkTheme),
    disabledRoundButtonStyle: getThemeRoundButtonStyle(isDarkTheme, true),
    gradientStyle: getThemeGradientStyle(isDarkTheme)
  };
}; 