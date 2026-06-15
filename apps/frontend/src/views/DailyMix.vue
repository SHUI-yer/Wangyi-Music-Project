<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { usePlayerStore } from '../stores/player'
import { Play, Zap, Clock, Calendar, Music } from 'lucide-vue-next'

const tracks = ref([])
const player = usePlayerStore()
const currentTime = ref(new Date())

let timer = null

const updateTime = () => {
  currentTime.value = new Date()
}

const loadLocalTracks = async () => {
  try {
    const res = await fetch('/api/scan-media?category=local')
    const data = await res.json()
    tracks.value = data.map(track => ({
      ...track,
      id: `fm-local-${track.fileName}`,
      cover: track.cover || 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+disk+vinyl&image_size=square'
    }))
  } catch (err) {
    console.error('Failed to load local tracks for FM:', err)
  }
}

onMounted(() => {
  loadLocalTracks()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}
</script>

<template>
  <div class="space-y-10 pb-10">
    <!-- Premium Header with Clock -->
    <header class="relative h-[320px] rounded-[3rem] overflow-hidden flex items-center px-12 group shadow-2xl bg-[#1a1a1a]">
      <div class="absolute inset-0 bg-gradient-to-br from-netease-red/40 via-black/60 to-transparent"></div>
      
      <!-- Animated Background elements -->
      <div class="absolute -right-20 -top-20 w-80 h-80 bg-netease-red/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute left-1/4 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      
      <div class="relative z-10 flex items-center space-x-12 w-full">
        <!-- Digital Clock Display -->
        <div class="w-64 h-64 glass rounded-[3rem] flex flex-col items-center justify-center border-white/10 shadow-2xl group-hover:scale-105 transition-all duration-700 bg-white/5 backdrop-blur-xl">
           <div class="text-6xl font-black tracking-tighter text-white mb-2 font-mono">
             {{ formatTime(currentTime) }}
           </div>
           <div class="text-xs font-bold text-white/40 tracking-[0.2em] uppercase">
             {{ formatDate(currentTime) }}
           </div>
        </div>
        
        <div class="flex-1 space-y-6">
          <div class="space-y-1">
            <div class="flex items-center space-x-2 text-netease-red">
              <Zap class="w-4 h-4 fill-current animate-bounce" />
              <span class="text-[10px] font-black uppercase tracking-widest opacity-80">Private FM • Local Mode</span>
            </div>
            <h2 class="text-6xl font-black tracking-tighter text-white">私人 FM</h2>
            <p class="text-white/60 font-medium text-lg">您的专属本地音乐频道 · 随心而动</p>
          </div>
          
          <div class="flex items-center space-x-4">
            <button 
              v-if="tracks.length > 0"
              @click="player.setTrack(tracks[0], tracks)" 
              class="bg-netease-red text-white px-10 py-4 rounded-full font-bold flex items-center space-x-2 hover:bg-red-600 transition-all shadow-xl shadow-red-900/20 active:scale-95"
            >
              <Play class="w-5 h-5 fill-current" />
              <span>开始播放</span>
            </button>
            <div class="text-sm text-white/30 italic" v-else>
              请先在本地音乐页面导入歌曲...
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Local Music List Section -->
    <div class="space-y-6">
      <div class="flex items-center justify-between px-2">
        <h3 class="text-xl font-bold flex items-center gap-2">
          <Music class="w-5 h-5 text-netease-red" />
          本地频道队列 ({{ tracks.length }})
        </h3>
      </div>

      <div v-if="tracks.length === 0" class="glass-light p-20 rounded-[2rem] text-center space-y-4 border border-gray-100 bg-gray-50/50">
        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Music class="w-8 h-8 text-gray-200" />
        </div>
        <p class="text-gray-400 font-medium">本地队列暂无歌曲</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(track, index) in tracks" :key="track.id" 
             @click="player.setTrack(track, tracks)"
             class="group relative flex items-center p-4 rounded-2xl bg-white border border-gray-100 hover:border-netease-red/30 hover:shadow-xl hover:shadow-netease-red/5 transition-all cursor-pointer overflow-hidden">
          
          <!-- Hover Background Decor -->
          <div class="absolute right-0 top-0 w-24 h-24 bg-netease-red/5 rounded-full translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div class="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
            <img :src="track.cover" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play class="w-5 h-5 text-white fill-current" />
            </div>
            <div v-if="player.currentTrack?.id === track.id" class="absolute inset-0 bg-netease-red/60 flex items-center justify-center">
              <div class="flex items-end gap-1 h-4">
                <div class="w-1 bg-white animate-music-bar-1"></div>
                <div class="w-1 bg-white animate-music-bar-2"></div>
                <div class="w-1 bg-white animate-music-bar-3"></div>
              </div>
            </div>
          </div>

          <div class="ml-4 flex-1 min-w-0 z-10">
            <div class="text-sm font-bold truncate group-hover:text-netease-red transition-colors" :class="{ 'text-netease-red': player.currentTrack?.id === track.id }">
              {{ track.name }}
            </div>
            <div class="text-xs text-gray-400 truncate mt-0.5">{{ track.artist }}</div>
          </div>

          <div class="text-[10px] font-bold text-gray-300 group-hover:text-gray-400 transition-colors">
            {{ track.duration }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.animate-music-bar-1 { animation: music-bar 0.6s ease-in-out infinite; }
.animate-music-bar-2 { animation: music-bar 0.8s ease-in-out infinite; }
.animate-music-bar-3 { animation: music-bar 0.7s ease-in-out infinite; }

@keyframes music-bar {
  0%, 100% { height: 4px; }
  50% { height: 16px; }
}
</style>