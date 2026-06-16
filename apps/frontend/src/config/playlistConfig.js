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
    name: '摇滚|欢迎光临一个人的卧室solo', // 原: 精品歌单 list1
    description: '一个人在家里の时候，可以无拘无束地随心跳舞，音响永远比耳机更适合，那么今天开始要跟我一起跳舞吗',
    cover: '/assets/playlists/list1.jpg'
  },
  102: {
    playlistId: 'list2',
    name: 'emo尽头是释怀·单曲循环到天亮「华语流行」', // 原: 精品歌单 list2
    description: '人生是一场单程の旅行，其实有些遗憾，我们也没有从头再来の机会，与其纠结无法改变の过去，不如微笑着，珍惜未来，为生活，没有如果',
    cover: '/assets/playlists/list2.jpg'
  },
  103: {
    playlistId: 'list3',
    name: 'Alaina Castillo parallel universe pt.1', // 原: 精品歌单 list3
    description: '未来感十足!丝滑的转音加上甜美但又有力量的声线，让人一秒入迷。Alaina Castillo以其独特的声音和深情的演绎而广受到赞誉。她的声线自然而富有感染力，能够轻松地在流行音乐领域中展现实力。',
    cover: '/assets/playlists/list3.jpg'
  },
  104: {
    playlistId: 'list4',
    name: 'Troye Sivan 《Blue Neighbourhood (The Remixes)[Explicit]》', // 原: 精品歌单 list4
    description: '《Blue Neighbourhood》是Troye Sivan于2015年12月4日发行的首张专辑。专辑制作人是Emile Haynie和Troye Sivan。2016年，专辑歌曲《Youth》获得美国青少年选择奖“最佳男歌手单曲奖”提名。  奖项荣誉 ds&HonorN    第12届Melon音乐奖Melon Masic Awards     最佳POP奖(提名)',
    cover: '/assets/playlists/list4.jpg'
  },
  105: {
    playlistId: 'list5',
    name: 'Austin MahoneStory (Explicit)', // 原: 精品歌单 list5Austin MahoneStory (Explicit)
    description: '于2023年6月23日的乡村音乐，由Amper Music发行，它是一家位于美国纽约的人工智能音乐技术公司，成立于2014年。专辑“酝酿已久”。这张专辑标志着他脱离了最初以青少年流行音乐、舞曲流行音乐和R&B音乐而闻名的风格，转而采用更具乡村风格的声音。',
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