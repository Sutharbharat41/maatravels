import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token and redirect to login if session expires
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  getCurrentUser: () => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }
};

export const vehicleAPI = {
  list: async (filters = {}) => {
    const response = await api.get('/vehicles', { params: filters });
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post('/vehicles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/vehicles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  }
};

export const clientAPI = {
  list: async (search = '') => {
    const response = await api.get('/clients', { params: { search } });
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post('/clients', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/clients/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  }
};

export const contractAPI = {
  list: async () => {
    const response = await api.get('/contracts');
    return response.data;
  },
  getLatestTerms: async () => {
    const response = await api.get('/contracts/latest-terms');
    return response.data;
  },
  getTemplateInfo: async () => {
    const response = await api.get('/contracts/template-info');
    return response.data;
  },
  uploadTemplate: async (formData) => {
    const response = await api.post('/contracts/template', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  generate: async (data, format = 'pdf') => {
    const response = await api.post('/contracts/generate', { ...data, format }, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export const paymentAPI = {
  list: async (filters = {}) => {
    const response = await api.get('/payments', { params: filters });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/payments', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/payments/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  }
};

export const inquiryAPI = {
  submit: async (data) => {
    const response = await api.post('/inquiries', data);
    return response.data;
  },
  list: async () => {
    const response = await api.get('/inquiries');
    return response.data;
  },
  reply: async (id, replyMessage) => {
    const response = await api.post(`/inquiries/${id}/reply`, { replyMessage });
    return response.data;
  },
  resolve: async (id, status) => {
    const response = await api.put(`/inquiries/${id}/resolve`, { status });
    return response.data;
  }
};

export const reportAPI = {
  getAnalytics: async (year) => {
    const response = await api.get('/reports/analytics', { params: { year } });
    return response.data;
  },
  exportExcel: async (filters = {}) => {
    const response = await api.get('/reports/export/excel', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },
  exportPdf: async (filters = {}) => {
    const response = await api.get('/reports/export/pdf', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default api;
export { API_BASE_URL };
