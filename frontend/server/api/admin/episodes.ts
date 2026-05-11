export default defineEventHandler(async (event) => {
  const prisma = usePrisma();
  const method = event.method;

  if (method === 'GET') {
    verifyAdmin(event);
    const query = getQuery(event);
    if (!query.movieId) {
      throw createError({ statusCode: 400, statusMessage: 'movieId is required' });
    }
    const episodes = await prisma.episode.findMany({
      where: { movieId: parseInt(query.movieId as string) },
      include: {
        videoSources: true,
        subtitles: true,
      },
      orderBy: [{ season: 'asc' }, { episode: 'asc' }],
    });
    return episodes;
  }

  if (method === 'POST') {
    verifyAdmin(event);
    const body = await readBody(event);
    const episode = await prisma.episode.create({
      data: {
        movieId: body.movieId,
        season: body.season,
        episode: body.episode,
        title: body.title || null,
        runtime: body.runtime ? parseInt(body.runtime) : null,
      },
    });
    return episode;
  }

  if (method === 'DELETE') {
    verifyAdmin(event);
    const body = await readBody(event);
    if (!body.id) throw createError({ statusCode: 400, statusMessage: 'Episode id is required' });

    await prisma.subtitle.deleteMany({ where: { episodeId: body.id } });
    await prisma.videoSource.deleteMany({ where: { episodeId: body.id } });
    await prisma.episode.delete({ where: { id: body.id } });

    return { deleted: true };
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
});
