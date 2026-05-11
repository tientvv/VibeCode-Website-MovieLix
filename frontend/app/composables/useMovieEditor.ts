import type { VideoSource, SubtitleTrack, Episode, MovieForm, NewEpisodeForm } from '~/types/movie';

export function useMovieEditor() {
  const route = useRoute();
  const { authHeaders, requireAuth } = useAdminAuth();

  const isNew = computed(() => route.params.id === 'new');
  const movieId = computed(() => (isNew.value ? null : (route.params.id as string)));

  const isSaving = ref(false);
  const successMsg = ref('');
  const errorMsg = ref('');

  const form = reactive<MovieForm>({
    title: '',
    titleVi: '',
    overview: '',
    overviewVi: '',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    imdbRating: null,
    imdbId: '',
    releaseYear: null,
    runtime: null,
    type: 'MOVIE',
    status: 'DRAFT',
    featured: false,
  });

  const videoSources = ref<VideoSource[]>([]);
  const subtitles = ref<SubtitleTrack[]>([]);
  const episodes = ref<Episode[]>([]);
  const newEp = reactive<NewEpisodeForm>({ season: 1, episode: 1, title: '', runtime: '' });
  const expandedEpisodes = ref<Set<number>>(new Set());

  // ─── Episode Accordion ────────────────────────

  function toggleEpisode(id: number) {
    const s = new Set(expandedEpisodes.value);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    expandedEpisodes.value = s;
  }

  function expandAllEpisodes() {
    expandedEpisodes.value = new Set(episodes.value.map(ep => ep.id));
  }

  function collapseAllEpisodes() {
    expandedEpisodes.value = new Set();
  }

  // ─── Video Sources ────────────────────────────

  function addVideoSource() {
    videoSources.value.push({ quality: 'FHD_1080', driveUrl: '', label: '' });
  }

  async function removeVideoSource(idx: number) {
    const vs = videoSources.value[idx];
    if (!vs) return;
    if (vs.id) {
      if (!confirm('Delete this video source permanently?')) return;
      try {
        await $fetch('/api/admin/video-sources', {
          method: 'DELETE',
          headers: authHeaders(),
          body: { id: vs.id },
        });
      } catch {
        alert('Failed to delete video source');
        return;
      }
    }
    videoSources.value.splice(idx, 1);
  }

  function addEpisodeVideoSource(ep: Episode) {
    if (!ep.videoSources) ep.videoSources = [];
    ep.videoSources.push({ quality: 'FHD_1080', driveUrl: '', label: '' });
  }

  async function removeEpisodeVideoSource(ep: Episode, vs: VideoSource, vidx: number) {
    if (vs.id) {
      if (!confirm('Delete this video source permanently?')) return;
      try {
        await $fetch('/api/admin/video-sources', {
          method: 'DELETE',
          headers: authHeaders(),
          body: { id: vs.id },
        });
      } catch {
        alert('Failed to delete video source');
        return;
      }
    }
    ep.videoSources.splice(vidx, 1);
  }

  // ─── Subtitles ────────────────────────────────

  function addSubtitle() {
    subtitles.value.push({ language: 'vi', srtContent: '' });
  }

  async function removeSubtitle(idx: number) {
    const sub = subtitles.value[idx];
    if (!sub) return;
    if (sub.id) {
      if (!confirm('Delete this subtitle permanently?')) return;
      try {
        await $fetch('/api/admin/subtitles', {
          method: 'DELETE' as any,
          headers: authHeaders(),
          body: { id: sub.id },
        });
      } catch {
        alert('Failed to delete subtitle');
        return;
      }
    }
    subtitles.value.splice(idx, 1);
  }

  function addEpisodeSubtitle(ep: Episode) {
    if (!ep.subtitles) ep.subtitles = [];
    ep.subtitles.push({ language: 'vi', srtContent: '' });
  }

  async function removeEpisodeSubtitle(ep: Episode, sub: SubtitleTrack, idx: number) {
    if (sub.id) {
      if (!confirm('Delete this subtitle permanently?')) return;
      try {
        await $fetch('/api/admin/subtitles', {
          method: 'DELETE' as any,
          headers: authHeaders(),
          body: { id: sub.id },
        });
      } catch {
        alert('Failed to delete subtitle');
        return;
      }
    }
    ep.subtitles.splice(idx, 1);
  }

  // ─── Episodes CRUD ────────────────────────────

  async function loadEpisodes() {
    if (isNew.value || form.type !== 'TV_SERIES') return;
    try {
      const data = await $fetch<any[]>(`/api/admin/episodes?movieId=${movieId.value}`, {
        headers: authHeaders(),
      });
      episodes.value = data.map((ep: any) => ({
        ...ep,
        subtitles: (ep.subtitles || []).map((sub: any) => ({
          id: sub.id,
          language: sub.language,
          srtContent: sub.fileUrl || '',
          _saved: true,
        })),
      }));
    } catch (err) {
      console.error('Failed to load episodes', err);
    }
  }

  async function createNewEpisode() {
    if (isNew.value) {
      alert('Please save the TV Series first!');
      return;
    }
    try {
      isSaving.value = true;
      await $fetch('/api/admin/episodes', {
        method: 'POST',
        headers: authHeaders(),
        body: {
          movieId: Number(movieId.value),
          season: Number(newEp.season),
          episode: Number(newEp.episode),
          title: newEp.title,
          runtime: newEp.runtime,
        },
      });
      newEp.episode++;
      newEp.title = '';
      await loadEpisodes();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to create episode');
    } finally {
      isSaving.value = false;
    }
  }

  async function removeExistingEpisode(id: number, idx: number) {
    if (!confirm('Are you sure you want to delete this episode and all its video sources?')) return;
    try {
      await $fetch('/api/admin/episodes', {
        method: 'DELETE',
        headers: authHeaders(),
        body: { id },
      });
      episodes.value.splice(idx, 1);
    } catch (err: any) {
      alert(err.data?.message || 'Failed to delete episode');
    }
  }

  // ─── Load & Save ─────────────────────────────

  async function loadMovie() {
    if (isNew.value) return;
    try {
      const movies = await $fetch<any[]>('/api/admin/movies', {
        headers: authHeaders(),
      });

      const movie = movies.find((m: any) => m.id.toString() === movieId.value);
      if (!movie) {
        errorMsg.value = 'Movie not found';
        return;
      }

      form.title = movie.title || '';
      form.titleVi = movie.titleVi || '';
      form.overview = movie.overview || '';
      form.overviewVi = movie.overviewVi || '';
      form.posterUrl = movie.posterUrl || '';
      form.backdropUrl = movie.backdropUrl || '';
      form.trailerUrl = movie.trailerUrl || '';
      form.imdbRating = movie.imdbRating;
      form.imdbId = movie.imdbId || '';
      form.releaseYear = movie.releaseYear;
      form.runtime = movie.runtime;
      form.type = movie.type || 'MOVIE';
      form.status = movie.status || 'DRAFT';
      form.featured = movie.featured || false;

      if (movie.videoSources?.length) {
        videoSources.value = movie.videoSources.map((vs: any) => ({
          id: vs.id,
          quality: vs.quality,
          driveUrl: vs.driveUrl,
          label: vs.label || '',
        }));
      }

      if (movie.subtitles?.length) {
        subtitles.value = movie.subtitles.map((s: any) => ({
          id: s.id,
          language: s.language,
          srtContent: s.fileUrl || '',
          _saved: true,
        }));
      }

      if (form.type === 'TV_SERIES') {
        await loadEpisodes();
      }
    } catch {
      errorMsg.value = 'Failed to load movie data';
    }
  }

  async function saveMovie() {
    if (form.imdbId && form.imdbId.includes('imdb.com')) {
      const match = form.imdbId.match(/tt\d+/);
      if (match) form.imdbId = match[0];
    }

    isSaving.value = true;
    successMsg.value = '';
    errorMsg.value = '';

    if (!form.title.trim()) {
      errorMsg.value = 'Title is required';
      isSaving.value = false;
      return;
    }

    try {
      const method = isNew.value ? 'POST' : 'PUT';
      const cleanForm = {
        ...form,
        imdbId: form.imdbId?.trim() || null,
        trailerUrl: form.trailerUrl?.trim() || null,
      };
      const bodyData = isNew.value ? cleanForm : { id: Number(movieId.value), ...cleanForm };

      const movie = await $fetch<any>('/api/admin/movies', {
        method,
        headers: authHeaders(),
        body: bodyData,
      });

      // Save NEW video sources
      for (const vs of videoSources.value) {
        if (vs.driveUrl.trim() && !vs.id) {
          await $fetch('/api/admin/video-sources', {
            method: 'POST',
            headers: authHeaders(),
            body: { movieId: movie.id, quality: vs.quality, driveUrl: vs.driveUrl, label: vs.label },
          });
        }
      }

      // Save episode data
      if (form.type === 'TV_SERIES') {
        for (const ep of episodes.value) {
          for (const vs of ep.videoSources || []) {
            if (vs.driveUrl.trim() && !vs.id) {
              await $fetch('/api/admin/video-sources', {
                method: 'POST',
                headers: authHeaders(),
                body: { episodeId: ep.id, quality: vs.quality, driveUrl: vs.driveUrl, label: vs.label || '' },
              });
            }
          }
          for (const sub of ep.subtitles || []) {
            const content = sub.srtContent?.trim();
            if (!content || (sub._saved && content.startsWith('/api/subtitles/'))) continue;
            await $fetch('/api/admin/subtitles', {
              method: 'POST',
              headers: authHeaders(),
              body: {
                id: sub.id || undefined,
                movieSlug: movie.slug,
                episodeId: ep.id,
                language: sub.language,
                srtContent: sub.srtContent,
              },
            });
          }
        }
      }

      // Save movie-level subtitles
      for (const s of subtitles.value) {
        const content = s.srtContent?.trim();
        if (!content || (s._saved && content.startsWith('/api/subtitles/'))) continue;
        await $fetch('/api/admin/subtitles', {
          method: 'POST',
          headers: authHeaders(),
          body: {
            id: s.id || undefined,
            movieSlug: movie.slug,
            language: s.language,
            srtContent: s.srtContent,
          },
        });
      }

      successMsg.value = 'Movie saved successfully!';
      if (isNew.value) {
        navigateTo(`/admin/movies/${movie.id}`);
      }
    } catch (err: any) {
      errorMsg.value = err.data?.message || err.message || 'Failed to save movie';
    } finally {
      isSaving.value = false;
    }
  }

  return {
    // State
    isNew,
    movieId,
    isSaving,
    successMsg,
    errorMsg,
    form,
    videoSources,
    subtitles,
    episodes,
    newEp,
    expandedEpisodes,
    // Episode accordion
    toggleEpisode,
    expandAllEpisodes,
    collapseAllEpisodes,
    // Video sources
    addVideoSource,
    removeVideoSource,
    addEpisodeVideoSource,
    removeEpisodeVideoSource,
    // Subtitles
    addSubtitle,
    removeSubtitle,
    addEpisodeSubtitle,
    removeEpisodeSubtitle,
    // Episodes
    createNewEpisode,
    removeExistingEpisode,
    // Load & Save
    loadMovie,
    saveMovie,
    requireAuth,
  };
}
