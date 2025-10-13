import api from './api'; // Your configured Axios instance

const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data; // Will contain user and tokens
};

const getProfile = async () => {
  const response = await api.get('/api/auth/profile');
  return response.data.user; // Return only the user object
};

const googleLoginRedirect = () => {
  // Construct the full URL for the backend OAuth endpoint
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3002';
  window.location.href = `${backendUrl}/api/auth/google`;
};

const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Optional: Add an API call to a '/api/auth/logout' endpoint to invalidate the token on the server
};

const authService = {
  login,
  getProfile,
  googleLoginRedirect,
  logout,
};

export default authService;
