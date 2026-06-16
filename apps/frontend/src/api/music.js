import { parseMusicFileName } from '../utils/musicParser'
import { PLAYLIST_CONFIG, getFallbackPlaylistConfig } from '../config/playlistConfig'

const mockResponse = (data) => ({
  code: 0,
  message: 'success',
  data
})

export const getBanners = async () => {
  return mockResponse([
    { id: 1, imageUrl: '/assets/banners/banner1.jpg' },
    { id: 2, imageUrl: '/assets/banners/banner2.jpg' },
    { id: 3, imageUrl: '/assets/banners/banner3.jpg' },
  ])
}

export const getRecommended = async () => {
  return mockResponse([
    { id: 101, name: getFallbackPlaylistConfig(101).name, cover: getFallbackPlaylistConfig(101).cover, playCount: 1250000 },
    { id: 102, name: getFallbackPlaylistConfig(102).name, cover: getFallbackPlaylistConfig(102).cover, playCount: 850000 },
    { id: 103, name: getFallbackPlaylistConfig(103).name, cover: getFallbackPlaylistConfig(103).cover, playCount: 2350000 },
    { id: 104, name: getFallbackPlaylistConfig(104).name, cover: getFallbackPlaylistConfig(104).cover, playCount: 750000 },
    { id: 105, name: getFallbackPlaylistConfig(105).name, cover: getFallbackPlaylistConfig(105).cover, playCount: 1550000 },
  ])
}

export const getPlaylistDetail = async (id) => {
  let categoryName = ''
  let scanParams = ''
  let description = ''
  let cover = ''

  try {
    // 1. 读取外部配置文件 (Configuration-driven)
    const config = PLAYLIST_CONFIG[id]

    if (config) {
      // 命中已知分类
      scanParams = `category=${config.category}`
      categoryName = config.name
      description = config.description
      cover = config.cover
    } else {
      // 未命中，使用兜底配置 (精品歌单 list1-list5)
      const fallbackConfig = getFallbackPlaylistConfig(id)
      scanParams = `playlistId=${fallbackConfig.playlistId}`
      categoryName = fallbackConfig.name
      description = fallbackConfig.description
      cover = fallbackConfig.cover
    }

    const response = await fetch(`/api/scan-media?${scanParams}`)
    const localFiles = await response.json()

    // Random play count between 10w and 500w
    const playCount = Math.floor(Math.random() * 4900000) + 100000

    if (localFiles && localFiles.length > 0) {
      const tracks = localFiles.map((file, i) => ({
        id: id * 1000 + i,
        name: file.name,
        artist: file.artist,
        album: file.album,
        duration: file.duration,
        cover: file.cover || `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+album+cover+${id}+${i}&image_size=square`,
        url: file.url
      }))
      
      return mockResponse({
        id,
        name: categoryName,
        cover: cover || tracks[0].cover,
        description,
        playCount,
        tracks
      })
    }
  } catch (err) {
    console.warn('Failed to scan playlist directory.', err)
  }

  // Fallback to generic mock tracks if folder is empty
  return mockResponse({
    id,
    name: categoryName,
    cover: cover || 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=empty+playlist+cover&image_size=square',
    description: `此歌单目录 (${scanParams}) 暂无音乐，快去添加一些吧！`,
    playCount: 0,
    tracks: []
  })
}

export const getSongsByCategory = async (category) => {
  try {
    const response = await fetch(`/api/scan-media?category=${category}`)
    const localFiles = await response.json()
    
    if (!localFiles || localFiles.length === 0) return []

    return localFiles.map((file, i) => ({
      id: category.charCodeAt(0) * 1000 + i,
      name: file.name,
      artist: file.artist,
      album: file.album,
      duration: file.duration,
      cover: file.cover || `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${category}+music+art+${i}&image_size=square`,
      url: file.url
    }))
  } catch (err) {
    console.error('Failed to scan category:', category, err)
    return []
  }
}

export const getRandomSongs = async (count = 6) => {
  try {
    // Scan root media for "Guess You Like"
    const response = await fetch('/api/scan-media')
    const localFiles = await response.json()
    
    // Shuffle and pick
    const shuffled = [...localFiles].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, count)
    
    return selected.map((file, i) => ({
      id: 5000 + i,
      name: file.name,
      artist: file.artist,
      album: file.album,
      duration: file.duration,
      cover: file.cover || `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=random+music+art+${i}&image_size=square`,
      url: file.url
    }))
  } catch (err) {
    return []
  }
}

export const getTopLists = async () => {
  return mockResponse([
    { id: 1, name: '飙升榜', updateFrequency: '每天更新', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=soaring+chart&image_size=square' },
    { id: 2, name: '新歌榜', updateFrequency: '每天更新', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=new+song+chart&image_size=square' },
    { id: 3, name: '原创榜', updateFrequency: '每周四更新', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=original+chart&image_size=square' },
    { id: 4, name: '热歌榜', updateFrequency: '每周四更新', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=hot+song+chart&image_size=square' },
  ])
}

// Aliases for compatibility if needed
export const getPersonalizedPlaylists = getRecommended;
export const getNewSongs = async () => {
  return Array.from({ length: 12 }).map((_, i) => ({
    id: `new-${i}`,
    name: `New Premium Song ${i + 1}`,
    artist: `Artist ${i + 1}`,
    cover: `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=song+cover+${i}&image_size=square`,
    url: '/media/song.mp3'
  }))
}