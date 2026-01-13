from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..services.habit_service import HabitService
from ..schemas.habit import HabitCreate, HabitUpdate, HabitResponse

router = APIRouter(prefix="/habits", tags=["habits"])


@router.post("/", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
def create_habit(
    habit_data: HabitCreate,
    db: Session = Depends(get_db)
):
    """Create a new habit."""
    service = HabitService(db)
    habit = service.create_habit(habit_data)
    return habit


@router.get("/", response_model=List[HabitResponse])
def get_habits(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all habits with pagination."""
    service = HabitService(db)
    habits = service.get_habits(skip=skip, limit=limit)
    return habits


@router.get("/{habit_id}", response_model=HabitResponse)
def get_habit(
    habit_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific habit by ID."""
    service = HabitService(db)
    habit = service.get_habit(habit_id)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return habit


@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(
    habit_id: int,
    habit_data: HabitUpdate,
    db: Session = Depends(get_db)
):
    """Update a habit."""
    service = HabitService(db)
    habit = service.update_habit(habit_id, habit_data)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(
    habit_id: int,
    db: Session = Depends(get_db)
):
    """Delete a habit."""
    service = HabitService(db)
    success = service.delete_habit(habit_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
