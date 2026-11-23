"use client";

type MusicStateListener = (isPlaying: boolean, currentTime: number) => void;

class BackgroundMusicController {
  private audio: HTMLAudioElement | null = null;
  private listeners = new Set<MusicStateListener>();
  private _isPlaying = false;

  private getAudio(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (!this.audio) {
      const audio = new Audio("/audio/3D_scene violin_auto_music.mp3");
      audio.loop = true;
      audio.volume = 0.65;

      audio.addEventListener("play", () => {
        this._isPlaying = true;
        this.notify();
      });

      audio.addEventListener("pause", () => {
        this._isPlaying = false;
        this.notify();
      });

      audio.addEventListener("ended", () => {
        this._isPlaying = false;
        this.notify();
      });

      this.audio = audio;
    }
    return this.audio;
  }

  public get isPlaying(): boolean {
    return this._isPlaying;
  }

  public get currentTime(): number {
    return this.audio ? this.audio.currentTime : 0;
  }

  public async play(): Promise<void> {
    const audio = this.getAudio();
    if (!audio) return;
    try {
      await audio.play();
    } catch (err) {
      console.warn("Background music play blocked or requires user interaction:", err);
    }
  }

  public pause(): void {
    const audio = this.getAudio();
    if (!audio) return;
    audio.pause();
  }

  public async toggle(): Promise<void> {
    if (this._isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
  }

  public subscribe(listener: MusicStateListener): () => void {
    this.listeners.add(listener);
    // Immediately inform subscriber of current state
    listener(this._isPlaying, this.currentTime);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const playing = this._isPlaying;
    const time = this.currentTime;
    this.listeners.forEach((listener) => {
      try {
        listener(playing, time);
      } catch (err) {
        console.error("Error in background music listener:", err);
      }
    });
  }
}

export const backgroundMusic = new BackgroundMusicController();
