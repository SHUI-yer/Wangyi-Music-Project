import { parseMusicFileName } from '../utils/musicParser'
import { PLAYLIST_CONFIG, getPlaylistConfigById } from '../config/playlistConfig'

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
  // 直接从 PLAYLIST_CONFIG 中提取 101-105 的推荐配置
  const recommendedIds = [101, 102, 103, 104, 105]
  const data = recommendedIds.map(id => {
    const config = getPlaylistConfigById(id)
    return {
      id,
      name: config.name,
      cover: config.cover,
      playCount: Math.floor(Math.random() * 2000000) + 500000
    }
  })
  return mockResponse(data)
}

export const getPlaylistDetail = async (id) => {
  let categoryName = ''
  let scanParams = ''
  let description = ''
  let cover = ''

  try {
    // 1. 读取外部配置文件 (Configuration-driven)
    const config = getPlaylistConfigById(id)

    categoryName = config.name
    description = config.description
    cover = config.cover

    if (config.category) {
      scanParams = `category=${config.category}`
    } else if (config.playlistId) {
      scanParams = `playlistId=${config.playlistId}`
    } else {
      // 兜底逻辑
      scanParams = `playlistId=list1`
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