import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface AlbumCardData {
  id?: string;
  title: string;
  artist: string;
  image: string;
  year?: number;
  type?: string;
}

@Component({
  selector: 'app-album-card',
  standalone: true,
  imports: [],
  templateUrl: './album-card.html',
  styleUrl: './album-card.css'
})
export class AlbumCard {
  @Input({ required: true })
  album!: AlbumCardData;

  @Input()
  isPlaying = false;

  @Output()
  albumClick = new EventEmitter<AlbumCardData>();

  @Output()
  playClick = new EventEmitter<AlbumCardData>();

  openAlbum(): void {
    this.albumClick.emit(this.album);
  }

  playAlbum(event: MouseEvent): void {
    event.stopPropagation();
    this.playClick.emit(this.album);
  }

  getSubtitle(): string {
    const parts: string[] = [];

    if (this.album.year) {
      parts.push(String(this.album.year));
    }

    if (this.album.type) {
      parts.push(this.album.type);
    }

    if (this.album.artist) {
      parts.push(this.album.artist);
    }

    return parts.join(' • ');
  }
}