import React from 'react';
import { Music, Wind, Waves, Droplets, Cloud, CloudRain, Umbrella, CloudLightning, TreePine, Flame, Sun, Moon, Car, Coffee, Keyboard, Train, Bell, BookOpen } from 'lucide-react';

export type IconType = 
  | 'forest' 
  | 'waves' 
  | 'creek' 
  | 'wind' 
  | 'leaves' 
  | 'waterfall' 
  | 'fire' 
  | 'beach' 
  | 'night-forest'
  | 'rain-light'
  | 'rain-heavy'
  | 'rain-roof'
  | 'rain-window'
  | 'thunder'
  | 'rain-leaves'
  | 'rain-puddle'
  | 'traffic'
  | 'cafe'
  | 'keyboard'
  | 'subway'
  | 'park'
  | 'train'
  | 'bells'
  | 'course';

interface SoundIconProps {
  iconType: IconType;
  className?: string;
}

export function SoundIcon({ iconType, className = '' }: SoundIconProps) {
  const iconSize = 24;
  
  const getIcon = (type: IconType) => {
    switch (type) {
      case 'forest':
        return <TreePine size={iconSize} className={className} />;
      case 'waves':
      case 'beach':
        return <Waves size={iconSize} className={className} />;
      case 'creek':
      case 'waterfall':
        return <Droplets size={iconSize} className={className} />;
      case 'wind':
      case 'leaves':
        return <Wind size={iconSize} className={className} />;
      case 'fire':
        return <Flame size={iconSize} className={className} />;
      case 'night-forest':
        return <Moon size={iconSize} className={className} />;
      case 'rain-light':
      case 'rain-roof':
      case 'rain-window':
      case 'rain-leaves':
      case 'rain-puddle':
        return <CloudRain size={iconSize} className={className} />;
      case 'rain-heavy':
        return <Umbrella size={iconSize} className={className} />;
      case 'thunder':
        return <CloudLightning size={iconSize} className={className} />;
      case 'traffic':
        return <Car size={iconSize} className={className} />;
      case 'cafe':
        return <Coffee size={iconSize} className={className} />;
      case 'keyboard':
        return <Keyboard size={iconSize} className={className} />;
      case 'subway':
      case 'train':
        return <Train size={iconSize} className={className} />;
      case 'park':
        return <Sun size={iconSize} className={className} />;
      case 'bells':
        return <Bell size={iconSize} className={className} />;
      case 'course':
        return <BookOpen size={iconSize} className={className} />;
      default:
        return <Music size={iconSize} className={className} />;
    }
  };
  
  return (
    <span className={className}>
      {getIcon(iconType)}
    </span>
  );
}
