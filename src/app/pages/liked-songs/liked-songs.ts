import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MusicService } from '../../core/services/music.service';
import { Song } from '../../core/models/song.model';

@Component({
  selector: 'app-liked-songs',
  standalone: true,
  imports: [],
  templateUrl: './liked-songs.html',
  styleUrl: './liked-songs.css'
})
export class LikedSongs {

  constructor(
    public readonly musicService: MusicService,
    private readonly router: Router
  ) {}

  get songs(): Song[] {
    return this.musicService.likedSongs();
  }

  get songCount(): number {
    return this.musicService.likedSongsCount();
  }

  playAll(): void {
    if (!this.songs.length) return;
    this.musicService.playLikedSongs();
  }

  playSong(song: Song, index: number): void {
    if (!song) return;
    this.musicService.playQueue(this.songs, index);
  }

  toggleSong(song: Song, index: number): void {
    if (this.isCurrentSong(song)) {
      this.musicService.togglePlayPause();
      return;
    }

    this.playSong(song, index);
  }

  isCurrentSong(song: Song): boolean {
    return this.musicService.currentSong()?.id === song.id;
  }

  isPlaying(song: Song): boolean {
    return this.isCurrentSong(song) && this.musicService.isPlaying();
  }

  toggleLike(song: Song): void {
    this.musicService.toggleLike(song);
  }

  isLiked(song: Song): boolean {
    return this.musicService.isSongLiked(song.id);
  }

  toggleShuffle(): void {
    this.musicService.toggleShuffle();

    if (!this.musicService.currentSong() && this.songs.length) {
      this.musicService.playLikedSongs();
    }
  }

  isShuffleEnabled(): boolean {
    return this.musicService.isShuffleEnabled();
  }

  openArtist(artistName: string): void {
    const artist = artistName.trim();
    if (!artist) return;

    void this.router.navigate(['/artist'], {
      queryParams: { name: artist }
    });
  }

  openAlbum(albumName: string, artistName: string): void {
    const album = albumName.trim();
    const artist = this.getPrimaryArtist(artistName);

    if (!album) return;

    void this.router.navigate(['/album'], {
      queryParams: {
        name: album,
        artist
      }
    });
  }

  private getPrimaryArtist(artistCredit: string): string {
    const credit = artistCredit.trim();
    if (!credit) return '';

    if (credit.includes(',')) {
      return credit
        .replace(/\s+&\s+/g, ', ')
        .split(',')[0]
        ?.trim() ?? '';
    }

    return credit;
  }

  formatDuration(duration: number): string {
    if (!Number.isFinite(duration) || duration <= 0) {
      return '0:00';
    }

    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  clearAll(): void {
    if (!this.songs.length) return;

    const confirmed = window.confirm(
      'Remove all songs from Liked Songs?'
    );

    if (confirmed) {
      this.musicService.clearLikedSongs();
    }
  }
}