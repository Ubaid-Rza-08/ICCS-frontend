import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Attach Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 403 (Token Expiry)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const uid = localStorage.getItem('uid');
        const refreshToken = localStorage.getItem('refreshToken');
        
        const { data } = await axios.post('http://localhost:8080/api/auth/refresh', {
          uid, refreshToken
        });

        localStorage.setItem('accessToken', data.accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;