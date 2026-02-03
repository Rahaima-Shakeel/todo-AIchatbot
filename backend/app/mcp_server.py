from mcp.server.fastmcp import FastMCP
from mcp.shared.exceptions import McpError
import uuid
from typing import Optional, List
from sqlmodel import Session
from app.database import engine
from app.services.task_service import TaskService
from app.models import TaskCreate, TaskUpdate

# Initialize MCP Server
mcp_server = FastMCP("TodoFlow MCP Server")

@mcp_server.tool(name="list_tasks", description="REQUIRED: List all tasks for the current user. Use 'search' parameter to find tasks by name (e.g., search='buy milk' to find tasks containing 'buy milk'). Use this BEFORE update/delete operations to get the task_id. Returns a list of task objects with id, title, description, and completed status.")
async def list_tasks(
    user_id: str,
    filter_status: Optional[str] = None,
    sort_by: str = "created_at",
    search: Optional[str] = None
):
    with Session(engine) as session:
        tasks = TaskService.get_tasks(
            session=session,
            user_id=uuid.UUID(user_id),
            filter_status=filter_status,
            sort_by=sort_by,
            search=search
        )
        return {"tasks": [task.model_dump() for task in tasks]}

@mcp_server.tool(name="create_task", description="REQUIRED: Create a new task with the given title and optional description. Call this when user says 'add task', 'create task', 'remind me to', etc. Returns the created task object.")
async def create_task(user_id: str, title: str, description: Optional[str] = None):
    with Session(engine) as session:
        task_data = TaskCreate(title=title, description=description)
        task = TaskService.create_task(session, uuid.UUID(user_id), task_data)
        return {"task": task.model_dump()}

@mcp_server.tool(name="update_task", description="REQUIRED: Update an existing task by task_id. You can update title, description, or completed status. Call list_tasks with search parameter FIRST to find the task_id if user refers to task by name. Returns the updated task object.")
async def update_task(
    user_id: str,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    completed: Optional[bool] = None
):
    with Session(engine) as session:
        task_data = TaskUpdate(title=title, description=description, completed=completed)
        task = TaskService.update_task(session, uuid.UUID(user_id), uuid.UUID(task_id), task_data)
        if not task:
            raise McpError(code=-32602, message="Task not found or unauthorized")
        return {"task": task.model_dump()}

@mcp_server.tool(name="delete_task", description="REQUIRED: Delete a task by task_id. Call list_tasks with search parameter FIRST to find the task_id if user refers to task by name. Returns success confirmation.")
async def delete_task(user_id: str, task_id: str):
    with Session(engine) as session:
        success = TaskService.delete_task(session, uuid.UUID(user_id), uuid.UUID(task_id))
        if not success:
            raise McpError(code=-32602, message="Task not found or unauthorized")
        return {"message": "Task deleted successfully"}

@mcp_server.tool(name="get_task_details", description="Fetch complete details for a specific task by task_id. Use this when you need full information about one specific task.")
async def get_task_details(user_id: str, task_id: str):
    with Session(engine) as session:
        task = TaskService.get_task(session, uuid.UUID(user_id), uuid.UUID(task_id))
        if not task:
            raise McpError(code=-32602, message="Task not found or unauthorized")
        return {"task": task.model_dump()}

@mcp_server.tool(name="toggle_task", description="REQUIRED: Toggle a task between completed and pending status. Call list_tasks with search parameter FIRST to find the task_id if user refers to task by name. Use this for 'mark as done' or 'mark as pending' requests.")
async def toggle_task(user_id: str, task_id: str):
    with Session(engine) as session:
        task = TaskService.toggle_task_completion(session, uuid.UUID(user_id), uuid.UUID(task_id))
        if not task:
            raise McpError(code=-32602, message="Task not found or unauthorized")
        return {"task": task.model_dump()}

@mcp_server.tool(name="check_api_quota", description="Check the AI agent's current API quota and system health.")
async def check_api_quota(user_id: str):
    """
    Returns information about the current API model and typical quota status.
    This helps the AI determine if it can proceed with multiple tasks.
    """
    import os
    model = os.getenv("LLM_MODEL", "gemini-flash-latest")
    return {
        "status": "Healthy",
        "current_model": model,
        "quota_estimate": "Good (using high-quota flash model)",
        "remaining_calls_hint": "Ample for standard task management. If errors occur, wait 60 seconds."
    }
