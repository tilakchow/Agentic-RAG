import os
from dotenv import load_dotenv
from datasets import load_dataset
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec

# Load env variables
load_dotenv()

INDEX_NAME = "industry-agentic-rag-kb"
NAMESPACE = "bitext-support"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
DIMENSION = 384

def run_ingestion():
    print("Fetching dataset automatically from Hugging Face...")
    dataset = load_dataset("bitext/Bitext-customer-support-llm-chatbot-training-dataset", split="train")
    
    # Take a sample to avoid extremely long upload times for the test
    sample_data = dataset.select(range(500)) 
    
    raw_docs = []
    for row in sample_data:
        content = f"User Request: {row['instruction']}\nRecommended Response: {row['response']}"
        meta = {
            "source": "bitext_customer_support",
            "category": row["category"],
            "intent": row["intent"]
        }
        doc = Document(page_content=content, metadata=meta)
        raw_docs.append(doc)
    
    print(f"Loaded {len(raw_docs)} documents. Splitting into chunks...")
    
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    chunks = splitter.split_documents(raw_docs)
    
    print(f"Created {len(chunks)} chunks. Connecting to Pinecone...")
    
    pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]
    
    if INDEX_NAME not in existing_indexes:
        print(f"Creating Pinecone index: {INDEX_NAME}...")
        pc.create_index(
            name=INDEX_NAME,
            dimension=DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
    
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        encode_kwargs={"normalize_embeddings": True},
    )
    
    print(f"Upserting to namespace '{NAMESPACE}'...")
    PineconeVectorStore.from_documents(
        documents=chunks,
        embedding=embeddings,
        index_name=INDEX_NAME,
        namespace=NAMESPACE,
    )
    
    print("Ingestion complete! Knowledge base is ready.")

if __name__ == "__main__":
    run_ingestion()
