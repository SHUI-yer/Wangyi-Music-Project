<script setup>
import { Music2, Heart, Loader2 } from 'lucide-vue-next'
import { usePlayerStore } from '../../stores/player'
import { useRouter } from 'vue-router'

const player = usePlayerStore()

const handleCoverClick = () => {
  if (player.currentTrack) {
    player.toggleFullscreen()
  }
}
</script>

<template>
  <div class="flex items-center space-x-3 w-1/4 min-w-[200px]">
    <div 
      class="w-10 h-10 rounded-sm bg-gray-200 overflow-hidden shrink-0 border border-netease-border shadow-sm relative group cursor-pointer"
      @click="handleCoverClick"
    >
      <img v-if="player.currentTrack" :src="player.currentTrack.cover" class="w-full h-full object-cover group-hover:brightness-75 transition-all">
      <Music2 v-else class="w-full h-full p-2 text-gray-400" />
      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="m15 3 6 6-6 6"/><path d="M9 21 3 15l6-6"/><path d="M21 9H9s-4 0-4 4 0 4 0 4"/></svg>
      </div>
      <div v-if="player.isBuffering" class="absolute inset-0 bg-black/40 flex items-center justify-center">
        <Loader2 class="w-5 h-5 text-white animate-spin" />
      </div>
    </div>
    <div class="truncate">
      <div class="text-sm truncate flex items-center text-netease-text font-medium">
        <span>{{ player.currentTrack?.name || '未知歌曲' }}</span>
        <Heart class="w-3.5 h-3.5 ml-2 text-netease-hint cursor-pointer hover:text-netease-red transition-colors" />
      </div>
      <div class="text-xs text-netease-subtext truncate">{{ player.currentTrack?.artist || '未知歌手' }}</div>
    </div>
  </div>
</template>
