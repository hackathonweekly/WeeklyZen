# 冥想页面组件

本目录包含冥想页面的所有组件和工具。为了提高代码的可维护性和可读性，我们将原来的单一大型组件拆分为多个小型组件。

## 组件结构

```
app/meditation/
├── components/
│   ├── AudioController.tsx    # 音频控制组件
│   ├── GuidanceSelector.tsx   # 引导语选择组件
│   ├── MeditationPage.tsx     # 主页面组件
│   ├── MeditationTimer.tsx    # 冥想计时器组件
│   ├── SettingsPanel.tsx      # 设置面板组件
│   ├── SoundSelector.tsx      # 音效选择组件
│   └── index.ts               # 组件导出索引
├── utils/
│   └── AudioUtils.ts          # 音频处理工具
└── page.tsx                   # 页面入口
```

## 组件说明

### MeditationPage

主页面组件，负责组织和协调其他子组件，管理全局状态。

### AudioController

音频控制组件，负责处理音频播放、暂停、音量控制等功能。

### MeditationTimer

冥想计时器组件，负责显示和控制冥想时间，包括播放/暂停、重置等功能。

### SoundSelector

音效选择组件，负责显示和选择不同类别的背景音效。

### GuidanceSelector

引导语选择组件，负责显示和选择不同的冥想引导语。

### SettingsPanel

设置面板组件，负责显示和控制冥想时长和其他设置。

### AudioUtils

音频处理工具类，负责处理音频加载、播放和停止等功能。

## 使用方法

```tsx
import { MeditationPage } from './components';

export default function Page() {
  return <MeditationPage />;
}
```

## 状态管理

主要状态由 MeditationPage 组件管理，包括：

- 冥想时长
- 播放状态
- 音效选择
- 引导语选择
- 音量控制

子组件通过 props 接收状态和回调函数，实现与主组件的通信。

## 音频处理

音频处理主要通过 AudioUtils 工具类和 Web Audio API 实现，包括：

- 背景音效播放
- 引导语音频播放
- 结束音效播放
- 音量控制

## 注意事项

1. 组件卸载时需要清理所有音频资源和计时器
2. 路由跳转前需要停止所有音频播放
3. 引导语需要至少10分钟的冥想时间 