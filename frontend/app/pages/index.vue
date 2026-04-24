<template>
  <div class="home-page">
    <HeroSection
      v-if="featuredMovie"
      :movie="featuredMovie"
      :genres="featuredGenres"
    />

    <MovieCarousel
      v-if="newMovies.length"
      title="New Movies"
      section-id="new-movies"
      :movies="newMovies"
    />

    <MovieCarousel
      v-if="popularMovies.length"
      title="Popular"
      section-id="popular"
      :movies="popularMovies"
    />

    <MovieCarousel
      v-if="tvSeries.length"
      title="TV Series"
      section-id="tv-series"
      :movies="tvSeries"
    />

    <!-- Empty state when no movies exist -->
    <div v-if="!loading && !newMovies.length && !popularMovies.length && !tvSeries.length" class="home-page__empty container">
      <div class="home-page__empty-card">
        <span class="home-page__empty-icon">🎬</span>
        <h2>Welcome to MovieLix</h2>
        <p>No movies added yet. Go to the Admin panel to add your first movie!</p>
        <NuxtLink to="/admin" class="btn btn-primary btn-lg">Go to Admin</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'MovieLix — Watch Movies in 1080p & 2K',
});

const loading = ref(true);
const allMovies = ref<any[]>([]);

const featuredMovie = computed(() => {
  return allMovies.value.find((m) => m.featured) || allMovies.value[0] || null;
});

const featuredGenres = computed(() => {
  return featuredMovie.value?.genres?.map((g: any) => g.name) || [];
});

const newMovies = computed(() => {
  return allMovies.value.filter((m) => m.type === 'MOVIE');
});

const popularMovies = computed(() => {
  // Sort by IMDb rating descending for "Popular"
  return [...allMovies.value]
    .filter((m) => m.imdbRating)
    .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0))
    .slice(0, 20);
});

const tvSeries = computed(() => {
  return allMovies.value.filter((m) => m.type === 'TV_SERIES');
});

onMounted(async () => {
  try {
    const data = await $fetch<any>('/api/movies?limit=50');
    allMovies.value = data.movies || [];
  } catch (err) {
    console.error('Failed to load movies:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.home-page {
  padding-bottom: var(--space-16);
}

.home-page__empty {
  display: flex;
  justify-content: center;
  padding: var(--space-16) 0;
}

.home-page__empty-card {
  text-align: center;
  padding: var(--space-12);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  max-width: 460px;
}

.home-page__empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: var(--space-4);
}

.home-page__empty-card h2 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-2);
}

.home-page__empty-card p {
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
}
</style>
