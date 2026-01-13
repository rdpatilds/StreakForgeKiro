from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime


class CompletionBase(BaseModel):
    completion_date: date = Field(default_factory=date.today, description="Completion date")
    value: int = Field(default=1, ge=1, description="Completion value")
    notes: Optional[str] = Field(None, description="Optional notes")


class CompletionCreate(CompletionBase):
    habit_id: int = Field(..., description="Habit ID")


class CompletionUpdate(BaseModel):
    completion_date: Optional[date] = Field(None)
    value: Optional[int] = Field(None, ge=1)
    notes: Optional[str] = Field(None)


class CompletionResponse(CompletionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    habit_id: int
    created_at: datetime
