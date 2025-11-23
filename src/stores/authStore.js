import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  isAuthenticated: () => !!get().token,

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      // After registration, user needs to login
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.join(', ') ||
                          error.response?.data?.error ||
                          'Registration failed';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authAPI.logout();
    } catch (error) {
      // Even if API call fails, clear local state
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isLoading: false, error: null });
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await authAPI.getProfile();
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Alias for refreshing user data (e.g., after subscription change)
  refreshUser: async () => {
    try {
      const response = await authAPI.getProfile();
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
      return user;
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },

  updateProfile: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.updateProfile(userData);
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.join(', ') ||
                          error.response?.data?.error ||
                          'Update failed';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
