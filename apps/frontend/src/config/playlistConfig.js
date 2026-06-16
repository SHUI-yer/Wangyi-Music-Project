/**
 * 歌单分类与详情配置文件
 * 
 * 作用：统一管理首页分类跳转、文案介绍、以及对应的后端扫描目录。
 * 优势：如果需要修改文案、增加新的分类，只需修改此文件，无需改动任何组件逻辑。
 */

export const PLAYLIST_CONFIG = {
  // --- 首页推荐歌单 (精品系列) ---
  101: {
    playlistId: 'list1',
    name: '新歌好时光', // 原: 精品歌单 list1
    description: '精选近期最值得聆听的新歌，在旋律中感受时光的流动。',
    cover: '/assets/playlists/list1.jpg'
  },
  102: {
    playlistId: 'list2',
    name: '午后慵懒旋律', // 原: 精品歌单 list2
    description: '适合在午后阳光下聆听的轻快节奏，让心情随音符一起起舞。',
    cover: '/assets/playlists/list2.jpg'
  },
  103: {
    playlistId: 'list3',
    name: '深夜情感电台', // 原: 精品歌单 list3
    description: '在这个安静的夜晚，让音乐治愈你的所有不开心。',
    cover: '/assets/playlists/list3.jpg'
  },
  104: {
    playlistId: 'list4',
    name: '经典怀旧金曲', // 原: 精品歌单 list4
    description: '重温那些岁月的印记，每一首歌都是一段难忘的回忆。',
    cover: '/assets/playlists/list4.jpg'
  },
  105: {
    playlistId: 'list5',
    name: '动感节奏时刻', // 原: 精品歌单 list5
    description: '点燃你的运动激情，让强劲的鼓点带你突破极限。',
    cover: '/assets/playlists/list5.jpg'
  },

  // --- 风格分类歌单 ---
  201: {
    category: 'chinese',
    name: '华语经典',
    description: '精选华语流行金曲，带你重温那些年我们一起追过的声音。从老情歌到新潮流，每一首都值得单曲循环。',
    cover: '/assets/categories/chinese.png'
  },
  202: {
    category: 'pop',
    name: '流行前线',
    description: '汇集全球最新最热的流行榜单曲目。紧跟潮流节拍，感受当下的音乐脉搏。',
    cover: '/assets/categories/pop.png'
  },
  203: {
    category: 'rock',
    name: '摇滚狂热',
    description: '强烈的节奏，嘶吼的吉他。这里有最纯粹的摇滚精神，点燃你内心的火焰。',
    cover: '/assets/categories/rock.jpg'
  },
  204: {
    category: 'jazz',
    name: '爵士心情',
    description: '慵懒的午后，一杯咖啡，一首爵士。享受自由即兴的旋律，放松紧绷的神经。',
    cover: '/assets/categories/jazz.jpg'
  }
}

/**
 * 获取歌单的动态配置 (兜底方案)
 * @param {Number|String} id 歌单ID
 * @returns {Object} 歌单配置对象
 */
export const getPlaylistConfigById = (id) => {
  // 优先从显式配置中读取
  if (PLAYLIST_CONFIG[id]) {
    return PLAYLIST_CONFIG[id]
  }

  // 兜底逻辑：如果 ID 不在配置中，尝试动态生成（保持原有的 list1-list5 映射逻辑）
  const index = (id % 5) || 5
  const playlistId = `list${index}`
  return {
    playlistId: playlistId,
    name: `歌单 ${playlistId}`,
    description: `这是一个自动生成的歌单描述。`,
    cover: `/assets/playlists/list${index}.jpg`
  }
}