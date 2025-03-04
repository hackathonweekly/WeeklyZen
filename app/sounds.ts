import { IconType } from './SoundIcon';

interface SoundData {
  id: string;
  name: string;
  category: string;
  iconType: IconType;
  audioUrl: string;
  isDefault?: boolean;
}

export const sounds: SoundData[] = [
  // 自然音效
  {
    id: 'forest-birds',
    name: '森林鸟鸣',
    category: '自然',
    iconType: 'forest',
    audioUrl: '/sounds/forest-birds.mp3'
  },
  {
    id: 'waves',
    name: '海浪',
    category: '自然',
    iconType: 'waves',
    audioUrl: '/sounds/waves.mp3'
  },
  {
    id: 'creek',
    name: '溪流',
    category: '自然',
    iconType: 'creek',
    audioUrl: '/sounds/creek.mp3',
    isDefault: true
  },
  {
    id: 'wind',
    name: '微风',
    category: '自然',
    iconType: 'wind',
    audioUrl: '/sounds/wind.mp3'
  },
  {
    id: 'leaves-rustling',
    name: '树叶沙沙',
    category: '自然',
    iconType: 'leaves',
    audioUrl: '/sounds/leaves-rustling.mp3'
  },
  {
    id: 'waterfall',
    name: '瀑布',
    category: '自然',
    iconType: 'waterfall',
    audioUrl: '/sounds/waterfall.mp3'
  },
  {
    id: 'bonfire',
    name: '篝火',
    category: '自然',
    iconType: 'fire',
    audioUrl: '/sounds/bonfire.mp3'
  },
  {
    id: 'beach',
    name: '海滩',
    category: '自然',
    iconType: 'beach',
    audioUrl: '/sounds/beach.mp3'
  },
  {
    id: 'forest-night',
    name: '夜晚森林',
    category: '自然',
    iconType: 'night-forest',
    audioUrl: '/sounds/forest-night.mp3'
  },

  // 雨声
  {
    id: 'rain-light',
    name: '小雨',
    category: '雨声',
    iconType: 'rain-light',
    audioUrl: '/sounds/rain-light.mp3'
  },
  {
    id: 'rain-heavy',
    name: '大雨',
    category: '雨声',
    iconType: 'rain-heavy',
    audioUrl: '/sounds/rain-heavy.mp3'
  },
  {
    id: 'rain-roof',
    name: '屋檐雨声',
    category: '雨声',
    iconType: 'rain-roof',
    audioUrl: '/sounds/rain-roof.mp3'
  },
  {
    id: 'rain-window',
    name: '窗外雨声',
    category: '雨声',
    iconType: 'rain-window',
    audioUrl: '/sounds/rain-window.mp3'
  },
  {
    id: 'rain-thunder',
    name: '雷雨',
    category: '雨声',
    iconType: 'thunder',
    audioUrl: '/sounds/rain-thunder.mp3'
  },
  {
    id: 'rain-leaves',
    name: '雨打树叶',
    category: '雨声',
    iconType: 'rain-leaves',
    audioUrl: '/sounds/rain-leaves.mp3'
  },
  {
    id: 'rain-puddle',
    name: '雨水潭',
    category: '雨声',
    iconType: 'rain-puddle',
    audioUrl: '/sounds/rain-puddle.mp3'
  },

  // 城市
  {
    id: 'city-traffic',
    name: '城市交通',
    category: '城市',
    iconType: 'traffic',
    audioUrl: '/sounds/city-traffic.mp3'
  },
  {
    id: 'cafe',
    name: '咖啡馆',
    category: '城市',
    iconType: 'cafe',
    audioUrl: '/sounds/cafe.mp3'
  },
  {
    id: 'keyboard',
    name: '键盘声',
    category: '城市',
    iconType: 'keyboard',
    audioUrl: '/sounds/keyboard.mp3'
  },
  {
    id: 'subway',
    name: '地铁',
    category: '城市',
    iconType: 'subway',
    audioUrl: '/sounds/subway.mp3'
  },
  {
    id: 'park',
    name: '公园',
    category: '城市',
    iconType: 'park',
    audioUrl: '/sounds/park.mp3'
  },
  {
    id: 'train',
    name: '火车',
    category: '城市',
    iconType: 'train',
    audioUrl: '/sounds/train.mp3'
  },

  // // 冥想: todo 这些音频不存在
  // {
  //   id: 'zen-bells',
  //   name: '禅铃',
  //   category: '冥想',
  //   iconType: 'bells',
  //   audioUrl: '/sounds/meditation/zen-bells.mp3'
  // },
  // {
  //   id: 'om-chanting',
  //   name: '唵咒',
  //   category: '冥想',
  //   iconType: 'om',
  //   audioUrl: '/sounds/meditation/om-chanting.mp3'
  // },
  // {
  //   id: 'tibetan-bowls',
  //   name: '藏碗',
  //   category: '冥想',
  //   iconType: 'bowl',
  //   audioUrl: '/sounds/meditation/tibetan-bowls.mp3'
  // },
  // {
  //   id: 'nature-meditation',
  //   name: '自然冥想',
  //   category: '冥想',
  //   iconType: 'nature',
  //   audioUrl: '/sounds/meditation/nature-meditation.mp3'
  // },
  // {
  //   id: 'zen-flute',
  //   name: '禅笛',
  //   category: '冥想',
  //   iconType: 'flute',
  //   audioUrl: '/sounds/meditation/zen-flute.mp3'
  // },
  // 结束声
  {
    id: 'temple-bells',
    name: '寺庙钟声',
    category: '结束声',
    iconType: 'bells',
    audioUrl: '/sounds/temple-bells.mp3'
  }
]
