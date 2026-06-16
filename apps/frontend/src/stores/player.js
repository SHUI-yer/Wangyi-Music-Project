import { defineStore } from 'pinia'

const STORAGE_KEY = 'netease_player_state'

export const usePlayerStore = defineStore('player', {
  state: () => {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

    return {
      currentTrack: savedState.currentTrack || null,
      queue: savedState.queue || [],
      currentIndex: savedState.currentIndex || -1,
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
      isFullscreen: false
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
      this.saveState()
    },

    addToRecent(track) {
      if (!track) return
      const index = this.recentTracks.findIndex(t => t.id === track.id)
      if (index !== -1) {
        this.recentTracks.splice(index, 1)
      }
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

      if (this.playMode === 'random') {
        // Real random logic: pick an index other than the current one if queue > 1
        if (this.queue.length > 1) {
          let nextIndex = this.currentIndex
          while (nextIndex === this.currentIndex) {
            nextIndex = Math.floor(Math.random() * this.queue.length)
          }
          this.currentIndex = nextIndex
        }
      } else if (this.playMode === 'loop') {
        // Single track loop: manual next stays on the same track
        // We don't change currentIndex
      } else {
        // Sequence/List loop: go to next, loop back to start if at end
        this.currentIndex = (this.currentIndex + 1) % this.queue.length
      }

      this.playbackTrigger++
      this.currentTrack = this.queue[this.currentIndex]
      this.isPlaying = true
      this.addToRecent(this.currentTrack)
      this.saveState()
    },

    prev() {
      if (this.queue.length === 0) return

      if (this.playMode === 'random') {
        this.currentIndex = Math.floor(Math.random() * this.queue.length)
      } else if (this.playMode === 'loop') {
        // Single track loop: manual prev stays on the same track
      } else {
        this.currentIndex = (this.currentIndex - 1 + this.queue.length) % this.queue.length
      }

      this.playbackTrigger++
      this.currentTrack = this.queue[this.currentIndex]
      this.isPlaying = true
      this.addToRecent(this.currentTrack)
      this.saveState()
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
      // 如果当前没有歌曲，或者已经有封面且不是占位图，则跳过
      const isPlaceholder = this.currentTrack?.cover && this.currentTrack.cover.startsWith('data:image/svg+xml')
      if (!this.currentTrack || (this.currentTrack.cover && !isPlaceholder)) return

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
        // 关键修复：使用 decodeURIComponent 确保中文路径匹配成功
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