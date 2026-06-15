<script setup>
import { Users, MessageSquare, Heart, Share2 } from 'lucide-vue-next'

const feedItems = [
  {
    id: 1,
    user: '音乐达人',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=user+avatar+1&image_size=square',
    content: '分享一首最近循环播放的歌曲，旋律太治愈了！',
    song: { name: '治愈系旋律', artist: '独立音乐人' },
    time: '1小时前'
  },
  {
    id: 2,
    user: '电音爱好者',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=user+avatar+2&image_size=square',
    content: '昨晚的电音节现场太燃了！大家一定要去感受一下。',
    song: { name: 'Electro Party', artist: 'DJ Spark' },
    time: '3小时前'
  }
]
</script>

<template>
  <div class="space-y-8">
    <header class="border-b-2 border-netease-red pb-2 flex justify-between items-end">
      <h2 class="text-xl font-bold">朋友动态</h2>
    </header>

    <div class="max-w-2xl space-y-6">
      <div v-for="item in feedItems" :key="item.id" class="netease-card p-6 space-y-4">
        <div class="flex items-center space-x-4">
          <img :src="item.avatar" class="w-12 h-12 rounded border border-netease-border">
          <div>
            <div class="font-bold text-blue-600 hover:underline cursor-pointer">{{ item.user }}</div>
            <div class="text-xs text-netease-hint">{{ item.time }}</div>
          </div>
        </div>
        
        <p class="text-sm leading-relaxed">{{ item.content }}</p>
        
        <div class="bg-gray-50 p-3 rounded flex items-center space-x-4 border border-netease-border group cursor-pointer hover:bg-gray-100">
          <div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
            <Users class="w-6 h-6 text-netease-hint" />
          </div>
          <div class="flex-1">
            <div class="text-sm font-medium">{{ item.song.name }}</div>
            <div class="text-xs text-netease-subtext">{{ item.song.artist }}</div>
          </div>
        </div>

        <div class="flex items-center space-x-8 pt-2 text-netease-subtext">
          <button class="flex items-center space-x-1 hover:text-netease-red text-xs">
            <Heart class="w-4 h-4" />
            <span>(12)</span>
          </button>
          <button class="flex items-center space-x-1 hover:text-netease-red text-xs">
            <Share2 class="w-4 h-4" />
            <span>(5)</span>
          </button>
          <button class="flex items-center space-x-1 hover:text-netease-red text-xs">
            <MessageSquare class="w-4 h-4" />
            <span>(8)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
