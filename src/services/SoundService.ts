export class SoundService {
  private static instance: SoundService;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  private constructor() {
    this.initAudioContext();
  }

  static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  private initAudioContext(): void {
    try {
      // Создаем AudioContext только при первом взаимодействии пользователя
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('[SOUND] AudioContext not supported:', error);
    }
  }

  private async ensureAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    if (this.audioContext?.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('[SOUND] Failed to resume AudioContext:', error);
      }
    }
  }

  // Создать звук программно (без внешних файлов)
  private async createNotificationSound(): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5; // 500ms
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Создаем приятный звук уведомления (двойной тон)
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;

      // Первая нота (800Hz) на первые 200ms
      const note1 = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 3);

      // Вторая нота (1000Hz) с задержкой 150ms
      const note2 = t > 0.15 ? Math.sin(2 * Math.PI * 1000 * (t - 0.15)) * Math.exp(-(t - 0.15) * 3) : 0;

      data[i] = (note1 + note2) * 0.3; // Уменьшаем громкость
    }

    return buffer;
  }

  // Воспроизвести звук уведомления
  async playNotificationSound(): Promise<void> {
    try {
      await this.ensureAudioContext();

      if (!this.audioContext) {
        console.warn('[SOUND] AudioContext not available');
        return;
      }

      let buffer = this.sounds.get('notification');

      if (!buffer) {
        buffer = await this.createNotificationSound();
        if (buffer) {
          this.sounds.set('notification', buffer);
        }
      }

      if (buffer) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        // Настройка громкости
        gainNode.gain.value = 0.5;

        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();

        console.log('[SOUND] Notification sound played');
      }
    } catch (error) {
      console.warn('[SOUND] Failed to play notification sound:', error);
    }
  }

  // Воспроизвести срочное уведомление (более резкий звук)
  async playUrgentNotificationSound(): Promise<void> {
    try {
      await this.ensureAudioContext();

      if (!this.audioContext) return;

      // Создаем более резкий звук для срочных уведомлений
      const sampleRate = this.audioContext.sampleRate;
      const duration = 0.8;
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;

        // Три быстрых тона (900Hz, 1100Hz, 1300Hz)
        const note1 = t < 0.2 ? Math.sin(2 * Math.PI * 900 * t) * Math.exp(-t * 2) : 0;
        const note2 = t > 0.15 && t < 0.35 ? Math.sin(2 * Math.PI * 1100 * (t - 0.15)) * Math.exp(-(t - 0.15) * 2) : 0;
        const note3 = t > 0.3 ? Math.sin(2 * Math.PI * 1300 * (t - 0.3)) * Math.exp(-(t - 0.3) * 2) : 0;

        data[i] = (note1 + note2 + note3) * 0.4;
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.7;

      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start();

      console.log('[SOUND] Urgent notification sound played');
    } catch (error) {
      console.warn('[SOUND] Failed to play urgent notification sound:', error);
    }
  }

  // Проверить поддержку звука
  isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  // Инициализация при первом взаимодействии пользователя
  async initUserInteraction(): Promise<void> {
    try {
      await this.ensureAudioContext();
      // Проигрываем беззвучный звук для инициализации
      if (this.audioContext) {
        const source = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate);
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start();
        console.log('[SOUND] Audio context initialized');
      }
    } catch (error) {
      console.warn('[SOUND] Failed to initialize audio on user interaction:', error);
    }
  }
}

// Экспортируем singleton instance
export const soundService = SoundService.getInstance();