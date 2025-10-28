// src/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- [NOVAS INTERFACES] ---

// Interface para os dados de um Cliente (para create/update)
// Ajuste os campos conforme o seu formulário!
export interface ClientePayload {
  nome: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  observacoes?: string;
}

// Interface para os dados de uma Reserva (para create/update)
export interface ReservaPayload {
  id_quarto: string;
  id_cliente: string;
  data_checkin: string | null;
  data_checkout: string | null;
  status: string;
  valor_total?: number | null;
  observacoes?: string;
}

// Interface para atualização parcial de Reserva
export type ReservaUpdatePayload = Partial<ReservaPayload>;

// --- FIM DAS NOVAS INTERFACES ---


// Função auxiliar para pegar o token de forma segura no client-side
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('accessToken');
};

// --- FUNÇÕES DE AUTENTICAÇÃO ---
export const login = async (username: string, password: string) => {
  const formBody = new URLSearchParams({ username, password });
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: formBody.toString(),
  });
  if (!response.ok) throw new Error('Falha no login');
  return response.json();
};

// --- FUNÇÕES DOS QUARTOS ---
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

export const createQuarto = async (formData: FormData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/quartos`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
   if (!response.ok) {
     const error = await response.json();
     throw new Error(error.detail || 'Falha ao criar quarto');
   }
  return response.json();
};

export const updateQuarto = async (id: string, formData: FormData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/quartos/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
   if (!response.ok) {
     const error = await response.json();
     throw new Error(error.detail || 'Falha ao atualizar quarto');
   }
  return response.json();
};

export const deleteQuarto = async (id: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/quartos/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (response.status !== 204) throw new Error('Falha ao deletar quarto');
  return true;
};

// --- FUNÇÕES DE RESERVA ---
export const getReservaById = async (id: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Falha ao obter os detalhes da reserva');
  return response.json();
};

// [CORRIGIDO] Trocado 'any' por 'ReservaPayload'
export const createReserva = async (reservaData: ReservaPayload) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reservas`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reservaData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Falha ao criar reserva');
  }
  return response.json();
};

// [CORRIGIDO] Trocado 'any' por 'ReservaUpdatePayload'
export const updateReserva = async (id: string, reservaData: ReservaUpdatePayload) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reservaData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Falha ao atualizar reserva');
  }
  return response.json();
};

export const deleteReserva = async (id: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (response.status !== 204) {
    throw new Error('Falha ao apagar reserva');
  }
  return true;
};

// --- FUNÇÕES DE CLIENTES ---

export const getClientes = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/clientes`, {
      headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Falha ao obter clientes');
  return response.json();
};

export const getClienteById = async (id: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Falha ao obter cliente');
  return response.json();
};

// [CORRIGIDO] Trocado 'any' por 'ClientePayload'
export const createCliente = async (clienteData: ClientePayload) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/clientes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clienteData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Falha ao criar cliente');
  }
  return response.json();
};

// [CORRIGIDO] Trocado 'any' por 'Partial<ClientePayload>'
export const updateCliente = async (id: string, clienteData: Partial<ClientePayload>) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
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
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (response.status !== 204) {
    throw new Error('Falha ao apagar cliente');
  }
  return true;
};
