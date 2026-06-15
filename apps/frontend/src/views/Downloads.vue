<script setup>
import { Download, PlayCircle, Trash2 } from 'lucide-vue-next'

const downloadedSongs = [
  { id: 1, name: '本地已下载歌曲 1', artist: '歌手 A', size: '10.2MB', time: '2024-06-10' },
  { id: 2, name: '本地已下载歌曲 2', artist: '歌手 B', size: '8.5MB', time: '2024-06-11' },
]
</script>

<template>
  <div class="space-y-6">
    <header class="border-b-2 border-netease-red pb-2 flex justify-between items-end">
      <h2 class="text-xl font-bold">下载管理</h2>
      <div class="flex space-x-4 text-xs text-netease-subtext">
        <span class="cursor-pointer hover:underline text-blue-600 font-bold">已下载单曲</span>
        <span class="cursor-pointer hover:underline">正在下载</span>
      </div>
    </header>

    <div class="flex items-center space-x-2">
      <button class="btn-red flex items-center space-x-2">
        <PlayCircle class="w-4 h-4 fill-current" />
        <span>播放全部</span>
      </button>
      <button class="px-3 py-1.5 border border-netease-border rounded-sm hover:bg-gray-50 text-xs shadow-sm">
        打开目录
      </button>
    </div>

    <div class="border border-netease-border rounded-sm overflow-hidden">
      <table class="w-full text-xs text-left border-collapse">
        <thead>
          <tr class="bg-[#F8F8F8] border-b border-netease-border">
            <th class="w-16 px-4 py-3 font-normal text-netease-subtext border-r border-netease-border">#</th>
            <th class="px-4 py-3 font-normal text-netease-subtext border-r border-netease-border">歌曲标题</th>
            <th class="w-48 px-4 py-3 font-normal text-netease-subtext border-r border-netease-border">歌手</th>
            <th class="w-32 px-4 py-3 font-normal text-netease-subtext border-r border-netease-border">大小</th>
            <th class="w-48 px-4 py-3 font-normal text-netease-subtext">下载时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(song, index) in downloadedSongs" :key="song.id" class="song-list-item group">
            <td class="px-4 py-3 text-netease-hint">{{ index + 1 }}</td>
            <td class="px-4 py-3 truncate max-w-xs font-medium">{{ song.name }}</td>
            <td class="px-4 py-3 text-netease-subtext hover:underline cursor-pointer">{{ song.artist }}</td>
            <td class="px-4 py-3 text-netease-hint">{{ song.size }}</td>
            <td class="px-4 py-3 flex items-center justify-between group">
              <span class="text-netease-hint">{{ song.time }}</span>
              <button class="opacity-0 group-hover:opacity-100 transition-opacity text-netease-hint hover:text-netease-red p-1">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="downloadedSongs.length === 0" class="flex flex-col items-center justify-center py-20 text-netease-hint">
      <Download class="w-16 h-16 mb-4 opacity-10" />
      <p class="text-sm">暂无下载记录</p>
    </div>
  </div>
</template>
