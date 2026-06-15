<script setup>
import { Play } from 'lucide-vue-next'

defineProps({
  item: {
    type: Object,
    required: true
  }
})

const formatCount = (count) => {
  if (count > 100000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count
}
</script>

<template>
  <div class="playlist-card">
    <div class="cover-wrapper">
      <img :src="item.picUrl" :alt="item.name" />
      <div class="play-count">
        <Play :size="12" />
        {{ formatCount(item.playCount) }}
      </div>
      <div class="play-btn-overlay">
        <Play :size="24" fill="currentColor" />
      </div>
    </div>
    <div class="name">{{ item.name }}</div>
  </div>
</template>

<style scoped>
.playlist-card {
  cursor: pointer;
  width: 100%;
}

.cover-wrapper {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  background: var(--hover-bg);
}

.cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.playlist-card:hover img {
  transform: scale(1.05);
}

.play-count {
  position: absolute;
  top: 5px;
  right: 10px;
  font-size: 12px;
  color: white;
  text-shadow: 0 0 2px rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  gap: 4px;
}

.play-btn-overlay {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.8);
  color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s;
}

.playlist-card:hover .play-btn-overlay {
  opacity: 1;
  transform: translateY(0);
}

.name {
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
