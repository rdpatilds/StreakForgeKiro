import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { HabitCreate, HabitUpdate, HabitResponse, GoalType } from '@/types/api';

interface HabitFormProps {
  habit?: HabitResponse;
  onSubmit: (data: HabitCreate | HabitUpdate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const HabitForm: React.FC<HabitFormProps> = ({
  habit,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    goal_type: GoalType.DAILY,
    target_value: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with habit data if editing
  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        description: habit.description || '',
        category: habit.category || '',
        goal_type: habit.goal_type,
        target_value: habit.target_value,
      });
    }
  }, [habit]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Habit name must be less than 255 characters';
    }

    if (formData.category && formData.category.length > 100) {
      newErrors.category = 'Category must be less than 100 characters';
    }

    if (formData.target_value < 1) {
      newErrors.target_value = 'Target value must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        description: formData.description || undefined,
        category: formData.category || undefined,
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Habit Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Morning Exercise, Read for 30 minutes"
          maxLength={255}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Optional description of your habit..."
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <input
          type="text"
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Health, Learning, Productivity"
          maxLength={100}
        />
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Goal Type */}
      <div>
        <label htmlFor="goal_type" className="block text-sm font-medium text-gray-700 mb-1">
          Goal Type
        </label>
        <select
          id="goal_type"
          value={formData.goal_type}
          onChange={(e) => handleChange('goal_type', e.target.value as GoalType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value={GoalType.DAILY}>Daily</option>
          <option value={GoalType.WEEKLY}>Weekly</option>
          <option value={GoalType.CUSTOM}>Custom</option>
        </select>
      </div>

      {/* Target Value */}
      <div>
        <label htmlFor="target_value" className="block text-sm font-medium text-gray-700 mb-1">
          Target Value
        </label>
        <input
          type="number"
          id="target_value"
          value={formData.target_value}
          onChange={(e) => handleChange('target_value', parseInt(e.target.value) || 1)}
          min="1"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.target_value ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.target_value && (
          <p className="mt-1 text-sm text-red-600">{errors.target_value}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          How many times you want to complete this habit per {formData.goal_type} period
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="flex-1"
        >
          {habit ? 'Update Habit' : 'Create Habit'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default HabitForm;
