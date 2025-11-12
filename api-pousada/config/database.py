# Em: api-pousada/config/database.py

from pymongo import MongoClient
from dotenv import load_dotenv
import os
import sys
import cloudinary

# --- [CORREÇÃO APLICADA] ---
# O load_dotenv() DEVE ser chamado ANTES de qualquer os.getenv()
# para garantir que as variáveis do .env sejam carregadas.
if os.getenv("RENDER") is None: # O Render define esta variável por defeito
    load_dotenv()
# --- [FIM DA CORREÇÃO] ---


# Agora que o .env foi lido, esta configuração vai funcionar
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# Carrega as variáveis de ambiente do arquivo .env (apenas para desenvolvimento local)
# Em produção (Render), as variáveis já estarão no ambiente.
# (Esta secção foi movida para o topo)
# if os.getenv("RENDER") is None: 
#     load_dotenv()

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

# Seleciona o banco de dados (lido da DATABASE_URL)
db = client.get_database()

# Cria referências para as coleções que vamos usar
collection_quartos = db.quartos
collection_usuarios = db.usuarios
collection_reservas = db.reservas
collection_clientes = db.clientes

print("✅ Conexão com o MongoDB estabelecida!")