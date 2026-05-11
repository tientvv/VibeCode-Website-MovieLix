export function useAdminAuth() {
  function getToken(): string {
    return localStorage.getItem('admin_token') || '';
  }

  function authHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${getToken()}` };
  }

  function requireAuth(): boolean {
    if (!getToken()) {
      navigateTo('/admin/login');
      return false;
    }
    return true;
  }

  function logout() {
    localStorage.removeItem('admin_token');
    navigateTo('/admin/login');
  }

  return { getToken, authHeaders, requireAuth, logout };
}
