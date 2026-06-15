<script setup>
import { usePlayerStore } from '../../stores/player'

const player = usePlayerStore()

const formatTime = (seconds) => {
  if (!seconds) return '00:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="flex items-center space-x-2 text-[10px] text-netease-hint font-medium tabular-nums">
    <span>{{ formatTime(player.currentTime) }}</span>
    <span class="opacity-30">/</span>
    <span>{{ formatTime(player.duration) }}</span>
  </div>
</template>
