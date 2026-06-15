<script setup>
import { Volume2, VolumeX, ListMusic } from 'lucide-vue-next'
import { usePlayerStore } from '../../stores/player'

defineProps(['modelValue'])
defineEmits(['update:modelValue'])

const player = usePlayerStore()
</script>

<template>
  <div class="w-1/4 flex items-center justify-end space-x-4">
    <div class="flex items-center space-x-2 group">
      <button @click="player.toggleMute" class="text-netease-subtext hover:text-netease-red transition-colors">
        <VolumeX v-if="player.isMuted" class="w-4 h-4" />
        <Volume2 v-else class="w-4 h-4" />
      </button>
      <input 
        type="range" 
        :value="player.volume" 
        @input="e => player.setVolume(parseInt(e.target.value))"
        min="0" 
        max="100" 
        class="w-20 accent-netease-red h-1 cursor-pointer"
      >
    </div>
    <button 
      @click="$emit('update:modelValue', !modelValue)"
      class="p-1 rounded text-netease-subtext transition-colors"
      :class="modelValue ? 'text-netease-red bg-red-50' : 'hover:bg-gray-100 hover:text-netease-text'"
    >
      <ListMusic class="w-5 h-5" />
    </button>
  </div>
</template>
