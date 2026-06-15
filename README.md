# 网易云音乐仿站项目 (Netease Music Mimic)

本项目是根据《前端程序设计实训任务书》要求开发的仿网易云音乐 Web 项目。采用 **Vue 3 + Vite + Pinia** 技术栈，实现了大厂标准的音乐播放体验及完整的实训配套文档。

## 🚀 项目亮点

- **经典视觉还原**：深度还原网易云音乐官方红、白、灰配色体系，经典侧边栏布局。
- **工业级播放引擎**：
  - 支持 **播放/暂停、切歌、进度条拖拽跳转、音量调节**。
  - **自动连播逻辑**：当前歌曲播放结束自动切换下一首。
  - **智能加载反馈**：支持音频缓冲状态检测。
  - **回退机制**：优先加载本地 `/public/media/song.mp3`，失败则自动切换在线测试音频。
- **全功能页面**：包含 首页、歌单详情、搜索中心、排行榜、每日推荐、个人中心等 6 大核心页面。
- **实训交付保障**：内置符合要求的 14 天实训日志、5 人分工表及答辩报告。

## 📂 目录结构

```text
netease-music-vue/
├── apps/
│   └── frontend/          # 前端 Vue 项目核心
│       ├── public/media/  # 放置你的 MP3 音频文件 (建议重命名为 song.mp3)
│       └── src/
│           ├── api/       # 模拟数据接口
│           ├── components/# 布局与业务组件
│           ├── composables/# 音频控制引擎 (useAudio.js)
│           ├── stores/    # Pinia 状态管理 (player.js)
│           └── views/     # 页面组件
├── docs/                  # 实训配套文档 (日志、分工、答辩)
└── start.bat              # 一键启动脚本 (已优化乱码与路径问题)
```

## 🛠️ 如何开始

1. **准备音频**：
   将你的 MP3 音乐文件放入 `apps/frontend/public/media/` 目录下，并重命名为 `song.mp3`。
2. **启动项目**：
   双击根目录下的 `start.bat`。
3. **访问地址**：
   在浏览器打开启动后显示的地址（通常是 `http://localhost:5173`）。

## 📝 实训文档参考

- **分工表**：[team-division.md](docs/team-division.md)
- **实训日志**：[daily-logs-14-days.md](docs/daily-logs-14-days.md)
- **答辩报告**：[defense-report.md](docs/defense-report.md)

## ⚖️ 技术栈

- **框架**：Vue 3 (Composition API)
- **构建**：Vite
- **状态**：Pinia
- **路由**：Vue Router (Hash Mode)
- **样式**：Tailwind CSS
- **图标**：Lucide Vue Next
