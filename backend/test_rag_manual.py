import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.rag import search_tasks_semantic, get_embedding
from backend.models import Task
from backend.database import engine
from sqlmodel import Session, select

def test_rag():
    print("Testing RAG...")
    
    # 1. Create a dummy user and task
    user_id = "test_user_rag"
    with Session(engine) as session:
        # Cleanup previous run
        stmt = select(Task).where(Task.user_id == user_id)
        for t in session.exec(stmt).all():
            session.delete(t)
        session.commit()

        # Add task
        task = Task(
            user_id=user_id,
            title="Buy almond milk",
            description="Get the unsweetened kind from the store",
            tags="groceries"
        )
        session.add(task)
        session.commit()
        print(f"Created task: {task.title}")

    # 2. Search for "chores" or "drink"
    query = "healthy drink"
    print(f"Searching for: '{query}'")
    
    try:
        results = search_tasks_semantic(user_id, query, limit=5)
    except Exception as e:
        print(f"Search failed: {e}")
        return

    print(f"Found {len(results)} results.")
    for r in results:
        print(f"- {r['title']} (Score: {r['relevance_score']})")

    # 3. Assert
    if any(r['title'] == "Buy almond milk" for r in results):
        print("SUCCESS: Found relevant task.")
    else:
        print("FAILURE: Did not find relevant task.")

if __name__ == "__main__":
    test_rag()
