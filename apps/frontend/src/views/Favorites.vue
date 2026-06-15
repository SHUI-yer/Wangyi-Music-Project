<script setup>
import { Heart, PlayCircle, Plus, Share2, Download } from 'lucide-vue-next'
import { usePlayerStore } from '../stores/player'

const player = usePlayerStore()

const favoriteSongs = [
  { id: 1003, name: 'Premium Track 3', artist: 'Artist 2', album: 'Album 2', duration: '04:20', url: '/media/song.mp3', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+cover+3&image_size=square' },
  { id: 1004, name: 'Premium Track 4', artist: 'Artist 2', album: 'Album 2', duration: '04:20', url: '/media/song.mp3', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+cover+4&image_size=square' },
]
</script>

<template>
  <div class="space-y-8 bg-white">
    <!-- Header (Classic Like Playlist) -->
    <header class="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8 px-4">
      <div class="w-52 h-52 rounded border border-netease-border overflow-hidden flex-shrink-0 p-1 bg-white shadow-sm flex items-center justify-center">
        <div class="w-full h-full bg-gradient-to-br from-netease-red to-red-400 flex items-center justify-center">
          <Heart class="w-24 h-24 text-white fill-current" />
        </div>
      </div>
      
      <div class="flex-1 space-y-6">
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 border border-netease-red text-netease-red text-[10px] rounded-sm font-bold">歌单</span>
            <h2 class="text-2xl font-bold">我喜欢的音乐</h2>
          </div>
          
          <div class="flex items-center space-x-3 text-xs">
            <div class="w-8 h-8 rounded bg-gray-200 overflow-hidden border border-netease-border">
              <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=user+avatar+netease&image_size=square" class="w-full h-full object-cover">
            </div>
            <span class="text-blue-600 cursor-pointer hover:underline">未登录用户</span>
            <span class="text-netease-subtext">2024-06-13 创建</span>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <div class="flex items-center divide-x divide-netease-darkRed">
            <button @click="player.setTrack(favoriteSongs[0], favoriteSongs)" class="flex items-center space-x-2 bg-netease-red text-white pl-4 pr-3 py-1.5 rounded-l-sm hover:bg-netease-darkRed transition-colors text-sm">
              <PlayCircle class="w-4 h-4 fill-current" />
              <span>播放全部</span>
            </button>
            <button class="bg-netease-red text-white px-2 py-1.5 rounded-r-sm hover:bg-netease-darkRed transition-colors text-sm">
              <Plus class="w-4 h-4" />
            </button>
          </div>
          
          <button class="flex items-center space-x-2 px-3 py-1.5 border border-netease-border rounded-sm hover:bg-gray-50 text-xs shadow-sm">
            <Share2 class="w-3.5 h-3.5" />
            <span>分享</span>
          </button>
          <button class="flex items-center space-x-2 px-3 py-1.5 border border-netease-border rounded-sm hover:bg-gray-50 text-xs shadow-sm">
            <Download class="w-3.5 h-3.5" />
            <span>下载</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Track List -->
    <section class="space-y-4">
      <div class="flex items-center justify-between border-b-2 border-netease-red pb-2 px-4">
        <div class="flex items-baseline space-x-4">
          <h3 class="text-xl font-bold">歌曲列表</h3>
          <span class="text-xs text-netease-subtext">{{ favoriteSongs.length }}首歌</span>
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
            <tr v-for="(track, index) in favoriteSongs" :key="track.id" 
                @dblclick="player.setTrack(track, favoriteSongs)"
                class="song-list-item transition-colors"
                :class="{ 'bg-gray-100': player.currentTrack?.id === track.id }">
              <td class="px-4 py-3 flex items-center space-x-2 text-netease-subtext">
                <span>{{ index + 1 }}</span>
                <Heart class="w-3.5 h-3.5 text-netease-red fill-current" />
              </td>
              <td class="px-4 py-3 truncate max-w-xs font-medium" :class="{ 'text-netease-red': player.currentTrack?.id === track.id }">
                {{ track.name }}
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
