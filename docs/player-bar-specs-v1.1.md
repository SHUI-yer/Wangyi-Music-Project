# 🎧 网易云音乐仿站项目

# 播放条（Player Bar）业务逻辑与组件设计规范（V1.1）

---

# 一、📌 整体结构

播放条采用标准音乐播放器布局，分为三块核心区域：
1. **左侧：歌曲信息区** —— 封面、标题、歌手、收藏状态。
2. **中间：播放控制 + 进度条** —— 核心播放行为、时间同步、模式切换。
3. **右侧：功能控制区** —— 音量管理、歌词控制、播放列表入口。

---

# 二、🧠 核心状态与单向数据流

所有控件必须依赖同一个全局 `playerStore`，并遵循：
> **UI 事件 → Pinia Store → Audio Engine → Store 回写 → UI 更新**

---

# 三、🎵 控件业务逻辑要求

## 1. 歌曲信息 (SongInfo)
* **联动跳转**：点击歌曲名/封面跳转至歌单或歌曲详情。
* **状态同步**：随 `currentTrack` 实时更新，切歌时需处理 UI 切换的平滑度。

## 2. 播放控制 (PlayControls)
* **状态切换**：`togglePlay()` 负责 Audio 的 `play()` 与 `pause()`。
* **切歌算法**：
  * **Random**：使用随机索引从 `queue` 中选取。
  * **Sequence/Loop**：按索引加减。
* **边界处理**：列表为空时禁用按钮。

## 3. 进度条与时间 (ProgressBar / TimeDisplay)
* **冻结机制 (Crucial)**：
  * `onDragStart`：设置 `isDragging = true`，停止接收来自 Audio 的 `timeupdate`。
  * `onDragging`：仅更新 UI 层的数值。
  * `onDragEnd`：执行 `audio.seek(time)`，并恢复进度同步。
* **格式化**：统一使用 `00:00 / 00:00` 格式。

## 4. 音量控制 (VolumeControl)
* **记忆逻辑**：引入 `lastVolume` 状态。
* **一键静音**：点击音量图标，若未静音则 `lastVolume = currentVolume; currentVolume = 0`；若已静音则恢复 `lastVolume`。

---

# 四、🔊 Audio 核心行为监听

必须监听 HTML5 Audio 的以下关键事件：
1. **timeupdate**：更新 `currentTime`，驱动进度条（非拖拽状态下）。
2. **ended**：
   * `loop` 模式：重置进度并重新播放。
   * `single` 模式：重播当前歌曲。
   * `sequence/random` 模式：调用 `nextSong()`。
3. **loadedmetadata**：获取音频总时长 `duration`。
4. **error**：实现资源兜底，自动跳过错误歌曲并通知 UI。

---

# 五、🧩 组件拆分规范

项目应按照以下粒度进行 Vue 组件拆分：
* `PlayerBar.vue` (Container)
* `SongInfo.vue` (Left)
* `PlayControls.vue` (Middle Buttons)
* `ProgressBar.vue` (Progress Logic)
* `TimeDisplay.vue` (Time Text)
* `VolumeControl.vue` (Right Volume)
* `ModeSwitch.vue` (Play Mode)
* `PlaylistButton.vue` (List Access)
