import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  signal
} from '@angular/core';

import { Router } from '@angular/router';

import { MusicService } from '../../core/services/music.service';
import {
  CatalogService,
  CatalogTrack
} from '../../core/services/catalog.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { Song } from '../../core/models/song.model';

interface HomeSection {
  id: string;
  title: string;
  subtitle?: string;
  songs: Song[];
}

interface HomeQuickItem {
  id: string;
  title: string;
  image: string;
  type: 'liked' | 'playlist' | 'collection';
  songs: Song[];
  route?: string;
}

interface HomeArtist {
  name: string;
  image: string;
  songs: Song[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  protected activeFilter: 'all' | 'music' = 'all';

  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');

  protected readonly tamilHits = signal<Song[]>([]);
  protected readonly trendingTamil = signal<Song[]>([]);
  protected readonly tamilMelodies = signal<Song[]>([]);

  protected readonly anirudhSongs = signal<Song[]>([]);
  protected readonly arRahmanSongs = signal<Song[]>([]);
  protected readonly harrisSongs = signal<Song[]>([]);
  protected readonly yuvanSongs = signal<Song[]>([]);
  protected readonly sidSriramSongs = signal<Song[]>([]);

  protected readonly hindiHits = signal<Song[]>([]);
  protected readonly englishHits = signal<Song[]>([]);

  private destroyed = false;

  constructor(
    public readonly musicService: MusicService,
    private readonly catalogService: CatalogService,
    private readonly playlistService: PlaylistService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    void this.loadHomeCatalog();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
  }

  protected readonly quickPicks = computed<HomeQuickItem[]>(() => {
    const likedSongs = this.musicService.likedSongs();

    const items: HomeQuickItem[] = [
      {
        id: 'liked-songs',
        title: 'Liked Songs',
        image: likedSongs[0]?.coverImage ?? '',
        type: 'liked',
        songs: likedSongs,
        route: '/liked-songs'
      }
    ];

    const personalPlaylists = this.playlistService
      .playlists()
      .filter(
        playlist =>
          !this.playlistService.isCuratedPlaylist(playlist.id)
      );

    for (const playlist of personalPlaylists.slice(0, 3)) {
      const songs = this.playlistService.getSongsForPlaylist(
        playlist.id
      );

      items.push({
        id: playlist.id,
        title: playlist.name,
        image: songs[0]?.coverImage ?? '',
        type: 'playlist',
        songs,
        route: `/playlist/${playlist.id}`
      });
    }

    const collections: HomeQuickItem[] = [
      {
        id: 'tamil-hits',
        title: 'Tamil discoveries',
        image: this.tamilHits()[0]?.coverImage ?? '',
        type: 'collection',
        songs: this.tamilHits(),
        route: '/search?q=Tamil'
      },
      {
        id: 'anirudh',
        title: 'Anirudh Mix',
        image: this.anirudhSongs()[0]?.coverImage ?? '',
        type: 'collection',
        songs: this.anirudhSongs(),
        route: '/search?q=Anirudh%20Ravichander'
      },
      {
        id: 'rahman',
        title: 'A.R. Rahman Mix',
        image: this.arRahmanSongs()[0]?.coverImage ?? '',
        type: 'collection',
        songs: this.arRahmanSongs(),
        route: '/search?q=A.R.%20Rahman'
      },
      {
        id: 'english',
        title: 'International discoveries',
        image: this.englishHits()[0]?.coverImage ?? '',
        type: 'collection',
        songs: this.englishHits(),
        route: '/search?q=Taylor%20Swift'
      }
    ];

    items.push(
      ...collections.filter(collection => collection.songs.length > 0)
    );

    return items.slice(0, 8);
  });

  protected readonly artists = computed<HomeArtist[]>(() => {
    const artistData = [
      {
        name: 'Anirudh Ravichander',
        songs: this.anirudhSongs()
      },
      {
        name: 'A.R. Rahman',
        songs: this.arRahmanSongs()
      },
      {
        name: 'Harris Jayaraj',
        songs: this.harrisSongs()
      },
      {
        name: 'Yuvan Shankar Raja',
        songs: this.yuvanSongs()
      },
      {
        name: 'Sid Sriram',
        songs: this.sidSriramSongs()
      }
    ];

    return artistData
      .filter(artist => artist.songs.length > 0)
      .map(artist => ({
        name: artist.name,
        image: artist.songs[0]?.coverImage ?? '',
        songs: artist.songs
      }));
  });

  protected readonly homeSections = computed<HomeSection[]>(() => {
    const sections: HomeSection[] = [
      {
        id: 'trending-tamil',
        title: 'Tamil discoveries',
        subtitle: 'Explore available Tamil song previews',
        songs: this.trendingTamil()
      },
      {
        id: 'anirudh',
        title: 'Anirudh Ravichander',
        subtitle: 'Explore song previews',
        songs: this.anirudhSongs()
      },
      {
        id: 'tamil-melodies',
        title: 'Tamil love & melody',
        subtitle: 'Previews identified by catalogue metadata',
        songs: this.tamilMelodies()
      },
      {
        id: 'rahman',
        title: 'A.R. Rahman essentials',
        subtitle: 'Explore song previews',
        songs: this.arRahmanSongs()
      },
      {
        id: 'harris',
        title: 'Harris Jayaraj',
        subtitle: 'Explore song previews',
        songs: this.harrisSongs()
      },
      {
        id: 'yuvan',
        title: 'Yuvan Shankar Raja',
        subtitle: 'Explore song previews',
        songs: this.yuvanSongs()
      },
      {
        id: 'sid-sriram',
        title: 'Sid Sriram',
        subtitle: 'Explore song previews',
        songs: this.sidSriramSongs()
      },
      {
        id: 'hindi',
        title: 'Arijit Singh',
        subtitle: 'Explore song previews',
        songs: this.hindiHits()
      },
      {
        id: 'english',
        title: 'Taylor Swift',
        subtitle: 'Explore song previews',
        songs: this.englishHits()
      }
    ];

    return sections.filter(section => section.songs.length > 0);
  });

  setFilter(filter: 'all' | 'music'): void {
    this.activeFilter = filter;
  }

  playSong(song: Song): void {
    if (this.isCurrentSong(song)) {
      this.musicService.togglePlayPause();
      return;
    }

    this.musicService.playSong(song);
  }

  playQueue(songs: Song[], startIndex: number = 0): void {
    if (songs.length) {
      this.musicService.playQueue(songs, startIndex);
    }
  }

  playQuickItem(item: HomeQuickItem): void {
    if (item.songs.length) {
      this.playQueue(item.songs);
    } else if (item.route) {
      void this.router.navigateByUrl(item.route);
    }
  }

  openQuickItem(item: HomeQuickItem): void {
    if (item.route) {
      void this.router.navigateByUrl(item.route);
    } else {
      this.playQueue(item.songs);
    }
  }

  openLikedSongs(): void {
    void this.router.navigate(['/liked-songs']);
  }

  openArtist(artist: HomeArtist): void {
    void this.router.navigate(['/artist'], {
      queryParams: {
        name: artist.name
      }
    });
  }

  playArtist(artist: HomeArtist): void {
    this.playQueue(artist.songs);
  }

  isCurrentSong(song: Song): boolean {
    return this.musicService.currentSong()?.id === song.id;
  }

  isPlaying(song: Song): boolean {
    return this.isCurrentSong(song) && this.musicService.isPlaying();
  }

  getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 18) {
      return 'Good afternoon';
    }

    return 'Good evening';
  }

  private async loadHomeCatalog(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');

    const jobs = [
      {
        query: 'Anirudh Ravichander',
        artist: 'Anirudh Ravichander',
        target: this.anirudhSongs
      },
      {
        query: 'A.R. Rahman',
        artist: 'A.R. Rahman',
        target: this.arRahmanSongs
      },
      {
        query: 'Harris Jayaraj',
        artist: 'Harris Jayaraj',
        target: this.harrisSongs
      },
      {
        query: 'Yuvan Shankar Raja',
        artist: 'Yuvan Shankar Raja',
        target: this.yuvanSongs
      },
      {
        query: 'Sid Sriram',
        artist: 'Sid Sriram',
        target: this.sidSriramSongs
      },
      {
        query: 'Arijit Singh',
        artist: 'Arijit Singh',
        target: this.hindiHits
      },
      {
        query: 'Taylor Swift',
        artist: 'Taylor Swift',
        target: this.englishHits
      }
    ];

    let failedRequests = 0;

    try {
      // Load two sections at a time. Successful sections appear
      // even when a different request fails.
      for (let index = 0; index < jobs.length; index += 2) {
        if (this.destroyed) {
          return;
        }

        const batch = jobs.slice(index, index + 2);

        const outcomes = await Promise.allSettled(
          batch.map(async job => {
            const tracks = await this.catalogService.searchTracks(
              job.query,
              40
            );

            if (this.destroyed) {
              return;
            }

            const artistTracks = tracks.filter(track =>
              this.matchesArtist(track.artistName, job.artist)
            );

            job.target.set(
              this.uniqueSongs(
                artistTracks.map(track => this.catalogTrackToSong(track))
              ).slice(0, 24)
            );

            this.updateTamilCollections();
          })
        );

        for (const outcome of outcomes) {
          if (outcome.status === 'rejected') {
            failedRequests++;
            console.error(
              'ZUNO Home section could not load:',
              outcome.reason
            );
          }
        }
      }

      if (this.destroyed) {
        return;
      }

      if (failedRequests > 0) {
        this.loadError.set(
          this.homeSections().length
            ? 'Some recommendations could not load. Available previews are shown below.'
            : 'Unable to connect to the music catalogue. Please try again later.'
        );
      } else if (this.homeSections().length === 0) {
        this.loadError.set(
          'No playable previews were returned for these artists.'
        );
      }
    } finally {
      if (!this.destroyed) {
        this.isLoading.set(false);
      }
    }
  }

  private updateTamilCollections(): void {
    const artistSongs = this.uniqueSongs([
      ...this.anirudhSongs(),
      ...this.arRahmanSongs(),
      ...this.harrisSongs(),
      ...this.yuvanSongs(),
      ...this.sidSriramSongs()
    ]);

    // Artist identity alone does not establish song language.
    const tamilSongs = artistSongs.filter(
      song => song.language === 'Tamil'
    );

    this.tamilHits.set(tamilSongs.slice(0, 30));
    this.trendingTamil.set(tamilSongs.slice(0, 24));

    const melodyTerms =
      /\b(melody|melodies|romantic|romance|love|kadhal|kaadhal|mellisai)\b/i;

    const massTerms =
      /\b(kuthu|dance|party|mass|gaana|dappankuthu)\b/i;

    this.tamilMelodies.set(
      tamilSongs
        .filter(song => {
          const text = `${song.title} ${song.album} ${song.genre}`;

          return melodyTerms.test(text) && !massTerms.test(text);
        })
        .slice(0, 24)
    );
  }

  private catalogTrackToSong(track: CatalogTrack): Song {
    const id = `catalog-${track.trackId}`;
    const year = new Date(track.releaseDate).getFullYear();

    const metadata = [
      track.trackName,
      track.collectionName,
      track.primaryGenreName
    ].join(' ');

    const language = /\btamil\b|[\u0B80-\u0BFF]/i.test(metadata)
      ? 'Tamil'
      : 'Unknown';

    return {
      id,
      title: track.trackName || 'Unknown Track',
      artist: track.artistName || 'Unknown Artist',
      artistId: this.slugify(track.artistName || 'unknown-artist'),
      album: track.collectionName || 'Single',
      albumId: this.slugify(
        `${track.collectionName}-${track.artistName}`
      ),
      coverImage: (track.artworkUrl100 || '').replace(
        /100x100(?:bb)?/g,
        '600x600bb'
      ),
      audioUrl: track.previewUrl || '',
      duration: 0,
      genre: track.primaryGenreName || 'Music',
      language,
      releaseYear: Number.isFinite(year)
        ? year
        : new Date().getFullYear(),
      isLiked: this.musicService.isSongLiked(id),
      playCount: 0
    };
  }

  private uniqueSongs(songs: Song[]): Song[] {
    const unique = new Map<string, Song>();

    for (const song of songs) {
      if (!unique.has(song.id)) {
        unique.set(song.id, song);
      }
    }

    return Array.from(unique.values());
  }

  private matchesArtist(
    artistCredit: string,
    requestedArtist: string
  ): boolean {
    const credit = this.normalizeArtist(artistCredit);
    const requested = this.normalizeArtist(requestedArtist);

    return !!requested && credit.includes(requested);
  }

  private normalizeArtist(value: string): string {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  private slugify(value: string): string {
    return (value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}