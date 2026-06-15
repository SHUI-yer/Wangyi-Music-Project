<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getPlaylistDetail } from '../api/music'
import { usePlayerStore } from '../stores/player'
import { PlayCircle, Share2, Download, MessageSquare, Plus, Clock, Play } from 'lucide-vue-next'

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
  <div v-if="playlist" class="space-y-8 bg-white">
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
          播放：<span class="text-netease-red font-bold">{{ (playlist.playCount / 10000).toFixed(0) }}万</span>次
        </div>
      </div>

      <div class="border border-netease-border rounded-sm overflow-hidden mx-4">
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
                <PlayCircle v-if="player.currentTrack?.id === track.id" class="w-4 h-4 text-netease-red" />
                <Play v-else @click="playTrack(track)" class="w-3.5 h-3.5 text-netease-subtext hover:text-netease-text cursor-pointer" />
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