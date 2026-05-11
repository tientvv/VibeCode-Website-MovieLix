<template>
  <div class="movie-detail" v-if="movie">
    <!-- Backdrop Hero -> Video Player -->
    <div class="movie-detail__hero" @click="!streamUrl && playVideo()">
      <template v-if="!streamUrl">
        <img
          v-if="movie.backdropUrl"
          :src="movie.backdropUrl"
          :alt="movie.title"
          class="movie-detail__backdrop"
          loading="eager"
        />
        <div class="movie-detail__hero-gradient"></div>
        <div class="movie-detail__play-overlay">
          <button class="btn-play-hero" aria-label="Play Movie">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21" />
            </svg>
          </button>
        </div>
      </template>

      <div v-else class="movie-detail__player-fullscreen" id="player-section">
        <ClientOnly>
          <VideoPlayer
            :src="streamUrl"
            :poster="movie.backdropUrl"
            :title="movie.title"
            :subtitles="subtitleTracks"
            :is-hls="false"
            player-id="main-player"
            :episodes="movie.episodes"
            :current-episode="selectedEpisode"
            :is-tv-series="movie.type === 'TV_SERIES'"
            @episode-change="handleEpisodeChangeFromPlayer"
          />
          <template #fallback>
            <div class="video-player--loading">Loading player...</div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <div class="movie-detail__content container" :class="{ 'is-playing': !!streamUrl }">
      <!-- Movie Info Row -->
      <div class="movie-detail__info-row">
        <div class="movie-detail__poster-wrap">
          <img v-if="movie.posterUrl" :src="movie.posterUrl" :alt="movie.title" class="movie-detail__poster" />
        </div>

        <div class="movie-detail__meta">
          <h1 class="movie-detail__title" id="movie-title">{{ movie.titleVi || movie.title }}</h1>
          <p v-if="movie.titleVi && movie.title !== movie.titleVi" class="movie-detail__original-title">
            {{ movie.title }}
          </p>

          <div class="movie-detail__badges">
            <span v-if="movie.imdbRating" class="badge badge-accent"> IMDb {{ movie.imdbRating.toFixed(1) }} </span>
            <span v-if="movie.releaseYear" class="badge badge-dark">{{ movie.releaseYear }}</span>
            <span v-if="movie.runtime" class="badge badge-dark">{{ formatRuntime(movie.runtime) }}</span>
          </div>

          <p class="movie-detail__overview">{{ movie.overview || movie.overviewVi }}</p>

          <!-- Quality Selector -->
          <div class="movie-detail__quality-select" v-if="availableQualities.length">
            <label class="movie-detail__label">Quality:</label>
            <div class="movie-detail__quality-buttons">
              <button
                v-for="q in availableQualities"
                :key="q.value"
                class="btn btn-sm"
                :class="selectedQuality === q.value ? 'btn-primary' : 'btn-outline'"
                @click="selectQuality(q.value)"
              >
                {{ q.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Episode Selector (TV Series Only) -->
      <div v-if="movie.type === 'TV_SERIES'" class="movie-detail__episodes-outer">
        <div class="movie-detail__seasons-tabs" v-if="availableSeasons.length > 1">
          <button
            v-for="season in availableSeasons"
            :key="season"
            class="btn btn-sm"
            :class="selectedSeason === season ? 'btn-primary' : 'btn-outline'"
            @click="selectedSeason = season"
          >
            Season {{ season }}
          </button>
        </div>

        <div v-for="season in availableSeasons" :key="season" class="movie-detail__season-group">
          <h3 class="movie-detail__season-heading">Season {{ season }}</h3>
          <div class="movie-detail__episodes-grid">
            <button
              v-for="ep in (movie?.episodes ?? []).filter((e: any) => e.season === season)"
              :key="ep.id"
              class="movie-detail__episode-card"
              :class="{ 'is-active': selectedEpisode?.id === ep.id }"
              @click="
                selectedSeason = season;
                selectEpisode(ep);
              "
            >
              <div class="movie-detail__ep-number">{{ ep.episode }}</div>
              <div class="movie-detail__ep-info">
                <div class="movie-detail__ep-title">{{ ep.title || `Episode ${ep.episode}` }}</div>
                <div class="movie-detail__ep-runtime text-muted" v-if="ep.runtime">{{ formatRuntime(ep.runtime) }}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Movie, Episode, VideoSource } from '~/types/movie';
import { QUALITY_MAP } from '~/types/movie';

const route = useRoute();
const config = useRuntimeConfig();

const movie = ref<Movie | null>(null);
const streamUrl = ref('');
const selectedQuality = ref('FHD_1080');
const subtitleTracks = ref<any[]>([]);

const selectedSeason = ref<number>(1);
const selectedEpisode = ref<Episode | null>(null);

const activeVideoSources = computed<VideoSource[]>(() => {
  if (movie.value?.type === 'TV_SERIES') {
    return selectedEpisode.value?.videoSources || [];
  }
  return movie.value?.videoSources || [];
});

const activeSubtitles = computed(() => {
  if (movie.value?.type === 'TV_SERIES') {
    return selectedEpisode.value?.subtitles || [];
  }
  return movie.value?.subtitles || [];
});

const availableSeasons = computed(() => {
  if (!movie.value?.episodes) return [];
  const seasons = new Set<number>();
  movie.value.episodes.forEach((e) => seasons.add(e.season));
  return Array.from(seasons).sort((a, b) => a - b);
});

const availableQualities = computed(() => {
  if (!activeVideoSources.value?.length) return [];
  return activeVideoSources.value.map((vs) => ({
    value: vs.quality,
    label: QUALITY_MAP[vs.quality] || vs.quality,
  }));
});

function selectQuality(q: string) {
  selectedQuality.value = q;
  if (streamUrl.value) {
    playVideo();
  }
}

function selectEpisode(ep: any) {
  selectedEpisode.value = ep;
  if (
    !activeVideoSources.value.some((vs: any) => vs.quality === selectedQuality.value) &&
    activeVideoSources.value.length
  ) {
    selectedQuality.value = activeVideoSources.value[0]!.quality;
  }
  streamUrl.value = '';
}

function handleEpisodeChangeFromPlayer(ep: any) {
  selectedEpisode.value = ep;
  selectedSeason.value = ep.season;
  
  if (
    !activeVideoSources.value.some((vs: any) => vs.quality === selectedQuality.value) &&
    activeVideoSources.value.length
  ) {
    selectedQuality.value = activeVideoSources.value[0]!.quality;
  }
  
  const source = activeVideoSources.value.find((vs: any) => vs.quality === selectedQuality.value) || activeVideoSources.value[0];
  if (source) {
    const streamingUrl = config.public.streamingUrl || '';
    streamUrl.value = `${streamingUrl}/api/stream/gdrive/${source.driveFileId}`;
  } else {
    streamUrl.value = '';
  }
}

function playVideo() {
  const source =
    activeVideoSources.value.find((vs: any) => vs.quality === selectedQuality.value) || activeVideoSources.value[0];

  if (!source) {
    alert(
      movie.value?.type === 'TV_SERIES'
        ? 'No video source available for this episode.'
        : 'No video source available for this movie.',
    );
    return;
  }

  // Build the stream URL through our Google Drive proxy
  const streamingUrl = config.public.streamingUrl || '';
  streamUrl.value = `${streamingUrl}/api/stream/gdrive/${source.driveFileId}`;

  // Load subtitles
  if (activeSubtitles.value.length) {
    subtitleTracks.value = activeSubtitles.value.map((s: any) => {
      let url = s.fileUrl;
      // Ensure episode subtitles hit the endpoint with the episode parameter
      if (movie.value?.type === 'TV_SERIES' && selectedEpisode.value?.id) {
        url += (url.includes('?') ? '&' : '?') + 'episodeId=' + selectedEpisode.value.id;
      }
      return {
        url,
        label: s.label,
        language: s.language,
        default: s.language === 'vi',
      };
    });
  }

  nextTick(() => {
    document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Fetch movie data
onMounted(async () => {
  try {
    const slug = route.params.slug as string;
    const data = await $fetch<any>(`/api/movies/${slug}`);
    movie.value = data;

    if (data.type === 'TV_SERIES' && data.episodes?.length) {
      selectedEpisode.value = data.episodes[0];
      selectedSeason.value = data.episodes[0].season;
    }

    if (activeVideoSources.value.length) {
      selectedQuality.value = activeVideoSources.value[0]!.quality;
    }
  } catch (err) {
    console.error('Failed to load movie:', err);
  }
});
</script>

<style scoped>
.movie-detail__hero {
  position: relative;
  height: 60vh;
  min-height: 450px;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.movie-detail__backdrop {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  opacity: 0.6;
  transition: opacity 0.3s;
}
.movie-detail__hero:hover .movie-detail__backdrop {
  opacity: 0.4;
}
.movie-detail__hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--color-bg-primary) 0%, transparent 100%);
  pointer-events: none;
}
.movie-detail__play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.btn-play-hero {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-accent);
  color: #000;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s,
    background 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(245, 197, 24, 0.4);
}
.btn-play-hero svg {
  width: 32px;
  height: 32px;
  margin-left: 4px;
}
.movie-detail__hero:hover .btn-play-hero {
  transform: scale(1.1);
  background: #ffdb4d;
  box-shadow: 0 6px 20px rgba(245, 197, 24, 0.6);
}
.movie-detail__player-fullscreen {
  width: 100%;
  height: 100%;
  z-index: 10;
  background: #000;
}
.movie-detail__player-fullscreen :deep(.video-player) {
  height: 100%;
  border-radius: 0;
}
.movie-detail__content {
  position: relative;
  margin-top: -120px;
  z-index: 1;
  padding-bottom: var(--space-16);
  transition: margin-top 0.4s ease;
}
.movie-detail__content.is-playing {
  margin-top: var(--space-8);
}
.movie-detail__info-row {
  display: flex;
  gap: var(--space-8);
  align-items: flex-start;
}
.movie-detail__poster-wrap {
  flex-shrink: 0;
  width: 240px;
}
.movie-detail__poster {
  width: 100%;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  border: 2px solid var(--color-border-hover);
}
.movie-detail__meta {
  flex: 1;
  padding-top: var(--space-4);
}
.movie-detail__title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-2);
}
.movie-detail__original-title {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin-bottom: var(--space-4);
}
.movie-detail__badges {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
}
.movie-detail__overview {
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
  max-width: 600px;
}
.movie-detail__label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
  display: block;
}
.movie-detail__quality-select {
  margin-bottom: var(--space-6);
}
.movie-detail__quality-buttons {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
.movie-detail__episodes-outer {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}
.movie-detail__season-group {
  margin-bottom: var(--space-8);
}
.movie-detail__season-heading {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: var(--space-4);
  border-left: 3px solid var(--color-accent);
  padding-left: var(--space-3);
}
.movie-detail__seasons-tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  overflow-x: auto;
  padding-bottom: 4px;
}
.movie-detail__episodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-2);
}
.movie-detail__episode-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}
.movie-detail__episode-card:hover {
  background: var(--color-bg-card);
  border-color: var(--color-accent);
}
.movie-detail__episode-card.is-active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #000;
}
.movie-detail__episode-card.is-active .text-muted {
  color: rgba(0, 0, 0, 0.7) !important;
}
.movie-detail__ep-number {
  font-size: var(--text-lg);
  font-weight: 700;
  opacity: 0.8;
  min-width: 28px;
}
.movie-detail__ep-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.movie-detail__ep-title {
  font-size: var(--text-sm);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.movie-detail__ep-runtime {
  font-size: var(--text-xs);
  margin-top: 2px;
}

@media (max-width: 768px) {
  .movie-detail__info-row {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .movie-detail__poster-wrap {
    width: 180px;
  }
  .movie-detail__overview {
    max-width: 100%;
  }
  .movie-detail__quality-buttons {
    justify-content: center;
  }
  .movie-detail__badges {
    justify-content: center;
  }
}
</style>
