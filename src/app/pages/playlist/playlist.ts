import {
  Component,
  computed,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { MusicService } from '../../core/services/music.service';
import { PlaylistService } from '../../core/services/playlist.service';

import {
  CatalogService,
  CatalogTrack
} from '../../core/services/catalog.service';

import { Playlist } from '../../core/models/playlist.model';
import { Song } from '../../core/models/song.model';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [],
  templateUrl: './playlist.html',
  styleUrl: './playlist.css'
})
export class PlaylistPage {

  /* =========================================================
     PLAYLIST STATE
     ========================================================= */

  readonly playlistId = signal('');

  readonly curatedSongs = signal<Song[]>([]);
  readonly isCuratedLoading = signal(false);
  readonly curatedError = signal('');

  private loadedCuratedPlaylistId = '';

  /* =========================================================
     CURRENT PLAYLIST
     ========================================================= */

  readonly playlist = computed<Playlist | undefined>(() => {
    const id = this.playlistId();

    if (!id) {
      return undefined;
    }

    return this.playlistService.getPlaylistById(id);
  });

  /* =========================================================
     CURATED PLAYLIST
     ========================================================= */

  readonly isCuratedPlaylist = computed(() => {
    const id = this.playlistId();

    if (!id) {
      return false;
    }

    return this.playlistService.isCuratedPlaylist(id);
  });

  /* =========================================================
     RECOMMENDED CURATED PLAYLISTS
     ========================================================= */

  readonly recommendedCuratedPlaylists = computed(() => {
    const currentId = this.playlistId();

    return this.playlistService
      .getCuratedPlaylists()
      .filter(playlist => playlist.id !== currentId);
  });

  /* =========================================================
     PLAYLIST SONGS
     ========================================================= */

  readonly songs = computed<Song[]>(() => {
    const id = this.playlistId();

    if (!id) {
      return [];
    }

    if (this.isCuratedPlaylist()) {
      return this.curatedSongs();
    }

    return this.playlistService.getSongsForPlaylist(id);
  });

  /* =========================================================
     CONSTRUCTOR
     ========================================================= */

  constructor(
    private readonly route: ActivatedRoute,
    public readonly router: Router,
    public readonly musicService: MusicService,
    public readonly playlistService: PlaylistService,
    private readonly catalogService: CatalogService
  ) {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') ?? '';

      this.playlistId.set(id);

      this.curatedSongs.set([]);
      this.curatedError.set('');
      this.loadedCuratedPlaylistId = '';

      if (id) {
        void this.loadCuratedPlaylistIfNeeded(id);
      }
    });
  }

  /* =========================================================
     LOAD CURATED PLAYLIST
     ========================================================= */

  private async loadCuratedPlaylistIfNeeded(
    playlistId: string
  ): Promise<void> {

    if (!this.playlistService.isCuratedPlaylist(playlistId)) {
      return;
    }

    if (
      this.loadedCuratedPlaylistId === playlistId &&
      this.curatedSongs().length
    ) {
      return;
    }

    const queries =
      this.playlistService.getCuratedQueries(playlistId);

    if (!queries.length) {
      this.curatedSongs.set([]);

      this.curatedError.set(
        'No catalog searches are configured for this playlist.'
      );

      return;
    }

    this.isCuratedLoading.set(true);
    this.curatedError.set('');

    try {

      const results = await Promise.all(
        queries.map(query =>
          this.catalogService.searchTracks(
            query,
            50
          )
        )
      );

      const allTracks = results.flat();

      const selectedTracks =
        this.selectBestTrackVersions(allTracks);

      const mappedSongs = selectedTracks
        .map(track =>
          this.catalogTrackToSong(track)
        )
        .filter(song =>
          !!song.audioUrl
        );

      const uniqueSongs =
        this.removeDuplicateSongs(mappedSongs)
          .slice(0, 60);

      this.curatedSongs.set(uniqueSongs);

      this.loadedCuratedPlaylistId = playlistId;

      if (!uniqueSongs.length) {
        this.curatedError.set(
          'No songs are available for this playlist right now.'
        );
      }

    } catch (error) {

      console.error(
        'ZUNO curated playlist error:',
        error
      );

      this.curatedSongs.set([]);

      this.curatedError.set(
        'Unable to load this playlist right now.'
      );

    } finally {
      this.isCuratedLoading.set(false);
    }
  }

  /* =========================================================
     PLAYBACK
     ========================================================= */

  playPlaylist(): void {
    const playlistSongs = this.songs();

    if (!playlistSongs.length) {
      return;
    }

    this.musicService.playQueue(
      playlistSongs,
      0
    );
  }

  playSong(
    song: Song,
    index: number
  ): void {

    const playlistSongs = this.songs();

    if (!playlistSongs.length) {
      return;
    }

    this.musicService.playQueue(
      playlistSongs,
      index
    );
  }

  toggleSong(
    song: Song,
    index: number
  ): void {

    if (this.isCurrentSong(song)) {
      this.musicService.togglePlayPause();
      return;
    }

    this.playSong(
      song,
      index
    );
  }

  isCurrentSong(
    song: Song
  ): boolean {

    return (
      this.musicService.currentSong()?.id ===
      song.id
    );
  }

  isPlaying(
    song: Song
  ): boolean {

    return (
      this.isCurrentSong(song) &&
      this.musicService.isPlaying()
    );
  }

  /* =========================================================
     LIKES
     ========================================================= */

  toggleLike(
    song: Song
  ): void {

    this.musicService.toggleLike(song);
  }

  isLiked(
    song: Song
  ): boolean {

    return this.musicService.isSongLiked(
      song.id
    );
  }

  /* =========================================================
     REMOVE SONG

     Curated playlists are generated automatically.
     Personal playlists can still remove songs normally.
     ========================================================= */

  removeSong(
    song: Song
  ): void {

    if (this.isCuratedPlaylist()) {
      return;
    }

    const currentPlaylist = this.playlist();

    if (!currentPlaylist) {
      return;
    }

    this.playlistService.removeSongFromPlaylist(
      currentPlaylist.id,
      song.id
    );
  }

  /* =========================================================
     RENAME PLAYLIST
     ========================================================= */

  renamePlaylist(): void {

    if (this.isCuratedPlaylist()) {
      return;
    }

    const currentPlaylist = this.playlist();

    if (!currentPlaylist) {
      return;
    }

    const newName = window.prompt(
      'Enter a new playlist name:',
      currentPlaylist.name
    );

    if (!newName?.trim()) {
      return;
    }

    this.playlistService.renamePlaylist(
      currentPlaylist.id,
      newName.trim()
    );
  }

  /* =========================================================
     EDIT DESCRIPTION
     ========================================================= */

  editDescription(): void {

    if (this.isCuratedPlaylist()) {
      return;
    }

    const currentPlaylist = this.playlist();

    if (!currentPlaylist) {
      return;
    }

    const description = window.prompt(
      'Enter playlist description:',
      currentPlaylist.description
    );

    if (description === null) {
      return;
    }

    this.playlistService.updateDescription(
      currentPlaylist.id,
      description
    );
  }

  /* =========================================================
     CLEAR PLAYLIST
     ========================================================= */

  clearPlaylist(): void {

    if (this.isCuratedPlaylist()) {
      return;
    }

    const currentPlaylist = this.playlist();

    if (
      !currentPlaylist ||
      !currentPlaylist.songIds.length
    ) {
      return;
    }

    const confirmed = window.confirm(
      'Remove all songs from this playlist?'
    );

    if (!confirmed) {
      return;
    }

    this.playlistService.clearPlaylist(
      currentPlaylist.id
    );
  }

  /* =========================================================
     DELETE PLAYLIST
     ========================================================= */

  deletePlaylist(): void {

    if (this.isCuratedPlaylist()) {
      return;
    }

    const currentPlaylist = this.playlist();

    if (!currentPlaylist) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${currentPlaylist.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.playlistService.deletePlaylist(
      currentPlaylist.id
    );

    void this.router.navigate([
      '/library'
    ]);
  }

  /* =========================================================
     OPEN RECOMMENDED PLAYLIST
     ========================================================= */

  openPlaylist(
    playlistId: string
  ): void {

    if (!playlistId) {
      return;
    }

    void this.router.navigate([
      '/playlist',
      playlistId
    ]);
  }

  /* =========================================================
     ARTIST NAVIGATION
     ========================================================= */

  openArtist(
    artistName: string
  ): void {

    const artist = artistName.trim();

    if (!artist) {
      return;
    }

    void this.router.navigate(
      ['/artist'],
      {
        queryParams: {
          name: artist
        }
      }
    );
  }

  /* =========================================================
     ALBUM NAVIGATION
     ========================================================= */

  openAlbum(
    albumName: string,
    artistName: string
  ): void {

    const album = albumName.trim();

    const artist =
      this.getPrimaryArtist(
        artistName
      );

    if (!album) {
      return;
    }

    void this.router.navigate(
      ['/album'],
      {
        queryParams: {
          name: album,
          artist
        }
      }
    );
  }

  /* =========================================================
     CATALOG TRACK SELECTION
     ========================================================= */

  private selectBestTrackVersions(
    tracks: CatalogTrack[]
  ): CatalogTrack[] {

    const bestTracks =
      new Map<string, CatalogTrack>();

    for (const track of tracks) {

      if (
        !track ||
        !track.trackName ||
        !track.artistName ||
        !track.previewUrl
      ) {
        continue;
      }

      const key =
        `${this.normalizeTrackTitle(track.trackName)}::` +
        `${this.normalizeArtist(track.artistName)}`;

      const existing =
        bestTracks.get(key);

      if (!existing) {

        bestTracks.set(
          key,
          track
        );

        continue;
      }

      if (
        this.getReleaseQualityScore(track) >
        this.getReleaseQualityScore(existing)
      ) {
        bestTracks.set(
          key,
          track
        );
      }
    }

    return Array.from(
      bestTracks.values()
    ).sort(
      (a, b) =>
        this.getReleaseQualityScore(b) -
        this.getReleaseQualityScore(a)
    );
  }

  /* =========================================================
     RELEASE QUALITY
     ========================================================= */

  private getReleaseQualityScore(
    track: CatalogTrack
  ): number {

    const album =
      this.normalize(
        track.collectionName ?? ''
      );

    let score = 100;

    const compilationTerms = [
      'best of',
      'greatest hits',
      'essentials',
      'essential',
      'collection',
      'anthology',
      'ultimate',
      'very best',
      'super hits',
      'mega hits',
      'top hits',
      'golden hits',
      'all time hits'
    ];

    for (const term of compilationTerms) {

      if (album.includes(term)) {
        score -= 60;
      }
    }

    const soundtrackTerms = [
      'original motion picture soundtrack',
      'original soundtrack',
      'motion picture soundtrack',
      'soundtrack'
    ];

    for (const term of soundtrackTerms) {

      if (album.includes(term)) {
        score += 35;
        break;
      }
    }

    if (album.includes('karaoke')) {
      score -= 60;
    }

    if (album.includes('instrumental')) {
      score -= 30;
    }

    if (album.includes('cover')) {
      score -= 50;
    }

    if (album.includes('remix')) {
      score -= 15;
    }

    if (track.artworkUrl100) {
      score += 10;
    }

    return score;
  }

  /* =========================================================
     CATALOG TRACK -> ZUNO SONG
     ========================================================= */

  private catalogTrackToSong(
    track: CatalogTrack
  ): Song {

    const id =
      `catalog-${track.trackId}`;

    const releaseYear =
      Number(
        track.releaseDate?.slice(
          0,
          4
        )
      ) ||
      new Date().getFullYear();

    return {
      id,

      title:
        track.trackName,

      artist:
        track.artistName,

      artistId:
        this.createId(
          'artist',
          track.artistName
        ),

      album:
        track.collectionName ||
        'Single',

      albumId:
        this.createId(
          'album',
          track.collectionName ||
          track.trackName
        ),

      coverImage:
        this.getLargeArtwork(
          track.artworkUrl100
        ),

      audioUrl:
        track.previewUrl,

      duration:
        Math.max(
          1,
          Math.round(
            track.trackTimeMillis / 1000
          )
        ),

      genre:
        track.primaryGenreName ||
        'Music',

      /*
       * CatalogService currently exposes the catalog region
       * through country. Until we add true language metadata,
       * this value remains the catalog region.
       */
      language:
        track.country ||
        'International',

      releaseYear,

      isLiked:
        this.musicService.isSongLiked(id),

      playCount: 0
    };
  }

  /* =========================================================
     DUPLICATE SONG REMOVAL
     ========================================================= */

  private removeDuplicateSongs(
    songs: Song[]
  ): Song[] {

    const unique =
      new Map<string, Song>();

    for (const song of songs) {

      const key =
        `${this.normalizeTrackTitle(song.title)}::` +
        `${this.normalizeArtist(song.artist)}`;

      if (!unique.has(key)) {
        unique.set(
          key,
          song
        );
      }
    }

    return Array.from(
      unique.values()
    );
  }

  /* =========================================================
     NORMALIZE TRACK TITLE
     ========================================================= */

  private normalizeTrackTitle(
    value: string
  ): string {

    return (value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .replace(
        /\([^)]*\)/g,
        ' '
      )
      .replace(
        /\[[^\]]*\]/g,
        ' '
      )
      .replace(
        /\b(remaster(?:ed)?|version|edit|single|radio edit)\b/g,
        ' '
      )
      .replace(
        /[^a-z0-9]+/g,
        ' '
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();
  }

  /* =========================================================
     NORMALIZE ARTIST
     ========================================================= */

  private normalizeArtist(
    value: string
  ): string {

    return (value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .replace(
        /\band\b/g,
        '&'
      )
      .replace(
        /[^a-z0-9&]+/g,
        ' '
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();
  }

  /* =========================================================
     ARTWORK
     ========================================================= */

  private getLargeArtwork(
    artworkUrl: string
  ): string {

    if (!artworkUrl) {
      return '';
    }

    return artworkUrl
      .replace(
        /100x100bb/g,
        '600x600bb'
      )
      .replace(
        /100x100/g,
        '600x600'
      );
  }

  /* =========================================================
     FORMAT DURATION
     ========================================================= */

  formatDuration(
    duration: number
  ): string {

    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return '0:00';
    }

    const minutes =
      Math.floor(duration / 60);

    const seconds =
      Math.floor(duration % 60);

    return (
      `${minutes}:` +
      seconds
        .toString()
        .padStart(2, '0')
    );
  }

  /* =========================================================
     TOTAL PLAYLIST DURATION
     ========================================================= */

  getTotalDuration(): string {

    const totalSeconds =
      this.songs().reduce(
        (total, song) =>
          total + song.duration,
        0
      );

    if (!totalSeconds) {
      return '0 min';
    }

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    const remainingMinutes =
      minutes % 60;

    return (
      `${hours} hr ` +
      `${remainingMinutes} min`
    );
  }

  /* =========================================================
     PRIMARY ARTIST
     ========================================================= */

  private getPrimaryArtist(
    artistCredit: string
  ): string {

    const credit =
      artistCredit.trim();

    if (!credit) {
      return '';
    }

    if (credit.includes(',')) {

      return (
        credit
          .replace(
            /\s+&\s+/g,
            ', '
          )
          .split(',')[0]
          ?.trim() ?? ''
      );
    }

    return credit;
  }

  /* =========================================================
     CREATE ID
     ========================================================= */

  private createId(
    prefix: string,
    value: string
  ): string {

    const normalized =
      value
        .toLowerCase()
        .trim()
        .replace(
          /[^a-z0-9]+/g,
          '-'
        )
        .replace(
          /^-+|-+$/g,
          ''
        );

    return `${prefix}-${normalized}`;
  }

  /* =========================================================
     NORMALIZE TEXT
     ========================================================= */

  private normalize(
    value: string
  ): string {

    return (value ?? '')
      .trim()
      .toLowerCase();
  }
}