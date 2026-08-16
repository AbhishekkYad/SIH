FROM python:3.12-alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev libffi-dev postgresql-dev

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.12-alpine AS runner

WORKDIR /app

RUN apk add --no-cache libpq

COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
