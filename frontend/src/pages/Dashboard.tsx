import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHabits } from '@/features/habits/hooks/useHabits';
import HabitCard from '@/features/habits/components/HabitCard';
import ProgressSummary from '@/features/analytics/components/ProgressSummary';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import HabitForm from '@/features/habits/components/HabitForm';
import { HabitCreate, HabitUpdate } from '@/types/api';

const Dashboard: React.FC = () => {
  const {
    habits,
    completions,
    streaks,
    loading,
    error,
    createHabit,
    clearError,
  } = useHabits();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Get recent habits (last 6)
  const recentHabits = habits
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const handleCreateHabit = async (data: HabitCreate | HabitUpdate) => {
    setIsCreating(true);
    try {
      const success = await createHabit(data as HabitCreate);
      if (success) {
        setShowCreateModal(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (loading && habits.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your habits and build lasting routines
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Habit
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex justify-between items-start">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-600 hover:text-red-700"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <ProgressSummary
        habits={habits}
        completions={completions}
        streaks={streaks}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/habits">
          <Card hover className="text-center p-6">
            <svg className="mx-auto h-8 w-8 text-primary-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Manage Habits</h3>
            <p className="text-sm text-gray-500">View and edit all your habits</p>
          </Card>
        </Link>

        <Link to="/analytics">
          <Card hover className="text-center p-6">
            <svg className="mx-auto h-8 w-8 text-success-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">View Analytics</h3>
            <p className="text-sm text-gray-500">Track your progress over time</p>
          </Card>
        </Link>

        <div 
          className="text-center p-6 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md"
          onClick={() => setShowCreateModal(true)}
        >
          <svg className="mx-auto h-8 w-8 text-warning-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Add New Habit</h3>
          <p className="text-sm text-gray-500">Start tracking a new habit</p>
        </div>
      </div>

      {/* Recent Habits */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Habits</h2>
          {habits.length > 6 && (
            <Link to="/habits">
              <Button variant="ghost" size="sm">
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          )}
        </div>

        {recentHabits.length === 0 ? (
          <Card className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
            <p className="text-gray-500 mb-6">
              Start your journey by creating your first habit!
            </p>
            <Button onClick={() => setShowCreateModal(true)} variant="primary">
              Create Your First Habit
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                streak={streaks[habit.id]?.current_streak || 0}
                todayCompleted={
                  (completions[habit.id] || []).some(c => 
                    new Date(c.completion_date).toDateString() === new Date().toDateString()
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Habit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Habit"
      >
        <HabitForm
          onSubmit={handleCreateHabit}
          onCancel={() => setShowCreateModal(false)}
          loading={isCreating}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
