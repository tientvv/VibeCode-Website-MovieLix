export default defineNuxtRouteMiddleware((to) => {
  // Redirect logged-in users away from login page
  if (to.path === '/login') {
    const authToken = useCookie<string | null>('auth_token');
    if (authToken.value) {
      return navigateTo('/');
    }
  }

  // Redirect logged-in admins away from admin login page
  if (to.path === '/admin/login') {
    const adminToken = useCookie<string | null>('admin_token');
    if (adminToken.value) {
      return navigateTo('/admin');
    }
  }
});
