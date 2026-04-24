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

  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: 'id required' });
  }

  await prisma.subtitle.delete({ where: { id: body.id } });
  
  return { deleted: true };
});
