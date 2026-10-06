import {
  Injectable,
  computed,
  signal
} from '@angular/core';

import { Song } from '../models/song.model';
import { SONGS } from '../../data/songs';

@Injectable({
  providedIn: 'root'
})
export class MusicService {

  private readonly audio = new Audio();

  private readonly likedSongsStorageKey =
    'zuno-liked-songs';

  private readonly likedSongsDataStorageKey =
    'zuno-liked-song-data';

  private readonly currentSongSignal =
    signal<Song | null>(null);

  private readonly isPlayingSignal =
    signal(false);

  private readonly currentTimeSignal =
    signal(0);

  private readonly durationSignal =
    signal(0);

  private readonly volumeSignal =
    signal(0.8);

  private readonly shuffleSignal =
    signal(false);

  private readonly repeatSignal =
    signal(false);

  private readonly queueSignal =
    signal<Song[]>(
      this.createInitialQueue()
    );

  private readonly currentIndexSignal =
    signal(-1);

  private readonly likedSongIdsSignal =
    signal<Set<string>>(
      this.loadLikedSongIds()
    );

  private readonly likedSongsSignal =
    signal<Song[]>(
      this.loadLikedSongs()
    );

  readonly currentSong =
    computed(() =>
      this.currentSongSignal()
    );

  readonly isPlaying =
    computed(() =>
      this.isPlayingSignal()
    );

  readonly currentTime =
    computed(() =>
      this.currentTimeSignal()
    );

  readonly duration =
    computed(() =>
      this.durationSignal()
    );

  readonly volume =
    computed(() =>
      this.volumeSignal()
    );

  readonly isShuffleEnabled =
    computed(() =>
      this.shuffleSignal()
    );

  readonly isRepeatEnabled =
    computed(() =>
      this.repeatSignal()
    );

  readonly queue =
    computed(() =>
      this.queueSignal()
    );

  readonly currentIndex =
    computed(() =>
      this.currentIndexSignal()
    );

  readonly likedSongIds =
    computed(() =>
      this.likedSongIdsSignal()
    );

  readonly likedSongs =
    computed(() =>
      this.likedSongsSignal()
    );

  readonly likedSongsCount =
    computed(() =>
      this.likedSongsSignal().length
    );

  constructor() {

    this.audio.preload = 'metadata';

    this.audio.volume =
      this.volumeSignal();

    this.audio.addEventListener(
      'timeupdate',
      () => {
        this.currentTimeSignal.set(
          this.audio.currentTime
        );
      }
    );

    this.audio.addEventListener(
      'loadedmetadata',
      () => {
        if (
          Number.isFinite(
            this.audio.duration
          )
        ) {
          this.durationSignal.set(
            this.audio.duration
          );
        }
      }
    );

    this.audio.addEventListener(
      'play',
      () => {
        this.isPlayingSignal.set(true);
      }
    );

    this.audio.addEventListener(
      'pause',
      () => {
        this.isPlayingSignal.set(false);
      }
    );

    this.audio.addEventListener(
      'ended',
      () => {

        this.currentTimeSignal.set(0);

        this.isPlayingSignal.set(false);

        this.handleSongEnded();
      }
    );

    this.audio.addEventListener(
      'error',
      () => {

        this.isPlayingSignal.set(false);

        console.error(
          'ZUNO: Unable to load audio.'
        );
      }
    );

    this.migrateLikedSongs();
  }

  private createInitialQueue(): Song[] {

    const likedIds =
      this.loadLikedSongIds();

    const songs =
      SONGS.map(song => ({
        ...song,
        isLiked:
          likedIds.has(song.id)
      }));

    return this.removeQueueDuplicates(
      songs
    );
  }

  private loadLikedSongIds(): Set<string> {

    try {

      const stored =
        localStorage.getItem(
          this.likedSongsStorageKey
        );

      if (!stored) {
        return new Set<string>();
      }

      const parsed =
        JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return new Set<string>();
      }

      return new Set<string>(
        parsed.filter(
          id =>
            typeof id === 'string'
        )
      );

    } catch (error) {

      console.warn(
        'ZUNO: Could not load liked song IDs.',
        error
      );

      return new Set<string>();
    }
  }

  private loadLikedSongs(): Song[] {

    try {

      const stored =
        localStorage.getItem(
          this.likedSongsDataStorageKey
        );

      if (!stored) {
        return [];
      }

      const parsed =
        JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter(
          song =>
            song &&
            typeof song.id === 'string' &&
            typeof song.title === 'string'
        )
        .map(
          song => ({
            ...song,
            isLiked: true
          })
        );

    } catch (error) {

      console.warn(
        'ZUNO: Could not load liked song data.',
        error
      );

      return [];
    }
  }

  private migrateLikedSongs(): void {

    const likedIds =
      this.likedSongIdsSignal();

    const storedSongs =
      this.likedSongsSignal();

    const storedIds =
      new Set(
        storedSongs.map(
          song => song.id
        )
      );

    const missingSongs =
      SONGS
        .filter(
          song =>
            likedIds.has(song.id) &&
            !storedIds.has(song.id)
        )
        .map(
          song => ({
            ...song,
            isLiked: true
          })
        );

    if (
      missingSongs.length === 0
    ) {
      return;
    }

    this.likedSongsSignal.set([
      ...storedSongs,
      ...missingSongs
    ]);

    this.saveLikedSongs();
  }

  private saveLikedSongIds(): void {

    try {

      localStorage.setItem(
        this.likedSongsStorageKey,
        JSON.stringify(
          Array.from(
            this.likedSongIdsSignal()
          )
        )
      );

    } catch (error) {

      console.warn(
        'ZUNO: Could not save liked song IDs.',
        error
      );
    }
  }

  private saveLikedSongs(): void {

    try {

      localStorage.setItem(
        this.likedSongsDataStorageKey,
        JSON.stringify(
          this.likedSongsSignal()
        )
      );

    } catch (error) {

      console.warn(
        'ZUNO: Could not save liked songs.',
        error
      );
    }
  }

  private removeQueueDuplicates(
    songs: Song[]
  ): Song[] {

    const uniqueSongs = new Map<
      string,
      Song
    >();

    for (const song of songs) {

      if (!song) {
        continue;
      }

      const title =
        this.normalizeQueueText(
          song.title
        );

      const artist =
        this.normalizeQueueText(
          song.artist
        );

      const key =
        `${title}::${artist}`;

      if (!uniqueSongs.has(key)) {

        uniqueSongs.set(
          key,
          song
        );
      }
    }

    return Array.from(
      uniqueSongs.values()
    );
  }

  private normalizeQueueText(
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
        /\b(remaster(?:ed)?|version|edit|single)\b/g,
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

  isSongLiked(
    songId: string
  ): boolean {

    return this
      .likedSongIdsSignal()
      .has(songId);
  }

  toggleLike(
    song: Song
  ): boolean {

    if (!song) {
      return false;
    }

    const likedIds =
      new Set(
        this.likedSongIdsSignal()
      );

    const currentlyLiked =
      likedIds.has(song.id);

    if (currentlyLiked) {

      likedIds.delete(song.id);

      this.likedSongsSignal.update(
        songs =>
          songs.filter(
            currentSong =>
              currentSong.id !== song.id
          )
      );

    } else {

      likedIds.add(song.id);

      const likedSong: Song = {
        ...song,
        isLiked: true
      };

      this.likedSongsSignal.update(
        songs => {

          const alreadyStored =
            songs.some(
              currentSong =>
                currentSong.id === song.id
            );

          if (alreadyStored) {

            return songs.map(
              currentSong =>
                currentSong.id === song.id
                  ? likedSong
                  : currentSong
            );
          }

          return [
            likedSong,
            ...songs
          ];
        }
      );
    }

    this.likedSongIdsSignal.set(
      likedIds
    );

    this.saveLikedSongIds();
    this.saveLikedSongs();

    this.queueSignal.update(
      songs =>
        songs.map(
          currentSong =>
            currentSong.id === song.id
              ? {
                  ...currentSong,
                  isLiked:
                    !currentlyLiked
                }
              : currentSong
        )
    );

    const current =
      this.currentSongSignal();

    if (
      current?.id === song.id
    ) {

      this.currentSongSignal.set({
        ...current,
        isLiked:
          !currentlyLiked
      });
    }

    return !currentlyLiked;
  }

  clearLikedSongs(): void {

    this.likedSongIdsSignal.set(
      new Set<string>()
    );

    this.likedSongsSignal.set([]);

    this.saveLikedSongIds();
    this.saveLikedSongs();

    this.queueSignal.update(
      songs =>
        songs.map(
          song => ({
            ...song,
            isLiked: false
          })
        )
    );

    const current =
      this.currentSongSignal();

    if (current) {

      this.currentSongSignal.set({
        ...current,
        isLiked: false
      });
    }
  }

  playLikedSongs(): void {

    const songs =
      this.likedSongsSignal();

    if (!songs.length) {
      return;
    }

    this.playQueue(
      songs,
      0
    );
  }

  playSong(
    song: Song
  ): void {

    if (!song) {
      return;
    }

    const queue =
      this.queueSignal();

    let index =
      queue.findIndex(
        currentSong =>
          currentSong.id === song.id
      );

    if (index === -1) {

      const songWithLikeState: Song = {
        ...song,
        isLiked:
          this.isSongLiked(song.id)
      };

      this.queueSignal.update(
        songs => {

          const updatedQueue =
            this.removeQueueDuplicates([
              ...songs,
              songWithLikeState
            ]);

          return updatedQueue;
        }
      );

      index =
        this.queueSignal().findIndex(
          currentSong =>
            currentSong.id === song.id
        );

      if (index === -1) {

        const normalizedTitle =
          this.normalizeQueueText(
            song.title
          );

        const normalizedArtist =
          this.normalizeQueueText(
            song.artist
          );

        index =
          this.queueSignal().findIndex(
            currentSong =>
              this.normalizeQueueText(
                currentSong.title
              ) === normalizedTitle &&
              this.normalizeQueueText(
                currentSong.artist
              ) === normalizedArtist
          );
      }

      if (index < 0) {
        return;
      }

      song = {
        ...this.queueSignal()[index],
        isLiked:
          this.isSongLiked(
            this.queueSignal()[index].id
          )
      };

    } else {

      song = {
        ...queue[index],
        isLiked:
          this.isSongLiked(song.id)
      };
    }

    this.currentIndexSignal.set(index);

    this.currentSongSignal.set(song);

    this.currentTimeSignal.set(0);

    this.durationSignal.set(0);

    this.audio.pause();

    this.audio.src =
      song.audioUrl;

    this.audio.load();

    this.audio.play()
      .then(() => {
        this.isPlayingSignal.set(true);
      })
      .catch(error => {

        console.error(
          'ZUNO playback error:',
          error
        );

        this.isPlayingSignal.set(false);
      });
  }

  togglePlayPause(): void {

    const song =
      this.currentSongSignal();

    if (!song) {
      return;
    }

    if (this.audio.paused) {

      this.audio.play()
        .then(() => {
          this.isPlayingSignal.set(true);
        })
        .catch(error => {
          console.error(
            'ZUNO playback error:',
            error
          );
        });

    } else {

      this.audio.pause();
    }
  }

  pause(): void {
    this.audio.pause();
  }

  resume(): void {

    if (!this.currentSongSignal()) {
      return;
    }

    this.audio.play()
      .catch(error => {
        console.error(
          'ZUNO playback error:',
          error
        );
      });
  }

  nextSong(): void {

    const queue =
      this.queueSignal();

    if (!queue.length) {
      return;
    }

    let nextIndex: number;

    if (this.shuffleSignal()) {

      if (queue.length === 1) {

        nextIndex = 0;

      } else {

        do {

          nextIndex =
            Math.floor(
              Math.random() *
              queue.length
            );

        } while (
          nextIndex ===
          this.currentIndexSignal()
        );
      }

    } else {

      nextIndex =
        this.currentIndexSignal() + 1;

      if (
        nextIndex >= queue.length
      ) {
        nextIndex = 0;
      }
    }

    const nextSong =
      queue[nextIndex];

    if (nextSong) {
      this.playSong(nextSong);
    }
  }

  previousSong(): void {

    const queue =
      this.queueSignal();

    if (!queue.length) {
      return;
    }

    if (
      this.audio.currentTime > 3
    ) {
      this.seek(0);
      return;
    }

    let previousIndex =
      this.currentIndexSignal() - 1;

    if (previousIndex < 0) {
      previousIndex =
        queue.length - 1;
    }

    const previousSong =
      queue[previousIndex];

    if (previousSong) {
      this.playSong(previousSong);
    }
  }

  private handleSongEnded(): void {

    if (this.repeatSignal()) {

      this.audio.currentTime = 0;

      this.audio.play()
        .catch(error => {
          console.error(
            'ZUNO repeat playback error:',
            error
          );
        });

      return;
    }

    this.nextSong();
  }

  toggleShuffle(): void {

    this.shuffleSignal.update(
      enabled => !enabled
    );
  }

  toggleRepeat(): void {

    this.repeatSignal.update(
      enabled => !enabled
    );
  }

  seek(
    time: number
  ): void {

    if (!Number.isFinite(time)) {
      return;
    }

    const duration =
      this.audio.duration;

    if (!Number.isFinite(duration)) {
      return;
    }

    const safeTime =
      Math.max(
        0,
        Math.min(
          time,
          duration
        )
      );

    this.audio.currentTime =
      safeTime;

    this.currentTimeSignal.set(
      safeTime
    );
  }

  skipForward(
    seconds = 10
  ): void {

    if (
      !Number.isFinite(
        this.audio.duration
      )
    ) {
      return;
    }

    this.seek(
      this.audio.currentTime +
      seconds
    );
  }

  skipBackward(
    seconds = 10
  ): void {

    this.seek(
      this.audio.currentTime -
      seconds
    );
  }

  setVolume(
    volume: number
  ): void {

    if (!Number.isFinite(volume)) {
      return;
    }

    const safeVolume =
      Math.max(
        0,
        Math.min(
          1,
          volume
        )
      );

    this.audio.volume =
      safeVolume;

    this.volumeSignal.set(
      safeVolume
    );
  }

  toggleMute(): void {

    if (this.audio.volume > 0) {

      this.audio.volume = 0;

      this.volumeSignal.set(0);

    } else {

      this.audio.volume = 0.8;

      this.volumeSignal.set(0.8);
    }
  }

  setQueue(
    songs: Song[],
    startIndex = 0
  ): void {

    if (!songs.length) {
      return;
    }

    const requestedSong =
      songs[
        Math.max(
          0,
          Math.min(
            startIndex,
            songs.length - 1
          )
        )
      ];

    const updatedSongs =
      songs.map(
        song => ({
          ...song,
          isLiked:
            this.isSongLiked(song.id)
        })
      );

    const uniqueSongs =
      this.removeQueueDuplicates(
        updatedSongs
      );

    if (!uniqueSongs.length) {
      return;
    }

    this.queueSignal.set(
      uniqueSongs
    );

    let safeIndex = 0;

    if (requestedSong) {

      const exactIndex =
        uniqueSongs.findIndex(
          song =>
            song.id === requestedSong.id
        );

      if (exactIndex >= 0) {

        safeIndex = exactIndex;

      } else {

        const requestedTitle =
          this.normalizeQueueText(
            requestedSong.title
          );

        const requestedArtist =
          this.normalizeQueueText(
            requestedSong.artist
          );

        const matchingIndex =
          uniqueSongs.findIndex(
            song =>
              this.normalizeQueueText(
                song.title
              ) === requestedTitle &&
              this.normalizeQueueText(
                song.artist
              ) === requestedArtist
          );

        if (matchingIndex >= 0) {
          safeIndex = matchingIndex;
        }
      }
    }

    this.currentIndexSignal.set(
      safeIndex
    );
  }

  playQueue(
    songs: Song[],
    startIndex = 0
  ): void {

    if (!songs.length) {
      return;
    }

    const requestedSong =
      songs[
        Math.max(
          0,
          Math.min(
            startIndex,
            songs.length - 1
          )
        )
      ];

    this.setQueue(
      songs,
      startIndex
    );

    const queue =
      this.queueSignal();

    if (!queue.length) {
      return;
    }

    let safeIndex =
      this.currentIndexSignal();

    if (requestedSong) {

      const exactIndex =
        queue.findIndex(
          song =>
            song.id === requestedSong.id
        );

      if (exactIndex >= 0) {

        safeIndex = exactIndex;

      } else {

        const requestedTitle =
          this.normalizeQueueText(
            requestedSong.title
          );

        const requestedArtist =
          this.normalizeQueueText(
            requestedSong.artist
          );

        const matchingIndex =
          queue.findIndex(
            song =>
              this.normalizeQueueText(
                song.title
              ) === requestedTitle &&
              this.normalizeQueueText(
                song.artist
              ) === requestedArtist
          );

        if (matchingIndex >= 0) {
          safeIndex = matchingIndex;
        }
      }
    }

    const firstSong =
      queue[safeIndex];

    if (firstSong) {
      this.playSong(firstSong);
    }
  }
}