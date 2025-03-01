import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// 定义TTS请求的类型
interface TTSRequest {
  type: 'start' | 'mid' | 'end';
  text: string;
}

// 处理POST请求
export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json() as TTSRequest;
    const { type, text } = body;

    // 验证请求参数
    if (!type || !text || !['start', 'mid', 'end'].includes(type)) {
      return NextResponse.json({ error: '无效的请求参数' }, { status: 400 });
    }

    // 获取环境变量
    const apiUrl = process.env.api_url;
    const appid = process.env.appid;
    const accessToken = process.env.access_token;
    const uid = process.env.uid;
    const cluster = process.env.cluster;

    // 验证环境变量
    if (!apiUrl || !appid || !accessToken || !uid || !cluster) {
      return NextResponse.json({ error: '环境变量配置不完整' }, { status: 500 });
    }

    // 构建TTS请求JSON
    const requestJson = {
      app: { appid, token: accessToken, cluster },
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
        text,
        text_type: "plain",
        operation: "query",
        with_frontend: 1,
        frontend_type: "unitTson",
      },
    };

    // 发送请求到火山引擎TTS API
    console.log(`正在发送TTS请求，类型: ${type}, 文本: ${text}`);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer;" + accessToken
      },
      body: JSON.stringify(requestJson),
    });

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TTS API响应错误: ${response.status}`, errorText);
      return NextResponse.json({ error: `TTS API响应错误: ${response.status}` }, { status: response.status });
    }

    // 解析响应数据
    const responseData = await response.json();
    
    // 检查响应数据
    if (!responseData.data) {
      console.error('TTS API响应数据无效:', responseData);
      return NextResponse.json({ error: 'TTS API响应数据无效' }, { status: 500 });
    }

    // 获取base64编码的音频数据
    const audioBase64 = responseData.data;
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // 确保目录存在
    const publicDir = path.join(process.cwd(), 'public');
    const aiSoundsDir = path.join(publicDir, 'ai-sounds');
    
    if (!fs.existsSync(aiSoundsDir)) {
      await fsPromises.mkdir(aiSoundsDir, { recursive: true });
    }

    // 保存音频文件
    const filePath = path.join(aiSoundsDir, `${type}.mp3`);
    await fsPromises.writeFile(filePath, audioBuffer);
    
    console.log(`成功生成音频文件: ${filePath}`);

    return NextResponse.json({ success: true, type });
  } catch (error) {
    console.error('TTS处理错误:', error);
    const errorMessage = error instanceof Error ? error.message : '处理请求时发生未知错误';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
