import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Music,
    BookOpen,
    Volume2,
    VolumeX,
    Clock,
    ChevronDown,
    Menu,
    Sun,
    Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider as UISlider } from '@/components/ui/slider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MeditationHeaderProps {
    isDarkTheme: boolean;
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    showVolumeSlider: boolean;
    selectedDuration: number;
    showDurationMenu: boolean;
    durationOptions: Array<{ value: number; label: string; isTest?: boolean }>;
    buttonStyle: string;
    onBack?: () => void;
    onSoundClick: () => void;
    onGuidanceClick: () => void;
    onThemeToggle: () => void;
    onVolumeClick: () => void;
    onVolumeChange: (value: number[]) => void;
    onMuteToggle: () => void;
    onDurationSelect: (duration: number) => void;
    onDurationMenuChange: (open: boolean) => void;
    setShowVolumeSlider: (show: boolean) => void;
    t: (zh: string, en: string) => string;
}

export function MeditationHeader({
    isDarkTheme,
    isPlaying,
    isMuted,
    volume,
    showVolumeSlider,
    selectedDuration,
    showDurationMenu,
    durationOptions,
    buttonStyle,
    onBack,
    onSoundClick,
    onGuidanceClick,
    onThemeToggle,
    onVolumeClick,
    onVolumeChange,
    onMuteToggle,
    onDurationSelect,
    onDurationMenuChange,
    setShowVolumeSlider,
    t
}: MeditationHeaderProps) {
    const router = useRouter();

    return (
        <div className="p-4 flex justify-between items-center">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
                className="rounded-full"
            >
                <ArrowLeft size={20} />
            </Button>

            {/* 桌面版菜单 */}
            <div className="hidden md:flex space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onSoundClick}
                    className={`rounded-full ${buttonStyle}`}
                    disabled={isPlaying}
                >
                    <Music size={16} className="md:mr-1" />
                    <span className="hidden md:inline">{t("背景音效", "Sound")}</span>
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onGuidanceClick}
                    className={`rounded-full ${buttonStyle} ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isPlaying}
                >
                    <BookOpen size={16} className="md:mr-1" />
                    <span className="hidden md:inline">{t("引导语", "Guidance")}</span>
                </Button>

                {/* 时长选择下拉菜单 */}
                <DropdownMenu
                    open={showDurationMenu && !isPlaying}
                    onOpenChange={(open) => !isPlaying && onDurationMenuChange(open)}
                >
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`rounded-full ${buttonStyle} ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isPlaying}
                        >
                            <Clock size={16} className="md:mr-1" />
                            <span className="hidden md:inline">
                                {selectedDuration < 1
                                    ? `${Math.round(selectedDuration * 60)}${t("秒", "sec")}`
                                    : `${selectedDuration}${t("分钟", "min")}`}
                            </span>
                            <ChevronDown size={14} className="hidden md:inline ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className={isDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
                        {durationOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                className={`${option.isTest ? 'text-orange-500' : isDarkTheme ? 'text-slate-200' : 'text-slate-700'} cursor-pointer`}
                                onClick={() => onDurationSelect(option.value)}
                            >
                                {option.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* 主题切换按钮 */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onThemeToggle}
                    className={`rounded-full ${buttonStyle}`}
                >
                    {isDarkTheme ? '☀️' : '🌙'}
                </Button>
            </div>

            {/* 移动端菜单按钮 */}
            <Sheet>
                <SheetTrigger asChild className="md:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isPlaying}
                    >
                        <Menu size={20} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="top" className={`p-0 ${isDarkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
                    <div className="flex flex-col p-4 space-y-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSoundClick}
                            className={`w-full justify-start ${buttonStyle}`}
                            disabled={isPlaying}
                        >
                            <Music size={18} className="mr-2" />
                            {t("背景音效", "Sound")}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onGuidanceClick}
                            className={`w-full justify-start ${buttonStyle}`}
                            disabled={isPlaying}
                        >
                            <BookOpen size={18} className="mr-2" />
                            {t("引导语", "Guidance")}
                        </Button>

                        {/* 移动端时长选择 */}
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Clock size={18} className="mr-2" />
                                <span>{t("冥想时长", "Duration")}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {durationOptions.map((option) => (
                                    <Button
                                        key={option.value}
                                        variant="outline"
                                        size="sm"
                                        className={`${selectedDuration === option.value
                                            ? isDarkTheme
                                                ? 'bg-blue-900/50 border-blue-700'
                                                : 'bg-blue-100 border-blue-300'
                                            : ''
                                            } ${option.isTest ? 'text-orange-500' : ''}`}
                                        onClick={() => onDurationSelect(option.value)}
                                    >
                                        {option.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* 移动端主题切换 */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onThemeToggle}
                            className={`w-full justify-start ${buttonStyle}`}
                        >
                            {isDarkTheme
                                ? <span className="flex items-center"><span className="mr-2">☀️</span>{t("亮色模式", "Light Mode")}</span>
                                : <span className="flex items-center"><span className="mr-2">🌙</span>{t("暗色模式", "Dark Mode")}</span>
                            }
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* 音量控制 */}
            <div className="relative">
                <Button
                    id="volume-button"
                    variant="ghost"
                    size="icon"
                    onClick={onVolumeClick}
                    className="rounded-full"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>

                {showVolumeSlider && (
                    <div
                        id="volume-slider-container"
                        className={`absolute right-0 md:right-auto md:left-1/2 md:transform md:-translate-x-1/2 top-full mt-2 p-4 rounded-lg shadow-lg z-50 w-48 
              ${isDarkTheme
                                ? 'bg-slate-900/90 border border-slate-800'
                                : 'bg-white/90 border border-slate-200'} 
              backdrop-blur-sm transition-all duration-200`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <VolumeX size={16} className="text-slate-500" />
                            <span className={`text-xs ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                                {volume}%
                            </span>
                            <Volume2 size={16} className="text-slate-500" />
                        </div>
                        <UISlider
                            value={[volume]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={onVolumeChange}
                            className={`my-2 ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-200'}`}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMuteToggle}
                            className={`w-full mt-2 text-xs ${isDarkTheme
                                ? 'hover:bg-slate-800 text-slate-300'
                                : 'hover:bg-slate-100 text-slate-600'
                                }`}
                        >
                            {isMuted ? t("取消静音", "Unmute") : t("静音", "Mute")}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}