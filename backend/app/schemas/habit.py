from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

from ..models.habit import GoalType


class HabitBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Habit name")
    description: Optional[str] = Field(None, description="Habit description")
    category: Optional[str] = Field(None, max_length=100, description="Habit category")
    goal_type: GoalType = Field(default=GoalType.DAILY, description="Goal type")
    target_value: int = Field(default=1, ge=1, description="Target value")


class HabitCreate(HabitBase):
    pass


class HabitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None)
    category: Optional[str] = Field(None, max_length=100)
    goal_type: Optional[GoalType] = Field(None)
    target_value: Optional[int] = Field(None, ge=1)


class HabitResponse(HabitBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    created_at: datetime
