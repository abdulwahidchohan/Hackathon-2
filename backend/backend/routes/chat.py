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


def _get_agent_and_run(user_id: str, messages: list[dict]) -> tuple[str, list[dict]]:
    """Build agent with task tools and run. Returns (final_output_text, tool_calls_list)."""
    try:
        from agents import Agent, Runner, function_tool
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="OpenAI Agents SDK not available. Install openai-agents.",
        )
    from backend.agent_tools import (
        add_task as add_task_impl,
        complete_task as complete_task_impl,
        delete_task as delete_task_impl,
        list_tasks as list_tasks_impl,
        update_task as update_task_impl,
        search_tasks as search_tasks_impl,
    )

    if not os.environ.get("OPENAI_API_KEY"):
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not set")

    @function_tool
    def add_task_tool(
        title: str, 
        description: str = "",
        priority: str = "medium",
        tags: str | None = None,
        due_date: str | None = None,
        recurring_rule: str | None = None
    ) -> dict:
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

    @function_tool
    def list_tasks_tool(
        status: str = "all",
        priority: str | None = None,
        tag: str | None = None,
        search: str | None = None
    ) -> list:
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

    @function_tool
    def search_tasks_tool(query: str) -> list:
        """Semantic search for tasks. Use this for vague queries like 'What do I need to do?' or 'Any chores?'.
        Returns tasks relevant to the query based on meaning.
        """
        return search_tasks_impl(user_id, query)

    @function_tool
    def complete_task_tool(task_id: int) -> dict:
        """Mark a task complete (toggle)."""
        return complete_task_impl(user_id, task_id)

    @function_tool
    def delete_task_tool(task_id: int) -> dict:
        """Delete a task by id."""
        return delete_task_impl(user_id, task_id)

    @function_tool
    def update_task_tool(
        task_id: int, 
        title: str | None = None, 
        description: str | None = None,
        priority: str | None = None,
        tags: str | None = None,
        due_date: str | None = None,
        recurring_rule: str | None = None
    ) -> dict:
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

    instructions = f"""You are a helpful todo assistant. The authenticated user's id is: {user_id}.
Use the task tools to add, list, complete, delete, or update tasks. Confirm actions with a friendly response.
Use 'search_tasks_tool' to find relevant tasks when the user asks vague questions or searches by meaning.
If a tool returns an error (e.g. "Task not found"), say so clearly."""

    agent = Agent(
        name="TodoAssistant",
        instructions=instructions,
        model="gpt-4o-mini",
        tools=[
            add_task_tool,
            list_tasks_tool,
            search_tasks_tool,
            complete_task_tool,
            delete_task_tool,
            update_task_tool,
        ],
    )

    sdk_messages = [{"role": m.get("role", "user"), "content": m.get("content", "") or ""} for m in messages]

    result = Runner.run_sync(agent, sdk_messages)

    tool_calls_list = []
    if hasattr(result, "run_items") and result.run_items:
        for item in result.run_items:
            if hasattr(item, "tool_calls") and item.tool_calls:
                for tc in item.tool_calls:
                    tool_calls_list.append({"name": getattr(tc, "name", ""), "arguments": getattr(tc, "arguments", {})})

    final = getattr(result, "final_output", None) or ""
    if hasattr(result, "final_output_as_text") and result.final_output_as_text:
        final = result.final_output_as_text
    if isinstance(final, list):
        texts = [c.get("text", "") if isinstance(c, dict) else str(c) for c in final]
        final = " ".join(texts) if texts else ""
    return (str(final), tool_calls_list)


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
