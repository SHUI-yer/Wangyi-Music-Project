# 网易云音乐仿制项目 - 架构与核心逻辑文档

这份文档记录了本项目（Vue 3 + Vite + Pinia + TailwindCSS）的核心架构、组件划分、业务逻辑流以及曾踩过的关键坑位。主要用于后续的二次开发、Bug 排查和功能扩展参考。

---

## 1. 项目基础架构

- **前端框架**: Vue 3 (Composition API, `<script setup>`)
- **构建工具**: Vite (配置了 alias、本地 server 和元数据解析插件)
- **状态管理**: Pinia (`usePlayerStore` 用于全局音乐播放状态同步)
- **样式方案**: Tailwind CSS (利用 `tailwind.config.js` 定制网易云微灰度+磨砂质感主题)
- **图标库**: `lucide-vue-next` (替代传统的 IconFont)
- **路由**: Vue Router (单页应用路由跳转)

---

## 2. 核心引擎与状态管理 (重点)

项目的核心是**“状态(Store)驱动引擎，引擎驱动原生 Audio”**的单向数据流设计。

### 2.1 全局状态仓库 (`src/stores/player.js`)
所有的播放状态都在这里管理，UI 组件只负责“读取状态”和“调用 Store 的 Action”，**绝不直接操作 Audio 实例**。
- **核心 State**: 
  - `currentTrack`: 当前播放歌曲的对象 (包含 url, name, artist, cover 等)
  - `queue`: 播放列表 / `currentIndex`: 当前索引
  - `isPlaying`: 播放/暂停状态
  - `currentTime` / `duration`: 进度和总时长
  - `playMode`: 播放模式 (`sequence` 列表循环, `loop` 单曲循环, `random` 随机播放)
- **核心 Actions**:
  - `setTrack(track, queue)`: 设定当前歌曲并替换播放列表，触发播放。
  - `next()` / `prev()`: 结合 `playMode` 计算下一首索引，并切歌。

### 2.2 全局音频引擎 (`src/composables/useAudio.js`)
这是整个项目最容易出 Bug、也是最核心的物理播放引擎层。
- **单例模式防泄漏**: 通过 `window.__NETEASE_AUDIO__` 挂载原生 `new Audio()`，确保在 Vite 的 HMR (热更新) 下不会生成多个 Audio 实例导致声音重叠。
- **状态监听同步 (Watchers)**: 
  - 监听 `player.currentTrack` 变更，同步修改 `audio.src` 并执行 `load()`。
  - 监听 `player.isPlaying` 变更，执行 `audio.play()` 或 `audio.pause()`。
- **事件反向同步 (Event Listeners)**:
  - 监听 `timeupdate` 和 `durationchange`，把进度同步回 Store，让 UI 进度条走动。
  - 监听 `ended`，触发 Store 的 `next()` 自动连播。
- **致命熔断机制 (`errorCount`)**: 如果连续发生多次音频加载报错，引擎会强制熔断（暂停），避免触发死循环。

---

## 3. 核心组件结构 (Component Tree)

### 3.1 骨架层 (`src/App.vue`)
- **Header**: 顶部导航，包含 Logo、搜索框、用户头像（含 `@error` 图片回退保护）。
- **Sidebar**: 左侧边栏路由菜单（发现音乐、私人FM、本地音乐等）。
- **Main**: 居中路由视图出口 `<router-view>`。
- **Footer**: 底部全局播放控制栏（永远常驻）。

### 3.2 播放器 UI 组件 (`src/components/player/*`)
- **`FullscreenPlayer.vue`**: 沉浸式仿黑胶播放界面。包含黑胶唱片旋转动画、大尺寸进度条/音量条，并与 `useAudio.js` 深度绑定 `seek` 拖拽事件。
- **`Controls.vue`**: 播放控制组（上一首、播放/暂停、下一首、模式切换）。
- **`ProgressBar.vue`**: 时间进度条。
- **`VolumeControl.vue`**: 音量与静音控制。
- **`SongInfo.vue`**: 左下角歌曲封面与基本信息展示。

### 3.3 路由视图 (`src/views/*`)
- **`User.vue` (本地音乐)**: 核心重业务区。负责本地 MP3 文件的读取、解析与列表渲染。
- **`Home.vue` (发现音乐)**: 展示推荐歌单与新碟，集成猜你喜欢模块，并在各个列表页中集成红心点赞功能。
- **`DailyMix.vue` (私人FM)**: 带有沉浸感背景和时钟的本地播放列表视图。
- **`Downloads.vue` (下载管理)**: 统一设计风格的下载管理页，支持本地音乐导入与批量删除，同时集成了红心点赞。
- **`History.vue` (最近播放)**: 扩展至 20 首记录的最近播放页，带有当前播放音轨跳动动画，支持一键清空与播放全部。
- **`Favorites.vue` (我喜欢的音乐)**: 跨页面联动的我喜欢的音乐集合页，带有红心呼吸动画，支持直接播放。
- **`Search.vue` (搜索页)**: 搜索结果页，同样集成了播放与红心收藏功能。

---

## 4. 关键业务逻辑解析

### 4.1 本地音乐解析与乱码修复 (Node.js + 浏览器端)
- **痛点**: 早期 MP3 文件的 ID3 标签编码混乱（GBK / Latin1 等），在浏览器中直接读取会产生乱码。
- **方案**:
  - 后端 (Vite Plugin): 引入 `music-metadata` 和 `jschardet`，在本地读取文件流时智能推断字符编码，并用 `iconv-lite` 统一转码为 UTF-8。
  - 前端: 从后端的扫描接口或本地选择文件时，读取已修正好的 Metadata（提取歌名、歌手、封面 Blob URL），封装为标准 Track 对象存入 Store。

### 4.2 进度条双向绑定防抖
- **痛点**: 音乐播放时进度条在往前走，此时用户拖拽进度条，如果不做防抖，进度条会来回乱跳。
- **方案**: 引入 `isDragging` 状态。当用户按下鼠标(`mousedown`)时 `isDragging = true`，此时忽略 Audio 的 `timeupdate` 同步；用户松开(`mouseup` / `change`)时，调用 `useAudio().seek(time)` 跳转物理音频时间，并恢复 `isDragging = false`。

### 4.3 跨页面红心点赞 (全局联动)
- **痛点**: 用户在某个列表点赞了歌曲，切换到其他页面时状态未同步。
- **方案**: 在 `usePlayerStore` 中引入 `favorites` 数组与 `isFavorite(track)` Getter。
  - 通过比对 `track.id` 或 `track.url`，在全局任意列表（包括首页、播放条、本地音乐、最近播放等）内动态渲染 `<Heart>` 图标的颜色。
  - 所有点赞数据被持久化到 `localStorage` 中。

---

## 5. 历史排雷记录 (Gotchas & Bug Fixes)

> **⚠️ 警告：在后续修改代码时，请务必注意以下历史深坑！**

1. **音频引擎多重监听死循环 (爆内存闪退)**
   - **症状**: 启动或切歌时，控制台疯狂输出报错，浏览器内存暴涨直到崩溃。
   - **根本原因**: `useAudio` 在多个组件中被引入，导致在 Vite HMR 或组件销毁重建时，挂载了多个互相冲突的 `watch` 监听器。一个触发 `play()`，另一个因冲突触发 `AbortError` 报错，报错逻辑又触发 `next()`，形成指数级请求风暴。
   - **解决方案**: 在 `useAudio.js` 中加入了 `watchersInitialized` 单例锁，确保所有的 `watch` 和原生 `addEventListener` 全局只被初始化一次；并在 `play().catch` 中对 `AbortError` 做静默忽略处理，不再强行修改播放状态。

2. **图片回退死循环 (CORS / 404 挂死主线程)**
   - **症状**: 找不到本地头像时，页面卡死。
   - **根本原因**: `img` 标签的 `@error` 绑定的回退图片如果是外部网络图片且同样加载失败（如网络不通），会无限触发 `@error` 事件。
   - **解决方案**: 在 `@error` 事件中加入 `dataset.errorHandled = 'true'` 标记，限制只允许回退一次。

3. **并发上传导致浏览器 OOM (内存溢出)**
   - **症状**: 批量导入 50MB 以上的音乐文件时，页面崩溃。
   - **根本原因**: 使用 `Promise.all` 发起大规模并发读取或请求。
   - **解决方案**: 将并发批量解析改为 `for...of` 串行执行，降低峰值内存占用。

4. **样式变量丢失 (Tailwind 隐形 Bug)**
   - **症状**: 页面上的文字和图标突然全部变成透明/隐形，排版正常但看不见内容。
   - **根本原因**: `main.js` 中丢失了 `import './styles/variables.css'`，导致 Tailwind 中的 `var(--primary-color)` 等 CSS 变量未被定义，计算为透明色。
   - **解决方案**: 确保全局 CSS 变量文件在入口处最先被加载。