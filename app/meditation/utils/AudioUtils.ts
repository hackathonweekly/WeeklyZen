// 音频上下文管理
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private activeAudioSources: AudioBufferSourceNode[] = [];
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  
  // 初始化音频上下文
  public initAudioContext(): AudioContext {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('创建音频上下文失败:', error);
        throw error;
      }
    }
    return this.audioContext;
  }
  
  // 加载音频缓冲区
  public async loadAudioBuffer(url: string, key: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    // 如果已经加载过，直接返回
    if (this.audioBuffers.has(key)) {
      return this.audioBuffers.get(key)!;
    }
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      
      // 缓存音频缓冲区
      this.audioBuffers.set(key, audioBuffer);
      
      return audioBuffer;
    } catch (error) {
      console.error(`加载音频失败 (${key}):`, error);
      throw error;
    }
  }
  
  // 播放音频
  public playSound(buffer: AudioBuffer, volume: number = 1, loop: boolean = false): AudioBufferSourceNode {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    // 创建音频源
    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    
    // 创建增益节点（用于控制音量）
    const gainNode = this.audioContext!.createGain();
    gainNode.gain.value = volume;
    
    // 连接节点
    source.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);
    
    // 开始播放
    source.start();
    
    // 添加到活跃音频源列表
    this.activeAudioSources.push(source);
    
    // 当音频播放结束时，从活跃列表中移除
    source.onended = () => {
      const index = this.activeAudioSources.indexOf(source);
      if (index !== -1) {
        this.activeAudioSources.splice(index, 1);
      }
    };
    
    return source;
  }
  
  // 停止所有音频
  public stopAllSounds(): void {
    for (const source of this.activeAudioSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (error) {
        console.error('停止音频源失败:', error);
      }
    }
    
    // 清空活跃音频源列表
    this.activeAudioSources = [];
  }
  
  // 关闭音频上下文
  public async closeAudioContext(): Promise<void> {
    // 先停止所有音频
    this.stopAllSounds();
    
    // 关闭音频上下文
    if (this.audioContext) {
      try {
        await this.audioContext.close();
        this.audioContext = null;
      } catch (error) {
        console.error('关闭音频上下文失败:', error);
        throw error;
      }
    }
  }
} 