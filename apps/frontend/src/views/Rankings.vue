<script setup>
import { onMounted, ref } from 'vue'
import { getTopLists } from '../api/music'
import { PlayCircle } from 'lucide-vue-next'

const rankings = ref([])

onMounted(async () => {
  const res = await getTopLists()
  rankings.value = res.data
})
</script>

<template>
  <div class="space-y-8">
    <header class="border-b-2 border-netease-red pb-2">
      <h2 class="text-xl font-bold">云音乐特色榜</h2>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="chart in rankings" :key="chart.id" 
           @click="$router.push(`/playlist/${chart.id}`)"
           class="group cursor-pointer space-y-3">
        <div class="relative aspect-square rounded border border-netease-border overflow-hidden">
          <img :src="chart.cover" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayCircle class="w-12 h-12 text-white fill-current" />
          </div>
          <div class="absolute bottom-0 left-0 right-0 h-6 bg-black/40 flex items-center px-2 text-[10px] text-white/70">
            {{ chart.updateFrequency }}
          </div>
        </div>
        
        <div class="space-y-1">
          <h3 class="text-sm font-bold hover:underline">{{ chart.name }}</h3>
          <div class="space-y-1">
            <div v-for="i in 3" :key="i" class="text-[11px] text-netease-subtext truncate flex items-center">
              <span class="w-4 font-bold" :class="i <= 3 ? 'text-netease-red' : ''">{{ i }}</span>
              <span class="truncate hover:underline">热门上榜歌曲 {{ i }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>