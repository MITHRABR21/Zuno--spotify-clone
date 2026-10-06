import { Component, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MusicService } from '../../core/services/music.service';
import { SONGS } from '../../data/songs';
import { LANGUAGES, MusicLanguage } from '../../data/languages';
import { Song } from '../../core/models/song.model';

@Component({
selector: 'app-language',
standalone: true,
imports: [RouterLink],
templateUrl: './language.html',
styleUrl: './language.css'
})
export class Language {
protected readonly language = computed<MusicLanguage | undefined>(() => {
const id = this.route.snapshot.paramMap.get('languageId');
return LANGUAGES.find(item => item.id === id);
});

protected readonly songs = computed<Song[]>(() => {
const selectedLanguage = this.language();

if (!selectedLanguage) {
  return [];
}

return SONGS.filter(
  song => song.language.toLowerCase() === selectedLanguage.name.toLowerCase()
);

});

protected readonly popularSongs = computed<Song[]>(() => {
return [...this.songs()]
.sort((a, b) => b.playCount - a.playCount)
.slice(0, 6);
});

protected readonly latestSongs = computed<Song[]>(() => {
return [...this.songs()]
.sort((a, b) => b.releaseYear - a.releaseYear)
.slice(0, 6);
});

constructor(
private readonly route: ActivatedRoute,
protected readonly musicService: MusicService
) {}

playSong(song: Song): void {
this.musicService.playSong(song);
}

isCurrentSong(song: Song): boolean {
return this.musicService.currentSong()?.id === song.id;
}

isPlaying(song: Song): boolean {
return this.isCurrentSong(song) && this.musicService.isPlaying();
}

playAll(): void {
const songs = this.songs();

if (songs.length > 0) {
  this.musicService.setQueue(songs, 0);
  this.musicService.playSong(songs[0]);
}

}

getLanguageName(): string {
return this.language()?.name ?? 'Music';
}

getNativeName(): string {
return this.language()?.nativeName ?? '';
}

getDescription(): string {
return this.language()?.description ?? 'Explore music from around the world.';
}

getSongCount(): number {
return this.songs().length;
}

trackBySongId(_index: number, song: Song): string {
return song.id;
}
}