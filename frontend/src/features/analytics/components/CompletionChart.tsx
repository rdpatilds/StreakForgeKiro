import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { HabitResponse, CompletionResponse } from '@/types/api';

interface CompletionChartProps {
  habits: HabitResponse[];
  completions: Record<number, CompletionResponse[]>;
  period?: 'daily' | 'weekly';
  days?: number;
}

interface ChartDataPoint {
  period: string;
  completions: number;
  totalHabits: number;
  completionRate: number;
}

const CompletionChart: React.FC<CompletionChartProps> = ({
  habits,
  completions,
  period = 'daily',
  days = 30,
}) => {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);

    let intervals: Date[];
    let formatString: string;

    if (period === 'weekly') {
      const startWeek = startOfWeek(startDate);
      const endWeek = endOfWeek(endDate);
      intervals = eachWeekOfInterval({ start: startWeek, end: endWeek });
      formatString = 'MMM dd';
    } else {
      intervals = eachDayOfInterval({ start: startDate, end: endDate });
      formatString = 'MMM dd';
    }

    const data: ChartDataPoint[] = intervals.map(date => {
      let periodCompletions = 0;
      const totalHabits = habits.length;

      if (period === 'weekly') {
        // Count completions for the entire week
        const weekStart = startOfWeek(date);
        const weekEnd = endOfWeek(date);
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

        weekDays.forEach(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          habits.forEach(habit => {
            const habitCompletions = completions[habit.id] || [];
            const hasCompletion = habitCompletions.some(c => c.completion_date === dayStr);
            if (hasCompletion) {
              periodCompletions++;
            }
          });
        });
      } else {
        // Count completions for the day
        const dateStr = format(date, 'yyyy-MM-dd');
        habits.forEach(habit => {
          const habitCompletions = completions[habit.id] || [];
          const hasCompletion = habitCompletions.some(c => c.completion_date === dateStr);
          if (hasCompletion) {
            periodCompletions++;
          }
        });
      }

      const completionRate = totalHabits > 0 ? (periodCompletions / totalHabits) * 100 : 0;

      return {
        period: format(date, formatString),
        completions: periodCompletions,
        totalHabits,
        completionRate: Math.round(completionRate),
      };
    });

    return data;
  }, [habits, completions, period, days]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-primary-600">
            Completions: {data.completions}
          </p>
          <p className="text-gray-600">
            Total Habits: {data.totalHabits}
          </p>
          <p className="text-success-600">
            Rate: {data.completionRate}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (habits.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mt-2">No completion data</p>
          <p className="text-sm">Create habits and mark them complete to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: 'Completions', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Bar 
            dataKey="completions" 
            fill="#3b82f6" 
            name="Completions"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompletionChart;
