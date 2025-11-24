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

  // Employees
  getEmployees: (params = {}) => api.get('/admin/employees', { params }),
  getEmployee: (id) => api.get(`/admin/employees/${id}`),
  createEmployee: (data) => api.post('/admin/employees', { employee: data }),
  updateEmployee: (id, data) => api.patch(`/admin/employees/${id}`, { employee: data }),
  deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),
  getAvailableEmployees: () => api.get('/admin/employees/available_for_assignment'),

  // Projects
  getProjects: (params = {}) => api.get('/admin/projects', { params }),
  getProject: (id) => api.get(`/admin/projects/${id}`),
  createProject: (data) => api.post('/admin/projects', { project: data }),
  updateProject: (id, data) => api.patch(`/admin/projects/${id}`, { project: data }),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),

  // Tasks
  getTasks: (params = {}) => api.get('/admin/tasks', { params }),
  getTask: (id) => api.get(`/admin/tasks/${id}`),
  createTask: (data) => api.post('/admin/tasks', { task: data }),
  updateTask: (id, data) => api.patch(`/admin/tasks/${id}`, { task: data }),
  deleteTask: (id) => api.delete(`/admin/tasks/${id}`),
  assignTask: (id, employeeId) => api.post(`/admin/tasks/${id}/assign`, { employee_id: employeeId }),
  bulkAssignTasks: (taskIds, employeeId = null) =>
    api.post('/admin/tasks/bulk_assign', { task_ids: taskIds, employee_id: employeeId }),
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
  updateTaskStatus: (id, status) => employeeApiInstance.patch(`/employee/tasks/${id}/update_status`, { status }),

  // Annotations
  getAnnotations: (params = {}) => employeeApiInstance.get('/employee/annotations', { params }),
  getAnnotation: (id) => employeeApiInstance.get(`/employee/annotations/${id}`),
  createAnnotation: (taskId, annotationData) =>
    employeeApiInstance.post(`/employee/tasks/${taskId}/annotations`, { annotation: annotationData }),
  updateAnnotation: (id, annotationData) =>
    employeeApiInstance.patch(`/employee/annotations/${id}`, { annotation: annotationData }),
  deleteAnnotation: (id) => employeeApiInstance.delete(`/employee/annotations/${id}`),
  saveDraft: (taskId, annotationData) =>
    employeeApiInstance.post(`/employee/tasks/${taskId}/annotations/save_draft`, { annotation: annotationData }),
  submitAnnotation: (taskId, annotationData) =>
    employeeApiInstance.post(`/employee/tasks/${taskId}/annotations/submit`, { annotation: annotationData }),
  unsubmitAnnotation: (taskId) =>
    employeeApiInstance.post(`/employee/tasks/${taskId}/annotations/unsubmit`),

  // Reviews (for reviewers)
  getReviewQueue: (params = {}) => employeeApiInstance.get('/employee/reviews/queue', { params }),
  getMyReviews: (params = {}) => employeeApiInstance.get('/employee/reviews/my_reviews', { params }),
  getAnnotationForReview: (id) => employeeApiInstance.get(`/employee/reviews/annotation/${id}`),
  approveAnnotation: (id, reviewData) =>
    employeeApiInstance.post(`/employee/reviews/annotation/${id}/approve`, reviewData),
  rejectAnnotation: (id, reviewData) =>
    employeeApiInstance.post(`/employee/reviews/annotation/${id}/reject`, reviewData),
  requestRevision: (id, reviewData) =>
    employeeApiInstance.post(`/employee/reviews/annotation/${id}/request_revision`, reviewData),

  // Images
  uploadImage: (taskId, file, metadata = {}) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('task_id', taskId);
    if (metadata.label) formData.append('label', metadata.label);
    if (metadata.annotation_type) formData.append('annotation_type', metadata.annotation_type);

    return employeeApiInstance.post('/employee/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getImageMetadata: (id) => employeeApiInstance.get(`/employee/images/${id}/metadata`),

  // Media (Audio/Video)
  uploadAudio: (taskId, file, metadata = {}) => {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('task_id', taskId);
    if (metadata.language) formData.append('language', metadata.language);
    if (metadata.annotation_type) formData.append('annotation_type', metadata.annotation_type);

    return employeeApiInstance.post('/employee/media/upload_audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadVideo: (taskId, file, metadata = {}) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('task_id', taskId);
    if (metadata.annotation_type) formData.append('annotation_type', metadata.annotation_type);

    return employeeApiInstance.post('/employee/media/upload_video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMediaMetadata: (id) => employeeApiInstance.get(`/employee/media/${id}/metadata`),

  // Analytics
  getPersonalAnalytics: (params = {}) => employeeApiInstance.get('/employee/analytics/personal', { params }),
  getLeaderboard: (params = {}) => employeeApiInstance.get('/employee/analytics/leaderboard', { params }),
  getTeamAnalytics: (params = {}) => employeeApiInstance.get('/employee/analytics/team', { params }),

  // Exports
  exportAnnotations: (params = {}) => employeeApiInstance.get('/employee/exports/annotations', { params }),
  exportTasks: (params = {}) => employeeApiInstance.get('/employee/exports/tasks', { params }),
  exportPerformance: (params = {}) => employeeApiInstance.get('/employee/exports/performance', { params }),
};

export default api;
