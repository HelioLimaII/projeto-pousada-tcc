FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema necessárias para algumas libs Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o código da API
COPY . .

# O Google Cloud Run injeta a porta nessa variável $PORT (geralmente 8080)
ENV PORT=8000

# Comando para ligar o servidor FastAPI
CMD uvicorn api:app --host 0.0.0.0 --port $PORT