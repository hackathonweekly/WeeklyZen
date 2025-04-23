import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';

interface MeditationEncouragementProps {
    isDarkTheme: boolean;
    showEncouragement: boolean;
    selectedDuration: number;
    onClose: () => void;
    t: (zh: string, en: string) => string;
}

export function MeditationEncouragement({
    isDarkTheme,
    showEncouragement,
    selectedDuration,
    onClose,
    t
}: MeditationEncouragementProps) {
    const [encouragementText, setEncouragementText] = useState('');

    useEffect(() => {
        if (showEncouragement) {
            const encouragements = [
                {
                    zh: "太棒了！你刚刚完成了一次冥想练习。每一次练习都是对内心的一次温柔关照。",
                    en: "Amazing! You've just completed a meditation session. Each practice is a gentle care for your inner self."
                },
                {
                    zh: "恭喜你完成今天的冥想！记住，正念不在于追求完美，而在于保持觉知和温和。",
                    en: "Congratulations on completing today's meditation! Remember, mindfulness isn't about perfection, but awareness and gentleness."
                },
                {
                    zh: "你做得很好！每一次静心冥想，都是给自己最好的礼物。",
                    en: "Well done! Every moment of mindful meditation is the best gift you can give yourself."
                },
                {
                    zh: "真棒！通过冥想，你正在培养内心的平静与力量。继续保持！",
                    en: "Awesome! Through meditation, you're cultivating inner peace and strength. Keep going!"
                },
                {
                    zh: "完美！记住，冥想就像种下一颗种子，需要时间和耐心来培育。",
                    en: "Perfect! Remember, meditation is like planting a seed - it needs time and patience to grow."
                }
            ];

            const randomIndex = Math.floor(Math.random() * encouragements.length);
            const selectedEncouragement = encouragements[randomIndex];
            setEncouragementText(t(selectedEncouragement.zh, selectedEncouragement.en));
        }
    }, [showEncouragement, t]);

    return (
        <Dialog open={showEncouragement} onOpenChange={onClose}>
            <DialogContent className={`sm:max-w-md ${isDarkTheme
                ? 'bg-gradient-to-br from-indigo-950 to-slate-900 text-white border border-indigo-700/50 shadow-lg shadow-indigo-900/30'
                : 'bg-gradient-to-br from-blue-50 to-white text-slate-800 border border-blue-200 shadow-lg shadow-blue-100/80'}`}>
                <DialogHeader className="space-y-2">
                    <DialogTitle className="flex items-center justify-center text-xl gap-2">
                        <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                        </div>
                        <span className={isDarkTheme ? 'text-indigo-200' : 'text-blue-600'}>
                            {t("恭喜完成冥想！", "Meditation Complete!")}
                        </span>
                    </DialogTitle>
                    <DialogDescription className={`text-center ${isDarkTheme ? 'text-indigo-300' : 'text-blue-600'} font-medium`}>
                        {t(
                            `你已经完成了 ${selectedDuration} 分钟的冥想练习`,
                            `You've completed ${selectedDuration} minutes of meditation`
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className={`my-6 p-4 rounded-lg text-center ${isDarkTheme
                    ? 'bg-indigo-900/30 text-indigo-100 border border-indigo-800/50'
                    : 'bg-blue-50 text-blue-800 border border-blue-100'}`}>
                    {encouragementText}
                </div>

                <DialogFooter className="mt-6">
                    <Button
                        onClick={onClose}
                        className={`w-full rounded-full py-6 ${isDarkTheme
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'}`}
                    >
                        {t("继续前进", "Continue")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}