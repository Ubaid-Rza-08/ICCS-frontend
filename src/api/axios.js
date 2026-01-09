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

// Handle 401 (Token Expiry)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // FIX 1: Check for 401 (Unauthorized), not 403 (Forbidden)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const uid = localStorage.getItem('uid');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!uid || !refreshToken) {
            throw new Error("No credentials to refresh");
        }

        // Call refresh endpoint
        const { data } = await axios.post('http://localhost:8080/api/auth/refresh', {
          uid, 
          refreshToken
        });

        // Store new token
        localStorage.setItem('accessToken', data.accessToken);
        
        // Update default headers for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        
        // FIX 2: Update the Authorization header of the FAILED request with the NEW token
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh failed:", refreshError);
        localStorage.clear();
        window.location.href = '/login'; // Redirect to login, not just root
      }
    }
    return Promise.reject(error);
  }
);

export default api;