import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
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

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', { oldPassword, newPassword }),
};

// Student API
export const studentAPI = {
  getEvents: () => api.get('/student/events'),
  getBankProfile: () => api.get('/student/bank-profile'),
  saveBankProfile: (data) => api.post('/student/bank-profile', data),
  deleteBankProfile: () => api.delete('/student/bank-profile'),
  submitBankDetails: (data) => api.post('/student/bank-details', data),
  viewBankDetails: (teamId) => api.get(`/student/bank-details/${teamId}`),
  getPrizeHistory: () => api.get('/student/prize-history'),
};

// Entity API
export const entityAPI = {
  createEvent: (data) => api.post('/events', data),
  getMyEvents: () => api.get('/events/my-events'),
  getEventDetails: (eventId) => api.get(`/events/${eventId}`),
};

// Treasury API
export const treasuryAPI = {
  getAllEvents: () => api.get('/treasury/events'),
  getPending: () => api.get('/treasury/pending'),
  getStatistics: () => api.get('/treasury/statistics'),
  sendReminders: () => api.post('/treasury/send-reminders'),
  downloadData: () => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}/api/treasury/download-data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => response.blob());
  },
  markPaid: (bankDetailsId, data) => 
    api.post(`/treasury/mark-paid/${bankDetailsId}`, data),
};

export default api;
