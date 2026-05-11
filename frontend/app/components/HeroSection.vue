<template>
  <section class="hero" id="hero-section">
    <div class="hero__backdrop">
      <img
        v-if="movie?.backdropUrl"
        :src="movie.backdropUrl"
        :alt="movie.title"
        class="hero__backdrop-img"
        loading="eager"
      />
      <div class="hero__gradient"></div>
      <div class="hero__vignette"></div>
    </div>

    <div class="hero__content container">
      <div class="hero__info">
        <h1 class="hero__title" id="hero-title">
          {{ movie?.title || 'Featured Movie' }}
        </h1>

        <div class="hero__meta">
          <span v-if="movie?.imdbRating" class="hero__rating">
            <span class="badge badge-accent">IMDb</span>
            <span class="hero__rating-value">{{ movie.imdbRating.toFixed(1) }}</span>
            <span class="hero__rating-count" v-if="movie.imdbId">({{ movie.imdbId }})</span>
          </span>
          <span v-if="movie?.releaseYear" class="hero__meta-item">• {{ movie.releaseYear }}</span>
          <span v-if="movie?.runtime" class="hero__meta-item">• {{ formatRuntime(movie.runtime) }}</span>
          <span v-if="genres?.length" class="hero__meta-item">| {{ genres.join(', ') }}</span>
        </div>

        <p class="hero__overview" id="hero-overview">
          {{ truncateText(movie?.overview || movie?.overviewVi || '', 200) }}
          <button
            v-if="(movie?.overview || '').length > 200"
            class="hero__see-more"
            @click="$emit('showDetail')"
          >
            See more
          </button>
        </p>

        <div class="hero__actions">
          <button
            v-if="movie?.trailerUrl"
            class="btn btn-outline btn-lg"
            id="btn-watch-trailer"
            @click="$emit('watchTrailer')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <polygon points="10 8 16 12 10 16" fill="currentColor" />
            </svg>
            Watch trailer
          </button>

          <NuxtLink
            v-if="movie?.slug"
            :to="`/movie/${movie.slug}`"
            class="btn btn-primary btn-lg"
            id="btn-watch-now"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21" />
            </svg>
            Watch now
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Movie {
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
}

defineProps<{
  movie?: Movie;
  genres?: string[];
}>();

defineEmits<{
  watchTrailer: [];
  showDetail: [];
}>();

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} hour ${m} minutes` : `${m} minutes`;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  min-height: 85vh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.hero__backdrop {
  position: absolute;
  inset: 0;
}

.hero__backdrop-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.hero__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    var(--color-bg-primary) 0%,
    rgba(5, 5, 5, 0.85) 25%,
    rgba(5, 5, 5, 0.4) 50%,
    rgba(5, 5, 5, 0.2) 75%,
    rgba(5, 5, 5, 0.3) 100%
  );
}

.hero__vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(5, 5, 5, 0.8) 0%,
    transparent 60%
  );
}

.hero__content {
  position: relative;
  z-index: 1;
  padding-bottom: var(--space-16);
  width: 100%;
}

.hero__info {
  max-width: 600px;
}

.hero__title {
  font-size: var(--text-hero);
  font-weight: 800;
  line-height: 1.05;
  margin-bottom: var(--space-4);
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.5);
}

.hero__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.hero__rating {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.hero__rating-value {
  font-weight: 700;
  color: var(--color-text-primary);
}

.hero__rating-count {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.hero__overview {
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-8);
  max-width: 480px;
}

.hero__see-more {
  background: none;
  border: none;
  color: var(--color-accent);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.hero__actions {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .hero { min-height: 60vh; }
  .hero__info { max-width: 100%; }
  .hero__vignette {
    background: linear-gradient(to right, rgba(5,5,5,0.6) 0%, transparent 80%);
  }
  .hero__backdrop-img {
    /* Prevent oversize image rendering on mobile */
    image-rendering: auto;
  }
}
</style>
