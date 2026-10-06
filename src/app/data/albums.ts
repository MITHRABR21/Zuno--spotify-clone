export interface ZunoAlbumCollection {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  category: 'tamil' | 'indian' | 'international';
  type: 'album' | 'soundtrack' | 'collection';
  searchQueries: string[];
  genres: string[];
  featured: boolean;
}

export const ZUNO_ALBUM_COLLECTIONS: ZunoAlbumCollection[] = [
  {
    id: 'anirudh-tamil',
    title: 'Anirudh Essentials',
    artist: 'Anirudh Ravichander',
    artistId: 'anirudh-ravichander',
    category: 'tamil',
    type: 'collection',
    searchQueries: [
      'Anirudh Ravichander Tamil soundtrack',
      'Anirudh Ravichander Tamil songs',
      'Anirudh Tamil hits'
    ],
    genres: ['Tamil', 'Film Music', 'Mass', 'Romantic'],
    featured: true
  },
  {
    id: 'ar-rahman-tamil',
    title: 'A.R. Rahman Essentials',
    artist: 'A.R. Rahman',
    artistId: 'ar-rahman',
    category: 'tamil',
    type: 'collection',
    searchQueries: [
      'A R Rahman Tamil soundtrack',
      'A R Rahman Tamil movie songs',
      'A R Rahman Tamil hits'
    ],
    genres: ['Tamil', 'Soundtrack', 'Melody', 'Film Music'],
    featured: true
  },
  {
    id: 'harris-jayaraj-tamil',
    title: 'Harris Jayaraj Essentials',
    artist: 'Harris Jayaraj',
    artistId: 'harris-jayaraj',
    category: 'tamil',
    type: 'collection',
    searchQueries: [
      'Harris Jayaraj Tamil soundtrack',
      'Harris Jayaraj Tamil songs',
      'Harris Jayaraj Tamil hits'
    ],
    genres: ['Tamil', 'Film Music', 'Melody', 'Romantic'],
    featured: true
  },
  {
    id: 'yuvan-tamil',
    title: 'Yuvan Essentials',
    artist: 'Yuvan Shankar Raja',
    artistId: 'yuvan-shankar-raja',
    category: 'tamil',
    type: 'collection',
    searchQueries: [
      'Yuvan Shankar Raja Tamil soundtrack',
      'Yuvan Shankar Raja Tamil songs',
      'Yuvan Tamil hits'
    ],
    genres: ['Tamil', 'Film Music', 'Melody', 'Dance'],
    featured: true
  },
  {
    id: 'gv-prakash-tamil',
    title: 'G.V. Prakash Essentials',
    artist: 'G. V. Prakash Kumar',
    artistId: 'gv-prakash-kumar',
    category: 'tamil',
    type: 'collection',
    searchQueries: [
      'G V Prakash Kumar Tamil soundtrack',
      'GV Prakash Tamil songs',
      'GV Prakash Tamil hits'
    ],
    genres: ['Tamil', 'Film Music', 'Melody', 'Mass'],
    featured: true
  },
  {
    id: 'santhosh-narayanan-tamil',
    title: 'Santhosh Narayanan Essentials',
    artist: 'Santhosh Narayanan',
    artistId: 'santhosh-narayanan',
    category: 'tamil',
    type: 'collection',
    searchQueries: [
      'Santhosh Narayanan Tamil soundtrack',
      'Santhosh Narayanan Tamil songs',
      'Santhosh Narayanan Tamil hits'
    ],
    genres: ['Tamil', 'Film Music', 'Alternative', 'Folk'],
    featured: true
  },
  {
    id: 'sid-sriram-tamil',
    title: 'Sid Sriram Essentials',
    artist: 'Sid Sriram',
    artistId: 'sid-sriram',
    category: 'tamil',
    type: 'collection',
    searchQueries: [
      'Sid Sriram Tamil songs',
      'Sid Sriram Tamil melody',
      'Sid Sriram Tamil love songs'
    ],
    genres: ['Tamil', 'Melody', 'Romantic', 'Playback'],
    featured: true
  },
  {
    id: 'tamil-movie-soundtracks',
    title: 'Tamil Movie Soundtracks',
    artist: 'Various Artists',
    artistId: 'various-artists',
    category: 'tamil',
    type: 'soundtrack',
    searchQueries: [
      'Tamil original motion picture soundtrack',
      'Tamil movie soundtrack',
      'Tamil cinema soundtrack'
    ],
    genres: ['Tamil', 'Soundtrack', 'Film Music'],
    featured: true
  }
];

export const FEATURED_ALBUM_COLLECTIONS =
  ZUNO_ALBUM_COLLECTIONS.filter(
    collection => collection.featured
  );

export const TAMIL_ALBUM_COLLECTIONS =
  ZUNO_ALBUM_COLLECTIONS.filter(
    collection => collection.category === 'tamil'
  );

export function getAlbumCollectionById(
  id: string
): ZunoAlbumCollection | undefined {
  return ZUNO_ALBUM_COLLECTIONS.find(
    collection => collection.id === id
  );
}

export function getAlbumCollectionsByArtist(
  artistId: string
): ZunoAlbumCollection[] {
  return ZUNO_ALBUM_COLLECTIONS.filter(
    collection => collection.artistId === artistId
  );
}

export function searchAlbumCollections(
  query: string
): ZunoAlbumCollection[] {
  const normalized = query
    .trim()
    .toLowerCase();

  if (!normalized) {
    return [];
  }

  return ZUNO_ALBUM_COLLECTIONS.filter(
    collection =>
      collection.title
        .toLowerCase()
        .includes(normalized) ||
      collection.artist
        .toLowerCase()
        .includes(normalized) ||
      collection.genres.some(
        genre =>
          genre
            .toLowerCase()
            .includes(normalized)
      )
  );
}