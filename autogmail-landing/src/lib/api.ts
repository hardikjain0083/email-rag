import axios from 'axios';

// Compute a sane default so deployments work without VITE_API_URL
// Default to the deployed backend if no env is provided.
const apiBase =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://hardikjain0083-email-rag.hf.space/api/v1';

const api = axios.create({
  baseURL: apiBase,
});

// Add interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const redirectToGoogleAuth = () => {
  // Direct navigation avoids CORS issues in some hosting setups
  window.location.href = `${apiBase}/auth/login?redirect=true`;
};

export default api;
