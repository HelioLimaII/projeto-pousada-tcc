// Em: src/api.ts

import axios from 'axios';

// LOG TEMPORÁRIO PARA DEPURAÇÃO:
console.log("API Base URL que está sendo usada:", process.env.NEXT_PUBLIC_API_URL);

const apiClient = axios.create({
  baseURL: "http://localhost:8000",
});

// Adiciona um "interceptor" para incluir o token de autenticação em todas as chamadas
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;