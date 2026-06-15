<script setup>
import { 
  Play, Pause, SkipBack, SkipForward, 
  Repeat, ListMusic, Volume2, Mic2 
} from 'lucide-vue-next'
import { ref } from 'vue'

const isPlaying = ref(false)
const progress = ref(30)
const volume = ref(70)
</script>

<template>
  <footer class="player">
    <div class="song-info">
      <div class="song-cover">
        <Music :size="20" />
      </div>
      <div class="song-details">
        <div class="song-name">歌曲名</div>
        <div class="artist-name">歌手</div>
      </div>
    </div>

    <div class="player-controls">
      <div class="buttons">
        <Repeat :size="18" class="icon" />
        <SkipBack :size="20" class="icon-fill" />
        <div class="play-btn" @click="isPlaying = !isPlaying">
          <Play v-if="!isPlaying" :size="20" fill="currentColor" />
          <Pause v-else :size="20" fill="currentColor" />
        </div>
        <SkipForward :size="20" class="icon-fill" />
        <Mic2 :size="18" class="icon" />
      </div>
      <div class="progress-bar">
        <span class="time">00:00</span>
        <div class="slider">
          <div class="slider-fill" :style="{ width: progress + '%' }"></div>
          <div class="slider-thumb" :style="{ left: progress + '%' }"></div>
        </div>
        <span class="time">04:30</span>
      </div>
    </div>

    <div class="extra-controls">
      <ListMusic :size="20" class="icon" />
      <div class="volume-control">
        <Volume2 :size="20" class="icon" />
        <div class="slider volume-slider">
          <div class="slider-fill" :style="{ width: volume + '%' }"></div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.player {
  height: 72px;
  background-color: var(--player-bg);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 100;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
}

.song-cover {
  width: 48px;
  height: 48px;
  background: var(--hover-bg);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.song-name {
  font-size: 14px;
  margin-bottom: 4px;
}

.artist-name {
  font-size: 12px;
  color: var(--text-secondary);
}

.player-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.buttons {
  display: flex;
  align-items: center;
  gap: 24px;
}

.play-btn {
  width: 32px;
  height: 32px;
  background: var(--hover-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.play-btn:hover {
  background: var(--border-color);
}

.icon {
  opacity: 0.6;
  cursor: pointer;
}

.icon:hover {
  opacity: 1;
}

.icon-fill:hover {
  color: var(--primary-color);
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 600px;
}

.time {
  font-size: 11px;
  color: var(--text-secondary);
  width: 40px;
}

.slider {
  flex: 1;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.slider-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
}

.slider-thumb {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
}

.extra-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 200px;
  justify-content: flex-end;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 120px;
}

.volume-slider {
  width: 80px;
}
</style>
