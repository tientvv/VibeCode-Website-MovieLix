export default defineEventHandler(async (event) => {
  const prisma = usePrisma();
  verifyAdmin(event);
  const method = event.method;
  const body = method !== 'GET' ? await readBody(event) : null;

  if (method === 'POST') {
    if (!body?.driveUrl || !body?.quality) {
      throw createError({ statusCode: 400, statusMessage: 'driveUrl and quality required' });
    }

    const driveFileId = extractDriveFileId(body.driveUrl);

    return await prisma.videoSource.create({
      data: {
        movieId: body.movieId || null,
        episodeId: body.episodeId || null,
        driveUrl: body.driveUrl,
        driveFileId,
        quality: body.quality,
        label: body.label || null,
      },
    });
  }

  if (method === 'DELETE') {
    if (!body?.id) {
      throw createError({ statusCode: 400, statusMessage: 'id required' });
    }

    await prisma.videoSource.delete({ where: { id: body.id } });
    return { deleted: true };
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
});

