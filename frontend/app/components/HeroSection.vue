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
          {{ movie?.titleVi || movie?.title || 'Featured Movie' }}
        </h1>

        <p class="hero__overview" id="hero-overview">
          {{ truncateText(movie?.overviewVi || movie?.overview || '', 180) }}
        </p>

        <div class="hero__actions">
          <NuxtLink
            v-if="movie?.slug"
            :to="`/movie/${movie.slug}`"
            class="hero__btn hero__btn--primary"
            id="btn-watch-now"
          >
            Watch Now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21" />
            </svg>
          </NuxtLink>

          <NuxtLink
            v-if="movie?.slug"
            :to="`/movie/${movie.slug}`"
            class="hero__btn hero__btn--secondary"
            id="btn-details"
          >
            Details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
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

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  min-height: 80vh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  border-radius: 0 0 24px 24px;
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
    rgba(11, 14, 20, 0.75) 30%,
    rgba(11, 14, 20, 0.3) 55%,
    rgba(11, 14, 20, 0.15) 75%,
    rgba(11, 14, 20, 0.25) 100%
  );
}

.hero__vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(11, 14, 20, 0.7) 0%,
    transparent 55%
  );
}

.hero__content {
  position: relative;
  z-index: 1;
  padding-bottom: var(--space-16);
  width: 100%;
}

.hero__info {
  max-width: 520px;
}

.hero__title {
  font-size: var(--text-hero);
  font-weight: 800;
  line-height: 1.05;
  margin-bottom: var(--space-4);
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.5);
}

.hero__overview {
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-8);
  max-width: 420px;
}

.hero__actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.hero__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.hero__btn--primary {
  background: rgba(255, 255, 255, 0.95);
  color: #111;
}

.hero__btn--primary:hover {
  background: #fff;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
}

.hero__btn--secondary {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.hero__btn--secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .hero { min-height: 55vh; }
  .hero__info { max-width: 100%; }
  .hero__vignette {
    background: linear-gradient(to right, rgba(11, 14, 20, 0.6) 0%, transparent 80%);
  }
}
</style>
