import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBanners, getPersonalizedPlaylists, getNewSongs } from '../api/music'

export const useMusicStore = defineStore('music', () => {
  const banners = ref([])
  const playlists = ref([])
  const newSongs = ref([])
  const loading = ref(false)

  const fetchHomeData = async () => {
    loading.value = true
    try {
      const [b, p, s] = await Promise.all([
        getBanners(),
        getPersonalizedPlaylists(),
        getNewSongs()
      ])
      banners.value = b
      playlists.value = p
      newSongs.value = s
    } catch (error) {
      console.error('Failed to fetch home data:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    banners,
    playlists,
    newSongs,
    loading,
    fetchHomeData
  }
})
