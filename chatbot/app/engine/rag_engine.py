import os
from pathlib import Path
from dotenv import load_dotenv

# --- LLM & Vector DB ---
from langchain_groq import ChatGroq
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# --- LangChain Classic (2026 Legacy Support) ---
# --- LangChain ---
# Use standard imports
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain

# --- Local Project Imports ---
from app.core.prompt import triage_prompt

CHATBOT_ROOT = Path(__file__).resolve().parents[2]
os.environ.setdefault("HF_HUB_DISABLE_IMPLICIT_TOKEN", "1")

# Initialize environment from the chatbot package root
load_dotenv(CHATBOT_ROOT / ".env")


def _resolve_chatbot_path(env_key: str, default: str) -> str:
    configured = os.getenv(env_key, default)
    configured_path = Path(configured)
    if not configured_path.is_absolute():
        configured_path = CHATBOT_ROOT / configured_path
    return str(configured_path.resolve())

def get_rag_chain():
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY not found in .env file. Please add your Groq API Key.")

    # 1. Initialize local embeddings (Must match ingest.py)
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_db_path = _resolve_chatbot_path("VECTOR_DB_PATH", "data/processed")
    
    # 2. Load the persistent Vector DB from your data/processed folder
    vectorstore = Chroma(
        persist_directory=vector_db_path,
        embedding_function=embeddings
    )
    
    # 3. Setup Retriever (Retrieves top 3 medical context chunks)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    # 4. Initialize Groq LPU (Ultra-fast inference)
    llm = ChatGroq(
        groq_api_key=os.getenv("GROQ_API_KEY"),
        model_name=os.getenv("GROQ_MODEL_NAME"),
        temperature=0 # Deterministic responses for medical safety
    )
    
    # 5. Create the combined document chain (LLM + Prompt)
    combine_docs_chain = create_stuff_documents_chain(llm, triage_prompt)
    
    # 6. Final Retrieval Chain
    rag_chain = create_retrieval_chain(retriever, combine_docs_chain)
    
    return rag_chain
