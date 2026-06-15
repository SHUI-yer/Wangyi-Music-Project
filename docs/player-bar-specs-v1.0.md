# 🎧 网易云音乐仿站项目

# 播放条（Player Bar）功能需求说明文档（V1.0）

---

# 一、📌 文档目的

本文档定义了“网易云音乐仿站系统”中核心组件——**播放条（Player Bar）**的标准规范。播放条作为全站状态最复杂、交互最密集的组件，需遵循本规范以实现工业级的音频控制体验。

---

# 二、🎧 核心功能要求

## 1. 基础播放能力
* **▶️ 播放 / 暂停**：实时响应音频状态。
* **⏭ 下一首 / ⏮ 上一首**：支持列表循环跳转。
* **🔁 循环模式切换**：
  * **顺序播放 (Sequence)**：按列表顺序播放。
  * **单曲循环 (Loop)**：重复播放当前歌曲。
  * **随机播放 (Random)**：打乱顺序播放。

## 2. 音频控制能力
* **🔊 音量调节**：0% ~ 100% 线性调节，支持持久化。
* **🎚 进度拖动 (Seek)**：支持精准跳转，拖拽时 UI 不抖动。
* **⏱ 时间展示**：实时显示“当前时间 / 总时长”。

## 3. 歌曲信息展示
* **封面图**：展示当前播放歌曲的 Album Art。
* **元数据**：显示歌曲名、歌手名。
* **加载反馈**：音频缓冲（Buffering）时显示 Loading 状态。

---

# 三、🧠 状态管理规范 (Pinia)

## 🎯 核心状态结构 (playerStore)
```ts
state: {
  currentTrack: Track | null,
  queue: Track[],
  currentIndex: number,
  isPlaying: boolean,
  currentTime: number,
  duration: number,
  volume: number,
  playMode: 'sequence' | 'loop' | 'random',
  isBuffering: boolean
}
```

## ⚠️ 架构原则
* **单例模式**：全局仅允许存在一个 HTML5 Audio 实例。
* **路由无关性**：切换页面时播放不中断。
* **单向数据流**：UI 事件 → Store Action → Audio Engine → Store Update → UI Sync。

---

# 四、🎮 交互体验规范

## 1. 进度条 (ProgressBar)
* **拖拽防抖**：拖动时暂停 `timeupdate` 对 UI 的更新。
* **松手同步**：拖动结束后再触发 `audio.currentTime` 的修改。
* **缓冲进度**：支持展示已下载的音频缓冲条（可选）。

## 2. 全局快捷键
* **空格 (Space)**：切换播放/暂停状态。

---

# 五、📐 组件拆分建议

为提高可维护性，PlayerBar 容器应拆分为：
1. **SongInfo.vue**：左侧歌曲信息及封面。
2. **Controls.vue**：中央控制按钮区。
3. **ProgressBar.vue**：进度条逻辑。
4. **VolumeControl.vue**：右侧音量及播放列表入口。

---

# 六、⚠️ 异常处理

* **加载失败**：自动切换至备用 URL 或提示用户。
* **资源 404**：自动跳过当前歌曲，尝试播放下一首。
* **网络中断**：记录当前进度，恢复后尝试重连。
