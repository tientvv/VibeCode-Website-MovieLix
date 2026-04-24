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

export default defineEventHandler(async (event) => {
  const prisma = usePrisma();
  verifyAdmin(event);
  const body = await readBody(event);

  if (!body?.movieSlug || !body?.language || !body?.srtContent) {
    throw createError({
      statusCode: 400,
      statusMessage: 'movieSlug, language, and srtContent are required',
    });
  }

  let rawSrt = body.srtContent;

  // Try to extract Google Drive ID if it's a link
  const driveRegex = /file\/d\/([-\w]+)/;
  if (rawSrt.startsWith('http') && driveRegex.test(rawSrt)) {
    const fileId = rawSrt.match(driveRegex)![1];
    const config = useRuntimeConfig();
    try {
      // Fetch directly via our Cloudflare Worker Proxy
      const response = await fetch(`${config.public.streamingUrl}/api/stream/gdrive/${fileId}`);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      rawSrt = await response.text();
    } catch (err: any) {
      throw createError({
        statusCode: 400,
        statusMessage: `Could not read subtitle from Google Drive (Make sure it's shared 'Anyone with the link'): ${err.message}`,
      });
    }
  }

  // Extract and Convert ASS format to VTT if detected
  if (rawSrt.includes('[Events]') && rawSrt.includes('Dialogue:')) {
    let vtt = 'WEBVTT\n\n';
    const lines = rawSrt.split(/\r?\n/);
    let isEvent = false;

    for (const line of lines) {
      if (line.trim() === '[Events]') {
        isEvent = true;
        continue;
      }
      if (isEvent && line.startsWith('Dialogue:')) {
        const parts = line.replace('Dialogue:', '').trim().split(',');
        if (parts.length >= 10) {
          let start = parts[1].trim();
          let end = parts[2].trim();
          let text = parts
            .slice(9)
            .join(',')
            .replace(/\\N/gi, '\n')
            .replace(/\{.*?\}/g, '');

          const formatTime = (t: string) => {
            let [h, m, s] = t.split(':');
            h = (h || '0').padStart(2, '0');
            m = (m || '0').padStart(2, '0');
            let [sec, cs] = (s || '0.0').split('.');
            sec = (sec || '0').padStart(2, '0');
            cs = (cs || '00').padEnd(3, '0');
            return `${h}:${m}:${sec}.${cs}`;
          };

          if (start && end) {
            vtt += `${formatTime(start)} --> ${formatTime(end)}\n${text}\n\n`;
          }
        }
      }
    }
    rawSrt = vtt;
  }

  // Convert SRT (or VTT) to strict VTT format for player
  let vtt = 'WEBVTT\n\n';
  const lines = rawSrt.replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (/^\d+$/.test(line)) {
      i++;
      continue;
    }
    if (line.includes('-->')) {
      vtt += line.replace(/,/g, '.') + '\n';
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        vtt += lines[i].trim() + '\n';
        i++;
      }
      vtt += '\n';
      continue;
    }
    i++;
  }

  // Find movie
  const movie = await prisma.movie.findUnique({
    where: { slug: body.movieSlug },
  });

  if (!movie) {
    throw createError({ statusCode: 404, statusMessage: 'Movie not found' });
  }

  const labelMap: Record<string, string> = {
    vi: 'Tiếng Việt',
    en: 'English',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
  };

  const subtitleData = {
    movieId: movie.id,
    episodeId: body.episodeId || null,
    language: body.language,
    label: labelMap[body.language] || body.language,
    fileUrl: `/api/subtitles/${body.movieSlug}/${body.language}.vtt`,
    content: vtt,
    isDefault: body.language === 'vi',
  };

  let subtitle;
  if (body.id) {
    subtitle = await prisma.subtitle.update({
      where: { id: body.id },
      data: subtitleData,
    });
  } else {
    subtitle = await prisma.subtitle.create({
      data: subtitleData,
    });
  }

  return subtitle;
});
