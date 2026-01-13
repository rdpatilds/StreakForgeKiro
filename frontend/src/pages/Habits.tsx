import React, { useState } from 'react';
import { useHabits } from '@/features/habits/hooks/useHabits';
import HabitList from '@/features/habits/components/HabitList';
import HabitForm from '@/features/habits/components/HabitForm';
import ShareModal from '@/features/sharing/components/ShareModal';
import ImportModal from '@/features/sharing/components/ImportModal';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { HabitCreate, HabitUpdate, HabitResponse } from '@/types/api';

const Habits: React.FC = () => {
  const {
    habits,
    completions,
    streaks,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    clearError,
  } = useHabits();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<HabitResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateHabit = () => {
    setShowCreateModal(true);
  };

  const handleEditHabit = (habit: HabitResponse) => {
    setSelectedHabit(habit);
    setShowEditModal(true);
  };

  const handleDeleteHabit = (habit: HabitResponse) => {
    setSelectedHabit(habit);
    setShowDeleteModal(true);
  };

  const handleSubmitCreate = async (data: HabitCreate | HabitUpdate) => {
    setIsSubmitting(true);
    try {
      const success = await createHabit(data as HabitCreate);
      if (success) {
        setShowCreateModal(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (data: HabitCreate | HabitUpdate) => {
    if (!selectedHabit) return;
    
    setIsSubmitting(true);
    try {
      const success = await updateHabit(selectedHabit.id, data as HabitUpdate);
      if (success) {
        setShowEditModal(false);
        setSelectedHabit(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedHabit) return;
    
    setIsSubmitting(true);
    try {
      const success = await deleteHabit(selectedHabit.id);
      if (success) {
        setShowDeleteModal(false);
        setSelectedHabit(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedHabit(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Habits</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your habits and track your progress
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Button
            onClick={() => setShowImportModal(true)}
            variant="secondary"
            size="sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Import
          </Button>
          
          <Button
            onClick={() => setShowShareModal(true)}
            variant="secondary"
            size="sm"
            disabled={habits.length === 0}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share
          </Button>
          
          <Button onClick={handleCreateHabit} variant="primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Habit
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex justify-between items-start">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-600 hover:text-red-700"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Habits List */}
      <HabitList
        habits={habits}
        completions={completions}
        streaks={streaks}
        loading={loading}
        onCreateHabit={handleCreateHabit}
        onEditHabit={handleEditHabit}
        onDeleteHabit={handleDeleteHabit}
      />

      {/* Create Habit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        title="Create New Habit"
      >
        <HabitForm
          onSubmit={handleSubmitCreate}
          onCancel={handleCloseModals}
          loading={isSubmitting}
        />
      </Modal>

      {/* Edit Habit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        title="Edit Habit"
      >
        {selectedHabit && (
          <HabitForm
            habit={selectedHabit}
            onSubmit={handleSubmitEdit}
            onCancel={handleCloseModals}
            loading={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseModals}
        title="Delete Habit"
        size="sm"
      >
        {selectedHabit && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                Are you sure you want to delete <strong>"{selectedHabit.name}"</strong>?
              </p>
              <p className="text-red-600">
                This action cannot be undone. All completion history for this habit will be permanently deleted.
              </p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleConfirmDelete}
                variant="danger"
                loading={isSubmitting}
                className="flex-1"
              >
                Delete Habit
              </Button>
              <Button
                onClick={handleCloseModals}
                variant="secondary"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        habits={habits}
        completions={completions}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
};

export default Habits;
