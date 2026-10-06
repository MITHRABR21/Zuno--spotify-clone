import {
  Component,
  OnDestroy,
  signal
} from '@angular/core';

import {
  ActivatedRoute
} from '@angular/router';

import {
  Subscription
} from 'rxjs';

import {
  CatalogService,
  CatalogTrack
} from '../../core/services/catalog.service';

import {
  MusicService
} from '../../core/services/music.service';

import {
  Song
} from '../../core/models/song.model';

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [],
  templateUrl: './album.html',
  styleUrl: './album.css'
})
export class Album implements OnDestroy {

  readonly albumName = signal('');
  readonly artistName = signal('');
  readonly albumImage = signal('');
  readonly songs = signal<Song[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly isLiked = signal(false);

  private readonly routeSubscription: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly catalogService: CatalogService,
    public readonly musicService: MusicService
  ) {

    this.routeSubscription =
      this.route.queryParamMap.subscribe(
        params => {

          const album =
            params.get('name') ?? '';

          const artist =
            params.get('artist') ?? '';

          if (!album.trim()) {

            this.albumName.set('Album');
            this.artistName.set(artist);
            this.songs.set([]);

            return;
          }

          this.albumName.set(album);
          this.artistName.set(artist);

          void this.loadAlbum(
            album,
            artist
          );

        }
      );

  }

  ngOnDestroy(): void {

    this.routeSubscription.unsubscribe();

  }

  private async loadAlbum(
    albumName: string,
    artistName: string
  ): Promise<void> {

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {

      const searchTerm =
        artistName.trim()
          ? `${albumName} ${artistName}`
          : albumName;

      const tracks =
        await this.catalogService.searchTracks(
          searchTerm,
          50
        );

      const normalizedAlbum =
        albumName
          .toLowerCase()
          .trim();

      const albumTracks =
        tracks.filter(
          track => {

            const trackAlbum =
              (
                track.collectionName ||
                ''
              )
                .toLowerCase()
                .trim();

            const matchesAlbum =
              trackAlbum === normalizedAlbum ||
              trackAlbum.includes(
                normalizedAlbum
              ) ||
              normalizedAlbum.includes(
                trackAlbum
              );

            if (!artistName.trim()) {
              return matchesAlbum;
            }

            const normalizedArtist =
              artistName
                .toLowerCase()
                .trim();

            const trackArtist =
              track.artistName
                .toLowerCase()
                .trim();

            const matchesArtist =
              trackArtist.includes(
                normalizedArtist
              ) ||
              normalizedArtist.includes(
                trackArtist
              );

            return (
              matchesAlbum &&
              matchesArtist
            );

          }
        );

      const finalTracks =
        albumTracks.length > 0
          ? albumTracks
          : tracks.filter(
              track =>
                (
                  track.collectionName ||
                  ''
                )
                  .toLowerCase()
                  .includes(
                    normalizedAlbum
                  )
            );

      const songs =
        finalTracks.map(
          track =>
            this.convertTrackToSong(
              track
            )
        );

      this.songs.set(songs);

      if (finalTracks.length > 0) {

        this.albumImage.set(
          this.getLargeArtwork(
            finalTracks[0].artworkUrl100
          )
        );

        if (!this.artistName()) {

          this.artistName.set(
            finalTracks[0].artistName
          );

        }

      }

    } catch (error) {

      console.error(
        'ZUNO album loading error:',
        error
      );

      this.errorMessage.set(
        'Unable to load this album right now.'
      );

      this.songs.set([]);

    } finally {

      this.isLoading.set(false);

    }

  }

  playAlbum(): void {

    const albumSongs =
      this.songs();

    if (!albumSongs.length) {
      return;
    }

    this.musicService.playQueue(
      albumSongs,
      0
    );

  }

  playSong(
    index: number
  ): void {

    const albumSongs =
      this.songs();

    if (!albumSongs.length) {
      return;
    }

    this.musicService.playQueue(
      albumSongs,
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

  toggleSongLike(
    song: Song
  ): void {

    this.musicService.toggleLike(song);

  }

  isSongLiked(
    song: Song
  ): boolean {

    return this.musicService.isSongLiked(
      song.id
    );

  }

  toggleAlbumLike(): void {

    this.isLiked.update(
      value => !value
    );

  }

  private convertTrackToSong(
    track: CatalogTrack
  ): Song {

    return {

      id:
        `catalog-${track.trackId}`,

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
        Math.round(
          track.trackTimeMillis / 1000
        ),

      genre:
        track.primaryGenreName ||
        'Music',

      language:
        track.country ||
        'International',

      releaseYear:
        this.getReleaseYear(
          track.releaseDate
        ),

      isLiked:
        this.musicService.isSongLiked(
          `catalog-${track.trackId}`
        ),

      playCount: 0

    };

  }

  private getReleaseYear(
    releaseDate: string
  ): number {

    const year =
      new Date(
        releaseDate
      ).getFullYear();

    if (Number.isFinite(year)) {
      return year;
    }

    return new Date()
      .getFullYear();

  }

  private getLargeArtwork(
    artworkUrl: string
  ): string {

    if (!artworkUrl) {
      return '';
    }

    return artworkUrl.replace(
      '100x100bb',
      '600x600bb'
    );

  }

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

}