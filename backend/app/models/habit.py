from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Integer, ForeignKey, Enum, DateTime
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
import enum

from ..database import Base

if TYPE_CHECKING:
    from .user import User
    from .completion import Completion
    from .streak import Streak

class GoalType(enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    CUSTOM = "custom"

class Habit(Base):
    __tablename__ = "habits"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    goal_type: Mapped[GoalType] = mapped_column(Enum(GoalType), default=GoalType.DAILY, nullable=False)
    target_value: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="habits")
    completions: Mapped[List["Completion"]] = relationship("Completion", back_populates="habit", cascade="all, delete-orphan")
    streak: Mapped[Optional["Streak"]] = relationship("Streak", back_populates="habit", uselist=False, cascade="all, delete-orphan")
