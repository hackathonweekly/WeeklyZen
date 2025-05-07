import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * 用户登出API
 * 清除所有与用户登录相关的Cookie
 */
export async function POST() {
    const cookieStore = await cookies()

    // 清除用户信息Cookie
    cookieStore.delete('user_info')

    // 清除微信相关Cookie
    cookieStore.delete('wechat_refresh_token')

    return NextResponse.json({ success: true })
} 