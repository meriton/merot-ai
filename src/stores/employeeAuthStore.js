import { create } from 'zustand';
import { employeeAPI } from '../services/api';

const useEmployeeAuthStore = create((set, get) => ({
  employee: JSON.parse(localStorage.getItem('employee')) || null,
  token: localStorage.getItem('employee_token') || null,
  isLoading: false,
  error: null,

  isAuthenticated: () => !!get().token,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await employeeAPI.login(credentials);
      const { employee, token } = response.data;

      // Store in localStorage (separate from customer auth)
      localStorage.setItem('employee_token', token);
      localStorage.setItem('employee', JSON.stringify(employee));

      set({ employee, token, isLoading: false });
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
      await employeeAPI.logout();
    } catch (error) {
      // Even if API call fails, clear local state
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('employee_token');
      localStorage.removeItem('employee');
      set({ employee: null, token: null, isLoading: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useEmployeeAuthStore;
