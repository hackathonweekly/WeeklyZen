"use client";

import { useState, ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2, FlaskConical, History, Clock, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface GuidanceHistoryItem {
    id: string;
    timestamp: number;
    prompt: string;
    audioUrl: string;
}

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
    const [guidanceHistory, setGuidanceHistory] = useState<GuidanceHistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    const MAX_CHARS = 300;
    const MAX_HISTORY = 10;

    // 加载历史记录
    useEffect(() => {
        const loadHistory = () => {
            try {
                const savedHistory = localStorage.getItem('guidanceHistory');
                if (savedHistory) {
                    setGuidanceHistory(JSON.parse(savedHistory));
                }
            } catch (e) {
                console.error('Failed to load guidance history:', e);
                // 如果加载失败，初始化为空数组
                setGuidanceHistory([]);
            }
        };

        loadHistory();
    }, []);

    // 保存历史记录
    const saveToHistory = (prompt: string, audioUrl: string) => {
        try {
            const newItem: GuidanceHistoryItem = {
                id: uuidv4(),
                timestamp: Date.now(),
                prompt,
                audioUrl
            };

            // 创建新历史数组
            const updatedHistory = [newItem, ...guidanceHistory].slice(0, MAX_HISTORY);

            // 更新状态
            setGuidanceHistory(updatedHistory);

            // 保存到localStorage
            localStorage.setItem('guidanceHistory', JSON.stringify(updatedHistory));

            console.log('[历史记录] 已保存新引导语到历史记录');
        } catch (e) {
            console.error('Failed to save to guidance history:', e);
            // 错误处理 - 可以显示toast或简单忽略
        }
    };

    // 格式化时间
    const formatTimestamp = (timestamp: number): string => {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // 处理历史记录选择
    const handleHistorySelect = (item: GuidanceHistoryItem) => {
        if (onCustomAudioGenerated) {
            console.log('[历史记录] 选择历史音频:', item.audioUrl);
            onCustomAudioGenerated(item.audioUrl);

            toast(t("已选择历史音频", "Historical audio selected"), {
                description: t("历史音频已准备好播放", "Historical audio is ready to play")
            });

            // 关闭对话框
            if (onGenerateComplete) {
                console.log("[历史记录] 调用完成回调，关闭对话框");
                onGenerateComplete();
            }

            // 设置用户输入为历史记录中的内容
            setUserInput(item.prompt);

            // 关闭历史记录面板
            setShowHistory(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        if (input.length <= MAX_CHARS) {
            setUserInput(input);
        }
    };

    const generateGuidance = async () => {
        if (!userInput.trim() && !isTestMode) {
            toast.error(t("请输入内容", "Please enter content"), {
                description: t("请输入你想要生成引导语的内容", "Please enter the content to generate guidance from")
            });
            return;
        }

        if (userInput.length > MAX_CHARS && !isTestMode) {
            toast.error(t("内容过长", "Content too long"), {
                description: t(
                    `内容不能超过${MAX_CHARS}字`,
                    `Content cannot exceed ${MAX_CHARS} characters`
                )
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
                try {
                    const response = await generateTextFromDeepSeek(userInput);

                    if (!response || !response.paragraphs || response.paragraphs.length === 0) {
                        throw new Error(t(
                            "服务器生成失败，请稍后重试",
                            "Server generation failed, please try again later"
                        ));
                    }

                    deepseekResponse = response;
                } catch (error) {
                    // 将错误直接传播到外部try-catch块
                    console.error("[引导语生成] API调用失败:", error);
                    throw error;
                }
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
                    audioUrl = "https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/start.mp3";
                } else {
                    // 正常模式调用API生成音频
                    console.log("[引导语生成] 开始调用豆包 TTS API");
                    audioUrl = await generateAudioFromText(deepseekResponse.paragraphs.join('\n\n'), isTestMode);
                }
                console.log("[引导语生成] 获取到音频URL:", audioUrl);

                // 如果成功生成了音频URL，保存到历史记录
                if (audioUrl) {
                    saveToHistory(userInput, audioUrl);
                }
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
                toast.error(t("音频生成失败", "Audio generation failed"), {
                    description: t(
                        `音频生成失败: ${audioErrorMessage}`,
                        `Audio generation failed: ${audioErrorMessage}`
                    )
                });
            } else {
                toast.success(t("自定义音频生成成功", "Audio generated successfully"), {
                    description: t("若无正常播放，请在历史记录中手动点击播放", "Custom audio is ready to play")
                });
            }
        } catch (e) {
            const error = e as Error;
            console.error("[引导语生成] 错误:", error);

            // 设置错误状态
            setGenerateError(error.message || t("未知错误，请稍后重试", "Unknown error, please try again later"));

            // 显示错误提示Toast
            toast.error(t("生成引导语失败", "Failed to generate guidance"), {
                description: error.message || t("网络连接错误，请稍后重试", "Network connection error, please try again later")
            });

            // 确保在生成失败时仍然会有值传递给 onCustomAudioGenerated
            // 这样 UI 状态会更新，避免界面卡在加载状态
            if (onCustomAudioGenerated) {
                onCustomAudioGenerated(undefined);
                console.log("[引导语生成] 发生错误，调用 onCustomAudioGenerated 并传递 undefined");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    // 调用 DeepSeek API 生成文本
    const generateTextFromDeepSeek = async (input: string) => {
        try {
            const response = await fetch('/api/generate-guidance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || `API请求失败，状态码: ${response.status}`;
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('[引导语生成] API调用错误:', error);
            // 确保所有错误都被转换为Error对象并传播
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error('网络连接错误，请检查网络并重试');
            }
        }
    };

    // 调用豆包 TTS API 生成音频
    const generateAudioFromText = async (text: string, isTest: boolean = false) => {
        try {
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
        } catch (error) {
            console.error('[引导语生成] 生成音频API调用错误:', error);
            // 确保所有错误都被转换为Error对象并传播
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error('网络连接错误，请检查网络并重试');
            }
        }
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
            const testCustomAudioUrl = 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/ai-sounds/start.mp3';

            // 保存测试音频到历史记录
            saveToHistory("测试引导语 - " + new Date().toLocaleString(), testCustomAudioUrl);

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
            toast.success(t("测试音频已准备", "Test audio is ready"), {
                description: t("可以开始播放测试音频", "You can start playing the test audio")
            });
        } catch (e) {
            const error = e as Error;
            console.error("[引导语生成] 错误:", error);
            // 设置错误状态
            setGenerateError(error.message || t("未知错误，请稍后重试", "Unknown error, please try again later"));

            // 显示错误提示Toast
            toast.error(t("测试引导语生成失败", "Test guidance generation failed"), {
                description: error.message || t("未知错误，请稍后重试", "Unknown error, please try again later")
            });

            // 确保在生成失败时仍然会有值传递给 onCustomAudioGenerated
            if (onCustomAudioGenerated) {
                onCustomAudioGenerated(undefined);
                console.log("[引导语生成] 测试模式发生错误，调用 onCustomAudioGenerated 并传递 undefined");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={`p-4 rounded-lg border ${isDarkTheme ? 'bg-indigo-950/30 border-indigo-800' : 'bg-blue-50 border-blue-200'} space-y-4`}>
            {/* 输入区域 */}
            <div className="space-y-4">
                {/* 测试模式开关 - 注释掉的代码保留 */}
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
                    {/* 历史记录按钮 */}
                    <Button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`${isDarkTheme
                            ? 'bg-indigo-700/30 hover:bg-indigo-700/50 text-indigo-300 border border-indigo-700/70'
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300'
                            } transition-colors`}
                    >
                        <History className="mr-2 h-4 w-4" />
                        {showHistory
                            ? t("隐藏历史", "Hide History")
                            : t("历史记录", "History")}
                        {showHistory ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                    </Button>

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

            {/* 历史记录区域 */}
            {
                showHistory && (
                    <div className={`mt-4 rounded-lg border ${isDarkTheme
                        ? 'border-indigo-800 bg-indigo-900/30'
                        : 'border-blue-200 bg-blue-50'}`}>
                        <div className={`p-3 border-b ${isDarkTheme
                            ? 'border-indigo-800 bg-indigo-800/50 text-indigo-200'
                            : 'border-blue-200 bg-blue-100 text-blue-700'} flex items-center`}>
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="font-medium">
                                {t("历史引导语", "History Guidance")}
                            </span>
                            <span className="text-xs ml-2 opacity-70">
                                ({guidanceHistory.length}/10)
                            </span>
                        </div>

                        {guidanceHistory.length === 0 ? (
                            <div className={`p-6 text-center ${isDarkTheme
                                ? 'text-indigo-400'
                                : 'text-blue-500'}`}>
                                {t("暂无历史记录", "No history records yet")}
                            </div>
                        ) : (
                            <div className="max-h-[300px] overflow-y-auto">
                                {guidanceHistory.map((item, index) => (
                                    <div key={item.id} className={`p-3 flex flex-col ${index !== guidanceHistory.length - 1
                                        ? isDarkTheme
                                            ? 'border-b border-indigo-800/50'
                                            : 'border-b border-blue-200'
                                        : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs ${isDarkTheme
                                                ? 'text-indigo-400'
                                                : 'text-blue-600'}`}>
                                                {formatTimestamp(item.timestamp)}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleHistorySelect(item)}
                                                className={`h-7 px-2 ${isDarkTheme
                                                    ? 'hover:bg-indigo-800/70 text-indigo-300'
                                                    : 'hover:bg-blue-100 text-blue-600'}`}
                                            >
                                                <Play className="h-3 w-3 mr-1" />
                                                {t("播放", "Play")}
                                            </Button>
                                        </div>
                                        <p className={`text-sm line-clamp-2 ${isDarkTheme
                                            ? 'text-indigo-200'
                                            : 'text-blue-800'}`}>
                                            {item.prompt.length > 30
                                                ? item.prompt.substring(0, 30) + '...'
                                                : item.prompt}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }
        </div>
    );
} 