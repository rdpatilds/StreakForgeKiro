from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..services.completion_service import CompletionService
from ..services.streak_service import StreakService
from ..schemas.completion import CompletionCreate, CompletionUpdate, CompletionResponse

router = APIRouter(prefix="/completions", tags=["completions"])


@router.post("/", response_model=CompletionResponse, status_code=status.HTTP_201_CREATED)
def create_completion(
    completion_data: CompletionCreate,
    db: Session = Depends(get_db)
):
    """Create a new completion."""
    service = CompletionService(db)
    
    # Check if habit exists first
    from ..services.habit_service import HabitService
    habit_service = HabitService(db)
    if not habit_service.get_habit(completion_data.habit_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    completion = service.create_completion(completion_data)
    
    if not completion:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Completion already exists for this habit on this date"
        )
    
    # Update streak after creating completion
    streak_service = StreakService(db)
    streak_service.recalculate_streak_after_completion_change(completion.habit_id)
    
    return completion


@router.get("/habit/{habit_id}", response_model=List[CompletionResponse])
def get_completions_by_habit(
    habit_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get completions for a specific habit."""
    service = CompletionService(db)
    completions = service.get_completions_by_habit(habit_id, skip=skip, limit=limit)
    return completions


@router.get("/{completion_id}", response_model=CompletionResponse)
def get_completion(
    completion_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific completion by ID."""
    service = CompletionService(db)
    completion = service.get_completion(completion_id)
    if not completion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Completion not found"
        )
    return completion


@router.put("/{completion_id}", response_model=CompletionResponse)
def update_completion(
    completion_id: int,
    completion_data: CompletionUpdate,
    db: Session = Depends(get_db)
):
    """Update a completion."""
    service = CompletionService(db)
    
    # Get original completion to track habit_id for streak update
    original_completion = service.get_completion(completion_id)
    if not original_completion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Completion not found"
        )
    
    completion = service.update_completion(completion_id, completion_data)
    if not completion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update failed - possibly duplicate date for habit"
        )
    
    # Update streak after modifying completion
    streak_service = StreakService(db)
    streak_service.recalculate_streak_after_completion_change(completion.habit_id)
    
    return completion


@router.delete("/{completion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_completion(
    completion_id: int,
    db: Session = Depends(get_db)
):
    """Delete a completion."""
    service = CompletionService(db)
    
    # Get completion to track habit_id for streak update
    completion = service.get_completion(completion_id)
    if not completion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Completion not found"
        )
    
    habit_id = completion.habit_id
    success = service.delete_completion(completion_id)
    
    if success:
        # Update streak after deleting completion
        streak_service = StreakService(db)
        streak_service.recalculate_streak_after_completion_change(habit_id)
