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
