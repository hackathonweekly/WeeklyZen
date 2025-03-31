"use client";

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, FlaskConical } from 'lucide-react';
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
    }) => void;
    isDarkTheme: boolean;
    t: (zh: string, en: string) => string;
}

export function CustomGuidance({ onGuidanceCreated, isDarkTheme, t }: CustomGuidanceProps) {
    const [userInput, setUserInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isTestMode, setIsTestMode] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);

    const MAX_CHARS = 800;

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

        if (userInput.length > MAX_CHARS) {
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
                console.log("[引导语生成] 开始调用豆包 TTS API" + (isTestMode ? " (测试模式)" : ""));
                audioUrl = await generateAudioFromText(deepseekResponse.paragraphs.join('\n\n'), isTestMode);
                console.log("[引导语生成] 豆包 TTS API 调用成功，获取到音频URL");
            } catch (e) {
                const error = e as Error;
                console.error("[引导语生成] 豆包 TTS API 调用失败:", error);
                audioError = true;
                audioErrorMessage = error.message || "Unknown error";
            }

            // 创建引导语对象并回调
            const newGuidance = {
                id: uuidv4(),
                title: t("自定义引导语", "Custom Guidance"),
                description: isTestMode
                    ? "测试模式生成的引导语"
                    : userInput.substring(0, 100) + (userInput.length > 100 ? '...' : ''),
                paragraphs: deepseekResponse.paragraphs,
                content: (
                    <div>
                        {deepseekResponse.paragraphs.map((paragraph: string, index: number) => (
                            <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                    </div>
                ),
                audioUrl: audioUrl
            };

            console.log("[引导语生成] 创建完成，准备添加到列表");
            onGuidanceCreated(newGuidance);

            // 重置输入和错误状态
            setUserInput('');
            setGenerateError(null);

            if (audioError) {
                toast({
                    title: t("引导语创建成功，但无音频", "Guidance created without audio"),
                    description: t(
                        `引导语创建成功，但音频生成失败: ${audioErrorMessage}`,
                        `Your guidance was created but without audio: ${audioErrorMessage}`
                    ),
                    variant: "default",
                });
            } else {
                toast({
                    title: t("引导语创建成功", "Guidance created successfully"),
                    description: t("你的自定义引导语已成功创建", "Your custom guidance has been created"),
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

                {/* 输入区域 */}
                <div className="space-y-1">
                    <Textarea
                        value={userInput}
                        onChange={handleInputChange}
                        placeholder={t(
                            "请描述你当前的困扰或感受，AI将为你生成个性化的引导语（建议300-800字）...",
                            "Describe your current concerns or feelings, and AI will generate personalized guidance (suggested 300-800 characters)..."
                        )}
                        className={`min-h-[120px] ${isDarkTheme ? 'bg-indigo-950/50 border-indigo-700 text-white placeholder:text-indigo-400' : 'bg-white border-blue-200 text-slate-800 placeholder:text-blue-400'}`}
                    />
                    <div className={`text-xs text-right ${userInput.length >= MAX_CHARS
                            ? 'text-red-500 font-medium'
                            : userInput.length < 50
                                ? isDarkTheme ? 'text-amber-400' : 'text-amber-600'
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
                        {userInput.length > 0 && userInput.length < 50 && (
                            <span className="ml-2">
                                {t("内容过短，建议详细描述您的情况", "Content too short, please provide more details")}
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

                {/* 生成按钮 */}
                <div className="flex justify-end">
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