# WeeklyZen | 周周冥想

WeeklyZen（周周冥想）是一个专注于冥想练习的网站，为创客和开发者提供一个简单、可持续的冥想空间。本项目基于 Next.js 15 (App Router)、Shadcn UI、Tailwind CSS 和 Framer Motion 构建。

![website](image.png)

## 主要功能

### 1. 多语言支持

- 支持中文和英文切换
- 语言设置会保存在本地存储中

### 2. 首页

- 简约黑白设计风格
- 呼吸动画效果展示
- "Who controls his breath controls his life" 主标语
- 周周冥想小组简介
- 入口按钮：开始冥想、冥想入门

### 3. 冥想入门页面

- 包含十分钟冥想入门指引
- 清晰的冥想基础知识
- 简单的冥想步骤指导
- 常见问题解答
- 进阶冥想技巧

### 4. 冥想页面

- 提供不同冥想引导
- 可自定义冥想时长
- 包含适合冥想的背景音乐
- 冥想计时与提示功能
- 自定义AI生成引导语功能

### 5. 关于页面

- 介绍周周冥想小组的理念和背景
- 参与方式的详细说明
- 冥想对创客的帮助解析

### 6. 主题系统

- 支持亮色/暗色主题切换
- 优化的夜间模式，减少蓝光
- 平滑的主题切换过渡效果
- 自定义滚动条和文本选择样式
- 主题演示页面展示各种UI元素在不同主题下的样式

## 技术栈

- **Next.js 15**: 使用最新的 App Router 架构
- **React 18**: 前端框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式系统
- **Shadcn UI**: 组件库
- **Framer Motion**: 动画效果
- **React Markdown**: Markdown 渲染
- **next-themes**: 主题管理

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发环境运行

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

## 项目结构

```
WeeklyZen/
├── app/                # 应用路由和页面
│   ├── about/          # 关于我们页面
│   ├── api/            # API 路由
│   │   └── generate-guidance/  # AI 生成引导语的接口
│   ├── introduction/   # 冥想入门页面
│   ├── meditation/     # 冥想练习页面
│   │   └── components/ # 冥想页面组件
│   │       ├── MeditationAudioController.tsx  # 音频控制逻辑
│   │       ├── MeditationCore.tsx             # 冥想核心组件
│   │       ├── MeditationDialogController.tsx # 对话框管理组件
│   │       ├── MeditationHeader.tsx           # 顶部导航组件
│   │       ├── MeditationEncouragement.tsx    # 冥想鼓励提示组件
│   │       ├── CustomGuidance.tsx             # 自定义引导语组件
│   │       ├── GuidanceSelector.tsx           # 引导语选择组件
│   │       ├── SoundSelector.tsx              # 音效选择组件
│   │       └── RefactoredMeditationPage.tsx   # 重构后的冥想页面
│   ├── theme-demo/     # 主题演示页面
│   └── page.tsx        # 首页
├── components/         # 组件
│   ├── breathing-animation.tsx  # 呼吸动画组件
│   ├── breathing-sphere.tsx     # 呼吸球组件
│   ├── enhanced-header.tsx      # 增强版头部组件
│   ├── language-switch.tsx      # 语言切换组件
│   ├── main-nav.tsx             # 主导航
│   ├── site-header.tsx          # 站点头部
│   ├── theme-toggle.tsx         # 主题切换按钮
│   └── ui/                      # UI 组件
├── contexts/           # 上下文
│   ├── language-context.tsx     # 语言上下文
│   └── theme-context.tsx        # 主题上下文
├── hooks/              # 自定义钩子
├── lib/                # 工具函数
├── public/             # 静态资源
└── styles/             # 样式文件
```

## 冥想页面组件详解

冥想页面采用模块化设计，拆分为多个独立组件，提高代码可维护性和复用性：

### 核心组件结构

1. **MeditationPage.tsx / RefactoredMeditationPage.tsx**
   - 冥想页面主组件，整合所有子组件
   - 管理全局状态，协调各组件交互

2. **MeditationAudioController.tsx**
   - 导出 `useMeditationAudio` 钩子
   - 管理音频播放、暂停、音量控制
   - 处理背景音效、引导语音频和自定义音频
   - 提供音频相关回调函数

3. **MeditationDialogController.tsx**
   - 管理所有对话框的状态和交互
   - 导出 `useMeditationDialogs` 钩子
   - 协调音效、引导语、课程选择等对话框

4. **MeditationCore.tsx**
   - 冥想核心界面组件
   - 显示计时器和呼吸球动画
   - 处理播放/暂停按钮逻辑
   - 通知计时结束等事件

5. **MeditationHeader.tsx**
   - 页面顶部导航和控制栏
   - 提供返回、主题切换功能
   - 显示音效、引导语选择按钮
   - 包含时长选择和音量控制

6. **CustomGuidance.tsx**
   - 处理自定义AI引导语生成
   - 与后端API交互获取AI生成内容
   - 管理问题输入和引导语生成

7. **GuidanceSelector.tsx / SoundSelector.tsx**
   - 引导语和音效选择界面
   - 展示可选项列表和预览
   - 处理选择交互和确认

## 主题系统特性

### 夜间模式优化

- 减少蓝光，降低眼睛疲劳
- 优化对比度和可读性
- 使用更柔和的色调和渐变

### 交互体验增强

- 平滑的主题切换过渡效果
- 自定义滚动条样式
- 文本选择样式优化
- 焦点状态改进

### 全局一致性

- 统一的色彩系统
- 一致的组件样式
- 响应式设计适配各种设备

### 无障碍设计

- 符合 WCAG 标准的对比度
- 键盘导航支持
- 屏幕阅读器友好

## 贡献

欢迎提交 Pull Request 或 Issue。

## 版权

本项目内容使用 CC BY-NC-SA 4.0 许可协议。

---

2025 © WeeklyZen | 周周冥想小组

## 我们是谁

WeeklyZen.Club 周周冥想是周周黑客松社区下的一个专注纯粹冥想练习的温暖小组，致力于为创客和开发者提供一个简单、可持续的冥想空间。通过线上线下结合的方式，我们希望将冥想文化融入创客社区，帮助大家在创新与协作中找到内心的平衡与力量。

🌿 核心价值：简单·纯粹·互助·可持续
✅ 三无承诺 ：无收费/无宗教/无干扰（不讨论与冥想无关内容）

## 本网站完全使用 AI 生成

具体可参考这里
https://hackathonweekly.feishu.cn/wiki/NtPuwwDm2iVRd7kSRFpcRDVqnWd

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 开源协议

[MIT License](LICENSE)

## 致谢

- https://github.com/daijinhai/StayFocused ：我们使用了来自这个仓库整理的音频，它的音频来源于[Freesound](https://freesound.org/)，遵循 Creative Commons 许可协议
- https://github.com/jackiexiao/next-shadcn-template：我们基于这个代码模板进行了修改


## 微信公众号

![微信公众号二维码](./public/wechat_qrcode.jpg)

## 微信登录配置指南

本项目支持两种微信登录方式：
1. 微信内浏览器一键登录（公众号网页授权）
2. 其他浏览器扫码登录（开放平台扫码登录）

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
```

## 功能说明

### 微信登录功能

本项目实现了微信登录功能，支持以下场景：

1. 微信内浏览器 - 一键授权登录
2. PC浏览器 - 扫码登录
3. 移动端非微信浏览器 - 引导用户在微信中打开

### 隐私政策弹窗

隐私政策弹窗组件(`PrivacyPolicyDialog`)用于在用户登录前展示用户协议和隐私条款。内容包括：

- 使用微信登录时允许网站获取的用户信息(昵称、头像)
- 数据使用说明
- 登录授权说明

使用方法：
```jsx
import { PrivacyPolicyDialog } from "@/components/privacy-policy-dialog";

// 在组件中使用
<PrivacyPolicyDialog />

// 自定义触发文本
<PrivacyPolicyDialog trigger="查看用户协议" />
```

当用户点击"用户协议"链接时，将弹出包含隐私声明的对话框。