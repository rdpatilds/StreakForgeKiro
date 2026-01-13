from fastapi import Depends
from sqlalchemy.orm import Session

from .database import get_db

# Note: Use get_db directly in routers instead of this wrapper
# This file exists for consistency but routers should import get_db directly
