import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        // 解析请求参数
        const { text, isTest } = await request.json();

        // 测试模式：直接使用预设文本进行测试，不依赖DeepSeek API
        const testText = "欢迎来到这段平静的时光............让我们暂时放下所有的烦恼...给自己一个喘息的机会...在这里...你可以完全放松下来...不必担心任何事...";
        const finalText = isTest ? testText : text;

        if (!finalText || typeof finalText !== 'string') {
            return NextResponse.json(
                { error: 'Invalid input. Expected a text string.' },
                { status: 400 }
            );
        }

        // 输出测试信息
        if (isTest) {
            console.log('[豆包TTS API 测试模式] 使用预设文本:', testText.substring(0, 50) + '...');
        }

        // 从环境变量获取豆包TTS API配置
        const apiUrl = process.env.DOUBAO_API_URL || 'https://openspeech.bytedance.com/api/v1/tts';
        const appid = process.env.DOUBAO_APPID;
        const access_token = process.env.DOUBAO_ACCESS_TOKEN;
        const uid = process.env.DOUBAO_UID;
        const cluster = process.env.DOUBAO_CLUSTER || 'volcano_tts';

        if (!appid || !access_token || !uid) {
            console.error('[豆包TTS API] 缺少API凭证配置');
            return NextResponse.json(
                { error: 'Doubao TTS API credentials not configured' },
                { status: 500 }
            );
        }

        console.log('[豆包TTS API] 开始生成音频，文本长度:', finalText.length);

        // 准备请求体
        const requestBody = {
            app: { appid, token: access_token, cluster },
            user: { uid },
            audio: {
                voice_type: "zh_female_xinlingjitang_moon_bigtts",
                encoding: "mp3",
                language: "zh",
                speed_ratio: 0.74,
                volume_ratio: 0.9,
                pitch_ratio: 0.68,
            },
            request: {
                reqid: uuidv4(),
                text: finalText,
                text_type: "plain",
                operation: "query",
                with_frontend: 1,
                frontend_type: "unitTson",
            },
        };

        // 打印请求信息（注意不打印敏感信息）
        console.log('[豆包TTS API] 请求信息:', {
            url: apiUrl,
            appid,
            uid,
            voice_type: requestBody.audio.voice_type,
            text_length: finalText.length,
            speed_ratio: requestBody.audio.speed_ratio
        });

        // 调用豆包TTS API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 确保标准的Bearer token格式（无分号）
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify(requestBody)
        });

        // 获取原始响应文本以便日志记录
        const responseText = await response.text();
        let responseData;

        try {
            // 尝试解析响应为JSON
            responseData = JSON.parse(responseText);
            console.log('[豆包TTS API] 响应代码:', responseData.code);
            console.log('[豆包TTS API] 响应消息:', responseData.message);

            // 输出响应结构，帮助调试
            console.log('[豆包TTS API] 响应结构:', Object.keys(responseData).join(', '));
            if (responseData.audio) {
                console.log('[豆包TTS API] 音频结构:', Object.keys(responseData.audio).join(', '));
            }
        } catch (e) {
            console.error('[豆包TTS API] 响应不是有效的JSON:', responseText.substring(0, 100));
            responseData = null;
        }

        if (!response.ok) {
            console.error('[豆包TTS API] HTTP错误:', response.status, response.statusText);

            // 特别处理401错误
            if (response.status === 401) {
                console.error('[豆包TTS API] 401授权错误，可能是access_token已过期或无效');
            }

            return NextResponse.json(
                {
                    error: 'Failed to generate audio from Doubao TTS API',
                    details: responseData || { status: response.status }
                },
                { status: response.status }
            );
        }

        // 检查API响应中的code字段，某些API在HTTP 200的情况下仍可能通过code字段表示错误
        if (responseData && responseData.code !== 0 && responseData.code !== '0') {
            console.error('[豆包TTS API] API返回错误代码:', responseData.code, responseData.message);
            return NextResponse.json(
                {
                    error: `API returned error code: ${responseData.code}`,
                    message: responseData.message || 'Unknown error',
                    details: responseData
                },
                { status: 400 }
            );
        }

        // 处理各种可能的响应结构情况
        let audioData = null;

        if (responseData) {
            // 情况1: 标准结构 responseData.audio.audio_data
            if (responseData.audio && responseData.audio.audio_data) {
                audioData = responseData.audio.audio_data;
                console.log('[豆包TTS API] 从标准结构提取音频数据成功');
            }
            // 情况2: 简化结构 responseData.audio_data
            else if (responseData.audio_data) {
                audioData = responseData.audio_data;
                console.log('[豆包TTS API] 从简化结构提取音频数据成功');
            }
            // 情况3: 嵌套在data字段
            else if (responseData.data && responseData.data.audio_data) {
                audioData = responseData.data.audio_data;
                console.log('[豆包TTS API] 从data字段提取音频数据成功');
            }
            // 情况4: 响应本身就是base64编码数据
            else if (responseData.audio) {
                if (typeof responseData.audio === 'string') {
                    audioData = responseData.audio;
                    console.log('[豆包TTS API] 音频数据作为字符串直接返回');
                } else {
                    console.error('[豆包TTS API] 音频数据结构无法识别:', typeof responseData.audio);
                }
            }
            // 如果确实没找到音频数据
            else {
                console.error('[豆包TTS API] 响应中未找到音频数据:', JSON.stringify(responseData).substring(0, 200));
            }
        } else if (responseText && responseText.startsWith('data:audio/')) {
            // 情况5: 直接返回了data URI
            console.log('[豆包TTS API] 响应直接是data URI格式');
            return NextResponse.json({ audioUrl: responseText });
        } else if (response.headers.get('content-type')?.includes('audio/')) {
            // 情况6: 直接返回了二进制音频数据
            console.log('[豆包TTS API] 响应是二进制音频数据');
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            const contentType = response.headers.get('content-type') || 'audio/mp3';
            return NextResponse.json({
                audioUrl: `data:${contentType};base64,${base64}`
            });
        }

        // 如果找不到任何音频数据，返回错误
        if (!audioData) {
            // 在生产环境中应该返回错误，但为了测试可以返回一个模拟的音频URL
            if (isTest) {
                console.log('[豆包TTS API 测试模式] 返回模拟音频URL');
                // 这个URL只是一个示例，实际使用中应当使用真实音频
                return NextResponse.json({
                    audioUrl: '/meditation-audios/basic.mp3', // 假设存在这个测试音频文件
                    isTestMode: true
                });
            }

            return NextResponse.json(
                {
                    error: 'No audio data found in the API response',
                    responseStructure: responseData ? Object.keys(responseData).join(', ') : 'null'
                },
                { status: 500 }
            );
        }

        console.log('[豆包TTS API] 成功提取音频数据，长度:', audioData.length);

        // 返回音频URL（data URI格式）
        return NextResponse.json({
            audioUrl: `data:audio/mp3;base64,${audioData}`
        });

    } catch (e) {
        const error = e as Error;
        console.error('[豆包TTS API] 处理过程中发生错误:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
} 