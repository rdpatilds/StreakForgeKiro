import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { HabitResponse, CompletionResponse, HabitExport } from '@/types/api';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: HabitResponse[];
  completions: Record<number, CompletionResponse[]>;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  habits,
  completions,
}) => {
  const [selectedHabits, setSelectedHabits] = useState<number[]>([]);
  const [includeCompletions, setIncludeCompletions] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleSelectAll = () => {
    if (selectedHabits.length === habits.length) {
      setSelectedHabits([]);
    } else {
      setSelectedHabits(habits.map(h => h.id));
    }
  };

  const handleHabitToggle = (habitId: number) => {
    setSelectedHabits(prev => 
      prev.includes(habitId)
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  const generateExportData = (): HabitExport => {
    const selectedHabitData = habits.filter(h => selectedHabits.includes(h.id));
    
    let selectedCompletions: CompletionResponse[] = [];
    if (includeCompletions) {
      selectedHabits.forEach(habitId => {
        const habitCompletions = completions[habitId] || [];
        selectedCompletions.push(...habitCompletions);
      });
    }

    return {
      habits: selectedHabitData,
      completions: selectedCompletions,
      exported_at: new Date().toISOString(),
      version: '1.0.0',
    };
  };

  const handleExport = async () => {
    if (selectedHabits.length === 0) {
      alert('Please select at least one habit to export.');
      return;
    }

    setIsExporting(true);
    try {
      const exportData = generateExportData();
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `streakforge-habits-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export habits. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getCompletionCount = (habitId: number) => {
    return completions[habitId]?.length || 0;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Habits with Friends"
      size="lg"
    >
      <div className="space-y-6">
        {/* Description */}
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            Export your habits to share with friends! They can import your habits to get inspiration 
            for their own habit tracking journey.
          </p>
          <p className="text-xs text-gray-500">
            Note: No personal data is included. Only habit names, descriptions, and completion patterns.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Select Habits to Share
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedHabits.length === habits.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          {/* Habit Selection */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {habits.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No habits to share. Create some habits first!
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {habits.map(habit => (
                  <label
                    key={habit.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHabits.includes(habit.id)}
                      onChange={() => handleHabitToggle(habit.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {habit.name}
                          </p>
                          {habit.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {habit.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {habit.category && (
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mb-1">
                              {habit.category}
                            </span>
                          )}
                          <p className="text-xs text-gray-500">
                            {getCompletionCount(habit.id)} completions
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Include Completions Option */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeCompletions}
              onChange={(e) => setIncludeCompletions(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Include completion history
            </span>
            <span className="ml-1 text-xs text-gray-500">
              (helps friends see your progress patterns)
            </span>
          </label>
        </div>

        {/* Export Summary */}
        {selectedHabits.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Export Summary:</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              <li>• {selectedHabits.length} habit{selectedHabits.length !== 1 ? 's' : ''}</li>
              {includeCompletions && (
                <li>
                  • {selectedHabits.reduce((sum, id) => sum + getCompletionCount(id), 0)} completion records
                </li>
              )}
              <li>• File format: JSON</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleExport}
            variant="primary"
            loading={isExporting}
            disabled={selectedHabits.length === 0}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export & Download
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isExporting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
