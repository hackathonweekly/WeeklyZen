import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Invalid input. Expected a text string.' },
                { status: 400 }
            );
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

        console.log('[豆包TTS API] 开始生成音频，文本长度:', text.length);

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
                text: text,
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
            text_length: text.length,
            speed_ratio: requestBody.audio.speed_ratio
        });

        // 调用豆包TTS API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            let errorMessage = `请求失败: HTTP ${response.status}`;
            let errorData = {};

            try {
                errorData = await response.json();
                errorMessage = `请求失败: HTTP ${response.status}, 错误: ${JSON.stringify(errorData)}`;
            } catch (e) {
                const jsonError = e as Error;
                errorMessage += `, 无法解析错误响应: ${jsonError.message}`;
            }

            console.error('[豆包TTS API] 错误:', errorMessage);

            // 特别处理401错误
            if (response.status === 401) {
                console.error('[豆包TTS API] 401授权错误，可能是access_token已过期或无效');
            }

            return NextResponse.json(
                { error: 'Failed to generate audio from Doubao TTS API', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[豆包TTS API] 成功获取响应');

        // 从豆包API响应中提取音频URL
        if (!data.audio || !data.audio.audio_data) {
            console.error('[豆包TTS API] 响应缺少音频数据:', data);
            return NextResponse.json(
                { error: 'Invalid response from Doubao TTS API' },
                { status: 500 }
            );
        }

        // 将Base64编码的音频数据转换为Blob URL
        // 注意：在实际应用中，可能需要将音频保存到服务器或云存储
        const audioData = data.audio.audio_data;
        console.log('[豆包TTS API] 成功提取音频数据，长度:', audioData.length);

        // 这里我们将返回Base64编码的音频数据
        // 在前端，可以将其转换为Blob URL或Audio元素的src
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