from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.streak_service import StreakService
from ..schemas.streak import StreakResponse

router = APIRouter(prefix="/streaks", tags=["streaks"])


@router.get("/{habit_id}", response_model=StreakResponse)
def get_streak(
    habit_id: int,
    db: Session = Depends(get_db)
):
    """Get streak for a specific habit."""
    service = StreakService(db)
    streak = service.get_streak_by_habit_id(habit_id)
    if not streak:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return streak


@router.post("/{habit_id}/recalculate", response_model=StreakResponse)
def recalculate_streak(
    habit_id: int,
    db: Session = Depends(get_db)
):
    """Manually recalculate streak for a habit."""
    service = StreakService(db)
    streak = service.calculate_and_update_streak(habit_id)
    if not streak:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return streak
