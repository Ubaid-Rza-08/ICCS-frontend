import axios from 'axios';

// 1. Create the Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// 2. Request Interceptor: Attaches the Access Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Response Interceptor: Handles 401 Errors (Token Expiry)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const uid = localStorage.getItem('uid');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!uid || !refreshToken) {
          throw new Error("Missing credentials");
        }

        // Call the Refresh Token Endpoint
        // Note: We use a fresh 'axios' call here to avoid circular logic
        const response = await axios.post('http://localhost:8080/api/auth/refresh', {
          uid,
          refreshToken
        });

        const newAccessToken = response.data.accessToken;

        // Save the new token
        localStorage.setItem('accessToken', newAccessToken);

        // Update the Authorization header for the RETRY
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Update the default header for FUTURE requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // Retry the original request with the new token
        return api(originalRequest);

      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        
        // 1. Clear local storage so the old invalid tokens are gone
        localStorage.clear();
        
        // 2. DISPATCH EVENT (Triggers the Big Pop Up)
        // Instead of redirecting immediately, we broadcast this event.
        // The <SessionExpiredPopup /> component listens for this and opens the modal.
        window.dispatchEvent(new Event('session-expired'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;