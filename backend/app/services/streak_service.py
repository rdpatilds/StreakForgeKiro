from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from typing import Optional
from datetime import date, timedelta, datetime, timezone

from ..models.streak import Streak
from ..models.completion import Completion
from ..models.habit import Habit


class StreakService:
    def __init__(self, db: Session):
        self.db = db

    def get_streak(self, habit_id: int) -> Optional[Streak]:
        """Get streak for a specific habit."""
        stmt = select(Streak).where(Streak.habit_id == habit_id)
        return self.db.scalar(stmt)

    def calculate_and_update_streak(self, habit_id: int) -> Optional[Streak]:
        """Calculate and update streak for a habit based on completions."""
        # Get or create streak
        streak = self.get_streak(habit_id)
        if not streak:
            # Create new streak if it doesn't exist
            streak = Streak(habit_id=habit_id)
            self.db.add(streak)
        
        # Get all completions for this habit, ordered by date desc
        completions_stmt = select(Completion).where(
            Completion.habit_id == habit_id
        ).order_by(Completion.completion_date.desc())
        completions = list(self.db.scalars(completions_stmt))
        
        if not completions:
            # No completions, reset streak
            streak.current_streak = 0
            streak.last_completion = None
        else:
            # Calculate current streak using timezone-aware date
            current_streak = 0
            today = datetime.now(timezone.utc).date()
            
            # Start from the most recent completion
            completion_dates = [c.completion_date for c in completions]
            
            # Check if there's a completion today or yesterday to start counting
            if completion_dates[0] == today or completion_dates[0] == today - timedelta(days=1):
                expected_date = completion_dates[0]
                
                for completion_date in completion_dates:
                    if completion_date == expected_date:
                        current_streak += 1
                        expected_date -= timedelta(days=1)
                    else:
                        # Gap found, stop counting
                        break
            
            streak.current_streak = current_streak
            streak.last_completion = completion_dates[0] if completion_dates else None
            
            # Update longest streak if current is higher
            if current_streak > streak.longest_streak:
                streak.longest_streak = current_streak
        
        self.db.commit()
        self.db.refresh(streak)
        return streak

    def get_streak_by_habit_id(self, habit_id: int) -> Optional[Streak]:
        """Get streak by habit ID, calculating if necessary."""
        # Check if habit exists
        habit = self.db.get(Habit, habit_id)
        if not habit:
            return None
        
        # Get existing streak or calculate new one
        streak = self.get_streak(habit_id)
        if not streak:
            # Calculate and create streak
            return self.calculate_and_update_streak(habit_id)
        
        return streak

    def recalculate_streak_after_completion_change(self, habit_id: int) -> Optional[Streak]:
        """Recalculate streak after a completion is added, updated, or deleted."""
        return self.calculate_and_update_streak(habit_id)
