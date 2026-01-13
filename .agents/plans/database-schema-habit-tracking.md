# Feature: Database Schema for Habit Tracking

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Design and implement a comprehensive SQLite database schema for the StreakForge habit tracking application. This schema will support habit creation, daily completions tracking, streak calculations, and progress analytics. The database will be file-based using SQLite with SQLAlchemy ORM for Python FastAPI backend integration.

## User Story

As a StreakForge user
I want my habits and completion data to be persistently stored in a local database
So that I can track my progress over time, maintain streaks, and analyze my habit-building patterns

## Problem Statement

The StreakForge application currently has no data persistence layer. Users need a robust database schema that can:
- Store habit definitions with customizable properties
- Track daily completions efficiently
- Support streak calculation algorithms
- Enable progress analytics and reporting
- Handle years of historical data (1000+ habits)
- Maintain data integrity and relationships

## Solution Statement

Implement a normalized SQLite database schema using SQLAlchemy 2.0 with four core tables: Users, Habits, Completions, and Streaks. The schema will follow clean architecture principles with proper relationships, constraints, and indexes for performance. SQLite provides simplicity for local storage while SQLAlchemy enables robust ORM capabilities.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: Data Layer, Backend Foundation
**Dependencies**: SQLAlchemy 2.0, SQLite (built-in with Python)

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `.kiro/steering/tech.md` - Why: Defines SQLite + SQLAlchemy architecture requirements
- `.kiro/steering/structure.md` - Why: Specifies backend directory structure and file organization
- `.kiro/steering/product.md` - Why: Defines core features and user requirements for data model

### New Files to Create

- `backend/app/database.py` - Database connection and session management
- `backend/app/models/__init__.py` - Models package initialization
- `backend/app/models/user.py` - User model definition
- `backend/app/models/habit.py` - Habit model definition  
- `backend/app/models/completion.py` - Completion model definition
- `backend/app/models/streak.py` - Streak model definition
- `backend/app/config.py` - Database configuration settings
- `backend/requirements.txt` - Python dependencies
- `tests/unit/test_models.py` - Unit tests for database models

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
  - Specific section: Declarative Models
  - Why: Required for modern SQLAlchemy model patterns
- [FastAPI Database Tutorial](https://fastapi.tiangolo.com/tutorial/sql-databases/)
  - Specific section: SQLAlchemy integration
  - Why: Shows FastAPI + SQLAlchemy integration patterns
- [SQLite Documentation](https://www.sqlite.org/docs.html)
  - Specific section: Data Types and Constraints
  - Why: Understanding SQLite-specific features and limitations

### Patterns to Follow

**Naming Conventions:**
- Tables: snake_case (users, habits, habit_completions)
- Columns: snake_case (created_at, completion_date)
- Models: PascalCase (User, Habit, HabitCompletion)
- Foreign keys: {table}_id (user_id, habit_id)

**SQLAlchemy 2.0 Pattern:**
```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime

class Base(DeclarativeBase):
    pass

class ModelName(Base):
    __tablename__ = "table_name"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
```

**Database Session Pattern:**
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("sqlite:///./streakforge.db")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation Setup

Set up the basic database infrastructure, configuration, and connection management before implementing specific models.

**Tasks:**
- Create backend directory structure
- Configure SQLAlchemy 2.0 with SQLite
- Set up database session management
- Create base model class with common fields

### Phase 2: Core Models Implementation

Implement the four core database models with proper relationships and constraints.

**Tasks:**
- Create User model for basic user data
- Create Habit model with customizable properties
- Create Completion model for daily tracking
- Create Streak model for performance optimization

### Phase 3: Relationships & Constraints

Define foreign key relationships, indexes, and database constraints to ensure data integrity.

**Tasks:**
- Configure model relationships (one-to-many, foreign keys)
- Add database indexes for performance
- Implement unique constraints and validation
- Set up cascade delete behaviors

### Phase 4: Testing & Validation

Create comprehensive tests and validate the schema works correctly.

**Tasks:**
- Write unit tests for each model
- Test relationship integrity
- Validate constraint enforcement
- Performance test with sample data

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE backend/app/config.py

- **IMPLEMENT**: Database configuration with environment variables
- **PATTERN**: Environment-based configuration for database URL
- **IMPORTS**: `import os` for environment variables
- **GOTCHA**: Use relative path for SQLite file in user directory
- **VALIDATE**: `python -c "from backend.app.config import DATABASE_URL; print(DATABASE_URL)"`

### CREATE backend/app/database.py

- **IMPLEMENT**: SQLAlchemy engine and session configuration
- **PATTERN**: SQLAlchemy 2.0 async/sync session management
- **IMPORTS**: `from sqlalchemy import create_engine`, `from sqlalchemy.orm import sessionmaker, DeclarativeBase`
- **GOTCHA**: Use `check_same_thread=False` for SQLite threading
- **VALIDATE**: `python -c "from backend.app.database import engine, SessionLocal; print('Database setup OK')"`

### CREATE backend/app/models/__init__.py

- **IMPLEMENT**: Models package with Base class export
- **PATTERN**: Central import location for all models
- **IMPORTS**: `from .user import User`, `from .habit import Habit`, etc.
- **GOTCHA**: Import order matters for relationships
- **VALIDATE**: `python -c "from backend.app.models import Base; print('Models package OK')"`

### CREATE backend/app/models/user.py

- **IMPLEMENT**: User model with id, username, email, created_at
- **PATTERN**: SQLAlchemy 2.0 Mapped annotations
- **IMPORTS**: `from sqlalchemy.orm import Mapped, mapped_column, relationship`
- **GOTCHA**: Email should be unique and indexed
- **VALIDATE**: `python -c "from backend.app.models.user import User; print(User.__tablename__)"`

### CREATE backend/app/models/habit.py

- **IMPLEMENT**: Habit model with name, description, category, goal_type, target_value
- **PATTERN**: Enum for goal_type (daily, weekly, custom)
- **IMPORTS**: `from sqlalchemy import Enum, ForeignKey`
- **GOTCHA**: Include user_id foreign key relationship
- **VALIDATE**: `python -c "from backend.app.models.habit import Habit; print(Habit.__tablename__)"`

### CREATE backend/app/models/completion.py

- **IMPLEMENT**: Completion model with habit_id, completion_date, value, notes
- **PATTERN**: Composite unique constraint on habit_id + completion_date
- **IMPORTS**: `from sqlalchemy import UniqueConstraint, Date`
- **GOTCHA**: Use Date type for completion_date, not DateTime
- **VALIDATE**: `python -c "from backend.app.models.completion import Completion; print(Completion.__tablename__)"`

### CREATE backend/app/models/streak.py

- **IMPLEMENT**: Streak model with habit_id, current_streak, longest_streak, last_completion
- **PATTERN**: One-to-one relationship with Habit
- **IMPORTS**: `from sqlalchemy.orm import relationship`
- **GOTCHA**: Update triggers needed for automatic streak calculation
- **VALIDATE**: `python -c "from backend.app.models.streak import Streak; print(Streak.__tablename__)"`

### UPDATE backend/app/models/__init__.py

- **IMPLEMENT**: Import all models and create_all function
- **PATTERN**: Centralized model registration
- **IMPORTS**: All model classes
- **GOTCHA**: Import Base from database.py
- **VALIDATE**: `python -c "from backend.app.models import User, Habit, Completion, Streak; print('All models imported')"`

### CREATE backend/requirements.txt

- **IMPLEMENT**: Python dependencies for database layer
- **PATTERN**: Pinned versions for reproducibility
- **IMPORTS**: sqlalchemy>=2.0.0, fastapi, uvicorn, python-multipart
- **GOTCHA**: Include testing dependencies (pytest, pytest-asyncio)
- **VALIDATE**: `pip install -r backend/requirements.txt`

### CREATE tests/unit/test_models.py

- **IMPLEMENT**: Unit tests for all model classes
- **PATTERN**: pytest fixtures for database setup
- **IMPORTS**: `import pytest`, `from sqlalchemy import create_engine`
- **GOTCHA**: Use in-memory SQLite for tests (:memory:)
- **VALIDATE**: `python -m pytest tests/unit/test_models.py -v`

### CREATE backend/app/main.py

- **IMPLEMENT**: Basic FastAPI app with database initialization
- **PATTERN**: Startup event to create tables
- **IMPORTS**: `from fastapi import FastAPI`
- **GOTCHA**: Call Base.metadata.create_all(bind=engine) on startup
- **VALIDATE**: `cd backend && python -m uvicorn app.main:app --reload`

---

## TESTING STRATEGY

### Unit Tests

**Scope**: Individual model validation, relationships, constraints
**Framework**: pytest with SQLAlchemy test patterns
**Coverage**: 90%+ on model classes and database operations

Design unit tests with fixtures for:
- Model creation and validation
- Relationship integrity (foreign keys work correctly)
- Constraint enforcement (unique constraints, required fields)
- Data type validation (dates, enums, strings)

### Integration Tests

**Scope**: Database operations, session management, model interactions
**Framework**: pytest with temporary database
**Coverage**: Full CRUD operations on all models

### Edge Cases

- Duplicate habit completions on same date (should fail)
- Invalid foreign key references (should fail)
- Streak calculation with gaps in completions
- Large dataset performance (1000+ habits, years of data)
- Concurrent access patterns
- Database file permissions and creation

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# Python syntax validation
python -m py_compile backend/app/models/*.py
python -m py_compile backend/app/database.py
python -m py_compile backend/app/config.py

# Import validation
python -c "from backend.app.models import User, Habit, Completion, Streak"
```

### Level 2: Unit Tests

```bash
# Run model tests
python -m pytest tests/unit/test_models.py -v --tb=short

# Test coverage
python -m pytest tests/unit/test_models.py --cov=backend.app.models --cov-report=term-missing
```

### Level 3: Integration Tests

```bash
# Database creation test
python -c "
from backend.app.database import engine, Base
from backend.app.models import User, Habit, Completion, Streak
Base.metadata.create_all(bind=engine)
print('Database tables created successfully')
"

# Basic CRUD test
python -c "
from backend.app.database import SessionLocal
from backend.app.models import User
session = SessionLocal()
user = User(username='test', email='test@example.com')
session.add(user)
session.commit()
print(f'User created with ID: {user.id}')
session.close()
"
```

### Level 4: Manual Validation

```bash
# Start FastAPI server
cd backend && python -m uvicorn app.main:app --reload

# Check database file creation
ls -la streakforge.db

# Verify table structure
sqlite3 streakforge.db ".schema"
```

### Level 5: Additional Validation (Optional)

```bash
# Performance test with sample data
python -c "
from backend.app.database import SessionLocal
from backend.app.models import User, Habit, Completion
import datetime
session = SessionLocal()
user = User(username='perf_test', email='perf@test.com')
session.add(user)
session.flush()
for i in range(100):
    habit = Habit(name=f'Habit {i}', user_id=user.id)
    session.add(habit)
session.commit()
print('Performance test: 100 habits created')
session.close()
"
```

---

## ACCEPTANCE CRITERIA

- [ ] SQLite database file is created in correct location
- [ ] All four models (User, Habit, Completion, Streak) are properly defined
- [ ] Foreign key relationships work correctly between models
- [ ] Unique constraints prevent duplicate completions per day
- [ ] Database indexes are created for performance optimization
- [ ] All validation commands pass with zero errors
- [ ] Unit test coverage exceeds 90% for model classes
- [ ] Integration tests verify full CRUD operations
- [ ] FastAPI server starts without database errors
- [ ] Schema supports 1000+ habits and years of completion data
- [ ] Concurrent access doesn't cause data corruption
- [ ] Database file permissions are set correctly

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in dependency order
- [ ] Each task validation passed immediately after implementation
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration)
- [ ] No Python syntax or import errors
- [ ] Database schema created without errors
- [ ] Manual testing confirms models work correctly
- [ ] Acceptance criteria all verified
- [ ] Code follows SQLAlchemy 2.0 best practices

---

## NOTES

**Design Decisions:**
- SQLite chosen for simplicity and local storage requirements
- SQLAlchemy 2.0 with Mapped annotations for modern type safety
- Separate Streak model for performance optimization of streak queries
- Composite unique constraint on Completion to prevent duplicate daily entries

**Performance Considerations:**
- Indexes on user_id, habit_id, and completion_date for fast queries
- Streak model denormalizes data to avoid expensive calculations
- SQLite WAL mode could be enabled for better concurrent access

**Future Extensions:**
- Schema supports habit categories and custom goal types
- Completion model includes notes field for user annotations
- User model prepared for potential multi-user scenarios
- Streak model ready for advanced analytics and reporting
