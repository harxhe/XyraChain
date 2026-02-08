# chatbot/app/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.engine.rag_engine import get_rag_chain
import uvicorn

app = FastAPI(title="AI-Health-Chain API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize the chain once at startup
rag_chain = get_rag_chain()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Invoke the chain using the modern dictionary format
        response = rag_chain.invoke({"input": request.message})
        return {
            "status": "success",
            "answer": response["answer"],
            "triage_level": "educational_guidance" # You can add logic to extract this
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)