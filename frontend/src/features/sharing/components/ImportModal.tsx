import React, { useState, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { HabitExport, HabitCreate } from '@/types/api';
import { useHabitStore } from '@/stores/habitStore';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportPreview {
  habits: Array<{
    name: string;
    description?: string;
    category?: string;
    goal_type: string;
    target_value: number;
    completions: number;
  }>;
  totalCompletions: number;
  exportedAt: string;
  version: string;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [importData, setImportData] = useState<HabitExport | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [selectedHabits, setSelectedHabits] = useState<number[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createHabit } = useHabitStore();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as HabitExport;
        
        // Validate the import data structure
        if (!validateImportData(data)) {
          setError('Invalid file format. Please select a valid StreakForge export file.');
          return;
        }

        setImportData(data);
        setPreview(generatePreview(data));
        setSelectedHabits(data.habits.map((_, index) => index));
        setError(null);
      } catch (err) {
        setError('Failed to read file. Please ensure it\'s a valid JSON file.');
        console.error('Import file parsing error:', err);
      }
    };

    reader.readAsText(file);
  };

  const validateImportData = (data: any): data is HabitExport => {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.habits) &&
      Array.isArray(data.completions) &&
      typeof data.exported_at === 'string' &&
      typeof data.version === 'string' &&
      data.habits.every((habit: any) => 
        typeof habit.name === 'string' &&
        typeof habit.goal_type === 'string' &&
        typeof habit.target_value === 'number'
      )
    );
  };

  const generatePreview = (data: HabitExport): ImportPreview => {
    const habits = data.habits.map(habit => {
      const habitCompletions = data.completions.filter(c => c.habit_id === habit.id);
      return {
        name: habit.name,
        description: habit.description,
        category: habit.category,
        goal_type: habit.goal_type,
        target_value: habit.target_value,
        completions: habitCompletions.length,
      };
    });

    return {
      habits,
      totalCompletions: data.completions.length,
      exportedAt: data.exported_at,
      version: data.version,
    };
  };

  const handleSelectAll = () => {
    if (!preview) return;
    
    if (selectedHabits.length === preview.habits.length) {
      setSelectedHabits([]);
    } else {
      setSelectedHabits(preview.habits.map((_, index) => index));
    }
  };

  const handleHabitToggle = (index: number) => {
    setSelectedHabits(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleImport = async () => {
    if (!importData || !preview || selectedHabits.length === 0) return;

    setIsImporting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const index of selectedHabits) {
        const habit = importData.habits[index];
        
        try {
          const habitData: HabitCreate = {
            name: `${habit.name} (imported)`,
            description: habit.description 
              ? `${habit.description}\n\nImported from friend's habits on ${new Date(importData.exported_at).toLocaleDateString()}`
              : `Imported from friend's habits on ${new Date(importData.exported_at).toLocaleDateString()}`,
            category: habit.category,
            goal_type: habit.goal_type as any,
            target_value: habit.target_value,
          };

          await createHabit(habitData);
          successCount++;
        } catch (error) {
          console.error(`Failed to import habit: ${habit.name}`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        alert(`Successfully imported ${successCount} habit${successCount !== 1 ? 's' : ''}!${errorCount > 0 ? ` ${errorCount} failed to import.` : ''}`);
        onClose();
        resetState();
      } else {
        setError('Failed to import any habits. Please try again.');
      }
    } catch (error) {
      console.error('Import process failed:', error);
      setError('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const resetState = () => {
    setImportData(null);
    setPreview(null);
    setSelectedHabits([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Habits from Friends"
      size="lg"
    >
      <div className="space-y-6">
        {/* Description */}
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            Import habits shared by your friends to get inspiration for your own habit tracking!
          </p>
          <p className="text-xs text-gray-500">
            Select a StreakForge export file (.json) to preview and import habits.
          </p>
        </div>

        {/* File Upload */}
        {!preview && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Choose a file to import
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    JSON files up to 10MB
                  </span>
                </label>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="sr-only"
                />
              </div>
            </div>
            
            <div className="text-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="primary"
              >
                Select Import File
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Import Preview</h3>
                <p className="text-sm text-gray-500">
                  Exported on {new Date(preview.exportedAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedHabits.length === preview.habits.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {/* Habits List */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="divide-y divide-gray-200">
                {preview.habits.map((habit, index) => (
                  <label
                    key={index}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHabits.includes(index)}
                      onChange={() => handleHabitToggle(index)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {habit.name}
                          </p>
                          {habit.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
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
                            {habit.completions} completions
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Import Summary */}
            {selectedHabits.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Ready to import:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• {selectedHabits.length} habit{selectedHabits.length !== 1 ? 's' : ''}</li>
                  <li>• Habits will be marked as "(imported)" to distinguish them</li>
                  <li>• You can edit or delete imported habits after import</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {preview ? (
            <>
              <Button
                onClick={handleImport}
                variant="primary"
                loading={isImporting}
                disabled={selectedHabits.length === 0}
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Import Selected Habits
              </Button>
              <Button
                onClick={resetState}
                variant="secondary"
                disabled={isImporting}
              >
                Choose Different File
              </Button>
            </>
          ) : (
            <Button
              onClick={handleClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImportModal;
