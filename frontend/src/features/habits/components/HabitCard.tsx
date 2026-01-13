import React, { useState } from 'react';
import { format, isToday } from 'date-fns';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { HabitResponse, CompletionCreate } from '@/types/api';
import { useHabitStore } from '@/stores/habitStore';

interface HabitCardProps {
  habit: HabitResponse;
  streak?: number;
  todayCompleted?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  streak = 0,
  todayCompleted = false,
  onEdit,
  onDelete,
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const { createCompletion, deleteCompletion, completions } = useHabitStore();

  const handleToggleCompletion = async () => {
    setIsCompleting(true);
    try {
      if (todayCompleted) {
        // Find today's completion and delete it
        const habitCompletions = completions[habit.id] || [];
        const todayCompletion = habitCompletions.find(c => 
          isToday(new Date(c.completion_date))
        );
        if (todayCompletion) {
          await deleteCompletion(todayCompletion.id, habit.id);
        }
      } else {
        // Create new completion for today
        const completionData: CompletionCreate = {
          habit_id: habit.id,
          completion_date: format(new Date(), 'yyyy-MM-dd'),
          value: habit.target_value,
        };
        await createCompletion(completionData);
      }
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const getGoalTypeDisplay = (goalType: string) => {
    switch (goalType) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'custom': return 'Custom';
      default: return goalType;
    }
  };

  return (
    <Card hover className="h-full">
      <Card.Body>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {habit.name}
            </h3>
            {habit.description && (
              <p className="text-sm text-gray-600 mb-2">
                {habit.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {habit.category && (
                <span className="bg-gray-100 px-2 py-1 rounded-full">
                  {habit.category}
                </span>
              )}
              <span>{getGoalTypeDisplay(habit.goal_type)}</span>
              <span>Target: {habit.target_value}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-1 ml-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="p-1 text-red-600 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            )}
          </div>
        </div>

        {/* Streak Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-gray-900">{streak}</span>
              <span className="text-sm text-gray-600">day streak</span>
            </div>
          </div>
          
          {/* Completion Button */}
          <Button
            variant={todayCompleted ? 'success' : 'primary'}
            size="sm"
            loading={isCompleting}
            onClick={handleToggleCompletion}
            className="min-w-[80px]"
          >
            {todayCompleted ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Done
              </>
            ) : (
              'Mark Done'
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default HabitCard;
