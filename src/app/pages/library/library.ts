import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { MusicService } from '../../core/services/music.service';
import { PlaylistService } from '../../core/services/playlist.service';

import { Song } from '../../core/models/song.model';
import { Playlist } from '../../core/models/playlist.model';

type LibraryFilter = 'all' | 'playlists' | 'artists' | 'albums';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [],
  templateUrl: './library.html',
  styleUrl: './library.css'
})
export class Library {
  activeFilter: LibraryFilter = 'all';

  constructor(
    public readonly musicService: MusicService,
    public readonly playlistService: PlaylistService,
    private readonly router: Router
  ) {}

  get playlists(): Playlist[] {
    return this.playlistService.playlists();
  }

  get likedSongs(): Song[] {
    return this.musicService.likedSongs();
  }

  get likedSongsCount(): number {
    return this.musicService.likedSongsCount();
  }

  setFilter(filter: LibraryFilter): void {
    this.activeFilter = filter;
  }

  isFilterActive(filter: LibraryFilter): boolean {
    return this.activeFilter === filter;
  }

  showPlaylists(): boolean {
    return (
      this.activeFilter === 'all' ||
      this.activeFilter === 'playlists'
    );
  }

  showArtists(): boolean {
    return (
      this.activeFilter === 'all' ||
      this.activeFilter === 'artists'
    );
  }

  showAlbums(): boolean {
    return (
      this.activeFilter === 'all' ||
      this.activeFilter === 'albums'
    );
  }

  openLikedSongs(): void {
    void this.router.navigate(['/liked-songs']);
  }

  playLikedSongs(event: Event): void {
    event.stopPropagation();

    if (!this.likedSongs.length) {
      return;
    }

    this.musicService.playLikedSongs();
  }

  openPlaylist(playlistId: string): void {
    void this.router.navigate([
      '/playlist',
      playlistId
    ]);
  }

  createPlaylist(): void {
    const name = window.prompt(
      'Enter playlist name:',
      'My Playlist'
    );

    if (!name?.trim()) {
      return;
    }

    const playlist = this.playlistService.createPlaylist(
      name.trim()
    );

    void this.router.navigate([
      '/playlist',
      playlist.id
    ]);
  }

  openArtist(artistName: string): void {
    const artist = artistName.trim();

    if (!artist) {
      return;
    }

    void this.router.navigate(['/artist'], {
      queryParams: {
        name: artist
      }
    });
  }

  openAlbum(
    albumName: string,
    artistName: string
  ): void {
    const album = albumName.trim();
    const artist = this.getPrimaryArtist(artistName);

    if (!album) {
      return;
    }

    void this.router.navigate(['/album'], {
      queryParams: {
        name: album,
        artist
      }
    });
  }

  getRecentLikedSongs(): Song[] {
    return this.likedSongs.slice(0, 6);
  }

  getLibraryAlbums(): Song[] {
    const uniqueAlbums = new Map<string, Song>();

    for (const song of this.likedSongs) {
      const key = `${song.album}-${song.artist}`.toLowerCase();

      if (!uniqueAlbums.has(key)) {
        uniqueAlbums.set(key, song);
      }
    }

    return Array.from(uniqueAlbums.values()).slice(0, 8);
  }

  getLibraryArtists(): string[] {
    const artists = new Set<string>();

    for (const song of this.likedSongs) {
      for (const artist of this.getArtists(song.artist)) {
        artists.add(artist);
      }
    }

    return Array.from(artists).slice(0, 8);
  }

  getArtists(artistCredit: string): string[] {
    const credit = artistCredit.trim();

    if (!credit) {
      return [];
    }

    if (credit.includes(',')) {
      return credit
        .replace(/\s+&\s+/g, ', ')
        .split(',')
        .map(artist => artist.trim())
        .filter(Boolean);
    }

    return [credit];
  }

  getArtistInitial(artistName: string): string {
    return artistName
      .trim()
      .charAt(0)
      .toUpperCase();
  }

  getPlaylistInitials(name: string): string {
    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) {
      return '♪';
    }

    if (words.length === 1) {
      return words[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[1][0]
    ).toUpperCase();
  }

  getPlaylistSongCount(playlist: Playlist): number {
    return playlist.songIds.length;
  }

  private getPrimaryArtist(artistCredit: string): string {
    const artists = this.getArtists(artistCredit);

    return artists.length > 0
      ? artists[0]
      : artistCredit.trim();
  }
}