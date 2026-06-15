import { watch } from 'vue'
import { usePlayerStore } from '../stores/player'

/**
 * Singleton Audio Engine
 * To prevent memory leaks in HMR (Vite), we attach the instance to window in development.
 */
const audio = (() => {
  if (typeof window !== 'undefined') {
    if (!window.__NETEASE_AUDIO__) {
      window.__NETEASE_AUDIO__ = new Audio()
      console.log('Audio Singleton Created')
    }
    return window.__NETEASE_AUDIO__
  }
  return new Audio()
})()

let isInitialized = false
let globalPlayer = null
let lastSrcSetTime = 0

// --- Core Event Handlers ---
const handleTimeUpdate = () => {
  if (globalPlayer && !globalPlayer.isDragging) {
    globalPlayer.updateProgress(audio.currentTime)
  }
}

const handleDurationChange = () => {
  if (globalPlayer) globalPlayer.duration = audio.duration
}

const handleEnded = () => {
  if (globalPlayer) {
    console.log('Track Ended, moving to next...')
    globalPlayer.next()
  }
}

const handleError = () => {
  console.error('Audio playback error, skipping to next track')
  if (globalPlayer) globalPlayer.next()
}

const handleLoadStart = () => {
  if (globalPlayer) globalPlayer.isBuffering = true
}

const handleCanPlay = () => {
  if (globalPlayer) {
    globalPlayer.isBuffering = false
    if (globalPlayer.isPlaying) {
      console.log('Audio Can Play, attempting to start...')
      audio.play().catch((err) => {
        if (err.name === 'AbortError') {
          console.log('Playback interrupted, will try again on next canplay')
        } else {
          console.warn('Playback failed:', err)
          globalPlayer.isPlaying = false
        }
      })
    }
  }
}

// NOTE: We REMOVED handlePlay/handlePause to prevent feedback loops with the watcher.

export function useAudio() {
  const player = usePlayerStore()
  globalPlayer = player

  const play = () => {
    if (audio.src) {
      audio.play().catch((err) => {
        console.warn('Playback failed (possibly autoplay policy):', err)
        player.isPlaying = false
      })
    }
  }

  const pause = () => audio.pause()

  const seek = (time) => {
    if (isFinite(time)) {
      audio.currentTime = time
      player.currentTime = time
    }
  }

  const setVolume = (v) => {
    audio.volume = Math.max(0, Math.min(1, v / 100))
  }

  if (!isInitialized) {
    // 1. Setup Global Listeners (Only once)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)

    // 2. Setup Global Watchers (Single Source of Truth: Store -> Audio)
    watch(() => player.currentTrack, (newTrack) => {
      if (newTrack?.url) {
        const absoluteUrl = new URL(newTrack.url, window.location.origin).href
        if (audio.src !== absoluteUrl) {
          console.log('Audio Source Changing:', newTrack.name)
          lastSrcSetTime = Date.now()
          audio.src = newTrack.url
          audio.load()
          // Playback will be triggered by handleCanPlay if player.isPlaying is true
        }
      }
    }, { immediate: true })

    watch(() => player.playbackTrigger, () => {
      // Only handle restart if the source is already correct and was not JUST set
      // This prevents race conditions between currentTrack watcher and playbackTrigger watcher
      const timeSinceSrcSet = Date.now() - lastSrcSetTime
      if (player.currentTrack && player.isPlaying && timeSinceSrcSet > 100) {
        console.log('Playback Triggered (Restart/Same Track)')
        audio.currentTime = 0
        audio.play().catch((err) => {
          console.warn('Playback Trigger failed:', err)
        })
      }
    })

    watch(() => player.isPlaying, (playing) => {
      if (playing) {
        if (audio.paused) {
          audio.play().catch((err) => {
            console.warn('Manual Play failed:', err)
            player.isPlaying = false
          })
        }
      } else {
        if (!audio.paused) {
          audio.pause()
        }
      }
    }, { immediate: true })

    watch(() => player.volume, (v) => {
      setVolume(v)
    }, { immediate: true })

    isInitialized = true
    console.log('Audio Engine Listeners Initialized')
  }

  return { play, pause, seek, setVolume }
}
