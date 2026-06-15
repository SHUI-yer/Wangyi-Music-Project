<script setup>
import { Clock, PlayCircle, Trash2 } from 'lucide-vue-next'
import { usePlayerStore } from '../stores/player'

const player = usePlayerStore()

// Mock data, in real app this would come from store/localStorage
const historySongs = [
  { id: 1001, name: 'Premium Track 1', artist: 'Artist 1', album: 'Album 1', duration: '04:20', url: '/media/song.mp3', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+cover+1&image_size=square' },
  { id: 1002, name: 'Premium Track 2', artist: 'Artist 1', album: 'Album 1', duration: '04:20', url: '/media/song.mp3', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+cover+2&image_size=square' },
]
</script>

<template>
  <div class="space-y-6">
    <header class="border-b-2 border-netease-red pb-2 flex justify-between items-end">
      <h2 class="text-xl font-bold">最近播放</h2>
      <div class="flex items-center space-x-4">
        <span class="text-xs text-netease-hint">共 {{ historySongs.length }} 首记录</span>
        <button class="text-xs text-blue-600 hover:underline flex items-center space-x-1">
          <Trash2 class="w-3 h-3" />
          <span>清除全部</span>
        </button>
      </div>
    </header>

    <div class="flex items-center space-x-2">
      <button @click="player.setTrack(historySongs[0], historySongs)" class="btn-red flex items-center space-x-2">
        <PlayCircle class="w-4 h-4 fill-current" />
        <span>播放全部</span>
      </button>
    </div>

    <div class="border border-netease-border rounded-sm overflow-hidden">
      <table class="w-full text-xs text-left border-collapse">
        <thead>
          <tr class="bg-[#F8F8F8] border-b border-netease-border">
            <th class="w-16 px-4 py-3 font-normal text-netease-subtext border-r border-netease-border">#</th>
            <th class="px-4 py-3 font-normal text-netease-subtext border-r border-netease-border">歌曲标题</th>
            <th class="w-48 px-4 py-3 font-normal text-netease-subtext border-r border-netease-border">歌手</th>
            <th class="w-48 px-4 py-3 font-normal text-netease-subtext border-r border-netease-border">专辑</th>
            <th class="w-24 px-4 py-3 font-normal text-netease-subtext">时长</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(song, index) in historySongs" :key="song.id" 
              @dblclick="player.setTrack(song, historySongs)"
              class="song-list-item group"
              :class="{ 'bg-gray-100': player.currentTrack?.id === song.id }">
            <td class="px-4 py-3 text-netease-hint">{{ index + 1 }}</td>
            <td class="px-4 py-3 truncate max-w-xs font-medium" :class="{ 'text-netease-red': player.currentTrack?.id === song.id }">
              {{ song.name }}
            </td>
            <td class="px-4 py-3 text-netease-subtext hover:underline cursor-pointer">{{ song.artist }}</td>
            <td class="px-4 py-3 text-netease-subtext hover:underline cursor-pointer">{{ song.album }}</td>
            <td class="px-4 py-3 text-netease-hint">{{ song.duration }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="historySongs.length === 0" class="flex flex-col items-center justify-center py-20 text-netease-hint">
      <Clock class="w-16 h-16 mb-4 opacity-10" />
      <p class="text-sm">暂无播放记录</p>
    </div>
  </div>
</template>
