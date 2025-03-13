# WeeklyZen | 周周冥想

WeeklyZen（周周冥想）是一个专注于冥想练习的网站，为创客和开发者提供一个简单、可持续的冥想空间。本项目基于 Next.js 15 (App Router)、Shadcn UI、Tailwind CSS 和 Framer Motion 构建。

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
│   ├── introduction/   # 冥想入门页面
│   ├── meditation/     # 冥想练习页面
│   ├── theme-demo/     # 主题演示页面
│   └── page.tsx        # 首页
├── components/         # 组件
│   ├── breathing-animation.tsx  # 呼吸动画组件
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

2024 © WeeklyZen | 周周冥想小组

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
