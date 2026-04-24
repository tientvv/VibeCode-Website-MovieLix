<template>
  <div class="movies-page">
    <div class="movies-page__header container">
      <div class="movies-page__title-group">
        <h1 class="movies-page__title">Browse Movies</h1>
        <span v-if="data?.pagination" class="movies-page__count">{{ data.pagination.total }} titles</span>
      </div>
      
      <div class="movies-page__filters">
        <select v-model="sortParam" class="select select--sort">
          <option value="createdAt">Latest Added</option>
          <option value="releaseYear">Release Year</option>
          <option value="imdbRating">Highest Rating</option>
        </select>
      </div>
    </div>

    <div class="container">
      <div v-if="pending" class="movies-page__loading">
        <div class="skeleton-grid">
          <div v-for="i in 12" :key="i" class="skeleton skeleton-card"></div>
        </div>
      </div>
      
      <div v-else-if="movies.length === 0" class="movies-page__empty">
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p>No movies found.</p>
        </div>
      </div>

      <template v-else>
        <div class="movies-grid">
          <MovieCard 
            v-for="movie in movies" 
            :key="movie.slug" 
            :movie="movie" 
          />
        </div>

        <Pagination 
          class="movies-page__pagination"
          :current-page="pageParam" 
          :total-pages="data?.pagination?.totalPages || 1"
          @change="onPageChange"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

useHead({
  title: 'Browse Movies - MovieLix'
});

const pageParam = ref(parseInt(route.query.page as string) || 1);
const sortParam = ref((route.query.sort as string) || 'createdAt');

// We use useFetch which automatically provides reactivity
const { data, pending } = await useFetch('/api/movies', {
  query: {
    page: pageParam,
    sort: sortParam,
    limit: 18 // Number of movies per page
  },
  watch: [pageParam, sortParam] // Re-fetch automatically when these refs change
});

const movies = computed(() => data.value?.movies || []);

function onPageChange(newPage: number) {
  pageParam.value = newPage;
  router.push({ query: { ...route.query, page: newPage } });
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

watch(sortParam, (newVal) => {
  pageParam.value = 1;
  router.push({ query: { ...route.query, sort: newVal, page: 1 } });
});
</script>

<style scoped>
.movies-page {
  padding-top: calc(var(--navbar-height) + var(--space-8));
  padding-bottom: var(--space-16);
  min-height: 100vh;
}

.movies-page__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
  gap: var(--space-4);
}

.movies-page__title-group {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.movies-page__title {
  margin: 0;
  font-size: var(--text-3xl);
}

.movies-page__count {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: 500;
}

.movies-page__filters {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.select--sort {
  min-width: 160px;
  background-color: var(--color-bg-elevated);
}

.movies-grid,
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.skeleton-card {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: var(--radius-lg);
}

.movies-page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-4);
  }
}
</style>
