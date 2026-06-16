<script setup>
import { Heart, Play, Clock } from 'lucide-vue-next'
import { usePlayerStore } from '../stores/player'

const player = usePlayerStore()

const playAll = () => {
  if (player.favorites.length > 0) {
    player.setTrack(player.favorites[0], player.favorites)
  }
}
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Header (Modern Like Playlist) -->
    <header class="bg-netease-bg p-8 rounded-2xl shadow-sm border border-netease-border flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
      <div class="w-48 h-48 rounded-xl border border-netease-border overflow-hidden flex-shrink-0 bg-white shadow-md flex items-center justify-center relative group">
        <div class="absolute inset-0 bg-gradient-to-br from-red-400 to-netease-red flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
          <Heart class="w-20 h-20 text-white fill-current animate-pulse-slow" />
        </div>
      </div>
      
      <div class="flex-1 space-y-6">
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 border border-netease-red text-netease-red text-[10px] rounded-sm font-bold tracking-wider">歌单</span>
            <h2 class="text-3xl font-bold text-gray-800">我喜欢的音乐</h2>
          </div>
          
          <div class="flex items-center space-x-3 text-sm">
            <div class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-netease-border shadow-sm">
              <img src="/assets/user/avatar.jpg" @error="(e) => { if (!e.target.dataset.errorHandled) { e.target.dataset.errorHandled = 'true'; e.target.src = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=simple+user+avatar+gray&image_size=square' } }" class="w-full h-full object-cover">
            </div>
            <span class="text-blue-600 cursor-pointer hover:underline font-medium">网抑云深夜emo</span>
            <span class="text-gray-400 text-xs flex items-center"><Clock class="w-3.5 h-3.5 mr-1"/> 刚刚更新</span>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <button 
            @click="playAll" 
            class="flex items-center gap-2 px-6 py-2.5 bg-netease-red text-white rounded-full font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95"
            :disabled="player.favorites.length === 0"
            :class="{'opacity-50 cursor-not-allowed': player.favorites.length === 0}"
          >
            <Play class="w-5 h-5 fill-current" />
            <span>播放全部</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Track List -->
    <section class="bg-netease-bg rounded-2xl shadow-sm border border-netease-border overflow-hidden">
      <div class="p-6 border-b border-gray-50 flex items-center justify-between">
        <h3 class="font-bold text-gray-800 flex items-center gap-2">
          歌曲列表 ({{ player.favorites.length }})
        </h3>
      </div>

      <div v-if="player.favorites.length === 0" class="p-20 text-center space-y-4">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
          <Heart class="w-10 h-10 text-gray-300" />
        </div>
        <div class="space-y-1">
          <p class="text-gray-500 font-medium">还没有喜欢的音乐</p>
          <p class="text-sm text-gray-400">去发现音乐，点击红心收藏吧</p>
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
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr 
              v-for="(track, index) in player.favorites" 
              :key="track.id + '-' + index"
              @dblclick="player.setTrack(track, player.favorites)"
              class="group hover:bg-gray-50 transition-colors cursor-pointer"
              :class="{ 'bg-red-50/50': player.currentTrack?.id === track.id }"
            >
              <td class="px-6 py-4 text-sm flex items-center gap-3">
                <span :class="player.currentTrack?.id === track.id ? 'text-netease-red font-bold' : 'text-gray-400'">
                  <div v-if="player.currentTrack?.id === track.id" class="flex gap-0.5 items-end h-3 w-4">
                    <div class="w-0.5 bg-netease-red animate-music-bar-1"></div>
                    <div class="w-0.5 bg-netease-red animate-music-bar-2"></div>
                    <div class="w-0.5 bg-netease-red animate-music-bar-3"></div>
                  </div>
                  <span v-else>{{ index + 1 }}</span>
                </span>
                <button @click.stop="player.toggleFavorite(track)" class="focus:outline-none">
                  <Heart class="w-4 h-4 text-netease-red fill-current hover:scale-110 transition-transform" />
                </button>
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
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .8; transform: scale(0.95); }
}

.animate-music-bar-1 { animation: music-bar 0.6s ease-in-out infinite alternate; }
.animate-music-bar-2 { animation: music-bar 0.9s ease-in-out infinite alternate; }
.animate-music-bar-3 { animation: music-bar 0.7s ease-in-out infinite alternate; }

@keyframes music-bar {
  from { height: 20%; }
  to { height: 100%; }
}
</style>
