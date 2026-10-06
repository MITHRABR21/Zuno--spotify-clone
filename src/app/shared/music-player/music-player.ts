import { Component, signal } from '@angular/core';
import { MusicService } from '../../core/services/music.service';
import { Song } from '../../core/models/song.model';
import {
  LyricsResult,
  LyricsService
} from '../../core/services/lyrics.service';

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [],
  templateUrl: './music-player.html',
  styleUrl: './music-player.css'
})
export class MusicPlayer {
  readonly showLyrics = signal(false);
  readonly showQueue = signal(false);
  readonly showNowPlaying = signal(false);

  readonly lyrics = signal<LyricsResult | null>(null);
  readonly isLyricsLoading = signal(false);
  readonly lyricsError = signal('');

  private loadedSongId: string | null = null;

  constructor(
    public readonly musicService: MusicService,
    private readonly lyricsService: LyricsService
  ) {}

  async toggleLyrics(): Promise<void> {
    const song = this.musicService.currentSong();

    if (!song) {
      return;
    }

    if (this.showLyrics()) {
      this.closeLyrics();
      return;
    }

    this.closeAllPanels();

    this.showLyrics.set(true);

    if (
      this.loadedSongId === song.id &&
      this.lyrics()
    ) {
      return;
    }

    await this.loadLyrics();
  }

  closeLyrics(): void {
    this.showLyrics.set(false);
  }

  toggleQueue(): void {
    if (this.showQueue()) {
      this.closeQueue();
      return;
    }

    this.closeAllPanels();
    this.showQueue.set(true);
  }

  closeQueue(): void {
    this.showQueue.set(false);
  }

  toggleNowPlaying(): void {
    const song = this.musicService.currentSong();

    if (!song) {
      return;
    }

    if (this.showNowPlaying()) {
      this.closeNowPlaying();
      return;
    }

    this.closeAllPanels();
    this.showNowPlaying.set(true);
  }

  closeNowPlaying(): void {
    this.showNowPlaying.set(false);
  }

  private closeAllPanels(): void {
    this.showLyrics.set(false);
    this.showQueue.set(false);
    this.showNowPlaying.set(false);
  }

  playQueueSong(song: Song): void {
    this.musicService.playSong(song);
  }

  isCurrentQueueSong(song: Song): boolean {
    return (
      this.musicService.currentSong()?.id === song.id
    );
  }

  getUpcomingQueue(): Song[] {
    const queue = this.musicService.queue();

    const currentIndex =
      this.musicService.currentIndex();

    if (!queue.length) {
      return [];
    }

    if (currentIndex < 0) {
      return queue;
    }

    return queue.slice(currentIndex + 1);
  }

  getQueuePosition(song: Song): number {
    return (
      this.musicService.queue().findIndex(
        queueSong => queueSong.id === song.id
      ) + 1
    );
  }

  getProgressPercentage(): number {
    const duration =
      this.musicService.duration();

    const currentTime =
      this.musicService.currentTime();

    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (currentTime / duration) * 100
      )
    );
  }

  async loadLyrics(): Promise<void> {
    const song = this.musicService.currentSong();

    if (!song) {
      this.lyrics.set(null);
      this.lyricsError.set('');
      return;
    }

    this.isLyricsLoading.set(true);
    this.lyricsError.set('');
    this.lyrics.set(null);

    try {
      const result =
        await this.lyricsService.getLyrics(
          song.title,
          song.artist,
          song.album
        );

      if (!result) {
        this.loadedSongId = null;

        this.lyricsError.set(
          `Lyrics are not available for "${song.title}".`
        );

        return;
      }

      this.lyrics.set(result);
      this.loadedSongId = song.id;

    } catch (error) {
      console.error(
        'ZUNO lyrics error:',
        error
      );

      this.loadedSongId = null;

      this.lyricsError.set(
        'Unable to load lyrics right now. Please try again.'
      );

    } finally {
      this.isLyricsLoading.set(false);
    }
  }

  formatTime(seconds: number): string {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return '0:00';
    }

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  onSeek(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.musicService.seek(
      Number(input.value)
    );
  }

  onVolumeChange(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    this.musicService.setVolume(
      Number(input.value)
    );
  }
}