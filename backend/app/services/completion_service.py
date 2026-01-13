from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import date

from ..models.completion import Completion
from ..models.habit import Habit
from ..schemas.completion import CompletionCreate, CompletionUpdate


class CompletionService:
    def __init__(self, db: Session):
        self.db = db

    def create_completion(self, completion_data: CompletionCreate) -> Optional[Completion]:
        """Create a new completion, enforcing unique constraint per habit per day."""
        # Check if habit exists
        habit = self.db.get(Habit, completion_data.habit_id)
        if not habit:
            return None
        
        # Create completion
        completion = Completion(
            habit_id=completion_data.habit_id,
            completion_date=completion_data.completion_date,
            value=completion_data.value,
            notes=completion_data.notes
        )
        
        try:
            self.db.add(completion)
            self.db.commit()
            self.db.refresh(completion)
            return completion
        except IntegrityError:
            # Unique constraint violation - completion already exists for this day
            self.db.rollback()
            return None

    def get_completion(self, completion_id: int) -> Optional[Completion]:
        """Get a completion by ID."""
        return self.db.get(Completion, completion_id)

    def get_completions_by_habit(self, habit_id: int, skip: int = 0, limit: int = 100) -> List[Completion]:
        """Get completions for a specific habit."""
        stmt = select(Completion).where(
            Completion.habit_id == habit_id
        ).order_by(Completion.completion_date.desc()).offset(skip).limit(limit)
        return list(self.db.scalars(stmt))

    def get_completion_by_habit_and_date(self, habit_id: int, completion_date: date) -> Optional[Completion]:
        """Get completion for a specific habit and date."""
        stmt = select(Completion).where(
            and_(
                Completion.habit_id == habit_id,
                Completion.completion_date == completion_date
            )
        )
        return self.db.scalar(stmt)

    def update_completion(self, completion_id: int, completion_data: CompletionUpdate) -> Optional[Completion]:
        """Update a completion."""
        completion = self.get_completion(completion_id)
        if not completion:
            return None
        
        update_data = completion_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(completion, field, value)
        
        try:
            self.db.commit()
            self.db.refresh(completion)
            return completion
        except IntegrityError:
            # Unique constraint violation if date was changed
            self.db.rollback()
            return None

    def delete_completion(self, completion_id: int) -> bool:
        """Delete a completion."""
        completion = self.get_completion(completion_id)
        if not completion:
            return False
        
        self.db.delete(completion)
        self.db.commit()
        return True
