<script setup>
import { usePlayerStore } from '../../stores/player'
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle, Volume2, VolumeX } from 'lucide-vue-next'
import { computed } from 'vue'

import { useAudio } from '../../composables/useAudio'

const player = usePlayerStore()
const { seek } = useAudio()

const DEFAULT_COVER = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+album+cover+placeholder&image_size=square'

const playModeLabel = computed(() => {
  const labels = {
    sequence: '列表循环',
    loop: '单曲循环',
    random: '随机播放'
  }
  return labels[player.playMode] || '播放模式'
})

const cyclePlayMode = () => {
  const modes = ['sequence', 'loop', 'random']
  const nextMode = modes[(modes.indexOf(player.playMode) + 1) % modes.length]
  player.setPlayMode(nextMode)
}

// Progress Drag Logic
const onProgressInput = (e) => {
  player.isDragging = true
  const percent = parseFloat(e.target.value)
  player.currentTime = (percent / 100) * player.duration
}

const onProgressChange = (e) => {
  player.isDragging = false
  const percent = parseFloat(e.target.value)
  const targetTime = (percent / 100) * player.duration
  seek(targetTime)
}

// Volume Drag Logic
const onVolumeInput = (e) => {
  player.setVolume(parseInt(e.target.value))
}
</script>

<template>
  <Transition name="slide-up">
    <div v-if="player.isFullscreen" class="fixed inset-0 z-[100] bg-[#121212] flex flex-col overflow-hidden text-white">
      <!-- Background Blur -->
      <div class="absolute inset-0 z-0">
        <img 
          :src="player.currentTrack?.cover || DEFAULT_COVER" 
          @error="(e) => { if (!e.target.dataset.errorHandled) { e.target.dataset.errorHandled = 'true'; e.target.src = DEFAULT_COVER } }"
          class="w-full h-full object-cover blur-[100px] opacity-20 scale-150"
        >
        <div class="absolute inset-0 bg-black/40"></div>
      </div>

      <!-- Header -->
      <header class="relative z-10 p-8 flex justify-between items-center">
        <button @click="player.toggleFullscreen" class="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronDown class="w-8 h-8" />
        </button>
        <div class="text-center">
          <h2 class="text-2xl font-bold tracking-tight">{{ player.currentTrack?.name }}</h2>
          <p class="text-white/60 mt-1 font-medium">{{ player.currentTrack?.artist }}</p>
        </div>
        <div class="w-12"></div> <!-- Spacer -->
      </header>

      <!-- Main Content: Record Player -->
      <main class="relative z-10 flex-1 flex flex-col items-center justify-center -mt-10">
        <!-- Vinyl Record -->
        <div class="relative w-[380px] h-[380px] md:w-[450px] md:h-[450px]">
          <!-- Shadow/Glow -->
          <div class="absolute inset-0 rounded-full bg-black/40 blur-3xl scale-110"></div>
          
          <!-- Outer Black Ring -->
          <div class="absolute inset-0 rounded-full bg-[#080808] border-[12px] border-[#1a1a1a] shadow-2xl flex items-center justify-center animate-spin-slow"
               :style="{ animationPlayState: player.isPlaying ? 'running' : 'paused' }">
            
            <!-- Vinyl Texture Rings -->
            <div class="absolute inset-0 rounded-full opacity-30 border-[1px] border-white/5 scale-[0.98]"></div>
            <div class="absolute inset-0 rounded-full opacity-30 border-[1px] border-white/5 scale-[0.95]"></div>
            <div class="absolute inset-0 rounded-full opacity-30 border-[1px] border-white/5 scale-[0.92]"></div>
            
            <!-- Album Cover Center -->
            <div class="w-[65%] h-[65%] rounded-full overflow-hidden border-[8px] border-black shadow-inner">
              <img 
                :src="player.currentTrack?.cover || DEFAULT_COVER" 
                @error="(e) => { if (!e.target.dataset.errorHandled) { e.target.dataset.errorHandled = 'true'; e.target.src = DEFAULT_COVER } }"
                class="w-full h-full object-cover"
              >
            </div>
          </div>
          
          <!-- Tonearm (Stylus) -->
          <div class="absolute -top-10 left-1/2 -translate-x-1 w-24 h-48 origin-top transition-transform duration-700 pointer-events-none z-20"
               :style="{ transform: player.isPlaying ? 'rotate(25deg)' : 'rotate(0deg)' }">
            <div class="w-4 h-4 bg-[#666] rounded-full absolute top-0 left-1/2 -translate-x-1/2 border-2 border-[#888] shadow-lg"></div>
            <div class="w-1.5 h-40 bg-gradient-to-b from-[#888] to-[#444] absolute top-2 left-1/2 -translate-x-1/2 rounded-full"></div>
            <div class="w-4 h-8 bg-[#222] absolute bottom-0 left-1/2 -translate-x-1/2 rounded shadow-md border border-[#333]"></div>
          </div>
        </div>
      </main>

      <!-- Bottom Controls -->
      <footer class="relative z-10 p-12 space-y-8 max-w-4xl mx-auto w-full">
        <!-- Progress Bar -->
        <div class="space-y-2">
          <div class="relative h-1.5 bg-white/10 rounded-full group cursor-pointer">
            <div class="absolute inset-0 bg-white/30 rounded-full overflow-hidden">
              <div class="h-full bg-white transition-all duration-300" :style="{ width: player.currentProgress + '%' }"></div>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="0.1"
              :value="player.currentProgress"
              class="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              @input="onProgressInput"
              @change="onProgressChange"
            >
          </div>
          <div class="flex justify-between text-[10px] font-bold text-white/40 tracking-widest">
            <span>{{ Math.floor(player.currentTime / 60) }}:{{ Math.floor(player.currentTime % 60).toString().padStart(2, '0') }}</span>
            <span>{{ player.currentTrack?.duration || '00:00' }}</span>
          </div>
        </div>

        <!-- Main Buttons -->
        <div class="flex items-center justify-between">
          <button @click="cyclePlayMode" class="p-3 text-white/40 hover:text-white transition-colors" :title="playModeLabel">
            <Repeat v-if="player.playMode === 'sequence'" class="w-6 h-6" />
            <Repeat1 v-else-if="player.playMode === 'loop'" class="w-6 h-6" />
            <Shuffle v-else class="w-6 h-6" />
          </button>

          <div class="flex items-center space-x-10">
            <button @click="player.prev" class="p-4 hover:bg-white/5 rounded-full transition-all active:scale-90">
              <SkipBack class="w-8 h-8 fill-current" />
            </button>
            
            <button @click="player.togglePlay" class="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-2xl active:scale-95">
              <Pause v-if="player.isPlaying" class="w-10 h-10 fill-current" />
              <Play v-else class="w-10 h-10 fill-current ml-2" />
            </button>

            <button @click="player.next" class="p-4 hover:bg-white/5 rounded-full transition-all active:scale-90">
              <SkipForward class="w-8 h-8 fill-current" />
            </button>
          </div>

          <div class="flex items-center space-x-2 w-48 justify-end group relative">
            <button @click="player.toggleMute" class="p-2 text-white/40 hover:text-white transition-colors shrink-0">
              <VolumeX v-if="player.isMuted" class="w-5 h-5" />
              <Volume2 v-else class="w-5 h-5" />
            </button>
            <div class="w-24 h-1 bg-white/10 rounded-full relative cursor-pointer overflow-hidden">
              <div class="absolute inset-0 bg-white transition-all" :style="{ width: player.volume + '%' }"></div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                :value="player.volume"
                class="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                @input="onVolumeInput"
              >
            </div>
          </div>
        </div>
      </footer>
    </div>
  </Transition>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 20s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
}
</style>