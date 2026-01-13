# StreakForge - Personal Habit Tracking Application

🔥 **Build lasting habits through streak tracking and progress visualization** - A complete full-stack application built with React, FastAPI, and SQLite, developed using AI-assisted development with Kiro CLI.

> **📊 Live Demo**: Start both servers and visit http://localhost:5173 to see StreakForge in action!

## About StreakForge

StreakForge is a personal habit tracking application that helps users build and maintain positive habits through streak tracking and progress visualization. Built as part of the **Dynamous Kiro Hackathon**, this project demonstrates modern full-stack development with comprehensive AI-assisted workflows.

- **🎯 Purpose**: Help users build lasting habits through visual motivation and streak gamification
- **⚡ Tech Stack**: React 18 + TypeScript, FastAPI + SQLAlchemy, SQLite database
- **🏆 Development**: 6.5 hours using systematic Kiro CLI workflows (50%+ time savings)
- **📈 Features**: Habit CRUD, analytics dashboard, friend sharing, responsive design

## Key Features

### ✅ Habit Management
- **Create & Track Habits**: Add habits with categories, descriptions, and goal types
- **Daily Check-ins**: Simple interface to mark habits as completed
- **Streak Tracking**: Visual streak counters that motivate continued consistency
- **Smart Organization**: Category-based filtering and search functionality

### 📊 Progress Analytics
- **Interactive Charts**: Streak progression, completion rates, category distribution
- **Progress Summary**: Key metrics with today's progress and weekly performance
- **Time Period Filtering**: View analytics for 7, 14, 30, 60, or 90 days
- **Insights & Recommendations**: AI-powered suggestions based on your patterns

### 🤝 Social Features
- **Habit Sharing**: Export your habits as JSON to share with friends
- **Import from Friends**: Import and adapt habits from friends' exports
- **No Authentication Required**: Simple file-based sharing system
- **Privacy-First**: All data stored locally, no external transmission

### 📱 Modern UX
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Real-time Updates**: Optimistic UI updates with error handling
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: < 3s load time, 71% bundle compression

## Quick Start

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python** 3.9+ (for backend)
- **Git** (for cloning)

### 1. Clone & Setup
```bash
git clone https://github.com/rdpatilds/StreakForgeKiro.git
cd StreakForgeKiro
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
# In a new terminal
cd frontend
npm install

# Start development server
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Architecture Overview

### Backend (FastAPI + SQLite)
```
backend/
├── app/
│   ├── main.py              # FastAPI application entry
│   ├── models/              # SQLAlchemy models (User, Habit, Completion, Streak)
│   ├── routers/             # API endpoints (habits, completions, streaks)
│   ├── services/            # Business logic layer
│   ├── schemas/             # Pydantic request/response models
│   └── database.py          # Database configuration
└── requirements.txt         # Python dependencies
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/ui/       # Reusable UI components
│   ├── features/            # Feature-based organization
│   │   ├── habits/          # Habit management
│   │   ├── analytics/       # Progress visualization
│   │   └── sharing/         # Import/export functionality
│   ├── pages/               # Route-level components
│   ├── services/            # API client
│   ├── stores/              # Zustand state management
│   └── types/               # TypeScript interfaces
└── package.json             # Node.js dependencies
```

### Key Technical Decisions
- **SQLite**: Simple file-based storage, perfect for local habit tracking
- **FastAPI**: Modern async API with automatic OpenAPI documentation
- **React 18**: Latest React with concurrent features and TypeScript
- **Zustand**: Lightweight state management (simpler than Redux)
- **Recharts**: React-native charts for analytics visualization
- **Tailwind CSS**: Utility-first styling with custom theme

## API Endpoints

### Habits
- `GET /api/v1/habits/` - List all habits
- `POST /api/v1/habits/` - Create new habit
- `GET /api/v1/habits/{id}` - Get specific habit
- `PUT /api/v1/habits/{id}` - Update habit
- `DELETE /api/v1/habits/{id}` - Delete habit

### Completions
- `GET /api/v1/completions/habit/{habit_id}` - Get habit completions
- `POST /api/v1/completions/` - Mark habit complete
- `PUT /api/v1/completions/{id}` - Update completion
- `DELETE /api/v1/completions/{id}` - Delete completion

### Streaks
- `GET /api/v1/streaks/{habit_id}` - Get habit streak data
- `POST /api/v1/streaks/{habit_id}/recalculate` - Recalculate streak

## Testing & Quality Assurance

### Comprehensive Test Coverage
- **Backend**: 14 unit tests with 100% model coverage
- **Frontend**: 8 E2E tests with Playwright (100% pass rate)
- **Integration**: Full API integration testing
- **Performance**: < 100ms API response times

### Quality Metrics
- **TypeScript**: Strict mode with zero compilation errors
- **Security**: Zero vulnerabilities after systematic code review
- **Performance**: 708KB → 203KB gzipped (71% compression)
- **Accessibility**: WCAG compliant with proper ARIA labels

### Run Tests
```bash
# Backend tests
cd backend && source ../venv/bin/activate
pytest tests/ -v --cov=app

# Frontend E2E tests
cd frontend
npx playwright test --project=chromium

# Production build test
npm run build
```

## Development Process with Kiro CLI

This project was built using systematic AI-assisted development with Kiro CLI, demonstrating modern development workflows:

### Kiro Workflow Used
1. **`@prime`** - Load comprehensive project context
2. **`@plan-feature`** - Generate detailed implementation plans
3. **`@execute`** - Systematic task execution with validation
4. **`@code-review-hackathon`** - Submission-grade quality review
5. **`@code-review-fix`** - Systematic bug resolution

### Development Timeline
- **Total Time**: 6 hours 28 minutes
- **Backend Implementation**: 3h 29min (database, API, testing)
- **Frontend Implementation**: 28min (React app, components, E2E tests)
- **Code Review & Fixes**: 1h 23min (security, quality, performance)
- **Documentation**: 58min (DEVLOG, planning, validation)

### Key Achievements
- **50%+ Time Savings**: 6.5 hours vs estimated 12-15 hours manual
- **Zero Security Vulnerabilities**: Systematic code review caught critical issues
- **Production-Ready**: Proper error handling, CORS, performance optimization
- **Comprehensive Testing**: Both unit and E2E testing with 100% pass rates

> **📖 Detailed Development Log**: See [.kiro/DEVLOG.md](.kiro/DEVLOG.md) for complete development timeline, technical decisions, and Kiro CLI usage statistics.

## Deployment

### Production Build
```bash
# Backend (no build needed - Python runs directly)
cd backend && source ../venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm run build
npm run preview  # Test production build
```

### Environment Configuration
- **Database**: SQLite file in user's local directory
- **CORS**: Configured for localhost development (update for production)
- **API Base URL**: Update in `frontend/src/services/api.ts` for production

## Troubleshooting

### Common Issues

**Backend won't start**:
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r backend/requirements.txt
```

**Frontend build fails**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database issues**:
```bash
# Delete and recreate database
rm streakforge.db
# Restart backend - tables will be recreated automatically
```

**CORS errors**:
- Ensure backend is running on port 8000
- Check CORS configuration in `backend/app/main.py`

## Contributing

This project demonstrates systematic development with Kiro CLI. To contribute:

1. **Fork the repository**
2. **Use Kiro CLI workflows**: Start with `@prime` to understand the codebase
3. **Plan features**: Use `@plan-feature` for comprehensive planning
4. **Quality assurance**: Run `@code-review` before submitting
5. **Submit pull request** with detailed description

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- **Dynamous Kiro Hackathon** - For the opportunity to showcase AI-assisted development
- **Kiro CLI** - For enabling systematic, high-quality development workflows
- **Modern Tech Stack** - React, FastAPI, SQLAlchemy, Tailwind CSS, Recharts

---

**🚀 Ready to build lasting habits?** Start the servers and visit http://localhost:5173 to begin your habit tracking journey!
