const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- [NOVA INTERFACE] ---
// Define a estrutura dos dados ao criar/atualizar um cliente
// Por favor, ajuste os campos (ex: email, cpf) para
// bater exatamente com o que seu formulário envia.
export interface ClientePayload {
  nome: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  observacoes?: string;
}
// --- FIM DA NOVA INTERFACE ---


// Função auxiliar para pegar o token de forma segura no client-side
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('accessToken');
};

// --- FUNÇÕES DE AUTENTICAÇÃO (MANTIDAS) ---
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

// --- FUNÇÕES DOS QUARTOS (MANTIDAS) ---
export const getQuartos = async () => {
  // Adiciona o token para proteger a rota, se necessário no backend
  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}/quartos`, { headers });
  if (!response.ok) throw new Error('Falha ao buscar quartos');
  return response.json();
};

export const getQuartoById = async (id: string) => {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}/quartos/${id}`, { headers });
  if (!response.ok) throw new Error('Falha ao buscar quarto');
  return response.json();
};

export const createQuarto = async (formData: FormData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/quartos`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }, // Content-Type é definido automaticamente para FormData
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
    headers: { 'Authorization': `Bearer ${token}` }, // Content-Type é definido automaticamente para FormData
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

// --- FUNÇÕES DE RESERVA (ATUALIZADAS PARA ENVIAR id_cliente) ---

export const getReservaById = async (id: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Falha ao obter os detalhes da reserva');
  return response.json();
};

// Aceita um objeto com os dados da reserva, incluindo id_cliente
export const createReserva = async (reservaData: {
    id_quarto: string;
    id_cliente: string;
    data_checkin: string | null;
    data_checkout: string | null;
    status: string;
    valor_total?: number | null;
    observacoes?: string;
  }) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reservas`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reservaData), // Envia os dados como JSON
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Falha ao criar reserva');
  }
  return response.json();
};

// Aceita um objeto com os dados da reserva a atualizar
export const updateReserva = async (id: string, reservaData: {
    id_quarto?: string;
    id_cliente?: string;
    data_checkin?: string | null;
    data_checkout?: string | null;
    status?: string;
    valor_total?: number | null;
    observacoes?: string;
  }) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reservaData), // Envia os dados como JSON
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

// --- FUNÇÕES DE CLIENTES (MANTIDAS/CONFIRMADAS) ---

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
// 'Partial' significa que pode ser um objeto com *alguns* dos campos de ClientePayload
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
