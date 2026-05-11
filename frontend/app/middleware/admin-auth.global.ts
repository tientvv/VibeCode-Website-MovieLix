export default defineNuxtRouteMiddleware((to) => {
  // Only apply to admin pages (excluding admin login)
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') return;

  const adminToken = useCookie<string | null>('admin_token');
  if (!adminToken.value) {
    return navigateTo('/admin/login');
  }
});
