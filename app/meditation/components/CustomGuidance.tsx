"use client";

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2, FlaskConical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CustomGuidanceProps {
    onGuidanceCreated: (guidance: {
        id: string;
        title: string;
        description: string;
        paragraphs: string[];
        content: ReactNode;
        audioUrl?: string;
        customAudioUrl?: string;
    }) => void;
    onCustomAudioGenerated?: (customAudioUrl: string | undefined) => void;
    isDarkTheme: boolean;
    t: (zh: string, en: string) => string;
    onGenerateComplete?: () => void;
}

export function CustomGuidance({ onGuidanceCreated, onCustomAudioGenerated, isDarkTheme, t, onGenerateComplete }: CustomGuidanceProps) {
    const [userInput, setUserInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isTestMode, setIsTestMode] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);

    const MAX_CHARS = 300;

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        if (input.length <= MAX_CHARS) {
            setUserInput(input);
        }
    };

    const generateGuidance = async () => {
        if (!userInput.trim() && !isTestMode) {
            toast({
                title: t("请输入内容", "Please enter content"),
                description: t("请输入你想要生成引导语的内容", "Please enter the content to generate guidance from"),
                variant: "destructive",
            });
            return;
        }

        if (userInput.length > MAX_CHARS && !isTestMode) {
            toast({
                title: t("内容过长", "Content too long"),
                description: t(
                    `内容不能超过${MAX_CHARS}字`,
                    `Content cannot exceed ${MAX_CHARS} characters`
                ),
                variant: "destructive",
            });
            return;
        }

        // 如果提供了onGenerateComplete回调，立即调用它，不等待 API 响应
        if (onGenerateComplete) {
            console.log("[引导语生成] 立即调用完成回调");
            onGenerateComplete();
        }

        setIsGenerating(true);
        setGenerateError(null);

        try {
            let deepseekResponse;

            // 测试模式：使用预设的引导语内容，无需调用API
            if (isTestMode) {
                console.log("[引导语生成] 测试模式：使用预设引导语内容");
                // 预设的引导语内容
                const testParagraphs = [
                    "欢迎来到这段平静的时光............",
                    "让我们暂时放下所有的烦恼...给自己一个喘息的机会...在这里...你可以完全放松下来...不必担心任何事...",
                    "深吸一口气...感受空气...缓缓流入你的身体...然后轻轻地呼出...让紧张随着呼吸...慢慢离开...",
                    "每一次呼吸...都是新的开始...让自己沉浸在当下...感受此刻的平静...",
                    "享受这段宁静的时光...让内心的平和...伴随你回到日常生活..."
                ];

                deepseekResponse = { paragraphs: testParagraphs };
            } else {
                // 正常模式：调用API生成引导语
                console.log("[引导语生成] 开始调用 API");
                const response = await generateTextFromDeepSeek(userInput);

                if (!response || !response.paragraphs || response.paragraphs.length === 0) {
                    throw new Error(t(
                        "服务器生成失败，请稍后重试",
                        "Server generation failed, please try again later"
                    ));
                }

                deepseekResponse = response;
            }

            console.log("[引导语生成] 成功获取引导语内容，段落数:", deepseekResponse.paragraphs.length);

            let audioUrl = undefined;
            let audioError = false;
            let audioErrorMessage = "";

            // 尝试调用豆包 TTS API 生成音频
            try {
                if (isTestMode) {
                    // 测试模式使用预设的音频URL
                    console.log("[引导语生成] 测试模式：使用预设音频URL");
                    audioUrl = "https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/bodyscan.mp3";
                } else {
                    // 正常模式调用API生成音频
                    console.log("[引导语生成] 开始调用豆包 TTS API");
                    audioUrl = await generateAudioFromText(deepseekResponse.paragraphs.join('\n\n'), isTestMode);
                }
                console.log("[引导语生成] 获取到音频URL:", audioUrl);
            } catch (e) {
                const error = e as Error;
                console.error("[引导语生成] 豆包 TTS API 调用失败:", error);
                audioError = true;
                audioErrorMessage = error.message || "Unknown error";
            }

            // 回调 - 添加非空检查
            if (onCustomAudioGenerated) {
                console.log("[引导语生成] 调用onCustomAudioGenerated，传递音频URL:", audioUrl);
                onCustomAudioGenerated(audioUrl);
            } else {
                console.log("[引导语生成] onCustomAudioGenerated未定义，跳过回调");
            }

            // 重置输入和错误状态
            setUserInput('');
            setGenerateError(null);

            if (audioError) {
                toast({
                    title: t("音频生成失败", "Audio generation failed"),
                    description: t(
                        `音频生成失败: ${audioErrorMessage}`,
                        `Audio generation failed: ${audioErrorMessage}`
                    ),
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t("音频生成成功", "Audio generated successfully"),
                    description: t("自定义音频已准备好，可以开始播放", "Custom audio is ready to play"),
                });
            }
        } catch (e) {
            const error = e as Error;
            console.error("[引导语生成] 错误:", error);

            // 设置错误状态
            setGenerateError(error.message || t("未知错误，请稍后重试", "Unknown error, please try again later"));
        } finally {
            setIsGenerating(false);
        }
    };

    // 调用 DeepSeek API 生成文本
    const generateTextFromDeepSeek = async (input: string) => {
        const response = await fetch('/api/generate-guidance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        return await response.json();
    };

    // 调用豆包 TTS API 生成音频
    const generateAudioFromText = async (text: string, isTest: boolean = false) => {
        const response = await fetch('/api/generate-audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, isTest }),
        });

        if (!response.ok) {
            // 特别处理 401 错误
            if (response.status === 401) {
                throw new Error("豆包API授权失败 (401): 可能是访问令牌已过期，请联系管理员");
            }

            // 尝试获取详细错误信息
            let errorMessage = `API request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
                if (errorData.details) {
                    errorMessage += `: ${JSON.stringify(errorData.details)}`;
                }
            } catch (e) {
                // 如果无法解析JSON，使用原始错误消息
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data.audioUrl;
    };

    // 添加测试引导语生成函数
    const generateTestGuidance = async () => {
        console.log("[引导语生成] 开始生成测试引导语");
        setIsGenerating(true);
        setGenerateError(null);

        try {
            // 如果提供了onGenerateComplete回调，立即调用它
            if (onGenerateComplete) {
                console.log("[引导语生成] 调用完成回调");
                onGenerateComplete();
            }

            // 预设的测试引导语内容
            const testParagraphs = [
                "让我们开始这段宁静的冥想之旅...",
                "深深地吸一口气，感受空气流入你的身体...",
                "慢慢地呼出，释放所有的紧张和压力...",
                "让我们一起进入平静的状态，享受当下的时刻...",
                "保持这种平和的呼吸，让心灵沉浸在宁静中..."
            ];

            // 定义测试用的自定义音频URL
            const testCustomAudioUrl = 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/meditation.mp3';

            // 调用新的回调函数传递自定义音频URL
            if (onCustomAudioGenerated) {
                console.log("[引导语生成] 测试模式：调用onCustomAudioGenerated，传递音频URL:", testCustomAudioUrl);
                onCustomAudioGenerated(testCustomAudioUrl);
            } else {
                console.log("[引导语生成] onCustomAudioGenerated未定义，跳过回调");
            }

            // 重置输入和错误状态
            setUserInput('');
            setGenerateError(null);

            // 显示成功提示
            toast({
                title: t("测试音频已准备", "Test audio is ready"),
                description: t("可以开始播放测试音频", "You can start playing the test audio"),
            });
        } catch (e) {
            const error = e as Error;
            console.error("[引导语生成] 错误:", error);
            setGenerateError(error.message || t("未知错误，请稍后重试", "Unknown error, please try again later"));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={`p-4 rounded-lg border ${isDarkTheme ? 'bg-indigo-950/30 border-indigo-800' : 'bg-blue-50 border-blue-200'}`}>
            <div className="space-y-4">
                {/* 测试模式开关 */}
                {/* <div className="flex items-center justify-end space-x-2">
                    <Switch
                        id="test-mode"
                        checked={isTestMode}
                        onCheckedChange={setIsTestMode}
                    />
                    <Label htmlFor="test-mode" className={isDarkTheme ? 'text-indigo-300' : 'text-blue-600'}>
                        {t("测试模式", "Test Mode")}
                    </Label>
                </div> */}

                {/* 测试模式说明 */}
                {isTestMode && (
                    <div className={`p-2 text-xs rounded-md ${isDarkTheme ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-800/50' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                        {t("测试模式已开启：将使用预设内容，无需调用API。可直接点击生成按钮测试流程。",
                            "Test mode enabled: Predefined content will be used without API calls. Click generate to test the workflow.")}
                    </div>
                )}

                {/* 输入区域 */}
                <div className="space-y-1">
                    <Textarea
                        value={userInput}
                        onChange={handleInputChange}
                        placeholder={t(
                            "请描述你当前的困扰或感受，AI将为你生成个性化的引导语（不超过300字）...",
                            "Describe your current concerns or feelings, and AI will generate personalized guidance (max 800 characters)..."
                        )}
                        className={`min-h-[120px] ${isDarkTheme ? 'bg-indigo-950/50 border-indigo-700 text-white placeholder:text-indigo-400' : 'bg-white border-blue-200 text-slate-800 placeholder:text-blue-400'}`}
                    />
                    <div className={`text-xs text-right ${userInput.length >= MAX_CHARS
                        ? 'text-red-500 font-medium'
                        : isDarkTheme
                            ? 'text-indigo-400'
                            : 'text-blue-600'
                        }`}>
                        {userInput.length}/{MAX_CHARS} {t("字", "characters")}
                        {userInput.length >= MAX_CHARS && (
                            <span className="ml-2">
                                {t("已达到字数限制", "Character limit reached")}
                            </span>
                        )}
                    </div>
                </div>

                {/* 错误提示 */}
                {generateError && (
                    <div className={`p-3 rounded-md ${isDarkTheme ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                        <p className={`text-sm font-medium ${isDarkTheme ? 'text-red-400' : 'text-red-600'}`}>
                            ⚠️ {t("生成失败", "Generation Failed")}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkTheme ? 'text-red-300' : 'text-red-500'}`}>
                            {generateError}
                        </p>
                    </div>
                )}

                {/* 按钮区域 */}
                <div className="flex justify-end space-x-2">
                    {/* 测试按钮 */}
                    <Button
                        onClick={generateTestGuidance}
                        disabled={isGenerating}
                        className={`${isDarkTheme
                            ? 'bg-orange-600 hover:bg-orange-500 text-white disabled:bg-orange-900/50'
                            : 'bg-orange-600 hover:bg-orange-500 text-white disabled:bg-orange-300'
                            } transition-colors`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("生成中...", "Generating...")}
                            </>
                        ) : (
                            <>
                                <FlaskConical className="mr-2 h-4 w-4" />
                                {t("测试效果", "Test Effect")}
                            </>
                        )}
                    </Button>

                    {/* 生成按钮 */}
                    <Button
                        onClick={generateGuidance}
                        disabled={isGenerating || (!isTestMode && (userInput.length === 0 || userInput.length > MAX_CHARS))}
                        className={`${isDarkTheme
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-indigo-900/50'
                            : 'bg-blue-600 hover:bg-blue-500 text-white disabled:bg-blue-300'
                            } transition-colors`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("生成中...", "Generating...")}
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                {t("生成引导语", "Generate Guidance")}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
} 