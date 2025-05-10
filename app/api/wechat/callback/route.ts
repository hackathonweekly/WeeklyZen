import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 微信接口配置
const WECHAT_CONFIG = {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
};

// 获取微信访问令牌
async function getWechatAccessToken(code: string) {
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}&code=${code}&grant_type=authorization_code`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`获取access_token失败: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('获取微信访问令牌出错:', error);
        throw error;
    }
}

// 获取微信用户信息
async function getWechatUserInfo(accessToken: string, openId: string) {
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openId}&lang=zh_CN`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`获取用户信息失败: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('获取微信用户信息出错:', error);
        throw error;
    }
}

// 验证访问令牌是否有效
async function verifyAccessToken(accessToken: string, openId: string) {
    const url = `https://api.weixin.qq.com/sns/auth?access_token=${accessToken}&openid=${openId}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.errcode === 0;
    } catch (error) {
        console.error('验证访问令牌出错:', error);
        return false;
    }
}

export async function GET(request: Request) {
    // 从URL中获取code参数
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    // 获取重定向URL参数，如果在URL中有redirect参数，优先使用它
    const redirectParam = searchParams.get('redirect');

    // 最终重定向地址
    const finalRedirectUrl = redirectParam || state || '/';

    // 如果没有code，则返回错误
    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || ''}/login?error=微信授权失败`);
    }

    try {
        // 使用code获取访问令牌和openid
        const tokenResponse = await getWechatAccessToken(code);

        if (tokenResponse.errcode) {
            console.error('微信授权错误:', tokenResponse);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || ''}/login?error=微信授权失败:${tokenResponse.errmsg}`);
        }

        const { access_token, refresh_token, openid, expires_in } = tokenResponse;

        // 验证令牌有效性
        const isValidToken = await verifyAccessToken(access_token, openid);
        if (!isValidToken) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || ''}/login?error=授权凭证无效`);
        }

        // 获取用户信息
        const userInfo = await getWechatUserInfo(access_token, openid);

        // 创建用户会话
        // 这里可以插入你的用户验证逻辑，例如在数据库中查找用户或创建新用户

        // 创建重定向响应
        const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || ''}${finalRedirectUrl}`);

        // 在响应中设置cookie
        response.cookies.set('wechat_user', JSON.stringify({
            openid,
            nickname: userInfo.nickname,
            avatar: userInfo.headimgurl,
            // 不要存储敏感信息如accessToken在客户端Cookie中
        }), {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60, // 7天
            path: '/',
        });

        // 存储访问令牌 (应该存储在安全的服务器端会话中)
        response.cookies.set('wechat_token', JSON.stringify({
            access_token,
            refresh_token,
            expires_at: Date.now() + expires_in * 1000,
        }), {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: expires_in,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('微信授权处理出错:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || ''}/login?error=微信登录处理错误`);
    }
} 