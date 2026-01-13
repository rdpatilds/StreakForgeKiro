from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Date, Integer, Text, ForeignKey, DateTime, UniqueConstraint
from datetime import datetime, date, timezone
from typing import Optional, TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .habit import Habit

class Completion(Base):
    __tablename__ = "habit_completions"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    completion_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    value: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Foreign Keys
    habit_id: Mapped[int] = mapped_column(ForeignKey("habits.id"), nullable=False, index=True)
    
    # Relationships
    habit: Mapped["Habit"] = relationship("Habit", back_populates="completions")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('habit_id', 'completion_date', name='unique_habit_completion_per_day'),
    )
