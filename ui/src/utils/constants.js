export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

export const USER_ROLES = {
  ADMIN: 'admin',
  CREATOR: 'creator',
  VIEWER: 'viewer'
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile'
};
