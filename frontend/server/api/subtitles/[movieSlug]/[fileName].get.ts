export default defineEventHandler(async (event) => {
  const prisma = usePrisma();

  const movieSlug = event.context.params?.movieSlug;
  const fileName = event.context.params?.fileName; // vi.vtt

  if (!movieSlug || !fileName) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' });
  }

  // Extract language from fileName (e.g., vi.vtt -> vi)
  const language = fileName.replace('.vtt', '');

  const query = getQuery(event);
  const episodeIdStr = query.episodeId as string;
  const episodeId = episodeIdStr && episodeIdStr !== 'null' ? Number(episodeIdStr) : null;

  const subtitle = await prisma.subtitle.findFirst({
    where: {
      movie: { slug: movieSlug },
      language: language,
      episodeId: episodeId,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!subtitle || !subtitle.content) {
    throw createError({ statusCode: 404, statusMessage: 'Subtitle not found' });
  }

  // Set response headers for VTT subtitle
  setResponseHeader(event, 'Content-Type', 'text/vtt; charset=utf-8');
  // Allow Cache
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600');

  return subtitle.content;
});
