from sqlmodel import Session, select, col
from typing import Optional, List
from datetime import datetime
import uuid
from app.models import Task, TaskCreate, TaskUpdate

class TaskService:
    @staticmethod
    def get_tasks(
        session: Session,
        user_id: uuid.UUID,
        filter_status: Optional[str] = None,
        sort_by: str = "created_at",
        search: Optional[str] = None
    ) -> List[Task]:
        """Fetch tasks for a specific user with filtering, sorting, and search."""
        statement = select(Task).where(Task.user_id == user_id)
        
        if filter_status == "completed":
            statement = statement.where(Task.completed == True)
        elif filter_status == "pending":
            statement = statement.where(Task.completed == False)
            
        if search:
            search_pattern = f"%{search}%"
            statement = statement.where(
                (col(Task.title).ilike(search_pattern)) | 
                (col(Task.description).ilike(search_pattern))
            )
            
        if sort_by == "title":
            statement = statement.order_by(Task.title)
        elif sort_by == "updated_at":
            statement = statement.order_by(Task.updated_at.desc())
        else:
            statement = statement.order_by(Task.created_at.desc())
            
        return session.exec(statement).all()

    @staticmethod
    def create_task(session: Session, user_id: uuid.UUID, task_data: TaskCreate) -> Task:
        """Create a new task."""
        new_task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description
        )
        session.add(new_task)
        session.commit()
        session.refresh(new_task)
        return new_task

    @staticmethod
    def update_task(session: Session, user_id: uuid.UUID, task_id: uuid.UUID, task_data: TaskUpdate) -> Optional[Task]:
        """Update an existing task if it belongs to the user."""
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return None
            
        if task_data.title is not None:
            task.title = task_data.title
        if task_data.description is not None:
            task.description = task_data.description
        if task_data.completed is not None:
            task.completed = task_data.completed
            
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def delete_task(session: Session, user_id: uuid.UUID, task_id: uuid.UUID) -> bool:
        """Delete a task if it belongs to the user."""
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return False
            
        session.delete(task)
        session.commit()
        return True

    @staticmethod
    def toggle_task_completion(session: Session, user_id: uuid.UUID, task_id: uuid.UUID) -> Optional[Task]:
        """Toggle the completion status of a task."""
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return None
            
        task.completed = not task.completed
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def get_task(session: Session, user_id: uuid.UUID, task_id: uuid.UUID) -> Optional[Task]:
        """Fetch a specific task."""
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            return None
        return task
