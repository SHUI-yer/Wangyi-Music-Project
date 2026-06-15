<script setup>
import { computed } from 'vue'
import { Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Pause, Play } from 'lucide-vue-next'
import { usePlayerStore } from '../../stores/player'

const player = usePlayerStore()

const playModeLabel = computed(() => {
  const labels = {
    sequence: '列表循环',
    loop: '单曲循环',
    random: '随机播放'
  }
  return labels[player.playMode] || '播放模式'
})

const cyclePlayMode = () => {
  const modes = ['sequence', 'loop', 'random']
  const nextMode = modes[(modes.indexOf(player.playMode) + 1) % modes.length]
  player.setPlayMode(nextMode)
}
</script>

<template>
  <div class="flex items-center space-x-6 mb-1">
    <button @click="cyclePlayMode" class="text-netease-text hover:text-netease-red transition-colors" :title="playModeLabel">
      <Repeat v-if="player.playMode === 'sequence'" class="w-4 h-4" />
      <Repeat1 v-else-if="player.playMode === 'loop'" class="w-4 h-4" />
      <Shuffle v-else class="w-4 h-4" />
    </button>
    <button @click="player.prev" class="text-netease-red hover:scale-110 transition-transform"><SkipBack class="w-5 h-5 fill-current" /></button>
    <button @click="player.togglePlay" class="w-8 h-8 rounded-full bg-netease-red text-white flex items-center justify-center hover:scale-110 transition-all active:scale-95 shadow-md">
      <Pause v-if="player.isPlaying" class="w-4 h-4 fill-current" />
      <Play v-else class="w-4 h-4 fill-current ml-0.5" />
    </button>
    <button @click="player.next" class="text-netease-red hover:scale-110 transition-transform"><SkipForward class="w-5 h-5 fill-current" /></button>
  </div>
</template>
