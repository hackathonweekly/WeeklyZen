import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 获取文件路径
    const mdxPath = path.join(process.cwd(), 'app/introduction/introduction.mdx');
    
    // 读取文件内容
    const content = fs.readFileSync(mdxPath, 'utf8');
    
    // 返回内容
    return new NextResponse(content);
  } catch (error) {
    console.error('Error reading meditation introduction file:', error);
    return new NextResponse('获取冥想入门内容失败', { status: 500 });
  }
} 