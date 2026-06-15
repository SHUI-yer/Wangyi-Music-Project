<script setup>
import { usePlayerStore } from '../../stores/player'
import { useAudio } from '../../composables/useAudio'
import TimeDisplay from './TimeDisplay.vue'

const player = usePlayerStore()
const { seek } = useAudio()

const handleProgressChange = (e) => {
  const time = parseFloat(e.target.value)
  seek(time)
}
</script>

<template>
  <div class="w-full flex items-center space-x-3">
    <div class="flex-1 group relative flex items-center h-4">
      <!-- Buffered Progress (Optional Background) -->
      <div class="absolute h-1 bg-gray-100 w-full rounded-full"></div>
      
      <!-- Actual Range Input -->
      <input 
        type="range" 
        :min="0" 
        :max="player.duration || 100" 
        :value="player.currentTime" 
        @input="handleProgressChange"
        @mousedown="player.isDragging = true"
        @mouseup="player.isDragging = false"
        class="w-full accent-netease-red h-1 rounded-full cursor-pointer z-10"
      >
    </div>
    <TimeDisplay />
  </div>
</template>
