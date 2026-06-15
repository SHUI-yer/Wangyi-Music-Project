# 🎧 网易云音乐仿站项目

# 功能缺失与系统完善需求说明（V1.0）

---

# 一、📌 文档目的

本文档用于说明当前“网易云音乐仿站系统（Vue3 + Pinia + Vite）”在**已完成UI与基础播放功能之后**存在的核心业务缺失，并定义后续开发应补齐的：

* 数据流规范
* 播放器核心逻辑
* 状态管理机制
* 组件交互规则
* 异常与兜底机制

---

# 二、📊 当前系统完成情况评估

## ✅ 已完成部分

### 1. UI层

* 网易云风格布局（侧边栏 + 顶栏 + 内容区）
* 歌单展示页
* 推荐音乐卡片
* 基础播放器底栏UI

---

### 2. 基础播放能力

* audio 播放/暂停
* 简单进度条
* 音量控制（基础版本）
* 本地/在线音频播放支持

---

### 3. 技术架构

* Vue 3 + Vite
* Pinia 状态管理
* Vue Router 页面路由
* Composition API

---

## ❌ 当前缺失核心能力（重点）

系统目前存在“UI与播放逻辑割裂”的问题，主要缺失如下：

---

# 三、🚨 核心功能缺失清单

---

# 3.1 🎵 播放队列系统（Playlist Engine）

## ❌ 问题

当前系统缺乏统一播放队列管理，无法支持：

* 连续播放
* 自动切歌
* 播放列表管理
* 顺序控制

---

## ✅ 必须新增能力

### 🎯 播放队列结构

```ts
playlist: Song[]
currentIndex: number
```

---

### 🎯 支持能力

* 添加歌曲到队列
* 替换整个播放列表
* 获取当前歌曲
* 上一首 / 下一首
* 自动播放下一曲

---

### 🎯 播放模式

```ts
type PlayMode = 'sequence' | 'loop' | 'random'
```

---

# 3.2 🎧 音频引擎（Audio Engine）

## ❌ 问题

当前 audio 控制分散在组件中，存在：

* 状态不可控
* UI不同步
* 播放状态错乱风险

---

## ✅ 必须重构为统一引擎

### 🎯 useAudio 规范

必须封装以下能力：

```ts
play()
pause()
load(song)
seek(time)
setVolume(v)
```

---

### 🎯 必须监听事件

```ts
onended → 自动切歌
ontimeupdate → 更新进度条
onerror → 资源兜底处理
onloadstart → loading状态
```

---

# 3.3 🧠 播放状态中心（Pinia Store）

## ❌ 当前问题

状态分散在组件 + audio + UI之间

---

## ✅ 必须统一为 playerStore

### 🎯 标准结构

```ts
state: {
  playlist: Song[]
  currentIndex: number

  isPlaying: boolean
  currentTime: number
  duration: number

  volume: number
  playMode: PlayMode

  loading: boolean
}
```

---

### 🎯 必须提供 actions

```ts
play()
pause()
next()
prev()
setSong(index)
setPlayMode()
updateTime()
```

---

# 3.4 🔄 UI与状态同步机制

## ❌ 当前问题

存在以下风险：

* UI播放按钮与真实音频状态不一致
* 切歌后底栏未更新
* 进度条卡死

---

## ✅ 必须建立单向数据流

### 🎯 数据流规则

```
UI事件 → Pinia Store → Audio Engine → Store回写 → UI更新
```

---

### 🎯 禁止行为

❌ 组件直接操作 audio.play()
❌ 组件直接修改 DOM audio 状态
❌ UI单独维护播放状态

---

# 3.5 📡 API 数据层规范（必须补齐）

## ❌ 当前问题

API层未统一规范，存在 mock 与真实数据混用风险

---

## ✅ 标准接口结构

```ts
{
  code: 0,
  message: "success",
  data: any
}
```

---

## 🎯 必须模块

* song API
* playlist API
* search API
* recommend API

---

# 3.6 💾 状态持久化（缺失）

## ❌ 当前问题

刷新页面后播放器状态丢失

---

## ✅ 必须实现

持久化字段：

* 当前播放歌曲
* 播放列表
* 播放模式
* 音量
* 最近播放记录

---

## 🎯 实现方式

* localStorage
* 或 Pinia persist plugin

---

# 3.7 ⚠️ 异常处理与兜底机制

## ❌ 当前问题

没有完整错误处理体系

---

## ✅ 必须补齐

### 🎯 音频异常

* 加载失败 → fallback音源
* 404 → 自动跳过
* 播放中断 → 自动恢复

---

### 🎯 UI异常

* 空播放列表提示
* 无歌曲状态UI
* loading状态动画

---

# 四、📐 标准组件职责划分（必须统一）

---

## 🎧 PlayerStore（唯一状态中心）

负责：

* 播放状态
* 播放列表
* 当前歌曲

---

## 🎼 useAudio（唯一音频控制）

负责：

* audio DOM控制
* 播放逻辑
* 事件监听

---

## 🎛 BottomPlayer（UI控制层）

负责：

* 显示状态
* 用户交互
* 调用 store actions

---

## 📀 PlaylistView

负责：

* 列表展示
* 点击播放
* 当前歌曲高亮

---

# 五、📊 系统目标升级标准

完成本需求后系统应达到：

## 🎯 1. 状态一致性

UI = Store = Audio 100%同步

---

## 🎯 2. 播放器工业级能力

* 自动切歌
* 播放模式
* 错误恢复

---

## 🎯 3. 架构清晰

* UI层纯展示
* Store统一状态
* Audio独立引擎

---

## 🎯 4. 可扩展性

可直接扩展：

* VIP系统
* 登录系统
* 云音乐API接入
* 推荐算法

---

# 六、📌 总结一句话

当前系统最大问题：

> UI已经完成，但“播放器系统还没有形成真正的状态闭环”

本次改造目标：

> 从“页面级播放器”升级为“状态驱动的音乐引擎系统”
