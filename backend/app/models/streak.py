from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Date, ForeignKey, DateTime
from datetime import datetime, date, timezone
from typing import Optional, TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .habit import Habit

class Streak(Base):
    __tablename__ = "streaks"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_completion: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Foreign Keys (One-to-One with Habit)
    habit_id: Mapped[int] = mapped_column(ForeignKey("habits.id"), unique=True, nullable=False, index=True)
    
    # Relationships
    habit: Mapped["Habit"] = relationship("Habit", back_populates="streak")
