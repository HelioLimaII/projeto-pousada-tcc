// src/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// --- INTERFACES ---
export interface ClientePayload {
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cpf?: string | null;
  rg?: string | null;
  data_nascimento?: string | null;
  genero?: string | null;
  nacionalidade?: string | null;
  endereco?: string | null;
  endereco_logradouro?: string | null;
  endereco_numero?: string | null;
  endereco_complemento?: string | null;
  endereco_bairro?: string | null;
  endereco_cep?: string | null;
  endereco_cidade?: string | null;
  endereco_estado?: string | null;
  endereco_pais?: string | null;
  observacoes?: string | null;
  fnrh_id?: string | null;
}

export interface ReservaPayload {
  id_quarto: string;
  id_cliente: string;
  data_checkin: string | null;
  data_checkout: string | null;
  status: string;
  valor_total?: number | null;
  observacoes?: string | null;
  fnrh_reserva_id?: string | null;
  fnrh_sincronizado?: boolean | null;
}

export type ReservaUpdatePayload = Partial<ReservaPayload>;

// --- FUNÇÕES AUXILIARES ---
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

const handleResponse = async (res: Response, errorMsg: string) => {
    if (!res.ok) {
        let message = errorMsg;
        try {
            const err = await res.json();
            const rawMessage = err.detail || err.message || err.msg;
            if (rawMessage) {
                if (typeof rawMessage === 'object') {
                    message = JSON.stringify(rawMessage, null, 2);
                } else {
                    message = String(rawMessage);
                }
            } else {
                message = JSON.stringify(err, null, 2);
            }
        } catch (e) {
            const text = await res.text().catch(() => null);
            if (text) message = text;
        }
        throw new Error(message);
    }
    return res.json();
};

// --- AUTH ---
export const login = async (username: string, password: string) => {
  const formBody = new URLSearchParams({ username, password });
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: formBody.toString(),
    });
    return handleResponse(response, 'Falha no login');
  } catch (error) {
    console.error("Erro no login:", error);
    throw error;
  }
};

// --- QUARTOS ---
export const getQuartos = async () => {
  const response = await fetch(`${API_BASE_URL}/quartos`);
  return handleResponse(response, 'Falha ao buscar quartos');
};

export const getQuartoById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/quartos/${id}`);
  return handleResponse(response, 'Falha ao buscar quarto');
};

export const createQuarto = async (data: any) => {
  const token = getAuthToken();
  const isFormData = data instanceof FormData;
  const headers: HeadersInit = { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}/quartos`, {
    method: 'POST',
    headers: headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  return handleResponse(response, 'Falha ao criar quarto');
};

export const updateQuarto = async (id: string, data: any) => {
  const token = getAuthToken();
  const isFormData = data instanceof FormData;
  const headers: HeadersInit = { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}/quartos/${id}`, {
    method: 'PUT',
    headers: headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  return handleResponse(response, 'Falha ao atualizar quarto');
};

export const deleteQuarto = async (id: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/quartos/${id}`, {
    method: 'DELETE',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error('Falha ao deletar quarto');
  return true;
};

// --- RESERVAS ---
export const getReservas = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reservas`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  return handleResponse(response, 'Falha ao buscar reservas');
};

export const getReservaById = async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return handleResponse(response, 'Falha ao buscar reserva');
};

export const createReserva = async (data: ReservaPayload) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reservas`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response, 'Falha ao criar reserva');
};

export const updateReserva = async (id: string, data: ReservaUpdatePayload) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response, 'Falha ao atualizar reserva');
};

export const deleteReserva = async (id: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
    method: 'DELETE',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error('Falha ao deletar reserva');
  return true;
};

// --- CLIENTES ---
export const getClientes = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/clientes`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  return handleResponse(response, 'Falha ao buscar clientes');
};

export const getClienteById = async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return handleResponse(response, 'Falha ao buscar cliente');
};

export const createCliente = async (clienteData: ClientePayload) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/clientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(clienteData),
  });
  return handleResponse(response, 'Falha ao criar cliente');
};

export const updateCliente = async (id: string, clienteData: Partial<ClientePayload>) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(clienteData),
  });
  return handleResponse(response, 'Falha ao atualizar cliente');
};

export const deleteCliente = async (id: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error('Falha ao deletar cliente');
  return true;
};

// --- FNRH / INTEGRAÇÃO GOV.BR ---

export const listarReservasFnrh = async (pagina = 1, codigo = '') => {
    const token = getAuthToken();
    const query = codigo ? `&codigo=${codigo}` : '';
    const response = await fetch(`${API_BASE_URL}/fnrh/listar?pagina=${pagina}${query}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return response.json(); 
};

export const buscarPreCheckinGov = async (cpf: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/fnrh/consultar-cpf/${cpf}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return response.json();
};

export const criarReservaFnrh = async (payload: {
    codigo_reserva: string;
    data_entrada: string;
    data_saida: string;
    adultos: number;
    criancas: number;
    id_local: string;
}) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/fnrh/criar-reserva`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
    });
    return handleResponse(response, 'Erro ao criar reserva no FNRH');
};

export const vincularHospedeFnrh = async (reservaIdGov: string, hospedeIdGov: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/fnrh/vincular-hospede`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
            reserva_id_gov: reservaIdGov,
            hospede_id_gov: hospedeIdGov
        }),
    });
    return handleResponse(response, 'Erro ao vincular hóspede');
};

// [CORREÇÃO] Aceita dataHora e envia no BODY da requisição
export const realizarCheckinFnrh = async (reservaId: string, dataHora?: string) => {
    const token = getAuthToken();
    
    // Cria o payload JSON
    const payload = {
        data_hora: dataHora || new Date().toISOString()
    };

    // Adicionado o body na requisição fetch
    const response = await fetch(`${API_BASE_URL}/fnrh/checkin-manual/${reservaId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
    });
    return handleResponse(response, 'Erro ao processar Check-in FNRH');
};

// [CORREÇÃO] Aceita dataHora e envia no BODY da requisição
export const realizarCheckoutFnrh = async (reservaId: string, dataHora?: string) => {
    const token = getAuthToken();
    
    // Cria o payload JSON
    const payload = {
        data_hora: dataHora || new Date().toISOString()
    };

    // Adicionado o body na requisição fetch
    const response = await fetch(`${API_BASE_URL}/fnrh/checkout-manual/${reservaId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
    });
    return handleResponse(response, 'Erro ao processar Check-out FNRH');
};