<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from './stores/player'
import { useAudio } from './composables/useAudio'
import SongInfo from './components/player/SongInfo.vue'
import Controls from './components/player/Controls.vue'
import ProgressBar from './components/player/ProgressBar.vue'
import VolumeControl from './components/player/VolumeControl.vue'
import PlaylistDrawer from './components/player/PlaylistDrawer.vue'
import FullscreenPlayer from './components/player/FullscreenPlayer.vue'

const isDrawerOpen = ref(false)
import { 
  Music2, 
  Search, 
  Mic2, 
  Video, 
  Users, 
  Download,
  Clock,
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const player = usePlayerStore()
useAudio() // Initialize global audio engine

// --- UI State Driven by Router ---
const activePath = computed(() => route.path)

// --- Global Shortcuts ---
const handleGlobalKeydown = (e) => {
  // Toggle Play/Pause on Space, but not when typing in input
  if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
    e.preventDefault()
    player.togglePlay()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <div class="flex flex-col h-screen w-full bg-white overflow-hidden text-netease-text">
    <!-- Header -->
    <header class="h-14 bg-netease-red flex items-center justify-between px-4 shrink-0 z-50 shadow-md">
      <div class="flex items-center space-x-12">
        <div class="flex items-center space-x-2 text-white cursor-pointer" @click="router.push('/')">
          <div class="w-7 h-7 bg-white rounded-full flex items-center justify-center">
            <Music2 class="w-5 h-5 text-netease-red" />
          </div>
          <h1 class="text-lg font-bold tracking-wider">网易云音乐</h1>
        </div>
        
        <div class="flex items-center space-x-3 text-white/80">
          <div class="relative flex items-center">
            <Search class="absolute left-3 w-3.5 h-3.5 text-white/40" />
            <input 
              type="text" 
              placeholder="搜索音乐, 视频, 歌词, 电台" 
              class="bg-black/15 border-none rounded-full py-1.5 pl-9 pr-4 text-xs w-64 text-white placeholder:text-white/40 outline-none focus:bg-white/10 transition-all"
              @keyup.enter="router.push('/search')"
            >
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-6 text-white/90 text-sm">
        <div class="flex items-center space-x-2 cursor-pointer hover:text-white group" @click="router.push('/user')">
          <div class="w-7 h-7 rounded-full bg-gray-200 border border-white/20 overflow-hidden">
             <img :src="'/assets/user/avatar.jpg'" @error="(e) => e.target.src = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=simple+user+avatar+gray&image_size=square'" class="w-full h-full object-cover">
          </div>
          <span class="group-hover:underline">网抑云深夜emo</span>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-52 bg-netease-sidebar border-r border-netease-border flex flex-col overflow-y-auto shrink-0">
        <nav class="p-3 space-y-1">
          <div class="sidebar-title">推荐</div>
          <router-link to="/" class="sidebar-item" :class="{ 'active-menu': activePath === '/' }">
            <Music2 class="w-4 h-4" />
            <span>发现音乐</span>
          </router-link>
          <router-link to="/daily" class="sidebar-item" :class="{ 'active-menu': activePath === '/daily' }">
            <Mic2 class="w-4 h-4" />
            <span>私人FM</span>
          </router-link>
          <router-link to="/friends" class="sidebar-item" :class="{ 'active-menu': activePath === '/friends' }">
            <Users class="w-4 h-4" />
            <span>朋友</span>
          </router-link>

          <div class="sidebar-title">我的音乐</div>
          <router-link to="/user" class="sidebar-item" :class="{ 'active-menu': activePath === '/user' }">
            <Music2 class="w-4 h-4" />
            <span>本地音乐</span>
          </router-link>
          <router-link to="/downloads" class="sidebar-item" :class="{ 'active-menu': activePath === '/downloads' }">
            <Download class="w-4 h-4" />
            <span>下载管理</span>
          </router-link>
          <router-link to="/history" class="sidebar-item" :class="{ 'active-menu': activePath === '/history' }">
            <Clock class="w-4 h-4" />
            <span>最近播放</span>
          </router-link>

          <div class="sidebar-title">创建的歌单</div>
          <router-link to="/favorites" class="sidebar-item" :class="{ 'active-menu': activePath === '/favorites' }">
            <Heart class="w-4 h-4" />
            <span>我喜欢的音乐</span>
          </router-link>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 bg-white overflow-y-auto custom-scrollbar relative">
        <div class="p-8 max-w-6xl mx-auto pb-24">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>

    <!-- Bottom Player Bar (Industrial Refactored) -->
    <footer class="h-16 bg-white border-t border-netease-border flex items-center px-4 shrink-0 z-50 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      <SongInfo />
      <div class="flex-1 flex flex-col items-center justify-center max-w-2xl px-8">
        <Controls />
        <ProgressBar />
      </div>
      <VolumeControl v-model="isDrawerOpen" />
    </footer>

    <!-- Recent Playlist Drawer -->
    <transition name="slide">
      <PlaylistDrawer v-if="isDrawerOpen" />
    </transition>

    <!-- Fullscreen Player Overlay -->
    <FullscreenPlayer />
  </div>
</template>

<style>
/* Specific Overrides */
.active-menu {
  @apply bg-[#E2E2E2] text-netease-red font-bold !border-l-4 border-netease-red;
}

/* Drawer Transitions */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>