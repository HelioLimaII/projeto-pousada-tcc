# Em: api-pousada/reset_admin.py

import sys
from config.database import collection_usuarios
from auth import get_password_hash

# --- CONFIGURE ISTO ---
USERNAME_PARA_RESETAR = "helio"
NOVA_SENHA_SIMPLES = "123"
# ----------------------

print(f"A tentar redefinir a senha para o utilizador: {USERNAME_PARA_RESETAR}...")

# 1. Cria o novo hash usando a MESMA função do auth.py
try:
    novo_hash = get_password_hash(NOVA_SENHA_SIMPLES)
    print("Novo hash gerado com sucesso.")
except Exception as e:
    print(f"❌ Erro ao gerar o hash: {e}")
    sys.exit(1)

# 2. Atualiza o utilizador no banco de dados
try:
    resultado = collection_usuarios.update_one(
        {"username": USERNAME_PARA_RESETAR},
        {"$set": {"hashed_password": novo_hash}}
    )

    if resultado.matched_count == 0:
        print(f"❌ ERRO: Utilizador '{USERNAME_PARA_RESETAR}' não encontrado no banco de dados.")
    elif resultado.modified_count == 1:
        print(f"✅ Sucesso! Senha para '{USERNAME_PARA_RESETAR}' foi redefinida para '{NOVA_SENHA_SIMPLES}'.")
    else:
        print("Utilizador encontrado, mas nada foi modificado (talvez a senha já seja essa?).")

except Exception as e:
    print(f"❌ Erro ao atualizar o banco de dados: {e}")