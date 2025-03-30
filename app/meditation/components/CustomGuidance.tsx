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

    const generateGuidance = async () => {
        if (!userInput.trim() && !isTestMode) {
            toast({
                title: t("请输入内容", "Please enter content"),
                description: t("请输入你想要生成引导语的内容", "Please enter the content to generate guidance from"),
                variant: "destructive",
            });
            return;
        }



        setIsGenerating(true);

        try {
            let deepseekResponse;

            // 测试模式：使用预设的引导语内容，无需调用DeepSeek API
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
                // 正常模式：调用DeepSeek API生成引导语
                console.log("[引导语生成] 开始调用 DeepSeek API");
                deepseekResponse = await generateTextFromDeepSeek(userInput);
            }

            if (!deepseekResponse || !deepseekResponse.paragraphs || deepseekResponse.paragraphs.length === 0) {
                throw new Error("Failed to generate guidance text");
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
                // 音频生成失败，但不影响引导语创建
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

            // 重置输入
            setUserInput('');

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
            toast({
                title: t("生成失败", "Generation Failed"),
                description: t(
                    `生成引导语时出现错误: ${error.message || "未知错误"}`,
                    `An error occurred: ${error.message || "Unknown error"}`
                ),
                variant: "destructive",
            });
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
        <div className={`p-4 rounded-lg border ${isDarkTheme ? 'bg-indigo-950/30 border-indigo-800' : 'bg-blue-50 border-blue-200'
            }`}>
            {/* <h3 className={`text-lg font-medium mb-3 ${isDarkTheme ? 'text-indigo-200' : 'text-blue-800'
                }`}>
                {t("创建自定义引导语", "Create Custom Guidance")}
            </h3> */}



            <Textarea
                placeholder={isTestMode ?
                    t("测试模式：将使用预设文本", "Test mode: Will use preset text") :
                    t("输入你的想法、感受或烦恼，我们将为你生成个性化的冥想引导语...", "Enter your thoughts, feelings, or concerns, and we'll generate a personalized meditation guidance for you...")}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={4}
                className={`mb-3 ${isDarkTheme ? 'bg-indigo-900/50 border-indigo-700' : 'bg-white border-blue-300'} ${isTestMode ? 'opacity-50' : ''}`}
                disabled={isTestMode}
            />

            {/* <div className="flex items-center space-x-2 mb-4">
                <Switch
                    id="test-mode"
                    checked={isTestMode}
                    onCheckedChange={setIsTestMode}
                />
                <Label htmlFor="test-mode" className={`text-sm ${isDarkTheme ? 'text-indigo-200' : 'text-blue-800'}`}>
                    <FlaskConical className="h-4 w-4 inline-block mr-1" />
                    {t("测试模式（使用预设文本，跳过DeepSeek API调用）", "Test mode (use preset text, skip DeepSeek API call)")}
                </Label>
            </div> */}

            <Button
                onClick={generateGuidance}
                disabled={isGenerating}
                className={`w-full ${isDarkTheme ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("正在生成...", "Generating...")}
                    </>
                ) : (
                    <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        {isTestMode ?
                            t("生成测试引导语", "Generate Test Guidance") :
                            t("生成引导语", "Generate Guidance")}
                    </>
                )}
            </Button>
        </div>
    );
} 