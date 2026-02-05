# Database Schema (Advanced)

## Tables

### users (managed by Better Auth)
- id: string (primary key)
- email: string (unique)
- name: string
- created_at: timestamp

### tasks
- id: integer (primary key)
- user_id: string (foreign key -> users.id, index)
- title: string (not null, max 200)
- description: text (nullable, max 1000)
- completed: boolean (default false)
- priority: string (default "medium", values: "low", "medium", "high")
- tags: text (nullable, JSON or comma-separated string)
- due_date: timestamp (nullable)
- recurring_rule: string (nullable, enum: "daily", "weekly", "monthly")
- created_at: timestamp
- updated_at: timestamp

## Indexes
- tasks.user_id
- tasks.completed
- tasks.priority
- tasks.due_date

### conversations
- id: integer (primary key)
- user_id: string (index)
- created_at: timestamp
- updated_at: timestamp

### messages
- id: integer (primary key)
- user_id: string (index)
- conversation_id: integer (foreign key -> conversations.id, index)
- role: string ("user" | "assistant")
- content: text
- created_at: timestamp
