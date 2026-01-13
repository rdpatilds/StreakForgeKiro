# Feature: StreakForge Backend API System (No Authentication)

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Build a complete FastAPI backend system for StreakForge habit tracking application including habit management, completion tracking, and streak calculation services. This encompasses three major components: habit CRUD operations, daily completion tracking, and automated streak calculation with persistence. The system will operate without user authentication for simplicity.

## User Story

As a habit tracking application user
I want to manage my habits, track daily completions, and view my streaks
So that I can build consistent habits and stay motivated through visual progress tracking

## Problem Statement

The current StreakForge application has only basic database models and minimal FastAPI setup. It lacks:
- API endpoints for habit management
- Business logic for streak calculations
- Completion tracking functionality
- Proper service layer architecture
- RESTful API structure

## Solution Statement

Implement a complete FastAPI backend following clean architecture principles with:
- RESTful API endpoints for all CRUD operations
- Service layer for business logic separation
- Automated streak calculation with database persistence
- Proper error handling and validation
- Comprehensive test coverage

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: Backend API, Database Layer
**Dependencies**: python-multipart

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `backend/app/models/__init__.py` (lines 1-10) - Why: Model imports and Base class setup
- `backend/app/models/user.py` (lines 1-20) - Why: User model structure with relationships
- `backend/app/models/habit.py` (lines 1-35) - Why: Habit model with GoalType enum and relationships
- `backend/app/models/completion.py` (lines 1-25) - Why: Completion model with unique constraints
- `backend/app/models/streak.py` (lines 1-20) - Why: Streak model with one-to-one habit relationship
- `backend/app/database.py` (lines 1-25) - Why: Database session management and Base class
- `backend/app/config.py` (lines 1-5) - Why: Configuration pattern for environment variables
- `backend/app/main.py` (lines 1-20) - Why: FastAPI app setup with lifespan management
- `tests/unit/test_models.py` (lines 1-50) - Why: Testing patterns and fixtures setup

### New Files to Create

- `backend/app/schemas/` - Pydantic schemas for request/response validation
- `backend/app/services/` - Business logic layer services
- `backend/app/routers/` - API route handlers
- `backend/app/dependencies.py` - FastAPI dependency injection functions
- `tests/unit/test_services.py` - Service layer unit tests
- `tests/unit/test_routers.py` - API endpoint tests

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [FastAPI Dependencies Documentation](https://fastapi.tiangolo.com/tutorial/dependencies/)
  - Specific section: Dependency injection patterns
  - Why: Shows proper dependency management for database sessions
- [SQLAlchemy 2.0 Async Patterns](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
  - Specific section: Async session management
  - Why: Current models use sync SQLAlchemy, need async patterns for FastAPI

### Patterns to Follow

**Naming Conventions:**
- Files: snake_case (user_service.py, auth_handler.py)
- Classes: PascalCase (UserService, AuthHandler)
- Functions: snake_case (get_current_user, calculate_streak)
- API endpoints: kebab-case URLs (/api/v1/habits, /api/v1/habit-completions)

**Error Handling:**
```python
from fastapi import HTTPException

# Standard error responses
raise HTTPException(status_code=404, detail="Habit not found")
raise HTTPException(status_code=400, detail="Invalid request data")
```

**Database Session Pattern:**
```python
from fastapi import Depends
from backend.app.database import get_db

async def some_endpoint(db: Session = Depends(get_db)):
    # Use db session
```

**Service Layer Pattern:**
```python
class HabitService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_habit(self, habit_data: HabitCreate) -> Habit:
        # Business logic here
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation & Schemas

Set up core infrastructure including Pydantic schemas for request/response validation and basic API structure.

**Tasks:**
- Install required dependencies (python-multipart for form data)
- Create Pydantic schemas for all entities
- Set up dependency injection for database sessions
- Create router structure for modular endpoints

### Phase 2: Business Logic Services

Implement the service layer containing all business logic for habit management and streak calculations.

**Tasks:**
- Create habit management service
- Implement completion tracking service
- Build streak calculation algorithms
- Implement data validation and business rules

### Phase 3: API Endpoints & Integration

Connect all components through RESTful API endpoints with proper validation and error handling.

**Tasks:**
- Implement all CRUD endpoints for habits
- Create completion tracking endpoints
- Add streak retrieval endpoints
- Add comprehensive error handling
- Update main.py to include all routers

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE backend/requirements.txt

- **IMPLEMENT**: Add new dependencies to existing requirements
- **PATTERN**: Append to existing file format
- **IMPORTS**: PyJWT>=2.8.0, passlib[bcrypt]>=1.7.4, python-decouple>=3.8
- **GOTCHA**: Keep existing dependencies, only add new ones
- **VALIDATE**: `pip install -r backend/requirements.txt`

### CREATE backend/app/schemas/__init__.py

- **IMPLEMENT**: Empty init file for schemas package
- **PATTERN**: Standard Python package initialization
- **IMPORTS**: None required
- **GOTCHA**: Must exist for Python to recognize as package
- **VALIDATE**: `python -c "import backend.app.schemas"`

### CREATE backend/app/schemas/user.py

- **IMPLEMENT**: Pydantic schemas for user operations
- **PATTERN**: Mirror backend/app/models/user.py structure
- **IMPORTS**: pydantic BaseModel, EmailStr, Field
- **GOTCHA**: Separate create/update/response schemas
- **VALIDATE**: `python -c "from backend.app.schemas.user import UserCreate"`

### CREATE backend/app/schemas/habit.py

- **IMPLEMENT**: Pydantic schemas for habit operations
- **PATTERN**: Mirror backend/app/models/habit.py with GoalType enum
- **IMPORTS**: pydantic BaseModel, Field, backend.app.models.habit.GoalType
- **GOTCHA**: Include user_id in create schema, exclude in response
- **VALIDATE**: `python -c "from backend.app.schemas.habit import HabitCreate"`

### CREATE backend/app/schemas/completion.py

- **IMPLEMENT**: Pydantic schemas for completion operations
- **PATTERN**: Mirror backend/app/models/completion.py structure
- **IMPORTS**: pydantic BaseModel, Field, datetime.date
- **GOTCHA**: completion_date should default to today()
- **VALIDATE**: `python -c "from backend.app.schemas.completion import CompletionCreate"`

### CREATE backend/app/schemas/streak.py

- **IMPLEMENT**: Pydantic schemas for streak responses
- **PATTERN**: Mirror backend/app/models/streak.py structure
- **IMPORTS**: pydantic BaseModel, Field, datetime.date, Optional
- **GOTCHA**: Read-only schema, no create/update needed
- **VALIDATE**: `python -c "from backend.app.schemas.streak import StreakResponse"`

### CREATE backend/app/auth/__init__.py

- **IMPLEMENT**: Empty init file for auth package
- **PATTERN**: Standard Python package initialization
- **IMPORTS**: None required
- **GOTCHA**: Must exist for Python to recognize as package
- **VALIDATE**: `python -c "import backend.app.auth"`

### CREATE backend/app/auth/auth_handler.py

- **IMPLEMENT**: JWT token generation and validation functions
- **PATTERN**: Follow testdriven.io JWT pattern from documentation
- **IMPORTS**: jwt, time, typing.Dict, decouple.config
- **GOTCHA**: Use environment variables for JWT_SECRET and JWT_ALGORITHM
- **VALIDATE**: `python -c "from backend.app.auth.auth_handler import sign_jwt"`

### CREATE backend/app/auth/auth_bearer.py

- **IMPLEMENT**: FastAPI HTTPBearer subclass for JWT validation
- **PATTERN**: Follow testdriven.io JWTBearer pattern from documentation
- **IMPORTS**: fastapi Request, HTTPException, HTTPBearer, HTTPAuthorizationCredentials
- **GOTCHA**: Must validate token format and expiration
- **VALIDATE**: `python -c "from backend.app.auth.auth_bearer import JWTBearer"`

### CREATE backend/app/auth/password.py

- **IMPLEMENT**: Password hashing and verification utilities
- **PATTERN**: Use passlib with bcrypt for secure hashing
- **IMPORTS**: passlib.context.CryptContext
- **GOTCHA**: Use bcrypt with proper rounds for security
- **VALIDATE**: `python -c "from backend.app.auth.password import hash_password"`

### UPDATE backend/app/config.py

- **IMPLEMENT**: Add JWT configuration variables
- **PATTERN**: Follow existing DATABASE_URL pattern
- **IMPORTS**: os.getenv for environment variables
- **GOTCHA**: Provide secure defaults for development
- **VALIDATE**: `python -c "from backend.app.config import JWT_SECRET"`

### CREATE backend/app/dependencies.py

- **IMPLEMENT**: FastAPI dependency functions for auth and database
- **PATTERN**: Use Depends() pattern from FastAPI docs
- **IMPORTS**: fastapi Depends, HTTPException, backend.app.database.get_db
- **GOTCHA**: get_current_user should validate JWT and return user
- **VALIDATE**: `python -c "from backend.app.dependencies import get_current_user"`

### CREATE backend/app/services/__init__.py

- **IMPLEMENT**: Empty init file for services package
- **PATTERN**: Standard Python package initialization
- **IMPORTS**: None required
- **GOTCHA**: Must exist for Python to recognize as package
- **VALIDATE**: `python -c "import backend.app.services"`

### CREATE backend/app/services/user_service.py

- **IMPLEMENT**: User management business logic
- **PATTERN**: Service class with db session injection
- **IMPORTS**: sqlalchemy.orm.Session, backend.app.models, backend.app.schemas.user
- **GOTCHA**: Hash passwords before saving, check email uniqueness
- **VALIDATE**: `python -c "from backend.app.services.user_service import UserService"`

### CREATE backend/app/services/habit_service.py

- **IMPLEMENT**: Habit CRUD operations and business logic
- **PATTERN**: Service class with db session injection
- **IMPORTS**: sqlalchemy.orm.Session, backend.app.models, backend.app.schemas.habit
- **GOTCHA**: Filter habits by user_id, validate user ownership
- **VALIDATE**: `python -c "from backend.app.services.habit_service import HabitService"`

### CREATE backend/app/services/completion_service.py

- **IMPLEMENT**: Completion tracking and validation logic
- **PATTERN**: Service class with db session injection
- **IMPORTS**: sqlalchemy.orm.Session, backend.app.models, datetime.date
- **GOTCHA**: Enforce unique constraint per habit per day
- **VALIDATE**: `python -c "from backend.app.services.completion_service import CompletionService"`

### CREATE backend/app/services/streak_service.py

- **IMPLEMENT**: Streak calculation and update algorithms
- **PATTERN**: Service class with complex business logic
- **IMPORTS**: sqlalchemy.orm.Session, backend.app.models, datetime.date, timedelta
- **GOTCHA**: Calculate streaks based on consecutive days, handle timezone
- **VALIDATE**: `python -c "from backend.app.services.streak_service import StreakService"`

### CREATE backend/app/routers/__init__.py

- **IMPLEMENT**: Empty init file for routers package
- **PATTERN**: Standard Python package initialization
- **IMPORTS**: None required
- **GOTCHA**: Must exist for Python to recognize as package
- **VALIDATE**: `python -c "import backend.app.routers"`

### CREATE backend/app/routers/auth.py

- **IMPLEMENT**: Authentication endpoints (register, login)
- **PATTERN**: APIRouter with /auth prefix
- **IMPORTS**: fastapi APIRouter, Depends, HTTPException, backend.app.services.user_service
- **GOTCHA**: Return JWT tokens on successful auth
- **VALIDATE**: `python -c "from backend.app.routers.auth import router"`

### CREATE backend/app/routers/habits.py

- **IMPLEMENT**: Habit CRUD endpoints with authentication
- **PATTERN**: APIRouter with /habits prefix and auth dependencies
- **IMPORTS**: fastapi APIRouter, Depends, backend.app.dependencies.get_current_user
- **GOTCHA**: Filter all operations by current user
- **VALIDATE**: `python -c "from backend.app.routers.habits import router"`

### CREATE backend/app/routers/completions.py

- **IMPLEMENT**: Completion tracking endpoints
- **PATTERN**: APIRouter with /completions prefix and auth dependencies
- **IMPORTS**: fastapi APIRouter, Depends, backend.app.services.completion_service
- **GOTCHA**: Validate habit ownership before allowing completions
- **VALIDATE**: `python -c "from backend.app.routers.completions import router"`

### CREATE backend/app/routers/streaks.py

- **IMPLEMENT**: Streak retrieval and calculation endpoints
- **PATTERN**: APIRouter with /streaks prefix and auth dependencies
- **IMPORTS**: fastapi APIRouter, Depends, backend.app.services.streak_service
- **GOTCHA**: Trigger streak recalculation on completion updates
- **VALIDATE**: `python -c "from backend.app.routers.streaks import router"`

### UPDATE backend/app/main.py

- **IMPLEMENT**: Register all routers and add CORS middleware
- **PATTERN**: Follow existing FastAPI app setup pattern
- **IMPORTS**: All router modules, fastapi.middleware.cors.CORSMiddleware
- **GOTCHA**: Include routers with /api/v1 prefix for versioning
- **VALIDATE**: `python backend/app/main.py` (should start without errors)

### CREATE tests/unit/test_auth.py

- **IMPLEMENT**: Unit tests for authentication functions
- **PATTERN**: Follow existing test_models.py pytest structure
- **IMPORTS**: pytest, backend.app.auth modules
- **GOTCHA**: Test JWT generation, validation, and password hashing
- **VALIDATE**: `pytest tests/unit/test_auth.py -v`

### CREATE tests/unit/test_services.py

- **IMPLEMENT**: Unit tests for all service classes
- **PATTERN**: Follow existing test_models.py fixture pattern
- **IMPORTS**: pytest, backend.app.services modules, test fixtures
- **GOTCHA**: Mock database operations, test business logic only
- **VALIDATE**: `pytest tests/unit/test_services.py -v`

### CREATE tests/unit/test_routers.py

- **IMPLEMENT**: Integration tests for API endpoints
- **PATTERN**: Use FastAPI TestClient for endpoint testing
- **IMPORTS**: fastapi.testclient.TestClient, pytest, backend.app.main.app
- **GOTCHA**: Test authentication flows and error responses
- **VALIDATE**: `pytest tests/unit/test_routers.py -v`

### CREATE .env

- **IMPLEMENT**: Environment variables for development
- **PATTERN**: KEY=value format for configuration
- **IMPORTS**: None (environment file)
- **GOTCHA**: Use strong JWT secret, never commit to version control
- **VALIDATE**: `python -c "from backend.app.config import JWT_SECRET; print('Config loaded')"`

---

## TESTING STRATEGY

### Unit Tests

Design unit tests with fixtures and assertions following existing pytest patterns in test_models.py:

- **Authentication Tests**: JWT generation, validation, password hashing
- **Service Tests**: Business logic validation with mocked database
- **Model Tests**: Extend existing model tests for new relationships
- **Schema Tests**: Pydantic validation and serialization

### Integration Tests

- **API Endpoint Tests**: Full request/response cycle testing
- **Authentication Flow Tests**: Registration, login, protected routes
- **Database Integration Tests**: Real database operations with test data
- **Streak Calculation Tests**: End-to-end habit completion to streak updates

### Edge Cases

- **JWT Expiration**: Test expired token handling
- **Duplicate Completions**: Test unique constraint enforcement
- **Invalid Habit Access**: Test user isolation and authorization
- **Streak Calculation Edge Cases**: Test timezone handling, missing days
- **Password Security**: Test hash strength and validation

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Python syntax validation
python -m py_compile backend/app/**/*.py

# Import validation
python -c "from backend.app.main import app; print('All imports successful')"
```

### Level 2: Unit Tests

```bash
# Run all unit tests
pytest tests/unit/ -v --tb=short

# Run with coverage
pytest tests/unit/ --cov=backend/app --cov-report=term-missing

# Test specific components
pytest tests/unit/test_models.py -v
pytest tests/unit/test_services.py -v
pytest tests/unit/test_auth.py -v
```

### Level 3: Integration Tests

```bash
# Run API endpoint tests
pytest tests/unit/test_routers.py -v

# Test database operations
pytest tests/unit/test_services.py::TestHabitService -v

# Test authentication flow
pytest tests/unit/test_routers.py::TestAuthRouter -v
```

### Level 4: Manual Validation

```bash
# Start development server
cd backend && python -m uvicorn app.main:app --reload --port 8000

# Test health endpoint
curl http://localhost:8000/health

# Test user registration
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# Test user login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Test protected endpoint (use token from login)
curl -X GET http://localhost:8000/api/v1/habits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Level 5: Additional Validation (Optional)

```bash
# Database schema validation
python -c "from backend.app.database import engine; from backend.app.models import Base; Base.metadata.create_all(engine); print('Schema created successfully')"

# Performance testing (if available)
# ab -n 100 -c 10 http://localhost:8000/api/v1/habits

# Security testing
# bandit -r backend/app/
```

---

## ACCEPTANCE CRITERIA

- [ ] User registration and login with JWT authentication works
- [ ] All habit CRUD operations function correctly with user isolation
- [ ] Completion tracking enforces business rules (one per day per habit)
- [ ] Streak calculation updates automatically on completions
- [ ] All API endpoints return proper HTTP status codes and error messages
- [ ] Authentication middleware protects all user-specific endpoints
- [ ] Database relationships and constraints work as designed
- [ ] All validation commands pass with zero errors
- [ ] Unit test coverage exceeds 80% for service and auth modules
- [ ] Integration tests verify end-to-end workflows
- [ ] Code follows established project conventions and patterns
- [ ] No security vulnerabilities in authentication implementation
- [ ] Performance meets requirements (sub-100ms for simple operations)
- [ ] API documentation is auto-generated and accessible

---

## COMPLETION CHECKLIST

- [ ] All dependencies installed and configured
- [ ] Authentication system fully implemented and tested
- [ ] All service classes created with business logic
- [ ] API routers implemented with proper error handling
- [ ] Database models integrated with new service layer
- [ ] All unit tests pass with good coverage
- [ ] Integration tests verify API functionality
- [ ] Manual testing confirms all features work
- [ ] Security review completed for authentication
- [ ] Performance validation completed
- [ ] Documentation updated (auto-generated API docs)
- [ ] Environment configuration properly set up

---

## NOTES

**Design Decisions:**
- Using JWT for stateless authentication to support future mobile apps
- Service layer pattern for clean separation of business logic from API layer
- Async/await patterns throughout for better FastAPI performance
- Pydantic schemas for strong request/response validation
- Environment-based configuration for security and deployment flexibility

**Security Considerations:**
- Password hashing with bcrypt and proper salt rounds
- JWT tokens with reasonable expiration times
- User isolation enforced at service layer
- Input validation through Pydantic schemas
- SQL injection prevention through SQLAlchemy ORM

**Performance Optimizations:**
- Database session management with proper cleanup
- Efficient streak calculation algorithms
- Indexed database columns for common queries
- Minimal database queries through proper relationship loading

**Future Extensibility:**
- Versioned API structure (/api/v1/) for backward compatibility
- Service layer allows easy business logic changes
- Modular router structure supports feature additions
- Schema-based validation enables API evolution
