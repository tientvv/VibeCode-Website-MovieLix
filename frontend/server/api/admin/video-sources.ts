import jwt from 'jsonwebtoken';

function verifyAdmin(event: any) {
  const config = useRuntimeConfig();
  const auth = getHeader(event, 'authorization');
  if (!auth?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), config.jwtSecret) as any;
    if (decoded.role?.toLowerCase() !== 'admin') throw new Error('Not admin');
    return decoded;
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' });
  }
}

function extractFileId(url: string): string {
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) return match1[1];
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) return match2[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) return url;
  throw createError({ statusCode: 400, statusMessage: 'Invalid Google Drive URL. Cannot extract File ID.' });
}

export default defineEventHandler(async (event) => {
  const prisma = usePrisma();
  verifyAdmin(event);
  const method = event.method;
  const body = method !== 'GET' ? await readBody(event) : null;

  if (method === 'POST') {
    if (!body?.driveUrl || !body?.quality) {
      throw createError({ statusCode: 400, statusMessage: 'driveUrl and quality required' });
    }

    const driveFileId = extractFileId(body.driveUrl);
    if (!driveFileId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid Google Drive URL. Use format: https://drive.google.com/file/d/FILE_ID/view' });
    }

    const videoSource = await prisma.videoSource.create({
      data: {
        movieId: body.movieId || null,
        episodeId: body.episodeId || null,
        driveUrl: body.driveUrl,
        driveFileId,
        quality: body.quality,
        label: body.label || null,
      },
    });

    return videoSource;
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
