import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Search } from './pages/search/search';
import { Artist } from './pages/artist/artist';
import { Album } from './pages/album/album';
import { LikedSongs } from './pages/liked-songs/liked-songs';
import { Library } from './pages/library/library';
import { PlaylistPage } from './pages/playlist/playlist';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'ZUNO — Home'
  },
  {
    path: 'search',
    component: Search,
    title: 'ZUNO — Search'
  },
  {
    path: 'artist',
    component: Artist,
    title: 'ZUNO — Artist'
  },
  {
    path: 'album',
    component: Album,
    title: 'ZUNO — Album'
  },
  {
    path: 'liked-songs',
    component: LikedSongs,
    title: 'ZUNO — Liked Songs'
  },
  {
    path: 'library',
    component: Library,
    title: 'ZUNO — Your Library'
  },
  {
    path: 'playlist/:id',
    component: PlaylistPage,
    title: 'ZUNO — Playlist'
  },
  {
    path: '**',
    redirectTo: ''
  }
];