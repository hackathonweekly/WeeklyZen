import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { input } = await request.json();

        if (!input || typeof input !== 'string') {
            return NextResponse.json(
                { error: 'Invalid input. Expected a string.' },
                { status: 400 }
            );
        }

        const apiEndpoint = process.env.DEEPSEEK_API_ENDPOINT || 'https://aiproxy.gzg.sealos.run';
        const apiKey = process.env.DEEPSEEK_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'DeepSeek API key not configured' },
                { status: 500 }
            );
        }

        // 构建提示词，要求生成适合冥想引导的文本
        const prompt = `请基于以下用户输入，创建一段冥想引导语。我需要格式完全符合下面的示例格式：

参考格式示例：
"让我们开始来到冥想入门练习...

让我们开始冥想...这是一次放松和专注的体验...
在这里...你可以暂时放下所有的忧虑和期待...

在接下来的时间里...我们将一起探索内心的宁静...
让自己完全沉浸在当下的时刻...

让我们先找一个舒服的姿势...可以坐在椅子上...或是坐在垫子上...
选择一个安静的地方...让自己不会被打扰..."

用户输入内容: "${input}"

要求：
1. 必须严格按照上面示例格式，使用省略号("...")作为句子内的停顿标记，每一个自然停顿处都用省略号
2. 每行不要太长，一般在15-25个汉字之间，然后换行
3. 段落之间用一个空行分隔
4. 语言要温和、平静、富有引导性，不使用命令式语气
5. 总体结构包含：开始(引导入静)、中间(主要引导内容)、结束(回到现实)三个部分
6. 有些关键位置使用多个省略号分隔("............")表示较长停顿
7. 总体字数控制在400-600字左右，句子要简短平和
8. 最后以"享受这段平静的时光..."或类似温和的结束语收尾

请输出一个JSON对象，格式如下：
{
  "paragraphs": ["第一段", "第二段", "第三段", ...]
}
其中每个段落都是完整的引导语部分，包含恰当的省略号停顿。`;

        console.log('[DeepSeek API 请求] 生成引导语，用户输入:', input.substring(0, 50) + (input.length > 50 ? '...' : ''));

        // 调用DeepSeek API
        const response = await fetch(`${apiEndpoint}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('DeepSeek API error:', errorData);
            return NextResponse.json(
                { error: 'Failed to generate text from DeepSeek API' },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            return NextResponse.json(
                { error: 'Invalid response from DeepSeek API' },
                { status: 500 }
            );
        }

        // 打印DeepSeek API的原始响应内容
        console.log('[DeepSeek API 响应] 原始内容:', data.choices[0].message.content.substring(0, 200) + '...');

        // 尝试从AI响应中解析JSON
        try {
            const content = data.choices[0].message.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const jsonContent = JSON.parse(jsonMatch[0]);
                console.log('[DeepSeek API 处理] 成功解析JSON格式的响应，段落数:', jsonContent.paragraphs?.length || 0);
                return NextResponse.json(jsonContent);
            } else {
                // 如果没有找到JSON格式，尝试将文本分段
                const paragraphs = content
                    .split('\n\n')
                    .filter((p: string) => p.trim().length > 0);

                console.log('[DeepSeek API 处理] 未找到JSON格式，使用分段处理，段落数:', paragraphs.length);
                return NextResponse.json({ paragraphs });
            }
        } catch (parseError) {
            console.error('[DeepSeek API 处理] 解析响应时出错:', parseError);

            // 如果解析失败，尝试将文本分段
            const paragraphs = data.choices[0].message.content
                .split('\n\n')
                .filter((p: string) => p.trim().length > 0);

            console.log('[DeepSeek API 处理] 使用备用分段处理，段落数:', paragraphs.length);
            return NextResponse.json({ paragraphs });
        }
    } catch (error) {
        console.error('Error generating guidance:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 