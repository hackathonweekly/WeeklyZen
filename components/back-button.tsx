import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppTheme } from "@/contexts/theme-context";

export function BackButton() {
  const router = useRouter();
  const { isDarkTheme } = useAppTheme();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`w-10 h-10 rounded-full 
      ${isDarkTheme 
        ? 'bg-indigo-900/40 text-indigo-200 hover:bg-indigo-800/50 active:bg-indigo-700/60' 
        : 'bg-blue-100/80 text-blue-700 hover:bg-blue-200/90 active:bg-blue-300/80'}
      transition-colors duration-200`}
      onClick={handleBack}
    >
      <ChevronRight className="w-5 h-5" />
    </Button>
  );
} 