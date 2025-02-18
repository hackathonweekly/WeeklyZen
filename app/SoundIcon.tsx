import React from 'react';
import {
  Wind,
  Cloud,
  CloudRain,
  Waves,
  Trees,
  Bird,
  Music,
  Coffee,
  Umbrella,
  Leaf,
  Droplets,
  CloudLightning,
  Mountain,
  Flame,
  Sun,
  Moon,
  Keyboard,
  Train,
  Building2,
  Utensils,
  TreePine,
  Store,
  Bug
} from 'lucide-react';

export type IconType =
  | 'bells'
  | 'om'
  | 'bowl'
  | 'nature'
  | 'flute'
  | 'rain-light'
  | 'rain-heavy'
  | 'rain-roof'
  | 'rain-window'
  | 'thunder'
  | 'rain-umbrella'
  | 'rain-leaves'
  | 'rain-puddle'
  | 'rain-distant'
  | 'forest'
  | 'waves'
  | 'creek'
  | 'wind'
  | 'leaves'
  | 'waterfall'
  | 'fire'
  | 'beach'
  | 'night-forest'
  | 'traffic'
  | 'cafe'
  | 'keyboard'
  | 'subway'
  | 'office'
  | 'restaurant'
  | 'park'
  | 'market'
  | 'train'
  | 'birds'
  | 'crickets'
  | 'frogs'
  | 'seagulls'
  | 'wolves'
  | 'owls'
  | 'cats'
  | 'dolphins'
  | 'whales';

interface SoundIconProps {
  type: IconType;
  size?: number;
}

export const SoundIcon: React.FC<SoundIconProps> = ({ type, size = 24 }) => {
  const icons = {
    'bells': Moon,
    'om': Sun,
    'bowl': Moon,
    'nature': Trees,
    'flute': Music,
    'rain-light': CloudRain,
    'rain-heavy': Cloud,
    'rain-roof': CloudRain,
    'rain-window': CloudRain,
    'thunder': CloudLightning,
    'rain-umbrella': Umbrella,
    'rain-leaves': Leaf,
    'rain-puddle': Droplets,
    'rain-distant': Cloud,
    'forest': Trees,
    'waves': Waves,
    'creek': Wind,
    'wind': Wind,
    'leaves': Leaf,
    'waterfall': Mountain,
    'fire': Flame,
    'beach': Sun,
    'night-forest': Moon,
    'traffic': Music,
    'cafe': Coffee,
    'keyboard': Keyboard,
    'subway': Train,
    'office': Building2,
    'restaurant': Utensils,
    'park': TreePine,
    'market': Store,
    'train': Train,
    'birds': Bird,
    'crickets': Bug,
    'frogs': Bug,
    'seagulls': Bird,
    'wolves': Music,
    'owls': Moon,
    'cats': Music,
    'dolphins': Music,
    'whales': Music
  };

  const IconComponent = icons[type];
  return <IconComponent size={size} />;
};
