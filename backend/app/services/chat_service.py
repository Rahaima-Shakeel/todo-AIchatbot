from sqlmodel import Session, select
from typing import List
import uuid
from datetime import datetime
from app.models import ChatMessage, ChatMessageResponse

class ChatService:
    @staticmethod
    def save_message(session: Session, user_id: uuid.UUID, role: str, content: str) -> ChatMessage:
        """Save a new chat message to the history."""
        message = ChatMessage(
            user_id=user_id,
            role=role,
            content=content,
            timestamp=datetime.utcnow()
        )
        session.add(message)
        session.commit()
        session.refresh(message)
        return message

    @staticmethod
    def get_history(session: Session, user_id: uuid.UUID, limit: int = 15) -> List[ChatMessage]:
        """Retrieve the recent chat history for a user to provide context to the AI."""
        statement = (
            select(ChatMessage)
            .where(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.timestamp.desc())
            .limit(limit)
        )
        messages = session.exec(statement).all()
        # Return in chronological order
        return sorted(messages, key=lambda x: x.timestamp)
