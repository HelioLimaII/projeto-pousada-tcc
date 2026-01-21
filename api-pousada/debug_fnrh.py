import os
import base64
import httpx
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv

# 1. Força o carregamento do .env
load_dotenv()

async def diagnostico():
    print("="*50)
    print("🕵️‍♂️ DIAGNÓSTICO DE CONEXÃO FNRH")
    print("="*50)

    # 2. Verifica as credenciais lidas
    user_id = os.getenv("FNRH_USER_ID")
    api_key = os.getenv("FNRH_API_KEY")
    base_url = os.getenv("FNRH_URL", "https://fnrh.turismo.serpro.gov.br/FNRH_API/rest/v1")
    
    print(f"📍 URL Base: {base_url}")
    
    if not user_id or not api_key:
        print("❌ ERRO CRÍTICO: Credenciais não encontradas no .env!")
        return

    # Mostra apenas o início e fim para você conferir se bate, sem expor tudo
    print(f"🔑 USER ID lido: {user_id[:5]}...{user_id[-5:]} (Verifique se bate com d6fd5...)")
    print(f"🔑 API KEY lida: {api_key[:5]}...{api_key[-5:]} (Verifique se bate com 0qfCS...)")

    # 3. Monta o Header
    credenciais = f"{user_id}:{api_key}"
    credenciais_b64 = base64.b64encode(credenciais.encode()).decode()
    headers = {
        "Authorization": f"Basic {credenciais_b64}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    # 4. Tenta buscar o SEU CPF (usado no teste)
    # Substitua pelo seu CPF que você usou no pré-checkin
    MEU_CPF = "13618848439"  
    
    # Janela de datas BEM AMPLA
    hoje = datetime.now()
    dt_ini = (hoje - timedelta(days=30)).strftime("%Y-%m-%d")
    dt_fim = (hoje + timedelta(days=30)).strftime("%Y-%m-%d")

    endpoint = f"{base_url}/hospedes/pre-checkins"
    params = {
        "numero_documento": MEU_CPF,
        "data_inicio": dt_ini,
        "data_fim": dt_fim
        # Sem filtro "exibir_vinculado" para ver tudo
    }

    print(f"\n📡 Enviando requisição para CPF {MEU_CPF}...")
    print(f"📅 Janela de busca: {dt_ini} até {dt_fim}")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(endpoint, headers=headers, params=params, timeout=20.0)
            
            print(f"\n📥 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                dados = response.json()
                print(f"✅ RESPOSTA DO GOVERNO (RAW):")
                print(dados)
                
                if isinstance(dados, list) and len(dados) == 0:
                    print("\n⚠️ ALERTA: A lista veio vazia. O Governo autenticou você, mas não achou vínculo.")
                    print("Possíveis causas:")
                    print("1. O pré-checkin foi feito com data fora da janela de 30 dias.")
                    print("2. O pré-checkin NÃO foi vinculado a este User ID (d6fd5...).")
                    print("   -> Você selecionou 'Pousada Zekas' no app do governo?")
            else:
                print(f"❌ Erro na API: {response.text}")
                
        except Exception as e:
            print(f"❌ Erro de Conexão: {e}")

if __name__ == "__main__":
    asyncio.run(diagnostico())