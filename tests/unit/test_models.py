import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date, datetime

from backend.app.database import Base
from backend.app.models import User, Habit, Completion, Streak
from backend.app.models.habit import GoalType

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
    """Create a sample user for testing."""
    user = User(username="testuser", email="test@example.com")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def sample_habit(db_session, sample_user):
    """Create a sample habit for testing."""
    habit = Habit(
        name="Daily Exercise",
        description="30 minutes of exercise",
        category="fitness",
        goal_type=GoalType.DAILY,
        target_value=1,
        user_id=sample_user.id
    )
    db_session.add(habit)
    db_session.commit()
    db_session.refresh(habit)
    return habit

class TestUser:
    def test_create_user(self, db_session):
        """Test creating a user."""
        user = User(username="newuser", email="new@example.com")
        db_session.add(user)
        db_session.commit()
        
        assert user.id is not None
        assert user.username == "newuser"
        assert user.email == "new@example.com"
        assert user.created_at is not None

    def test_user_unique_constraints(self, db_session, sample_user):
        """Test that username and email must be unique."""
        # Try to create user with same username
        with pytest.raises(Exception):
            duplicate_user = User(username=sample_user.username, email="different@example.com")
            db_session.add(duplicate_user)
            db_session.commit()

class TestHabit:
    def test_create_habit(self, db_session, sample_user):
        """Test creating a habit."""
        habit = Habit(
            name="Read Books",
            description="Read for 30 minutes",
            category="education",
            goal_type=GoalType.DAILY,
            target_value=30,
            user_id=sample_user.id
        )
        db_session.add(habit)
        db_session.commit()
        
        assert habit.id is not None
        assert habit.name == "Read Books"
        assert habit.goal_type == GoalType.DAILY
        assert habit.user_id == sample_user.id

    def test_habit_user_relationship(self, db_session, sample_habit, sample_user):
        """Test the relationship between habit and user."""
        assert sample_habit.user.id == sample_user.id
        assert sample_habit in sample_user.habits

class TestCompletion:
    def test_create_completion(self, db_session, sample_habit):
        """Test creating a completion."""
        completion = Completion(
            habit_id=sample_habit.id,
            completion_date=date.today(),
            value=1,
            notes="Completed successfully"
        )
        db_session.add(completion)
        db_session.commit()
        
        assert completion.id is not None
        assert completion.habit_id == sample_habit.id
        assert completion.completion_date == date.today()
        assert completion.value == 1

    def test_completion_unique_constraint(self, db_session, sample_habit):
        """Test that only one completion per habit per day is allowed."""
        # Create first completion
        completion1 = Completion(
            habit_id=sample_habit.id,
            completion_date=date.today(),
            value=1
        )
        db_session.add(completion1)
        db_session.commit()
        
        # Try to create duplicate completion for same day
        with pytest.raises(Exception):
            completion2 = Completion(
                habit_id=sample_habit.id,
                completion_date=date.today(),
                value=1
            )
            db_session.add(completion2)
            db_session.commit()

    def test_completion_habit_relationship(self, db_session, sample_habit):
        """Test the relationship between completion and habit."""
        completion = Completion(
            habit_id=sample_habit.id,
            completion_date=date.today(),
            value=1
        )
        db_session.add(completion)
        db_session.commit()
        
        assert completion.habit.id == sample_habit.id
        assert completion in sample_habit.completions

class TestStreak:
    def test_create_streak(self, db_session, sample_habit):
        """Test creating a streak."""
        streak = Streak(
            habit_id=sample_habit.id,
            current_streak=5,
            longest_streak=10,
            last_completion=date.today()
        )
        db_session.add(streak)
        db_session.commit()
        
        assert streak.id is not None
        assert streak.habit_id == sample_habit.id
        assert streak.current_streak == 5
        assert streak.longest_streak == 10

    def test_streak_habit_relationship(self, db_session, sample_habit):
        """Test the one-to-one relationship between streak and habit."""
        streak = Streak(
            habit_id=sample_habit.id,
            current_streak=3,
            longest_streak=5
        )
        db_session.add(streak)
        db_session.commit()
        
        assert streak.habit.id == sample_habit.id
        assert sample_habit.streak.id == streak.id

    def test_streak_unique_constraint(self, db_session, sample_habit):
        """Test that only one streak per habit is allowed."""
        # Create first streak
        streak1 = Streak(habit_id=sample_habit.id, current_streak=1, longest_streak=1)
        db_session.add(streak1)
        db_session.commit()
        
        # Try to create duplicate streak for same habit
        with pytest.raises(Exception):
            streak2 = Streak(habit_id=sample_habit.id, current_streak=2, longest_streak=2)
            db_session.add(streak2)
            db_session.commit()

class TestModelIntegration:
    def test_cascade_delete_user(self, db_session, sample_user, sample_habit):
        """Test that deleting a user cascades to habits."""
        habit_id = sample_habit.id
        
        # Delete user
        db_session.delete(sample_user)
        db_session.commit()
        
        # Habit should be deleted too
        deleted_habit = db_session.get(Habit, habit_id)
        assert deleted_habit is None

    def test_cascade_delete_habit(self, db_session, sample_habit):
        """Test that deleting a habit cascades to completions and streaks."""
        # Create completion and streak
        completion = Completion(habit_id=sample_habit.id, completion_date=date.today(), value=1)
        streak = Streak(habit_id=sample_habit.id, current_streak=1, longest_streak=1)
        db_session.add_all([completion, streak])
        db_session.commit()
        
        completion_id = completion.id
        streak_id = streak.id
        
        # Delete habit
        db_session.delete(sample_habit)
        db_session.commit()
        
        # Completion and streak should be deleted too
        deleted_completion = db_session.get(Completion, completion_id)
        deleted_streak = db_session.get(Streak, streak_id)
        assert deleted_completion is None
        assert deleted_streak is None
