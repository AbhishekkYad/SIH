# SIH 2026: Food Traceability + Authenticity + Consumer Accountability + Risk Response Platform

Welcome to the SIH 2026 Food Traceability Platform repository! This project aims to create a trusted digital journey for food products from source to consumer using a hybrid architecture of traditional databases, decentralized storage, and blockchain technology.

## 📖 Documentation
- [Product Requirements Document (PRD)](./prd.md)
- [Technical Requirements Document (TRD)](./trd.md)

## 🏗️ Architecture Stack
- **Frontend**: Next.js / React (Consumer & Stakeholder UIs)
- **Backend API**: FastAPI (Python)
- **Database**: PostgreSQL (Operational, Query, Lineage)
- **Cache**: Redis (Fast reads)
- **Storage**: IPFS (Large evidence files)
- **Blockchain**: Hyperledger Fabric (Gateway + Chaincode)

## 📂 Repository Structure
- `/frontend`: Next.js applications (`consumer-web` and `stakeholder-web`) and shared UI packages.
- `/backend`: FastAPI service handling orchestration, validation, queries, Risk Propagation, and IPFS/Fabric integrations.
- `/blockchain`: Hyperledger Fabric chaincode (Smart Contracts) and network configuration.
- `/docs`: Additional technical documentation and architectural diagrams.

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18+) & **npm/yarn** - For frontend development
- **Python** (3.9+) - For the FastAPI backend
- **Docker** & **Docker Compose** - Required for running PostgreSQL, Redis, IPFS, and Hyperledger Fabric locally
- **Git** - For version control

### 1. Clone the Repository
```bash
git clone https://github.com/AyushRBuilds/SIH.git
cd SIH
```

### 2. Backend Setup (FastAPI)
Navigate to the backend directory and set up the Python virtual environment:
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies (once requirements.txt is populated)
# pip install -r requirements.txt
```

### 3. Frontend Setup (Next.js)
Navigate to the frontend applications and install dependencies.

For the Consumer Web UI:
```bash
cd frontend/apps/consumer-web
npm install
# npm run dev
```

For the Stakeholder Web UI:
```bash
cd frontend/apps/stakeholder-web
npm install
# npm run dev
```

### 4. Infrastructure Setup (Docker)
*(Note: Docker compose configurations for PostgreSQL, Redis, IPFS, and Fabric are pending implementation in the upcoming phases)*
```bash
# Future command to spin up the local infrastructure
# docker-compose up -d
```

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
