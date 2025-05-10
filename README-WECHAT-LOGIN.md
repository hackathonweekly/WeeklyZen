# 微信一键登录功能实现文档

本文档详细介绍了如何在WeeklyZen应用中配置和使用微信一键登录功能。

## 功能概述

通过微信网页授权，允许用户使用微信账号一键登录网站，无需额外注册。获取用户的基本信息（如昵称、头像等），用于个性化用户体验。

## 实现原理

微信网页授权基于OAuth 2.0协议，主要流程如下：

1. 引导用户进入微信授权页面
2. 用户授权后，微信会将用户重定向回我们的网站，并附带临时授权码code
3. 服务端使用code换取访问令牌(access_token)和用户标识(openid)
4. 使用access_token和openid获取用户信息
5. 建立用户会话，完成登录流程

## 前置条件

1. 一个已认证的微信公众号（服务号或订阅号）
2. 设置网页授权回调域名
   - 登录微信公众平台 → 设置与开发 → 功能设置 → 网页授权域名
   - 填写你的网站域名，不含http://或https://（如：example.com）
   - 上传验证文件至网站根目录进行域名验证

## 环境变量配置

创建`.env.local`文件，添加以下配置：

```
# 应用 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 微信公众号配置
NEXT_PUBLIC_WECHAT_APP_ID=wxYOUR_APP_ID  # 客户端使用
WECHAT_APP_ID=wxYOUR_APP_ID  # 服务端使用
WECHAT_APP_SECRET=YOUR_APP_SECRET  # 服务端使用
```

## 组件说明

WeeklyZen提供了两种微信登录组件实现：

### 1. 标准组件 (`components/wechat-login.tsx`)
- 使用微信官方网页授权方式实现
- 这是推荐的生产环境实现方式
- 用于真实微信公众号授权登录
- 集成到现有的主题系统和语言国际化
- 支持暗色/亮色主题自适应
- 适配WeeklyZen的设计风格
- 可配置按钮文本、样式和尺寸

## 使用方法

### 在页面中使用标准网页授权登录组件

```tsx
import { WechatLogin } from '@/components/wechat-login';

export default function LoginPage() {
  return (
    <div>
      <h1>登录</h1>
      <WechatLogin 
        onLoginSuccess={(userData) => {
          console.log('登录成功:', userData);
          // 处理登录成功后的逻辑
        }}
        buttonText="使用微信登录"
        buttonVariant="default"
        buttonSize="default"
        redirectUrl="/dashboard" // 登录成功后重定向的URL
      />
    </div>
  );
}
```

### 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| onLoginSuccess | function | 登录成功后的回调函数 |
| buttonText | string | 自定义按钮文本 |
| buttonVariant | "default" \| "outline" \| "ghost" | 按钮样式变体 |
| buttonSize | "default" \| "sm" \| "lg" \| "icon" | 按钮尺寸 |
| redirectUrl | string | 登录成功后重定向的URL，默认为'/' |

### 检查用户登录状态

```tsx
import { useWechatAuth } from '@/hooks/useWechatAuth';

export default function ProfilePage() {
  const { user, loading, isLoggedIn, logout } = useWechatAuth();
  
  if (loading) return <div>加载中...</div>;
  
  if (!isLoggedIn) {
    return <div>请先登录</div>;
  }
  
  return (
    <div>
      <h1>欢迎，{user.nickname}</h1>
      <img src={user.avatar} alt={user.nickname} />
      <button onClick={logout}>退出登录</button>
    </div>
  );
}
```

## 生产环境部署注意事项

1. 确保已在微信公众平台正确配置网页授权域名
2. 使用HTTPS协议保证安全性
3. 在服务器上设置正确的环境变量
4. 考虑实现access_token的刷新机制
5. 可能需要根据业务需求调整cookie设置（如有效期、安全属性等）

## 安全建议

1. 避免将敏感信息（如access_token）存储在客户端
2. 使用HTTPS确保传输安全
3. 实现CSRF保护
4. 谨慎处理微信用户的个人信息，遵守隐私政策

## 微信公众平台配置示例

1. 登录微信公众平台（https://mp.weixin.qq.com/）
2. 进入"设置与开发" -> "公众号设置" -> "功能设置"
3. 配置"网页授权域名"
4. 按照提示下载验证文件并上传到网站根目录
5. 进入"开发" -> "基本配置"，获取AppID和AppSecret

---

若有任何问题或建议，请联系WeeklyZen开发团队。 