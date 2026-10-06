import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from './shared/sidebar/sidebar';
import { Topbar } from './shared/topbar/topbar';
import { MusicPlayer } from './shared/music-player/music-player';

@Component({
selector: 'app-root',
standalone: true,
imports: [
RouterOutlet,
Sidebar,
Topbar,
MusicPlayer
],
templateUrl: './app.html',
styleUrl: './app.css'
})
export class App {

protected readonly title = signal('zuno');

}
