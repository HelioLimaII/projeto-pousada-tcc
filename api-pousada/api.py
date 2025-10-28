# Em: api-pousada/api.py
import os # Necessário para ler variáveis de ambiente
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Importe suas rotas existentes
from routes.auth import router as auth_router
from routes.quarto import router as quarto_router
from routes.reserva import router as reserva_router
# IMPORTE A NOVA ROTA DE CLIENTES
from routes.cliente import router as cliente_router

app = FastAPI()

# --- Configuração do CORS (MUITO IMPORTANTE) ---

# Pega a URL do frontend a partir das variáveis de ambiente do Render
# Esta variável (FRONTEND_URL) será algo como "https://pousada-zekas-site.onrender.com"
frontend_url = os.environ.get("FRONTEND_URL")

# Lista de origens permitidas
origins = [
    "http://localhost:3000", # Para desenvolvimento local (seu Next.js)
]

# Adiciona a URL de produção (do Render) à lista, se ela existir
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Usa a lista dinâmica
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Permite todos os cabeçalhos
)

# Servir ficheiros estáticos (Corretamente comentado, como corrigimos antes)
# app.mount("/static", StaticFiles(directory="static"), name="static")

# Incluir as rotas
app.include_router(auth_router, tags=["Autenticação"])
app.include_router(quarto_router, prefix="/quartos", tags=["Quartos"])
app.include_router(reserva_router, prefix="/reservas", tags=["Reservas"])
# INCLUA A NOVA ROTA DE CLIENTES
app.include_router(cliente_router, prefix="/clientes", tags=["Clientes"])

# Rota raiz (opcional)
@app.get("/")
async def root():
    return {"message": "Bem-vindo à API da Pousada Zekas"}

# Lembre-se de reiniciar o servidor FastAPI após estas alterações!
##