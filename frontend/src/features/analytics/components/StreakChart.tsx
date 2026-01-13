import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { HabitResponse, CompletionResponse } from '@/types/api';

interface StreakChartProps {
  habits: HabitResponse[];
  completions: Record<number, CompletionResponse[]>;
  selectedHabitIds?: number[];
  days?: number;
}

interface ChartDataPoint {
  date: string;
  [key: string]: string | number; // Dynamic habit streak values
}

const StreakChart: React.FC<StreakChartProps> = ({
  habits,
  completions,
  selectedHabitIds,
  days = 30,
}) => {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Filter habits to display
    const habitsToShow = selectedHabitIds 
      ? habits.filter(h => selectedHabitIds.includes(h.id))
      : habits.slice(0, 5); // Show max 5 habits for readability

    // Create data points for each date
    const data: ChartDataPoint[] = dateRange.map(date => {
      const displayDate = format(date, 'MMM dd');
      
      const dataPoint: ChartDataPoint = { date: displayDate };

      // Calculate streak for each habit on this date
      habitsToShow.forEach(habit => {
        const habitCompletions = completions[habit.id] || [];
        
        // Calculate streak up to this date
        let streak = 0;
        let currentDate = new Date(date);
        
        // Count consecutive days backwards from current date
        while (currentDate >= new Date(habit.created_at)) {
          const checkDateStr = format(currentDate, 'yyyy-MM-dd');
          const hasCompletion = habitCompletions.some(c => 
            c.completion_date === checkDateStr
          );
          
          if (hasCompletion) {
            streak++;
            currentDate = subDays(currentDate, 1);
          } else {
            break;
          }
        }

        dataPoint[habit.name] = streak;
      });

      return dataPoint;
    });

    return data;
  }, [habits, completions, selectedHabitIds, days]);

  const habitsToShow = useMemo(() => {
    return selectedHabitIds 
      ? habits.filter(h => selectedHabitIds.includes(h.id))
      : habits.slice(0, 5);
  }, [habits, selectedHabitIds]);

  // Color palette for different habits
  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
  ];

  if (habitsToShow.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2">No habits to display</p>
          <p className="text-sm">Create some habits to see streak progression</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: 'Streak Days', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          
          {habitsToShow.map((habit, index) => (
            <Line
              key={habit.id}
              type="monotone"
              dataKey={habit.name}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StreakChart;
