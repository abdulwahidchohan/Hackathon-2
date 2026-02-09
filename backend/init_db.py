from backend.database import engine, SQLModel
from backend.models import *

SQLModel.metadata.create_all(engine)
print("Database initialized.")
