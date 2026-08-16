# SIH 2026 — FRONTEND ENVIRONMENT & CLIENT CONFIGURATION

## 1. Recommended `.env.local` File

Create `frontend/.env.local` with the following variables:

```bash
# FastAPI Application Service URL (Developer 3 Orchestrator)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Toggle for Demo Canonical Mock Mode vs Real Backend Infrastructure Mode
NEXT_PUBLIC_MOCK_MODE=false
```

---

## 2. Standard Axios / Fetch API Client Setup (`src/lib/api-client.ts`)

```typescript
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach Bearer token automatically
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        // Redirect to login if route is protected
      }
    }
    return Promise.reject(error);
  }
);
```
