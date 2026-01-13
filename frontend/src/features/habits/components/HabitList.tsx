import React, { useState, useMemo } from 'react';
import { isToday } from 'date-fns';
import HabitCard from './HabitCard';
import Button from '@/components/ui/Button';
import { HabitResponse, CompletionResponse, StreakResponse } from '@/types/api';

interface HabitListProps {
  habits: HabitResponse[];
  completions: Record<number, CompletionResponse[]>;
  streaks: Record<number, StreakResponse>;
  loading?: boolean;
  onCreateHabit: () => void;
  onEditHabit: (habit: HabitResponse) => void;
  onDeleteHabit: (habit: HabitResponse) => void;
}

const HabitList: React.FC<HabitListProps> = ({
  habits,
  completions,
  streaks,
  loading = false,
  onCreateHabit,
  onEditHabit,
  onDeleteHabit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'streak' | 'created'>('name');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = habits
      .map(h => h.category)
      .filter((cat): cat is string => Boolean(cat))
      .filter((cat, index, arr) => arr.indexOf(cat) === index)
      .sort();
    return cats;
  }, [habits]);

  // Filter and sort habits
  const filteredHabits = useMemo(() => {
    let filtered = habits.filter(habit => {
      const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (habit.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesCategory = !selectedCategory || habit.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort habits
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'streak':
          const streakA = streaks[a.id]?.current_streak || 0;
          const streakB = streaks[b.id]?.current_streak || 0;
          return streakB - streakA; // Descending
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Newest first
        default:
          return 0;
      }
    });

    return filtered;
  }, [habits, searchTerm, selectedCategory, sortBy, streaks]);

  // Check if habit is completed today
  const isHabitCompletedToday = (habitId: number): boolean => {
    const habitCompletions = completions[habitId] || [];
    return habitCompletions.some(completion => 
      isToday(new Date(completion.completion_date))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">My Habits</h2>
        <Button onClick={onCreateHabit} variant="primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Habit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="sm:w-48">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="streak">Sort by Streak</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>
      </div>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No habits found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first habit.'
            }
          </p>
          {!searchTerm && !selectedCategory && (
            <div className="mt-6">
              <Button onClick={onCreateHabit} variant="primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Habit
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHabits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              streak={streaks[habit.id]?.current_streak || 0}
              todayCompleted={isHabitCompletedToday(habit.id)}
              onEdit={() => onEditHabit(habit)}
              onDelete={() => onDeleteHabit(habit)}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredHabits.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {filteredHabits.length} of {habits.length} habits
        </div>
      )}
    </div>
  );
};

export default HabitList;
