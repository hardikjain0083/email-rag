import axios from 'axios';

// Compute a sane default so deployments work without VITE_API_URL
// Default to the deployed backend if no env is provided.
const getApiBase = () => {
  let url = (import.meta as any).env.VITE_API_URL as string | undefined;
  if (!url) return 'https://hardikjain0083-email-rag.hf.space/api/v1';

  // Remove trailing slash
  url = url.replace(/\/$/, '');

  // Append /api/v1 if not present
  if (!url.endsWith('/api/v1')) {
    url += '/api/v1';
  }
  return url;
};

const apiBase = getApiBase();

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
