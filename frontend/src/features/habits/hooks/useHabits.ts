import { useEffect } from 'react';
import { useHabitStore } from '@/stores/habitStore';
import { HabitCreate, HabitUpdate } from '@/types/api';

export const useHabits = () => {
  const {
    habits,
    completions,
    streaks,
    loading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    fetchCompletions,
    fetchStreak,
    clearError,
  } = useHabitStore();

  // Fetch habits on mount
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Fetch completions and streaks for all habits when habits change
  useEffect(() => {
    const fetchHabitData = async () => {
      for (const habit of habits) {
        // Fetch completions if not already loaded
        if (!completions[habit.id]) {
          await fetchCompletions(habit.id);
        }
        
        // Fetch streak if not already loaded
        if (!streaks[habit.id]) {
          await fetchStreak(habit.id);
        }
      }
    };

    if (habits.length > 0) {
      fetchHabitData();
    }
  }, [habits, completions, streaks, fetchCompletions, fetchStreak]);

  const handleCreateHabit = async (data: HabitCreate) => {
    try {
      await createHabit(data);
      return true;
    } catch (error) {
      console.error('Failed to create habit:', error);
      return false;
    }
  };

  const handleUpdateHabit = async (id: number, data: HabitUpdate) => {
    try {
      await updateHabit(id, data);
      return true;
    } catch (error) {
      console.error('Failed to update habit:', error);
      return false;
    }
  };

  const handleDeleteHabit = async (id: number) => {
    try {
      await deleteHabit(id);
      return true;
    } catch (error) {
      console.error('Failed to delete habit:', error);
      return false;
    }
  };

  const refreshHabitData = async (habitId?: number) => {
    if (habitId) {
      // Refresh specific habit data
      await fetchCompletions(habitId);
      await fetchStreak(habitId);
    } else {
      // Refresh all habits
      await fetchHabits();
    }
  };

  return {
    // State
    habits,
    completions,
    streaks,
    loading,
    error,

    // Actions
    createHabit: handleCreateHabit,
    updateHabit: handleUpdateHabit,
    deleteHabit: handleDeleteHabit,
    refreshHabitData,
    clearError,

    // Computed values
    totalHabits: habits.length,
    activeHabits: habits.filter(h => {
      const streak = streaks[h.id];
      return streak && streak.current_streak > 0;
    }).length,
  };
};
