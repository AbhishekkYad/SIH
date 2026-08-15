# Data & Storage Microservice (`data-service`)

The `data-service` owns the persistence boundary (PostgreSQL database, Redis cache, and IPFS decentralized storage) of the SIH 2026 Food Traceability Platform. It exposes stable REST endpoints exclusively to the `application-service` and does not run any business-level decisions or blockchain transactions directly.

## 🏗️ Architecture Stack
- **Framework**: FastAPI (Python 3.12, Async)
- **Database**: PostgreSQL 16 (for operational data, lineage adjacency, and events)
- **Cache**: Redis 7 (Cache-aside strategy with automatic fallback on failure)
- **Storage**: IPFS Kubo (for off-chain evidence documents, certificates, and reports)
- **Security**: Service-to-service validation via `X-Internal-API-Key` HTTP header check

---

## 📂 Project Structure
```
services/data-service/
├── app/
│   ├── main.py                 # FastAPI application and lifecycle manager
│   ├── config.py               # Pydantic Settings validator
│   ├── database.py             # SQLAlchemy async engine and session local
│   ├── dependencies.py         # DB session generator and API Key middleware
│   │
│   ├── models/                 # Database SQLAlchemy ORM Tables (Split by domain)
│   │   ├── base.py             # TimestampMixin helper
│   │   ├── identity.py         # Organization, User, and RolePermission models
│   │   ├── product.py          # Product model
│   │   ├── batch.py            # Batch model
│   │   ├── unit.py             # Unit model
│   │   ├── event.py            # Event, CustodyEvent, and LedgerSync models
│   │   ├── lineage.py          # LineageEdge table definition
│   │   ├── qr.py               # QrCredential table definition
│   │   ├── incident.py         # Incident, Feedback, and AccountabilityRecord models
│   │   ├── evidence.py         # Evidence metadata model
│   │   ├── risk.py             # RiskScope, RiskScopeNode, and RecallAction models
│   │   └── audit.py            # ScanEvent and AuditLog models
│   │
│   ├── repositories/           # Database Query logic isolation layer
│   │   ├── product.py          # Product CRUD operations
│   │   ├── batch.py            # Batch CRUD operations
│   │   ├── unit.py             # Unit CRUD operations
│   │   ├── lineage.py          # Recursive CTE graph traversals
│   │   ├── event.py            # Idempotent events & ledger synchronization status
│   │   ├── incident.py         # Incidents, feedback complaint reports, and accountability
│   │   ├── evidence.py         # Evidence registry data access
│   │   └── risk_recall.py      # Risk scope snapshots and recall action tracking
│   │
│   ├── redis/
│   │   ├── client.py           # Safe Redis Cache-aside manager with postgres fallback
│   │   └── keys.py             # Standardized cache key generator
│   │
│   ├── ipfs/
│   │   └── client.py           # IPFS Kubo HTTP API client
│   │
│   ├── api/                    # HTTP REST controller endpoints
│   │   ├── products.py
│   │   ├── batches.py
│   │   ├── lineage.py
│   │   ├── events.py
│   │   ├── incidents.py
│   │   ├── evidence.py
│   │   └── risk_recall.py
│   │
│   └── schemas/                # Pydantic validation schemas
│       ├── common.py           # Standardized APIResponse JSON wrapper
│       ├── product.py
│       ├── batch.py
│       ├── lineage.py
│       ├── event.py
│       ├── incident.py
│       └── evidence.py
│
├── tests/                      # Automated test suite
│   ├── conftest.py             # pytest setup, mocks, and dynamic DB fallbacks
│   └── integration/
│       └── test_data_service.py # Integration test coverage
│
├── Dockerfile                  # Production runner container configuration
├── requirements.txt            # Python dependencies
└── .env.example                # Local environment setup template
```

---

## ⚡ Setup & Run

### 1. Run local dependencies
Spin up local PostgreSQL database, Redis, and Kubo IPFS nodes using the root-level Docker Compose:
```bash
docker compose up -d db redis ipfs
```

### 2. Configure Environment variables
Navigate to the directory, copy the env template, and configure variables:
```bash
cd services/data-service
cp .env.example .env
```

### 3. Install packages & run
Ensure python 3.12 is installed, then install requirements and run local development server:
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
Open `http://localhost:8001/docs` in your browser to inspect the interactive Swagger API documentation.

---

## 🧪 Testing

The test suite runs integration test scenarios, checking database constraints, idempotency rules, and SQL graph CTEs. 

> [!TIP]
> The test suite dynamically probes port `5432` to connect to PostgreSQL. If PostgreSQL is unreachable, it automatically falls back to an in-memory `aiosqlite` engine so tests can be run locally without infrastructure active.

To run the tests:
```bash
# Execute within 'services/data-service' directory
$env:PYTHONPATH="."
pytest tests/
```
