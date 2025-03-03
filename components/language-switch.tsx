"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="relative overflow-hidden rounded-full border border-gray-200 dark:border-gray-800 px-3 py-1"
    >
      <motion.div
        initial={false}
        animate={{ x: language === 'zh' ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute inset-0 w-1/2 h-full bg-gray-100 dark:bg-gray-800 rounded-full"
        style={{ 
          originX: language === 'zh' ? 0 : 1, 
          zIndex: -1 
        }}
      />
      <div className="flex items-center justify-between gap-2 text-sm font-medium">
        <span className={`${language === 'zh' ? 'text-primary' : 'text-muted-foreground'}`}>
          中文
        </span>
        <span className={`${language === 'en' ? 'text-primary' : 'text-muted-foreground'}`}>
          EN
        </span>
      </div>
    </Button>
  );
} 