import os
import uuid
import json
from typing import Optional, AsyncGenerator
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage

from agenticrag.graph import create_agent

# Initialize FastAPI application
app = FastAPI(
    title="Agentic-RAG API",
    description="Production-ready FastAPI backend for Agentic-RAG with memory, dynamic routing, and token streaming",
    version="1.0.0"
)

# Enable CORS for frontend clients (e.g. Vite dev server on http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compile agent graph with in-memory checkpointer once at application startup
agent_app = create_agent()

GENERATION_NODES = {
    "generate_from_kb",
    "generate_from_web",
    "direct_answer",
    "answer_insufficient"
}

NODE_STATUS_MESSAGES = {
    "route_question": "Analyzing question & routing...",
    "retrieve_kb": "Searching private knowledge base...",
    "grade_kb_evidence": "Evaluating knowledge base evidence quality...",
    "search_web": "Searching real-time web with Tavily...",
    "grade_web_evidence": "Evaluating web search evidence...",
    "rewrite_query": "Refining search query for better precision...",
    "generate_from_kb": "Synthesizing answer from knowledge base...",
    "generate_from_web": "Synthesizing answer from web results...",
    "direct_answer": "Formulating direct response...",
    "answer_insufficient": "Assessing insufficient context..."
}


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User question or statement")
    thread_id: Optional[str] = Field(None, description="Session/Thread identifier for conversation memory")
    stream: Optional[bool] = Field(False, description="Whether to stream the response as Server-Sent Events (SSE)")


class ChatResponse(BaseModel):
    response: str = Field(..., description="Assistant's response text")
    thread_id: str = Field(..., description="Active thread ID for conversational continuity")
    source_used: Optional[str] = Field(None, description="Data source used (private_kb, web_search, direct, etc.)")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Agentic-RAG Backend"}


@app.get("/kb/info")
def kb_info_endpoint():
    from agenticrag.nodes import retriever, INDEX_NAME, NAMESPACE
    return {
        "index_name": INDEX_NAME,
        "namespace": NAMESPACE,
        "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
        "dimension": 384,
        "dataset": "bitext/Bitext-customer-support-llm-chatbot-training-dataset",
        "sample_size": 500,
        "primary_intent": "cancel_order & support policies",
        "retriever_k": 4,
        "status": "connected" if retriever is not None else "disconnected"
    }


class KBSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)


@app.post("/kb/search")
def kb_search_endpoint(request: KBSearchRequest):
    from agenticrag.nodes import retriever
    if not retriever:
        raise HTTPException(status_code=500, detail="Pinecone retriever not initialized")
    try:
        docs = retriever.invoke(request.query)
        return {
            "query": request.query,
            "results": [
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata
                }
                for doc in docs
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



async def stream_agent_generator(message: str, thread_id: str) -> AsyncGenerator[str, None]:
    config = {"configurable": {"thread_id": thread_id}}
    input_data = {"messages": [HumanMessage(content=message)]}
    active_node = ""

    try:
        async for event in agent_app.astream_events(input_data, config=config, version="v2"):
            event_type = event.get("event")

            # Check if a new node started executing
            if event_type == "on_chain_start":
                node_name = event.get("metadata", {}).get("langgraph_node")
                if node_name and node_name != active_node:
                    active_node = node_name
                    status_text = NODE_STATUS_MESSAGES.get(node_name, f"Executing {node_name}...")
                    payload = json.dumps({"type": "status", "node": node_name, "message": status_text})
                    yield f"data: {payload}\n\n"

            # Stream LLM tokens when generating final answer
            elif event_type == "on_chat_model_stream":
                node_name = event.get("metadata", {}).get("langgraph_node")
                if node_name in GENERATION_NODES:
                    chunk = event.get("data", {}).get("chunk")
                    if chunk and hasattr(chunk, "content") and chunk.content:
                        payload = json.dumps({"type": "token", "token": chunk.content})
                        yield f"data: {payload}\n\n"

        # Graph execution completed; extract final state
        final_state = agent_app.get_state(config).values
        source = final_state.get("source_used", "direct")
        
        # In case answer_insufficient didn't stream tokens via LLM
        messages = final_state.get("messages", [])
        last_content = messages[-1].content if messages else ""

        payload = json.dumps({
            "type": "done",
            "thread_id": thread_id,
            "source_used": source,
            "full_content": last_content
        })
        yield f"data: {payload}\n\n"

    except Exception as e:
        print(f"[Streaming Error]: {e}")
        error_payload = json.dumps({"type": "error", "error": str(e)})
        yield f"data: {error_payload}\n\n"


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    thread_id = request.thread_id.strip() if request.thread_id else str(uuid.uuid4())
    
    # If client requested streaming
    if request.stream:
        return StreamingResponse(
            stream_agent_generator(request.message, thread_id),
            media_type="text/event-stream"
        )
    
    # Synchronous invocation fallback
    config = {"configurable": {"thread_id": thread_id}}
    try:
        result = agent_app.invoke(
            {"messages": [HumanMessage(content=request.message)]},
            config=config
        )
        
        messages = result.get("messages", [])
        if not messages:
            raise HTTPException(status_code=500, detail="No response generated by agent")
            
        last_message = messages[-1]
        answer_content = last_message.content if hasattr(last_message, "content") else str(last_message)
        source = result.get("source_used", "unknown")
        
        return ChatResponse(
            response=answer_content,
            thread_id=thread_id,
            source_used=source
        )
    except Exception as e:
        print(f"[API Error] /chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    thread_id = request.thread_id.strip() if request.thread_id else str(uuid.uuid4())
    return StreamingResponse(
        stream_agent_generator(request.message, thread_id),
        media_type="text/event-stream"
    )
