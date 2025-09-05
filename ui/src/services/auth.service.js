import api from './api';

class AuthService {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, accessToken, refreshToken };
  }

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    const { user, accessToken, refreshToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, accessToken, refreshToken };
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
    }
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.data;
  }

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
}

export default new AuthService();
