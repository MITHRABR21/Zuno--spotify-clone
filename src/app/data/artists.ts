export interface ZunoArtist {
  id: string;
  name: string;
  displayName: string;
  category: 'tamil' | 'indian' | 'international';
  role: 'music-director' | 'singer' | 'singer-composer' | 'artist';
  searchQueries: string[];
  genres: string[];
  featured: boolean;
}

export const ZUNO_ARTISTS: ZunoArtist[] = [
  {
    id: 'anirudh-ravichander',
    name: 'Anirudh Ravichander',
    displayName: 'Anirudh Ravichander',
    category: 'tamil',
    role: 'singer-composer',
    searchQueries: [
      'Anirudh Ravichander Tamil',
      'Anirudh Ravichander soundtrack',
      'Anirudh Tamil hits',
      'Anirudh Tamil songs'
    ],
    genres: [
      'Tamil',
      'Film Music',
      'Pop',
      'Mass',
      'Romantic'
    ],
    featured: true
  },

  {
    id: 'ar-rahman',
    name: 'A.R. Rahman',
    displayName: 'A.R. Rahman',
    category: 'tamil',
    role: 'music-director',
    searchQueries: [
      'A R Rahman Tamil',
      'A R Rahman Tamil soundtrack',
      'A R Rahman Tamil movie songs',
      'A R Rahman Tamil hits'
    ],
    genres: [
      'Tamil',
      'Film Music',
      'Soundtrack',
      'Melody',
      'Indian'
    ],
    featured: true
  },

  {
    id: 'harris-jayaraj',
    name: 'Harris Jayaraj',
    displayName: 'Harris Jayaraj',
    category: 'tamil',
    role: 'music-director',
    searchQueries: [
      'Harris Jayaraj Tamil',
      'Harris Jayaraj soundtrack',
      'Harris Jayaraj Tamil hits',
      'Harris Jayaraj melody'
    ],
    genres: [
      'Tamil',
      'Film Music',
      'Melody',
      'Romantic'
    ],
    featured: true
  },

  {
    id: 'yuvan-shankar-raja',
    name: 'Yuvan Shankar Raja',
    displayName: 'Yuvan Shankar Raja',
    category: 'tamil',
    role: 'singer-composer',
    searchQueries: [
      'Yuvan Shankar Raja Tamil',
      'Yuvan Shankar Raja soundtrack',
      'Yuvan Tamil hits',
      'Yuvan Tamil melody'
    ],
    genres: [
      'Tamil',
      'Film Music',
      'Melody',
      'Romantic',
      'Dance'
    ],
    featured: true
  },

  {
    id: 'sid-sriram',
    name: 'Sid Sriram',
    displayName: 'Sid Sriram',
    category: 'tamil',
    role: 'singer',
    searchQueries: [
      'Sid Sriram Tamil',
      'Sid Sriram Tamil songs',
      'Sid Sriram Tamil melody',
      'Sid Sriram love songs'
    ],
    genres: [
      'Tamil',
      'Melody',
      'Romantic',
      'Playback'
    ],
    featured: true
  },

  {
    id: 'gv-prakash-kumar',
    name: 'G. V. Prakash Kumar',
    displayName: 'G. V. Prakash Kumar',
    category: 'tamil',
    role: 'singer-composer',
    searchQueries: [
      'G V Prakash Kumar Tamil',
      'GV Prakash Tamil songs',
      'GV Prakash soundtrack',
      'GV Prakash Tamil hits'
    ],
    genres: [
      'Tamil',
      'Film Music',
      'Melody',
      'Mass'
    ],
    featured: true
  },

  {
    id: 'santhosh-narayanan',
    name: 'Santhosh Narayanan',
    displayName: 'Santhosh Narayanan',
    category: 'tamil',
    role: 'music-director',
    searchQueries: [
      'Santhosh Narayanan Tamil',
      'Santhosh Narayanan soundtrack',
      'Santhosh Narayanan Tamil hits'
    ],
    genres: [
      'Tamil',
      'Film Music',
      'Alternative',
      'Folk'
    ],
    featured: true
  },

  {
    id: 'hiphop-tamizha',
    name: 'Hiphop Tamizha',
    displayName: 'Hiphop Tamizha',
    category: 'tamil',
    role: 'singer-composer',
    searchQueries: [
      'Hiphop Tamizha Tamil',
      'Hiphop Tamizha songs',
      'Hiphop Tamizha Tamil hits'
    ],
    genres: [
      'Tamil',
      'Hip-Hop',
      'Film Music',
      'Dance'
    ],
    featured: true
  },

  {
    id: 'd-imman',
    name: 'D. Imman',
    displayName: 'D. Imman',
    category: 'tamil',
    role: 'music-director',
    searchQueries: [
      'D Imman Tamil',
      'D Imman Tamil songs',
      'D Imman soundtrack',
      'D Imman Tamil hits'
    ],
    genres: [
      'Tamil',
      'Film Music',
      'Folk',
      'Melody'
    ],
    featured: true
  },

  {
    id: 'pradeep-kumar',
    name: 'Pradeep Kumar',
    displayName: 'Pradeep Kumar',
    category: 'tamil',
    role: 'singer',
    searchQueries: [
      'Pradeep Kumar Tamil',
      'Pradeep Kumar Tamil songs',
      'Pradeep Kumar melody'
    ],
    genres: [
      'Tamil',
      'Melody',
      'Playback',
      'Indie'
    ],
    featured: true
  },

  {
    id: 'shreya-ghoshal',
    name: 'Shreya Ghoshal',
    displayName: 'Shreya Ghoshal',
    category: 'indian',
    role: 'singer',
    searchQueries: [
      'Shreya Ghoshal Tamil',
      'Shreya Ghoshal Tamil songs',
      'Shreya Ghoshal hits'
    ],
    genres: [
      'Tamil',
      'Hindi',
      'Indian',
      'Playback',
      'Melody'
    ],
    featured: true
  },

  {
    id: 'sp-balasubrahmanyam',
    name: 'S. P. Balasubrahmanyam',
    displayName: 'S. P. Balasubrahmanyam',
    category: 'tamil',
    role: 'singer',
    searchQueries: [
      'S P Balasubrahmanyam Tamil',
      'SPB Tamil songs',
      'SP Balasubrahmanyam Tamil hits'
    ],
    genres: [
      'Tamil',
      'Playback',
      'Classic',
      'Melody'
    ],
    featured: true
  },

  {
    id: 'ks-chithra',
    name: 'K. S. Chithra',
    displayName: 'K. S. Chithra',
    category: 'tamil',
    role: 'singer',
    searchQueries: [
      'K S Chithra Tamil',
      'KS Chithra Tamil songs',
      'Chithra Tamil hits'
    ],
    genres: [
      'Tamil',
      'Playback',
      'Classic',
      'Melody'
    ],
    featured: true
  },

  {
    id: 'arijit-singh',
    name: 'Arijit Singh',
    displayName: 'Arijit Singh',
    category: 'indian',
    role: 'singer',
    searchQueries: [
      'Arijit Singh',
      'Arijit Singh hits',
      'Arijit Singh love songs'
    ],
    genres: [
      'Hindi',
      'Indian',
      'Playback',
      'Romantic'
    ],
    featured: false
  },

  {
    id: 'taylor-swift',
    name: 'Taylor Swift',
    displayName: 'Taylor Swift',
    category: 'international',
    role: 'artist',
    searchQueries: [
      'Taylor Swift'
    ],
    genres: [
      'English',
      'Pop'
    ],
    featured: false
  },

  {
    id: 'bts',
    name: 'BTS',
    displayName: 'BTS',
    category: 'international',
    role: 'artist',
    searchQueries: [
      'BTS'
    ],
    genres: [
      'Korean',
      'K-Pop'
    ],
    featured: false
  }
];

/* =========================================================
   FEATURED ARTISTS
   ========================================================= */

export const FEATURED_ARTISTS =
  ZUNO_ARTISTS.filter(
    artist => artist.featured
  );

/* =========================================================
   TAMIL ARTISTS
   ========================================================= */

export const TAMIL_ARTISTS =
  ZUNO_ARTISTS.filter(
    artist => artist.category === 'tamil'
  );

/* =========================================================
   FIND ARTIST BY ID
   ========================================================= */

export function getArtistById(
  artistId: string
): ZunoArtist | undefined {
  return ZUNO_ARTISTS.find(
    artist => artist.id === artistId
  );
}

/* =========================================================
   FIND ARTIST BY NAME
   ========================================================= */

export function getArtistByName(
  artistName: string
): ZunoArtist | undefined {
  const normalized =
    normalizeArtistName(artistName);

  return ZUNO_ARTISTS.find(
    artist =>
      normalizeArtistName(artist.name) ===
        normalized ||
      normalizeArtistName(
        artist.displayName
      ) === normalized
  );
}

/* =========================================================
   SEARCH ARTISTS
   ========================================================= */

export function searchArtists(
  query: string
): ZunoArtist[] {
  const normalized =
    query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  return ZUNO_ARTISTS.filter(
    artist =>
      artist.name
        .toLowerCase()
        .includes(normalized) ||
      artist.genres.some(
        genre =>
          genre
            .toLowerCase()
            .includes(normalized)
      )
  );
}

/* =========================================================
   NORMALIZE ARTIST NAME
   ========================================================= */

function normalizeArtistName(
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
      /[^a-z0-9]+/g,
      ''
    )
    .trim();
}