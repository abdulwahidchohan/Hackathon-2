import os
import math
from typing import List, Dict, Any
import google.generativeai as genai
from sqlmodel import Session, select
from backend.database import engine
from backend.models import Task

# Initialize Gemini client
# Ensure GEMINI_API_KEY is set in environment
if os.environ.get("GEMINI_API_KEY"):
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def get_embedding(text: str) -> List[float]:
    """Generate embedding for a single string."""
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_document",
    )
    return result['embedding']

def get_batch_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of strings."""
    if not texts:
        return []
    # Gemini batch embedding
    # Note: genai.embed_content doesn't support batch list directly in one call in the same way as OpenAI's strictly?
    # Actually it does, check docs or iterate. text-embedding-004 supports batch.
    # However, for simplicity and safety with the python SDK versions, iteration is safe for small lists.
    # But let's try the batch method if supported or map it.
    # The `embed_content` accepts a list of strings? No, `content` is a single string or list of chat messages.
    # We should iterate or use batch_embed_contents if available. 
    # Let's iterate for safety in this MVP.
    
    embeddings = []
    for text in texts:
         result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document",
        )
         embeddings.append(result['embedding'])
    return embeddings

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Compute cosine similarity between two vectors."""
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a * a for a in v1))
    magnitude2 = math.sqrt(sum(b * b for b in v2))
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    return dot_product / (magnitude1 * magnitude2)

def search_tasks_semantic(user_id: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Perform semantic search on user's tasks.
    1. Fetch all tasks for user.
    2. Embed query.
    3. Batch embed tasks (in-memory RAG).
    4. Rank by cosine similarity.
    """
    # 1. Get query embedding
    try:
        query_vec = get_embedding(query)
    except Exception as e:
        print(f"RAG Error: Failed to embed query: {e}")
        # Fallback to empty context or handling
        return []

    # 2. Get all user tasks
    with Session(engine) as session:
        statement = select(Task).where(Task.user_id == user_id)
        tasks = session.exec(statement).all()

    if not tasks:
        return []

    # Prepare text for embedding: "Title: Description Tags: ..."
    task_texts = []
    for t in tasks:
        content = f"{t.title}"
        if t.description:
            content += f" {t.description}"
        if t.tags:
            content += f" tags:{t.tags}"
        if t.priority:
            content += f" priority:{t.priority}"
        task_texts.append(content)
    
    # 3. Batch embed tasks
    # optimization: in a real app, vectors would be stored in DB.
    # For this hackathon/MVP, we re-embed. It's fast for <50 tasks.
    try:
        embeddings = get_batch_embeddings(task_texts)
    except Exception as e:
        print(f"RAG Error: Failed to embed tasks: {e}")
        return []

    # 4. Compute scores
    scored_tasks = []
    for i, task in enumerate(tasks):
        score = cosine_similarity(query_vec, embeddings[i])
        scored_tasks.append((score, task))

    # 5. Sort and return top K
    scored_tasks.sort(key=lambda x: x[0], reverse=True)
    top_k = scored_tasks[:limit]

    results = []
    for score, t in top_k:
        # Only return if somewhat relevant? (Threshold e.g. 0.3)
        # For now return top K regardless of score to be helpful
        results.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "tags": t.tags,
            "priority": t.priority,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "relevance_score": round(score, 3)
        })

    return results
