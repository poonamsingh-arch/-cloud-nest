# CloudNest AI Platform

An AI-powered document intelligence platform that allows users to upload PDFs and chat with them using RAG (Retrieval Augmented Generation).

## Live Demo
- Frontend: https://cloud-nest-sand.vercel.app
- Backend API: https://cloudnest-backend-wpop.onrender.com

## Features
- JWT Authentication (Login/Register)
- Upload multiple PDFs
- RAG pipeline with chunking and keyword search
- Ask AI questions about specific documents
- Private documents per user
- Live analytics dashboard
- Health check endpoint
- Docker containerization

## Tech Stack
- Frontend: React, Vite, Axios
- Backend: Node.js, Express
- Database: MongoDB Atlas
- AI: Groq API (LLaMA 3.3)
- Storage: Local (Render)
- Deployment: Vercel (Frontend) + Render (Backend)
- Containerization: Docker

## Architecture
React Frontend (Vercel)
↓
Node.js API (Render)
↓
JWT Authentication
↓
MongoDB Atlas
↓
RAG Pipeline
↓
Groq AI (LLaMA 3.3)

## How RAG Works
1. User uploads PDF
2. System extracts text
3. Text split into 1000 character chunks
4. User asks question
5. System scores chunks by keyword relevance
6. Top 3 relevant chunks sent to AI
7. AI answers based only on relevant context

## API Endpoints
- POST /register - Register user
- POST /login - Login user
- GET /health - Health check
- GET /analytics - Platform analytics
- POST /upload - Upload PDF
- GET /documents - Get user documents
- DELETE /documents/:id - Delete document
- POST /ask-ai - Ask AI about document

## Run Locally
```bash
# Clone repo
git clone https://github.com/poonamsingh-arch/-cloud-nest.git

# Backend
cd backend
npm install
node server.js

# Frontend
cd frontend
npm install
npm run dev
```

## Docker
```bash
docker compose up --build
```

