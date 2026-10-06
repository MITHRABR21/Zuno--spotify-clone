export interface Song {
id: string;
title: string;
artist: string;
artistId: string;
album: string;
albumId: string;
coverImage: string;
audioUrl: string;
duration: number;
genre: string;
releaseYear: number;
isLiked: boolean;
playCount: number;
addedAt?: string;
}