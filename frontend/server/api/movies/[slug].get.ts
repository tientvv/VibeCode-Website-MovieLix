export default defineEventHandler(async (event) => {
  const prisma = usePrisma();
  const slug = getRouterParam(event, 'slug');

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug is required' });
  }

  const movie = await prisma.movie.findUnique({
    where: { slug },
    include: {
      genres: { include: { genre: true } },
      countries: { include: { country: true } },
      videoSources: { orderBy: { quality: 'asc' } },
      subtitles: { orderBy: { language: 'asc' } },
      episodes: {
        orderBy: [{ season: 'asc' }, { episode: 'asc' }],
        include: {
          videoSources: true,
          subtitles: true,
        },
      },
    },
  });

  if (!movie) {
    throw createError({ statusCode: 404, statusMessage: 'Movie not found' });
  }

  return {
    ...movie,
    genres: movie.genres.map((mg: any) => mg.genre),
    countries: movie.countries.map((mc: any) => mc.country),
  };
});
