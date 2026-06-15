<script setup>
import { ref } from 'vue'
import { searchMusic } from '../api/music'
import { usePlayerStore } from '../stores/player'
import { Search as SearchIcon, PlayCircle, Clock, Play, Heart } from 'lucide-vue-next'

const keyword = ref('')
const results = ref([])
const player = usePlayerStore()

const handleSearch = async () => {
  if (!keyword.value.trim()) return
  // Simple manual debounce to prevent rapid fire
  if (handleSearch.loading) return
  handleSearch.loading = true
  
  try {
    const res = await searchMusic(keyword.value)
    results.value = res.data
  } finally {
    handleSearch.loading = false
  }
}
handleSearch.loading = false
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col items-center space-y-6 py-10 border-b border-netease-border">
      <div class="relative w-full max-w-lg">
        <input 
          v-model="keyword"
          @keyup.enter="handleSearch"
          type="text" 
          placeholder="搜索音乐, 歌手, 专辑" 
          class="w-full border-2 border-netease-border rounded-sm px-4 py-2 text-sm focus:border-netease-red outline-none transition-all shadow-inner"
        >
        <button @click="handleSearch" class="absolute right-0 top-0 bottom-0 px-4 bg-gray-50 border-l border-netease-border hover:bg-gray-100">
          <SearchIcon class="w-4 h-4 text-netease-subtext" />
        </button>
      </div>
    </div>

    <section v-if="results.length > 0" class="space-y-4">
      <div class="text-xs text-netease-subtext px-4">
        搜索 <span class="text-netease-red">"{{ keyword }}"</span>，找到 <span class="text-netease-red">{{ results.length }}</span> 首歌曲
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
            <tr v-for="(track, index) in results" :key="track.id" 
                @dblclick="player.setTrack(track, results)"
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
                <span :class="{ 'text-netease-red font-bold': player.currentTrack?.id === track.id }" 
                      class="cursor-pointer hover:underline">{{ track.name }}</span>
              </td>
              <td class="px-4 py-3 text-netease-subtext">{{ track.duration }}</td>
              <td class="px-4 py-3 truncate text-netease-subtext hover:underline cursor-pointer">{{ track.artist }}</td>
              <td class="px-4 py-3 truncate text-netease-subtext hover:underline cursor-pointer">{{ track.album }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-else-if="keyword" class="flex flex-col items-center justify-center py-20 text-netease-subtext">
      <SearchIcon class="w-16 h-16 mb-4 opacity-10" />
      <p class="text-sm">未能找到相关搜索结果</p>
    </div>
  </div>
</template>