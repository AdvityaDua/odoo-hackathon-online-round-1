import api from './api';

const AUTH_API_URL = '/api/accounts/login/';

const authService = {
  login: async (email, password) => {
    const response = await api.post(AUTH_API_URL, { email, password });
    if (response.data.access) {
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data.user;
  },

  logout: () => {
    localStorage.clear();
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;

