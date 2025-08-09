# Em: api-pousada/config/database.py

from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Pega a string de conexão do ambiente
MONGO_URL = os.getenv("MONGO_URL")

# Cria o cliente de conexão
client = MongoClient(MONGO_URL)

# Seleciona o banco de dados "pousada_db"
db = client.pousada_db

# Cria referências para as coleções que vamos usar
collection_quartos = db.quartos
collection_usuarios = db.usuarios
collection_reservas = db.reservas
collection_clientes = db.clientes

print("✅ Conexão com o MongoDB estabelecida!")