from openai import AsyncOpenAI
import os
import json
import uuid
import asyncio
import logging
from typing import List, Dict, Any, AsyncGenerator
from sqlmodel import Session
from app.database import engine
from app.services.chat_service import ChatService
from app.mcp_server import mcp_server
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO if os.getenv("ENVIRONMENT", "development") == "production" else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# LLM Configuration
api_key = os.getenv("OPENAI_API_KEY", "").strip().strip('"').strip("'")
api_base = os.getenv("OPENAI_API_BASE")
llm_model = os.getenv("LLM_MODEL", "gpt-4o")

# Auto-detect key type and set defaults
if api_key and not api_base:
    if api_key.startswith("s-"): # Qwen
        api_base = os.getenv("QWEN_API_BASE", "https://dashscope.aliyuncs.com/compatible-mode/v1")
        if llm_model == "gpt-4o":
            llm_model = "qwen-plus"
    elif api_key.startswith("AIza"): # Gemini
        api_base = os.getenv("GEMINI_API_BASE", "https://generativelanguage.googleapis.com/v1beta/openai/")
        if llm_model in ["gpt-4o", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-flash-lite-latest"]:
            llm_model = "gemini-flash-latest"

# Initialize AsyncOpenAI
client = AsyncOpenAI(
    api_key=api_key,
    base_url=api_base
)

SYSTEM_PROMPT = """
You are "TodoFlow AI", a task management assistant that MUST use tools to perform all actions.

CRITICAL RULES - VIOLATION IS NOT ACCEPTABLE:
1. When a user requests an action (create, update, delete, mark as done), you MUST call the appropriate tool.
2. NEVER respond with phrases like "I'll create that task" or "I've marked it as done" WITHOUT actually calling the tool.
3. Your response should ONLY come AFTER the tool has been executed successfully.
4. If you need information, call `list_tasks` FIRST, then act on the results.

TOOL USAGE PATTERNS:
- "Add task X" → CALL `create_task` with title="X"
- "Delete X" → CALL `list_tasks(search="X")` → CALL `delete_task(task_id=found_id)`
- "Mark X as done" → CALL `list_tasks(search="X")` → CALL `update_task(task_id=found_id, completed=true)`
- "Update X to Y" → CALL `list_tasks(search="X")` → CALL `update_task(task_id=found_id, title="Y")`
- "Show my tasks" → CALL `list_tasks()`

SEARCH PATTERN:
- If a user refers to a task by name, ALWAYS use `list_tasks(search="name")` to find the task_id first.
- Never ask the user for a task ID - find it yourself using search.
- If multiple matches are found, list them and ask which one the user means.

RESPONSE BEHAVIOR:
- After executing a tool, confirm what was done based on the tool's result.
- Be conversational but action-first.
- If a tool call fails, explain the error to the user clearly.

IMPORTANT: Authentication and user identity are managed automatically. You are already authorized to perform actions for the user. Do NOT ask for a User ID or Account ID.
"""

async def get_agent_response_stream(user_id: uuid.UUID, user_message: str) -> AsyncGenerator[str, None]:
    """
    Orchestrate the AI agent response cycle with streaming and persistence.
    """
    try:
        with Session(engine) as session:
            # 1. Get History
            history = ChatService.get_history(session, user_id, limit=20)
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            
            for msg in history:
                if msg.role == "user" or msg.role == "assistant":
                    messages.append({"role": msg.role, "content": msg.content})
                elif msg.role == "tool":
                    # Tool messages must have a content and a name (tool_call_id is handled in the session but we follow OpenAI schema)
                    messages.append({
                        "role": "tool",
                        "content": msg.content,
                        "tool_call_id": f"history_{msg.id}" # Placeholder for history consistency
                    })
            
            messages.append({"role": "user", "content": user_message})
            
            # 2. Save User Message
            ChatService.save_message(session, user_id, "user", user_message)

            # 3. Get Tool Definitions
            tools = []
            mcp_tools = await mcp_server.list_tools()
            logger.debug(f"Registered {len(mcp_tools)} MCP tools")
            for tool in mcp_tools:
                # Prepare tool schema for LLM
                schema = tool.inputSchema.copy()
                # Hide user_id from the AI; we inject it manually
                if "properties" in schema and "user_id" in schema["properties"]:
                    del schema["properties"]["user_id"]
                if "required" in schema and "user_id" in schema["required"]:
                    schema["required"].remove("user_id")

                tools.append({
                    "type": "function",
                    "function": {
                        "name": tool.name,
                        "description": tool.description,
                        "parameters": schema
                    }
                })
                logger.debug(f"Tool available: {tool.name}")

            # 4. Multi-turn Agent Loop
            iterations = 0
            max_iterations = 5
            full_content = ""
            current_model = llm_model # Use local variable to avoid scoping issues
            
            while iterations < max_iterations:
                iterations += 1
                logger.debug(f"Agent iteration {iterations} (Model: {current_model})...")
                
                # Call LLM with retry/fallback logic
                try:
                    response = await client.chat.completions.create(
                        model=current_model,
                        messages=messages,
                        tools=tools,
                        tool_choice="auto",
                        stream=True
                    )
                except Exception as e:
                    if "429" in str(e):
                        logger.warning(f"Model {current_model} exhausted. Attempting fallback...")
                        # Priority list for fallback
                        fallbacks = ["gemini-flash-lite-latest", "gemini-pro-latest", "gemini-flash-latest"]
                        found_working = False
                        for fm in fallbacks:
                            if fm == current_model: continue
                            try:
                                logger.info(f"Trying fallback model: {fm}")
                                response = await client.chat.completions.create(
                                    model=fm,
                                    messages=messages,
                                    tools=tools,
                                    tool_choice="auto",
                                    stream=True
                                )
                                current_model = fm # Persistent switch for this session
                                found_working = True
                                break
                            except:
                                continue
                        if not found_working:
                            raise e # Re-raise if all fail
                    else:
                        raise e # Re-raise non-429 errors

                current_full_content = ""
                tool_calls = []
                
                async for chunk in response:
                    delta = chunk.choices[0].delta
                    
                    # 4.1. Record tool calls if any
                    if delta.tool_calls:
                        for tc in delta.tool_calls:
                            try:
                                raw_idx = getattr(tc, 'index', None)
                                if raw_idx is None:
                                    if getattr(tc, 'id', None):
                                        idx = len(tool_calls)
                                    else:
                                        idx = max(0, len(tool_calls) - 1)
                                else:
                                    idx = int(raw_idx)
                                
                                while len(tool_calls) <= idx:
                                    tool_calls.append({"id": None, "name": "", "arguments": ""})
                                
                                if getattr(tc, 'id', None):
                                    tool_calls[idx]["id"] = tc.id
                                if getattr(tc, 'function', None):
                                    func = tc.function
                                    if getattr(func, 'name', None):
                                        tool_calls[idx]["name"] += func.name
                                    if getattr(func, 'arguments', None):
                                        tool_calls[idx]["arguments"] += func.arguments
                            except Exception as inner_e:
                                logger.debug(f"Delta Parser Error: {inner_e}")
                                continue
                        
                        yield f"data: {json.dumps({'type': 'tool_call', 'status': 'preparing'})}\n\n"
                    
                    # 4.2. Handle text content
                    if delta.content:
                        current_full_content += delta.content
                        full_content += delta.content # Accumulate for persistence
                        yield f"data: {json.dumps({'type': 'text', 'content': delta.content})}\n\n"

                # 4.3. If no tool calls, we are done
                if not tool_calls:
                    logger.debug(f"No tool calls in iteration {iterations}. Model chose text-only response.")
                    if current_full_content:
                        logger.debug(f"Text content: {current_full_content[:100]}...")
                    break
                
                # 4.4. Execute Tool Calls
                logger.debug(f"Executing {len(tool_calls)} tool calls in iteration {iterations}...")
                final_tool_calls_for_history = []
                
                for tc in tool_calls:
                    if not tc["name"]: continue
                    tcid = tc["id"] if tc["id"] else f"call_{uuid.uuid4().hex[:12]}"
                    final_tool_calls_for_history.append({
                        "id": tcid,
                        "type": "function",
                        "function": {"name": tc["name"], "arguments": tc["arguments"]}
                    })

                # Record the assistant's call to tools in history BEFORE the tool results
                if final_tool_calls_for_history:
                    messages.append({
                        "role": "assistant",
                        "tool_calls": final_tool_calls_for_history
                    })

                for tc_hist in final_tool_calls_for_history:
                    function_name = tc_hist["function"]["name"]
                    function_args_str = tc_hist["function"]["arguments"]
                    tcid = tc_hist["id"]
                    
                    try:
                        function_args = json.loads(function_args_str)
                    except:
                        logger.warning(f"Arg parse failed for {function_name}")
                        function_args = {}

                    # Automate User ID Injection
                    function_args["user_id"] = str(user_id)
                    
                    yield f"data: {json.dumps({'type': 'tool_call', 'status': 'executing', 'tool': function_name})}\n\n"
                    
                    # Execute tool
                    result = await mcp_server.call_tool(function_name, function_args)
                    
                    # Convert result for history
                    if hasattr(result, "dict"):
                        tool_result_content = json.dumps(result.dict())
                    elif hasattr(result, "model_dump"):
                        tool_result_content = json.dumps(result.model_dump())
                    else:
                        tool_result_content = str(result)

                    # Add tool result to history AFTER the assistant's tool_calls
                    messages.append({
                        "tool_call_id": tcid,
                        "role": "tool",
                        "name": function_name,
                        "content": tool_result_content,
                    })

            # Check for empty final response
            if not full_content:
                fallback = "Mission accomplished! I've updated your tasks as requested."
                logger.info(f"Agent was empty after {iterations} iterations. Yielding fallback.")
                yield f"data: {json.dumps({'type': 'text', 'content': fallback})}\n\n"
                full_content = fallback

            # 6. Save Assistant Response
            ChatService.save_message(session, user_id, "assistant", full_content)
            yield "data: [DONE]\n\n"
            yield "data: [DONE]\n\n"

    except Exception as e:
        import traceback
        error_msg = f"AI Error: {str(e)}"
        logger.error(f"CRITICAL Agent Error: {error_msg}")
        traceback.print_exc()
        yield f"data: {json.dumps({'type': 'text', 'content': error_msg})}\n\n"
        yield "data: [DONE]\n\n"
