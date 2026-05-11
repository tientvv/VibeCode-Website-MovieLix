export default defineEventHandler(async (event) => {
  const prisma = usePrisma();
  const query = getQuery(event);

  const page = parseInt(query.page as string) || 1;
  const limit = Math.min(parseInt(query.limit as string) || 20, 50);
  const type = query.type as string | undefined;
  const genre = query.genre as string | undefined;
  const country = query.country as string | undefined;
  const search = query.q as string | undefined;
  const featured = query.featured === 'true';
  const sort = (query.sort as string) || 'createdAt';
  const order = (query.order as string) || 'desc';

  const where: any = {
    status: 'PUBLISHED',
  };

  if (type) where.type = type;
  if (featured) where.featured = true;

  if (genre) {
    where.genres = {
      some: { genre: { slug: genre } },
    };
  }

  if (country) {
    where.countries = {
      some: { country: { code: country } },
    };
  }

  if (search) {
    where.OR = [{ title: { contains: search } }, { titleVi: { contains: search } }];
  }

  try {
    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        select: {
          id: true,
          title: true,
          titleVi: true,
          slug: true,
          overview: true,
          overviewVi: true,
          posterUrl: true,
          backdropUrl: true,
          imdbRating: true,
          releaseYear: true,
          runtime: true,
          type: true,
          featured: true,
          genres: {
            select: { genre: { select: { name: true, slug: true } } },
          },
          videoSources: {
            select: { quality: true },
            distinct: ['quality'],
          },
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.movie.count({ where }),
    ]);

    return {
      movies: movies.map((m: any) => ({
        ...m,
        genres: m.genres.map((mg: any) => mg.genre),
        quality: m.videoSources[0]?.quality,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal Server Error',
    });
  }
});
