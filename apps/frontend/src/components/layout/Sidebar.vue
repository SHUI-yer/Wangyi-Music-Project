<script setup>
import { Music, Radio, Users, Heart, Download, Cloud, Star } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menus = [
  { name: '发现音乐', icon: Music, path: '/' },
  { name: '排行榜', icon: Star, path: '/rankings' },
  { name: '歌单', icon: Radio, path: '/playlist' },
  { name: '歌手', icon: Users, path: '/artist' },
]

const myMusic = [
  { name: '我喜欢的音乐', icon: Heart },
  { name: '下载管理', icon: Download },
  { name: '我的音乐云盘', icon: Cloud },
]
</script>

<template>
  <aside class="sidebar">
    <div class="menu-group">
      <div 
        v-for="item in menus" 
        :key="item.path"
        class="menu-item"
        :class="{ active: route.path === item.path }"
        @click="router.push(item.path)"
      >
        <component :is="item.icon" :size="18" />
        <span>{{ item.name }}</span>
      </div>
    </div>

    <div class="menu-group">
      <h3 class="group-title">我的音乐</h3>
      <div v-for="item in myMusic" :key="item.name" class="menu-item">
        <component :is="item.icon" :size="18" />
        <span>{{ item.name }}</span>
      </div>
    </div>

    <div class="menu-group">
      <h3 class="group-title">创建的歌单</h3>
      <div class="menu-item">
        <Heart :size="18" />
        <span>我喜欢的音乐</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 200px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  padding: 15px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.menu-group {
  display: flex;
  flex-direction: column;
}

.group-title {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 0 20px;
  margin-bottom: 10px;
}

.menu-item {
  height: 36px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  cursor: pointer;
  color: var(--text-primary);
  opacity: 0.8;
  transition: all 0.2s;
}

.menu-item:hover {
  background-color: var(--hover-bg);
  opacity: 1;
}

.menu-item.active {
  background-color: var(--hover-bg);
  color: var(--primary-color);
  opacity: 1;
  font-weight: bold;
  border-left: 3px solid var(--primary-color);
  padding-left: 17px;
}
</style>
