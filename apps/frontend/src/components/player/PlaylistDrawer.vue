<script setup>
import { usePlayerStore } from '../../stores/player'

const player = usePlayerStore()

const playRecent = (track) => {
  player.setTrack(track)
}
</script>

<template>
  <div class="fixed bottom-[72px] right-4 w-80 bg-netease-bg shadow-2xl rounded-lg overflow-hidden border border-netease-border z-50">
    <div class="p-4 border-b border-gray-100 bg-gray-50">
      <h3 class="font-bold text-gray-800 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-netease-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        最近播放 ({{ player.recentTracks.length }})
      </h3>
    </div>
    
    <div class="max-h-96 overflow-y-auto">
      <div v-if="player.recentTracks.length === 0" class="p-8 text-center text-gray-400">
        暂无播放记录
      </div>
      
      <div 
        v-for="track in player.recentTracks" 
        :key="track.id"
        @click="playRecent(track)"
        class="group p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
        :class="{ 'bg-red-50': player.currentTrack?.id === track.id }"
      >
        <div class="relative w-10 h-10 flex-shrink-0">
          <img :src="track.cover" class="w-full h-full object-cover rounded shadow-sm" alt="">
          <div v-if="player.currentTrack?.id === track.id" class="absolute inset-0 bg-black/20 flex items-center justify-center rounded">
            <div class="flex gap-0.5 items-end h-3">
              <div class="w-0.5 bg-white animate-music-bar-1"></div>
              <div class="w-0.5 bg-white animate-music-bar-2"></div>
              <div class="w-0.5 bg-white animate-music-bar-3"></div>
            </div>
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-800 truncate" :class="{ 'text-netease-red': player.currentTrack?.id === track.id }">
            {{ track.name }}
          </div>
          <div class="text-xs text-gray-500 truncate">{{ track.artist }}</div>
        </div>
        
        <button class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded-full transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-netease-red" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="player.recentTracks.length > 0" class="p-2 bg-gray-50 text-center border-t border-gray-100">
      <button 
        @click="player.recentTracks = []"
        class="text-xs text-gray-400 hover:text-netease-red transition-colors"
      >
        清空记录
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-music-bar-1 { animation: music-bar 0.6s ease-in-out infinite alternate; }
.animate-music-bar-2 { animation: music-bar 0.9s ease-in-out infinite alternate; }
.animate-music-bar-3 { animation: music-bar 0.7s ease-in-out infinite alternate; }

@keyframes music-bar {
  from { height: 20%; }
  to { height: 100%; }
}

::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
