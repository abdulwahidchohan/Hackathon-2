# [Task]: T-003, T-004, T-005
# [From]: specs/features/task-crud.md (View, Add, Update, Delete, Mark Complete); specs_history/speckit.tasks.md

import argparse
import sys

from todo.store import TASK_NOT_FOUND, TodoStore

STORE = TodoStore()


def _format_task(t) -> str:
    status = "done" if t.completed else "pending"
    created = t.created_at.strftime("%Y-%m-%d %H:%M")
    desc = f" — {t.description}" if t.description else ""
    meta = []
    if t.priority != "medium": meta.append(f"[{t.priority}]")
    if t.tags: meta.append(f"Tags:{','.join(t.tags)}")
    if t.due_date: meta.append(f"Due:{t.due_date}")
    if t.recurring_rule: meta.append(f"Repeat:{t.recurring_rule}")
    meta_str = " " + " ".join(meta) if meta else ""
    return f"  [{t.id}] {t.title}{desc} ({status}) — {created}{meta_str}"


def cmd_add(args: argparse.Namespace) -> int:
    try:
        tags = args.tags.split(",") if args.tags else None
        task = STORE.add(
            args.title, 
            args.description or "",
            priority=args.priority,
            tags=tags,
            recurring_rule=args.recurring
        )
        print(f"Added task [{task.id}] {task.title}")
        return 0
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


def cmd_list(_args: argparse.Namespace) -> int:
    tasks = STORE.list_all()
    if not tasks:
        print("No tasks.")
        return 0
    print("Tasks:")
    for t in tasks:
        print(_format_task(t))
    return 0


def cmd_update(args: argparse.Namespace) -> int:
    try:
        task_id = int(args.id)
    except ValueError:
        print("Error: id must be an integer", file=sys.stderr)
        return 1
    
    # If no update args provided
    if not any([args.title, args.description is not None, args.priority, args.tags is not None, args.recurring is not None]):
        print("Error: provide at least --title, --description, --priority, --tags, or --recurring", file=sys.stderr)
        return 1
        
    try:
        tags = args.tags.split(",") if args.tags else None
        task = STORE.update(
            task_id,
            title=args.title if args.title else None,
            description=args.description if args.description is not None else None,
            priority=args.priority if args.priority else None,
            tags=tags,
            recurring_rule=args.recurring if args.recurring is not None else None
        )
        print(f"Updated task [{task.id}] {task.title}")
        return 0
    except LookupError as e:
        if str(e) == TASK_NOT_FOUND:
            print(f"Error: {TASK_NOT_FOUND}", file=sys.stderr)
            return 1
        raise
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


def cmd_delete(args: argparse.Namespace) -> int:
    try:
        task_id = int(args.id)
    except ValueError:
        print("Error: id must be an integer", file=sys.stderr)
        return 1
    try:
        task = STORE.delete(task_id)
        print(f"Deleted task [{task.id}] {task.title}")
        return 0
    except LookupError:
        print(f"Error: {TASK_NOT_FOUND}", file=sys.stderr)
        return 1


def cmd_complete(args: argparse.Namespace) -> int:
    try:
        task_id = int(args.id)
    except ValueError:
        print("Error: id must be an integer", file=sys.stderr)
        return 1
    try:
        task = STORE.complete(task_id)
        status = "completed" if task.completed else "incomplete"
        print(f"Task [{task.id}] {task.title} marked as {status}")
        return 0
    except LookupError:
        print(f"Error: {TASK_NOT_FOUND}", file=sys.stderr)
        return 1


def main() -> None:
    parser = argparse.ArgumentParser(description="Evolution of Todo — Phase I console app")
    subparsers = parser.add_subparsers(dest="command", required=True, help="Command")

    add_p = subparsers.add_parser("add", help="Add a task")
    add_p.add_argument("title", help="Task title (1–200 characters)")
    add_p.add_argument("--description", "-d", default="", help="Optional description (max 1000 chars)")
    add_p.add_argument("--priority", "-p", default="medium", choices=["low", "medium", "high"], help="Priority")
    add_p.add_argument("--tags", help="Comma-separated tags (e.g. work,home)")
    add_p.add_argument("--recurring", choices=["daily", "weekly", "monthly"], help="Recurring rule")
    add_p.set_defaults(func=cmd_add)

    subparsers.add_parser("list", help="List all tasks").set_defaults(func=cmd_list)

    update_p = subparsers.add_parser("update", help="Update a task by ID")
    update_p.add_argument("id", help="Task ID")
    update_p.add_argument("--title", "-t", help="New title")
    update_p.add_argument("--description", "-d", help="New description")
    update_p.add_argument("--priority", "-p", choices=["low", "medium", "high"], help="New priority")
    update_p.add_argument("--tags", help="New tags")
    update_p.add_argument("--recurring", choices=["daily", "weekly", "monthly"], help="New recurring rule")
    update_p.set_defaults(func=cmd_update)

    del_p = subparsers.add_parser("delete", help="Delete a task by ID")
    del_p.add_argument("id", help="Task ID")
    del_p.set_defaults(func=cmd_delete)

    complete_p = subparsers.add_parser("complete", help="Toggle task completion by ID")
    complete_p.add_argument("id", help="Task ID")
    complete_p.set_defaults(func=cmd_complete)

    args = parser.parse_args()
    exit_code = args.func(args)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
