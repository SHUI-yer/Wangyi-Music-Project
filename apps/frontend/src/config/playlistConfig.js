/**
 * 歌单分类与详情配置文件
 * 
 * 作用：统一管理首页分类跳转、文案介绍、以及对应的后端扫描目录。
 * 优势：如果需要修改文案、增加新的分类，只需修改此文件，无需改动任何组件逻辑。
 */

export const PLAYLIST_CONFIG = {
  // 华语经典
  201: {
    category: 'chinese',
    name: '华语经典',
    description: '精选华语流行金曲，带你重温那些年我们一起追过的声音。从老情歌到新潮流，每一首都值得单曲循环。',
    cover: '/assets/categories/chinese.jpg'
  },
  // 流行前线
  202: {
    category: 'pop',
    name: '流行前线',
    description: '汇集全球最新最热的流行榜单曲目。紧跟潮流节拍，感受当下的音乐脉搏。',
    cover: '/assets/categories/pop.jpg'
  },
  // 摇滚狂热
  203: {
    category: 'rock',
    name: '摇滚狂热',
    description: '强烈的节奏，嘶吼的吉他。这里有最纯粹的摇滚精神，点燃你内心的火焰。',
    cover: '/assets/categories/rock.jpg'
  },
  // 爵士心情
  204: {
    category: 'jazz',
    name: '爵士心情',
    description: '慵懒的午后，一杯咖啡，一首爵士。享受自由即兴的旋律，放松紧绷的神经。',
    cover: '/assets/categories/jazz.jpg'
  }
}

/**
 * 获取精品歌单的动态配置 (兜底方案)
 * @param {Number|String} id 歌单ID
 * @returns {Object} 歌单配置对象
 */
export const getFallbackPlaylistConfig = (id) => {
  const index = (id % 5) || 5
  const playlistId = `list${index}`
  return {
    playlistId: playlistId,
    name: `精品歌单 ${playlistId}`,
    description: `由网易云音乐达人精心挑选的精品歌单 ${playlistId}，带给你不一样的听觉体验。`,
    cover: `/assets/playlists/list${index}.jpg`
  }
}