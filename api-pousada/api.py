# Em: api-pousada/api.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # 1. Importe o middleware
from routes.quarto import router as quarto_router
from routes.auth import router as auth_router
from routes.reserva import router as reserva_router
from routes.cliente import router as cliente_router

app = FastAPI(
    title="API da Pousada",
    description="API para gerenciar os dados da Pousada Fictícia."
)

# 2. Defina as origens permitidas (seu front-end)
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# 3. Adicione o middleware de CORS à sua aplicação
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"], # Permite todos os cabeçalhos
)

# O resto do seu código continua o mesmo
app.include_router(auth_router, tags=["Autenticação"])
app.include_router(quarto_router, tags=["Quartos"])
app.include_router(reserva_router, tags=["Reservas"])
app.include_router(cliente_router, tags=["Clientes"])

@app.get("/")
def ler_raiz():
    return {"mensagem": "Bem-vindo à API da Pousada!"}