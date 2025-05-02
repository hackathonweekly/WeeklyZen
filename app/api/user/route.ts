import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * 获取当前登录用户信息
 * 用于前端判断用户是否已登录及获取用户基本信息
 */
export async function GET() {
    const cookieStore = await cookies()
    const userInfoCookie = cookieStore.get('user_info')

    if (!userInfoCookie) {
        return NextResponse.json({ isLoggedIn: false })
    }

    try {
        const userInfo = JSON.parse(userInfoCookie.value)
        return NextResponse.json(userInfo)
    } catch (error) {
        return NextResponse.json({
            isLoggedIn: false,
            error: 'Invalid user data'
        })
    }
} 