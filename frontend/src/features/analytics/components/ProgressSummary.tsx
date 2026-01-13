import React, { useMemo } from 'react';
import { isToday, subDays } from 'date-fns';
import Card from '@/components/ui/Card';
import { HabitResponse, CompletionResponse, StreakResponse } from '@/types/api';

interface ProgressSummaryProps {
  habits: HabitResponse[];
  completions: Record<number, CompletionResponse[]>;
  streaks: Record<number, StreakResponse>;
}

interface SummaryStats {
  totalHabits: number;
  activeHabits: number;
  todayCompletions: number;
  yesterdayCompletions: number;
  weekCompletions: number;
  totalCompletions: number;
  longestStreak: number;
  averageStreak: number;
  completionRate: number;
  weeklyCompletionRate: number;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  habits,
  completions,
  streaks,
}) => {
  const stats = useMemo((): SummaryStats => {
    const totalHabits = habits.length;
    
    // Count active habits (with current streak > 0)
    const activeHabits = habits.filter(habit => {
      const streak = streaks[habit.id];
      return streak && streak.current_streak > 0;
    }).length;

    // Count completions by time period
    let todayCompletions = 0;
    let yesterdayCompletions = 0;
    let weekCompletions = 0;
    let totalCompletions = 0;

    const today = new Date();
    const weekAgo = subDays(today, 7);

    habits.forEach(habit => {
      const habitCompletions = completions[habit.id] || [];
      totalCompletions += habitCompletions.length;

      habitCompletions.forEach(completion => {
        const completionDate = new Date(completion.completion_date);
        
        if (isToday(completionDate)) {
          todayCompletions++;
        }
        
        if (completionDate >= weekAgo) {
          weekCompletions++;
        }
      });
    });

    // Calculate streak statistics
    const streakValues = Object.values(streaks);
    const longestStreak = streakValues.reduce((max, streak) => 
      Math.max(max, streak.longest_streak || 0), 0
    );
    
    const totalCurrentStreak = streakValues.reduce((sum, streak) => 
      sum + (streak.current_streak || 0), 0
    );
    const averageStreak = totalHabits > 0 ? totalCurrentStreak / totalHabits : 0;

    // Calculate completion rates
    const daysSinceOldestHabit = habits.length > 0 
      ? Math.max(1, Math.floor(
          (Date.now() - Math.min(...habits.map(h => new Date(h.created_at).getTime()))) 
          / (1000 * 60 * 60 * 24)
        ))
      : 1;
    
    const totalPossibleCompletions = totalHabits * daysSinceOldestHabit;
    const completionRate = totalPossibleCompletions > 0 
      ? (totalCompletions / totalPossibleCompletions) * 100 
      : 0;

    const weeklyPossibleCompletions = totalHabits * 7;
    const weeklyCompletionRate = weeklyPossibleCompletions > 0 
      ? (weekCompletions / weeklyPossibleCompletions) * 100 
      : 0;

    return {
      totalHabits,
      activeHabits,
      todayCompletions,
      yesterdayCompletions,
      weekCompletions,
      totalCompletions,
      longestStreak,
      averageStreak: Math.round(averageStreak * 10) / 10,
      completionRate: Math.round(completionRate),
      weeklyCompletionRate: Math.round(weeklyCompletionRate),
    };
  }, [habits, completions, streaks]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, subtitle, icon, color = 'text-primary-600' }) => (
    <Card padding="md" className="text-center">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-3 ${color}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500">{subtitle}</div>
      )}
    </Card>
  );

  const getTodayProgress = () => {
    if (stats.totalHabits === 0) return 0;
    return Math.round((stats.todayCompletions / stats.totalHabits) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success-600';
    if (percentage >= 60) return 'text-warning-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today's Progress */}
      <StatCard
        title="Today's Progress"
        value={`${getTodayProgress()}%`}
        subtitle={`${stats.todayCompletions} of ${stats.totalHabits} habits`}
        color={getProgressColor(getTodayProgress())}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* Active Habits */}
      <StatCard
        title="Active Habits"
        value={stats.activeHabits}
        subtitle={`${stats.totalHabits} total habits`}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      />

      {/* Longest Streak */}
      <StatCard
        title="Longest Streak"
        value={stats.longestStreak}
        subtitle={`${stats.averageStreak} avg current`}
        color="text-orange-600"
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
        }
      />

      {/* Weekly Performance */}
      <StatCard
        title="This Week"
        value={`${stats.weeklyCompletionRate}%`}
        subtitle={`${stats.weekCompletions} completions`}
        color={getProgressColor(stats.weeklyCompletionRate)}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />

      {/* Overall Stats */}
      <div className="md:col-span-2 lg:col-span-4">
        <Card padding="md">
          <div className="flex flex-wrap justify-around text-center">
            <div className="px-4 py-2">
              <div className="text-lg font-semibold text-gray-900">{stats.totalCompletions}</div>
              <div className="text-sm text-gray-600">Total Completions</div>
            </div>
            <div className="px-4 py-2">
              <div className="text-lg font-semibold text-gray-900">{stats.completionRate}%</div>
              <div className="text-sm text-gray-600">Overall Rate</div>
            </div>
            <div className="px-4 py-2">
              <div className="text-lg font-semibold text-gray-900">
                {stats.todayCompletions > stats.yesterdayCompletions ? '+' : ''}
                {stats.todayCompletions - stats.yesterdayCompletions}
              </div>
              <div className="text-sm text-gray-600">vs Yesterday</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProgressSummary;
