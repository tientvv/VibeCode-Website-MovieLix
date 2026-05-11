// ─── Movie & Content Types ──────────────────────

export interface VideoSource {
  id?: number;
  quality: string;
  driveUrl: string;
  driveFileId?: string;
  label?: string;
}

export interface SubtitleTrack {
  id?: number;
  language: string;
  label?: string;
  fileUrl?: string;
  srtContent?: string;
  isDefault?: boolean;
  _saved?: boolean;
}

export interface Episode {
  id: number;
  season: number;
  episode: number;
  title?: string;
  runtime?: number;
  videoSources: VideoSource[];
  subtitles: SubtitleTrack[];
}

export interface Movie {
  id: number;
  title: string;
  titleVi?: string;
  slug: string;
  overview?: string;
  overviewVi?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  imdbRating?: number;
  imdbId?: string;
  releaseYear?: number;
  runtime?: number;
  type: 'MOVIE' | 'TV_SERIES';
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
  featured: boolean;
  videoSources?: VideoSource[];
  subtitles?: SubtitleTrack[];
  episodes?: Episode[];
  genres?: Array<{ id: number; name: string; slug: string }>;
}

// ─── Admin Form Types ───────────────────────────

export interface MovieForm {
  title: string;
  titleVi: string;
  overview: string;
  overviewVi: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  imdbRating: number | null;
  imdbId: string;
  releaseYear: number | null;
  runtime: number | null;
  type: string;
  status: string;
  featured: boolean;
}

export interface NewEpisodeForm {
  season: number;
  episode: number;
  title: string;
  runtime: number | string;
}

// ─── Quality Map ────────────────────────────────

export const QUALITY_MAP: Record<string, string> = {
  HD_720: '720p',
  FHD_1080: '1080p',
  QHD_2K: '2K',
};

export const LANGUAGE_LABEL_MAP: Record<string, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
};
