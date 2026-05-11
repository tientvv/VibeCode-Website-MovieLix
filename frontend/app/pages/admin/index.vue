<template>
  <div class="admin-dashboard container" id="admin-dashboard">
    <div class="admin-dashboard__header">
      <h1>Admin Dashboard</h1>
      <div class="admin-dashboard__actions">
        <NuxtLink to="/admin/movies/new" class="btn btn-primary" id="btn-add-movie">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Movie
        </NuxtLink>
        <button class="btn btn-ghost" @click="logout" id="btn-logout">Logout</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="admin-dashboard__stats">
      <div class="admin-stat card">
        <p class="admin-stat__number">{{ movies.length }}</p>
        <p class="admin-stat__label">Total Movies</p>
      </div>
      <div class="admin-stat card">
        <p class="admin-stat__number">{{ publishedCount }}</p>
        <p class="admin-stat__label">Published</p>
      </div>
      <div class="admin-stat card">
        <p class="admin-stat__number">{{ draftCount }}</p>
        <p class="admin-stat__label">Drafts</p>
      </div>
    </div>

    <!-- Movie List -->
    <div class="admin-dashboard__list">
      <h2>All Movies</h2>
      <div class="admin-table-wrap">
        <table class="admin-table" id="admin-movies-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Year</th>
              <th>Rating</th>
              <th>Sources</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movie in movies" :key="movie.id">
              <td>
                <div class="admin-table__movie-cell">
                  <img v-if="movie.posterUrl" :src="movie.posterUrl" :alt="movie.title" class="admin-table__poster" />
                  <div>
                    <strong>{{ movie.titleVi || movie.title }}</strong>
                    <small v-if="movie.titleVi" class="text-muted">{{ movie.title }}</small>
                  </div>
                </div>
              </td>
              <td>{{ movie.releaseYear || '—' }}</td>
              <td>
                <span v-if="movie.imdbRating" class="text-accent">{{ movie.imdbRating.toFixed(1) }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td>{{ movie.videoSources?.length || 0 }}</td>
              <td>
                <span class="badge" :class="movie.status === 'PUBLISHED' ? 'badge-accent' : 'badge-dark'">
                  {{ movie.status }}
                </span>
              </td>
              <td>
                <div class="admin-table__actions">
                  <NuxtLink :to="`/admin/movies/${movie.id}`" class="btn btn-sm btn-outline"> Edit </NuxtLink>
                  <button class="btn btn-sm btn-ghost admin-table__delete" @click="deleteMovie(movie)">🗑</button>
                </div>
              </td>
            </tr>
            <tr v-if="!movies.length">
              <td colspan="6" class="text-muted" style="text-align: center; padding: var(--space-8)">
                No movies yet. Add your first movie!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Movie } from '~/types/movie';

definePageMeta({ layout: false });
useHead({ title: 'Admin Dashboard — MovieLix' });

const { authHeaders, requireAuth, logout } = useAdminAuth();
const movies = ref<Movie[]>([]);

const publishedCount = computed(() => movies.value.filter((m) => m.status === 'PUBLISHED').length);
const draftCount = computed(() => movies.value.filter((m) => m.status === 'DRAFT').length);

onMounted(async () => {
  if (!requireAuth()) return;

  try {
    const data = await $fetch<Movie[]>('/api/admin/movies', {
      headers: authHeaders(),
    });
    movies.value = data;
  } catch {
    navigateTo('/admin/login');
  }
});

async function deleteMovie(movie: Movie) {
  if (!confirm(`Delete "${movie.titleVi || movie.title}"? This cannot be undone.`)) return;

  try {
    await $fetch('/api/admin/movies', {
      method: 'DELETE',
      headers: authHeaders(),
      body: { id: movie.id },
    });
    movies.value = movies.value.filter((m) => m.id !== movie.id);
  } catch (err: any) {
    alert('Failed to delete: ' + (err.message || 'Unknown error'));
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  padding-top: var(--space-10);
  padding-bottom: var(--space-16);
  background: var(--color-bg-primary);
}

.admin-dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
  gap: var(--space-4);
}

.admin-dashboard__header h1 {
  font-size: var(--text-3xl);
}

.admin-dashboard__actions {
  display: flex;
  gap: var(--space-3);
}

.admin-dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-10);
}

.admin-stat {
  padding: var(--space-6);
  text-align: center;
}

.admin-stat__number {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-accent);
}

.admin-stat__label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.admin-dashboard__list h2 {
  font-size: var(--text-xl);
  margin-bottom: var(--space-4);
}

.admin-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-sm);
}

.admin-table th {
  background: var(--color-bg-tertiary);
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.admin-table tr:last-child td {
  border-bottom: none;
}

.admin-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.admin-table__movie-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.admin-table__movie-cell div {
  display: flex;
  flex-direction: column;
}

.admin-table__movie-cell small {
  font-size: var(--text-xs);
}

.admin-table__poster {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.admin-table__actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.admin-table__delete {
  color: var(--color-error);
  opacity: 0.6;
  transition: opacity 0.15s;
}

.admin-table__delete:hover {
  opacity: 1;
}
</style>
