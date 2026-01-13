import axios, { AxiosResponse } from 'axios';
import {
  HabitResponse,
  HabitCreate,
  HabitUpdate,
  CompletionResponse,
  CompletionCreate,
  CompletionUpdate,
  StreakResponse,
} from '@/types/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    
    throw new Error(error.message || 'An unexpected error occurred');
  }
);

// Habit API functions
export const habitApi = {
  // Get all habits
  async getHabits(skip = 0, limit = 100): Promise<HabitResponse[]> {
    try {
      const response: AxiosResponse<HabitResponse[]> = await apiClient.get('/habits', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      throw error;
    }
  },

  // Get habit by ID
  async getHabit(id: number): Promise<HabitResponse> {
    try {
      const response: AxiosResponse<HabitResponse> = await apiClient.get(`/habits/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch habit ${id}:`, error);
      throw error;
    }
  },

  // Create new habit
  async createHabit(data: HabitCreate): Promise<HabitResponse> {
    try {
      const response: AxiosResponse<HabitResponse> = await apiClient.post('/habits', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create habit:', error);
      throw error;
    }
  },

  // Update habit
  async updateHabit(id: number, data: HabitUpdate): Promise<HabitResponse> {
    try {
      const response: AxiosResponse<HabitResponse> = await apiClient.put(`/habits/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update habit ${id}:`, error);
      throw error;
    }
  },

  // Delete habit
  async deleteHabit(id: number): Promise<void> {
    try {
      await apiClient.delete(`/habits/${id}`);
    } catch (error) {
      console.error(`Failed to delete habit ${id}:`, error);
      throw error;
    }
  },
};

// Completion API functions
export const completionApi = {
  // Get completions for a habit
  async getCompletionsByHabit(habitId: number, skip = 0, limit = 100): Promise<CompletionResponse[]> {
    try {
      const response: AxiosResponse<CompletionResponse[]> = await apiClient.get(
        `/completions/habit/${habitId}`,
        { params: { skip, limit } }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch completions for habit ${habitId}:`, error);
      throw error;
    }
  },

  // Get completion by ID
  async getCompletion(id: number): Promise<CompletionResponse> {
    try {
      const response: AxiosResponse<CompletionResponse> = await apiClient.get(`/completions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch completion ${id}:`, error);
      throw error;
    }
  },

  // Create completion
  async createCompletion(data: CompletionCreate): Promise<CompletionResponse> {
    try {
      const response: AxiosResponse<CompletionResponse> = await apiClient.post('/completions', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create completion:', error);
      throw error;
    }
  },

  // Update completion
  async updateCompletion(id: number, data: CompletionUpdate): Promise<CompletionResponse> {
    try {
      const response: AxiosResponse<CompletionResponse> = await apiClient.put(`/completions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update completion ${id}:`, error);
      throw error;
    }
  },

  // Delete completion
  async deleteCompletion(id: number): Promise<void> {
    try {
      await apiClient.delete(`/completions/${id}`);
    } catch (error) {
      console.error(`Failed to delete completion ${id}:`, error);
      throw error;
    }
  },
};

// Streak API functions
export const streakApi = {
  // Get streak for habit
  async getStreak(habitId: number): Promise<StreakResponse> {
    try {
      const response: AxiosResponse<StreakResponse> = await apiClient.get(`/streaks/${habitId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch streak for habit ${habitId}:`, error);
      throw error;
    }
  },

  // Recalculate streak
  async recalculateStreak(habitId: number): Promise<StreakResponse> {
    try {
      const response: AxiosResponse<StreakResponse> = await apiClient.post(`/streaks/${habitId}/recalculate`);
      return response.data;
    } catch (error) {
      console.error(`Failed to recalculate streak for habit ${habitId}:`, error);
      throw error;
    }
  },
};

// Health check
export const healthApi = {
  async checkHealth(): Promise<{ status: string }> {
    try {
      const response = await axios.get('http://localhost:8000/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },
};
