<template>
  <NuxtLink :to="`/movie/${movie.slug}`" class="movie-card" :id="`movie-card-${movie.slug}`">
    <div class="movie-card__poster">
      <img
        v-if="movie.posterUrl && !imageError"
        :src="movie.posterUrl"
        :alt="movie.title"
        loading="lazy"
        class="movie-card__img"
        @error="imageError = true"
      />
      <div v-else class="movie-card__placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <rect x="2" y="2" width="20" height="20" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>

      <div class="movie-card__overlay">
        <div class="movie-card__play-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <polygon points="5 3 19 12 5 21" />
          </svg>
        </div>
      </div>

      <span v-if="movie.imdbRating" class="movie-card__rating">
        ⭐ {{ movie.imdbRating.toFixed(1) }}
      </span>

      <span v-if="qualityLabel" class="movie-card__quality badge badge-quality">
        {{ qualityLabel }}
      </span>
    </div>

    <div class="movie-card__info">
      <h3 class="movie-card__title">{{ movie.titleVi || movie.title }}</h3>
      <p class="movie-card__meta">
        <span v-if="movie.releaseYear">{{ movie.releaseYear }}</span>
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Movie {
  slug: string;
  title: string;
  titleVi?: string;
  posterUrl?: string;
  imdbRating?: number;
  releaseYear?: number;
  quality?: string;
}

const props = defineProps<{
  movie: Movie;
}>();

const imageError = ref(false);

const qualityLabel = computed(() => {
  if (!props.movie.quality) return null;
  const map: Record<string, string> = {
    'HD_720': '720p',
    'FHD_1080': '1080p',
    'QHD_2K': '2K',
  };
  return map[props.movie.quality] || props.movie.quality;
});
</script>

<style scoped>
.movie-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: var(--color-text-primary);
  flex-shrink: 0;
  width: 180px;
  transition: transform var(--transition-base);
}

.movie-card:hover {
  transform: scale(1.05);
}

.movie-card__poster {
  position: relative;
  aspect-ratio: 2/3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg-tertiary);
  border: 2px solid transparent;
  transition: border-color var(--transition-base);
}

.movie-card:hover .movie-card__poster {
  border-color: var(--color-accent);
}

.movie-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
}

.movie-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.movie-card:hover .movie-card__overlay {
  opacity: 1;
}

.movie-card__play-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: rgba(245, 197, 24, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.8);
  transition: transform var(--transition-base);
}

.movie-card:hover .movie-card__play-icon {
  transform: scale(1);
}

.movie-card__rating {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  background: rgba(0, 0, 0, 0.85);
  color: var(--color-text-primary);
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.movie-card__quality {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}

.movie-card__info {
  padding: var(--space-3) var(--space-1) 0;
}

.movie-card__title {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-card__meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

@media (max-width: 768px) {
  .movie-card { width: 140px; }
}

@media (max-width: 480px) {
  .movie-card { width: 120px; }
}
</style>
