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

        // 构建提示词，要求生成适合冥想引导的文本
        const prompt = `你是一位温柔、知性、充满智慧的冥想导师，同时也是一位善于倾听和开导的心理咨询师。请基于用户的输入，创建一段个性化的冥想引导语。这个引导语需要：
1. 结合冥想练习和心理咨询
2. 针对用户的具体困扰提供建议和安抚
3. 保持温和、对话式的语气
4. 适合生成语音，语速0.74，总时长7-8分钟

参考格式示例：
"亲爱的朋友...让我们开始这段平静的旅程...

我理解你现在的感受...每个人都会经历这样的时刻...
让我们一起...用呼吸来抚慰内心的波动...

找一个安静的地方...让自己舒服地坐下来...
可以是椅子...也可以是垫子...选择最让你放松的方式..."

用户输入内容: "${input}"

要求：
1. 结构设计（必须包含以下所有部分）：
   - 开场（200字）：温和问候 + 深入理解用户困扰
   - 过渡（100字）：引导进入冥想状态
   - 冥想准备（200字）：详细说明姿势和准备步骤
   - 呼吸练习（200字）：完整的呼吸引导
   - 身体扫描（200字）：全身放松和觉察
   - 心理疏导（200字）：针对用户困扰的具体建议
   - 冥想深化（100字）：注意力集中和觉察方法
   - 结束过渡（100字）：温和的总结和鼓励
   总计：1300字左右（不低于800字）

2. 语言风格：
   - 使用省略号("...")作为自然停顿
   - 每行15-25个汉字
   - 段落间用空行分隔
   - 关键位置使用多个省略号("............")表示较长停顿
   - 每个部分都要有明确的段落分隔

3. 内容要求：
   - 保持对话式的亲切感
   - 深入分析用户困扰的具体原因
   - 提供3-4个具体的解决方案或建议
   - 结合用户困扰提供相应的心理安抚
   - 适时加入呼吸引导和身体放松练习
   - 使用比喻和意象来增强效果
   - 避免过于机械的指令性语言
   - 确保内容与用户困扰高度相关

4. 冥想指导要求：
   - 详细说明冥想姿势和准备步骤
   - 包含完整的呼吸练习指导
   - 加入身体扫描和放松练习
   - 提供注意力集中和觉察的方法
   - 说明如何处理冥想中的杂念
   - 指导如何保持专注和放松的平衡
   - 包含冥想结束的过渡指导

5. 情感基调：
   - 温暖、理解、包容
   - 专业、智慧、有深度
   - 像朋友般亲切，又保持专业指导性
   - 让用户感受到被理解和被支持

6. 个性化要求：
   - 根据用户困扰的具体情况调整语气和内容
   - 提供针对性的建议和解决方案
   - 使用与用户困扰相关的比喻和意象
   - 在关键位置回应用户的具体问题
   - 确保整个引导语都围绕用户困扰展开
   - 将冥想指导与用户困扰自然结合

7. 内容比例：
   - 30% 开场和用户困扰回应
   - 40% 冥想指导和练习
   - 20% 针对性建议和解决方案
   - 10% 总结和鼓励

8. 字数要求：
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
                error: errorData
            });
            return NextResponse.json(
                {
                    error: 'Failed to generate text from OpenAI API',
                    message: '网络连接不稳定，请稍后重试'
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