import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  HabitResponse,
  HabitCreate,
  HabitUpdate,
  CompletionResponse,
  CompletionCreate,
  StreakResponse,
} from '@/types/api';
import { habitApi, completionApi, streakApi } from '@/services/api';

interface HabitStore {
  // State
  habits: HabitResponse[];
  completions: Record<number, CompletionResponse[]>; // habitId -> completions
  streaks: Record<number, StreakResponse>; // habitId -> streak
  loading: boolean;
  error: string | null;

  // Actions
  fetchHabits: () => Promise<void>;
  createHabit: (data: HabitCreate) => Promise<void>;
  updateHabit: (id: number, data: HabitUpdate) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
  
  fetchCompletions: (habitId: number) => Promise<void>;
  createCompletion: (data: CompletionCreate) => Promise<void>;
  deleteCompletion: (id: number, habitId: number) => Promise<void>;
  
  fetchStreak: (habitId: number) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  habits: [],
  completions: {},
  streaks: {},
  loading: false,
  error: null,
};

export const useHabitStore = create<HabitStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch all habits
      fetchHabits: async () => {
        set({ loading: true, error: null });
        try {
          const habits = await habitApi.getHabits();
          set({ habits, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch habits',
            loading: false 
          });
        }
      },

      // Create new habit
      createHabit: async (data: HabitCreate) => {
        set({ loading: true, error: null });
        try {
          const newHabit = await habitApi.createHabit(data);
          const { habits } = get();
          set({ 
            habits: [...habits, newHabit],
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create habit',
            loading: false 
          });
          throw error;
        }
      },

      // Update habit
      updateHabit: async (id: number, data: HabitUpdate) => {
        set({ loading: true, error: null });
        try {
          const updatedHabit = await habitApi.updateHabit(id, data);
          const { habits } = get();
          set({ 
            habits: habits.map(h => h.id === id ? updatedHabit : h),
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update habit',
            loading: false 
          });
          throw error;
        }
      },

      // Delete habit
      deleteHabit: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await habitApi.deleteHabit(id);
          const { habits, completions, streaks } = get();
          
          // Remove habit and related data
          const newCompletions = { ...completions };
          delete newCompletions[id];
          
          const newStreaks = { ...streaks };
          delete newStreaks[id];
          
          set({ 
            habits: habits.filter(h => h.id !== id),
            completions: newCompletions,
            streaks: newStreaks,
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete habit',
            loading: false 
          });
          throw error;
        }
      },

      // Fetch completions for a habit
      fetchCompletions: async (habitId: number) => {
        set({ loading: true, error: null });
        try {
          const habitCompletions = await completionApi.getCompletionsByHabit(habitId);
          const { completions } = get();
          set({ 
            completions: {
              ...completions,
              [habitId]: habitCompletions
            },
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch completions',
            loading: false 
          });
        }
      },

      // Create completion
      createCompletion: async (data: CompletionCreate) => {
        set({ loading: true, error: null });
        try {
          const newCompletion = await completionApi.createCompletion(data);
          const { completions } = get();
          const habitCompletions = completions[data.habit_id] || [];
          
          set({ 
            completions: {
              ...completions,
              [data.habit_id]: [...habitCompletions, newCompletion]
            },
            loading: false 
          });

          // Fetch updated streak
          await get().fetchStreak(data.habit_id);
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create completion',
            loading: false 
          });
          throw error;
        }
      },

      // Delete completion
      deleteCompletion: async (id: number, habitId: number) => {
        set({ loading: true, error: null });
        try {
          await completionApi.deleteCompletion(id);
          const { completions } = get();
          const habitCompletions = completions[habitId] || [];
          
          set({ 
            completions: {
              ...completions,
              [habitId]: habitCompletions.filter(c => c.id !== id)
            },
            loading: false 
          });

          // Fetch updated streak
          await get().fetchStreak(habitId);
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete completion',
            loading: false 
          });
          throw error;
        }
      },

      // Fetch streak for habit
      fetchStreak: async (habitId: number) => {
        try {
          const streak = await streakApi.getStreak(habitId);
          const { streaks } = get();
          set({ 
            streaks: {
              ...streaks,
              [habitId]: streak
            }
          });
        } catch (error) {
          // Don't set error for streak fetch failures as they're not critical
          console.warn(`Failed to fetch streak for habit ${habitId}:`, error);
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Reset store
      reset: () => set(initialState),
    }),
    {
      name: 'habit-store',
    }
  )
);
