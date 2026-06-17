import { defineStore } from 'pinia'

const STORAGE_KEY = 'netease_player_state'

export const usePlayerStore = defineStore('player', {
  state: () => {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const queue = savedState.queue || []
    const currentIndex = savedState.currentIndex ?? -1
    let currentTrack = savedState.currentTrack || null

    // 关键修复：确保 currentTrack 和 queue[currentIndex] 引用同一个对象，避免更新不同步
    if (currentIndex !== -1 && queue[currentIndex] && currentTrack) {
      if (queue[currentIndex].url === currentTrack.url) {
        currentTrack = queue[currentIndex]
      }
    }

    return {
      currentTrack,
      queue,
      currentIndex,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: savedState.volume ?? 70,
      lastVolume: savedState.volume ?? 70,
      isMuted: false,
      playMode: savedState.playMode || 'sequence', // sequence, loop, random
      isDragging: false,
      isBuffering: false,
      recentTracks: savedState.recentTracks || [],
      favorites: savedState.favorites || [],
      localTracks: [],
      playbackTrigger: 0, // Used to force restart same track
      isFullscreen: false,
      // 全局播放历史：记录所有模式下依次播放的歌曲在 queue 中的索引
      playHistory: [],
      playHistoryIndex: -1,
      // Toast 提示
      toastMessage: '',
      toastVisible: false
    }
  },

  getters: {
    currentProgress: (state) => {
      if (!state.duration) return 0
      return (state.currentTime / state.duration) * 100
    },
    isFavorite: (state) => {
      return (track) => {
        if (!track) return false
        return state.favorites.some(t => t.id === track.id || t.url === track.url)
      }
    }
  },

  actions: {
    // --- Playback Controls ---
    setTrack(track, newQueue = []) {
      if (newQueue && newQueue.length > 0) {
        this.queue = [...newQueue]
      }

      const index = this.queue.findIndex(t => t.id === track.id || t.url === track.url)

      if (index !== -1) {
        this.currentIndex = index
      } else {
        // If not in queue, add it to the beginning of the queue
        this.queue.unshift(track)
        this.currentIndex = 0
      }

      this.currentTrack = this.queue[this.currentIndex]
      this.playbackTrigger++
      this.isPlaying = true
      this.addToRecent(this.currentTrack)

      // 新选歌曲时，重置播放历史为当前歌曲
      this.playHistory = [this.currentIndex]
      this.playHistoryIndex = 0

      this.saveState()

      // 关键：立即找回当前歌曲封面，并启动全队列异步补全
      this.rehydrateCurrentTrack()
      this.rehydrateQueue()
    },

    addToRecent(track) {
      if (!track) return
      // 如果已在列表中，保持原位不动，避免顺序变化
      const exists = this.recentTracks.some(t => t.id === track.id || t.url === track.url)
      if (exists) return
      // 只有新歌才添加到列表顶部
      this.recentTracks.unshift(track)
      if (this.recentTracks.length > 20) {
        this.recentTracks.pop()
      }
    },

    togglePlay() {
      if (!this.currentTrack && this.queue.length > 0) {
        this.setTrack(this.queue[0])
      } else {
        this.isPlaying = !this.isPlaying
        this.saveState()
      }
    },

    next() {
      if (this.queue.length === 0) return

      // 如果当前不在历史末尾，直接前进到历史中的下一首
      if (this.playHistoryIndex < this.playHistory.length - 1) {
        this.playHistoryIndex++
        this.currentIndex = this.playHistory[this.playHistoryIndex]
      } else {
        // 在历史末尾，根据播放模式决定下一首
        if (this.playMode === 'random') {
          if (this.queue.length > 1) {
            let nextIndex = this.currentIndex
            while (nextIndex === this.currentIndex) {
              nextIndex = Math.floor(Math.random() * this.queue.length)
            }
            this.playHistory.push(nextIndex)
            this.playHistoryIndex = this.playHistory.length - 1
            this.currentIndex = nextIndex
          }
        } else if (this.playMode === 'loop') {
          // 单曲循环：手动下一首停留在同一首
        } else {
          // 顺序/列表循环
          this.currentIndex = (this.currentIndex + 1) % this.queue.length
          this.playHistory.push(this.currentIndex)
          this.playHistoryIndex = this.playHistory.length - 1
        }
      }

      this.playbackTrigger++
      this.currentTrack = this.queue[this.currentIndex]
      this.isPlaying = true
      this.addToRecent(this.currentTrack)
      this.saveState()

      // 关键修复：切歌后立即检查并找回当前封面
      this.rehydrateCurrentTrack()
    },

    prev() {
      if (this.queue.length === 0) return

      if (this.playHistoryIndex <= 0) {
        // 已经是所有播放历史的第一首，无法回溯
        this.showToast('已经是第一首了')
        return
      }
      // 回溯到历史中的上一首
      this.playHistoryIndex--
      this.currentIndex = this.playHistory[this.playHistoryIndex]

      this.playbackTrigger++
      this.currentTrack = this.queue[this.currentIndex]
      this.isPlaying = true
      this.addToRecent(this.currentTrack)
      this.saveState()

      // 关键修复：切歌后立即检查并找回当前封面
      this.rehydrateCurrentTrack()
    },

    updateProgress(time) {
      if (!this.isDragging) {
        this.currentTime = time
      }
    },

    // --- Volume Controls ---
    setVolume(val) {
      this.volume = val
      this.isMuted = val === 0
      if (val > 0) this.lastVolume = val
      this.saveState()
    },

    toggleMute() {
      if (this.isMuted) {
        this.volume = this.lastVolume
        this.isMuted = false
      } else {
        this.lastVolume = this.volume
        this.volume = 0
        this.isMuted = true
      }
      this.saveState()
    },

    // --- State Management ---
    setPlayMode(mode) {
      this.playMode = mode
      this.saveState()
    },

    showToast(message, duration = 2000) {
      this.toastMessage = message
      this.toastVisible = true
      clearTimeout(this._toastTimer)
      this._toastTimer = setTimeout(() => {
        this.toastVisible = false
      }, duration)
    },

    toggleFavorite(track) {
      if (!track) return
      const index = this.favorites.findIndex(t => t.id === track.id || t.url === track.url)
      if (index !== -1) {
        this.favorites.splice(index, 1)
      } else {
        this.favorites.unshift(track)
      }
      this.saveState()
    },

    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
    },

    // --- Data Rehydration (Fix Missing Covers) ---
    async rehydrateCurrentTrack() {
      // 识别是否为占位图 (SVG 占位符或 Trae AI 生成的模拟图)
      const isPlaceholder = (url) => {
        if (!url) return true
        return url.startsWith('data:image/svg+xml') || url.includes('trae.ai/api/ide/v1/text_to_image')
      }

      if (!this.currentTrack || !isPlaceholder(this.currentTrack.cover)) return

      try {
        // 根据 URL 尝试从后端重新扫描获取元数据
        let scanUrl = '/api/scan-media'
        const trackUrl = this.currentTrack.url

        if (trackUrl.includes('/playlists/')) {
          const parts = trackUrl.split('/')
          const playlistId = parts[parts.indexOf('playlists') + 1]
          scanUrl = `/api/scan-media?playlistId=${playlistId}`
        } else if (trackUrl.includes('/media/')) {
          const parts = trackUrl.split('/')
          const mediaIndex = parts.indexOf('media')
          if (parts.length > mediaIndex + 2) {
            const category = parts[mediaIndex + 1]
            scanUrl = `/api/scan-media?category=${category}`
          }
        }

        const response = await fetch(scanUrl)
        const localFiles = await response.json()

        // 匹配 URL 寻找完整的元数据（包含封面）
        const currentUrlDecoded = decodeURIComponent(this.currentTrack.url)
        const fullData = localFiles.find(f => decodeURIComponent(f.url) === currentUrlDecoded)

        if (fullData && fullData.cover) {
          console.log('Successfully rehydrated track cover for:', this.currentTrack.name)
          this.currentTrack.cover = fullData.cover
          // 同时也更新队列中的数据
          if (this.currentIndex !== -1 && this.queue[this.currentIndex]) {
            this.queue[this.currentIndex].cover = fullData.cover
          }
        }
      } catch (err) {
        console.warn('Failed to rehydrate track data:', err)
      }
    },

    // 补全整个播放队列的封面
    async rehydrateQueue() {
      if (this.queue.length === 0) return

      const isPlaceholder = (url) => {
        if (!url) return true
        return url.startsWith('data:image/svg+xml') || url.includes('trae.ai/api/ide/v1/text_to_image')
      }

      const tracksToFix = this.queue.filter(t => isPlaceholder(t.cover))
      if (tracksToFix.length === 0) return

      console.log(`Proactively rehydrating ${tracksToFix.length} tracks in queue...`)

      // 按文件夹分组，减少 API 调用次数
      const groups = {}
      tracksToFix.forEach(t => {
        let scanUrl = '/api/scan-media'
        if (t.url.includes('/playlists/')) {
          const parts = t.url.split('/')
          const playlistId = parts[parts.indexOf('playlists') + 1]
          scanUrl = `/api/scan-media?playlistId=${playlistId}`
        } else if (t.url.includes('/media/')) {
          const parts = t.url.split('/')
          const mediaIndex = parts.indexOf('media')
          if (parts.length > mediaIndex + 2) {
            const category = parts[mediaIndex + 1]
            scanUrl = `/api/scan-media?category=${category}`
          }
        }
        if (!groups[scanUrl]) groups[scanUrl] = []
        groups[scanUrl].push(t)
      })

      for (const scanUrl in groups) {
        try {
          const response = await fetch(scanUrl)
          const localFiles = await response.json()

          groups[scanUrl].forEach(track => {
            const decodedUrl = decodeURIComponent(track.url)
            const fullData = localFiles.find(f => decodeURIComponent(f.url) === decodedUrl)
            if (fullData && fullData.cover) {
              track.cover = fullData.cover
              // 额外的安全检查：如果这个 track 就是当前播放的歌曲，确保 currentTrack 也更新
              if (this.currentTrack && (this.currentTrack.id === track.id || this.currentTrack.url === track.url)) {
                this.currentTrack.cover = fullData.cover
              }
            }
          })
        } catch (e) {
          console.warn('Batch rehydration failed for:', scanUrl)
        }
      }
    },

    saveState() {
      // 持久化时移除巨大的 base64 封面数据，避免 localStorage 溢出（5MB 限制）
      // 如果是正常的 URL 则保留，确保刷新后能显示封面
      const stripLargeCover = (track) => {
        if (!track) return track
        const { cover, ...rest } = track
        // 如果是以 data: 开头的 base64 字符串且长度较大，则移除
        if (cover && cover.startsWith('data:') && cover.length > 1024) {
          return rest
        }
        return track
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentTrack: stripLargeCover(this.currentTrack),
        queue: this.queue.map(stripLargeCover),
        currentIndex: this.currentIndex,
        volume: this.volume,
        playMode: this.playMode,
        recentTracks: this.recentTracks.map(stripLargeCover),
        favorites: this.favorites.map(stripLargeCover)
      }))
    }
  }
})