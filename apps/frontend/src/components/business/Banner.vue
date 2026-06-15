<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  list: {
    type: Array,
    default: () => []
  }
})

const currentIndex = ref(0)
let timer = null

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.list.length
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.list.length) % props.list.length
}

onMounted(() => {
  timer = setInterval(next, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="banner-container">
    <div 
      v-for="(item, index) in list" 
      :key="item.id"
      class="banner-item"
      :class="{ 
        active: index === currentIndex,
        prev: index === (currentIndex - 1 + list.length) % list.length,
        next: index === (currentIndex + 1) % list.length
      }"
    >
      <img :src="item.imageUrl" :alt="item.title" />
      <div class="banner-tag">{{ item.title }}</div>
    </div>
    
    <button class="nav-btn prev" @click="prev">&lt;</button>
    <button class="nav-btn next" @click="next">&gt;</button>

    <div class="dots">
      <span 
        v-for="(_, index) in list" 
        :key="index"
        class="dot"
        :class="{ active: index === currentIndex }"
        @mouseover="currentIndex = index"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.banner-container {
  height: 200px;
  position: relative;
  margin-bottom: 30px;
  perspective: 1000px;
}

.banner-item {
  position: absolute;
  width: 540px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%) scale(0.8);
  transition: all 0.4s ease;
  z-index: 1;
  opacity: 0;
  cursor: pointer;
}

.banner-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.banner-item.active {
  transform: translateX(-50%) scale(1);
  z-index: 10;
  opacity: 1;
}

.banner-item.prev {
  transform: translateX(-100%) scale(0.8);
  opacity: 0.6;
  z-index: 5;
}

.banner-item.next {
  transform: translateX(0%) scale(0.8);
  opacity: 0.6;
  z-index: 5;
}

.banner-tag {
  position: absolute;
  right: 0;
  bottom: 10px;
  padding: 4px 10px;
  background-color: var(--primary-color);
  color: white;
  font-size: 12px;
  border-radius: 4px 0 0 4px;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: rgba(0,0,0,0.3);
  color: white;
  border-radius: 50%;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.banner-container:hover .nav-btn {
  opacity: 1;
}

.nav-btn.prev { left: 20px; }
.nav-btn.next { right: 20px; }

.dots {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--border-color);
  border-radius: 50%;
  cursor: pointer;
}

.dot.active {
  background: var(--primary-color);
}
</style>
