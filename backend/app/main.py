from datetime import datetime
import os
from pathlib import Path
import shutil
import uuid

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

from app.engine.rag_engine import get_rag_chain
from app.services.analysis_service import UPLOADS_ROOT, analysis_service
from app.services.pinata_service import pinata_service

app = FastAPI(title="AI-Health-Chain API")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGIN", "*").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_ROOT)), name="uploads")

rag_chain = None

class ChatRequest(BaseModel):
    message: str


class AnalysisResult(BaseModel):
    diagnosis: str
    confidence: float
    heatmap: str


class ReportRequest(BaseModel):
    analysisResult: AnalysisResult
    chatLogs: list
    userAddress: str | None = None


def get_chat_chain():
    global rag_chain
    if rag_chain is None:
        rag_chain = get_rag_chain()
    return rag_chain


@app.get("/")
async def health_check():
    return {"status": "ok", "service": "xyrachain-unified-api"}


@app.post("/api/analysis/upload")
async def upload_analysis_image(xray: UploadFile = File(...)):
    if xray.content_type not in {"image/png", "image/jpeg", "image/webp"}:
        raise HTTPException(status_code=400, detail="Only PNG, JPEG, and WebP image uploads are supported.")

    suffix = Path(xray.filename or "upload.png").suffix or ".png"
    file_name = f"{uuid.uuid4().hex}{suffix}"
    file_path = UPLOADS_ROOT / file_name

    try:
        with file_path.open("wb") as destination:
            shutil.copyfileobj(xray.file, destination)

        prediction = analysis_service.predict(str(file_path))
        gradcam = analysis_service.generate_gradcam(str(file_path))
        heatmap_name = Path(gradcam["output_path"]).name

        return {
            "status": "success",
            "diagnosis": prediction["prediction"],
            "confidence": prediction["probability"],
            "heatmap": f"/uploads/{heatmap_name}",
            "originalImage": f"/uploads/{file_name}",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        xray.file.close()


@app.post("/api/analysis/generate-report")
async def generate_report(request: ReportRequest):
    try:
        report = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "patientAddress": request.userAddress or "Anonymous",
            "analysis": request.analysisResult.model_dump(),
            "consultation": request.chatLogs,
            "metadata": {
                "version": "1.0",
                "generator": "XyraChain AI",
            },
        }

        cid = pinata_service.upload_json_to_ipfs(report)
        return {
            "status": "success",
            "cid": cid,
            "ipfsUrl": f"https://gateway.pinata.cloud/ipfs/{cid}",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        response = get_chat_chain().invoke({"input": request.message})
        return {
            "status": "success",
            "answer": response["answer"],
            "triage_level": "educational_guidance"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/message")
async def api_chat_endpoint(request: ChatRequest):
    response = await chat_endpoint(request)
    return {
        "response": response["answer"],
        "original_response": response,
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
