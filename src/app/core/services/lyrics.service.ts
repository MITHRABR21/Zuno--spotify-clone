import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface LyricsResult {
  lyrics: string;
  syncedLyrics?: string | null;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
}

interface LrcLibResponse {
  id?: number;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class LyricsService {
  private readonly apiUrl = 'https://lrclib.net/api';

  constructor(private readonly http: HttpClient) {}

  async getLyrics(
    trackName: string,
    artistName: string,
    albumName?: string,
    duration?: number
  ): Promise<LyricsResult | null> {
    const cleanTrack = this.cleanText(trackName);
    const cleanArtist = this.cleanArtist(artistName);
    const cleanAlbum = this.cleanText(albumName ?? '');

    if (!cleanTrack || !cleanArtist) {
      return null;
    }

    const exactResult = await this.getExactLyrics(
      cleanTrack,
      cleanArtist,
      cleanAlbum,
      duration
    );

    if (exactResult) {
      return exactResult;
    }

    return this.searchLyrics(cleanTrack, cleanArtist);
  }

  private async getExactLyrics(
    trackName: string,
    artistName: string,
    albumName: string,
    duration?: number
  ): Promise<LyricsResult | null> {
    let params = new HttpParams()
      .set('track_name', trackName)
      .set('artist_name', artistName);

    if (albumName) {
      params = params.set('album_name', albumName);
    }

    if (duration && duration > 0) {
      params = params.set(
        'duration',
        Math.round(duration).toString()
      );
    }

    try {
      const response = await firstValueFrom(
        this.http.get<LrcLibResponse>(
          `${this.apiUrl}/get`,
          { params }
        )
      );

      return this.mapLyrics(response);
    } catch {
      return null;
    }
  }

  private async searchLyrics(
    trackName: string,
    artistName: string
  ): Promise<LyricsResult | null> {
    const params = new HttpParams().set(
      'q',
      `${trackName} ${artistName}`
    );

    try {
      const results = await firstValueFrom(
        this.http.get<LrcLibResponse[]>(
          `${this.apiUrl}/search`,
          { params }
        )
      );

      if (!Array.isArray(results) || results.length === 0) {
        return null;
      }

      const bestMatch =
        results.find(result =>
          this.isGoodMatch(
            result,
            trackName,
            artistName
          )
        ) ??
        results.find(result =>
          !!result.plainLyrics ||
          !!result.syncedLyrics
        );

      if (!bestMatch) {
        return null;
      }

      return this.mapLyrics(bestMatch);
    } catch (error) {
      console.warn(
        `ZUNO lyrics search failed for "${trackName}" by "${artistName}".`,
        error
      );

      return null;
    }
  }

  private mapLyrics(
    response: LrcLibResponse | null | undefined
  ): LyricsResult | null {
    if (!response) {
      return null;
    }

    const plainLyrics =
      response.plainLyrics?.trim() ?? '';

    const syncedLyrics =
      response.syncedLyrics?.trim() ?? null;

    if (!plainLyrics && !syncedLyrics) {
      return null;
    }

    return {
      lyrics:
        plainLyrics ||
        this.removeTimestamps(syncedLyrics ?? ''),
      syncedLyrics,
      trackName: response.trackName,
      artistName: response.artistName,
      albumName: response.albumName,
      duration: response.duration
    };
  }

  private isGoodMatch(
    result: LrcLibResponse,
    trackName: string,
    artistName: string
  ): boolean {
    const resultTrack =
      this.normalize(result.trackName ?? '');

    const resultArtist =
      this.normalize(result.artistName ?? '');

    const wantedTrack =
      this.normalize(trackName);

    const wantedArtist =
      this.normalize(artistName);

    const trackMatches =
      resultTrack === wantedTrack ||
      resultTrack.includes(wantedTrack) ||
      wantedTrack.includes(resultTrack);

    const artistMatches =
      resultArtist === wantedArtist ||
      resultArtist.includes(wantedArtist) ||
      wantedArtist.includes(resultArtist);

    return (
      trackMatches &&
      artistMatches &&
      (!!result.plainLyrics || !!result.syncedLyrics)
    );
  }

  private cleanText(value: string): string {
    return value
      .replace(/\s+/g, ' ')
      .trim();
  }

  private cleanArtist(value: string): string {
    return value
      .replace(/\s*&\s*/g, ', ')
      .replace(/\s+feat\.?\s+/gi, ', ')
      .replace(/\s+ft\.?\s+/gi, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private removeTimestamps(value: string): string {
    return value
      .replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}