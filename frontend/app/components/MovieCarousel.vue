<template>
  <section class="carousel-section" :id="`carousel-${sectionId}`">
    <div class="carousel-section__header container">
      <h2 class="carousel-section__title">{{ title }}</h2>
      <div class="carousel-section__nav">
        <button
          class="carousel-section__arrow"
          :disabled="!canScrollLeft"
          @click="scrollBy(-1)"
          :aria-label="`Scroll ${title} left`"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          class="carousel-section__arrow"
          :disabled="!canScrollRight"
          @click="scrollBy(1)"
          :aria-label="`Scroll ${title} right`"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>

    <div
      ref="scrollContainer"
      class="carousel-section__track"
      @scroll="updateScrollState"
    >
      <div class="carousel-section__spacer"></div>
      <MovieCard
        v-for="movie in movies"
        :key="movie.slug"
        :movie="movie"
      />
      <div class="carousel-section__spacer"></div>
    </div>
  </section>
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
  title: string;
  movies: Movie[];
  sectionId?: string;
}>();

const scrollContainer = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(true);

function updateScrollState() {
  const el = scrollContainer.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 10;
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 10;
}

function scrollBy(direction: number) {
  const el = scrollContainer.value;
  if (!el) return;
  const scrollAmount = el.clientWidth * 0.75;
  el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

onMounted(() => {
  nextTick(() => updateScrollState());
});
</script>

<style scoped>
.carousel-section {
  padding: var(--space-8) 0 var(--space-4);
  /* Skip rendering offscreen carousels — huge mobile perf win */
  content-visibility: auto;
  contain-intrinsic-size: auto 340px;
}

.carousel-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.carousel-section__title {
  font-size: var(--text-xl);
  font-weight: 700;
}

.carousel-section__nav {
  display: flex;
  gap: var(--space-2);
}

.carousel-section__arrow {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.carousel-section__arrow:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--color-border-hover);
}

.carousel-section__arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-section__track {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-top: var(--space-4);
  padding-bottom: var(--space-4);
}

.carousel-section__track::-webkit-scrollbar {
  display: none;
}

.carousel-section__spacer {
  flex-shrink: 0;
  width: max(calc((100vw - var(--container-max)) / 2 + var(--container-padding)), var(--container-padding));
}
</style>
