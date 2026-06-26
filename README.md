# 🛡️ Aegix Bouncer

A simple prototype for real-time RCE prevention. Intercepts process spawn at the kernel level, runs it through a basic rule engine and a weak ML classifier, and surfaces it to a dashboard.

Built in a day as a weekend hack project.

## Project Structure
- `backend/`: FastAPI API server, WebSocket server, detection pipeline, SQLite DB
- `frontend/`: React + Vite web UI
- `kernel/`: eBPF code (sys_enter_execve tracepoint)

## How to run

### Backend
```bash
pip install -r backend/requirements.txt
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Run model training
```bash
python backend/models/train_model.py
```
