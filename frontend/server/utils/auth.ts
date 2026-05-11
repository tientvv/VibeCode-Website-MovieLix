import jwt from 'jsonwebtoken';

export function verifyAdmin(event: any) {
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

export function extractDriveFileId(url: string): string {
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1?.[1]) return match1[1];
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2?.[1]) return match2[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) return url;
  throw createError({ statusCode: 400, statusMessage: 'Invalid Google Drive URL. Cannot extract File ID.' });
}
