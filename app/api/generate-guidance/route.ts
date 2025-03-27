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
        const prompt = `请基于以下用户输入，创建一段冥想引导语。
输入内容: "${input}"

要求：
1. 生成的引导语应该平静、舒缓，适合冥想场景
2. 文本要使用"..."作为停顿标记，例如"深呼吸...感受平静..."
3. 将文本分成多个自然段落，每段都有明确的主题
4. 总体结构应该包含开始、中间引导、结束三个部分
5. 语言要温和、包容、不带评判
6. 避免使用命令式语气，多使用建议性表达
7. 总体字数在600-800字左右

请输出一个JSON对象，格式如下：
{
  "paragraphs": ["第一段", "第二段", "第三段", ...]
}
其中每个段落都是完整的引导语部分。`;

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

        // 尝试从AI响应中解析JSON
        try {
            const content = data.choices[0].message.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const jsonContent = JSON.parse(jsonMatch[0]);
                return NextResponse.json(jsonContent);
            } else {
                // 如果没有找到JSON格式，尝试将文本分段
                const paragraphs = content
                    .split('\n\n')
                    .filter((p: string) => p.trim().length > 0);

                return NextResponse.json({ paragraphs });
            }
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);

            // 如果解析失败，尝试将文本分段
            const paragraphs = data.choices[0].message.content
                .split('\n\n')
                .filter((p: string) => p.trim().length > 0);

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