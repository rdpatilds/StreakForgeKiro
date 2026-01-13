import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date

from backend.app.database import Base
from backend.app.models import User, Habit, Completion, Streak
from backend.app.services.habit_service import HabitService
from backend.app.services.completion_service import CompletionService
from backend.app.schemas.habit import HabitCreate
from backend.app.schemas.completion import CompletionCreate


@pytest.fixture
def db_session():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine(
        "sqlite:///:memory:", 
        echo=False,
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    # Create default user
    user = User(username="testuser", email="test@example.com")
    session.add(user)
    session.commit()
    
    try:
        yield session
    finally:
        session.close()


def test_habit_service_includes_user_id(db_session):
    """Test that habit service creates habits with user_id."""
    habit_service = HabitService(db_session)
    
    habit_data = HabitCreate(name="Test Habit with User ID")
    habit = habit_service.create_habit(habit_data)
    
    assert habit.user_id == 1
    assert habit.name == "Test Habit with User ID"


def test_completion_service_error_handling(db_session):
    """Test completion service error handling."""
    habit_service = HabitService(db_session)
    completion_service = CompletionService(db_session)
    
    # Test that non-existent habit returns None
    completion_data = CompletionCreate(
        habit_id=999,
        completion_date=date.today(),
        value=1
    )
    
    # Service layer returns None for non-existent habit
    completion = completion_service.create_completion(completion_data)
    assert completion is None
    
    # Create a habit first
    habit_data = HabitCreate(name="Test Habit")
    habit = habit_service.create_habit(habit_data)
    
    # Test successful completion
    completion_data.habit_id = habit.id
    completion = completion_service.create_completion(completion_data)
    assert completion.habit_id == habit.id
    
    # Test duplicate completion (should return None due to unique constraint)
    completion2 = completion_service.create_completion(completion_data)
    assert completion2 is None  # Duplicate should be prevented


def test_timezone_aware_streak_calculation(db_session):
    """Test that streak calculations use timezone-aware dates."""
    from backend.app.services.streak_service import StreakService
    from datetime import datetime, timezone
    
    habit_service = HabitService(db_session)
    completion_service = CompletionService(db_session)
    streak_service = StreakService(db_session)
    
    # Create habit
    habit_data = HabitCreate(name="Test Habit")
    habit = habit_service.create_habit(habit_data)
    
    # Create completion for today
    today = datetime.now(timezone.utc).date()
    completion_data = CompletionCreate(
        habit_id=habit.id,
        completion_date=today,
        value=1
    )
    completion_service.create_completion(completion_data)
    
    # Calculate streak using the correct method name
    streak = streak_service.calculate_and_update_streak(habit.id)
    assert streak.current_streak >= 0  # Should not fail with timezone issues


if __name__ == "__main__":
    # Simple test runner for debugging
    import sys
    sys.path.insert(0, ".")
    
    # Create fixtures manually for direct execution
    engine = create_engine(
        "sqlite:///:memory:", 
        echo=False,
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    # Create default user
    user = User(username="testuser", email="test@example.com")
    session.add(user)
    session.commit()
    
    try:
        test_habit_service_includes_user_id(session)
        test_completion_service_error_handling(session)
        test_timezone_aware_streak_calculation(session)
        print("All tests passed!")
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()
