<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getPlaylistDetail } from '../api/music'
import { usePlayerStore } from '../stores/player'
import { PlayCircle, Share2, Download, MessageSquare, Plus, Clock, Play, Heart } from 'lucide-vue-next'

const route = useRoute()
const playlist = ref(null)
const player = usePlayerStore()

onMounted(async () => {
  const res = await getPlaylistDetail(route.params.id)
  playlist.value = res.data
})

const playTrack = (track) => {
  player.setTrack(track, playlist.value.tracks)
}

const playAll = () => {
  if (playlist.value?.tracks.length > 0) {
    player.setTrack(playlist.value.tracks[0], playlist.value.tracks)
  }
}
</script>

<template>
  <div v-if="playlist" class="space-y-8 bg-netease-bg">
    <!-- Playlist Header (Classic) -->
    <header class="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8 px-4">
      <div class="w-52 h-52 rounded border border-netease-border overflow-hidden flex-shrink-0 p-1 bg-white shadow-sm">
        <img :src="playlist.cover" class="w-full h-full object-cover">
      </div>
      
      <div class="flex-1 space-y-6">
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 border border-netease-red text-netease-red text-[10px] rounded-sm font-bold">歌单</span>
            <h2 class="text-2xl font-bold">{{ playlist.name }}</h2>
          </div>
          
          <div class="flex items-center space-x-3 text-xs">
            <div class="w-8 h-8 rounded bg-gray-200"></div>
            <span class="text-blue-600 cursor-pointer hover:underline">网易云音乐</span>
            <span class="text-netease-subtext">2024-06-13 创建</span>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <div class="flex items-center divide-x divide-netease-darkRed">
            <button @click="playAll" class="flex items-center space-x-2 bg-netease-red text-white pl-4 pr-3 py-1.5 rounded-l-sm hover:bg-netease-darkRed transition-colors text-sm">
              <PlayCircle class="w-4 h-4 fill-current" />
              <span>播放</span>
            </button>
            <button class="bg-netease-red text-white px-2 py-1.5 rounded-r-sm hover:bg-netease-darkRed transition-colors text-sm">
              <Plus class="w-4 h-4" />
            </button>
          </div>
          
          <button class="flex items-center space-x-2 px-3 py-1.5 border border-netease-border rounded-sm hover:bg-gray-50 text-xs shadow-sm">
            <Plus class="w-3.5 h-3.5" />
            <span>收藏</span>
          </button>
          <button class="flex items-center space-x-2 px-3 py-1.5 border border-netease-border rounded-sm hover:bg-gray-50 text-xs shadow-sm">
            <Share2 class="w-3.5 h-3.5" />
            <span>分享</span>
          </button>
          <button class="flex items-center space-x-2 px-3 py-1.5 border border-netease-border rounded-sm hover:bg-gray-50 text-xs shadow-sm">
            <Download class="w-3.5 h-3.5" />
            <span>下载</span>
          </button>
          <button class="flex items-center space-x-2 px-3 py-1.5 border border-netease-border rounded-sm hover:bg-gray-50 text-xs shadow-sm">
            <MessageSquare class="w-3.5 h-3.5" />
            <span>评论</span>
          </button>
        </div>

        <div class="text-xs text-netease-subtext space-y-1">
          <p class="line-clamp-2"><span class="text-netease-text">介绍：</span>{{ playlist.description }}</p>
        </div>
      </div>
    </header>

    <!-- Track List (Classic Table) -->
    <section class="space-y-4">
      <div class="flex items-center justify-between border-b-2 border-netease-red pb-2 px-4">
        <div class="flex items-baseline space-x-4">
          <h3 class="text-xl font-bold">歌曲列表</h3>
          <span class="text-xs text-netease-subtext">{{ playlist.tracks.length }}首歌</span>
        </div>
        <div class="text-xs text-netease-subtext">
          播放：<span class="text-netease-red font-bold">{{ (playlist.playCount / 10000).toFixed(0) || 0 }}万</span>次
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="playlist.tracks.length === 0" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div class="relative w-64 h-64 flex items-center justify-center">
          <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
            <!-- Body -->
            <path d="M100 40C70 40 50 70 50 120C50 170 65 205 100 205C135 205 150 170 150 120C150 70 130 40 100 40Z" fill="#8D5B4D"/>
            
            <!-- Feet -->
            <rect x="65" y="195" width="30" height="25" rx="12" fill="#8D5B4D"/>
            <rect x="105" y="195" width="30" height="25" rx="12" fill="#8D5B4D"/>

            <!-- Tail/Seat (pink) -->
            <path d="M140 190C160 190 175 205 170 215H140V190Z" fill="#FF6A9A" opacity="0.4"/>

            <!-- Antlers -->
            <path d="M60 75C45 50 30 55 35 80" stroke="#FF6A9A" stroke-width="14" stroke-linecap="round"/>
            <path d="M140 75C155 50 170 55 165 80" stroke="#FF6A9A" stroke-width="14" stroke-linecap="round"/>

            <!-- Headphone Band -->
            <path d="M65 95C65 70 135 70 135 95" stroke="#5D3A31" stroke-width="12" fill="none"/>
            
            <!-- Earcups -->
            <rect x="50" y="90" width="18" height="35" rx="9" fill="#FF6A9A"/>
            <rect x="132" y="90" width="18" height="35" rx="9" fill="#FF6A9A"/>

            <!-- Face -->
            <path d="M85 125C85 130 95 130 95 125" stroke="#4A2E27" stroke-width="3" stroke-linecap="round"/>
            <path d="M105 125C105 130 115 130 115 125" stroke="#4A2E27" stroke-width="3" stroke-linecap="round"/>
            <circle cx="100" cy="135" r="3" fill="#4A2E27"/>

            <!-- Records Stack -->
            <g transform="translate(45, 145)">
              <rect x="0" y="0" width="110" height="55" rx="6" fill="white" stroke="#E5E7EB" stroke-width="1"/>
              <rect x="0" y="6" width="110" height="5" fill="#FF6B6B"/>
              <rect x="0" y="15" width="110" height="5" fill="#4D96FF"/>
              <rect x="0" y="24" width="110" height="5" fill="#6BCB77"/>
              <rect x="0" y="33" width="110" height="5" fill="#FFD93D"/>
              <rect x="0" y="42" width="110" height="5" fill="#333333"/>
              <!-- Top record details -->
              <circle cx="55" cy="27" r="22" fill="#333333"/>
              <circle cx="55" cy="27" r="8" fill="#FF6B6B"/>
            </g>

            <!-- Hands holding records -->
            <circle cx="55" cy="185" r="12" fill="#8D5B4D"/>
            <circle cx="145" cy="185" r="12" fill="#8D5B4D"/>
          </svg>
        </div>
        <p class="text-gray-400 text-sm tracking-widest">空空如也</p>
      </div>

      <div v-else class="border border-netease-border rounded-sm overflow-hidden mx-4">
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="bg-[#F8F8F8] border-b border-netease-border">
              <th class="w-16 px-4 py-3 font-normal text-netease-subtext border-r border-netease-border">#</th>
              <th class="px-4 py-3 font-normal text-netease-subtext border-r border-netease-border">歌曲标题</th>
              <th class="w-24 px-4 py-3 font-normal text-netease-subtext border-r border-netease-border">时长</th>
              <th class="w-48 px-4 py-3 font-normal text-netease-subtext border-r border-netease-border">歌手</th>
              <th class="w-48 px-4 py-3 font-normal text-netease-subtext">专辑</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(track, index) in playlist.tracks" :key="track.id" 
                @dblclick="playTrack(track)"
                class="song-list-item transition-colors"
                :class="{ 'bg-gray-100': player.currentTrack?.id === track.id }">
              <td class="px-4 py-3 flex items-center space-x-2 text-netease-subtext">
                <span>{{ index + 1 }}</span>
                <button @click.stop="player.toggleFavorite(track)" class="focus:outline-none">
                  <Heart 
                    class="w-3.5 h-3.5 cursor-pointer transition-colors" 
                    :class="player.isFavorite(track) ? 'text-netease-red fill-current' : 'hover:text-netease-red'" 
                  />
                </button>
              </td>
              <td class="px-4 py-3 truncate max-w-xs">
                <div class="flex items-center space-x-2">
                  <img v-if="track.cover" :src="track.cover" class="w-8 h-8 rounded-sm object-cover shrink-0 shadow-sm border border-gray-100">
                  <span :class="{ 'text-netease-red font-bold': player.currentTrack?.id === track.id }" 
                        class="cursor-pointer hover:underline truncate">{{ track.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-netease-subtext">{{ track.duration }}</td>
              <td class="px-4 py-3 truncate text-netease-subtext hover:underline cursor-pointer">{{ track.artist }}</td>
              <td class="px-4 py-3 truncate text-netease-subtext hover:underline cursor-pointer">{{ track.album }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>