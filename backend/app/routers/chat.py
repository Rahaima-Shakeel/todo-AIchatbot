from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session
import uuid
import json
from typing import List

from app.database import get_session
from app.models import User, ChatMessageResponse
from app.auth import get_current_user
from app.agent import get_agent_response_stream
from app.services.chat_service import ChatService

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/stream")
async def chat_stream(
    message: str,
    current_user: User = Depends(get_current_user)
):
    """
    Send a message to the AI agent and get a streaming response via SSE.
    """
    return StreamingResponse(
        get_agent_response_stream(current_user.id, message),
        media_type="text/event-stream"
    )

@router.post("", response_model=ChatMessageResponse)
async def chat_legacy(
    message: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Legacy non-streaming endpoint. 
    (Kept for compatibility during transition)
    """
    from app.agent import AsyncOpenAI as InternalAsyncOpenAI # Local import to avoid circular issues if any
    # Since we refactored agent.py to be stream-only, we might need a sync wrapper or just use the stream
    full_content = ""
    async for chunk in get_agent_response_stream(current_user.id, message):
        if chunk.startswith("data: "):
            data_str = chunk[6:].strip()
            if data_str == "[DONE]":
                break
            try:
                data = json.loads(data_str)
                if data.get("type") == "text":
                    full_content += data.get("content", "")
            except:
                pass
    
    # Get the saved assistant message
    history = ChatService.get_history(session, current_user.id, limit=1)
    assistant_msg = history[0]
    
    return ChatMessageResponse(
        id=assistant_msg.id,
        role=assistant_msg.role,
        content=assistant_msg.content,
        timestamp=assistant_msg.timestamp
    )

@router.get("/history", response_model=List[ChatMessageResponse])
async def get_chat_history(
    limit: int = 15,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Retrieve chat history for the current user."""
    history = ChatService.get_history(session, current_user.id, limit=limit)
    return [
        ChatMessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            timestamp=msg.timestamp
        )
        for msg in history if msg.role != "tool"
    ]
