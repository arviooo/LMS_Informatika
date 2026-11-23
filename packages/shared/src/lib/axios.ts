import axios from 'axios';

// Get the current hostname where the React app is served (e.g., 'localhost' or 'ruanginfo.ct.ws')
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isProductionDomain = hostname.includes('ruanginfo.ct.ws');

// If accessed on the production domain, always match window.location.origin to prevent cross-origin/mixed-content issues
export const backendUrl = isProductionDomain 
  ? window.location.origin 
  : (import.meta.env.VITE_API_URL || `http://${hostname}:8000`);

export const formatStorageUrl = (urlOrPath?: string | null): string => {
  if (!urlOrPath) return '';

  // If already absolute URL
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    // If it points to localhost:8000 or 127.0.0.1:8000 while accessed from elsewhere (e.g. phone or tunnel)
    if (urlOrPath.includes('localhost:8000') || urlOrPath.includes('127.0.0.1:8000')) {
      const pathOnly = urlOrPath.replace(/^https?:\/\/[^/]+/, '');
      return `${backendUrl}${pathOnly}`;
    }
    return urlOrPath;
  }

  // If it's a relative path e.g. 'submissions/xyz.jpg' or '/api/storage/...'
  const clean = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  if (clean.startsWith('/api/storage/')) {
    return `${backendUrl}${clean}`;
  }
  if (clean.startsWith('/storage/')) {
    return `${backendUrl}/api${clean}`;
  }
  return `${backendUrl}/api/storage${clean}`;
};

const axiosInstance = axios.create({
  baseURL: backendUrl,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
  withCredentials: true,
  withXSRFToken: true
});

// Request Interceptor: Attach Bearer Token from localStorage if exists (immune to cookie blocking on mobile)
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('lms_auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 419)) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('lms_current_user');
        localStorage.removeItem('lms_auth_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
