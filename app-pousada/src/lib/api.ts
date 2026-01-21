// src/lib/api.ts

// Lógica dinâmica: Pega do .env se existir, senão usa fallback local
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
}

export type ReservaUpdatePayload = Partial<ReservaPayload>;

// --- FUNÇÕES AUXILIARES ---
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
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
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Falha no login');
    }
    return response.json();
  } catch (error) {
    console.error("Erro no login:", error);
    throw error;
  }
};

// --- QUARTOS ---

export const getQuartos = async () => {
  const response = await fetch(`${API_BASE_URL}/quartos`);
  if (!response.ok) throw new Error('Falha ao buscar quartos');
  return response.json();
};

export const getQuartoById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/quartos/${id}`);
  if (!response.ok) throw new Error('Falha ao buscar quarto');
  return response.json();
};

export const createQuarto = async (data: any) => {
  const token = getAuthToken();
  const isFormData = data instanceof FormData;

  const headers: HeadersInit = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}/quartos`, {
    method: 'POST',
    headers: headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Falha ao criar quarto');
  return response.json();
};

export const updateQuarto = async (id: string, data: any) => {
  const token = getAuthToken();
  const isFormData = data instanceof FormData;

  const headers: HeadersInit = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}/quartos/${id}`, {
    method: 'PUT',
    headers: headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Falha ao atualizar quarto');
  return response.json();
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
  if (!response.ok) throw new Error('Falha ao buscar reservas');
  return response.json();
};

export const getReservaById = async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!response.ok) throw new Error('Falha ao buscar reserva');
    return response.json();
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
  if (!response.ok) {
     const err = await response.json().catch(() => ({}));
     throw new Error(err.detail || 'Falha ao criar reserva');
  }
  return response.json();
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
  if (!response.ok) throw new Error('Falha ao atualizar reserva');
  return response.json();
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
  if (!response.ok) throw new Error('Falha ao buscar clientes');
  return response.json();
};

export const getClienteById = async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!response.ok) throw new Error('Falha ao buscar cliente');
    return response.json();
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
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Falha ao criar cliente');
  }
  return response.json();
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
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Falha ao atualizar cliente');
  }
  return response.json();
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

// --- FNRH (Integração Simplificada) ---
export const realizarCheckinFnrh = async (reservaId: string) => {
    const token = getAuthToken();
    
    // A rota não espera body, apenas o ID da reserva na URL
    const response = await fetch(`${API_BASE_URL}/fnrh/checkin/${reservaId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Erro ao processar Check-in FNRH');
    }
    return response.json();
};