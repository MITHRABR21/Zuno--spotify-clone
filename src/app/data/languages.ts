export interface MusicLanguage {
id: string;
name: string;
nativeName: string;
code: string;
description: string;
coverImage: string;
}

export const LANGUAGES: MusicLanguage[] = [
{
id: 'tamil',
name: 'Tamil',
nativeName: 'தமிழ்',
code: 'TA',
description: 'Tamil songs, artists and albums',
coverImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=85'
},
{
id: 'hindi',
name: 'Hindi',
nativeName: 'हिन्दी',
code: 'HI',
description: 'Hindi music and latest hits',
coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=85'
},
{
id: 'telugu',
name: 'Telugu',
nativeName: 'తెలుగు',
code: 'TE',
description: 'Telugu melodies and trending songs',
coverImage: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=85'
},
{
id: 'malayalam',
name: 'Malayalam',
nativeName: 'മലയാളം',
code: 'ML',
description: 'Malayalam music and film songs',
coverImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=85'
},
{
id: 'kannada',
name: 'Kannada',
nativeName: 'ಕನ್ನಡ',
code: 'KN',
description: 'Kannada hits and popular tracks',
coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=85'
},
{
id: 'bengali',
name: 'Bengali',
nativeName: 'বাংলা',
code: 'BN',
description: 'Bengali music and timeless melodies',
coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=85'
},
{
id: 'marathi',
name: 'Marathi',
nativeName: 'मराठी',
code: 'MR',
description: 'Marathi songs and regional favourites',
coverImage: 'https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?auto=format&fit=crop&w=800&q=85'
},
{
id: 'punjabi',
name: 'Punjabi',
nativeName: 'ਪੰਜਾਬੀ',
code: 'PA',
description: 'Punjabi beats and energetic hits',
coverImage: 'https://images.unsplash.com/photo-1571266028243-d220c9c3b6f0?auto=format&fit=crop&w=800&q=85'
},
{
id: 'gujarati',
name: 'Gujarati',
nativeName: 'ગુજરાતી',
code: 'GU',
description: 'Gujarati music and folk favourites',
coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=85'
},
{
id: 'odia',
name: 'Odia',
nativeName: 'ଓଡ଼ିଆ',
code: 'OD',
description: 'Odia songs and regional music',
coverImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=85'
},
{
id: 'assamese',
name: 'Assamese',
nativeName: 'অসমীয়া',
code: 'AS',
description: 'Assamese music and melodies',
coverImage: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=85'
},
{
id: 'urdu',
name: 'Urdu',
nativeName: 'اردو',
code: 'UR',
description: 'Urdu music and soulful melodies',
coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=85'
},
{
id: 'english',
name: 'English',
nativeName: 'English',
code: 'EN',
description: 'Global English music and hits',
coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=85'
},
{
id: 'japanese',
name: 'Japanese',
nativeName: '日本語',
code: 'JA',
description: 'Japanese pop and contemporary music',
coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=85'
},
{
id: 'korean',
name: 'Korean',
nativeName: '한국어',
code: 'KO',
description: 'K-pop and Korean music',
coverImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=85'
},
{
id: 'spanish',
name: 'Spanish',
nativeName: 'Español',
code: 'ES',
description: 'Spanish and Latin music',
coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=85'
},
{
id: 'french',
name: 'French',
nativeName: 'Français',
code: 'FR',
description: 'French music and modern favourites',
coverImage: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=85'
},
{
id: 'german',
name: 'German',
nativeName: 'Deutsch',
code: 'DE',
description: 'German music and electronic sounds',
coverImage: 'https://images.unsplash.com/photo-1571266028243-d220c9c3b6f0?auto=format&fit=crop&w=800&q=85'
},
{
id: 'italian',
name: 'Italian',
nativeName: 'Italiano',
code: 'IT',
description: 'Italian songs and timeless music',
coverImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=85'
},
{
id: 'portuguese',
name: 'Portuguese',
nativeName: 'Português',
code: 'PT',
description: 'Portuguese and Brazilian music',
coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=85'
}
];
