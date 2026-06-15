<script setup>
import { Clock, Play, Trash2 } from 'lucide-vue-next'
import { usePlayerStore } from '../stores/player'

const player = usePlayerStore()

const playHistory = (track) => {
  player.setTrack(track, player.recentTracks)
}

const playAll = () => {
  if (player.recentTracks.length > 0) {
    player.setTrack(player.recentTracks[0], player.recentTracks)
  }
}

const clearHistory = () => {
  if (confirm('确定要清空所有播放记录吗？')) {
    player.recentTracks = []
    player.saveState()
  }
}
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Header -->
    <header class="bg-netease-bg p-8 rounded-2xl shadow-sm border border-netease-border flex items-center justify-between">
      <div class="flex items-center space-x-6">
        <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner flex items-center justify-center bg-gray-100">
          <Clock class="w-10 h-10 text-gray-400" />
        </div>
        <div>
          <h2 class="text-3xl font-bold text-gray-800">最近播放</h2>
          <p class="text-gray-500 mt-1">你最近听过的 {{ player.recentTracks.length }} 首歌曲</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <button 
          @click="playAll"
          class="flex items-center gap-2 px-6 py-3 bg-netease-red text-white rounded-full font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95 min-w-[140px] justify-center"
          :disabled="player.recentTracks.length === 0"
          :class="{'opacity-50 cursor-not-allowed': player.recentTracks.length === 0}"
        >
          <Play class="w-5 h-5 fill-current" />
          <span>播放全部</span>
        </button>
      </div>
    </header>

    <!-- History List -->
    <div class="bg-netease-bg rounded-2xl shadow-sm border border-netease-border overflow-hidden">
      <div class="p-6 border-b border-gray-50 flex items-center justify-between">
        <h3 class="font-bold text-gray-800 flex items-center gap-2">
          播放记录 ({{ player.recentTracks.length }})
        </h3>
        
        <button 
          v-if="player.recentTracks.length > 0"
          @click="clearHistory"
          class="text-sm text-gray-400 hover:text-netease-red flex items-center gap-1 transition-colors"
        >
          <Trash2 class="w-4 h-4" />
          清空全部
        </button>
      </div>

      <div v-if="player.recentTracks.length === 0" class="p-20 text-center space-y-4">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
          <Clock class="w-10 h-10 text-gray-300" />
        </div>
        <div class="space-y-1">
          <p class="text-gray-500 font-medium">暂无播放记录</p>
          <p class="text-sm text-gray-400">去发现好音乐吧</p>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
              <th class="px-6 py-4 w-16">#</th>
              <th class="px-6 py-4">标题</th>
              <th class="px-6 py-4">歌手</th>
              <th class="px-6 py-4">专辑</th>
              <th class="px-6 py-4 w-24">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr 
              v-for="(track, index) in player.recentTracks" 
              :key="track.id + '-' + index"
              class="group hover:bg-gray-50 transition-colors cursor-pointer"
              :class="{ 'bg-red-50/50': player.currentTrack?.id === track.id }"
              @dblclick="playHistory(track)"
            >
              <td class="px-6 py-4 text-sm" :class="player.currentTrack?.id === track.id ? 'text-netease-red font-bold' : 'text-gray-400'">
                <div v-if="player.currentTrack?.id === track.id" class="flex gap-0.5 items-end h-3 w-4">
                  <div class="w-0.5 bg-netease-red animate-music-bar-1"></div>
                  <div class="w-0.5 bg-netease-red animate-music-bar-2"></div>
                  <div class="w-0.5 bg-netease-red animate-music-bar-3"></div>
                </div>
                <span v-else>{{ index + 1 }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img :src="track.cover" class="w-10 h-10 rounded shadow-sm object-cover">
                  <span class="font-medium truncate max-w-[200px]" :class="player.currentTrack?.id === track.id ? 'text-netease-red' : 'text-gray-800'">
                    {{ track.name }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-[150px]">{{ track.artist }}</td>
              <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-[150px]">{{ track.album || '未知专辑' }}</td>
              <td class="px-6 py-4">
                <button 
                  @click.stop="playHistory(track)"
                  class="w-8 h-8 rounded-full bg-red-50 text-netease-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <Play class="w-4 h-4 fill-current" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
</style>
