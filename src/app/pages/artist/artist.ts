import { Component, OnDestroy, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  CatalogService,
  CatalogTrack
} from '../../core/services/catalog.service';

import { MusicService } from '../../core/services/music.service';
import { Song } from '../../core/models/song.model';

interface ArtistRelease {
  albumName: string;
  artistName: string;
  artwork: string;
  year: number;
  genre: string;
}

interface ArtistCollection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  songs: Song[];
}

type CollectionTheme = 'love' | 'melody' | 'mass';

@Component({
  selector: 'app-artist',
  standalone: true,
  imports: [],
  templateUrl: './artist.html',
  styleUrl: './artist.css'
})
export class Artist implements OnDestroy {

  readonly artistName = signal('');
  readonly artistImage = signal('');
  readonly songs = signal<Song[]>([]);
  readonly releases = signal<ArtistRelease[]>([]);

  readonly loveSongs = signal<Song[]>([]);
  readonly melodySongs = signal<Song[]>([]);
  readonly massSongs = signal<Song[]>([]);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly isFollowing = signal(false);

  readonly isFeaturedMixArtist = computed(() => {
    const artist = this.normalizeArtistName(this.artistName());

    return (
      artist === 'a r rahman' ||
      artist === 'ar rahman' ||
      artist === 'anirudh ravichander' ||
      artist === 'anirudh'
    );
  });

  readonly artistCollections = computed<ArtistCollection[]>(() => {
    if (!this.isFeaturedMixArtist()) {
      return [];
    }

    const artist = this.artistName();

    const collections: ArtistCollection[] = [
      {
        id: 'love',
        title: `${artist} Love Hits`,
        subtitle: 'Romantic favourites',
        image:
          this.loveSongs()[0]?.coverImage ??
          this.artistImage(),
        songs: this.loveSongs()
      },
      {
        id: 'melody',
        title: `${artist} Melodies`,
        subtitle: 'Soft and melodic favourites',
        image:
          this.melodySongs()[0]?.coverImage ??
          this.artistImage(),
        songs: this.melodySongs()
      },
      {
        id: 'mass',
        title:
          this.isAnirudh(artist)
            ? 'Anirudh Mass & Kuthu'
            : 'A.R. Rahman Mass & Energy',
        subtitle: 'High-energy favourites',
        image:
          this.massSongs()[0]?.coverImage ??
          this.artistImage(),
        songs: this.massSongs()
      }
    ];

    return collections.filter(
      collection => collection.songs.length > 0
    );
  });

  private readonly routeSubscription: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly catalogService: CatalogService,
    public readonly musicService: MusicService
  ) {
    this.routeSubscription =
      this.route.queryParamMap.subscribe(params => {
        const artist = params.get('name') ?? '';

        if (!artist.trim()) {
          this.artistName.set('Artist');
          this.resetArtist();
          return;
        }

        const cleanArtist = artist.trim();

        this.artistName.set(cleanArtist);

        void this.loadArtist(cleanArtist);
      });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  /* =========================================================
     LOAD ARTIST
     ========================================================= */

  private async loadArtist(
    artistName: string
  ): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.resetArtist();

    try {
      const [
        mainTracks,
        loveTracks,
        melodyTracks,
        massTracks
      ] = await Promise.all([
        this.loadArtistMainTracks(artistName),
        this.loadThemeTracks(artistName, 'love'),
        this.loadThemeTracks(artistName, 'melody'),
        this.loadThemeTracks(artistName, 'mass')
      ]);

      const finalMainTracks =
        this.prepareArtistTracks(
          mainTracks,
          artistName,
          70
        );

      const songs =
        finalMainTracks.map(track =>
          this.convertTrackToSong(track)
        );

      this.songs.set(songs);

      this.releases.set(
        this.createReleases(finalMainTracks)
      );

      this.loveSongs.set(
        this.prepareThemeSongs(
          loveTracks,
          artistName,
          'love',
          30
        )
      );

      this.melodySongs.set(
        this.prepareThemeSongs(
          melodyTracks,
          artistName,
          'melody',
          30
        )
      );

      this.massSongs.set(
        this.prepareThemeSongs(
          massTracks,
          artistName,
          'mass',
          30
        )
      );

      if (finalMainTracks.length > 0) {
        this.artistImage.set(
          this.getBestArtistArtwork(
            finalMainTracks,
            artistName
          )
        );
      }

    } catch (error) {
      console.error(
        'ZUNO artist loading error:',
        error
      );

      this.errorMessage.set(
        'Unable to load this artist right now.'
      );

      this.resetArtist();

    } finally {
      this.isLoading.set(false);
    }
  }

  private resetArtist(): void {
    this.artistImage.set('');
    this.songs.set([]);
    this.releases.set([]);

    this.loveSongs.set([]);
    this.melodySongs.set([]);
    this.massSongs.set([]);
  }

  /* =========================================================
     MAIN 60–70 TRACK CATALOGUE
     ========================================================= */

  private async loadArtistMainTracks(
    artistName: string
  ): Promise<CatalogTrack[]> {
    const queries =
      this.createArtistQueries(artistName);

    const results =
      await Promise.all(
        queries.map(query =>
          this.catalogService.searchTracks(
            query,
            50
          )
        )
      );

    return results.flat();
  }

  private createArtistQueries(
    artistName: string
  ): string[] {
    const normalized =
      this.normalizeArtistName(artistName);

    const specialQueries:
      Record<string, string[]> = {

      'a r rahman': [
        'A R Rahman Tamil',
        'A R Rahman Tamil soundtrack',
        'A R Rahman Tamil movie songs',
        'A R Rahman Tamil hits',
        'A R Rahman Tamil melody',
        'A R Rahman Tamil love songs',
        'A R Rahman Tamil 90s',
        'A R Rahman Tamil 2000s',
        'A R Rahman soundtrack',
        'A R Rahman'
      ],

      'ar rahman': [
        'A R Rahman Tamil',
        'A R Rahman Tamil soundtrack',
        'A R Rahman Tamil movie songs',
        'A R Rahman Tamil hits',
        'A R Rahman Tamil melody',
        'A R Rahman Tamil love songs',
        'A R Rahman Tamil 90s',
        'A R Rahman Tamil 2000s',
        'A R Rahman soundtrack',
        'A R Rahman'
      ],

      'anirudh ravichander': [
        'Anirudh Ravichander Tamil',
        'Anirudh Ravichander Tamil soundtrack',
        'Anirudh Ravichander Tamil movie songs',
        'Anirudh Ravichander Tamil hits',
        'Anirudh Ravichander Tamil melody',
        'Anirudh Ravichander Tamil love songs',
        'Anirudh Ravichander Tamil mass',
        'Anirudh Ravichander Tamil kuthu',
        'Anirudh Ravichander soundtrack',
        'Anirudh Ravichander'
      ],

      'anirudh': [
        'Anirudh Ravichander Tamil',
        'Anirudh Ravichander Tamil soundtrack',
        'Anirudh Ravichander Tamil movie songs',
        'Anirudh Ravichander Tamil hits',
        'Anirudh Ravichander Tamil melody',
        'Anirudh Ravichander Tamil love songs',
        'Anirudh Ravichander Tamil mass',
        'Anirudh Ravichander Tamil kuthu',
        'Anirudh Ravichander soundtrack',
        'Anirudh Ravichander'
      ],

      'harris jayaraj': [
        'Harris Jayaraj Tamil',
        'Harris Jayaraj Tamil hits',
        'Harris Jayaraj Tamil soundtrack',
        'Harris Jayaraj Tamil melody',
        'Harris Jayaraj Tamil love songs',
        'Harris Jayaraj'
      ],

      'yuvan shankar raja': [
        'Yuvan Shankar Raja Tamil',
        'Yuvan Shankar Raja Tamil hits',
        'Yuvan Shankar Raja Tamil soundtrack',
        'Yuvan Shankar Raja Tamil melody',
        'Yuvan Shankar Raja Tamil love songs',
        'Yuvan Shankar Raja'
      ],

      'sid sriram': [
        'Sid Sriram Tamil',
        'Sid Sriram Tamil hits',
        'Sid Sriram Tamil melody',
        'Sid Sriram Tamil love songs',
        'Sid Sriram'
      ],

      'shreya ghoshal': [
        'Shreya Ghoshal Tamil',
        'Shreya Ghoshal Hindi',
        'Shreya Ghoshal hits',
        'Shreya Ghoshal melody',
        'Shreya Ghoshal'
      ],

      'arijit singh': [
        'Arijit Singh Hindi',
        'Arijit Singh hits',
        'Arijit Singh melody',
        'Arijit Singh love songs',
        'Arijit Singh'
      ]
    };

    const knownQueries =
      specialQueries[normalized];

    if (knownQueries) {
      return knownQueries;
    }

    return [
      artistName,
      `${artistName} hits`,
      `${artistName} songs`,
      `${artistName} soundtrack`,
      `${artistName} popular`,
      `${artistName} best`
    ];
  }

  private prepareArtistTracks(
    tracks: CatalogTrack[],
    artistName: string,
    limit: number
  ): CatalogTrack[] {
    const uniqueTracks =
      this.removeDuplicateTracks(tracks);

    const matchingTracks =
      uniqueTracks.filter(track =>
        this.matchesArtist(
          track.artistName,
          artistName
        ) ||
        this.containsArtist(
          track.artistName,
          artistName
        )
      );

    return this.sortArtistTracks(
      matchingTracks,
      artistName
    ).slice(0, limit);
  }

  /* =========================================================
     LOVE / MELODY / MASS COLLECTIONS
     ========================================================= */

  private async loadThemeTracks(
    artistName: string,
    theme: CollectionTheme
  ): Promise<CatalogTrack[]> {
    if (!this.isFeaturedArtist(artistName)) {
      return [];
    }

    const queries =
      this.createThemeQueries(
        artistName,
        theme
      );

    const results =
      await Promise.all(
        queries.map(query =>
          this.catalogService.searchTracks(
            query,
            50
          )
        )
      );

    return results.flat();
  }

  private createThemeQueries(
    artistName: string,
    theme: CollectionTheme
  ): string[] {
    const name =
      this.isRahman(artistName)
        ? 'A R Rahman'
        : 'Anirudh Ravichander';

    switch (theme) {

      case 'love':
        return [
          `${name} Tamil love songs`,
          `${name} Tamil romantic songs`,
          `${name} Tamil romance`,
          `${name} Tamil Kadhal songs`,
          `${name} Tamil love hits`
        ];

      case 'melody':
        return [
          `${name} Tamil melody`,
          `${name} Tamil melodies`,
          `${name} Tamil soft songs`,
          `${name} Tamil soulful songs`,
          `${name} Tamil romantic melody`
        ];

      case 'mass':
        return this.isAnirudh(artistName)
          ? [
              'Anirudh Ravichander Tamil mass songs',
              'Anirudh Ravichander Tamil kuthu songs',
              'Anirudh Ravichander Tamil dance songs',
              'Anirudh Ravichander Tamil energetic songs',
              'Anirudh Ravichander Tamil mass hits'
            ]
          : [
              'A R Rahman Tamil energetic songs',
              'A R Rahman Tamil dance songs',
              'A R Rahman Tamil fast songs',
              'A R Rahman Tamil mass songs',
              'A R Rahman Tamil energetic hits'
            ];
    }
  }

  private prepareThemeSongs(
    tracks: CatalogTrack[],
    artistName: string,
    theme: CollectionTheme,
    limit: number
  ): Song[] {
    const uniqueTracks =
      this.removeDuplicateTracks(tracks);

    const artistTracks =
      uniqueTracks.filter(track =>
        this.matchesArtist(
          track.artistName,
          artistName
        ) ||
        this.containsArtist(
          track.artistName,
          artistName
        )
      );

    const nonConflictingTracks =
      artistTracks.filter(track =>
        !this.hasThemeConflict(
          track,
          theme
        )
      );

    const sorted =
      this.sortArtistTracks(
        nonConflictingTracks,
        artistName
      );

    return sorted
      .slice(0, limit)
      .map(track =>
        this.convertTrackToSong(track)
      );
  }

  private hasThemeConflict(
    track: CatalogTrack,
    theme: CollectionTheme
  ): boolean {
    const text =
      this.normalize(
        [
          track.trackName,
          track.collectionName,
          track.primaryGenreName
        ]
          .filter(Boolean)
          .join(' ')
      );

    const massTerms = [
      'mass',
      'kuthu',
      'dance',
      'party',
      'gaana',
      'gana',
      'folk',
      'celebration'
    ];

    const softTerms = [
      'melody',
      'melodies',
      'romantic',
      'love',
      'soft',
      'acoustic',
      'unplugged',
      'soulful',
      'chill'
    ];

    if (
      theme === 'love' ||
      theme === 'melody'
    ) {
      return massTerms.some(
        term => text.includes(term)
      );
    }

    if (theme === 'mass') {
      return softTerms.some(
        term => text.includes(term)
      );
    }

    return false;
  }

  /* =========================================================
     COLLECTION PLAYBACK
     ========================================================= */

  playCollection(
    collection: ArtistCollection
  ): void {
    if (!collection.songs.length) {
      return;
    }

    this.musicService.playQueue(
      collection.songs,
      0
    );
  }

  playCollectionSong(
    collection: ArtistCollection,
    index: number
  ): void {
    if (!collection.songs.length) {
      return;
    }

    this.musicService.playQueue(
      collection.songs,
      index
    );
  }

  /* =========================================================
     MAIN PLAYBACK
     ========================================================= */

  playArtist(): void {
    const artistSongs =
      this.songs();

    if (!artistSongs.length) {
      return;
    }

    this.musicService.playQueue(
      artistSongs,
      0
    );
  }

  playSong(
    index: number
  ): void {
    const artistSongs =
      this.songs();

    if (!artistSongs.length) {
      return;
    }

    this.musicService.playQueue(
      artistSongs,
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
     FOLLOW
     ========================================================= */

  toggleFollow(): void {
    this.isFollowing.update(
      value => !value
    );
  }

  /* =========================================================
     ARTIST CREDIT
     ========================================================= */

  getArtists(
    artistCredit: string
  ): string[] {
    const credit =
      artistCredit.trim();

    if (!credit) {
      return [];
    }

    return credit
      .replace(
        /\s+&\s+/g,
        ', '
      )
      .split(',')
      .map(artist =>
        artist.trim()
      )
      .filter(artist =>
        artist.length > 0
      );
  }

  openArtist(
    artistName: string
  ): void {
    const cleanArtist =
      artistName.trim();

    if (!cleanArtist) {
      return;
    }

    void this.router.navigate(
      ['/artist'],
      {
        queryParams: {
          name: cleanArtist
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
    const cleanAlbum =
      albumName.trim();

    if (!cleanAlbum) {
      return;
    }

    const cleanArtist =
      this.getPrimaryArtistName(
        artistName
      );

    void this.router.navigate(
      ['/album'],
      {
        queryParams: {
          name: cleanAlbum,
          artist:
            cleanArtist ||
            this.artistName()
        }
      }
    );
  }

  /* =========================================================
     TRACK DISPLAY
     ========================================================= */

  getPopularSongs(): Song[] {
    return this.songs();
  }

  /* =========================================================
     RELEASES
     ========================================================= */

  private createReleases(
    tracks: CatalogTrack[]
  ): ArtistRelease[] {
    const releasesMap =
      new Map<string, ArtistRelease>();

    for (const track of tracks) {
      const albumName =
        (
          track.collectionName ||
          track.trackName ||
          'Single'
        ).trim();

      if (!albumName) {
        continue;
      }

      const key =
        this.normalize(albumName);

      if (releasesMap.has(key)) {
        continue;
      }

      releasesMap.set(
        key,
        {
          albumName,

          artistName:
            this.getPrimaryArtistName(
              track.artistName
            ) ||
            this.artistName(),

          artwork:
            this.getLargeArtwork(
              track.artworkUrl100
            ),

          year:
            this.getReleaseYear(
              track.releaseDate
            ),

          genre:
            track.primaryGenreName ||
            'Music'
        }
      );
    }

    return Array.from(
      releasesMap.values()
    )
      .sort(
        (a, b) =>
          b.year - a.year
      )
      .slice(0, 16);
  }

  /* =========================================================
     ARTIST MATCHING
     ========================================================= */

  private matchesArtist(
    trackArtist: string,
    requestedArtist: string
  ): boolean {
    const requested =
      this.getCanonicalArtist(
        requestedArtist
      );

    if (!requested) {
      return false;
    }

    const fullCredit =
      this.getCanonicalArtist(
        trackArtist
      );

    if (fullCredit === requested) {
      return true;
    }

    const artists =
      this.getArtists(trackArtist)
        .map(artist =>
          this.getCanonicalArtist(
            artist
          )
        );

    return artists.includes(
      requested
    );
  }

  private containsArtist(
    trackArtist: string,
    requestedArtist: string
  ): boolean {
    const requested =
      this.getCanonicalArtist(
        requestedArtist
      );

    const credit =
      this.getCanonicalArtist(
        trackArtist
      );

    if (
      !requested ||
      !credit
    ) {
      return false;
    }

    return (
      credit.includes(requested) ||
      requested.includes(credit)
    );
  }

  private getCanonicalArtist(
    value: string
  ): string {
    const normalized =
      this.normalizeArtistName(value);

    if (
      normalized === 'a r rahman' ||
      normalized === 'ar rahman'
    ) {
      return 'arrahman';
    }

    if (
      normalized === 'anirudh' ||
      normalized === 'anirudh ravichander'
    ) {
      return 'anirudhravichander';
    }

    return normalized
      .replace(
        /\s+/g,
        ''
      );
  }

  private getPrimaryArtistName(
    artistCredit: string
  ): string {
    const artists =
      this.getArtists(
        artistCredit
      );

    return (
      artists[0] ??
      artistCredit.trim()
    );
  }

  private isFeaturedArtist(
    artistName: string
  ): boolean {
    return (
      this.isRahman(artistName) ||
      this.isAnirudh(artistName)
    );
  }

  private isRahman(
    artistName: string
  ): boolean {
    return (
      this.getCanonicalArtist(
        artistName
      ) === 'arrahman'
    );
  }

  private isAnirudh(
    artistName: string
  ): boolean {
    return (
      this.getCanonicalArtist(
        artistName
      ) === 'anirudhravichander'
    );
  }

  /* =========================================================
     DEDUPLICATION
     ========================================================= */

  private removeDuplicateTracks(
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
        `${this.normalizeTrackName(track.trackName)}::` +
        `${this.normalizeArtistName(track.artistName)}`;

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
    );
  }

  /* =========================================================
     SORTING
     ========================================================= */

  private sortArtistTracks(
    tracks: CatalogTrack[],
    requestedArtist: string
  ): CatalogTrack[] {
    return [...tracks].sort(
      (a, b) => {
        const aScore =
          this.getArtistTrackScore(
            a,
            requestedArtist
          );

        const bScore =
          this.getArtistTrackScore(
            b,
            requestedArtist
          );

        if (bScore !== aScore) {
          return bScore - aScore;
        }

        return (
          this.getReleaseYear(
            b.releaseDate
          ) -
          this.getReleaseYear(
            a.releaseDate
          )
        );
      }
    );
  }

  private getArtistTrackScore(
    track: CatalogTrack,
    requestedArtist: string
  ): number {
    let score =
      this.getReleaseQualityScore(track);

    if (
      this.matchesArtist(
        track.artistName,
        requestedArtist
      )
    ) {
      score += 150;

    } else if (
      this.containsArtist(
        track.artistName,
        requestedArtist
      )
    ) {
      score += 80;
    }

    return score;
  }

  private getReleaseQualityScore(
    track: CatalogTrack
  ): number {
    const album =
      this.normalize(
        track.collectionName ?? ''
      );

    let score = 100;

    const badTerms = [
      'karaoke',
      'tribute',
      'cover',
      'instrumental',
      'best of',
      'greatest hits',
      'collection',
      'anthology'
    ];

    for (const term of badTerms) {
      if (album.includes(term)) {
        score -= 60;
      }
    }

    const goodTerms = [
      'original motion picture soundtrack',
      'original soundtrack',
      'soundtrack'
    ];

    for (const term of goodTerms) {
      if (album.includes(term)) {
        score += 30;
      }
    }

    if (track.artworkUrl100) {
      score += 10;
    }

    if (track.previewUrl) {
      score += 10;
    }

    return score;
  }

  /* =========================================================
     ARTWORK
     ========================================================= */

  private getBestArtistArtwork(
    tracks: CatalogTrack[],
    requestedArtist: string
  ): string {
    const exactTrack =
      tracks.find(track =>
        this.matchesArtist(
          track.artistName,
          requestedArtist
        ) &&
        !!track.artworkUrl100
      );

    const artwork =
      exactTrack?.artworkUrl100 ??
      tracks.find(track =>
        !!track.artworkUrl100
      )?.artworkUrl100 ??
      '';

    return this.getLargeArtwork(
      artwork
    );
  }

  /* =========================================================
     CATALOG -> SONG
     ========================================================= */

  private convertTrackToSong(
    track: CatalogTrack
  ): Song {
    const songId =
      `catalog-${track.trackId}`;

    return {
      id: songId,

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
            track.trackTimeMillis /
            1000
          )
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
          songId
        ),

      playCount: 0
    };
  }

  /* =========================================================
     HELPERS
     ========================================================= */

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

  private normalizeArtistName(
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

  private normalizeTrackName(
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

  private normalize(
    value: string
  ): string {
    return (value ?? '')
      .toLowerCase()
      .trim();
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