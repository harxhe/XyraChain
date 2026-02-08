

try:
    import langchain
    print(f"PASS: langchain version: {langchain.__version__}")
except ImportError as e:
    print(f"FAIL: langchain: {e}")

try:
    from langchain.chains.retrieval import create_retrieval_chain
    print("PASS: Imported create_retrieval_chain from langchain.chains.retrieval")
except ImportError as e:
    print(f"FAIL: langchain.chains.retrieval: {e}")

try:
    from langchain.chains import create_retrieval_chain
    print("PASS: Imported create_retrieval_chain from langchain.chains")
except ImportError as e:
    print(f"FAIL: langchain.chains: {e}")

