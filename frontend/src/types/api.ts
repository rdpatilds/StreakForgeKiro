// TypeScript interfaces matching backend Pydantic schemas

export enum GoalType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  CUSTOM = 'custom',
}

// Habit interfaces
export interface HabitBase {
  name: string;
  description?: string;
  category?: string;
  goal_type: GoalType;
  target_value: number;
}

export interface HabitCreate extends HabitBase {}

export interface HabitUpdate {
  name?: string;
  description?: string;
  category?: string;
  goal_type?: GoalType;
  target_value?: number;
}

export interface HabitResponse extends HabitBase {
  id: number;
  user_id: number;
  created_at: string;
}

// Completion interfaces
export interface CompletionBase {
  completion_date: string; // ISO date string
  value: number;
  notes?: string;
}

export interface CompletionCreate extends CompletionBase {
  habit_id: number;
}

export interface CompletionUpdate {
  completion_date?: string;
  value?: number;
  notes?: string;
}

export interface CompletionResponse extends CompletionBase {
  id: number;
  habit_id: number;
  created_at: string;
}

// Streak interfaces
export interface StreakResponse {
  id: number;
  habit_id: number;
  current_streak: number;
  longest_streak: number;
  last_completion?: string; // ISO date string
  updated_at: string;
}

// API Error interface
export interface ApiError {
  detail: string;
}

// Sharing interfaces
export interface HabitExport {
  habits: HabitResponse[];
  completions: CompletionResponse[];
  exported_at: string;
  version: string;
}

// Analytics interfaces
export interface HabitStats {
  total_habits: number;
  active_habits: number;
  total_completions: number;
  average_streak: number;
  longest_streak: number;
  completion_rate: number;
}

export interface CategoryStats {
  category: string;
  habit_count: number;
  completion_rate: number;
  average_streak: number;
}

export interface StreakData {
  date: string;
  streak: number;
  habit_name: string;
}

export interface CompletionData {
  date: string;
  completions: number;
  total_habits: number;
  completion_rate: number;
}
