from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from ..models.habit import Habit
from ..models.streak import Streak
from ..schemas.habit import HabitCreate, HabitUpdate


class HabitService:
    def __init__(self, db: Session):
        self.db = db

    def create_habit(self, habit_data: HabitCreate) -> Habit:
        """Create a new habit and initialize its streak."""
        # Create habit without user_id since no authentication
        habit = Habit(
            name=habit_data.name,
            description=habit_data.description,
            category=habit_data.category,
            goal_type=habit_data.goal_type,
            target_value=habit_data.target_value,
            user_id=1  # Default user ID since no authentication
        )
        
        # Initialize streak for the habit
        streak = Streak(habit_id=None)  # Will be set after habit is created
        
        # Add both to session and commit in single transaction
        self.db.add(habit)
        self.db.flush()  # Get habit.id without committing
        
        streak.habit_id = habit.id
        self.db.add(streak)
        self.db.commit()
        self.db.refresh(habit)
        
        return habit

    def get_habit(self, habit_id: int) -> Optional[Habit]:
        """Get a habit by ID."""
        return self.db.get(Habit, habit_id)

    def get_habits(self, skip: int = 0, limit: int = 100) -> List[Habit]:
        """Get all habits with pagination."""
        stmt = select(Habit).offset(skip).limit(limit)
        return list(self.db.scalars(stmt))

    def update_habit(self, habit_id: int, habit_data: HabitUpdate) -> Optional[Habit]:
        """Update a habit."""
        habit = self.get_habit(habit_id)
        if not habit:
            return None
        
        update_data = habit_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(habit, field, value)
        
        self.db.commit()
        self.db.refresh(habit)
        return habit

    def delete_habit(self, habit_id: int) -> bool:
        """Delete a habit."""
        habit = self.get_habit(habit_id)
        if not habit:
            return False
        
        self.db.delete(habit)
        self.db.commit()
        return True
