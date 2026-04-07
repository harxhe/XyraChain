# XyraChain

XyraChain is a multi-service health-tech project that combines:

- a React + Vite frontend
- a TypeScript + Express backend
- a Python AI module for chest X-ray prediction and Grad-CAM generation
- a FastAPI chatbot service for medical triage guidance
- a Hardhat/XDC smart contract for storing report metadata on-chain

The main product flow is:

1. A user uploads a chest X-ray in the frontend.
2. The backend stores the file and calls the local Python AI module.
3. The AI module returns a diagnosis and a Grad-CAM heatmap.
4. The backend pins the generated report JSON to IPFS through Pinata.
5. The frontend uses the connected wallet to mint the report CID to the XDC contract.

## Repository Structure

```text
XyraChain/
|- frontend/      React + Vite + TypeScript app
|- backend/       Express + TypeScript API
|- ai-module/     Python model inference + Grad-CAM scripts
|- chatbot/       FastAPI + LangChain triage assistant
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
- call the local Python AI scripts
- serve generated upload and heatmap files
- pin report JSON to IPFS with Pinata
- proxy chat requests to the FastAPI chatbot service

Important files:

- `backend/src/index.ts`
- `backend/src/routes/analysisRoutes.ts`
- `backend/src/routes/chatRoutes.ts`
- `backend/src/controllers/analysisController.ts`
- `backend/src/controllers/chatController.ts`
- `backend/src/services/pythonService.ts`
- `backend/src/services/pinataService.ts`

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

### Chatbot

Location: `chatbot/`

Main responsibilities:

- provide triage-focused chat responses
- use a retrieval-augmented generation flow based on Chroma + LangChain + Groq

Important files:

- `chatbot/app/main.py`
- `chatbot/app/engine/rag_engine.py`
- `chatbot/app/core/prompt.py`
- `chatbot/scripts/ingest.py`

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
- Backend: Node.js, Express, TypeScript, multer, axios, dotenv
- AI: Python, TensorFlow, OpenCV, NumPy
- Chatbot: FastAPI, LangChain, Chroma, Groq, HuggingFace embeddings
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
VITE_API_BASE_URL=http://localhost:5000
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
PORT=5000
CORS_ORIGIN=http://localhost:3000
CHATBOT_SERVICE_URL=http://127.0.0.1:8000/chat
PYTHON_BIN=python
AI_MODULE_PATH=../ai-module
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
```

Notes:

- `CHATBOT_SERVICE_URL` should point to the deployed chatbot service endpoint.
- `PYTHON_BIN` can be changed if Python is not available as `python` on your server.
- `AI_MODULE_PATH` must point to the real `ai-module` location from the backend runtime.

### Chatbot

Copy `chatbot/.env.example` to `chatbot/.env` and set at minimum:

```env
GROQ_API_KEY=
GROQ_MODEL_NAME=llama-3.3-70b-versatile
VECTOR_DB_PATH=./data/processed
RAW_DATA_PATH=./data/raw
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
```

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
cd backend && npm install
cd blockchain && npm install
```

Install Python dependencies:

```bash
pip install -r ai-module/requirements.txt
pip install -r chatbot/requirements.txt
```

## Local Development

### 1. Start the chatbot

```bash
python chatbot/app/main.py
```

Default port: `8000`

### 2. Start the backend

```bash
cd backend
npm run dev
```

Default port: `5000`

### 3. Start the frontend

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
npm run build
```

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
- `POST /api/chat/message` - proxy a chat request to the chatbot service
- `GET /uploads/:file` - access uploaded/generated images

### Chatbot

- `POST /chat` - submit triage message payloads

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

### Frontend

- build with `npm run build`
- configure SPA route rewrites if hosting on a static platform because the app uses `BrowserRouter`
- set `VITE_API_BASE_URL` to the deployed backend URL
- set `VITE_CONTRACT_ADDRESS` to the deployed contract address

### Backend

- deploy together with access to the Python runtime and `ai-module`
- ensure the server can reach the chatbot service URL
- set correct `CORS_ORIGIN`
- configure secure production secrets for Pinata

### Chatbot

- ensure the vector database exists at `VECTOR_DB_PATH`
- ensure `GROQ_API_KEY` is valid
- expose the service only where needed, or keep it internal behind the backend proxy

### Blockchain

- deploy to XDC Apothem or update the frontend network configuration for another chain
- keep the ABI and deployed address in sync with the frontend

## Known Limitations

- `frontend/src/pages/PatientVault.tsx` still uses mock data
- `frontend/src/pages/Profile.tsx` still uses mock data
- minted reports currently send `chatLogs: []` from the frontend analysis flow
- the backend depends on local Python subprocess execution, which may need container/process tuning in production
- the frontend production bundle is large and Vite warns about chunk size during build

## Troubleshooting

### Backend cannot analyze images

Check:

- `PYTHON_BIN` points to a working Python installation
- `AI_MODULE_PATH` points to the correct `ai-module`
- TensorFlow and OpenCV dependencies are installed
- the model file exists inside `ai-module/model/`

### Chat is failing

Check:

- the chatbot service is running
- `CHATBOT_SERVICE_URL` is correct
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

- replacing hardcoded service URLs with env-based config
- unifying chat requests through the backend proxy
- removing mock/fallback Pinata success behavior
- making Python runtime and AI module paths configurable
- enforcing backend upload validation
- fixing frontend confidence typing and wallet resync behavior

## License

No license is currently defined in the repository.
