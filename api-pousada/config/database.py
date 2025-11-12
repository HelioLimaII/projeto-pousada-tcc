# Em: api-pousada/config/database.py

from pymongo import MongoClient
from dotenv import load_dotenv
import os
import sys
import cloudinary

# --- [1. CARREGAMENTO DE VARIÁVEIS] ---
# O load_dotenv() deve ser a primeira coisa a rodar
if os.getenv("RENDER") is None: # O Render define esta variável por defeito
    load_dotenv()

# --- [2. CONFIGURAÇÃO CLOUDINARY] ---
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# --- [3. CONFIGURAÇÃO MONGODB] ---
DATABASE_URL = os.getenv("DATABASE_URL")

# Validação Crítica
if not DATABASE_URL:
    print("❌ Erro Crítico: A variável de ambiente 'DATABASE_URL' não foi encontrada.", file=sys.stderr)
    raise ValueError("A variável de ambiente 'DATABASE_URL' não foi definida.")

# --- [NOVA PROTEÇÃO] ---
# Limpeza da string de conexão para evitar erros no Render
# Remove espaços em branco no início e no fim
DATABASE_URL = DATABASE_URL.strip()
# Remove aspas simples ou duplas que possam ter vindo da configuração por engano
DATABASE_URL = DATABASE_URL.strip("'").strip('"')

# Log de debug (mostra apenas o início da URL para não vazar a senha)
print(f"ℹ️ Tentando conectar ao MongoDB. Início da URL processada: {DATABASE_URL[:15]}...")
# -----------------------

# Cria o cliente de conexão
try:
    client = MongoClient(DATABASE_URL)
    # Testa a conexão para garantir que a URL é válida e a senha está correta
    client.server_info() 
except Exception as e:
    print(f"❌ Erro ao conectar ao MongoDB. Verifique sua 'DATABASE_URL'. Erro: {e}", file=sys.stderr)
    raise

# Seleciona o banco de dados
# O pymongo seleciona automaticamente o banco definido na string de conexão (pousada_zekas)
db = client.get_database()

# Cria referências para as coleções que vamos usar
collection_quartos = db.quartos
collection_usuarios = db.usuarios
collection_reservas = db.reservas
collection_clientes = db.clientes

print("✅ Conexão com o MongoDB estabelecida!")