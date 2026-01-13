import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date

from backend.app.main import app
from backend.app.database import Base, get_db
from backend.app.models import User


@pytest.fixture(scope="module")
def test_db():
    """Create test database."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create default user for testing
    session = SessionLocal()
    user = User(username="testuser", email="test@example.com")
    session.add(user)
    session.commit()
    session.close()
    
    return SessionLocal


@pytest.fixture(scope="module")
def client(test_db):
    """Create test client with database override."""
    def override_get_db():
        session = test_db()
        try:
            yield session
        finally:
            session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    app.dependency_overrides.clear()


class TestHabitsRouter:
    def test_create_habit(self, client):
        """Test creating a habit via API."""
        habit_data = {
            "name": "Daily Exercise",
            "description": "30 minutes workout",
            "category": "fitness",
            "goal_type": "daily",
            "target_value": 1
        }
        
        response = client.post("/api/v1/habits/", json=habit_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Daily Exercise"
        assert data["description"] == "30 minutes workout"
        assert data["category"] == "fitness"
        assert data["goal_type"] == "daily"
        assert data["target_value"] == 1
        assert "id" in data
        assert "created_at" in data

    def test_get_habits(self, client):
        """Test getting all habits."""
        # Create a habit first
        habit_data = {"name": "Test Habit"}
        client.post("/api/v1/habits/", json=habit_data)
        
        response = client.get("/api/v1/habits/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_habit_by_id(self, client):
        """Test getting a specific habit."""
        # Create a habit first
        habit_data = {"name": "Specific Habit"}
        create_response = client.post("/api/v1/habits/", json=habit_data)
        habit_id = create_response.json()["id"]
        
        response = client.get(f"/api/v1/habits/{habit_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Specific Habit"
        assert data["id"] == habit_id

    def test_get_nonexistent_habit(self, client):
        """Test getting a habit that doesn't exist."""
        response = client.get("/api/v1/habits/99999")
        
        assert response.status_code == 404
        assert "Habit not found" in response.json()["detail"]

    def test_update_habit(self, client):
        """Test updating a habit."""
        # Create a habit first
        habit_data = {"name": "Original Name"}
        create_response = client.post("/api/v1/habits/", json=habit_data)
        habit_id = create_response.json()["id"]
        
        # Update the habit
        update_data = {"name": "Updated Name", "description": "New description"}
        response = client.put(f"/api/v1/habits/{habit_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["description"] == "New description"

    def test_delete_habit(self, client):
        """Test deleting a habit."""
        # Create a habit first
        habit_data = {"name": "To Delete"}
        create_response = client.post("/api/v1/habits/", json=habit_data)
        habit_id = create_response.json()["id"]
        
        # Delete the habit
        response = client.delete(f"/api/v1/habits/{habit_id}")
        
        assert response.status_code == 204
        
        # Verify it's deleted
        get_response = client.get(f"/api/v1/habits/{habit_id}")
        assert get_response.status_code == 404


class TestCompletionsRouter:
    def test_create_completion(self, client):
        """Test creating a completion via API."""
        # Create a habit first
        habit_data = {"name": "Test Habit"}
        habit_response = client.post("/api/v1/habits/", json=habit_data)
        habit_id = habit_response.json()["id"]
        
        # Create completion
        completion_data = {
            "habit_id": habit_id,
            "completion_date": str(date.today()),
            "value": 1,
            "notes": "Completed successfully"
        }
        
        response = client.post("/api/v1/completions/", json=completion_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["habit_id"] == habit_id
        assert data["value"] == 1
        assert data["notes"] == "Completed successfully"
        assert "id" in data

    def test_create_duplicate_completion(self, client):
        """Test that duplicate completions are rejected."""
        # Create a habit first
        habit_data = {"name": "Test Habit Dup"}
        habit_response = client.post("/api/v1/habits/", json=habit_data)
        habit_id = habit_response.json()["id"]
        
        # Create first completion
        completion_data = {
            "habit_id": habit_id,
            "completion_date": str(date.today()),
            "value": 1
        }
        
        response1 = client.post("/api/v1/completions/", json=completion_data)
        assert response1.status_code == 201
        
        # Try to create duplicate
        response2 = client.post("/api/v1/completions/", json=completion_data)
        assert response2.status_code == 400

    def test_get_completions_by_habit(self, client):
        """Test getting completions for a specific habit."""
        # Create a habit first
        habit_data = {"name": "Test Habit Completions"}
        habit_response = client.post("/api/v1/habits/", json=habit_data)
        habit_id = habit_response.json()["id"]
        
        # Create a completion
        completion_data = {
            "habit_id": habit_id,
            "completion_date": str(date.today()),
            "value": 1
        }
        client.post("/api/v1/completions/", json=completion_data)
        
        # Get completions
        response = client.get(f"/api/v1/completions/habit/{habit_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["habit_id"] == habit_id


class TestStreaksRouter:
    def test_get_streak(self, client):
        """Test getting streak for a habit."""
        # Create a habit first
        habit_data = {"name": "Test Habit Streak"}
        habit_response = client.post("/api/v1/habits/", json=habit_data)
        habit_id = habit_response.json()["id"]
        
        # Get streak (should be initialized)
        response = client.get(f"/api/v1/streaks/{habit_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["habit_id"] == habit_id
        assert data["current_streak"] == 0
        assert data["longest_streak"] == 0
        assert "id" in data

    def test_recalculate_streak(self, client):
        """Test manually recalculating streak."""
        # Create a habit first
        habit_data = {"name": "Test Habit Recalc"}
        habit_response = client.post("/api/v1/habits/", json=habit_data)
        habit_id = habit_response.json()["id"]
        
        # Create a completion
        completion_data = {
            "habit_id": habit_id,
            "completion_date": str(date.today()),
            "value": 1
        }
        client.post("/api/v1/completions/", json=completion_data)
        
        # Recalculate streak
        response = client.post(f"/api/v1/streaks/{habit_id}/recalculate")
        
        assert response.status_code == 200
        data = response.json()
        assert data["habit_id"] == habit_id
        assert data["current_streak"] >= 0  # Should be calculated based on completions

    def test_get_streak_nonexistent_habit(self, client):
        """Test getting streak for nonexistent habit."""
        response = client.get("/api/v1/streaks/99999")
        
        assert response.status_code == 404
        assert "Habit not found" in response.json()["detail"]


class TestAPIIntegration:
    def test_full_workflow(self, client):
        """Test complete workflow: create habit, add completion, check streak."""
        # 1. Create habit
        habit_data = {"name": "Daily Reading Workflow", "category": "education"}
        habit_response = client.post("/api/v1/habits/", json=habit_data)
        assert habit_response.status_code == 201
        habit_id = habit_response.json()["id"]
        
        # 2. Add completion
        completion_data = {
            "habit_id": habit_id,
            "completion_date": str(date.today()),
            "value": 1
        }
        completion_response = client.post("/api/v1/completions/", json=completion_data)
        assert completion_response.status_code == 201
        
        # 3. Check streak (should be updated automatically)
        streak_response = client.get(f"/api/v1/streaks/{habit_id}")
        assert streak_response.status_code == 200
        streak_data = streak_response.json()
        assert streak_data["current_streak"] >= 1  # Should reflect the completion
        
        # 4. Get habit completions
        completions_response = client.get(f"/api/v1/completions/habit/{habit_id}")
        assert completions_response.status_code == 200
        completions_data = completions_response.json()
        assert len(completions_data) == 1
