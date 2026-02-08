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
        
        cpf_raw = os.getenv("FNRH_CPF_RESPONSAVEL", "") 
        self.cpf_solicitante = "".join(filter(str.isdigit, cpf_raw))
        
        if len(self.cpf_solicitante) != 11:
            logger.warning(f"⚠️  ATENÇÃO: CPF do Responsável parece inválido: '{self.cpf_solicitante}'")

    def _get_headers(self):
        """
        Headers apenas com autenticação.
        """
        credenciais = f"{self.user_id}:{self.api_key}"
        credenciais_b64 = base64.b64encode(credenciais.encode()).decode()
        return {
            "Authorization": f"Basic {credenciais_b64}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    def _get_params(self, params_extras=None):
        """
        Helper para injetar cpf_solicitante na URL para endpoints que exigem (POSTs, etc).
        """
        base_params = {"cpf_solicitante": self.cpf_solicitante}
        if params_extras:
            base_params.update(params_extras)
        return base_params

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

    def _gerar_data_iso_fnrh(self, data_iso_front=None):
        """
        Gera data no formato ISO Limpo (AAAA-MM-DDTHH:MM:SS) para evitar erros de parse.
        """
        try:
            if data_iso_front:
                data_limpa = data_iso_front.replace('Z', '').split('.')[0]
                datetime.strptime(data_limpa, "%Y-%m-%dT%H:%M:%S")
                return data_limpa
            return datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        except Exception as e:
            logger.error(f"Erro formatar data: {e}")
            return datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

    # --- LISTAGEM CORRIGIDA (Manual Pág. 22) ---
    async def listar_reservas_gov(self, pagina=1, data_inicio=None, data_fim=None, situacao=None, numero_reserva=None):
        endpoint = f"{self.base_url}/reservas"
        
        page_gov = int(pagina) - 1 if int(pagina) > 0 else 0
        hoje = datetime.now()

        dt_ini_obj = hoje - timedelta(days=3)
        dt_fim_obj = hoje + timedelta(days=12)

        if data_inicio:
            try: dt_ini_obj = datetime.strptime(data_inicio, "%Y-%m-%d")
            except ValueError: pass 
        if data_fim:
            try: dt_fim_obj = datetime.strptime(data_fim, "%Y-%m-%d")
            except ValueError: pass

        # [CORREÇÃO CRÍTICA]
        # 1. Removemos 'size' (Não suportado no GET /reservas, Pág 22)
        # 2. NÃO injetamos 'cpf_solicitante' aqui (Não listado no GET /reservas, Pág 22)
        params_oficiais = {
            "page_number": page_gov
        }

        if numero_reserva:
            params_oficiais["codigo_reserva"] = numero_reserva
        else:
            # Formato ISO AAAA-MM-DD
            val_ini = dt_ini_obj.strftime("%Y-%m-%d") if isinstance(dt_ini_obj, datetime) else data_inicio
            val_fim = dt_fim_obj.strftime("%Y-%m-%d") if isinstance(dt_fim_obj, datetime) else data_fim
            
            if val_ini: params_oficiais["data_entrada"] = val_ini
            if val_fim: params_oficiais["data_saida"] = val_fim
        
        if situacao: 
            params_oficiais["situacao"] = situacao

        logger.info(f"--- [FNRH REQUEST] Listando (Estrito Manual Pág 22): {params_oficiais} ---")

        async with httpx.AsyncClient() as client:
            try:
                # Usa params_oficiais DIRETAMENTE, sem mergear com cpf_solicitante
                response = await client.get(endpoint, headers=self._get_headers(), params=params_oficiais, timeout=30.0)
                
                if response.status_code == 200:
                    payload = response.json()
                    lista_final = []
                    total_registros = 0
                    
                    if isinstance(payload, list):
                        lista_final = payload
                        total_registros = len(payload)
                    elif isinstance(payload, dict):
                        lista_final = (payload.get('content') or payload.get('dados') or payload.get('lista') or [])
                        total_registros = (payload.get('totalElements') or payload.get('total_registros') or len(lista_final))
                    
                    return {
                        "sucesso": True, 
                        "dados": lista_final, 
                        "paginacao": {"pagina_atual": pagina, "tamanho": 20, "total": total_registros}
                    }
                
                logger.error(f"ERRO GOV: {response.status_code} - {response.text}")
                return {"sucesso": False, "msg": f"Erro Gov {response.status_code}", "dados": [], "paginacao": {"total": 0}}

            except Exception as e:
                logger.error(f"ERRO EXCEPTION: {str(e)}")
                return {"sucesso": False, "msg": str(e)}

    # --- MÉTODOS DE AÇÃO (Estes AINDA PRECISAM do CPF, conforme Manual Pág 13 e 21) ---

    async def obter_reserva_detalhada(self, id_gov):
        endpoint = f"{self.base_url}/reservas/{id_gov}"
        async with httpx.AsyncClient() as client:
            try:
                # GET Detalhe reserva: Manual Pág 25 não cita params, mas vamos testar sem CPF primeiro.
                # Se der erro, voltamos com CPF.
                response = await client.get(endpoint, headers=self._get_headers(), timeout=10.0)
                if response.status_code == 200: return {"sucesso": True, "dados": response.json()}
                return {"sucesso": False, "msg": f"Erro Detalhes ({response.status_code}): {response.text}"}
            except Exception as e: return {"sucesso": False, "msg": str(e)}

    async def criar_reserva_gov(self, dados: dict):
        # POST Reserva: Manual Pág 22 não cita CPF na URL, mas Pág 13 (Hospedagem/Registrar) cita.
        # Vamos manter CPF aqui pois é uma ação de registro.
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
                # Injeta CPF na URL
                response = await client.post(endpoint, headers=self._get_headers(), params=self._get_params(), json=payload, timeout=10.0)
                if response.status_code in [200, 201]:
                    id_gov = self._extrair_id(response.json())
                    if id_gov: return {"sucesso": True, "reserva_id_gov": id_gov}
                if response.status_code == 400 and "já existe" in response.text.lower():
                    return {"sucesso": False, "msg": "Reserva já cadastrada."}
                return {"sucesso": False, "msg": f"Erro FNRH: {response.text}"}
            except Exception as e: return {"sucesso": False, "msg": str(e)}

    async def realizar_checkin_gov(self, reserva_id_gov, data_hora_iso=None):
        # POST Checkin: Manual Pág 27 não cita CPF explicitamente, mas é transação. Mantemos CPF.
        endpoint = f"{self.base_url}/reservas/{reserva_id_gov}/checkin"
        data_correta = self._gerar_data_iso_fnrh(data_hora_iso)
        payload = {"data_hora": data_correta}
        
        logger.info(f"--> ENVIANDO CHECKIN: {payload}")

        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(endpoint, headers=self._get_headers(), params=self._get_params(), json=payload, timeout=10.0)
                if res.status_code in [200, 201]: return {"sucesso": True}
                if res.status_code == 400 and "já realizado" in res.text.lower(): return {"sucesso": True}
                return {"sucesso": False, "msg": f"Falha Check-in: {res.text}"}
            except Exception as e: return {"sucesso": False, "msg": str(e)}

    async def realizar_checkout_gov(self, reserva_id_gov, data_hora_iso=None):
        endpoint = f"{self.base_url}/reservas/{reserva_id_gov}/checkout"
        data_correta = self._gerar_data_iso_fnrh(data_hora_iso)
        payload = {"data_hora": data_correta}
        
        logger.info(f"--> ENVIANDO CHECKOUT: {payload}")

        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(endpoint, headers=self._get_headers(), params=self._get_params(), json=payload, timeout=10.0)
                if res.status_code in [200, 201]: return {"sucesso": True}
                if res.status_code == 400 and "já realizado" in res.text.lower(): return {"sucesso": True}
                return {"sucesso": False, "msg": f"Falha Check-out: {res.text}"}
            except Exception as e: return {"sucesso": False, "msg": str(e)}

    async def cancelar_reserva_gov(self, reserva_id_gov):
        endpoint = f"{self.base_url}/reservas/{reserva_id_gov}/cancelar"
        payload = {"motivo_cancelamento": "Cancelamento via Sistema"} 
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(endpoint, headers=self._get_headers(), params=self._get_params(), json=payload, timeout=10.0)
                if res.status_code in [200, 201]: return {"sucesso": True}
                if res.status_code == 400 and "já cancelada" in res.text.lower(): return {"sucesso": True}
                return {"sucesso": False, "msg": f"Falha Cancelamento: {res.text}"}
            except Exception as e: return {"sucesso": False, "msg": str(e)}

    async def vincular_hospede(self, reserva_id_gov, hospede_id_gov):
        endpoint = f"{self.base_url}/reservas/{reserva_id_gov}/vincular-hospede/{hospede_id_gov}"
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(endpoint, headers=self._get_headers(), params=self._get_params(), json={}, timeout=10.0)
                if res.status_code in [200, 201, 204]: return {"sucesso": True}
                return {"sucesso": False, "msg": f"Falha Vínculo: {res.text}"}
            except Exception as e: return {"sucesso": False, "msg": str(e)}
                
    async def desvincular_hospede(self, reserva_id_gov, hospede_id_gov):
        endpoint = f"{self.base_url}/reservas/{reserva_id_gov}/vincular-hospede/{hospede_id_gov}"
        async with httpx.AsyncClient() as client:
            try:
                res = await client.delete(endpoint, headers=self._get_headers(), params=self._get_params(), timeout=10.0)
                if res.status_code in [200, 204]: return {"sucesso": True}
                return {"sucesso": False, "msg": f"Falha ao desvincular: {res.text}"}
            except Exception as e: return {"sucesso": False, "msg": str(e)}

    async def buscar_hospede_gov(self, cpf: str):
        cpf_limpo = "".join(filter(str.isdigit, cpf))
        endpoint = f"{self.base_url}/hospedes/pre-checkins"
        hoje = datetime.now()
        
        # Para Pré-Checkins o manual (P.18) usa data_inicio e data_fim e formato ISO
        dt_ini = (hoje - timedelta(days=60)).strftime("%Y-%m-%d")
        dt_fim = (hoje + timedelta(days=60)).strftime("%Y-%m-%d")
        
        params = {"numero_documento": cpf_limpo, "data_inicio": dt_ini, "data_fim": dt_fim}
        # Injeta CPF
        params_finais = self._get_params(params)

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(endpoint, headers=self._get_headers(), params=params_finais, timeout=10.0)
                if response.status_code == 200:
                    content = response.json()
                    lista = content.get('dados', []) if isinstance(content, dict) else content
                    if isinstance(content, dict) and 'content' in content: lista = content['content']
                    if lista and len(lista) > 0: return {"sucesso": True, "hospede": lista[0]}
                    return {"sucesso": False, "msg": "Pré-checkin não encontrado."}
                return {"sucesso": False, "msg": f"Erro Gov ({response.status_code}): {response.text}"}
            except Exception as e: return {"sucesso": False, "msg": str(e)}

fnrh_service = FnrhService()