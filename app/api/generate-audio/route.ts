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
            return NextResponse.json(
                { error: 'Doubao TTS API credentials not configured' },
                { status: 500 }
            );
        }

        // 准备请求体
        const requestBody = {
            app: { appid, token: access_token, cluster },
            user: { uid },
            audio: {
                voice_type: "ICL_zh_female_zhixingwenwan_tob",
                encoding: "mp3",
                language: "zh",
                speed_ratio: 0.9,
                volume_ratio: 1.0,
                pitch_ratio: 0.9,
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

        // 调用豆包TTS API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Doubao TTS API error:', errorData);
            return NextResponse.json(
                { error: 'Failed to generate audio from Doubao TTS API' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // 从豆包API响应中提取音频URL
        if (!data.audio || !data.audio.audio_data) {
            return NextResponse.json(
                { error: 'Invalid response from Doubao TTS API' },
                { status: 500 }
            );
        }

        // 将Base64编码的音频数据转换为Blob URL
        // 注意：在实际应用中，可能需要将音频保存到服务器或云存储
        const audioData = data.audio.audio_data;

        // 这里我们将返回Base64编码的音频数据
        // 在前端，可以将其转换为Blob URL或Audio元素的src
        return NextResponse.json({
            audioUrl: `data:audio/mp3;base64,${audioData}`
        });

    } catch (error) {
        console.error('Error generating audio:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 