# Em: api-pousada/config/database.py

from pymongo import MongoClient
from dotenv import load_dotenv
import os
import sys

# Carrega as variáveis de ambiente do arquivo .env (apenas para desenvolvimento local)
# Em produção (Render), as variáveis já estarão no ambiente.
if os.getenv("RENDER") is None: # O Render define esta variável por defeito
    load_dotenv()

# [CORRIGIDO] Alterado de "MONGO_URL" para "DATABASE_URL"
# Este é o nome da variável que definimos no dashboard do Render.
DATABASE_URL = os.getenv("DATABASE_URL")

# Validação Crítica
if not DATABASE_URL:
    print("❌ Erro Crítico: A variável de ambiente 'DATABASE_URL' não foi encontrada.", file=sys.stderr)
    # Isto fará o deploy falhar imediatamente se a variável estiver em falta.
    raise ValueError("A variável de ambiente 'DATABASE_URL' não foi definida.")

# Cria o cliente de conexão
try:
    client = MongoClient(DATABASE_URL)
    # Testa a conexão para garantir que a URL é válida
    client.server_info() 
except Exception as e:
    print(f"❌ Erro ao conectar ao MongoDB. Verifique sua 'DATABASE_URL'. Erro: {e}", file=sys.stderr)
    raise

# Seleciona o banco de dados "pousada_db"
# (O seu código original usava "pousada_db", vamos manter)
db = client.pousada_db

# Cria referências para as coleções que vamos usar
collection_quartos = db.quartos
collection_usuarios = db.usuarios
collection_reservas = db.reservas
collection_clientes = db.clientes

print("✅ Conexão com o MongoDB estabelecida!")
