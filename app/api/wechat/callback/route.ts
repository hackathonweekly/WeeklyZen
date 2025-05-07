import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * 处理微信公众号网页授权回调
 * 当用户在微信中授权后，微信会将用户重定向回此接口，并带上code和state参数
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    // 检查授权码是否存在
    if (!code) {
        console.error('未获取到授权码')
        return NextResponse.redirect(new URL('/login?error=authorization_failed', request.url))
    }

    try {
        // 使用code换取access_token
        const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.NEXT_PUBLIC_WECHAT_APPID}&secret=${process.env.WECHAT_SECRET}&code=${code}&grant_type=authorization_code`

        const tokenRes = await fetch(tokenUrl)
        const tokenData = await tokenRes.json()

        if (tokenData.errcode) {
            throw new Error(`获取access_token失败: ${tokenData.errmsg}`)
        }

        const { access_token, openid, refresh_token } = tokenData

        // 获取用户信息
        const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
        const userRes = await fetch(userInfoUrl)
        const userData = await userRes.json()

        if (userData.errcode) {
            throw new Error(`获取用户信息失败: ${userData.errmsg}`)
        }

        // 创建响应对象，设置重定向到首页
        const response = NextResponse.redirect(new URL('/', request.url))

        // 将用户信息存储在cookie中
        response.cookies.set('user_info', JSON.stringify({
            openid: userData.openid,
            nickname: userData.nickname,
            avatar: userData.headimgurl,
            isLoggedIn: true,
            loginType: 'wechat',
            loginTime: new Date().toISOString()
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 一周有效期
            path: '/'
        })

        // 记录refresh_token（用于后续刷新access_token）
        response.cookies.set('wechat_refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30天
            path: '/'
        })

        return response
    } catch (error) {
        console.error('微信登录处理失败:', error)
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(String(error))}`, request.url))
    }
} 