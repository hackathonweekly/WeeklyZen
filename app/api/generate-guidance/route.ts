import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { input } = await request.json();

        if (!input || typeof input !== 'string') {
            console.error('[生成引导语] 输入验证失败:', { input });
            return NextResponse.json(
                {
                    error: 'Invalid input. Expected a string.',
                    message: '请输入有效的引导语内容'
                },
                { status: 400 }
            );
        }

        const apiEndpoint = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com';
        const apiKey = process.env.OPENAI_API_KEY;
        const modelName = process.env.OPENAI_MODEL_NAME || 'gpt-4';

        if (!apiKey) {
            console.error('[生成引导语] API密钥未配置');
            return NextResponse.json(
                {
                    error: 'OpenAI API key not configured',
                    message: '服务配置异常，请稍后再试'
                },
                { status: 500 }
            );
        }

        const baseIntro = `让我们开始今天的冥想练习...

请找一个...舒适的姿势、坐下......让身体完全放松...
轻轻闭上双眼......感受此刻的宁静...

深深地...吸一口气......然后...缓缓呼出...

保持宁静，与安宁......`;

        const prompt = `你是一位温柔、知性、充满智慧的冥想导师，同时也是一位善于倾听和开导的心理咨询师。请基于用户的输入，创建一段个性化的冥想引导语。

特别注意：引导语会在以下开场白之后播放，需要自然衔接：

${baseIntro}

这个引导语需要：
1. 结合冥想练习和心理咨询
2. 针对用户的具体困扰提供建议和安抚
3. 保持温和、对话式的语气
4. 适合生成语音，语速0.74，总时长6-7分钟

重新设计的结构（必须包含以下所有部分）：
   - 过渡承接（80字）：自然衔接开场白，加深放松状态
   - 心理疏导（150字）：理解和回应用户困扰
   - 身心觉察（120字）：引导觉察身体和情绪状态
   - 深度放松（120字）：全身放松和能量流动
   - 问题转化（120字）：将困扰转化为成长机会
   - 内在对话（120字）：与自己的内心对话
   - 正向引导（50字）：建立积极的心理暗示
   - 温和收尾（40字）：平和的结束语
   总计：800字

参考格式示例：
"我理解你现在的感受...每个人都会经历这样的时刻...
让我们一起...用呼吸来抚慰内心的波动...

找一个安静的地方...让自己舒服地坐下来...
可以是椅子...也可以是垫子...选择最让你放松的方式..."

用户输入内容: "${input}"

要求：
1. 语言风格：
   - 使用省略号("...")作为自然停顿
   - 每行15-25个汉字
   - 段落间用空行分隔
   - 关键位置使用多个省略号("............")表示较长停顿
   - 每个部分都要有明确的段落分隔

2. 内容要求：
   - 保持对话式的亲切感
   - 深入分析用户困扰的具体原因
   - 提供3-4个具体的解决方案或建议
   - 结合用户困扰提供相应的心理安抚
   - 适时加入呼吸引导和身体放松练习
   - 使用比喻和意象来增强效果
   - 避免过于机械的指令性语言
   - 确保内容与用户困扰高度相关

3. 冥想指导要求：
   - 详细说明冥想姿势和准备步骤
   - 包含完整的呼吸练习指导
   - 加入身体扫描和放松练习
   - 提供注意力集中和觉察的方法
   - 说明如何处理冥想中的杂念
   - 指导如何保持专注和放松的平衡
   - 包含冥想结束的过渡指导

4. 情感基调：
   - 温暖、理解、包容
   - 专业、智慧、有深度
   - 像朋友般亲切，又保持专业指导性
   - 让用户感受到被理解和被支持

5. 个性化要求：
   - 根据用户困扰的具体情况调整语气和内容
   - 提供针对性的建议和解决方案
   - 使用与用户困扰相关的比喻和意象
   - 在关键位置回应用户的具体问题
   - 确保整个引导语都围绕用户困扰展开
   - 将冥想指导与用户困扰自然结合

6. 内容比例：
   - 30% 开场和用户困扰回应
   - 40% 冥想指导和练习
   - 20% 针对性建议和解决方案
   - 10% 总结和鼓励

7. 字数要求：
   - 总字数控制在1200-1500字之间
   - 每个部分都要达到指定的字数
   - 确保内容充实，不重复
   - 保持段落结构清晰
   - 生成文本长度必须不低于800字

请输出一个JSON对象，格式如下：
{
  "paragraphs": ["第一段", "第二段", "第三段", ...]
}
其中每个段落都是完整的引导语部分，包含恰当的省略号停顿。`;

        console.log('[OpenAI API 请求] 生成引导语，用户输入:', input.substring(0, 50) + (input.length > 50 ? '...' : ''));

        // 调用OpenAI API
        const response = await fetch(`${apiEndpoint}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    {
                        role: 'system',
                        content: '你是一位专业的冥想导师，擅长生成详细的冥想引导语。请确保生成的内容完整、详细，并符合所有要求。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,  // 降低创造性，使输出更稳定
                max_tokens: 4000,  // 调整最大 token 数
                presence_penalty: 0.3,  // 降低话题多样性，保持内容连贯
                frequency_penalty: 0.3,  // 降低重复惩罚，允许必要的重复
                top_p: 0.95,  // 提高采样范围
                stop: null,  // 不设置停止条件
                n: 1,  // 只生成一个回复
                stream: false  // 不使用流式响应
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[生成引导语] OpenAI API错误:', {
                status: response.status,
                error: errorData,
                endpoint: apiEndpoint,
                modelName: modelName
            });

            let errorMessage = '网络连接不稳定，请稍后重试';
            if (response.status === 401) {
                errorMessage = 'API密钥无效或已过期';
            } else if (response.status === 429) {
                errorMessage = 'API调用次数已达上限，请稍后再试';
            } else if (response.status === 500) {
                errorMessage = '服务器内部错误，请检查API配置';
            }

            return NextResponse.json(
                {
                    error: `Failed to generate text from OpenAI API: ${response.status}`,
                    message: errorMessage,
                    details: errorData
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('[生成引导语] OpenAI API响应格式错误:', data);
            return NextResponse.json(
                {
                    error: 'Invalid response from OpenAI API',
                    message: '服务响应异常，请稍后重试'
                },
                { status: 500 }
            );
        }

        // 打印OpenAI API的原始响应内容
        console.log('[OpenAI API 响应] 原始内容:', data.choices[0].message.content.substring(0, 200) + '...');

        // 尝试从AI响应中解析JSON
        try {
            const content = data.choices[0].message.content;
            console.log('[OpenAI API 响应] 原始内容长度:', content.length);

            // 尝试解析 JSON
            try {
                const jsonContent = JSON.parse(content);
                console.log('[OpenAI API 处理] 成功解析JSON格式的响应，段落数:', jsonContent.paragraphs?.length || 0);

                // 计算总字数（用于调试）
                const totalChars = jsonContent.paragraphs.reduce((acc: number, p: string) => acc + p.length, 0);
                console.log('[OpenAI API 处理] 生成文本总字数:', totalChars);

                // 确保返回完整的文本内容
                return NextResponse.json({
                    paragraphs: jsonContent.paragraphs,
                    fullText: jsonContent.paragraphs.join('\n\n')  // 添加完整文本
                });
            } catch (jsonError) {
                // JSON 解析失败，使用文本分段处理
                const paragraphs = content
                    .split('\n\n')
                    .filter((p: string) => p.trim().length > 0);

                console.log('[OpenAI API 处理] JSON解析失败，使用分段处理，段落数:', paragraphs.length);

                // 计算总字数（用于调试）
                const totalChars = paragraphs.reduce((acc: number, p: string) => acc + p.length, 0);
                console.log('[OpenAI API 处理] 生成文本总字数:', totalChars);

                // 确保返回完整的文本内容
                return NextResponse.json({
                    paragraphs: paragraphs,
                    fullText: paragraphs.join('\n\n')  // 添加完整文本
                });
            }
        } catch (error) {
            console.error('[OpenAI API 处理] 处理响应时出错:', error);
            return NextResponse.json(
                {
                    error: 'Failed to process response',
                    message: '处理响应时出错，请重试'
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('[生成引导语] 系统错误:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: '系统暂时无法响应，请稍后重试'
            },
            { status: 500 }
        );
    }
} 