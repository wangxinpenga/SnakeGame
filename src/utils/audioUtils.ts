import { SoundType } from '../types/game';

// 音效管理类
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, AudioBuffer> = new Map();
  private musicSource: AudioBufferSourceNode | null = null;
  private isMuted = false;
  private volume = 0.7;
  private musicVolume = 0.3;

  constructor() {
    this.initAudioContext();
    this.generateSounds();
  }

  // 初始化音频上下文
  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // 生成游戏音效
  private generateSounds(): void {
    if (!this.audioContext) return;

    // 吃食物音效
    this.sounds.set('eat', this.createEatSound());
    
    // 游戏结束音效
    this.sounds.set('gameOver', this.createGameOverSound());
    
    // 移动音效（可选）
    this.sounds.set('move', this.createMoveSound());
    
    // 暂停音效
    this.sounds.set('pause', this.createPauseSound());
    
    // 升级音效
    this.sounds.set('levelUp', this.createLevelUpSound());
  }

  // 创建吃食物音效
  private createEatSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.1;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // 创建一个短促的上升音调
      const frequency = 800 + (t * 400);
      const envelope = Math.exp(-t * 10);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
    
    return buffer;
  }

  // 创建游戏结束音效
  private createGameOverSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.8;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // 创建下降的音调
      const frequency = 400 - (t * 300);
      const envelope = Math.exp(-t * 2);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
    }
    
    return buffer;
  }

  // 创建移动音效
  private createMoveSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.05;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 200;
      const envelope = Math.exp(-t * 20);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.1;
    }
    
    return buffer;
  }

  // 创建暂停音效
  private createPauseSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.2;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 600;
      const envelope = t < 0.1 ? t * 10 : (0.2 - t) * 10;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2;
    }
    
    return buffer;
  }

  // 创建升级音效
  private createLevelUpSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.5;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // 创建上升的和弦
      const freq1 = 440 + (t * 220);
      const freq2 = 550 + (t * 275);
      const envelope = Math.sin(t * Math.PI) * Math.exp(-t * 2);
      data[i] = (Math.sin(2 * Math.PI * freq1 * t) + Math.sin(2 * Math.PI * freq2 * t)) * envelope * 0.2;
    }
    
    return buffer;
  }

  // 播放音效
  public playSound(soundType: SoundType): void {
    if (!this.audioContext || this.isMuted || !this.sounds.has(soundType)) return;
    
    try {
      const buffer = this.sounds.get(soundType)!;
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = this.volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  // 播放背景音乐（简单的循环音调）
  public playBackgroundMusic(): void {
    if (!this.audioContext || this.isMuted) return;
    
    this.stopBackgroundMusic();
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
      
      gainNode.gain.value = this.musicVolume;
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start();
      
      // 创建简单的旋律变化
      const notes = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392, 440];
      let noteIndex = 0;
      
      const changeNote = () => {
        if (oscillator.frequency) {
          oscillator.frequency.setValueAtTime(notes[noteIndex], this.audioContext!.currentTime);
          noteIndex = (noteIndex + 1) % notes.length;
        }
      };
      
      const intervalId = setInterval(changeNote, 1000);
      
      // 保存引用以便停止
      (oscillator as any).intervalId = intervalId;
      this.musicSource = oscillator as any;
      
    } catch (error) {
      console.warn('Failed to play background music:', error);
    }
  }

  // 停止背景音乐
  public stopBackgroundMusic(): void {
    if (this.musicSource) {
      try {
        if ((this.musicSource as any).intervalId) {
          clearInterval((this.musicSource as any).intervalId);
        }
        this.musicSource.stop();
      } catch (error) {
        // 忽略已经停止的音源错误
      }
      this.musicSource = null;
    }
  }

  // 设置音量
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // 设置音乐音量
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  // 静音/取消静音
  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    }
  }

  // 设置静音状态
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopBackgroundMusic();
    }
  }

  // 获取静音状态
  public isMutedState(): boolean {
    return this.isMuted;
  }

  // 恢复音频上下文（用户交互后）
  public resumeAudioContext(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // 销毁音频管理器
  public destroy(): void {
    this.stopBackgroundMusic();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.sounds.clear();
  }
}

// 创建全局音频管理器实例
export const audioManager = new AudioManager();