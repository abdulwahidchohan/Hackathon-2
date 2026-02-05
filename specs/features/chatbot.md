# Feature: AI Chatbot (Phase III)

## Overview
An intelligent agent that manages tasks via natural language.

## Capabilities (Advanced)
The agent understands context and can manipulate all task fields.

### User Intents
1. **Add Task**:
   - "Remind me to call mom" (Basic)
   - "Process payroll every Friday at 5 PM" (Recurring + Due Date)
   - "Add a high priority task for server maintenance" (Priority)
2. **Query/List**:
   - "What do I have to do?"
   - "Show me my high priority work items"
   - "Any tasks tagged ' urgent'?"
3. **Update**:
   - "Change the meeting to 3 PM"
   - "Make that task high priority"
4. **Complete**:
   - "I finished the report"

## MCP Tools
The agent uses the following tools (mapped to `agent_tools.py`):
- `add_task(title, priority, tags, due_date, recurring_rule...)`
- `list_tasks(status, priority, tag, search)`
- `update_task(...)`
- `complete_task(...)`
- `delete_task(...)`

## Conversation Logic
- Stateless server.
- History stored in `conversations` and `messages` tables.
- Context window includes previous turn.
