import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { PlaylistService } from '../../core/services/playlist.service';
import { Playlist } from '../../core/models/playlist.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  constructor(
    public readonly playlistService: PlaylistService
  ) {}

  get playlists(): Playlist[] {
    return this.playlistService.playlists();
  }

  createPlaylist(): void {
    const name = window.prompt(
      'Enter playlist name:',
      'My Playlist'
    );

    if (!name?.trim()) {
      return;
    }

    this.playlistService.createPlaylist(name.trim());
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
}