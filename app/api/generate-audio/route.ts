import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    // 处理跨域请求，允许所有来源访问
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理预检请求（OPTIONS请求）
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders, status: 204 });
    }

    try {
        // 解析请求参数
        const { text, isTest } = await request.json();

        // 测试模式：直接使用预设文本进行测试，不依赖DeepSeek API
        const testText = "欢迎来到这段平静的时光............让我们暂时放下所有的烦恼...给自己一个喘息的机会...在这里...你可以完全放松下来...不必担心任何事...";

        // 如果 text 是对象且包含 fullText 字段，使用 fullText
        const finalText = isTest ? testText : (typeof text === 'object' && text.fullText ? text.fullText : text);

        if (!finalText || typeof finalText !== 'string') {
            return NextResponse.json(
                { error: 'Invalid input. Expected a text string.' },
                { status: 400 }
            );
        }

        // 输出测试信息
        if (isTest) {
            console.log('[豆包TTS API 测试模式] 使用预设文本:', testText.substring(0, 50) + '...');
        } else {
            console.log('[豆包TTS API] 接收到的文本长度:', finalText.length);
            console.log('[豆包TTS API] 文本预览:', finalText.substring(0, 100) + '...');
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

        // 添加Bearer token到请求头
        const header = { "Authorization": "Bearer;" + access_token }

        // 准备请求体
        const requestBody = {
            app: { appid, token: access_token, cluster },
            user: { uid },
            audio: {
                voice_type: "zh_female_xinlingjitang_moon_bigtts",
                encoding: "mp3",
                language: "zh",
                speed_ratio: 0.74,
                volume_ratio: 1.2,
                pitch_ratio: 0.68,
                sample_rate: 22050,
                bitrate: 64,
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
            headers: header,
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
            // console.log('[豆包TTS API] 响应结构:', Object.keys(responseData).join(', '));
            // if (responseData.data) {
            //     console.log('[豆包TTS API] data字段结构:', Object.keys(responseData.data).join(', '));
            // }
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

        // 检查API响应中的code字段，特定处理code 3000为成功状态
        if (responseData && responseData.code !== 0 && responseData.code !== '0' && responseData.code !== 3000 && responseData.code !== '3000') {
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

        // 对于code 3000的情况，视为成功，继续处理
        if (responseData && (responseData.code === 3000 || responseData.code === '3000')) {
            console.log('[豆包TTS API] 收到成功状态码3000:', responseData.message);
        }

        // 处理各种可能的响应结构情况
        let audioData = null;

        if (responseData) {
            // 检查data字段中的音频数据 - 豆包API常见格式
            if (responseData.data && responseData.data.audio_binary) {
                audioData = responseData.data.audio_binary;
                console.log('[豆包TTS API] 从data.audio_binary字段提取音频数据成功');
            }
            // 情况1: 标准结构 responseData.audio.audio_data
            else if (responseData.audio && responseData.audio.audio_data) {
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
                console.log('[豆包TTS API] 从data.audio_data字段提取音频数据成功');
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
            // 新增情况5: data字段直接是字符串
            else if (responseData.data && typeof responseData.data === 'string') {
                audioData = responseData.data;
                console.log('[豆包TTS API] 从data字段直接提取字符串作为音频数据成功');
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

        // 检查生成的音频大小
        const audioSize = audioData.length;
        const sizeInMB = (audioSize / (1024 * 1024)).toFixed(2);

        // 如果生成的音频大于3MB，记录警告
        if (audioSize > 3 * 1024 * 1024) {
            console.warn(`[豆包TTS API] 警告：生成的音频数据较大 (${sizeInMB}MB)`);
        }

        // 在返回前添加详细日志
        console.log('[豆包TTS API] 返回audioUrl，长度:', `data:audio/mp3;base64,${audioData}`.length);
        console.log('[豆包TTS API] audioUrl前100字符:', `data:audio/mp3;base64,${audioData}`.substring(0, 100));

        // 返回音频URL（data URI格式）
        return NextResponse.json({
            audioUrl: `data:audio/mp3;base64,${audioData}`,
            size: audioSize,
            sizeInMB
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