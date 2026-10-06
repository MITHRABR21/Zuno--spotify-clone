import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

export interface CatalogTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
  primaryGenreName: string;
  releaseDate: string;
  trackTimeMillis: number;
  country: string;
  trackViewUrl?: string;
}

export interface CatalogSearchResponse {
  resultCount: number;
  results: CatalogTrack[];
}

interface CachedSearch {
  savedAt: number;
  tracks: CatalogTrack[];
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly searchUrl = 'https://itunes.apple.com/search';
  private readonly cacheLifetime = 30 * 60 * 1000;
  private readonly requestGap = 0;
  private readonly storagePrefix = 'zuno-catalog-v2:';

  private readonly cache = new Map<string, CachedSearch>();

  private readonly pendingRequests = new Map<
    string,
    Promise<CatalogTrack[]>
  >();

  private requestQueue: Promise<void> = Promise.resolve();
  private nextRequestAt = 0;

  constructor(private readonly http: HttpClient) {}

  async searchTracks(
    term: string,
    limit: number = 25
  ): Promise<CatalogTrack[]> {
    const cleanTerm = term.trim().replace(/\s+/g, ' ');

    if (!cleanTerm) {
      return [];
    }

    const safeLimit = Number.isFinite(limit)
      ? Math.min(200, Math.max(1, Math.floor(limit)))
      : 25;

    const key = `${cleanTerm.toLowerCase()}::${safeLimit}`;
    const cached = this.readCache(key);

    if (
      cached &&
      Date.now() - cached.savedAt < this.cacheLifetime
    ) {
      return [...cached.tracks];
    }

    const pending = this.pendingRequests.get(key);

    if (pending) {
      return pending;
    }

    const request = this.enqueueRequest(cleanTerm, safeLimit)
      .then(tracks => {
        this.writeCache(key, tracks);
        return [...tracks];
      })
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, request);

    return request;
  }

  private enqueueRequest(
    term: string,
    limit: number
  ): Promise<CatalogTrack[]> {
    const request = this.requestQueue.then(async () => {
      const waitTime = Math.max(
        0,
        this.nextRequestAt - Date.now()
      );

      if (waitTime > 0) {
        await new Promise<void>(resolve => {
          setTimeout(resolve, waitTime);
        });
      }

      this.nextRequestAt = Date.now() + this.requestGap;

      return this.fetchTracks(term, limit);
    });

    // A failed request must not permanently stop the queue.
    this.requestQueue = request.then(
      () => undefined,
      () => undefined
    );

    return request;
  }

  private async fetchTracks(
    term: string,
    limit: number
  ): Promise<CatalogTrack[]> {
    const params = new HttpParams()
      .set('term', term)
      .set('entity', 'song')
      .set('media', 'music')
      .set('country', 'IN')
      .set('limit', String(limit));

    const url = `${this.searchUrl}?${params.toString()}`;

    const response = await firstValueFrom(
      this.http
        .jsonp<CatalogSearchResponse>(url, 'callback')
        .pipe(timeout(15000))
    );

    if (!response || !Array.isArray(response.results)) {
      throw new Error('Invalid music catalogue response.');
    }

    const tracks = new Map<number, CatalogTrack>();

    for (const track of response.results) {
      if (
        track.trackId &&
        track.trackName &&
        track.artistName &&
        track.previewUrl
      ) {
        tracks.set(track.trackId, track);
      }
    }

    return Array.from(tracks.values());
  }

  private readCache(key: string): CachedSearch | undefined {
    const memoryCache = this.cache.get(key);

    if (memoryCache) {
      return memoryCache;
    }

    try {
      if (typeof sessionStorage === 'undefined') {
        return undefined;
      }

      const stored = sessionStorage.getItem(
        this.storagePrefix + key
      );

      if (!stored) {
        return undefined;
      }

      const parsed = JSON.parse(stored) as CachedSearch;

      if (
        !Number.isFinite(parsed.savedAt) ||
        !Array.isArray(parsed.tracks)
      ) {
        return undefined;
      }

      const validTracks = parsed.tracks.filter(track =>
        track &&
        typeof track.trackId === 'number' &&
        typeof track.trackName === 'string' &&
        typeof track.artistName === 'string' &&
        typeof track.previewUrl === 'string'
      );

      const entry: CachedSearch = {
        savedAt: parsed.savedAt,
        tracks: validTracks
      };

      this.cache.set(key, entry);

      return entry;
    } catch {
      return undefined;
    }
  }

  private writeCache(
    key: string,
    tracks: CatalogTrack[]
  ): void {
    const entry: CachedSearch = {
      savedAt: Date.now(),
      tracks
    };

    this.cache.set(key, entry);

    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(
          this.storagePrefix + key,
          JSON.stringify(entry)
        );
      }
    } catch {
      // Search still works if browser storage is unavailable.
    }
  }
}