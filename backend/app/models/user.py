from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime
from datetime import datetime, timezone
from typing import List, TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .habit import Habit

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    habits: Mapped[List["Habit"]] = relationship("Habit", back_populates="user", cascade="all, delete-orphan")
