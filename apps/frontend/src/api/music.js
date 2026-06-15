import { parseMusicFileName } from '../utils/musicParser'

const mockResponse = (data) => ({
  code: 0,
  message: 'success',
  data
})

export const getBanners = async () => {
  return mockResponse([
    { id: 1, imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=netease+music+banner+artistic+abstract+red&image_size=landscape_16_9' },
    { id: 2, imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+concert+crowd+neon+lights&image_size=landscape_16_9' },
    { id: 3, imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=chill+lofi+hip+hop+beats+illustration&image_size=landscape_16_9' },
  ])
}

export const getRecommended = async () => {
  return mockResponse([
    { id: 101, name: 'Exclusive Mix Vol. 1', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=album+cover+art+1&image_size=square', playCount: 1250000 },
    { id: 102, name: 'Daily Discovery', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=album+cover+art+2&image_size=square', playCount: 850000 },
    { id: 103, name: 'Top 50 Global', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=album+cover+art+3&image_size=square', playCount: 2350000 },
    { id: 104, name: 'Chill Vibes', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=album+cover+art+4&image_size=square', playCount: 750000 },
    { id: 105, name: 'Rock Classics', cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=album+cover+art+5&image_size=square', playCount: 1550000 },
  ])
}

export const getPlaylistDetail = async (id) => {
  try {
    // Handle category IDs (201-204)
    let scanParams = ''
    let categoryName = ''
    
    if (id === 201) { scanParams = 'category=chinese'; categoryName = '华语经典' }
    else if (id === 202) { scanParams = 'category=pop'; categoryName = '流行前线' }
    else if (id === 203) { scanParams = 'category=rock'; categoryName = '摇滚狂热' }
    else if (id === 204) { scanParams = 'category=jazz'; categoryName = '爵士心情' }
    else {
      // Normal playlists list1-list5
      const playlistId = `list${(id % 5) || 5}`
      scanParams = `playlistId=${playlistId}`
      categoryName = `精品歌单 ${playlistId}`
    }

    const response = await fetch(`/api/scan-media?${scanParams}`)
    const localFiles = await response.json()
    
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
        cover: tracks[0].cover,
        description: `自动识别自 ${scanParams} 目录，共 ${tracks.length} 首歌`,
        tracks
      })
    }
  } catch (err) {
    console.warn('Failed to scan playlist directory, falling back to mock.', err)
  }

  // Fallback to generic mock tracks if folder is empty
  const tracks = Array.from({ length: 12 }, (_, i) => ({
    id: id * 1000 + i,
    name: `Mock Track ${i + 1}`,
    artist: 'Artist',
    album: 'Album',
    duration: '04:00',
    cover: `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+cover+${i}&image_size=square`,
    url: '/media/music1.mp3'
  }))

  return mockResponse({
    id,
    name: `歌单 ${id}`,
    cover: tracks[0].cover,
    description: '此歌单目录为空，显示 Mock 数据',
    tracks
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

export const searchMusic = async (keyword) => {
  const results = Array.from({ length: 10 }, (_, i) => ({
    id: 2000 + i,
    name: `${keyword} Result ${i + 1}`,
    artist: `Artist ${i + 1}`,
    album: `Search Album ${i + 1}`,
    duration: '03:45',
    cover: `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=search+result+${i}&image_size=square`,
    url: '/media/song.mp3'
  }))
  return mockResponse(results)
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