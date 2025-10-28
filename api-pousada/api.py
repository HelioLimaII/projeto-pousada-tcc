# Em: api-pousada/api.py
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

# Configuração do CORS (MUITO IMPORTANTE para o frontend comunicar com o backend)
origins = [
    "http://localhost:3000", # Endereço do seu frontend Next.js
    # Adicione outros domínios se necessário (ex: o domínio de produção)
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Permite todos os cabeçalhos
)

# Servir ficheiros estáticos (para as imagens dos quartos)
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