# XyraChain

XyraChain is a health-tech project that combines:

- a React + Vite frontend
- a unified Python backend for analysis, uploads, chat, and report pinning
- a Python AI module for chest X-ray prediction and Grad-CAM generation
- a Hardhat/XDC smart contract for storing report metadata on-chain

The main product flow is:

1. A user uploads a chest X-ray in the frontend.
2. The backend stores the file and calls the local Python AI module.
3. The AI module returns a diagnosis and a Grad-CAM heatmap.
4. The backend uses the integrated chat and Pinata flows for consultation and report storage.
5. The frontend uses the connected wallet to mint the report CID to the XDC contract.

## Current Architecture

- `frontend/` is the only web client and is deployed as a static site.
- `backend/` is the only server application and handles uploads, AI analysis, chat, and Pinata integration.
- `ai-module/` is imported by `backend/` for TensorFlow inference and Grad-CAM generation.
- `blockchain/` is separate and only needed when deploying or updating the contract.

## Repository Structure

```text
XyraChain/
|- frontend/      React + Vite + TypeScript app
|- backend/       FastAPI backend for uploads, analysis, chat, and IPFS
|- ai-module/     Python model inference + Grad-CAM scripts
|- blockchain/    Hardhat project for XDC smart contract
```

## Services Overview

### Frontend

Location: `frontend/`

Main responsibilities:

- upload X-ray images
- display diagnosis and Grad-CAM heatmap
- generate a PDF report in-browser
- call the backend for report generation and IPFS pinning
- connect wallet and mint the IPFS CID on-chain
- provide AI chat and triage UI

Important files:

- `frontend/src/App.tsx`
- `frontend/src/pages/AnalysisCenter.tsx`
- `frontend/src/pages/TriageChat.tsx`
- `frontend/src/components/ChatWidget.tsx`
- `frontend/src/context/WalletContext.tsx`
- `frontend/src/config.ts`

### Backend

Location: `backend/`

Main responsibilities:

- accept image uploads
- run AI prediction and Grad-CAM generation
- serve generated upload and heatmap files
- provide triage-focused chat responses
- pin report JSON to IPFS with Pinata

Important files:

- `backend/app/main.py`
- `backend/app/engine/rag_engine.py`
- `backend/app/services/analysis_service.py`
- `backend/app/services/pinata_service.py`
- `backend/scripts/ingest.py`

### AI Module

Location: `ai-module/`

Main responsibilities:

- load the TensorFlow model
- preprocess X-ray images
- run binary pneumonia prediction
- generate Grad-CAM visualizations

Important files:

- `ai-module/prediction.py`
- `ai-module/gradcam.py`
- `ai-module/preprocess.py`
- `ai-module/model_loader.py`

Deployment note:

- `ai-module/model/best_cnn.keras` must be present in the deployed repo because the backend loads it directly at runtime.

### Blockchain

Location: `blockchain/`

Main responsibilities:

- deploy the `XyraChain` contract
- store report metadata per connected wallet
- expose read/write methods for user reports

Important files:

- `blockchain/contracts/XyraChain.sol`
- `blockchain/hardhat.config.ts`
- `blockchain/scripts/deploy.ts`
- `blockchain/scripts/verify.ts`

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, ethers, axios, jsPDF
- Backend: FastAPI, LangChain, Chroma, Groq, Pinata, Python uploads
- AI: Python, TensorFlow, OpenCV, NumPy
- Blockchain: Hardhat, Solidity, ethers, XDC Apothem testnet

## Prerequisites

Install these before running the project:

- Node.js 18+
- npm
- Python 3.10+
- a wallet that supports custom EVM networks
- access to Pinata credentials
- access to a Groq API key

## Environment Variables

### Frontend

Copy `frontend/.env.example` to `frontend/.env` and set:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_CONTRACT_ADDRESS=
VITE_CHAIN_ID=51
VITE_CHAIN_ID_HEX=0x33
VITE_CHAIN_NAME=XDC Apothem Testnet
VITE_RPC_URL=https://rpc.apothem.network
VITE_BLOCK_EXPLORER_URL=https://apothem.xdcscan.io
VITE_NATIVE_CURRENCY_NAME=XDC
VITE_NATIVE_CURRENCY_SYMBOL=XDC
VITE_NATIVE_CURRENCY_DECIMALS=18
```

### Backend

Copy `backend/.env.example` to `backend/.env` and set:

```env
GROQ_API_KEY=
GROQ_MODEL_NAME=llama-3.3-70b-versatile
VECTOR_DB_PATH=./data/processed
RAW_DATA_PATH=./data/raw
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
CORS_ORIGIN=http://localhost:3000
```

Notes:

- `VECTOR_DB_PATH` should point to the embedded Chroma store in `backend/data/processed`.
- the backend serves both analysis and chat on the same public URL.

### Blockchain

Copy `blockchain/.env.example` to `blockchain/.env` and set:

```env
APOTHEM_RPC_URL=https://erpc.apothem.network
PRIVATE_KEY=
CONTRACT_ADDRESS=
```

## Installation

Install dependencies for each Node service:

```bash
cd frontend && npm install
cd blockchain && npm install
```

Install Python dependencies:

```bash
pip install -r ai-module/requirements.txt
pip install -r backend/requirements.txt
```

If you need to rebuild the knowledge base from the PDFs, install the extra ingest dependencies too:

```bash
pip install -r backend/requirements.ingest.txt
python backend/scripts/ingest.py
```

## Local Development

### 1. Start the backend API

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend --env-file backend/.env
```

Default port: `8000`

### 2. Start the frontend

```bash
cd frontend
npm run dev
```

Default port: `3000`

## Build Commands

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
python -m compileall app
```

Backend uploads, chat, and analysis are provided by the Python API at port `8000`.

Blockchain:

```bash
cd blockchain
npx hardhat compile
```

## Smart Contract Workflow

Compile and deploy:

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network apothem
```

After deployment:

1. copy the deployed contract address
2. set `VITE_CONTRACT_ADDRESS` in `frontend/.env`
3. rebuild the frontend

Optional verification script:

```bash
cd blockchain
npx hardhat run scripts/verify.ts --network apothem
```

## API Endpoints

### Backend

- `GET /` - health check
- `POST /api/analysis/upload` - upload an image and run AI analysis
- `POST /api/analysis/generate-report` - pin a report JSON to IPFS
- `POST /api/chat/message` - submit a triage chat message
- `GET /uploads/:file` - access uploaded/generated images

## Upload Constraints

The backend currently accepts only:

- PNG
- JPEG / JPG
- WebP

Maximum file size:

- 5 MB

Important note:

- DICOM is not supported in the current implementation.

## Deployment Notes

## Free Deployment

Recommended split:

- deploy `frontend/` to Vercel
- deploy `backend/` to Render free tier

### Vercel

- set project root to `frontend/`
- set `VITE_API_BASE_URL` to your public Render backend URL
- `frontend/vercel.json` is included for SPA rewrites

### Render

- use the included `render.yaml`, or create a Python web service with root directory `backend/`
- set the required env vars from `backend/.env.example`
- do not use `--env-file` on Render; set environment variables in the Render dashboard
- use this start command:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

- use this build command:

```bash
pip install -r requirements.txt && pip install -r ../ai-module/requirements.txt
```

The `backend/data/processed` knowledge base is kept in the repo so chat works without a separate ingest step.
The runtime requirements pin CPU-only PyTorch so Render does not try to install large CUDA packages.

## Deployment Notes

### Frontend

- build with `npm run build`
- configure SPA route rewrites if hosting on a static platform because the app uses `BrowserRouter`
- set `VITE_API_BASE_URL` to the deployed backend URL
- set `VITE_CONTRACT_ADDRESS` to the deployed contract address

### Backend

- deploy the Python backend together with access to the `ai-module`
- ensure the vector database exists at `backend/data/processed`
- ensure `GROQ_API_KEY` is valid
- set correct `CORS_ORIGIN`
- configure secure production secrets for Pinata

### Blockchain

- deploy to XDC Apothem or update the frontend network configuration for another chain
- keep the ABI and deployed address in sync with the frontend

## Known Limitations

- `frontend/src/pages/PatientVault.tsx` still uses mock data
- `frontend/src/pages/Profile.tsx` still uses mock data
- minted reports currently send `chatLogs: []` from the frontend analysis flow
- the backend depends on local TensorFlow + LangChain startup, which can be slow on cold boot
- the frontend production bundle is large and Vite warns about chunk size during build

## Troubleshooting

### Backend cannot analyze images

Check:

- TensorFlow and OpenCV dependencies are installed
- the model file exists inside `ai-module/model/`

### Chat is failing

Check:

- the backend API is running
- Groq credentials are valid

### Minting fails

Check:

- `VITE_CONTRACT_ADDRESS` is set correctly
- the wallet is connected to the expected chain
- the deployed contract matches the frontend ABI

### Report generation fails

Check:

- Pinata credentials are set in `backend/.env`
- the backend can reach Pinata from the deployment environment

## Recent Hardening Work

The codebase was updated to improve deployment readiness by:

- unifying chat and analysis in one Python backend
- replacing hardcoded service URLs with env-based config
- removing mock/fallback Pinata success behavior
- enforcing upload validation
- fixing frontend confidence typing and wallet resync behavior

## License

No license is currently defined in the repository.
