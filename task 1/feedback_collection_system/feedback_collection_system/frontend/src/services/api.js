import axios from 'axios';

// Your backend is running on port 5000
const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.data);
      return Promise.reject({
        response: {
          data: error.response.data,
          status: error.response.status
        }
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject({
        response: {
          data: { message: 'No response from server. Please check your connection.' },
          status: 0
        }
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      return Promise.reject({
        response: {
          data: { message: 'Error setting up request. Please try again.' },
          status: 0
        }
      });
    }
  }
);

// ===================================
// Auth API Calls
// ===================================

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

// ===================================
// Forms API Calls
// ===================================

export const createForm = async (formData) => {
  try {
    const response = await api.post('/forms', formData);
    return response;
  } catch (error) {
    console.error('Create form error:', error);
    throw error;
  }
};

export const getForms = async (params = {}) => {
  try {
    const response = await api.get('/forms', { params });
    return response;
  } catch (error) {
    console.error('Get forms error:', error);
    throw error;
  }
};

export const getForm = async (formId) => {
  try {
    const response = await api.get(`/forms/${formId}`);
    return response;
  } catch (error) {
    console.error('Get form error:', error);
    throw error;
  }
};

export const updateForm = async (formId, formData) => {
  try {
    const response = await api.put(`/forms/${formId}`, formData);
    return response;
  } catch (error) {
    console.error('Update form error:', error);
    throw error;
  }
};

export const deleteForm = async (formId) => {
  try {
    const response = await api.delete(`/forms/${formId}`);
    return response;
  } catch (error) {
    console.error('Delete form error:', error);
    throw error;
  }
};

export const duplicateForm = async (formId) => {
  try {
    const response = await api.post(`/forms/${formId}/duplicate`);
    return response;
  } catch (error) {
    console.error('Duplicate form error:', error);
    throw error;
  }
};

export const getFormAnalytics = async (formId) => {
  try {
    const response = await api.get(`/forms/${formId}/analytics`);
    return response;
  } catch (error) {
    console.error('Get form analytics error:', error);
    throw error;
  }
};

export const getPublicForm = async (formId) => {
  try {
    const response = await api.get(`/forms/public/${formId}`);
    return response;
  } catch (error) {
    console.error('Get public form error:', error);
    throw error;
  }
};

// ===================================
// Responses API Calls
// ===================================

export const submitResponse = async (responseData) => {
  try {
    const response = await api.post('/responses', responseData);
    return response;
  } catch (error) {
    console.error('Submit response error:', error);
    throw error;
  }
};

export const getFormResponses = async (formId, params = {}) => {
  try {
    const response = await api.get(`/responses/form/${formId}`, { params });
    return response;
  } catch (error) {
    console.error('Get form responses error:', error);
    throw error;
  }
};

export const getResponse = async (responseId) => {
  try {
    const response = await api.get(`/responses/${responseId}`);
    return response;
  } catch (error) {
    console.error('Get response error:', error);
    throw error;
  }
};

export const updateResponseStatus = async (responseId, statusData) => {
  try {
    const response = await api.patch(`/responses/${responseId}/status`, statusData);
    return response;
  } catch (error) {
    console.error('Update response status error:', error);
    throw error;
  }
};

export const deleteResponse = async (responseId) => {
  try {
    const response = await api.delete(`/responses/${responseId}`);
    return response;
  } catch (error) {
    console.error('Delete response error:', error);
    throw error;
  }
};

export const exportResponses = async (formId, format = 'csv') => {
  try {
    const response = await api.get(`/responses/form/${formId}/export`, {
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response;
  } catch (error) {
    console.error('Export responses error:', error);
    throw error;
  }
};

export const getResponseAnalytics = async (params = {}) => {
  try {
    const response = await api.get('/responses/analytics/overview', { params });
    return response;
  } catch (error) {
    console.error('Get response analytics error:', error);
    throw error;
  }
};

// ===================================
// Notifications API Calls
// ===================================

export const getNotifications = async (params = {}) => {
  try {
    const response = await api.get('/notifications', { params });
    return response;
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response;
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response;
  } catch (error) {
    console.error('Delete notification error:', error);
    throw error;
  }
};

export default api;