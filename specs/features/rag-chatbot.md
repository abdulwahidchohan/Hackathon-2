# RAG Chatbot Specification

## Overview
The Chatbot will use Retrieval-Augmented Generation (RAG) to provide context-aware answers about the user's tasks. It will retrieve relevant tasks based on the user's query and inject them into the system prompt or tool context.

## Goal
Enable the chatbot to answer questions like:
- "What do I need to do today?"
- "Do I have any chores?"
- "Is there anything urgent?"
Even if the user doesn't use exact keyword matches.

## Architecture

### 1. Vector Store
*   **Type**: In-Memory (for simplicity and speed in this phase).
*   **Data**: Task titles and descriptions will be embedded.
*   **Storage**: A simple global variable or singleton service in FastAPI holding `List[{ vector: List[float], task_id: int, content: str }]`.
*   **Refresh Strategy**: On every request (lazy load) or periodically. Since task list is per-user and likely small (<1000), fetching all user tasks and computing similarities on the fly is feasible and ensures strict data privacy (no cross-user leakage).

### 2. Embeddings
*   **Provider**: OpenAI `text-embedding-3-small` (fast and cheap).
*   **Implementation**: `backend/backend/rag.py`.

### 3. Retrieval Process
1.  User sends message.
2.  Backend computes embedding for user message.
3.  Backend fetches all active tasks for the user from DB.
4.  Backend computes embeddings for tasks (or uses cached if optimization needed).
    *   *Optimization*: For hackathon, real-time embedding only the query and performing keyword + semantic search on tasks might be enough.
    *   *Better approach*: Store embeddings in a separate table content, but let's stick to **Real-time Semantic Search** if lists are small, or **Cached Embeddings**.
    *   *Decision*: **On-demand Embedding** is too slow if many tasks.
    *   *Revised Decision*: **Keyword Search + Semantic Search with caching**.
    *   *Simplest RAG*: The Chatbot will use a `search_tasks(query)` tool. This tool will perform the retrieval. This keeps the Chat loop clean.

### 4. Integration
*   **Tool**: `search_tasks(query: str)` -> Returns list of relevant tasks.
*   **Agent**: The agent decides when to call `search_tasks`.
*   **Prompt**: "You have access to a RAG search tool. Use it to find tasks relevant to the user's request."

## Detailed Flow
1.  User: "Do I have chores?"
2.  Agent calls `search_tasks("chores")`.
3.  `search_tasks` logic:
    *   Fetch user's tasks.
    *   Generate embedding for "chores".
    *   Generate/Get embeddings for tasks.
    *   Compute Cosine Similarity.
    *   return Top 5 tasks.
4.  Agent receives tasks: ["Buy milk", "Clean room"].
5.  Agent responds: "Yes, you need to buy milk and clean your room."

## Files to Create/Modify
*   `backend/backend/rag.py`: `generate_embedding`, `cosine_similarity`, `search_tasks_semantic`.
*   `backend/backend/agent_tools.py`: Add `search_tasks` tool wrapping RAG logic.
*   `backend/backend/routes/chat.py`: Ensure agent knows about the new tool.
