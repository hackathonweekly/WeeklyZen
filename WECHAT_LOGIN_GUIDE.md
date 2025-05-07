# 微信登录功能实现指南

本项目支持两种微信登录方式：
1. 微信内浏览器一键登录（公众号网页授权）
2. 其他浏览器扫码登录（开放平台扫码登录）

## 项目配置步骤

### 1. 环境变量配置

在项目根目录创建 `.env.local` 文件，配置以下内容：

```
# 微信公众号配置（用于微信内浏览器登录）
NEXT_PUBLIC_WECHAT_APPID=您的公众号AppID
WECHAT_SECRET=您的公众号AppSecret
NEXT_PUBLIC_DOMAIN=您的网站域名

# 微信开放平台配置（用于扫码登录）
NEXT_PUBLIC_WECHAT_OPEN_APPID=您的开放平台AppID
WECHAT_OPEN_SECRET=您的开放平台AppSecret
```

### 2. 微信公众号配置（微信内浏览器一键登录）

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 确保您拥有一个已认证的服务号（订阅号功能有限）
3. 在"公众号设置" > "功能设置"中找到"网页授权域名"配置项
4. 添加您的网站域名（不含协议头，如 example.com）
5. 在"开发" > "基本配置"中获取AppID和AppSecret

**注意事项：**
- 公众号必须通过微信认证才能获取用户信息
- 网页授权域名必须配置SSL证书（https）
- 测试时可以使用微信开发者工具进行本地调试

### 3. 微信开放平台配置（PC扫码登录）

1. 登录[微信开放平台](https://open.weixin.qq.com/)
2. 创建一个网站应用
3. 完成开发者资质认证
4. 在应用设置中配置"授权回调域"为您的域名
5. 获取开放平台的AppID和AppSecret

**注意事项：**
- 开放平台的应用需要通过审核才能正式使用
- 网站应用必须有ICP备案
- 授权回调域必须配置SSL证书（https）

## 功能实现说明

本项目登录功能根据用户浏览器自动判断登录方式：

1. **微信内浏览器**：显示微信一键登录按钮，点击后直接使用当前微信账号授权登录
2. **PC浏览器**：显示微信扫码登录，用户扫码后在手机上确认即可登录
3. **移动端非微信浏览器**：提供"在微信中打开"选项，引导用户复制链接到微信中打开，同时提供其他登录选项

所有登录方式登录成功后均会：
- 获取用户微信头像和昵称
- 将用户信息存储在安全的httpOnly cookie中
- 重定向到网站首页

## 调试与测试

### 微信公众号网页授权调试

1. 使用[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)进行本地调试
2. 或在手机微信中访问测试环境链接

### 扫码登录调试

1. 确保测试环境已配置SSL证书（https），或使用代理工具转发
2. 确保回调地址可以被微信服务器访问

## 常见问题

1. **公众号授权失败**
   - 检查网页授权域名是否配置正确
   - 确认公众号是否已通过微信认证
   - 验证AppID和AppSecret是否正确

2. **扫码登录失败**
   - 确认开放平台应用是否已审核通过
   - 检查授权回调域是否配置正确
   - 验证AppID和AppSecret是否正确

3. **本地开发环境测试**
   - 使用ngrok等工具将本地环境暴露到公网
   - 配置临时域名到微信公众平台和开放平台
   - 或使用微信开发者工具进行调试

## 参考文档

- [微信公众平台开发文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)
- [微信开放平台开发文档](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html) 