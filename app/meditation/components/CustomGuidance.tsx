"use client";

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

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
    const [title, setTitle] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const generateGuidance = async () => {
        if (!userInput.trim()) {
            toast({
                title: t("请输入内容", "Please enter content"),
                description: t("请输入你想要生成引导语的内容", "Please enter the content to generate guidance from"),
                variant: "destructive",
            });
            return;
        }

        if (!title.trim()) {
            toast({
                title: t("请输入标题", "Please enter a title"),
                description: t("请为你的自定义引导语添加一个标题", "Please add a title for your custom guidance"),
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);

        try {
            // 1. 调用 DeepSeek API 生成引导语文本
            const deepseekResponse = await generateTextFromDeepSeek(userInput);

            if (!deepseekResponse || !deepseekResponse.paragraphs || deepseekResponse.paragraphs.length === 0) {
                throw new Error("Failed to generate guidance text");
            }

            // 2. 调用豆包 TTS API 生成音频
            const audioUrl = await generateAudioFromText(deepseekResponse.paragraphs.join('\n\n'));

            // 3. 创建引导语对象并回调
            const newGuidance = {
                id: uuidv4(),
                title: title,
                description: userInput.substring(0, 100) + (userInput.length > 100 ? '...' : ''),
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

            onGuidanceCreated(newGuidance);

            // 重置输入
            setUserInput('');
            setTitle('');

            toast({
                title: t("引导语创建成功", "Guidance created successfully"),
                description: t("你的自定义引导语已成功创建", "Your custom guidance has been created"),
            });
        } catch (error) {
            console.error("Error generating guidance:", error);
            toast({
                title: t("生成失败", "Generation Failed"),
                description: t("生成引导语时出现错误，请稍后再试", "An error occurred while generating guidance. Please try again later."),
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
    const generateAudioFromText = async (text: string) => {
        const response = await fetch('/api/generate-audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.audioUrl;
    };

    return (
        <div className={`p-4 rounded-lg border ${isDarkTheme ? 'bg-indigo-950/30 border-indigo-800' : 'bg-blue-50 border-blue-200'
            }`}>
            <h3 className={`text-lg font-medium mb-3 ${isDarkTheme ? 'text-indigo-200' : 'text-blue-800'
                }`}>
                {t("创建自定义引导语", "Create Custom Guidance")}
            </h3>

            <Input
                placeholder={t("输入标题...", "Enter title...")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`mb-3 ${isDarkTheme ? 'bg-indigo-900/50 border-indigo-700' : 'bg-white border-blue-300'
                    }`}
            />

            <Textarea
                placeholder={t("输入你的想法、感受或烦恼，我们将为你生成个性化的冥想引导语...", "Enter your thoughts, feelings, or concerns, and we'll generate a personalized meditation guidance for you...")}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={4}
                className={`mb-3 ${isDarkTheme ? 'bg-indigo-900/50 border-indigo-700' : 'bg-white border-blue-300'
                    }`}
            />

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
                        {t("生成引导语", "Generate Guidance")}
                    </>
                )}
            </Button>
        </div>
    );
} 