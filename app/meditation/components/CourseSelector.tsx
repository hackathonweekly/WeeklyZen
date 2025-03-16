"use client";

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, BookOpen, Play, Clock } from 'lucide-react';
import type { CourseData } from '@/app/courses';

interface CourseSelectorProps {
  courses: CourseData[];
  selectedCourse: CourseData | null;
  onCourseSelect: (course: CourseData | null) => void;
  isDarkTheme: boolean;
  t: (zh: string, en: string) => string;
}

export function CourseSelector({
  courses,
  selectedCourse,
  onCourseSelect,
  isDarkTheme,
  t
}: CourseSelectorProps) {
  return (
    <div className="w-full space-y-4" style={{ maxWidth: '100%' }}>
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h3 className={`text-lg font-medium ${isDarkTheme ? 'text-indigo-200' : 'text-blue-800'}`}>
          {t("冥想课程", "Meditation Courses")}
        </h3>
        
        <div className={`text-xs ${isDarkTheme ? 'text-indigo-300' : 'text-blue-600'}`}>
          {t("来源：潮汐APP", "Source: Tide APP")}
        </div>
      </div>
      
      {/* 课程列表 */}
      <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {/* 入门课程部分 */}
        <div className="mb-3">
          <div className={`text-xs uppercase font-semibold mb-2 ${isDarkTheme ? 'text-indigo-400' : 'text-blue-600'}`}>
            {t("7天冥想入门", "7-Day Meditation Course")}
          </div>
          <div className="space-y-2">
            {courses
              .filter(course => course.id.includes('day'))
              .map((course) => (
                <Button
                  key={course.id}
                  variant="outline"
                  className={`flex flex-row justify-between items-start w-full p-3 h-auto text-left ${
                    selectedCourse?.id === course.id 
                      ? (isDarkTheme ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                      : (isDarkTheme ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                  }`}
                  style={{ minHeight: '80px' }}
                  onClick={() => onCourseSelect(course)}
                >
                  <div className="flex-1 mr-1 overflow-hidden">
                    <div className="font-medium text-sm">{course.name}</div>
                    <div className="text-xs opacity-70 mt-1 line-clamp-2">{course.description}</div>
                    
                    <div className="flex items-center mt-2 text-xs">
                      <Clock size={14} className="mr-1 flex-shrink-0" />
                      <span>{course.duration} {t("分钟", "min")}</span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col justify-center h-full ml-1">
                    <Play size={16} className={`mb-1 ${isDarkTheme ? 'text-indigo-300' : 'text-blue-500'}`} />
                    <ChevronRight size={16} className="flex-shrink-0" />
                  </div>
                </Button>
              ))}
          </div>
        </div>
        
        {/* 专题练习部分 */}
        <div>
          <div className={`text-xs uppercase font-semibold mb-2 ${isDarkTheme ? 'text-indigo-400' : 'text-blue-600'}`}>
            {t("专题练习", "Special Practices")}
          </div>
          <div className="space-y-2">
            {courses
              .filter(course => !course.id.includes('day'))
              .map((course) => (
                <Button
                  key={course.id}
                  variant="outline"
                  className={`flex flex-row justify-between items-start w-full p-3 h-auto text-left ${
                    selectedCourse?.id === course.id 
                      ? (isDarkTheme ? 'bg-indigo-800/30 border-indigo-600' : 'bg-blue-100 border-blue-400') 
                      : (isDarkTheme ? 'border-indigo-800/30 hover:bg-indigo-900/50' : 'border-blue-200 hover:bg-blue-50')
                  }`}
                  style={{ minHeight: '80px' }}
                  onClick={() => onCourseSelect(course)}
                >
                  <div className="flex-1 mr-1 overflow-hidden">
                    <div className="font-medium text-sm">{course.name}</div>
                    <div className="text-xs opacity-70 mt-1 line-clamp-2">{course.description}</div>
                    
                    <div className="flex items-center mt-2 text-xs">
                      <Clock size={14} className="mr-1 flex-shrink-0" />
                      <span>{course.duration} {t("分钟", "min")}</span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col justify-center h-full ml-1">
                    <Play size={16} className={`mb-1 ${isDarkTheme ? 'text-indigo-300' : 'text-blue-500'}`} />
                    <ChevronRight size={16} className="flex-shrink-0" />
                  </div>
                </Button>
              ))}
          </div>
        </div>
      </div>
      
      {/* 取消选择按钮 */}
      {selectedCourse && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCourseSelect(null)}
          className={`text-xs w-full ${isDarkTheme ? 'text-indigo-300 hover:text-indigo-200' : 'text-blue-600 hover:text-blue-700'}`}
        >
          {t("取消选择", "Clear Selection")}
        </Button>
      )}
      
      {/* 版权声明 */}
      <div className={`text-xs text-center mt-4 ${isDarkTheme ? 'text-indigo-300/70' : 'text-blue-600/70'}`}>
        {t("音频内容版权归潮汐APP所有，仅供学习使用", "Audio content copyright belongs to Tide APP, for learning purposes only")}
      </div>
    </div>
  );
} 