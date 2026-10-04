# Agentic RAG

An advanced Retrieval-Augmented Generation (RAG) system built with intelligent agentic capabilities using LangGraph, LangChain, Groq, Pinecone, and Tavily.

## Overview

This project implements an Agentic RAG pipeline where intelligent agents dynamically decide how to route queries, whether to perform vector search from the knowledge base, or when to rely on web search for the latest information.

## Tech Stack

- **Frameworks:** LangGraph, LangChain
- **LLM Provider:** Groq
- **Vector Database:** Pinecone
- **Embeddings:** HuggingFace / Sentence Transformers
- **Web Search/Tools:** Tavily
- **Data Processing:** BeautifulSoup4

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tilakchow/Agentic-RAG.git
   cd AgenticRAG
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory and add your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```

3. **Install Dependencies:**
   Ensure you have `uv` installed, then run:
   ```bash
   uv sync
   ```
   Or install directly with pip:
   ```bash
   pip install -r pyproject.toml
   ```

## Usage

Explore the `Agentic_Rag.ipynb` notebook to see the agentic workflow in action.

## Author

Tilak chowdary (tilakchowdary18@gmail.com)
