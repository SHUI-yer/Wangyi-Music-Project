<script setup>
import { ref, onMounted } from 'vue'
import { Download, FolderSearch, Play, Trash2, Heart } from 'lucide-vue-next'
import { usePlayerStore } from '../stores/player'

const player = usePlayerStore()
const fileInput = ref(null)
const isScanning = ref(false)
const uploadProgress = ref(0)
const localServerTracks = ref([])
const selectedTracks = ref([]) // For batch deletion

const loadLocalTracks = async () => {
  try {
    const res = await fetch('/api/scan-media?category=local')
    const data = await res.json()
    localServerTracks.value = data.map(track => ({
      ...track,
      id: `local-${track.fileName}`,
      cover: track.cover || 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+disk+vinyl&image_size=square'
    }))
  } catch (err) {
    console.error('Failed to load local tracks:', err)
  }
}

onMounted(() => {
  loadLocalTracks()
})

const triggerFileSelect = () => {
  fileInput.value.click()
}

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files).filter(f => f.type.startsWith('audio/'))
  if (files.length === 0) return

  isScanning.value = true
  uploadProgress.value = 0
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
    } catch (err) {
      console.error('Upload failed:', file.name, err)
    }
  }
  
  await loadLocalTracks()
  isScanning.value = false
  uploadProgress.value = 0
  event.target.value = '' // Reset input
}

const deleteLocal = async (track) => {
  if (!confirm(`确定要删除 ${track.name} 吗？`)) return
  
  try {
    await fetch(`/api/delete-local?fileName=${encodeURIComponent(track.fileName)}`)
    await loadLocalTracks()
    // Remove from selected list if present
    selectedTracks.value = selectedTracks.value.filter(t => t.id !== track.id)
  } catch (err) {
    console.error('Delete failed:', err)
  }
}

const batchDelete = async () => {
  if (selectedTracks.value.length === 0) return
  if (!confirm(`确定要删除选中的 ${selectedTracks.value.length} 首歌曲吗？`)) return
  
  try {
    for (const track of selectedTracks.value) {
      await fetch(`/api/delete-local?fileName=${encodeURIComponent(track.fileName)}`)
    }
    await loadLocalTracks()
    selectedTracks.value = [] // Clear selection
  } catch (err) {
    console.error('Batch delete failed:', err)
  }
}

const toggleSelection = (track) => {
  const index = selectedTracks.value.findIndex(t => t.id === track.id)
  if (index === -1) {
    selectedTracks.value.push(track)
  } else {
    selectedTracks.value.splice(index, 1)
  }
}

const toggleAllSelection = (event) => {
  if (event.target.checked) {
    selectedTracks.value = [...localServerTracks.value]
  } else {
    selectedTracks.value = []
  }
}

const playLocal = (track) => {
  player.setTrack(track, localServerTracks.value)
}
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Header -->
    <header class="bg-netease-bg p-8 rounded-2xl shadow-sm border border-netease-border flex items-center justify-between">
      <div class="flex items-center space-x-6">
        <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner flex items-center justify-center bg-gray-100">
          <Download class="w-10 h-10 text-gray-400" />
        </div>
        <div>
          <h2 class="text-3xl font-bold text-gray-800">下载管理</h2>
          <p class="text-gray-500 mt-1">管理你导入的本地音乐文件</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <input 
          type="file" 
          ref="fileInput" 
          multiple 
          accept="audio/*" 
          class="hidden" 
          @change="handleFileSelect"
        >
        <button 
          @click="triggerFileSelect"
          class="flex items-center gap-2 px-6 py-3 bg-netease-red text-white rounded-full font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95 min-w-[160px] justify-center"
          :disabled="isScanning"
        >
          <template v-if="!isScanning">
            <FolderSearch class="w-5 h-5" />
            <span>导入音乐</span>
          </template>
          <template v-else>
            <div class="flex flex-col items-center">
              <div class="text-xs mb-1">正在上传 {{ uploadProgress }}%</div>
              <div class="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                <div class="h-full bg-white transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
              </div>
            </div>
          </template>
        </button>
      </div>
    </header>

    <!-- Local Tracks List -->
    <div class="bg-netease-bg rounded-2xl shadow-sm border border-netease-border overflow-hidden">
      <div class="p-6 border-b border-gray-50 flex items-center justify-between">
        <h3 class="font-bold text-gray-800 flex items-center gap-2">
          歌曲列表 ({{ localServerTracks.length }})
        </h3>
        
        <!-- Batch Actions -->
        <div v-if="selectedTracks.length > 0" class="flex items-center gap-4 animate-fade-in">
          <span class="text-sm text-gray-500">已选择 {{ selectedTracks.length }} 项</span>
          <button 
            @click="batchDelete"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors text-sm"
          >
            <Trash2 class="w-4 h-4" />
            批量删除
          </button>
        </div>
      </div>

      <div v-if="localServerTracks.length === 0" class="p-20 text-center space-y-4">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
          <Download class="w-10 h-10 text-gray-300" />
        </div>
        <div class="space-y-1">
          <p class="text-gray-500 font-medium">暂无下载记录</p>
          <p class="text-sm text-gray-400">导入的音乐文件将显示在这里</p>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
              <th class="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  class="rounded text-netease-red focus:ring-netease-red cursor-pointer"
                  :checked="selectedTracks.length === localServerTracks.length && localServerTracks.length > 0"
                  @change="toggleAllSelection"
                >
              </th>
              <th class="px-2 py-4 w-12">#</th>
              <th class="px-6 py-4">标题</th>
              <th class="px-6 py-4">歌手</th>
              <th class="px-6 py-4">专辑</th>
              <th class="px-6 py-4 w-32">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr 
              v-for="(track, index) in localServerTracks" 
              :key="track.id"
              class="group hover:bg-gray-50 transition-colors cursor-pointer"
              :class="{ 'bg-gray-50': selectedTracks.some(t => t.id === track.id) }"
              @dblclick="playLocal(track)"
            >
              <td class="px-6 py-4">
                <input 
                  type="checkbox" 
                  class="rounded text-netease-red focus:ring-netease-red cursor-pointer"
                  :checked="selectedTracks.some(t => t.id === track.id)"
                  @change="toggleSelection(track)"
                >
              </td>
              <td class="px-2 py-4 text-sm text-gray-400">{{ index + 1 }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img :src="track.cover" class="w-10 h-10 rounded shadow-sm object-cover">
                  <span class="font-medium text-gray-800">{{ track.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ track.artist }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ track.album }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button @click.stop="player.toggleFavorite(track)" class="focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart 
                      class="w-4 h-4 cursor-pointer transition-colors" 
                      :class="player.isFavorite(track) ? 'text-netease-red fill-current' : 'text-gray-400 hover:text-netease-red'" 
                    />
                  </button>
                  <button 
                    @click.stop="playLocal(track)"
                    class="w-8 h-8 rounded-full bg-red-50 text-netease-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <Play class="w-4 h-4 fill-current" />
                  </button>
                  <button 
                    @click.stop="deleteLocal(track)"
                    class="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:text-red-500"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
