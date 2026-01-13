# Technical Architecture

## Technology Stack
- **Backend**: Python with FastAPI framework
- **Database**: SQLite for simple, file-based storage
- **Frontend**: React with Vite for fast development and building
- **Testing**: Playwright MCP server for browser automation, pytest for unit testing
- **Package Management**: pip for Python, npm for Node.js

## Architecture Overview
**Clean Architecture Pattern** with clear separation of concerns:
- **API Layer**: FastAPI REST endpoints for habit CRUD operations
- **Business Logic**: Core habit tracking, streak calculation, and progress analytics
- **Data Layer**: SQLite with simple schema for habits, completions, and user data
- **Frontend**: React SPA with local state management and API integration

## Development Environment
- **Python**: 3.9+ with virtual environment
- **Node.js**: 18+ for React/Vite development
- **SQLite**: Built-in with Python, no separate installation needed
- **Development Server**: FastAPI uvicorn server + Vite dev server
- **IDE Setup**: Python and JavaScript/TypeScript support

## Code Standards
- **Python**: PEP 8 formatting with black formatter
- **JavaScript/React**: ESLint + Prettier configuration
- **API Design**: RESTful conventions with consistent JSON responses
- **Database**: Simple normalized schema with clear relationships
- **Documentation**: Docstrings for Python, JSDoc for complex React components

## Testing Strategy
- **Unit Testing**: pytest for Python backend logic and data operations
- **Integration Testing**: Playwright MCP server for end-to-end browser automation
- **API Testing**: FastAPI TestClient for endpoint validation
- **Frontend Testing**: React Testing Library for component testing
- **Coverage**: Aim for 80%+ coverage on core business logic

## Deployment Process
- **Local Development**: Simple script to start both backend and frontend servers
- **Distribution**: Standalone executable or simple installation script
- **Database**: SQLite file in user's local directory
- **No Hosting Required**: Fully local application with optional file sharing

## Performance Requirements
- **Response Time**: Under 100ms for habit check-ins and data retrieval
- **Database**: Handle 1000+ habits and years of completion data
- **Memory**: Lightweight footprint under 100MB
- **Startup**: Application ready in under 3 seconds

## Security Considerations
- **Local Data**: All data stored locally, no external transmission
- **File Permissions**: Proper SQLite file permissions for user data
- **Input Validation**: Sanitize all user inputs on both frontend and backend
- **Friend Sharing**: Simple file export/import without sensitive data exposure
