import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        // 获取用户cookie
        const userCookie = req.cookies.get('wechat_user');

        if (!userCookie || !userCookie.value) {
            return NextResponse.json({ error: '未登录' }, { status: 401 });
        }

        // 解析用户信息
        const userData = JSON.parse(userCookie.value);

        // 返回用户数据，但不包含敏感信息
        return NextResponse.json({
            openid: userData.openid,
            nickname: userData.nickname,
            avatar: userData.avatar
        });

    } catch (error) {
        console.error('获取用户信息失败:', error);
        return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
    }
} 