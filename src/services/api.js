import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/sign_up', { user: userData }),
  login: (credentials) => api.post('/auth/sign_in', { user: credentials }),
  logout: () => api.delete('/auth/sign_out'),
  getProfile: () => api.get('/users/me'),
  updateProfile: (userData) => api.patch('/users/me', { user: userData }),
};

export const plansAPI = {
  getAll: () => api.get('/plans'),
  getBySlug: (slug) => api.get(`/plans/${slug}`),
};

export const subscriptionsAPI = {
  checkout: (planSlug) => api.post('/subscriptions/checkout', { plan_slug: planSlug }),
  portal: () => api.post('/subscriptions/portal'),
  status: () => api.get('/subscriptions/status'),
  sync: () => api.post('/subscriptions/sync'),
};

export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/dashboard/stats'),

  // Users
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),

  // Plans
  getPlans: () => api.get('/admin/plans'),
  getPlan: (id) => api.get(`/admin/plans/${id}`),
  updatePlan: (id, data) => api.patch(`/admin/plans/${id}`, data),
};

// Employee API (separate axios instance with separate token storage)
const employeeApiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee request interceptor (uses different token key)
employeeApiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('employee_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Employee response interceptor
employeeApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('employee_token');
      localStorage.removeItem('employee');
      if (window.location.pathname.startsWith('/employee') &&
          window.location.pathname !== '/employee/login') {
        window.location.href = '/employee/login';
      }
    }
    return Promise.reject(error);
  }
);

export const employeeAPI = {
  // Authentication
  login: (credentials) => employeeApiInstance.post('/employee/auth/login', { employee: credentials }),
  logout: () => employeeApiInstance.delete('/employee/auth/logout'),

  // Tasks
  getTasks: (params = {}) => employeeApiInstance.get('/employee/tasks', { params }),
  getTask: (id) => employeeApiInstance.get(`/employee/tasks/${id}`),
  startTask: (id) => employeeApiInstance.post(`/employee/tasks/${id}/start`),
};

export default api;
