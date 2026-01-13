# Code Review: Database Schema Implementation

**Stats:**

- Files Modified: 0
- Files Added: 9
- Files Deleted: 0
- New lines: ~350
- Deleted lines: 0

## Issues Found

### Issue 1
severity: medium
file: backend/app/models/user.py
line: 14
issue: Using deprecated datetime.utcnow() method
detail: datetime.utcnow() is deprecated in Python 3.12+ and scheduled for removal. This causes deprecation warnings in tests and will break in future Python versions.
suggestion: Replace `datetime.utcnow` with `lambda: datetime.now(datetime.UTC)` or use `datetime.now(datetime.UTC)` directly

### Issue 2
severity: medium
file: backend/app/models/habit.py
line: 27
issue: Using deprecated datetime.utcnow() method
detail: Same deprecation issue as in user.py. This pattern is repeated across multiple model files.
suggestion: Replace `datetime.utcnow` with `lambda: datetime.now(datetime.UTC)` or use `datetime.now(datetime.UTC)` directly

### Issue 3
severity: medium
file: backend/app/models/completion.py
line: 17
issue: Using deprecated datetime.utcnow() method
detail: Same deprecation issue as in other model files.
suggestion: Replace `datetime.utcnow` with `lambda: datetime.now(datetime.UTC)` or use `datetime.now(datetime.UTC)` directly

### Issue 4
severity: medium
file: backend/app/models/streak.py
line: 16
issue: Using deprecated datetime.utcnow() method in two places
detail: Both `default` and `onupdate` parameters use the deprecated datetime.utcnow() method.
suggestion: Replace both instances with `lambda: datetime.now(datetime.UTC)` or use `datetime.now(datetime.UTC)` directly

### Issue 5
severity: low
file: backend/app/config.py
line: 7-8
issue: Redundant database directory creation logic
detail: The code creates a directory for "streakforge.db" but Path("streakforge.db").parent returns the current directory ".", which already exists. This logic is unnecessary for SQLite files in the current directory.
suggestion: Remove lines 7-8 or modify to handle actual subdirectory paths if needed in the future

### Issue 6
severity: low
file: backend/app/database.py
line: 7-10
issue: Missing connection pool configuration for production use
detail: SQLite engine lacks connection pooling configuration which could be important for concurrent access patterns, even though SQLite has limited concurrency.
suggestion: Consider adding pool_pre_ping=True and pool_recycle settings for production robustness

### Issue 7
severity: low
file: backend/requirements.txt
line: 1-7
issue: Version ranges may cause dependency conflicts
detail: Using >= version specifiers without upper bounds can lead to breaking changes when major versions are released.
suggestion: Consider using more restrictive version ranges like sqlalchemy>=2.0.0,<3.0.0 for better stability

## Positive Observations

- **Excellent SQLAlchemy 2.0 Usage**: Proper use of Mapped annotations and modern declarative patterns
- **Strong Type Safety**: Comprehensive type hints with TYPE_CHECKING guards to avoid circular imports
- **Proper Relationships**: Well-defined foreign key relationships with appropriate cascade behaviors
- **Good Constraints**: Unique constraints properly implemented to prevent data integrity issues
- **Comprehensive Testing**: 100% test coverage with well-structured pytest fixtures
- **Clean Architecture**: Clear separation between models, database configuration, and application logic
- **Security Conscious**: No hardcoded secrets or sensitive data exposed

## Summary

The database schema implementation is well-architected and follows modern SQLAlchemy 2.0 best practices. The main issues are related to deprecated datetime methods that will cause warnings and potential future compatibility problems. The code quality is high with excellent type safety, proper relationships, and comprehensive testing.

All issues found are non-critical and can be addressed in a future iteration without affecting current functionality.
