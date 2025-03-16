import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAppTheme } from "@/contexts/theme-context";

interface BackButtonProps {
  onClick?: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  const router = useRouter();
  const { isDarkTheme } = useAppTheme();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/');
    }
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
      onClick={handleClick}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
} 