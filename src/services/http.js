import axios from 'axios';

// Create a new instance of axios
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const checkAuth = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return false;
  }

  try {
    const payload = parseJwt(token);
    return payload.exp > Date.now() / 1000; // Token is still valid
  } catch (e) {
    console.error(e);
    return false;
  }
};

// Request interceptor
http.interceptors.request.use(config => {

  // Add auth token to headers if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    const decoded = parseJwt(token);
    if (decoded && decoded.exp < Date.now() / 1000) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login?expired=true';
      return Promise.reject(new Error('Token expired'));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
http.interceptors.response.use(response => {
  if (response.data?.token) {
    localStorage.setItem('auth_token', response.data?.token);
  }
  return response;
}, error => {

  // error processing
  if (error.response) {
    switch (error.response.status) {
      case 401:
        localStorage.removeItem('auth_token');
        window.location.href = '/login?expired=true';
        break;
      case 403:
        console.warn('Not authorized');
        break;
      default:
        console.error(`Request error: ${error.message}`);
    }
  }
  return Promise.reject(error);
});

export default http;
