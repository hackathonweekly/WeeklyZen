import { IconType } from './SoundIcon';

export interface SoundData {
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
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/forest-birds.mp3'
  },
  {
    id: 'waves',
    name: '海浪',
    category: '自然',
    iconType: 'waves',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/waves.mp3'
  },
  {
    id: 'creek',
    name: '溪流',
    category: '自然',
    iconType: 'creek',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/creek.mp3',
    isDefault: true
  },
  {
    id: 'wind',
    name: '微风',
    category: '自然',
    iconType: 'wind',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/wind.mp3'
  },
  {
    id: 'leaves-rustling',
    name: '树叶沙沙',
    category: '自然',
    iconType: 'leaves',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/leaves-rustling.mp3'
  },
  {
    id: 'waterfall',
    name: '瀑布',
    category: '自然',
    iconType: 'waterfall',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/waterfall.mp3'
  },
  {
    id: 'bonfire',
    name: '篝火',
    category: '自然',
    iconType: 'fire',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/bonfire.mp3'
  },
  {
    id: 'beach',
    name: '海滩',
    category: '自然',
    iconType: 'beach',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/beach.mp3'
  },
  {
    id: 'forest-night',
    name: '夜晚森林',
    category: '自然',
    iconType: 'night-forest',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/forest-night.mp3'
  },

  // 雨声
  {
    id: 'rain-light',
    name: '小雨',
    category: '雨声',
    iconType: 'rain-light',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/rain-light.mp3'
  },
  {
    id: 'rain-heavy',
    name: '大雨',
    category: '雨声',
    iconType: 'rain-heavy',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/rain-heavy.mp3'
  },
  {
    id: 'rain-roof',
    name: '屋檐雨声',
    category: '雨声',
    iconType: 'rain-roof',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/rain-roof.mp3'
  },
  {
    id: 'rain-window',
    name: '窗外雨声',
    category: '雨声',
    iconType: 'rain-window',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/rain-window.mp3'
  },
  {
    id: 'rain-thunder',
    name: '雷雨',
    category: '雨声',
    iconType: 'thunder',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/rain-thunder.mp3'
  },
  {
    id: 'rain-leaves',
    name: '雨打树叶',
    category: '雨声',
    iconType: 'rain-leaves',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/rain-leaves.mp3'
  },
  {
    id: 'rain-puddle',
    name: '雨水潭',
    category: '雨声',
    iconType: 'rain-puddle',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/rain-puddle.mp3'
  },

  // 城市
  {
    id: 'city-traffic',
    name: '城市交通',
    category: '城市',
    iconType: 'traffic',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/city-traffic.mp3'
  },
  {
    id: 'cafe',
    name: '咖啡馆',
    category: '城市',
    iconType: 'cafe',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/cafe.mp3'
  },
  {
    id: 'keyboard',
    name: '键盘声',
    category: '城市',
    iconType: 'keyboard',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/keyboard.mp3'
  },
  {
    id: 'subway',
    name: '地铁',
    category: '城市',
    iconType: 'subway',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/subway.mp3'
  },
  {
    id: 'park',
    name: '公园',
    category: '城市',
    iconType: 'park',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/park.mp3'
  },
  {
    id: 'train',
    name: '火车',
    category: '城市',
    iconType: 'train',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/train.mp3'
  },

  // 结束声
  {
    id: 'temple-bells',
    name: '寺庙钟声',
    category: '结束声',
    iconType: 'bells',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/temple-bells.mp3'
  },
  {
    id: 'bell',
    name: '铃声',
    category: '结束声',
    iconType: 'bells',
    audioUrl: 'https://objectstorageapi.gzg.sealos.run/e36y8btp-weeklyzen/audio/bg/bell.mp3'
  }
]
