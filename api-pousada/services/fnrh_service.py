import os
import base64
import httpx
import logging
from datetime import datetime, timedelta

# Configuração de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FNRH_SERVICE")

class FnrhService:
    def __init__(self):
        self.base_url = os.getenv("FNRH_URL", "https://fnrh.turismo.serpro.gov.br/FNRH_API/rest/v1")
        self.user_id = os.getenv("FNRH_USER_ID")
        self.api_key = os.getenv("FNRH_API_KEY")
        cpf_raw = os.getenv("FNRH_CPF_RESPONSAVEL", "00000000000") 
        self.cpf_solicitante = "".join(filter(str.isdigit, cpf_raw))

    def _get_headers(self):
        credenciais = f"{self.user_id}:{self.api_key}"
        credenciais_b64 = base64.b64encode(credenciais.encode()).decode()
        return {
            "Authorization": f"Basic {credenciais_b64}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "cpf_solicitante": self.cpf_solicitante
        }

    def _extrair_id(self, dados_json):
        if not dados_json: return None
        if 'id' in dados_json: return dados_json['id']
        if 'reserva' in dados_json and isinstance(dados_json['reserva'], dict):
             return dados_json['reserva'].get('reserva_id')
        if 'dados' in dados_json:
            d = dados_json['dados']
            if isinstance(d, dict): return d.get('id')
            if isinstance(d, list) and d: return d[0].get('id')
        return None

    # --- LISTAGEM OTIMIZADA PARA DEZ/2025 ---
    async def listar_reservas_gov(self, pagina=1, data_inicio=None, data_fim=None, situacao=None, numero_reserva=None):
        endpoint = f"{self.base_url}/reservas"
        
        # 1. Correção do Índice: Front(1) -> Gov(0)
        page_gov = int(pagina) - 1 if int(pagina) > 0 else 0

        # 2. Definição do Período Padrão (Baseado no inicio da operação: Dez/2025)
        if not data_inicio: 
            data_inicio = "2025-12-01" # Data de início do uso do sistema
        
        if not data_fim: 
            # Define o fim como o final do ano ATUAL (2026) para pegar reservas futuras
            ano_atual = datetime.now().year
            data_fim = f"{ano_atual}-12-31"

        params = {
            "page_number": page_gov,
            "size": 50, # Tamanho seguro
            "ordenacao": "data_entrada,desc"
        }

        # Se tiver busca por código, remove datas para varrer tudo
        if numero_reserva:
            params["numero_reserva"] = numero_reserva
        else:
            params["data_inicio"] = data_inicio
            params["data_fim"] = data_fim
        
        if situacao:
            params["situacao_reserva_id"] = situacao

        print(f"--- [FNRH] Pagina: {page_gov} (Front: {pagina}) | Periodo: {params.get('data_inicio')} ate {params.get('data_fim')} ---")

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(endpoint, headers=self._get_headers(), params=params, timeout=25.0)
                
                if response.status_code == 200:
                    payload = response.json()
                    lista_final = []
                    total_registros = 0
                    
                    if isinstance(payload, list):
                        lista_final = payload
                        total_registros = len(payload)
                    elif isinstance(payload, dict):
                        lista_final = (
                            payload.get('content') or 
                            payload.get('dados') or 
                            payload.get('lista') or 
                            []
                        )
                        total_registros = (
                            payload.get('totalElements') or 
                            payload.get('total_registros') or 
                            len(lista_final)
                        )
                    
                    return {
                        "sucesso": True, 
                        "dados": lista_final, 
                        "paginacao": {
                            "pagina_atual": pagina, 
                            "tamanho": 50,
                            "total": total_registros
                        }
                    }
                    
                print(f"ERRO GOV: {response.status_code} - {response.text}")
                return {"sucesso": False, "msg": f"Erro Gov ({response.status_code}): {response.text}"}
            except Exception as e:
                return {"sucesso": False, "msg": str(e)}

    # --- OBTER DETALHES ---
    async def obter_reserva_detalhada(self, id_gov):
        endpoint = f"{self.base_url}/reservas/{id_gov}"
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(endpoint, headers=self._get_headers(), timeout=10.0)
                if response.status_code == 200:
                    return {"sucesso": True, "dados": response.json()}
                return {"sucesso": False, "msg": f"Erro Detalhes ({response.status_code}): {response.text}"}
            except Exception as e:
                return {"sucesso": False, "msg": str(e)}

    # ... (MANTENHA OS OUTROS MÉTODOS DE CRIAÇÃO/VÍNCULO IGUAIS - criar_reserva_gov, etc) ...
    async def criar_reserva_gov(self, dados: dict):
        endpoint = f"{self.base_url}/reservas"
        payload = {
            "numero_reserva": str(dados.get("codigo_reserva", "0000")).strip(),
            "data_entrada": str(dados.get("data_entrada"))[:10], 
            "data_saida": str(dados.get("data_saida"))[:10],
            "quantidade_hospede_adulto": int(dados.get("adultos", 1)),
            "quantidade_hospede_menor": int(dados.get("criancas", 0)),
            "origem_reserva_id": "MEIOHOSPEDAGEM"
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(endpoint, headers=self._get_headers(), json=payload, timeout=10.0)
                if response.status_code in [200, 201]:
                    id_gov = self._extrair_id(response.json())
                    if id_gov: return {"sucesso": True, "reserva_id_gov": id_gov}
                if response.status_code == 400 and "já existe" in response.text.lower():
                    return {"sucesso": False, "msg": "Reserva já cadastrada no Governo."}
                return {"sucesso": False, "msg": f"Erro FNRH: {response.text}"}
            except Exception as e:
                return {"sucesso": False, "msg": str(e)}

    async def realizar_checkin_gov(self, reserva_id_gov):
        endpoint = f"{self.base_url}/reservas/{reserva_id_gov}/checkin"
        agora = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(endpoint, headers=self._get_headers(), json={"data_hora": agora}, timeout=10.0)
                if res.status_code in [200, 201]: return {"sucesso": True}
                if res.status_code == 400 and "já realizado" in res.text.lower(): return {"sucesso": True}
                return {"sucesso": False, "msg": f"Falha Check-in: {res.text}"}
            except Exception as e:
                return {"sucesso": False, "msg": str(e)}

    async def realizar_checkout_gov(self, reserva_id_gov):
        endpoint = f"{self.base_url}/reservas/{reserva_id_gov}/checkout"
        agora = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(endpoint, headers=self._get_headers(), json={"data_hora": agora}, timeout=10.0)
                if res.status_code in [200, 201]: return {"sucesso": True}
                if res.status_code == 400 and "já realizado" in res.text.lower(): return {"sucesso": True}
                return {"sucesso": False, "msg": f"Falha Check-out: {res.text}"}
            except Exception as e:
                return {"sucesso": False, "msg": str(e)}

    async def cancelar_reserva_gov(self, reserva_id_gov):
        endpoint = f"{self.base_url}/reservas/{reserva_id_gov}/cancelar"
        payload = {"motivo_cancelamento": "Cancelamento via Sistema Pousada"} 
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(endpoint, headers=self._get_headers(), json=payload, timeout=10.0)
                if res.status_code in [200, 201]: return {"sucesso": True}
                if res.status_code == 400 and "já cancelada" in res.text.lower(): return {"sucesso": True}
                return {"sucesso": False, "msg": f"Falha Cancelamento: {res.text}"}
            except Exception as e:
                return {"sucesso": False, "msg": str(e)}

    async def vincular_hospede(self, reserva_id_gov, hospede_id_gov):
        endpoint = f"{self.base_url}/reservas/{reserva_id_gov}/vincular-hospede/{hospede_id_gov}"
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(endpoint, headers=self._get_headers(), json={}, timeout=10.0)
                if res.status_code in [200, 201, 204]: return {"sucesso": True}
                return {"sucesso": False, "msg": f"Falha Vínculo: {res.text}"}
            except Exception as e:
                return {"sucesso": False, "msg": str(e)}
                
    async def desvincular_hospede(self, reserva_id_gov, hospede_id_gov):
        endpoint = f"{self.base_url}/reservas/{reserva_id_gov}/vincular-hospede/{hospede_id_gov}"
        async with httpx.AsyncClient() as client:
            try:
                res = await client.delete(endpoint, headers=self._get_headers(), timeout=10.0)
                if res.status_code in [200, 204]: return {"sucesso": True}
                return {"sucesso": False, "msg": f"Falha ao desvincular: {res.text}"}
            except Exception as e:
                return {"sucesso": False, "msg": str(e)}

    async def buscar_hospede_gov(self, cpf: str):
        cpf_limpo = "".join(filter(str.isdigit, cpf))
        endpoint = f"{self.base_url}/hospedes/pre-checkins"
        hoje = datetime.now()
        dt_ini = (hoje - timedelta(days=60)).strftime("%Y-%m-%d")
        dt_fim = (hoje + timedelta(days=60)).strftime("%Y-%m-%d")
        params = {"numero_documento": cpf_limpo, "data_inicio": dt_ini, "data_fim": dt_fim}
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(endpoint, headers=self._get_headers(), params=params, timeout=10.0)
                if response.status_code == 200:
                    content = response.json()
                    lista = content.get('dados', []) if isinstance(content, dict) else content
                    if lista: return {"sucesso": True, "hospede": lista[0]}
                    return {"sucesso": False, "msg": "Pré-checkin não encontrado."}
                return {"sucesso": False, "msg": f"Erro Gov ({response.status_code}): {response.text}"}
            except Exception as e:
                return {"sucesso": False, "msg": str(e)}

fnrh_service = FnrhService()