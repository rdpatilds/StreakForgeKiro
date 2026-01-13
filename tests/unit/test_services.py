import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date, datetime, timedelta

from backend.app.database import Base
from backend.app.models import User, Habit, Completion, Streak
from backend.app.models.habit import GoalType
from backend.app.services.habit_service import HabitService
from backend.app.services.completion_service import CompletionService
from backend.app.services.streak_service import StreakService
from backend.app.schemas.habit import HabitCreate, HabitUpdate
from backend.app.schemas.completion import CompletionCreate, CompletionUpdate


@pytest.fixture
def db_session():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def sample_user(db_session):
    """Create a fresh user for each test."""
    user = User(username="testuser", email="test@example.com")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


class TestHabitService:
    def test_create_habit(self, db_session, sample_user):
        """Test creating a habit."""
        service = HabitService(db_session)
        habit_data = HabitCreate(
            name="Daily Exercise",
            description="30 minutes workout",
            category="fitness",
            goal_type=GoalType.DAILY,
            target_value=1
        )
        
        habit = service.create_habit(habit_data)
        
        assert habit.id is not None
        assert habit.name == "Daily Exercise"
        assert habit.description == "30 minutes workout"
        assert habit.category == "fitness"
        assert habit.goal_type == GoalType.DAILY
        assert habit.target_value == 1
        
        # Check that streak was created
        streak = db_session.query(Streak).filter(Streak.habit_id == habit.id).first()
        assert streak is not None
        assert streak.current_streak == 0
        assert streak.longest_streak == 0

    def test_get_habit(self, db_session, sample_user):
        """Test getting a habit by ID."""
        service = HabitService(db_session)
        habit_data = HabitCreate(name="Test Habit")
        created_habit = service.create_habit(habit_data)
        
        retrieved_habit = service.get_habit(created_habit.id)
        assert retrieved_habit is not None
        assert retrieved_habit.id == created_habit.id
        assert retrieved_habit.name == "Test Habit"

    def test_get_habits(self, db_session, sample_user):
        """Test getting all habits with pagination."""
        service = HabitService(db_session)
        
        # Create multiple habits
        for i in range(5):
            habit_data = HabitCreate(name=f"Habit {i}")
            service.create_habit(habit_data)
        
        habits = service.get_habits(skip=0, limit=3)
        assert len(habits) == 3
        
        habits_all = service.get_habits(skip=0, limit=10)
        assert len(habits_all) == 5

    def test_update_habit(self, db_session, sample_user):
        """Test updating a habit."""
        service = HabitService(db_session)
        habit_data = HabitCreate(name="Original Name")
        habit = service.create_habit(habit_data)
        
        update_data = HabitUpdate(name="Updated Name", description="New description")
        updated_habit = service.update_habit(habit.id, update_data)
        
        assert updated_habit is not None
        assert updated_habit.name == "Updated Name"
        assert updated_habit.description == "New description"

    def test_delete_habit(self, db_session, sample_user):
        """Test deleting a habit."""
        service = HabitService(db_session)
        habit_data = HabitCreate(name="To Delete")
        habit = service.create_habit(habit_data)
        
        success = service.delete_habit(habit.id)
        assert success is True
        
        # Verify habit is deleted
        deleted_habit = service.get_habit(habit.id)
        assert deleted_habit is None


class TestCompletionService:
    def test_create_completion(self, db_session, sample_user):
        """Test creating a completion."""
        # Create a habit first
        habit_service = HabitService(db_session)
        habit = habit_service.create_habit(HabitCreate(name="Test Habit"))
        
        service = CompletionService(db_session)
        completion_data = CompletionCreate(
            habit_id=habit.id,
            completion_date=date.today(),
            value=1,
            notes="Completed successfully"
        )
        
        completion = service.create_completion(completion_data)
        
        assert completion is not None
        assert completion.habit_id == habit.id
        assert completion.completion_date == date.today()
        assert completion.value == 1
        assert completion.notes == "Completed successfully"

    def test_create_duplicate_completion(self, db_session, sample_user):
        """Test that duplicate completions for same day are rejected."""
        # Create a habit first
        habit_service = HabitService(db_session)
        habit = habit_service.create_habit(HabitCreate(name="Test Habit"))
        
        service = CompletionService(db_session)
        completion_data = CompletionCreate(
            habit_id=habit.id,
            completion_date=date.today(),
            value=1
        )
        
        # Create first completion
        completion1 = service.create_completion(completion_data)
        assert completion1 is not None
        
        # Try to create duplicate
        completion2 = service.create_completion(completion_data)
        assert completion2 is None

    def test_get_completions_by_habit(self, db_session, sample_user):
        """Test getting completions for a specific habit."""
        # Create a habit first
        habit_service = HabitService(db_session)
        habit = habit_service.create_habit(HabitCreate(name="Test Habit"))
        
        service = CompletionService(db_session)
        
        # Create multiple completions
        for i in range(3):
            completion_data = CompletionCreate(
                habit_id=habit.id,
                completion_date=date.today() - timedelta(days=i),
                value=1
            )
            service.create_completion(completion_data)
        
        completions = service.get_completions_by_habit(habit.id)
        assert len(completions) == 3


class TestStreakService:
    def test_calculate_streak_no_completions(self, db_session, sample_user):
        """Test streak calculation with no completions."""
        # Create a habit first
        habit_service = HabitService(db_session)
        habit = habit_service.create_habit(HabitCreate(name="Test Habit"))
        
        service = StreakService(db_session)
        streak = service.calculate_and_update_streak(habit.id)
        
        assert streak is not None
        assert streak.current_streak == 0
        assert streak.longest_streak == 0
        assert streak.last_completion is None

    def test_calculate_streak_with_consecutive_days(self, db_session, sample_user):
        """Test streak calculation with consecutive completions."""
        # Create a habit first
        habit_service = HabitService(db_session)
        habit = habit_service.create_habit(HabitCreate(name="Test Habit"))
        
        # Create consecutive completions
        completion_service = CompletionService(db_session)
        today = date.today()
        
        for i in range(3):
            completion_data = CompletionCreate(
                habit_id=habit.id,
                completion_date=today - timedelta(days=i),
                value=1
            )
            completion_service.create_completion(completion_data)
        
        service = StreakService(db_session)
        streak = service.calculate_and_update_streak(habit.id)
        
        assert streak is not None
        assert streak.current_streak == 3
        assert streak.longest_streak == 3
        assert streak.last_completion == today

    def test_calculate_streak_with_gap(self, db_session, sample_user):
        """Test streak calculation with gap in completions."""
        # Create a habit first
        habit_service = HabitService(db_session)
        habit = habit_service.create_habit(HabitCreate(name="Test Habit"))
        
        # Create completions with a gap
        completion_service = CompletionService(db_session)
        today = date.today()
        
        # Recent completions (2 days)
        for i in range(2):
            completion_data = CompletionCreate(
                habit_id=habit.id,
                completion_date=today - timedelta(days=i),
                value=1
            )
            completion_service.create_completion(completion_data)
        
        # Gap of 2 days, then older completion
        completion_data = CompletionCreate(
            habit_id=habit.id,
            completion_date=today - timedelta(days=4),
            value=1
        )
        completion_service.create_completion(completion_data)
        
        service = StreakService(db_session)
        streak = service.calculate_and_update_streak(habit.id)
        
        assert streak is not None
        assert streak.current_streak == 2  # Only recent consecutive days
        assert streak.longest_streak == 2
