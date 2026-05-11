<template>
  <div class="admin-edit container" id="admin-movie-editor">
    <div class="admin-edit__header">
      <NuxtLink to="/admin" class="btn btn-ghost btn-sm">← Back</NuxtLink>
      <h1>{{ isNew ? 'Add Movie' : 'Edit Movie' }}</h1>
    </div>

    <form @submit.prevent="saveMovie" class="admin-edit__form">
      <!-- Basic Info -->
      <div class="admin-edit__section card">
        <h3>📋 Basic Info</h3>
        <div class="admin-edit__row">
          <div class="admin-edit__field">
            <label for="movie-title">Title (English) *</label>
            <input v-model="form.title" type="text" id="movie-title" class="input" required />
          </div>
          <div class="admin-edit__field">
            <label for="movie-title-vi">Title (Vietnamese)</label>
            <input v-model="form.titleVi" type="text" id="movie-title-vi" class="input" />
          </div>
        </div>
        <div class="admin-edit__field">
          <label for="movie-overview">Overview (English)</label>
          <textarea v-model="form.overview" id="movie-overview" class="input" rows="4"></textarea>
        </div>
        <div class="admin-edit__field">
          <label for="movie-overview-vi">Overview (Vietnamese)</label>
          <textarea v-model="form.overviewVi" id="movie-overview-vi" class="input" rows="4"></textarea>
        </div>
        <div class="admin-edit__row">
          <div class="admin-edit__field">
            <label for="movie-year">Year</label>
            <input v-model="form.releaseYear" type="number" id="movie-year" class="input" />
          </div>
          <div class="admin-edit__field">
            <label for="movie-runtime">Runtime (min)</label>
            <input v-model="form.runtime" type="number" id="movie-runtime" class="input" />
          </div>
          <div class="admin-edit__field">
            <label for="movie-rating">IMDb Rating</label>
            <input
              v-model="form.imdbRating"
              type="number"
              step="0.1"
              id="movie-rating"
              class="input"
              placeholder="e.g. 8.2"
            />
          </div>
        </div>
        <div class="admin-edit__row">
          <div class="admin-edit__field">
            <label for="movie-imdb">IMDb URL / ID</label>
            <input
              v-model="form.imdbId"
              type="text"
              id="movie-imdb"
              class="input"
              placeholder="https://www.imdb.com/title/tt0111161/ or tt0111161"
            />
          </div>
          <div class="admin-edit__field">
            <label for="movie-trailer">Trailer URL (YouTube)</label>
            <input
              v-model="form.trailerUrl"
              type="url"
              id="movie-trailer"
              class="input"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>
        <div class="admin-edit__row">
          <div class="admin-edit__field">
            <label for="movie-type">Type</label>
            <select v-model="form.type" id="movie-type" class="select" :disabled="!isNew">
              <option value="MOVIE">Movie</option>
              <option value="TV_SERIES">TV Series</option>
            </select>
          </div>
          <div class="admin-edit__field">
            <label for="movie-status">Status</label>
            <select v-model="form.status" id="movie-status" class="select">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="HIDDEN">Hidden</option>
            </select>
          </div>
        </div>
        <div class="admin-edit__row">
          <div class="admin-edit__field">
            <label for="movie-poster">Poster URL</label>
            <input v-model="form.posterUrl" type="url" id="movie-poster" class="input" placeholder="https://..." />
          </div>
          <div class="admin-edit__field">
            <label for="movie-backdrop">Backdrop URL</label>
            <input v-model="form.backdropUrl" type="url" id="movie-backdrop" class="input" placeholder="https://..." />
          </div>
        </div>
        <div class="admin-edit__field">
          <label> <input type="checkbox" v-model="form.featured" /> Featured on homepage </label>
        </div>
      </div>

      <!-- Video Sources (Movie Only) -->
      <div v-if="form.type === 'MOVIE'" class="admin-edit__section card">
        <h3>🎬 Video Sources (Google Drive)</h3>
        <div v-for="(vs, idx) in videoSources" :key="idx" class="admin-edit__torrent-row">
          <select v-model="vs.quality" class="select" style="max-width: 120px">
            <option value="HD_720">720p</option>
            <option value="FHD_1080">1080p</option>
            <option value="QHD_2K">2K</option>
          </select>
          <input
            v-model="vs.driveUrl"
            class="input"
            placeholder="https://drive.google.com/file/d/.../view"
            style="flex: 1"
          />
          <input v-model="vs.label" class="input" placeholder="Label (optional)" style="max-width: 150px" />
          <button type="button" class="btn btn-ghost btn-sm" @click="removeVideoSource(idx)">✕</button>
        </div>
        <button type="button" class="btn btn-outline btn-sm" @click="addVideoSource" id="btn-add-video-source">
          + Add Video Source
        </button>
      </div>

      <!-- Subtitles (Movie Only) -->
      <div v-if="form.type === 'MOVIE'" class="admin-edit__section card">
        <h3>📝 Subtitles</h3>
        <div v-for="(sub, idx) in subtitles" :key="idx" class="admin-edit__torrent-row" style="flex-wrap: wrap">
          <select v-model="sub.language" class="select" style="max-width: 120px">
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
          <!-- Show saved status -->
          <div
            v-if="(sub as any)._saved && sub.srtContent?.startsWith('/api/')"
            style="flex: 1; display: flex; align-items: center; gap: 8px"
          >
            <span
              style="
                background: #22c55e;
                color: #000;
                padding: 2px 10px;
                border-radius: 6px;
                font-size: 0.8em;
                font-weight: 600;
              "
              >✅ Đã lưu</span
            >
            <code style="font-size: 0.8em; color: var(--color-text-muted); word-break: break-all">{{
              sub.srtContent
            }}</code>
          </div>
          <textarea
            v-if="!(sub as any)._saved || !sub.srtContent?.startsWith('/api/')"
            v-model="sub.srtContent"
            class="input"
            rows="2"
            placeholder="Dán Google Drive URL hoặc nội dung .srt/.ass vào đây..."
            style="flex: 1"
          ></textarea>
          <button type="button" class="btn btn-ghost btn-sm" @click="removeSubtitle(idx)">✕</button>
        </div>
        <button type="button" class="btn btn-outline btn-sm" @click="addSubtitle" id="btn-add-subtitle">
          + Add Subtitle
        </button>
      </div>

      <!-- TV Series Episodes (TV Series Only) -->
      <div v-if="form.type === 'TV_SERIES'" class="admin-edit__section card">
        <h3>📺 TV Series Episodes</h3>
        <p class="text-sm text-muted mb-4" v-if="isNew">Please save the TV Series first before adding episodes.</p>

        <div v-else>
          <!-- Episode Count & Controls -->
          <div class="admin-edit__episode-controls">
            <span class="text-sm text-muted">{{ episodes.length }} episode(s)</span>
            <div style="display: flex; gap: 8px">
              <button type="button" class="btn btn-outline btn-sm" @click="expandAllEpisodes">Expand All</button>
              <button type="button" class="btn btn-outline btn-sm" @click="collapseAllEpisodes">Collapse All</button>
            </div>
          </div>

          <!-- Existing Episodes (Collapsible) -->
          <div v-for="(ep, idx) in episodes" :key="idx" class="admin-edit__episode-block">
            <div
              class="admin-edit__episode-header"
              :class="{ 'admin-edit__episode-header--open': expandedEpisodes.has(ep.id) }"
              @click="toggleEpisode(ep.id)"
            >
              <div class="admin-edit__episode-header-left">
                <span class="admin-edit__episode-chevron" :class="{ 'admin-edit__episode-chevron--open': expandedEpisodes.has(ep.id) }">▶</span>
                <span style="font-weight: bold; min-width: 70px">S{{ ep.season }} E{{ ep.episode }}</span>
                <span style="opacity: 0.7">{{ ep.title || 'No Title' }}</span>
                <span class="admin-edit__episode-badges">
                  <span v-if="ep.videoSources?.length" class="admin-edit__badge admin-edit__badge--video">🎬 {{ ep.videoSources.length }}</span>
                  <span v-if="ep.subtitles?.length" class="admin-edit__badge admin-edit__badge--sub">📝 {{ ep.subtitles.length }}</span>
                </span>
              </div>
              <button type="button" class="btn btn-ghost btn-sm text-error" @click.stop="removeExistingEpisode(ep.id, idx)">
                Delete
              </button>
            </div>

            <!-- Collapsible Content -->
            <div v-show="expandedEpisodes.has(ep.id)" class="admin-edit__episode-content">
              <div style="padding-left: 20px; border-left: 2px solid var(--color-border); margin: 8px 0 16px 10px">
                <h4 style="margin: 8px 0; font-size: 0.9em; opacity: 0.8">Episode Video Sources</h4>
                <div v-for="(vs, vidx) in ep.videoSources" :key="vidx" class="admin-edit__torrent-row">
                  <select v-model="vs.quality" class="select" style="max-width: 120px">
                    <option value="HD_720">720p</option>
                    <option value="FHD_1080">1080p</option>
                    <option value="QHD_2K">2K</option>
                  </select>
                  <input
                    v-model="vs.driveUrl"
                    class="input"
                    placeholder="https://drive.google.com/file/d/.../view"
                    style="flex: 1"
                  />
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm"
                    @click="removeEpisodeVideoSource(ep, vs, Number(vidx))"
                  >
                    ✕
                  </button>
                </div>
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  @click="addEpisodeVideoSource(ep)"
                  style="margin-top: 8px"
                >
                  + Add Episode Video Source
                </button>
              </div>

              <!-- Episode Subtitles -->
              <div style="padding-left: 20px; border-left: 2px solid var(--color-border); margin: 8px 0 16px 10px">
                <h4 style="margin: 8px 0; font-size: 0.9em; opacity: 0.8">Episode Subtitles</h4>
                <div
                  v-for="(sub, sidx) in ep.subtitles"
                  :key="'sub' + sidx"
                  class="admin-edit__torrent-row"
                  style="flex-wrap: wrap"
                >
                  <select v-model="sub.language" class="select" style="max-width: 120px">
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                  <!-- Show saved status -->
                  <div
                    v-if="sub._saved && sub.srtContent?.startsWith('/api/')"
                    style="flex: 1; display: flex; align-items: center; gap: 8px"
                  >
                    <span
                      style="
                        background: #22c55e;
                        color: #000;
                        padding: 2px 10px;
                        border-radius: 6px;
                        font-size: 0.8em;
                        font-weight: 600;
                      "
                      >✅ Đã lưu</span
                    >
                    <code style="font-size: 0.8em; color: var(--color-text-muted); word-break: break-all">{{
                      sub.srtContent
                    }}</code>
                  </div>
                  <input
                    v-if="!sub._saved || !sub.srtContent?.startsWith('/api/')"
                    v-model="sub.srtContent"
                    class="input"
                    placeholder="Dán Google Drive URL hoặc nội dung .srt/.ass vào đây..."
                    style="flex: 1"
                  />
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm"
                    @click="removeEpisodeSubtitle(ep, sub, Number(sidx))"
                  >
                    ✕
                  </button>
                </div>
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  @click="addEpisodeSubtitle(ep)"
                  style="margin-top: 8px"
                >
                  + Add Episode Subtitle
                </button>
              </div>
            </div>
          </div>

          <!-- Add New Episode Form -->
          <div
            class="admin-edit__new-episode"
            style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed var(--color-border)"
          >
            <h4 style="margin-bottom: 12px">+ Create New Episode</h4>
            <div class="admin-edit__row">
              <div class="admin-edit__field" style="max-width: 100px">
                <label>Season</label>
                <input v-model="newEp.season" type="number" class="input" />
              </div>
              <div class="admin-edit__field" style="max-width: 100px">
                <label>Episode</label>
                <input v-model="newEp.episode" type="number" class="input" />
              </div>
              <div class="admin-edit__field">
                <label>Title</label>
                <input v-model="newEp.title" type="text" class="input" placeholder="Optional" />
              </div>
              <div class="admin-edit__field" style="max-width: 100px">
                <label>Runtime</label>
                <input v-model="newEp.runtime" type="number" class="input" placeholder="min" />
              </div>
              <div class="admin-edit__field" style="max-width: 120px">
                <label>&nbsp;</label>
                <button type="button" class="btn btn-secondary w-full" @click="createNewEpisode">Create</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="admin-edit__actions">
        <button type="submit" class="btn btn-primary btn-lg" :disabled="isSaving" id="btn-save-movie">
          {{ isSaving ? 'Saving...' : isNew ? 'Create Movie' : 'Save Changes' }}
        </button>
      </div>
    </form>

    <p v-if="successMsg" class="admin-edit__success">✅ {{ successMsg }}</p>
    <p v-if="errorMsg" class="admin-edit__error">❌ {{ errorMsg }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const {
  isNew,
  isSaving,
  successMsg,
  errorMsg,
  form,
  videoSources,
  subtitles,
  episodes,
  newEp,
  expandedEpisodes,
  toggleEpisode,
  expandAllEpisodes,
  collapseAllEpisodes,
  addVideoSource,
  removeVideoSource,
  addEpisodeVideoSource,
  removeEpisodeVideoSource,
  addSubtitle,
  removeSubtitle,
  addEpisodeSubtitle,
  removeEpisodeSubtitle,
  createNewEpisode,
  removeExistingEpisode,
  loadMovie,
  saveMovie,
  requireAuth,
} = useMovieEditor();

onMounted(() => {
  if (!requireAuth()) return;
  loadMovie();
});

useHead({ title: computed(() => (isNew.value ? 'Add Movie — Admin' : 'Edit Movie — Admin')) });
</script>

<style scoped>
.admin-edit .card:hover {
  transform: none;
  box-shadow: none;
  border-color: var(--color-border);
}
.admin-edit {
  min-height: 100vh;
  padding-top: var(--space-8);
  padding-bottom: var(--space-16);
  background: var(--color-bg-primary);
}
.admin-edit__header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}
.admin-edit__header h1 {
  font-size: var(--text-2xl);
}
.admin-edit__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
.admin-edit__section {
  padding: var(--space-6);
}
.admin-edit__section h3 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-5);
  font-family: var(--font-display);
}
.admin-edit__row {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: var(--space-4);
}
.admin-edit__field {
  flex: 1;
  min-width: 200px;
  margin-bottom: var(--space-4);
}
.admin-edit__field label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}
textarea.input {
  resize: vertical;
}
.admin-edit__torrent-row {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}
.admin-edit__actions {
  display: flex;
  justify-content: flex-end;
}
.admin-edit__success {
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.3);
  border-radius: var(--radius-md);
  color: var(--color-success);
  font-size: var(--text-sm);
}
.admin-edit__error {
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: rgba(251, 113, 133, 0.1);
  border: 1px solid rgba(251, 113, 133, 0.3);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: var(--text-sm);
}

/* Episode Accordion */
.admin-edit__episode-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}
.admin-edit__episode-block {
  margin-bottom: 4px;
}
.admin-edit__episode-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}
.admin-edit__episode-header:hover {
  background: rgba(255, 255, 255, 0.06);
}
.admin-edit__episode-header--open {
  border-radius: 8px 8px 0 0;
  background: rgba(255, 255, 255, 0.05);
}
.admin-edit__episode-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}
.admin-edit__episode-chevron {
  font-size: 0.7em;
  transition: transform 0.2s ease;
  opacity: 0.5;
}
.admin-edit__episode-chevron--open {
  transform: rotate(90deg);
}
.admin-edit__episode-badges {
  display: flex;
  gap: 6px;
  margin-left: 8px;
}
.admin-edit__badge {
  font-size: 0.75em;
  padding: 1px 8px;
  border-radius: 20px;
  opacity: 0.7;
}
.admin-edit__badge--video {
  background: rgba(59, 130, 246, 0.2);
  color: #93bbfd;
}
.admin-edit__badge--sub {
  background: rgba(52, 211, 153, 0.2);
  color: #6ee7b7;
}
.admin-edit__episode-content {
  padding: 12px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0 0 8px 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
