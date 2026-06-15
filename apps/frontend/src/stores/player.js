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

    saveState() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentTrack: this.currentTrack,
        queue: this.queue,
        currentIndex: this.currentIndex,
        volume: this.volume,
        playMode: this.playMode,
        recentTracks: this.recentTracks,
        favorites: this.favorites
      }))
    }
  }
})