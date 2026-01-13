import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { HabitResponse, CompletionResponse, StreakResponse } from '@/types/api';

interface CategoryChartProps {
  habits: HabitResponse[];
  completions: Record<number, CompletionResponse[]>;
  streaks: Record<number, StreakResponse>;
  metric?: 'count' | 'completion_rate' | 'average_streak';
}

interface CategoryData {
  category: string;
  value: number;
  count: number;
  completionRate: number;
  averageStreak: number;
}

const CategoryChart: React.FC<CategoryChartProps> = ({
  habits,
  completions,
  streaks,
  metric = 'count',
}) => {
  const categoryData = useMemo(() => {
    // Group habits by category
    const categoryMap = new Map<string, HabitResponse[]>();
    
    habits.forEach(habit => {
      const category = habit.category || 'Uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(habit);
    });

    // Calculate metrics for each category
    const data: CategoryData[] = Array.from(categoryMap.entries()).map(([category, categoryHabits]) => {
      const count = categoryHabits.length;
      
      // Calculate completion rate
      let totalCompletions = 0;
      let totalPossibleCompletions = 0;
      
      categoryHabits.forEach(habit => {
        const habitCompletions = completions[habit.id] || [];
        totalCompletions += habitCompletions.length;
        
        // Calculate days since habit creation
        const daysSinceCreation = Math.floor(
          (Date.now() - new Date(habit.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        totalPossibleCompletions += daysSinceCreation;
      });
      
      const completionRate = totalPossibleCompletions > 0 
        ? (totalCompletions / totalPossibleCompletions) * 100 
        : 0;

      // Calculate average streak
      const totalStreak = categoryHabits.reduce((sum, habit) => {
        const streak = streaks[habit.id]?.current_streak || 0;
        return sum + streak;
      }, 0);
      const averageStreak = count > 0 ? totalStreak / count : 0;

      // Determine value based on metric
      let value: number;
      switch (metric) {
        case 'completion_rate':
          value = Math.round(completionRate);
          break;
        case 'average_streak':
          value = Math.round(averageStreak * 10) / 10; // Round to 1 decimal
          break;
        case 'count':
        default:
          value = count;
          break;
      }

      return {
        category,
        value,
        count,
        completionRate: Math.round(completionRate),
        averageStreak: Math.round(averageStreak * 10) / 10,
      };
    });

    // Sort by value descending
    return data.sort((a, b) => b.value - a.value);
  }, [habits, completions, streaks, metric]);

  // Color palette
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6b7280', // gray
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryData;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.category}</p>
          <p className="text-gray-600">Habits: {data.count}</p>
          <p className="text-primary-600">Completion Rate: {data.completionRate}%</p>
          <p className="text-success-600">Avg Streak: {data.averageStreak}</p>
        </div>
      );
    }
    return null;
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'completion_rate':
        return 'Completion Rate (%)';
      case 'average_streak':
        return 'Average Streak (days)';
      case 'count':
      default:
        return 'Number of Habits';
    }
  };

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2">No category data</p>
          <p className="text-sm">Create habits with categories to see distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, value }) => `${category}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => `${value} (${getMetricLabel()})`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
