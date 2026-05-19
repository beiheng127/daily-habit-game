import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

// 请求拦截器 - 自动添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== 用户模块 API =====
export const userApi = {
  register: (data: { username: string; password: string; email: string }) =>
    api.post('/users/register', data).then(r => r.data),

  login: (data: { username: string; password: string }) =>
    api.post('/users/login', data).then(r => r.data),

  getProfile: () =>
    api.get('/users/profile').then(r => r.data),

  updateProfile: (data: { nickname?: string; avatar?: string }) =>
    api.put('/users/profile', data).then(r => r.data),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.put('/users/password', data).then(r => r.data),

  getLevelInfo: (userId: string) =>
    api.get(`/users/${userId}/level`).then(r => r.data)
};

// ===== 打卡模块 API =====
export const checkinApi = {
  checkin: (data: { habitId: string; note?: string }) =>
    api.post('/checkins', data).then(r => r.data),

  getTodayStatus: (date?: string) =>
    api.get('/checkins/today', { params: { date } }).then(r => r.data),

  getHistory: (params?: { startDate?: string; endDate?: string; habitId?: string }) =>
    api.get('/checkins/history', { params }).then(r => r.data),

  getHabits: () =>
    api.get('/habits').then(r => r.data),

  createHabit: (data: { name: string; icon?: string; color?: string; frequency?: string; reminderTime?: string }) =>
    api.post('/habits', data).then(r => r.data),

  updateHabit: (habitId: string, data: any) =>
    api.put(`/habits/${habitId}`, data).then(r => r.data),

  archiveHabit: (habitId: string) =>
    api.delete(`/habits/${habitId}`).then(r => r.data)
};

// ===== 游戏化模块 API =====
export const gameApi = {
  getStatus: () =>
    api.get('/game/status').then(r => r.data),

  getAchievements: () =>
    api.get('/game/achievements').then(r => r.data),

  claimDailyLogin: () =>
    api.post('/game/daily-login').then(r => r.data)
};

export default api;
