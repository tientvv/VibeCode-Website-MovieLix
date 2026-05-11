export function useAdminAuth() {
  function getToken(): string {
    return localStorage.getItem('admin_token') || '';
  }

  function decodeToken(): { role?: string; username?: string } | null {
    const token = getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2 || !parts[1]) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  }

  function isAdmin(): boolean {
    const payload = decodeToken();
    return payload?.role === 'ADMIN';
  }

  function authHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${getToken()}` };
  }

  function requireAuth(): boolean {
    if (!getToken() || !isAdmin()) {
      localStorage.removeItem('admin_token');
      navigateTo('/admin/login');
      return false;
    }
    return true;
  }

  function logout() {
    localStorage.removeItem('admin_token');
    navigateTo('/admin/login');
  }

  return { getToken, authHeaders, requireAuth, logout, isAdmin, decodeToken };
}
