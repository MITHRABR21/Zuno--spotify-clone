import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ArtistCardData {
  id?: string;
  name: string;
  image: string;
  subtitle?: string;
}

@Component({
  selector: 'app-artist-card',
  standalone: true,
  imports: [],
  templateUrl: './artist-card.html',
  styleUrl: './artist-card.css'
})
export class ArtistCard {
  @Input({ required: true })
  artist!: ArtistCardData;

  @Input()
  isPlaying = false;

  @Output()
  artistClick = new EventEmitter<ArtistCardData>();

  @Output()
  playClick = new EventEmitter<ArtistCardData>();

  openArtist(): void {
    this.artistClick.emit(this.artist);
  }

  playArtist(event: MouseEvent): void {
    event.stopPropagation();
    this.playClick.emit(this.artist);
  }
}