import { Component, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { MusicService } from '../../core/services/music.service';
import { PlaylistService } from '../../core/services/playlist.service';

import {
  CatalogService,
  CatalogTrack
} from '../../core/services/catalog.service';

import { Song } from '../../core/models/song.model';
import { Playlist } from '../../core/models/playlist.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search implements OnDestroy {
  readonly query = signal('');
  readonly results = signal<Song[]>([]);
  readonly isLoading = signal(false);
  readonly searchError = signal('');
  readonly playlistMenuSongId = signal<string | null>(null);

  private searchRequestId = 0;
  private searchTimer: ReturnType<typeof setTimeout> | undefined;
  private destroyed = false;

  private readonly routeSubscription: Subscription;

  constructor(
    public readonly musicService: MusicService,
    public readonly playlistService: PlaylistService,
    private readonly catalogService: CatalogService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.routeSubscription = this.route.queryParamMap.subscribe(
      params => {
        this.clearSearchTimer();

        const searchQuery = params.get('q') ?? '';

        this.query.set(searchQuery);

        ++this.searchRequestId;

        this.results.set([]);
        this.searchError.set('');
        this.isLoading.set(false);

        if (searchQuery.trim()) {
          void this.searchCatalog(searchQuery);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.destroyed = true;

    ++this.searchRequestId;

    this.clearSearchTimer();
    this.routeSubscription.unsubscribe();
  }

  get playlists(): Playlist[] {
    return this.playlistService.playlists();
  }

  async onSearch(event: Event): Promise<void> {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const searchValue = target.value;

    this.query.set(searchValue);
    this.clearSearchTimer();

    // Prevent older requests from replacing the current results.
    ++this.searchRequestId;

    this.results.set([]);
    this.searchError.set('');
    this.isLoading.set(false);

    if (!searchValue.trim()) {
      await this.updateSearchUrl('');
      return;
    }

    this.searchTimer = setTimeout(() => {
      this.searchTimer = undefined;

      if (!this.destroyed) {
        void this.updateSearchUrl(searchValue);
      }
    }, 600);
  }

  async searchCategory(category: string): Promise<void> {
    this.clearSearchTimer();

    ++this.searchRequestId;

    this.query.set(category);
    this.results.set([]);
    this.searchError.set('');
    this.isLoading.set(false);

    await this.updateSearchUrl(category);
  }

  private clearSearchTimer(): void {
    if (this.searchTimer !== undefined) {
      clearTimeout(this.searchTimer);
      this.searchTimer = undefined;
    }
  }

  getArtists(artistCredit: string): string[] {
    return artistCredit
      .trim()
      .replace(/\s+&\s+/g, ', ')
      .split(',')
      .map(artist => artist.trim())
      .filter(artist => artist.length > 0);
  }

  openArtist(artistName: string): void {
    const cleanArtistName = artistName.trim();

    if (!cleanArtistName) {
      return;
    }

    void this.router.navigate(['/artist'], {
      queryParams: {
        name: cleanArtistName
      }
    });
  }

  openAlbum(albumName: string, artistName: string): void {
    const cleanAlbumName = albumName.trim();

    if (!cleanAlbumName) {
      return;
    }

    const artists = this.getArtists(artistName);
    const primaryArtist = artists[0] ?? artistName.trim();

    void this.router.navigate(['/album'], {
      queryParams: {
        name: cleanAlbumName,
        artist: primaryArtist
      }
    });
  }

  openPlaylist(playlistId: string): void {
    this.closePlaylistMenu();

    void this.router.navigate(['/playlist', playlistId]);
  }

  playSong(song: Song): void {
    if (this.isCurrentSong(song)) {
      this.musicService.togglePlayPause();
      return;
    }

    this.musicService.playSong(song);
  }

  playResultQueue(startIndex: number): void {
    const songs = this.results();

    if (!songs.length) {
      return;
    }

    this.musicService.playQueue(songs, startIndex);
  }

  isCurrentSong(song: Song): boolean {
    return this.musicService.currentSong()?.id === song.id;
  }

  isPlaying(song: Song): boolean {
    return (
      this.isCurrentSong(song) &&
      this.musicService.isPlaying()
    );
  }

  toggleLike(song: Song): void {
    this.musicService.toggleLike(song);
  }

  isLiked(song: Song): boolean {
    return this.musicService.isSongLiked(song.id);
  }

  togglePlaylistMenu(song: Song, event?: Event): void {
    event?.stopPropagation();

    this.playlistMenuSongId.set(
      this.isPlaylistMenuOpen(song) ? null : song.id
    );
  }

  isPlaylistMenuOpen(song: Song): boolean {
    return this.playlistMenuSongId() === song.id;
  }

  closePlaylistMenu(): void {
    this.playlistMenuSongId.set(null);
  }

  addToPlaylist(
    song: Song,
    playlistId: string,
    event?: Event
  ): void {
    event?.stopPropagation();

    if (this.isSongInPlaylist(song, playlistId)) {
      this.playlistService.removeSongFromPlaylist(
        playlistId,
        song.id
      );
    } else {
      this.playlistService.addSongToPlaylist(
        playlistId,
        song
      );
    }
  }

  isSongInPlaylist(song: Song, playlistId: string): boolean {
    return this.playlistService.isSongInPlaylist(
      playlistId,
      song.id
    );
  }

  createPlaylistForSong(song: Song, event?: Event): void {
    event?.stopPropagation();

    const playlistName = window.prompt(
      'Enter playlist name:',
      'My Playlist'
    );

    if (!playlistName?.trim()) {
      return;
    }

    const playlist = this.playlistService.createPlaylist(
      playlistName.trim()
    );

    this.playlistService.addSongToPlaylist(
      playlist.id,
      song
    );

    this.closePlaylistMenu();

    const shouldOpen = window.confirm(
      `"${playlist.name}" was created and the song was added.\n\nOpen the playlist now?`
    );

    if (shouldOpen) {
      this.openPlaylist(playlist.id);
    }
  }

  private async updateSearchUrl(
    searchValue: string
  ): Promise<void> {
    if (this.destroyed) {
      return;
    }

    const cleanValue = searchValue
      .trim()
      .replace(/\s+/g, ' ');

    const currentValue = (
      this.route.snapshot.queryParamMap.get('q') ?? ''
    )
      .trim()
      .replace(/\s+/g, ' ');

    if (cleanValue === currentValue) {
      if (cleanValue) {
        await this.searchCatalog(cleanValue);
      }

      return;
    }

    await this.router.navigate(['/search'], {
      queryParams: cleanValue ? { q: cleanValue } : {},
      replaceUrl: true
    });
  }

  private async searchCatalog(
    searchValue: string
  ): Promise<void> {
    const cleanValue = searchValue.trim();

    if (!cleanValue || this.destroyed) {
      return;
    }

    const requestId = ++this.searchRequestId;

    this.isLoading.set(true);
    this.searchError.set('');

    try {
      const tracks = await this.catalogService.searchTracks(
        cleanValue,
        40
      );

      if (
        this.destroyed ||
        requestId !== this.searchRequestId
      ) {
        return;
      }

      this.results.set(
        tracks.map(track => this.convertTrackToSong(track))
      );
    } catch (error) {
      if (
        this.destroyed ||
        requestId !== this.searchRequestId
      ) {
        return;
      }

      console.error('ZUNO search error:', error);

      this.results.set([]);

      this.searchError.set(
        'Could not connect to the music catalogue. Please try again later.'
      );
    } finally {
      if (
        !this.destroyed &&
        requestId === this.searchRequestId
      ) {
        this.isLoading.set(false);
      }
    }
  }

  private convertTrackToSong(track: CatalogTrack): Song {
    const songId = `catalog-${track.trackId}`;

    return {
      id: songId,
      title: track.trackName || 'Unknown Track',
      artist: track.artistName || 'Unknown Artist',

      artistId: this.createId(
        track.artistName || 'unknown-artist'
      ),

      album: track.collectionName || 'Unknown Album',

      albumId: this.createId(
        `${track.collectionName}-${track.artistName}`
      ),

      coverImage: this.getLargeArtwork(
        track.artworkUrl100
      ),

      audioUrl: track.previewUrl || '',

      // The player reads the actual preview duration
      // after the audio metadata loads.
      duration: 0,

      genre: track.primaryGenreName || 'Music',

      // Country identifies the store, not song language.
      language: 'Unknown',

      releaseYear: this.getReleaseYear(
        track.releaseDate
      ),

      isLiked: this.musicService.isSongLiked(songId),
      playCount: 0,
      addedAt: new Date().toISOString()
    };
  }

  private getLargeArtwork(artworkUrl: string): string {
    return (artworkUrl || '').replace(
      /100x100(?:bb)?/g,
      '600x600bb'
    );
  }

  private getReleaseYear(releaseDate: string): number {
    const year = new Date(releaseDate).getFullYear();

    return Number.isFinite(year)
      ? year
      : new Date().getFullYear();
  }

  private createId(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}