function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function buildMovieData(body: any) {
  return {
    title: body.title,
    titleVi: body.titleVi || null,
    slug: generateSlug(body.title),
    overview: body.overview || null,
    overviewVi: body.overviewVi || null,
    posterUrl: body.posterUrl || null,
    backdropUrl: body.backdropUrl || null,
    trailerUrl: body.trailerUrl || null,
    imdbRating: body.imdbRating ? parseFloat(body.imdbRating) : null,
    imdbId: body.imdbId || null,
    releaseYear: body.releaseYear ? parseInt(body.releaseYear) : null,
    runtime: body.runtime ? parseInt(body.runtime) : null,
    status: body.status || 'DRAFT',
    featured: body.featured || false,
  };
}

export default defineEventHandler(async (event) => {
  const prisma = usePrisma();
  const method = event.method;

  // GET — List all movies
  if (method === 'GET') {
    verifyAdmin(event);

    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        genres: { include: { genre: true } },
        videoSources: { where: { episodeId: null } },
        subtitles: { where: { episodeId: null } },
        _count: { select: { episodes: true } },
      },
    });

    return movies.map((m: any) => ({
      ...m,
      genres: m.genres.map((mg: any) => mg.genre),
      episodeCount: m._count.episodes,
    }));
  }

  // POST — Create new movie
  if (method === 'POST') {
    verifyAdmin(event);
    const body = await readBody(event);

    try {
      return await prisma.movie.create({
        data: { ...buildMovieData(body), type: body.type || 'MOVIE' },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw createError({ statusCode: 400, statusMessage: 'Movie with this title or IMDb ID already exists.' });
      }
      throw error;
    }
  }

  // PUT — Update existing movie
  if (method === 'PUT') {
    verifyAdmin(event);
    const body = await readBody(event);

    if (!body.id) {
      throw createError({ statusCode: 400, statusMessage: 'Movie id is required' });
    }

    return await prisma.movie.update({
      where: { id: body.id },
      data: buildMovieData(body),
    });
  }

  // DELETE — Delete a movie and related data
  if (method === 'DELETE') {
    verifyAdmin(event);
    const body = await readBody(event);

    if (!body.id) {
      throw createError({ statusCode: 400, statusMessage: 'Movie id is required' });
    }

    await prisma.subtitle.deleteMany({ where: { movieId: body.id } });
    await prisma.videoSource.deleteMany({ where: { movieId: body.id } });
    await prisma.movieGenre.deleteMany({ where: { movieId: body.id } });
    await prisma.movieCountry.deleteMany({ where: { movieId: body.id } });
    await prisma.episode.deleteMany({ where: { movieId: body.id } });
    await prisma.movie.delete({ where: { id: body.id } });

    return { deleted: true };
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
});

