# 专门适配 Cursor / WindSurf 网站模板

这是一个专门适配 AI 编辑器（Cursor / WindSurf ） 中文网站模板，方便新手快速基于 AI 开发出自己的网站

## 基于此模板开发的 AI 项目案例
> 下面的案例都可以在 0.5 ~ 1 小时之内复现

- [周周黑客松网站-现代简洁风](https://hackweek.pages.dev/)
- [周周黑客松网站-终端风格](https://terminal-style.hackweek.pages.dev/)
- [美颜补光灯](https://buguangdeng.vercel.app/ringlight)

你还可以用它开发更多有趣的网站！ 比如公司、产品官网 / 个人博客 / 小游戏 / 小工具等等

## 特性

- 适配 Cursor / WindSurf
  - 内置合适的代码 prompt: `.cursorrules`  和 `.windsurfrules` （默认使用中文）
- 一键部署到 Vercel 或者 Cloudflare Pages
- 推荐 VSCode 扩展，打开项目时会推荐安装
- ⚡️ 使用主流的 Web 开发技术栈 Next.js 15 和 App Router
- 🎨 集成 Shadcn UI 组件
- 🎭 Tailwind CSS 样式系统
- 📱 响应式设计
- 🌙 深色模式支持
- 🔍 SEO 优化
- 📊 内置分析支持
- 🚀 快速页面加载
- 🛠️ 易于定制
- 📦 生产环境就绪

## 快速开始

```bash
# 克隆仓库 或者 在 Github 网站中下载 zip 代码文件
git clone https://github.com/jackiexiao/next-shadcn-template.git

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 部署

一键部署到 Vercel
```bash
npm run deploy
```

或者 Cloudflare Pages：

```bash
npm run cf:deploy
```

## 推荐的 VSCode 扩展

为获得最佳开发体验， 首次打开本项目时会自动推荐安装下列扩展，请点击安装

- Vscode 中文翻译：中文翻译
- 🎨 Tailwind CSS IntelliSense：智能 CSS 提示
- 📝 PostCSS Language Support：PostCSS 语言支持
- ✨ Prettier：代码格式化
- 🔍 ESLint：代码检查
- 🏷️ Auto Rename Tag：自动重命名标签
- 📖 Code Spell Checker：拼写检查
- 🎯 Error Lens：错误提示增强
- 📊 Import Cost：导入成本显示
- 🛠️ Path Intellisense：路径智能提示
- 🔧 Pretty TypeScript Errors：优化 TS 错误显示
- 🧵 Template String Converter：模板字符串转换

## 开发技巧

1. 自定义组件：
   - 在 `components/ui` 中查看基础组件
   - 在 `components/` 中添加新组件
   - 在 `app/globals.css` 中修改主题

## 参考文档
> 推荐有时间的小伙伴仔细阅读下面的文档，虽然是英文的，但你可以很容易使用翻译插件（如豆包、谷歌翻译） 一键翻译为中文查看

- [WindSurf 文档](https://docs.codeium.com/getstarted/overview)
- [Cursor 文档](https://docs.cursor.com/get-started/migrate-from-vscode)

## 解释

```
.npmrc:          # npm 配置文件
package.json:   # 项目配置文件
```

## 原则
- `.npmrc`
  - 尽可能隐藏 warning，比如在 npm install / build 时，这样对小白更友好一些
  - 尽可能使用国内镜像源，加快下载速度
- `shadcn-ui`
  - 默认安装了全部组件，尽管会增加依赖，但这样小白使用起来更方便

## 许可证

MIT 许可证 - 您可以将此模板用于任何项目！

## 贡献

欢迎贡献！请随时提交 Pull Request。
