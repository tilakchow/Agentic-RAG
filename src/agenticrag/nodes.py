import os
from typing import List, Literal, Annotated
from typing_extensions import TypedDict
from pydantic import BaseModel, Field
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, AIMessage, AnyMessage
from langgraph.graph.message import add_messages
from langchain_groq import ChatGroq
from langchain_tavily import TavilySearch
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone

from dotenv import load_dotenv
load_dotenv()

# --- State Definition (Memory Enabled) ---
class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
    current_query: str
    kb_docs: List[Document]
    web_results: str
    kb_grade: str
    web_grade: str
    source_used: str
    retry_count: int

# --- Pydantic Models for LLM Output ---
class RouteDecision(BaseModel):
    route: Literal["kb", "direct"] = Field(
        description="Use kb for questions needing Agentic RAG docs; direct for greetings/simple chat."
    )

class EvidenceGrade(BaseModel):
    grade: Literal["good", "weak"] = Field(
        description="good means evidence can answer the question; weak means not enough evidence."
    )

# --- Global Tools & Models ---
llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0)
router_llm = llm.with_structured_output(RouteDecision, method="json_mode")
kb_grader_llm = llm.with_structured_output(EvidenceGrade, method="json_mode")
web_grader_llm = llm.with_structured_output(EvidenceGrade, method="json_mode")

web_search = TavilySearch(max_results=5, topic="general", include_answer=True, include_raw_content=False)

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    encode_kwargs={"normalize_embeddings": True},
)

# Connect to Pinecone
INDEX_NAME = "industry-agentic-rag-kb"
NAMESPACE = "bitext-support"
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY", ""))
try:
    index = pc.Index(INDEX_NAME)
    vectorstore = PineconeVectorStore(index=index, embedding=embeddings, namespace=NAMESPACE)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4, "namespace": NAMESPACE})
except Exception as e:
    print("Warning: Pinecone index not ready or accessible. Error:", e)
    retriever = None


# --- Nodes ---

def get_latest_question(state: AgentState) -> str:
    messages = state.get("messages", [])
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            return msg.content
    return ""

def route_question(state: AgentState):
    question = get_latest_question(state)

    decision = router_llm.invoke(f'''
You are a router for a Customer Support assistant.

Route to "kb" if the user asks about:
- Orders, refunds, or cancellations
- Account issues or billing
- Product support or technical issues
- Shipping and delivery
- Any company policy or complaints

Route to "direct" only for simple greetings (like "hi", "how are you"), thanks, or small talk.

Question:
{question}

Return your response as valid JSON.
Example:
{{"route": "kb"}}
''')

    print("[Router]", decision.route)
    return {
        "current_query": question,
        "source_used": decision.route,
        "retry_count": 0
    }

def route_after_router(state: AgentState) -> Literal["retrieve_kb", "direct_answer"]:
    if state["source_used"] == "kb":
        return "retrieve_kb"
    return "direct_answer"

def retrieve_kb(state: AgentState):
    query = state["current_query"]
    if retriever:
        docs = retriever.invoke(query)
    else:
        docs = []
    print(f"[KB Retriever] Retrieved: {len(docs)} chunks")
    return {"kb_docs": docs}

def grade_kb_evidence(state: AgentState):
    question = get_latest_question(state)
    context = "\n\n".join(f"Source: {doc.metadata.get('source')}\n{doc.page_content}" for doc in state["kb_docs"])

    grade = kb_grader_llm.invoke(f'''
You are an evidence grader.
Question: {question}
Private KB evidence: {context}

Can this private KB evidence answer the question?
Return "good" if it can answer. Return "weak" if it cannot answer or is incomplete.

Return your response as valid JSON.
''')
    print("[KB Grader]", grade.grade)
    return {"kb_grade": grade.grade}

def decide_after_kb_grade(state: AgentState) -> Literal["generate_from_kb", "search_web"]:
    if state["kb_grade"] == "good":
        return "generate_from_kb"
    return "search_web"

def search_web(state: AgentState):
    query = state["current_query"]
    print(f"[Tavily Search] Query: {query}")
    try:
        result = web_search.invoke({"query": query})
        if isinstance(result, dict):
            lines = []
            if result.get("answer"): lines.append(f"Tavily answer: {result.get('answer')}")
            for item in result.get("results", []):
                lines.append(f"Title: {item.get('title', '')}\nContent: {item.get('content', '')}")
            web_text = "\n\n".join(lines) if lines else str(result)
        else:
            web_text = str(result)
    except Exception as e:
        web_text = str(e)
    return {"web_results": web_text, "source_used": "web"}

def grade_web_evidence(state: AgentState):
    question = get_latest_question(state)
    web_results = state["web_results"]
    grade = web_grader_llm.invoke(f'''
You are an evidence grader.
Question: {question}
Web search evidence: {web_results}

Can this web evidence answer the question?
Return "good" if it can answer. Return "weak" if it cannot answer.

Return valid JSON.
''')
    print("[Web Grader]", grade.grade)
    return {"web_grade": grade.grade}

MAX_RETRIES = 1
def decide_after_web_grade(state: AgentState) -> Literal["generate_from_web", "rewrite_query", "answer_insufficient"]:
    if state["web_grade"] == "good":
        return "generate_from_web"
    if state.get("retry_count", 0) < MAX_RETRIES:
        return "rewrite_query"
    return "answer_insufficient"

def rewrite_query(state: AgentState):
    question = get_latest_question(state)
    retry_count = state.get("retry_count", 0) + 1
    rewritten = llm.invoke(f'''
Rewrite the question for better retrieval and web search.
Original question: {question}
Return only the rewritten query.
''').content.strip()
    print("[Rewriter]", rewritten)
    return {"current_query": rewritten, "retry_count": retry_count}

def generate_from_kb(state: AgentState):
    question = get_latest_question(state)
    context = "\n\n".join(f"[KB Source: {doc.metadata.get('source')}]\n{doc.page_content}" for doc in state["kb_docs"])
    answer = llm.invoke(f'''
You are a customer support agent.
Answer using ONLY the private KB context.
Question: {question}
Private KB context: {context}
''').content
    return {"messages": [AIMessage(content=answer)], "source_used": "private_kb"}

def generate_from_web(state: AgentState):
    question = get_latest_question(state)
    web_context = state["web_results"]
    answer = llm.invoke(f'''
You are a customer support agent.
Answer using ONLY the web search context.
Question: {question}
Web search context: {web_context}
''').content
    return {"messages": [AIMessage(content=answer)], "source_used": "web_search"}

def direct_answer(state: AgentState):
    question = get_latest_question(state)
    answer = llm.invoke(f'''
Respond briefly and naturally as a customer support bot.
Message: {question}
''').content
    return {"messages": [AIMessage(content=answer)], "source_used": "direct"}

def answer_insufficient(state: AgentState):
    answer = "I could not find enough reliable evidence in the private knowledge base or the web search results to answer this confidently. Please provide more specific documents or rephrase the question."
    return {"messages": [AIMessage(content=answer)], "source_used": "insufficient_evidence"}
