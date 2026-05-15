import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# Load environment variables (like paths)
load_dotenv()

def run_ingestion():
    # 1. Load all PDFs from the raw data directory
    print("--- Phase 1: Loading Medical Documents ---")
    loader = PyPDFDirectoryLoader("./data/raw")
    documents = loader.load()
    print(f"Loaded {len(documents)} pages from your PDF library.")

    # 2. Split text into chunks
    # Medical text is dense, so we use a 1000 char limit with 200 char overlap
    # to ensure context (like symptoms) isn't cut in half.
    print("--- Phase 2: Splitting Text for Context Retention ---")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=200,
        add_start_index=True
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Generated {len(chunks)} searchable text segments.")

    # 3. Initialize Embeddings (Local model for privacy)
    print("--- Phase 3: Generating Embeddings (Local) ---")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    # 4. Create and Persist the Vector Database
    print("--- Phase 4: Building ChromaDB Vault ---")
    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="./data/processed"
    )
    print("SUCCESS: Ingestion complete. Knowledge base is ready for Phase 3.")

if __name__ == "__main__":
    run_ingestion()