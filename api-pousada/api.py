# Em: api-pousada/api.py
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Importe suas rotas existentes
from routes.auth import router as auth_router
from routes.quarto import router as quarto_router
from routes.reserva import router as reserva_router
from routes.cliente import router as cliente_router
# [NOVO] Import da rota FNRH
from routes.fnrh import router as fnrh_router

app = FastAPI()

# --- Configuração do CORS ---

frontend_url = os.environ.get("FRONTEND_URL")

origins = [
    "http://localhost:3000", # [ATIVO] Necessário para seus testes locais
    "https://projeto-pousada-front.onrender.com",
]

if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# [CORREÇÃO CRÍTICA PARA DEPLOY]
# Cria a pasta 'static' se ela não existir no servidor (ex: Render)
# Isso evita o erro "RuntimeError: Directory 'static' does not exist"
if not os.path.exists("static"):
    os.makedirs("static")

# [ATIVO] Servir ficheiros estáticos (Imagens locais, se houver)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Incluir as rotas
app.include_router(auth_router, tags=["Autenticação"])
app.include_router(quarto_router, prefix="/quartos", tags=["Quartos"])
app.include_router(reserva_router, prefix="/reservas", tags=["Reservas"])
app.include_router(cliente_router, prefix="/clientes", tags=["Clientes"])

# [NOVO] Rota para integração com o Governo
app.include_router(fnrh_router, prefix="/fnrh", tags=["FNRH - Governo"])

# Rota raiz
@app.get("/")
async def root():
    return {"message": "Bem-vindo à API da Pousada Zekas (Com FNRH)"}