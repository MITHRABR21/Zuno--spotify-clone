import { Injectable, signal } from '@angular/core';

import { Playlist } from '../models/playlist.model';
import { Song } from '../models/song.model';

export type CuratedPlaylistType =
  | 'tamil-mass'
  | 'tamil-melody'
  | 'tamil-chill'
  | 'tamil-hits';

export interface CuratedPlaylistDefinition {
  id: string;
  type: CuratedPlaylistType;
  name: string;
  description: string;
  queries: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private readonly playlistsStorageKey = 'zuno-playlists';
  private readonly songsStorageKey = 'zuno-playlist-song-data';

  /* =========================================================
     ZUNO CURATED PLAYLISTS
     ========================================================= */

  private readonly curatedDefinitions: CuratedPlaylistDefinition[] = [
    {
      id: 'playlist-001',
      type: 'tamil-mass',
      name: 'Tamil Mass & Kuthu',
      description:
        'High-energy Tamil mass, kuthu and celebration tracks.',
      queries: [
        'Tamil mass songs',
        'Tamil kuthu songs',
        'Tamil dance hits',
        'Tamil energetic songs',
        'Anirudh mass Tamil',
        'Vijay Tamil songs',
        'Ajith Tamil songs',
        'Dhanush Tamil songs'
      ]
    },

    {
      id: 'playlist-002',
      type: 'tamil-melody',
      name: 'Tamil Melodies',
      description:
        'Beautiful Tamil melodies, love songs and timeless favourites.',
      queries: [
        'Tamil melody songs',
        'Tamil love songs',
        'Tamil romantic songs',
        'A R Rahman Tamil melody',
        'Harris Jayaraj Tamil melody',
        'Yuvan Shankar Raja Tamil melody',
        'Sid Sriram Tamil melody',
        'Tamil soft songs'
      ]
    },

    {
      id: 'playlist-003',
      type: 'tamil-chill',
      name: 'Tamil Chill',
      description:
        'Relaxed Tamil tracks for calm evenings and easy listening.',
      queries: [
        'Tamil chill songs',
        'Tamil relaxing songs',
        'Tamil soft melody',
        'Tamil acoustic songs',
        'Tamil romantic melody',
        'Pradeep Kumar Tamil',
        'Sid Sriram Tamil',
        'Tamil peaceful songs'
      ]
    },

    {
      id: 'playlist-004',
      type: 'tamil-hits',
      name: 'Tamil Hits',
      description:
        'Popular Tamil movie songs, current favourites and essential hits.',
      queries: [
        'Tamil hits',
        'Tamil movie hits',
        'Tamil latest hits',
        'Tamil soundtrack',
        'Tamil cinema songs',
        'Tamil popular songs',
        'Anirudh Ravichander Tamil',
        'A R Rahman Tamil',
        'Harris Jayaraj Tamil',
        'Yuvan Shankar Raja Tamil'
      ]
    }
  ];

  /* =========================================================
     DEFAULT PLAYLIST METADATA
     ========================================================= */

  private readonly defaultPlaylists: Playlist[] = [
    {
      id: 'playlist-001',
      name: 'Tamil Mass & Kuthu',
      description:
        'High-energy Tamil mass, kuthu and celebration tracks.',
      coverImage: '',
      owner: 'ZUNO',
      songIds: [],
      isPublic: true,
      createdAt: '2026-01-01'
    },

    {
      id: 'playlist-002',
      name: 'Tamil Melodies',
      description:
        'Beautiful Tamil melodies, love songs and timeless favourites.',
      coverImage: '',
      owner: 'ZUNO',
      songIds: [],
      isPublic: true,
      createdAt: '2026-01-02'
    },

    {
      id: 'playlist-003',
      name: 'Tamil Chill',
      description:
        'Relaxed Tamil tracks for calm evenings and easy listening.',
      coverImage: '',
      owner: 'ZUNO',
      songIds: [],
      isPublic: true,
      createdAt: '2026-01-03'
    },

    {
      id: 'playlist-004',
      name: 'Tamil Hits',
      description:
        'Popular Tamil movie songs, current favourites and essential hits.',
      coverImage: '',
      owner: 'ZUNO',
      songIds: [],
      isPublic: true,
      createdAt: '2026-01-04'
    }
  ];

  /* =========================================================
     STATE
     ========================================================= */

  private readonly playlistsSignal = signal<Playlist[]>(
    this.loadPlaylists()
  );

  private readonly playlistSongsSignal = signal<Song[]>(
    this.loadSongs()
  );

  readonly playlists =
    this.playlistsSignal.asReadonly();

  readonly playlistSongs =
    this.playlistSongsSignal.asReadonly();

  /* =========================================================
     CURATED HELPERS
     ========================================================= */

  isCuratedPlaylist(
    playlistId: string
  ): boolean {
    return this.curatedDefinitions.some(
      playlist => playlist.id === playlistId
    );
  }

  getCuratedPlaylist(
    playlistId: string
  ): CuratedPlaylistDefinition | undefined {
    return this.curatedDefinitions.find(
      playlist => playlist.id === playlistId
    );
  }

  getCuratedPlaylistType(
    playlistId: string
  ): CuratedPlaylistType | null {
    return (
      this.getCuratedPlaylist(playlistId)?.type ??
      null
    );
  }

  getCuratedQueries(
    playlistId: string
  ): string[] {
    return [
      ...(
        this.getCuratedPlaylist(playlistId)
          ?.queries ?? []
      )
    ];
  }

  getCuratedPlaylists():
    CuratedPlaylistDefinition[] {
    return this.curatedDefinitions.map(
      playlist => ({
        ...playlist,
        queries: [...playlist.queries]
      })
    );
  }

  /* =========================================================
     PLAYLIST LOOKUP
     ========================================================= */

  getPlaylistById(
    id: string
  ): Playlist | undefined {
    return this.playlistsSignal().find(
      playlist => playlist.id === id
    );
  }

  getSongById(
    songId: string
  ): Song | undefined {
    return this.playlistSongsSignal().find(
      song => song.id === songId
    );
  }

  getSongsForPlaylist(
    playlistId: string
  ): Song[] {
    const playlist =
      this.getPlaylistById(playlistId);

    if (!playlist) {
      return [];
    }

    return playlist.songIds
      .map(songId =>
        this.getSongById(songId)
      )
      .filter(
        (song): song is Song => !!song
      );
  }

  /* =========================================================
     CREATE USER PLAYLIST
     ========================================================= */

  createPlaylist(
    name: string,
    description: string = ''
  ): Playlist {
    const cleanName =
      name.trim() || 'My Playlist';

    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: cleanName,
      description: description.trim(),
      coverImage: '',
      owner: 'You',
      songIds: [],
      isPublic: false,
      createdAt: new Date().toISOString()
    };

    this.playlistsSignal.update(
      playlists => [
        ...playlists,
        newPlaylist
      ]
    );

    this.savePlaylists();

    return newPlaylist;
  }

  /* =========================================================
     RENAME USER PLAYLIST
     ========================================================= */

  renamePlaylist(
    playlistId: string,
    name: string
  ): void {
    if (this.isCuratedPlaylist(playlistId)) {
      return;
    }

    const cleanName = name.trim();

    if (!cleanName) {
      return;
    }

    this.playlistsSignal.update(
      playlists =>
        playlists.map(
          playlist =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  name: cleanName
                }
              : playlist
        )
    );

    this.savePlaylists();
  }

  /* =========================================================
     DESCRIPTION
     ========================================================= */

  updateDescription(
    playlistId: string,
    description: string
  ): void {
    if (this.isCuratedPlaylist(playlistId)) {
      return;
    }

    this.playlistsSignal.update(
      playlists =>
        playlists.map(
          playlist =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  description:
                    description.trim()
                }
              : playlist
        )
    );

    this.savePlaylists();
  }

  /* =========================================================
     COVER
     ========================================================= */

  updateCover(
    playlistId: string,
    coverImage: string
  ): void {
    if (this.isCuratedPlaylist(playlistId)) {
      return;
    }

    const cleanCover =
      coverImage.trim();

    if (!cleanCover) {
      return;
    }

    this.playlistsSignal.update(
      playlists =>
        playlists.map(
          playlist =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  coverImage: cleanCover
                }
              : playlist
        )
    );

    this.savePlaylists();
  }

  /* =========================================================
     ADD SONG
     ========================================================= */

  addSongToPlaylist(
    playlistId: string,
    song: Song
  ): void {
    if (this.isCuratedPlaylist(playlistId)) {
      return;
    }

    const playlist =
      this.getPlaylistById(playlistId);

    if (!playlist) {
      return;
    }

    if (
      !this.playlistSongsSignal()
        .some(
          item => item.id === song.id
        )
    ) {
      this.playlistSongsSignal.update(
        songs => [
          ...songs,
          {
            ...song
          }
        ]
      );

      this.saveSongs();
    }

    if (
      playlist.songIds.includes(song.id)
    ) {
      return;
    }

    this.playlistsSignal.update(
      playlists =>
        playlists.map(
          item =>
            item.id === playlistId
              ? {
                  ...item,
                  songIds: [
                    ...item.songIds,
                    song.id
                  ]
                }
              : item
        )
    );

    this.updatePlaylistCoverFromSong(
      playlistId,
      song
    );

    this.savePlaylists();
  }

  /* =========================================================
     REMOVE SONG
     ========================================================= */

  removeSongFromPlaylist(
    playlistId: string,
    songId: string
  ): void {
    if (this.isCuratedPlaylist(playlistId)) {
      return;
    }

    this.playlistsSignal.update(
      playlists =>
        playlists.map(
          playlist =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  songIds:
                    playlist.songIds.filter(
                      id => id !== songId
                    )
                }
              : playlist
        )
    );

    this.savePlaylists();

    this.removeUnusedSongData(
      songId
    );
  }

  /* =========================================================
     SONG EXISTS
     ========================================================= */

  isSongInPlaylist(
    playlistId: string,
    songId: string
  ): boolean {
    const playlist =
      this.getPlaylistById(playlistId);

    if (!playlist) {
      return false;
    }

    return playlist.songIds.includes(
      songId
    );
  }

  /* =========================================================
     CLEAR PLAYLIST
     ========================================================= */

  clearPlaylist(
    playlistId: string
  ): void {
    if (this.isCuratedPlaylist(playlistId)) {
      return;
    }

    const playlist =
      this.getPlaylistById(playlistId);

    if (!playlist) {
      return;
    }

    const songIds = [
      ...playlist.songIds
    ];

    this.playlistsSignal.update(
      playlists =>
        playlists.map(
          item =>
            item.id === playlistId
              ? {
                  ...item,
                  songIds: []
                }
              : item
        )
    );

    this.savePlaylists();

    for (const songId of songIds) {
      this.removeUnusedSongData(
        songId
      );
    }
  }

  /* =========================================================
     DELETE PLAYLIST
     ========================================================= */

  deletePlaylist(
    playlistId: string
  ): void {
    if (this.isCuratedPlaylist(playlistId)) {
      return;
    }

    const playlist =
      this.getPlaylistById(playlistId);

    const songIds =
      playlist
        ? [...playlist.songIds]
        : [];

    this.playlistsSignal.update(
      playlists =>
        playlists.filter(
          item =>
            item.id !== playlistId
        )
    );

    this.savePlaylists();

    for (const songId of songIds) {
      this.removeUnusedSongData(
        songId
      );
    }
  }

  /* =========================================================
     RESET
     ========================================================= */

  resetPlaylists(): void {
    this.playlistsSignal.set(
      this.defaultPlaylists.map(
        playlist => ({
          ...playlist,
          songIds: []
        })
      )
    );

    this.playlistSongsSignal.set([]);

    this.savePlaylists();
    this.saveSongs();
  }

  /* =========================================================
     UPDATE USER PLAYLIST COVER
     ========================================================= */

  private updatePlaylistCoverFromSong(
    playlistId: string,
    song: Song
  ): void {
    if (
      this.isCuratedPlaylist(playlistId) ||
      !song.coverImage
    ) {
      return;
    }

    const playlist =
      this.getPlaylistById(playlistId);

    if (!playlist) {
      return;
    }

    if (
      playlist.songIds.length > 1
    ) {
      return;
    }

    this.playlistsSignal.update(
      playlists =>
        playlists.map(
          item =>
            item.id === playlistId
              ? {
                  ...item,
                  coverImage:
                    song.coverImage
                }
              : item
        )
    );
  }

  /* =========================================================
     REMOVE UNUSED SONG DATA
     ========================================================= */

  private removeUnusedSongData(
    songId: string
  ): void {
    const stillUsed =
      this.playlistsSignal()
        .some(
          playlist =>
            playlist.songIds.includes(
              songId
            )
        );

    if (stillUsed) {
      return;
    }

    this.playlistSongsSignal.update(
      songs =>
        songs.filter(
          song =>
            song.id !== songId
        )
    );

    this.saveSongs();
  }

  /* =========================================================
     LOAD + MIGRATE PLAYLISTS

     This is important because existing users already have
     Late Night Vibes / Morning Energy / Chill & Relax stored
     in localStorage.

     We replace only ZUNO curated IDs while preserving every
     personal playlist.
     ========================================================= */

  private loadPlaylists(): Playlist[] {
    let storedPlaylists: Playlist[] = [];

    try {
      const stored =
        localStorage.getItem(
          this.playlistsStorageKey
        );

      if (stored) {
        const parsed =
          JSON.parse(stored) as Playlist[];

        if (Array.isArray(parsed)) {
          storedPlaylists = parsed;
        }
      }
    } catch (error) {
      console.error(
        'Unable to load ZUNO playlists:',
        error
      );
    }

    if (!storedPlaylists.length) {
      return this.cloneDefaultPlaylists();
    }

    const userPlaylists =
      storedPlaylists.filter(
        playlist =>
          !this.isCuratedPlaylistId(
            playlist.id
          )
      );

    const migratedCurated =
      this.defaultPlaylists.map(
        defaultPlaylist => {
          const existing =
            storedPlaylists.find(
              playlist =>
                playlist.id ===
                defaultPlaylist.id
            );

          return {
            ...defaultPlaylist,

            /*
             * Curated catalog songs are loaded dynamically.
             * Old manually stored song IDs must not define
             * the curated playlist anymore.
             */
            songIds: [],

            /*
             * Keep a catalog-derived cover only if we later
             * deliberately store one. For now the playlist
             * page will use actual catalog artwork.
             */
            coverImage:
              defaultPlaylist.coverImage ||
              existing?.coverImage ||
              ''
          };
        }
      );

    const merged = [
      ...migratedCurated,
      ...userPlaylists
    ];

    try {
      localStorage.setItem(
        this.playlistsStorageKey,
        JSON.stringify(merged)
      );
    } catch (error) {
      console.error(
        'Unable to migrate ZUNO playlists:',
        error
      );
    }

    return merged;
  }

  /* =========================================================
     LOAD SONG DATA
     ========================================================= */

  private loadSongs(): Song[] {
    try {
      const stored =
        localStorage.getItem(
          this.songsStorageKey
        );

      if (stored) {
        const parsed =
          JSON.parse(stored) as Song[];

        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error(
        'Unable to load playlist songs:',
        error
      );
    }

    return [];
  }

  /* =========================================================
     SAVE PLAYLISTS
     ========================================================= */

  private savePlaylists(): void {
    try {
      localStorage.setItem(
        this.playlistsStorageKey,
        JSON.stringify(
          this.playlistsSignal()
        )
      );
    } catch (error) {
      console.error(
        'Unable to save ZUNO playlists:',
        error
      );
    }
  }

  /* =========================================================
     SAVE SONG DATA
     ========================================================= */

  private saveSongs(): void {
    try {
      localStorage.setItem(
        this.songsStorageKey,
        JSON.stringify(
          this.playlistSongsSignal()
        )
      );
    } catch (error) {
      console.error(
        'Unable to save playlist songs:',
        error
      );
    }
  }

  /* =========================================================
     HELPERS
     ========================================================= */

  private cloneDefaultPlaylists():
    Playlist[] {
    return this.defaultPlaylists.map(
      playlist => ({
        ...playlist,
        songIds: [
          ...playlist.songIds
        ]
      })
    );
  }

  private isCuratedPlaylistId(
    playlistId: string
  ): boolean {
    return this.curatedDefinitions.some(
      playlist =>
        playlist.id === playlistId
    );
  }
}