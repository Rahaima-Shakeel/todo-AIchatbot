
from sqlmodel import Session, select
from app.database import engine
from app.models import ChatMessage
import uuid

def clear_history():
    # User ID found in logs
    target_user_id = uuid.UUID("824cfafe-d7f0-4f6a-9f60-16df9dcf4f7a")
    with Session(engine) as session:
        statement = select(ChatMessage).where(ChatMessage.user_id == target_user_id)
        results = session.exec(statement)
        count = 0
        for msg in results:
            session.delete(msg)
            count += 1
        session.commit()
        print(f"Cleared {count} messages for user {target_user_id}")

if __name__ == "__main__":
    clear_history()
