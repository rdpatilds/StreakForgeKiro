from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime


class StreakResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    habit_id: int
    current_streak: int = Field(description="Current streak count")
    longest_streak: int = Field(description="Longest streak achieved")
    last_completion: Optional[date] = Field(description="Last completion date")
    updated_at: datetime
