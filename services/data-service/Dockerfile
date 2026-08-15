# Stage 1: Build dependencies
FROM python:3.12-alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev libffi-dev postgresql-dev

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final runtime image
FROM python:3.12-alpine AS runner

WORKDIR /app

# Install runtime dependencies for postgres
RUN apk add --no-cache libpq

# Copy installed packages from builder stage
COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
