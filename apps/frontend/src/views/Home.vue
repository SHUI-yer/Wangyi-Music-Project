<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { getBanners, getRecommended, getRandomSongs, getSongsByCategory } from '../api/music'
import { Play, PlayCircle, RefreshCw, ChevronRight, Music } from 'lucide-vue-next'
import { usePlayerStore } from '../stores/player'

const banners = ref([])
const playlists = ref([])
const guessLikeSongs = ref([])
const categorySongs = ref({
  rock: [],
  pop: [],
  jazz: [],
  chinese: []
})
const currentBanner = ref(0)
const player = usePlayerStore()
let timer = null

const refreshGuessLike = async () => {
  const res = await getRandomSongs(6)
  guessLikeSongs.value = res
}

const loadCategorySongs = async () => {
  const categories = ['rock', 'pop', 'jazz', 'chinese']
  for (const cat of categories) {
    const res = await getSongsByCategory(cat)
    categorySongs.value[cat] = res.slice(0, 5) // Each category shows top 5
  }
}

onMounted(async () => {
  const bannerRes = await getBanners()
  const playlistRes = await getRecommended()
  
  banners.value = bannerRes.data
  playlists.value = playlistRes.data
  refreshGuessLike()
  loadCategorySongs()
  
  timer = setInterval(() => {
    if (banners.value.length > 0) {
      currentBanner.value = (currentBanner.value + 1) % banners.value.length
    }
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="space-y-10">
    <!-- Banner Carousel (Classic Style) -->
    <section class="relative h-64 rounded-lg overflow-hidden group shadow-md bg-gray-100">
      <div v-for="(banner, index) in banners" :key="banner.id" 
           class="absolute inset-0 transition-opacity duration-500"
           :class="index === currentBanner ? 'opacity-100' : 'opacity-0'">
        <img :src="banner.imageUrl" class="w-full h-full object-cover">
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          <div v-for="(_, i) in banners" :key="i" 
               class="w-2 h-2 rounded-full cursor-pointer transition-colors"
               :class="i === currentBanner ? 'bg-netease-red' : 'bg-white/50'"
               @click="currentBanner = i"></div>
        </div>
      </div>
    </section>

    <!-- Recommended Playlists -->
    <section class="space-y-4">
      <div class="flex items-center justify-between border-b-2 border-netease-red pb-2">
        <div class="flex items-center space-x-4">
          <h3 class="text-xl font-bold">推荐歌单</h3>
          <div class="flex items-center space-x-4 text-xs text-netease-subtext">
            <span class="cursor-pointer hover:underline" @click="$router.push('/playlist/201')">华语</span>
            <span class="text-gray-300">|</span>
            <span class="cursor-pointer hover:underline" @click="$router.push('/playlist/202')">流行</span>
            <span class="text-gray-300">|</span>
            <span class="cursor-pointer hover:underline" @click="$router.push('/playlist/203')">摇滚</span>
            <span class="text-gray-300">|</span>
            <span class="cursor-pointer hover:underline" @click="$router.push('/playlist/204')">爵士</span>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 pt-2">
        <div v-for="item in playlists" :key="item.id" 
             @click="$router.push(`/playlist/${item.id}`)"
             class="group cursor-pointer">
          <div class="relative aspect-square rounded border border-netease-border overflow-hidden">
            <img :src="item.cover" class="w-full h-full object-cover">
            <div class="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/40 to-transparent flex items-center justify-end px-2">
              <div class="flex items-center space-x-1 text-white text-[10px]">
                <Play class="w-2.5 h-2.5" />
                <span>{{ (item.playCount / 10000).toFixed(0) }}万</span>
              </div>
            </div>
            <div class="absolute bottom-2 right-2 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/20">
              <PlayCircle class="w-5 h-5 text-white fill-current" />
            </div>
          </div>
          <div class="mt-2">
            <h4 class="text-sm leading-5 line-clamp-2 group-hover:underline">{{ item.name }}</h4>
          </div>
        </div>
      </div>
    </section>

    <!-- Guess You Like (New Module) -->
    <section class="space-y-4">
      <div class="flex items-center justify-between border-b-2 border-netease-red pb-2">
        <h3 class="text-xl font-bold">猜你喜欢</h3>
        <button @click="refreshGuessLike" class="text-xs text-netease-subtext hover:text-netease-red flex items-center gap-1 transition-colors">
          <RefreshCw class="w-3.5 h-3.5" />
          换一换
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        <div v-for="(song, index) in guessLikeSongs" :key="song.id" 
             @click="player.setTrack(song, guessLikeSongs)"
             class="flex items-center p-2 rounded hover:bg-gray-50 group cursor-pointer border-b border-gray-50 last:border-0">
          <span class="w-6 text-xs text-gray-400 text-center">{{ index + 1 }}</span>
          <div class="relative w-12 h-12 ml-2 shrink-0">
            <img :src="song.cover" class="w-full h-full object-cover rounded shadow-sm">
            <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
              <Play class="w-4 h-4 text-white fill-current" />
            </div>
          </div>
          <div class="ml-3 flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-800 truncate">{{ song.name }}</div>
            <div class="text-xs text-gray-500 truncate">{{ song.artist }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Music Categories (New Layout: Title + Song List) -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
      <div v-for="(songs, cat) in categorySongs" :key="cat" class="space-y-4">
        <!-- Category Header -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
          <div class="flex items-center gap-2">
            <div class="w-1 h-4 bg-netease-red rounded-full"></div>
            <h3 class="text-lg font-bold capitalize">
              {{ cat === 'chinese' ? '华语经典' : cat === 'rock' ? '摇滚狂热' : cat === 'pop' ? '流行前线' : '爵士心情' }}
            </h3>
          </div>
          <button 
            @click="$router.push(`/playlist/${cat === 'rock' ? 203 : cat === 'pop' ? 202 : cat === 'jazz' ? 204 : 201}`)"
            class="text-xs text-gray-400 hover:text-netease-red flex items-center gap-1"
          >
            更多 <ChevronRight class="w-3 h-3" />
          </button>
        </div>

        <!-- Mini Song List -->
        <div class="bg-white rounded-xl border border-gray-50 overflow-hidden min-h-[280px]">
          <div v-if="!songs || songs.length === 0" class="h-[280px] flex flex-col items-center justify-center text-center p-8 space-y-2">
            <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
              <Music class="w-6 h-6" />
            </div>
            <p class="text-xs text-gray-300 italic">此分类目录下暂无歌曲<br>(public/media/{{ cat }})</p>
          </div>
          <div v-else class="divide-y divide-gray-50">
            <div v-for="(song, index) in songs" :key="song.id"
                 @click="player.setTrack(song, songs)"
                 class="flex items-center p-3 hover:bg-gray-50 group cursor-pointer transition-colors h-[56px]">
              <span class="w-6 text-xs text-gray-400">{{ index + 1 }}</span>
              <img :src="song.cover" class="w-10 h-10 rounded shadow-sm object-cover ml-2">
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-800 truncate">{{ song.name }}</div>
                <div class="text-[10px] text-gray-400 truncate">{{ song.artist }}</div>
              </div>
              <PlayCircle class="w-5 h-5 text-netease-red opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>