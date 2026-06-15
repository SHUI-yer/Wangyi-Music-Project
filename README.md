# 网抑云深夜emo - 沉浸式音乐播放器

本项目是根据《前端程序设计实训任务书》要求开发的高标准仿网易云音乐 Web 项目。现已全面升级为 **“网抑云深夜emo”** 沉浸式版本，集成了黑胶唱片旋转动效、智能元数据识别、大文件上传等工业级功能。

## 🌟 核心特性

- **🎬 沉浸式黑胶播放页**：点击播放栏左侧封面，即可进入仿 QQ 音乐/网易云的沉浸式界面，享受黑胶旋转与唱针摆动的视觉盛宴。
- **🕙 动态深夜电台**：私人 FM 界面集成实时毛玻璃数字时钟，打造专属的深夜听歌氛围。
- **🧬 智能元数据识别**：
  - **文件名识别**：自动根据文件名（歌手 - 歌名）填充信息。
  - **ID3 深度解析**：支持从 MP3 文件内部提取 **标题、歌手、专辑、封面图**，解决中文乱码。
- **📁 工业级库管理**：
  - **本地库上传**：支持大文件（100MB+）串行稳定上传，永久存储至服务器。
  - **分类扫描**：自动识别 `rock`, `pop`, `chinese`, `jazz` 物理目录，实现“所见即所得”。
- **🎧 极致播放体验**：单曲循环、列表循环、随机播放完整逻辑，支持拖拽跳转与音量实时调节。

## 🚀 快速启动 (克隆必看)

本项目已实现 **“零配置一键启动”**，适合在不同电脑间快速迁移测试。

### 1. Windows 用户 (最简推荐)
直接双击根目录下的 **`start.bat`**。
脚本会自动完成：
- 检查 Node.js 环境。
- 自动安装缺失的 `node_modules` 依赖。
- 启动开发服务器并自动打开浏览器。

### 2. Linux / macOS 用户
在终端执行：
```bash
chmod +x start.sh
./start.sh
```

### 3. 手动启动
```bash
cd apps/frontend
npm install
npm run dev
```

## 📂 目录结构说明

```text
Wangyi-Music-Project/
├── apps/
│   └── frontend/          # Vue3 前端核心
│       ├── public/media/  # 存放各类 MP3 音频 (rock/pop/local等)
│       ├── src/           # 源代码
│       └── start.bat      # 前端子项目启动脚本
├── docs/                  # 实训配套文档 (日志、分工、答辩)
├── .gitignore             # Git 提交忽略规则 (已配置支持媒体文件上传)
└── start.bat              # 根目录一键启动器 (推荐)
```

## 📝 实训文档参考

- **分工表**：[team-division.md](docs/team-division.md)
- **实训日志**：[daily-logs-14-days.md](docs/daily-logs-14-days.md)
- **答辩报告**：[defense-report.md](docs/defense-report.md)

## 🛠️ 技术栈

- **前端**：Vue 3 + Vite + Pinia + Vue Router
- **样式**：Tailwind CSS + Lucide Icons
- **后端 (Vite Middleware)**：Node.js + Busboy + music-metadata + iconv-lite
