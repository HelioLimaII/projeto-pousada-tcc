# Usa uma versão leve do Python
FROM python:3.11-slim

# Define a pasta de trabalho dentro do servidor
WORKDIR /app

# Copia as dependências e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o resto do seu código para o servidor (incluindo o api.py)
COPY . .

# O Google Cloud Run usa a porta 8080 por padrão
EXPOSE 8080

# Comando para iniciar o FastAPI (igual ao que o Render tentou usar)
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8080"]