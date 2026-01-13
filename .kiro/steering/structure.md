# Project Structure

## Directory Layout
```
StreakForge/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── models/              # SQLAlchemy models
│   │   ├── routers/             # API route handlers
│   │   ├── services/            # Business logic layer
│   │   ├── database.py          # Database connection and setup
│   │   └── config.py            # Configuration settings
│   ├── tests/
│   │   ├── unit/                # Unit tests with pytest
│   │   └── integration/         # API integration tests
│   ├── requirements.txt         # Python dependencies
│   └── run.py                   # Development server script
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page-level components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API client functions
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx              # Main App component
│   │   └── main.jsx             # Vite entry point
│   ├── public/                  # Static assets
│   ├── tests/                   # Frontend tests
│   ├── package.json             # Node.js dependencies
│   └── vite.config.js           # Vite configuration
├── tests/
│   └── e2e/                     # Playwright end-to-end tests
├── docs/                        # Documentation
├── scripts/                     # Development and build scripts
├── .kiro/                       # Kiro CLI configuration
└── README.md
```

## File Naming Conventions
- **Python**: snake_case for files and functions (habit_service.py, get_habits())
- **React**: PascalCase for components (HabitCard.jsx, StreakCounter.jsx)
- **API Routes**: kebab-case URLs (/api/habits, /api/habit-completions)
- **Database**: snake_case for tables and columns (habits, completion_date)

## Module Organization
- **Backend Services**: One service per domain (HabitService, StreakService, ProgressService)
- **React Components**: Organized by feature (habits/, streaks/, progress/)
- **API Routes**: Grouped by resource (/habits, /completions, /progress)
- **Database Models**: One model per table with clear relationships

## Configuration Files
- **Backend**: config.py for environment-specific settings
- **Frontend**: vite.config.js for build configuration
- **Database**: SQLite file in user's data directory
- **Development**: .env files for local development settings

## Documentation Structure
- **API Documentation**: Auto-generated with FastAPI/OpenAPI
- **Component Documentation**: JSDoc comments for complex components
- **User Guide**: Simple setup and usage instructions
- **Developer Guide**: Architecture and contribution guidelines

## Asset Organization
- **Images**: /frontend/public/images/ for static images
- **Icons**: /frontend/src/assets/icons/ for UI icons
- **Styles**: Component-level CSS modules or styled-components
- **Fonts**: /frontend/public/fonts/ for custom fonts

## Build Artifacts
- **Backend**: No build artifacts (Python runs directly)
- **Frontend**: /frontend/dist/ for production build
- **Distribution**: Single executable or installer package
- **Database**: User's local SQLite file (not in project)

## Environment-Specific Files
- **Development**: .env.development for local settings
- **Production**: .env.production for distribution settings
- **Testing**: .env.test for test database configuration
- **CI/CD**: GitHub Actions or similar for automated testing
