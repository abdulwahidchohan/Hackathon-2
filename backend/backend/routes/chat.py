# Phase III — Chat endpoint + OpenAI Agents SDK
# [From]: Hackathon Phase III — POST /api/{user_id}/chat, stateless, persist to DB

import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from backend.auth import get_current_user_id
from backend.database import get_session
from backend.models import Conversation, Message
from backend.routes.tasks import require_user_match  # Path + get_current_user_id

router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    conversation_id: int | None = None
    message: str


class ChatResponse(BaseModel):
    conversation_id: int
    response: str
    tool_calls: list[dict] = []


def _get_agent_and_run(user_id: str, messages: list[dict]):
    import google.generativeai as genai
    from google.generativeai.types import content_types
    from collections.abc import Iterable

    if not os.environ.get("GEMINI_API_KEY"):
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY not set")
    
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

    from backend.agent_tools import (
        add_task as add_task_impl,
        complete_task as complete_task_impl,
        delete_task as delete_task_impl,
        list_tasks as list_tasks_impl,
        update_task as update_task_impl,
        search_tasks as search_tasks_impl,
    )

    # 1. Define tools wrappers
    # Gemini SDK accepts functions directly. We just need to wrap them if we want to inject user_id.

    def add_task_tool(
        title: str, 
        description: str = "",
        priority: str = "medium",
        tags: str | None = None,
        due_date: str | None = None,
        recurring_rule: str | None = None
    ):
        """Create a new task. 
        priority: 'low', 'medium', 'high'.
        tags: comma-separated.
        due_date: ISO 8601 string.
        recurring_rule: 'daily', 'weekly', 'monthly'.
        """
        return add_task_impl(
            user_id, 
            title, 
            description, 
            priority=priority, 
            tags=tags, 
            due_date=due_date, 
            recurring_rule=recurring_rule
        )

    def list_tasks_tool(
        status: str = "all",
        priority: str | None = None,
        tag: str | None = None,
        search: str | None = None
    ):
        """List tasks with filtering.
        status: 'all' | 'pending' | 'completed'.
        """
        return list_tasks_impl(
            user_id, 
            status=status,
            priority=priority,
            tag=tag,
            search=search
        )

    def search_tasks_tool(query: str):
        """Semantic search for tasks. Use this for vague queries like 'What do I need to do?' or 'Any chores?'.
        Returns tasks relevant to the query based on meaning.
        """
        return search_tasks_impl(user_id, query)

    def complete_task_tool(task_id: int):
        """Mark a task complete (toggle)."""
        return complete_task_impl(user_id, task_id)

    def delete_task_tool(task_id: int):
        """Delete a task by id."""
        return delete_task_impl(user_id, task_id)

    def update_task_tool(
        task_id: int, 
        title: str | None = None, 
        description: str | None = None,
        priority: str | None = None,
        tags: str | None = None,
        due_date: str | None = None,
        recurring_rule: str | None = None
    ):
        """Update task details."""
        return update_task_impl(
            user_id, 
            task_id, 
            title=title, 
            description=description,
            priority=priority,
            tags=tags,
            due_date=due_date,
            recurring_rule=recurring_rule
        )

    tools_list = [
        add_task_tool,
        list_tasks_tool,
        search_tasks_tool,
        complete_task_tool,
        delete_task_tool,
        update_task_tool,
    ]

    # 2. Initialize Model
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        tools=tools_list,
        system_instruction=f"You are a helpful todo assistant. user_id: {user_id}. Use tools to manage tasks. Confirm actions nicely."
    )

    # 3. Convert messages to Gemini format
    # OpenAI: [{"role": "user", "content": "hi"}, {"role": "assistant", "content": "hello"}]
    # Gemini: history=[{"role": "user", "parts": ["hi"]}, {"role": "model", "parts": ["hello"]}]
    gemini_history = []
    
    # Allow only user and model roles for history
    for m in messages[:-1]: # All except the last new message
        role = "user" if m.get("role") == "user" else "model"
        content = m.get("content", "") or ""
        gemini_history.append({"role": role, "parts": [content]})
    
    # 4. Start Chat
    chat = model.start_chat(history=gemini_history, enable_automatic_function_calling=True)
    
    # 5. Send message
    last_msg = messages[-1].get("content", "")
    response = chat.send_message(last_msg)
    
    final_text = response.text
    
    # 6. Extract tool calls (approximation)
    # With enable_automatic_function_calling=True, the SDK handles the calls and produces a final text response.
    # We can inspect `chat.history` to find function calls if we really need to return them to the frontend.
    # backend/routes/chat.py ChatResponse expects `tool_calls: list[dict]`.
    # Let's inspect the last turn in history.
    
    # 6. Extract tool calls
    # With automatic function calling, the SDK manages the turns.
    # We inspect the new messages added to history to find any function calls.
    
    tool_calls_list = []
    new_messages = chat.history[len(gemini_history):]
    
    for msg in new_messages:
        for part in msg.parts:
            if fn := part.function_call:
                tool_calls_list.append({
                    "name": fn.name, 
                    "arguments": dict(fn.args)
                })
    
    return (final_text, tool_calls_list)


@router.post("/{user_id}/chat", response_model=ChatResponse)
def chat(
    user_id: Annotated[str, Depends(require_user_match)],
    body: ChatRequest,
    session: Annotated[Session, Depends(get_session)],
):
    if not (body.message and body.message.strip()):
        raise HTTPException(status_code=400, detail="message is required")

    conv_id = body.conversation_id
    if conv_id is not None:
        conv = session.get(Conversation, conv_id)
        if not conv or conv.user_id != user_id:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = Conversation(user_id=user_id)
        session.add(conv)
        session.commit()
        session.refresh(conv)
        conv_id = conv.id

    # Load history
    stmt = select(Message).where(Message.conversation_id == conv_id).order_by(Message.id)
    history = list(session.exec(stmt).all())
    messages = [{"role": m.role, "content": m.content} for m in history]

    # Append new user message
    user_content = body.message.strip()
    messages.append({"role": "user", "content": user_content})

    # Save user message
    user_msg = Message(user_id=user_id, conversation_id=conv_id, role="user", content=user_content)
    session.add(user_msg)
    session.commit()

    # Run agent
    try:
        response_text, tool_calls_list = _get_agent_and_run(user_id, messages)
    except Exception as e:
        response_text = f"Sorry, I encountered an error: {e!s}"
        tool_calls_list = []

    # Save assistant message
    assistant_msg = Message(user_id=user_id, conversation_id=conv_id, role="assistant", content=response_text)
    session.add(assistant_msg)
    session.commit()

    return ChatResponse(conversation_id=conv_id, response=response_text, tool_calls=tool_calls_list)
