import React, { useState } from 'react';
import { useHabits } from '@/features/habits/hooks/useHabits';
import ProgressSummary from '@/features/analytics/components/ProgressSummary';
import StreakChart from '@/features/analytics/components/StreakChart';
import CompletionChart from '@/features/analytics/components/CompletionChart';
import CategoryChart from '@/features/analytics/components/CategoryChart';
import Card from '@/components/ui/Card';

const Analytics: React.FC = () => {
  const { habits, completions, streaks, loading } = useHabits();
  
  const [timeRange, setTimeRange] = useState<number>(30);
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly'>('daily');
  const [selectedHabits, setSelectedHabits] = useState<number[]>([]);
  const [categoryMetric, setCategoryMetric] = useState<'count' | 'completion_rate' | 'average_streak'>('count');

  // Get unique categories for filtering
  const categories = Array.from(
    new Set(habits.map(h => h.category).filter(Boolean))
  ).sort();

  const handleHabitSelection = (habitId: number) => {
    setSelectedHabits(prev => 
      prev.includes(habitId)
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  const clearHabitSelection = () => {
    setSelectedHabits([]);
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your progress and identify patterns
          </p>
        </div>
        
        {/* Time Range Filter */}
        <div className="mt-4 sm:mt-0 flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <select
            value={chartPeriod}
            onChange={(e) => setChartPeriod(e.target.value as 'daily' | 'weekly')}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
          </select>
        </div>
      </div>

      {/* Progress Summary */}
      <ProgressSummary
        habits={habits}
        completions={completions}
        streaks={streaks}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Streak Progression Chart */}
        <Card padding="lg">
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Streak Progression</h3>
              {habits.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={clearHabitSelection}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {selectedHabits.length > 0 ? 'Show All' : 'Top 5'}
                  </button>
                </div>
              )}
            </div>
            {habits.length > 5 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">Select specific habits to display:</p>
                <div className="flex flex-wrap gap-1">
                  {habits.slice(0, 10).map(habit => (
                    <button
                      key={habit.id}
                      onClick={() => handleHabitSelection(habit.id)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        selectedHabits.includes(habit.id)
                          ? 'bg-primary-100 border-primary-300 text-primary-700'
                          : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {habit.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card.Header>
          <Card.Body>
            <StreakChart
              habits={habits}
              completions={completions}
              selectedHabitIds={selectedHabits.length > 0 ? selectedHabits : undefined}
              days={timeRange}
            />
          </Card.Body>
        </Card>

        {/* Completion Rate Chart */}
        <Card padding="lg">
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              Completion Trends ({chartPeriod === 'daily' ? 'Daily' : 'Weekly'})
            </h3>
          </Card.Header>
          <Card.Body>
            <CompletionChart
              habits={habits}
              completions={completions}
              period={chartPeriod}
              days={timeRange}
            />
          </Card.Body>
        </Card>

        {/* Category Distribution */}
        <Card padding="lg">
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
              <select
                value={categoryMetric}
                onChange={(e) => setCategoryMetric(e.target.value as any)}
                className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="count">Habit Count</option>
                <option value="completion_rate">Completion Rate</option>
                <option value="average_streak">Average Streak</option>
              </select>
            </div>
          </Card.Header>
          <Card.Body>
            <CategoryChart
              habits={habits}
              completions={completions}
              streaks={streaks}
              metric={categoryMetric}
            />
          </Card.Body>
        </Card>

        {/* Insights Panel */}
        <Card padding="lg">
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {/* Best Performing Category */}
              {categories.length > 0 && (
                <div className="p-3 bg-success-50 rounded-lg">
                  <h4 className="text-sm font-medium text-success-800 mb-1">
                    🏆 Top Category
                  </h4>
                  <p className="text-sm text-success-700">
                    {categories[0]} habits are performing well
                  </p>
                </div>
              )}

              {/* Streak Insights */}
              {Object.keys(streaks).length > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-800 mb-1">
                    🔥 Streak Status
                  </h4>
                  <p className="text-sm text-orange-700">
                    {Object.values(streaks).filter(s => s.current_streak > 0).length} habits have active streaks
                  </p>
                </div>
              )}

              {/* Completion Insights */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  📊 Activity Level
                </h4>
                <p className="text-sm text-blue-700">
                  {habits.length === 0 
                    ? 'Create your first habit to start tracking!'
                    : `Tracking ${habits.length} habit${habits.length !== 1 ? 's' : ''} total`
                  }
                </p>
              </div>

              {/* Recommendations */}
              {habits.length > 0 && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-800 mb-1">
                    💡 Tip
                  </h4>
                  <p className="text-sm text-purple-700">
                    {habits.length < 3 
                      ? 'Consider adding 2-3 more habits for a balanced routine'
                      : habits.length > 10
                      ? 'Focus on your most important habits to avoid overwhelm'
                      : 'Great habit count! Focus on consistency over quantity'
                    }
                  </p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Empty State */}
      {habits.length === 0 && (
        <Card className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data yet</h3>
          <p className="text-gray-500 mb-6">
            Create some habits and start tracking to see your progress analytics.
          </p>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
