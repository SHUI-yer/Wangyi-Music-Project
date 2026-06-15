# 👥 实训项目团队分工表

| 成员 | 角色 | 核心职责 | 交付产物 |
| :--- | :--- | :--- | :--- |
| **成员 A (组长)** | 架构师 / 核心开发 | 负责项目整体架构设计、Pinia 全局状态中心构建、音频引擎逻辑重构。 | `stores/player.js`, `composables/useAudio.js` |
| **成员 B** | 前端开发 (UI/UX) | 负责侧边栏导航、顶栏搜索区及底部播放栏的经典风格还原与组件拆分。 | `App.vue`, `components/player/*` |
| **成员 C** | 业务逻辑开发 | 负责首页发现音乐、歌单详情页、朋友动态等核心业务页面的开发。 | `views/Home.vue`, `views/Playlist.vue`, `views/Friends.vue` |
| **成员 D** | 数据与资源管理 | 负责 Mock API 接口设计、本地 20 首音频资源映射及搜索逻辑实现。 | `api/music.js`, `public/media/*` |
| **成员 E** | QA 与文档工程 | 负责项目稳定性测试、内存泄漏分析、实训日志编写及最终答辩报告。 | `docs/*`, `README.md`, `debug-logs` |

---

### 🛠️ 团队协作标准
- **版本控制**：遵循组件化开发规范，确保各模块解耦。
- **技术规范**：统一使用 Vue 3 Composition API 与 Tailwind CSS。
- **状态同步**：所有业务逻辑必须通过 Player Store 进行状态分发。
