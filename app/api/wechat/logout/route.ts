import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // 清除相关cookie
    response.cookies.set('wechat_user', '', {
        maxAge: 0,
        path: '/',
    });

    response.cookies.set('wechat_token', '', {
        maxAge: 0,
        path: '/',
    });

    return response;
} 